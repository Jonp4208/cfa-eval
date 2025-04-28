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

        res.json(summary);
    } catch (error) {
        console.error('Error getting evaluation summary:', error);
        res.status(500).json({ message: 'Error getting evaluation summary' });
    }
};
