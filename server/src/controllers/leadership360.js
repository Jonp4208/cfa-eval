import mongoose from 'mongoose';
import { getModel } from '../models/modelRegistry.js';
import { sendEmail } from '../utils/email.js';

// Helper function to create notifications
const createNotification = async (notificationData) => {
    try {
        const Notification = getModel('Notification');
        const notification = new Notification({
            userId: notificationData.recipient,
            type: notificationData.type,
            title: notificationData.title,
            message: notificationData.message,
            metadata: notificationData.metadata || {},
            store: notificationData.store,
            status: 'unread'
        });

        await notification.save();
        return notification;
    } catch (error) {
        console.error('Error creating notification:', error);
        return null;
    }
};

// Get all Leadership360 evaluations for the current user's store
export const getLeadership360Evaluations = async (req, res) => {
    try {
        const Leadership360 = getModel('Leadership360');
        const User = getModel('User');

        // Get user's store ID
        const storeId = req.user.store._id || req.user.store;

        // Find all 360 evaluations for this store
        // If user is not a manager or director, only show evaluations where they are the subject or an evaluator
        const isManagerOrDirector = ['Leader', 'Director'].includes(req.user.position);

        let query = { store: storeId, deleted: false };

        if (!isManagerOrDirector) {
            query.$or = [
                { subject: req.user._id },
                { 'evaluations.evaluator': req.user._id }
            ];
        }

        const evaluations = await Leadership360.find(query)
            .populate('subject', 'name position email')
            .populate('initiator', 'name position')
            .populate('template', 'name')
            .sort({ createdAt: -1 });

        res.json(evaluations);
    } catch (error) {
        console.error('Error getting 360 evaluations:', error);
        res.status(500).json({ message: 'Error retrieving 360 evaluations' });
    }
};

// Get a specific Leadership360 evaluation
export const getLeadership360Evaluation = async (req, res) => {
    try {
        const Leadership360 = getModel('Leadership360');

        const evaluation = await Leadership360.findOne({
            _id: req.params.evaluationId,
            store: req.user.store._id,
            deleted: false
        })
        .populate('subject', 'name position email')
        .populate('initiator', 'name position')
        .populate({
            path: 'template',
            populate: {
                path: 'sections.criteria.gradingScale',
                model: 'GradingScale'
            }
        })
        .populate('evaluations.evaluator', 'name position');

        if (!evaluation) {
            return res.status(404).json({ message: '360 evaluation not found' });
        }

        // Check if user has permission to view this evaluation
        const isSubject = evaluation.subject._id.toString() === req.user._id.toString();
        const isInitiator = evaluation.initiator._id.toString() === req.user._id.toString();
        const isEvaluator = evaluation.evaluations.some(e =>
            e.evaluator._id.toString() === req.user._id.toString()
        );
        const isManagerOrDirector = ['Leader', 'Director'].includes(req.user.position);

        if (!isSubject && !isInitiator && !isEvaluator && !isManagerOrDirector) {
            return res.status(403).json({ message: 'You do not have permission to view this evaluation' });
        }

        res.json(evaluation);
    } catch (error) {
        console.error('Error getting 360 evaluation:', error);
        res.status(500).json({ message: 'Error retrieving 360 evaluation' });
    }
};

// Create a new Leadership360 evaluation
export const createLeadership360Evaluation = async (req, res) => {
    try {
        console.log('Creating 360 evaluation with data:', req.body);
        const { subjectId, templateId, startDate, dueDate } = req.body;

        if (!subjectId || !templateId || !startDate || !dueDate) {
            console.error('Missing required fields:', { subjectId, templateId, startDate, dueDate });
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const Leadership360 = getModel('Leadership360');
        const Template = getModel('Template');
        const User = getModel('User');

        // Validate template exists - for 360 evaluations, we use a standardized template
        // that should be available to all stores
        console.log('Looking for template with ID:', templateId);
        const template = await Template.findOne({
            _id: templateId
        });

        if (!template) {
            console.error('Template not found with ID:', templateId);
            return res.status(404).json({ message: 'Leadership 360 Evaluation template not found' });
        }

        console.log('Found template:', template.name);

        // Check if it's the Leadership 360 template
        if (template.name !== 'Leadership 360 Evaluation') {
            console.error('Template is not a Leadership 360 Evaluation template:', template.name);
            return res.status(400).json({ message: 'Only Leadership 360 Evaluation templates can be used for 360 evaluations' });
        }

        // Validate subject exists, belongs to store, and is a leader
        console.log('Looking for subject with ID:', subjectId);
        const subject = await User.findOne({
            _id: subjectId,
            store: req.user.store._id
        });

        if (!subject) {
            console.error('Subject not found with ID:', subjectId);
            return res.status(404).json({ message: 'Subject not found' });
        }

        console.log('Found subject:', subject.name, 'with position:', subject.position);

        // Ensure the subject is a leader or director
        if (subject.position !== 'Leader' && subject.position !== 'Director') {
            console.error('Subject is not a leader or director:', subject.position);
            return res.status(400).json({
                message: '360 leadership evaluations can only be created for leaders or directors'
            });
        }

        // Create new 360 evaluation
        console.log('Creating new 360 evaluation');
        const newEvaluation = new Leadership360({
            subject: subjectId,
            initiator: req.user._id,
            store: req.user.store._id,
            template: templateId,
            startDate: new Date(startDate),
            dueDate: new Date(dueDate),
            status: 'pending_evaluators',
            evaluations: [],
            notificationStatus: {
                evaluatorsInvited: false,
                evaluationCompleted: false,
                resultReviewed: false
            }
        });

        console.log('Saving new evaluation');
        await newEvaluation.save();
        console.log('Evaluation saved successfully with ID:', newEvaluation._id);

        res.status(201).json({
            message: '360 evaluation created successfully',
            evaluation: newEvaluation
        });
    } catch (error) {
        console.error('Error creating 360 evaluation:', error);
        res.status(500).json({
            message: 'Error creating 360 evaluation',
            error: error.message || 'Unknown error'
        });
    }
};

// Add evaluators to a Leadership360 evaluation
export const addEvaluators = async (req, res) => {
    try {
        const { evaluatorIds, relationships } = req.body;

        if (!evaluatorIds || !relationships || evaluatorIds.length !== relationships.length) {
            return res.status(400).json({ message: 'Invalid evaluator data' });
        }

        const Leadership360 = getModel('Leadership360');
        const User = getModel('User');

        // Find the evaluation
        const evaluation = await Leadership360.findOne({
            _id: req.params.evaluationId,
            initiator: req.user._id,
            store: req.user.store._id,
            status: 'pending_evaluators'
        });

        if (!evaluation) {
            return res.status(404).json({ message: 'Evaluation not found or not in correct status' });
        }

        // Validate all evaluators exist and belong to store
        const evaluators = await User.find({
            _id: { $in: evaluatorIds },
            store: req.user.store._id
        });

        if (evaluators.length !== evaluatorIds.length) {
            return res.status(400).json({ message: 'One or more evaluators not found' });
        }

        // Add evaluators to the evaluation
        for (let i = 0; i < evaluatorIds.length; i++) {
            // Check if evaluator already exists
            const exists = evaluation.evaluations.some(e =>
                e.evaluator.toString() === evaluatorIds[i] &&
                e.relationship === relationships[i]
            );

            if (!exists) {
                evaluation.evaluations.push({
                    evaluator: evaluatorIds[i],
                    relationship: relationships[i],
                    responses: new Map(),
                    isComplete: false
                });
            }
        }

        // Update status if evaluators were added
        if (evaluation.evaluations.length > 0) {
            evaluation.status = 'in_progress';
        }

        await evaluation.save();

        // Send notifications to evaluators
        for (const evaluator of evaluators) {
            await createNotification({
                recipient: evaluator._id,
                type: 'evaluation_scheduled',
                title: '360 Leadership Evaluation Request',
                message: `You have been asked to provide feedback for ${evaluation.subject.name}'s 360 leadership evaluation.`,
                metadata: {
                    evaluationId: evaluation._id
                },
                store: req.user.store._id
            });

            // TODO: Send email notification
        }

        // Update notification status
        evaluation.notificationStatus.evaluatorsInvited = true;
        await evaluation.save();

        res.json({
            message: 'Evaluators added successfully',
            evaluation
        });
    } catch (error) {
        console.error('Error adding evaluators:', error);
        res.status(500).json({ message: 'Error adding evaluators' });
    }
};

// Submit evaluation response
export const submitEvaluationResponse = async (req, res) => {
    try {
        const { responses, overallComments } = req.body;

        if (!responses) {
            return res.status(400).json({ message: 'Responses are required' });
        }

        const Leadership360 = getModel('Leadership360');

        // Find the evaluation
        const evaluation = await Leadership360.findOne({
            _id: req.params.evaluationId,
            'evaluations.evaluator': req.user._id,
            store: req.user.store._id,
            status: 'in_progress'
        });

        if (!evaluation) {
            return res.status(404).json({ message: 'Evaluation not found or not in correct status' });
        }

        // Find the evaluator's response
        const evaluatorResponse = evaluation.evaluations.find(e =>
            e.evaluator.toString() === req.user._id.toString()
        );

        if (!evaluatorResponse) {
            return res.status(404).json({ message: 'Evaluator response not found' });
        }

        // Update the response
        evaluatorResponse.responses = new Map(Object.entries(responses));
        evaluatorResponse.overallComments = overallComments || '';
        evaluatorResponse.submittedAt = new Date();
        evaluatorResponse.isComplete = true;

        // Check if all evaluations are complete
        const allComplete = evaluation.evaluations.every(e => e.isComplete);
        if (allComplete) {
            evaluation.status = 'completed';
            evaluation.completedDate = new Date();

            // Notify the subject
            await createNotification({
                recipient: evaluation.subject,
                type: 'evaluation_completed',
                title: '360 Leadership Evaluation Completed',
                message: 'Your 360 leadership evaluation has been completed. You can now review the results.',
                metadata: {
                    evaluationId: evaluation._id
                },
                store: req.user.store._id
            });

            // Update notification status
            evaluation.notificationStatus.evaluationCompleted = true;
        }

        await evaluation.save();

        res.json({
            message: 'Evaluation response submitted successfully',
            evaluation
        });
    } catch (error) {
        console.error('Error submitting evaluation response:', error);
        res.status(500).json({ message: 'Error submitting evaluation response' });
    }
};

// Mark 360 evaluation as reviewed
export const markAsReviewed = async (req, res) => {
    try {
        const Leadership360 = getModel('Leadership360');

        // Find the evaluation
        const evaluation = await Leadership360.findOne({
            _id: req.params.evaluationId,
            subject: req.user._id,
            store: req.user.store._id,
            status: 'completed'
        });

        if (!evaluation) {
            return res.status(404).json({ message: 'Evaluation not found or not in correct status' });
        }

        // Update status
        evaluation.status = 'reviewed';
        evaluation.reviewedDate = new Date();
        evaluation.notificationStatus.resultReviewed = true;

        await evaluation.save();

        res.json({
            message: 'Evaluation marked as reviewed',
            evaluation
        });
    } catch (error) {
        console.error('Error marking evaluation as reviewed:', error);
        res.status(500).json({ message: 'Error marking evaluation as reviewed' });
    }
};

// Delete a Leadership360 evaluation
export const deleteLeadership360Evaluation = async (req, res) => {
    try {
        const Leadership360 = getModel('Leadership360');

        // Only initiator or director can delete
        const isDirector = req.user.position === 'Director';

        const query = {
            _id: req.params.evaluationId,
            store: req.user.store._id
        };

        if (!isDirector) {
            query.initiator = req.user._id;
        }

        const evaluation = await Leadership360.findOne(query);

        if (!evaluation) {
            return res.status(404).json({ message: 'Evaluation not found or you do not have permission to delete it' });
        }

        // Soft delete
        evaluation.deleted = true;
        await evaluation.save();

        res.json({ message: 'Evaluation deleted successfully' });
    } catch (error) {
        console.error('Error deleting 360 evaluation:', error);
        res.status(500).json({ message: 'Error deleting 360 evaluation' });
    }
};

// Helper function to generate development recommendations based on rating patterns
const generateDevelopmentRecommendations = (categoryRatings, overallRating) => {
    const recommendations = [];

    // Find areas scoring below 3.0 (needs development)
    const lowPerformanceAreas = Object.entries(categoryRatings)
        .filter(([_, data]) => data.average < 3.0)
        .sort((a, b) => a[1].average - b[1].average); // Sort by lowest first

    // Find areas scoring above 4.0 (strengths)
    const highPerformanceAreas = Object.entries(categoryRatings)
        .filter(([_, data]) => data.average >= 4.0)
        .sort((a, b) => b[1].average - a[1].average); // Sort by highest first

    // Generate recommendations for low performance areas
    lowPerformanceAreas.forEach(([category, data]) => {
        const recommendation = {
            area: category,
            priority: data.average < 2.5 ? 'high' : 'medium',
            type: 'development',
            rating: data.average,
            suggestion: getAreaSpecificRecommendation(category, 'development'),
            resources: getAreaSpecificResources(category, 'development')
        };
        recommendations.push(recommendation);
    });

    // Generate recommendations for leveraging strengths
    if (highPerformanceAreas.length > 0) {
        const topStrength = highPerformanceAreas[0];
        recommendations.push({
            area: topStrength[0],
            priority: 'low',
            type: 'leverage',
            rating: topStrength[1].average,
            suggestion: getAreaSpecificRecommendation(topStrength[0], 'leverage'),
            resources: getAreaSpecificResources(topStrength[0], 'leverage')
        });
    }

    // Overall leadership development recommendation
    if (overallRating < 3.0) {
        recommendations.unshift({
            area: 'Overall Leadership',
            priority: 'high',
            type: 'foundational',
            rating: overallRating,
            suggestion: 'Focus on foundational leadership skills development with structured mentoring and coaching support',
            resources: ['Leadership Fundamentals Course', 'Executive Coaching', 'Leadership Mentoring Program']
        });
    }

    return recommendations.slice(0, 5); // Return top 5 recommendations
};

const getAreaSpecificRecommendation = (area, type) => {
    const recommendations = {
        'Strategic Leadership': {
            development: 'Enhance strategic thinking through business case studies, strategic planning workshops, and cross-functional project leadership',
            leverage: 'Mentor others in strategic thinking and lead strategic initiatives for the organization'
        },
        'People Leadership': {
            development: 'Develop people management skills through coaching training, conflict resolution workshops, and team building exercises',
            leverage: 'Share your people leadership expertise by mentoring new managers and leading HR initiatives'
        },
        'Operational Excellence': {
            development: 'Improve operational efficiency through process improvement training, lean management principles, and operational metrics analysis',
            leverage: 'Lead operational improvement initiatives and share best practices across teams'
        },
        'Communication & Influence': {
            development: 'Strengthen communication through presentation skills training, active listening workshops, and stakeholder management courses',
            leverage: 'Become a communication champion and help develop others\' presentation and influence skills'
        },
        'Innovation & Change': {
            development: 'Build change management capabilities through change leadership training, innovation workshops, and agile methodology courses',
            leverage: 'Lead organizational change initiatives and champion innovation across the company'
        }
    };

    return recommendations[area]?.[type] || `Focus on developing ${area.toLowerCase()} through targeted training and practical application`;
};

const getAreaSpecificResources = (area, type) => {
    const resources = {
        'Strategic Leadership': {
            development: ['Strategic Thinking Workshop', 'Business Strategy Course', 'Executive Leadership Program'],
            leverage: ['Strategic Planning Facilitation', 'Mentoring Program', 'Cross-functional Leadership Role']
        },
        'People Leadership': {
            development: ['Management Training', 'Coaching Certification', 'Conflict Resolution Workshop'],
            leverage: ['Leadership Mentoring', 'HR Partnership Role', 'Team Development Facilitation']
        },
        'Operational Excellence': {
            development: ['Process Improvement Training', 'Lean Six Sigma', 'Operations Management Course'],
            leverage: ['Operational Excellence Champion', 'Process Improvement Lead', 'Best Practices Sharing']
        },
        'Communication & Influence': {
            development: ['Presentation Skills Training', 'Influence & Persuasion Workshop', 'Public Speaking Course'],
            leverage: ['Communication Training Facilitator', 'Presentation Coaching', 'Stakeholder Engagement Lead']
        },
        'Innovation & Change': {
            development: ['Change Management Certification', 'Innovation Workshop', 'Agile Leadership Training'],
            leverage: ['Change Champion Role', 'Innovation Committee Lead', 'Transformation Project Lead']
        }
    };

    return resources[area]?.[type] || ['Leadership Development Program', 'Professional Coaching', 'Skill-specific Training'];
};

// Get summary of 360 evaluation results
export const getEvaluationSummary = async (req, res) => {
    try {
        const Leadership360 = getModel('Leadership360');

        // Find the evaluation
        const evaluation = await Leadership360.findOne({
            _id: req.params.evaluationId,
            store: req.user.store._id,
            status: { $in: ['completed', 'reviewed'] }
        })
        .populate('subject', 'name position')
        .populate('template', 'name sections')
        .populate('evaluations.evaluator', 'name position');

        if (!evaluation) {
            return res.status(404).json({ message: 'Evaluation not found or not completed' });
        }

        // Check if user has permission to view summary
        const isSubject = evaluation.subject._id.toString() === req.user._id.toString();
        const isInitiator = evaluation.initiator.toString() === req.user._id.toString();
        const isManagerOrDirector = ['Leader', 'Director'].includes(req.user.position);

        if (!isSubject && !isInitiator && !isManagerOrDirector) {
            return res.status(403).json({ message: 'You do not have permission to view this summary' });
        }

        // Calculate summary statistics
        const summary = {
            overallRating: 0,
            categoryRatings: {},
            relationshipRatings: {
                manager: { count: 0, sum: 0, average: 0 },
                peer: { count: 0, sum: 0, average: 0 },
                direct_report: { count: 0, sum: 0, average: 0 },
                self: { count: 0, sum: 0, average: 0 }
            },
            strengths: [],
            improvements: [],
            comments: []
        };

        // Process each evaluation
        let totalRatingSum = 0;
        let totalRatingCount = 0;

        evaluation.evaluations.forEach(evalItem => {
            if (!evalItem.isComplete) return;

            // Add comments
            if (evalItem.overallComments) {
                summary.comments.push({
                    relationship: evalItem.relationship,
                    comment: evalItem.overallComments
                });
            }

            // Process responses
            let evaluatorRatingSum = 0;
            let evaluatorRatingCount = 0;

            // Convert Map to object for easier processing
            const responses = Object.fromEntries(evalItem.responses);

            Object.entries(responses).forEach(([questionId, response]) => {
                // Only process numeric ratings
                if (typeof response === 'number') {
                    // Add to relationship totals
                    summary.relationshipRatings[evalItem.relationship].sum += response;
                    summary.relationshipRatings[evalItem.relationship].count++;

                    // Add to overall totals
                    totalRatingSum += response;
                    totalRatingCount++;

                    // Add to evaluator totals
                    evaluatorRatingSum += response;
                    evaluatorRatingCount++;

                    // Add to category totals (assuming questionId format: sectionId_questionId)
                    const sectionId = questionId.split('_')[0];
                    if (!summary.categoryRatings[sectionId]) {
                        summary.categoryRatings[sectionId] = { sum: 0, count: 0, average: 0 };
                    }
                    summary.categoryRatings[sectionId].sum += response;
                    summary.categoryRatings[sectionId].count++;
                }
            });
        });

        // Calculate averages
        summary.overallRating = totalRatingCount > 0 ? (totalRatingSum / totalRatingCount).toFixed(2) : 0;

        // Calculate relationship averages
        Object.keys(summary.relationshipRatings).forEach(rel => {
            const { sum, count } = summary.relationshipRatings[rel];
            summary.relationshipRatings[rel].average = count > 0 ? (sum / count).toFixed(2) : 0;
        });

        // Calculate category averages
        Object.keys(summary.categoryRatings).forEach(cat => {
            const { sum, count } = summary.categoryRatings[cat];
            summary.categoryRatings[cat].average = count > 0 ? (sum / count).toFixed(2) : 0;
        });

        // Generate development recommendations based on rating patterns
        summary.developmentRecommendations = generateDevelopmentRecommendations(
            summary.categoryRatings,
            parseFloat(summary.overallRating)
        );

        res.json(summary);
    } catch (error) {
        console.error('Error getting evaluation summary:', error);
        res.status(500).json({ message: 'Error getting evaluation summary' });
    }
};

// Generate automatic development plan based on 360 feedback
export const generateDevelopmentPlan = async (req, res) => {
    try {
        const Leadership360 = getModel('Leadership360');

        // Find the evaluation
        const evaluation = await Leadership360.findOne({
            _id: req.params.evaluationId,
            store: req.user.store._id,
            status: { $in: ['completed', 'reviewed'] }
        })
        .populate('subject', 'name position')
        .populate('template', 'name sections')
        .populate('evaluations.evaluator', 'name position');

        if (!evaluation) {
            return res.status(404).json({ message: 'Evaluation not found or not completed' });
        }

        // Check if user has permission (subject or manager)
        const isSubject = evaluation.subject._id.toString() === req.user._id.toString();
        const isManagerOrDirector = ['Leader', 'Director'].includes(req.user.position);

        if (!isSubject && !isManagerOrDirector) {
            return res.status(403).json({ message: 'You do not have permission to generate development plan' });
        }

        // Calculate summary statistics (reuse logic from getEvaluationSummary)
        const summary = {
            overallRating: 0,
            categoryRatings: {},
            strengths: [],
            improvements: []
        };

        let totalRatingSum = 0;
        let totalRatingCount = 0;

        evaluation.evaluations.forEach(evalItem => {
            if (!evalItem.isComplete) return;

            const responses = evalItem.responses || new Map();

            // Extract text feedback
            if (responses.textFeedback) {
                const feedback = responses.textFeedback;
                if (feedback.strengths) {
                    summary.strengths.push({
                        relationship: evalItem.relationship,
                        text: feedback.strengths
                    });
                }
                if (feedback.improvements) {
                    summary.improvements.push({
                        relationship: evalItem.relationship,
                        text: feedback.improvements
                    });
                }
            }

            Object.entries(responses).forEach(([questionId, response]) => {
                if (typeof response === 'number') {
                    totalRatingSum += response;
                    totalRatingCount++;

                    const sectionId = questionId.split('_')[0];
                    if (!summary.categoryRatings[sectionId]) {
                        summary.categoryRatings[sectionId] = { sum: 0, count: 0, average: 0 };
                    }
                    summary.categoryRatings[sectionId].sum += response;
                    summary.categoryRatings[sectionId].count++;
                }
            });
        });

        // Calculate averages
        summary.overallRating = totalRatingCount > 0 ? (totalRatingSum / totalRatingCount) : 0;
        Object.keys(summary.categoryRatings).forEach(cat => {
            const { sum, count } = summary.categoryRatings[cat];
            summary.categoryRatings[cat].average = count > 0 ? (sum / count) : 0;
        });

        // Generate development plan
        const developmentPlan = generateAutomaticDevelopmentPlan(
            summary.categoryRatings,
            summary.overallRating,
            summary.strengths,
            summary.improvements,
            evaluation.subject.name
        );

        res.json(developmentPlan);
    } catch (error) {
        console.error('Error generating development plan:', error);
        res.status(500).json({ message: 'Error generating development plan' });
    }
};

// Helper function to generate automatic development plan
const generateAutomaticDevelopmentPlan = (categoryRatings, overallRating, strengths, improvements, subjectName) => {
    const plan = {
        subjectName,
        overallRating,
        generatedDate: new Date(),
        developmentAreas: [],
        smartGoals: [],
        actionPlan: {
            immediate: [], // 0-30 days
            shortTerm: [], // 1-3 months
            longTerm: [] // 3-12 months
        },
        resources: [],
        milestones: []
    };

    // Identify top 3 development areas (lowest scoring categories)
    // First try areas below 3.5, then fall back to lowest 3 areas regardless of score
    let developmentAreas = Object.entries(categoryRatings)
        .filter(([_, data]) => data.average < 3.5)
        .sort((a, b) => a[1].average - b[1].average)
        .slice(0, 3);

    // If no areas below 3.5, take the 3 lowest scoring areas
    if (developmentAreas.length === 0) {
        developmentAreas = Object.entries(categoryRatings)
            .sort((a, b) => a[1].average - b[1].average)
            .slice(0, 3);
    }

    // If still no areas (shouldn't happen), create default areas
    if (developmentAreas.length === 0) {
        developmentAreas = [
            ['Strategic Leadership', { average: 3.0, count: 1 }],
            ['People Leadership', { average: 3.2, count: 1 }],
            ['Communication & Influence', { average: 3.1, count: 1 }]
        ];
    }

    developmentAreas.forEach(([area, data], index) => {
        const priority = index === 0 ? 'high' : index === 1 ? 'medium' : 'low';

        plan.developmentAreas.push({
            area,
            currentRating: data.average,
            targetRating: Math.min(data.average + 1.0, 5.0),
            priority,
            keyFeedback: improvements
                .filter(imp => imp.text.toLowerCase().includes(area.toLowerCase().split(' ')[0]))
                .slice(0, 2)
                .map(imp => imp.text)
        });

        // Generate SMART goal for this area
        const smartGoal = generateSMARTGoal(area, data.average, improvements);
        plan.smartGoals.push(smartGoal);

        // Add area-specific action items
        const actions = getAreaSpecificActions(area, priority);
        plan.actionPlan.immediate.push(...actions.immediate);
        plan.actionPlan.shortTerm.push(...actions.shortTerm);
        plan.actionPlan.longTerm.push(...actions.longTerm);

        // Add resources
        plan.resources.push(...getAreaSpecificResources(area, 'development'));
    });

    // Ensure we have some resources even if no specific areas were found
    if (plan.resources.length === 0) {
        plan.resources.push(
            'Leadership Development Program',
            'Professional Coaching',
            'Skill-specific Training',
            'Mentoring Program',
            'Leadership Books & Resources'
        );
    }

    // Ensure we have SMART goals
    if (plan.smartGoals.length === 0) {
        plan.smartGoals.push({
            area: 'Overall Leadership',
            goal: `Improve overall leadership effectiveness from ${overallRating.toFixed(1)} to ${Math.min(overallRating + 1.0, 5.0).toFixed(1)} within 6 months`,
            specific: 'Focus on comprehensive leadership development',
            measurable: `Increase overall rating from ${overallRating.toFixed(1)} to ${Math.min(overallRating + 1.0, 5.0).toFixed(1)}`,
            achievable: 'Based on feedback patterns and available resources',
            relevant: 'Critical for leadership effectiveness in current role',
            timeBound: '6 months'
        });
    }

    // Ensure action plan sections have content
    if (plan.actionPlan.immediate.length === 0) {
        plan.actionPlan.immediate.push(
            'Complete leadership assessment',
            'Schedule feedback session with manager',
            'Identify development mentor'
        );
    }

    if (plan.actionPlan.shortTerm.length === 0) {
        plan.actionPlan.shortTerm.push(
            'Enroll in leadership training program',
            'Begin regular coaching sessions',
            'Implement new leadership practices'
        );
    }

    if (plan.actionPlan.longTerm.length === 0) {
        plan.actionPlan.longTerm.push(
            'Complete advanced leadership certification',
            'Mentor other emerging leaders',
            'Lead major organizational initiative'
        );
    }

    // Generate milestones
    plan.milestones = [
        {
            timeframe: '30 days',
            description: 'Complete initial assessment and begin first development activity',
            measurable: 'Start one training program or coaching session'
        },
        {
            timeframe: '90 days',
            description: 'Show measurable improvement in primary development area',
            measurable: 'Receive positive feedback from manager or peers on targeted behavior'
        },
        {
            timeframe: '6 months',
            description: 'Demonstrate consistent application of new skills',
            measurable: 'Lead a project or initiative showcasing improved competency'
        },
        {
            timeframe: '12 months',
            description: 'Achieve target rating improvement in next 360 evaluation',
            measurable: 'Increase overall rating by 0.5-1.0 points in follow-up assessment'
        }
    ];

    return plan;
};

const generateSMARTGoal = (area, currentRating, improvements) => {
    const targetRating = Math.min(currentRating + 1.0, 5.0);
    const timeframe = currentRating < 2.5 ? '6 months' : '4 months';

    const goalTemplates = {
        'Strategic Leadership': `Improve strategic thinking and decision-making capabilities from ${currentRating.toFixed(1)} to ${targetRating.toFixed(1)} within ${timeframe}`,
        'People Leadership': `Enhance team management and people development skills from ${currentRating.toFixed(1)} to ${targetRating.toFixed(1)} within ${timeframe}`,
        'Operational Excellence': `Strengthen operational efficiency and process management from ${currentRating.toFixed(1)} to ${targetRating.toFixed(1)} within ${timeframe}`,
        'Communication & Influence': `Develop communication and stakeholder influence abilities from ${currentRating.toFixed(1)} to ${targetRating.toFixed(1)} within ${timeframe}`,
        'Innovation & Change': `Build change leadership and innovation capabilities from ${currentRating.toFixed(1)} to ${targetRating.toFixed(1)} within ${timeframe}`
    };

    return {
        area,
        goal: goalTemplates[area] || `Improve ${area.toLowerCase()} from ${currentRating.toFixed(1)} to ${targetRating.toFixed(1)} within ${timeframe}`,
        specific: `Focus on ${area.toLowerCase()} development`,
        measurable: `Increase rating from ${currentRating.toFixed(1)} to ${targetRating.toFixed(1)}`,
        achievable: 'Based on feedback patterns and available resources',
        relevant: `Critical for leadership effectiveness in current role`,
        timeBound: timeframe
    };
};

const getAreaSpecificActions = (area, priority) => {
    const actions = {
        'Strategic Leadership': {
            immediate: ['Schedule strategic thinking assessment', 'Identify strategic mentor'],
            shortTerm: ['Enroll in strategic planning workshop', 'Lead cross-functional project'],
            longTerm: ['Complete executive leadership program', 'Develop organizational strategy']
        },
        'People Leadership': {
            immediate: ['Schedule 1:1s with all team members', 'Complete leadership style assessment'],
            shortTerm: ['Attend coaching skills training', 'Implement team development plan'],
            longTerm: ['Become certified coach', 'Mentor other leaders']
        },
        'Operational Excellence': {
            immediate: ['Audit current processes', 'Identify efficiency opportunities'],
            shortTerm: ['Implement process improvements', 'Learn lean methodology'],
            longTerm: ['Lead operational transformation', 'Share best practices organization-wide']
        },
        'Communication & Influence': {
            immediate: ['Record and review presentation', 'Seek communication feedback'],
            shortTerm: ['Join public speaking group', 'Practice stakeholder presentations'],
            longTerm: ['Become internal communication trainer', 'Lead major stakeholder initiatives']
        },
        'Innovation & Change': {
            immediate: ['Assess change readiness', 'Identify innovation opportunities'],
            shortTerm: ['Lead small change initiative', 'Attend innovation workshop'],
            longTerm: ['Champion major transformation', 'Develop innovation framework']
        }
    };

    return actions[area] || {
        immediate: [`Begin ${area.toLowerCase()} assessment`],
        shortTerm: [`Develop ${area.toLowerCase()} skills`],
        longTerm: [`Master ${area.toLowerCase()} competency`]
    };
};
