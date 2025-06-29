import { User, Evaluation, Template, Notification, GradingScale } from '../models/index.js';
import { sendEmail } from '../utils/email.js';

// Create notification for the employee
const createNotificationIfNeeded = async (evaluation, type) => {
  let shouldCreate = false;
  let userId, title, message;

  switch (type) {
    case 'scheduled':
      if (!evaluation.notificationStatus.employee.scheduled) {
        shouldCreate = true;
        userId = evaluation.employee._id;
        title = 'New Evaluation Scheduled';
        message = `${evaluation.employee.name}'s evaluation has been scheduled for ${new Date(evaluation.scheduledDate).toLocaleDateString()}`;
      }
      break;
    case 'completed':
      if (!evaluation.notificationStatus.employee.completed) {
        shouldCreate = true;
        userId = evaluation.employee._id;
        title = 'Evaluation Completed';
        message = `${evaluation.employee.name}'s evaluation has been completed by ${evaluation.evaluator.name}`;
      }
      break;
    case 'self_evaluation_completed':
      if (!evaluation.notificationStatus.evaluator.selfEvaluationCompleted) {
        shouldCreate = true;
        userId = evaluation.evaluator._id;
        title = 'Self-Evaluation Completed';
        message = `${evaluation.employee.name} has completed their self-evaluation`;
      }
      break;
  }

  if (shouldCreate) {
    const notification = new Notification({
      userId,
      storeId: evaluation.store._id,
      type: 'EVALUATION',
      status: 'UNREAD',
      title,
      message,
      metadata: {
        evaluationId: evaluation._id,
        evaluationType: type,
        scheduledDate: evaluation.scheduledDate
      },
      employee: {
        name: evaluation.employee.name,
        position: evaluation.employee.position || 'Employee',
        department: evaluation.employee.department || 'Uncategorized'
      }
    });

    await notification.save();
    return notification;
  }

  return null;
};

// Create new evaluation
export const createEvaluation = async (req, res) => {
    try {
        const { employeeIds, templateId, scheduledDate, overallComments, developmentPlan, sectionResults, updateNextEvaluationDate } = req.body;

        if (!employeeIds || !templateId || !scheduledDate) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        // Validate template exists and belongs to store
        const template = await Template.findOne({
            _id: templateId,
            store: req.user.store._id,
            isActive: true
        });

        if (!template) {
            return res.status(404).json({ message: 'Template not found or inactive' });
        }

        // Get all employees with their managers and scheduling preferences
        const employees = await User.find({
            _id: { $in: employeeIds },
            store: req.user.store._id
        }).populate('manager', '_id').select('+schedulingPreferences');

        if (employees.length === 0) {
            return res.status(404).json({ message: 'No employees found' });
        }

        if (employees.length !== employeeIds.length) {
            return res.status(400).json({ message: 'One or more employees not found in your store' });
        }

        // Check if user has permission to evaluate these employees
        const isDirector = req.user.position === 'Director';
        if (!isDirector) {
            // For non-directors, check if they are the manager of each employee
            const unauthorizedEmployees = employees.filter(employee =>
                employee.manager?._id.toString() !== req.user._id.toString()
            );

            if (unauthorizedEmployees.length > 0) {
                return res.status(403).json({
                    message: 'You can only create evaluations for your direct reports',
                    unauthorizedEmployees: unauthorizedEmployees.map(e => e.name)
                });
            }
        }

        // Create evaluations and notifications for each employee
        const createdEvaluations = [];
        for (const employee of employees) {
            const evaluation = new Evaluation({
                employee: employee._id,
                evaluator: req.user._id,
                template: templateId,
                store: req.user.store._id,
                scheduledDate,
                overallComments,
                developmentPlan,
                sectionResults,
                status: 'pending_self_evaluation',
                notificationStatus: {
                    employee: {
                        scheduled: false,
                        completed: false,
                        acknowledged: false
                    },
                    evaluator: {
                        selfEvaluationCompleted: false,
                        reviewSessionScheduled: false
                    }
                }
            });

            await evaluation.save();

            // Create initial notification
            const notification = new Notification({
                user: employee._id,
                store: req.user.store._id,
                type: 'evaluation',
                priority: 'high',
                title: 'New Evaluation Scheduled',
                message: `${employee.name}'s evaluation needs to be completed by ${new Date(scheduledDate).toLocaleDateString()}`,
                evaluationId: evaluation._id,
                employee: {
                    name: employee.name,
                    position: employee.position || 'Employee',
                    department: employee.department || 'Uncategorized'
                }
            });

            await notification.save();

            // Update notification status
            evaluation.notificationStatus.employee.scheduled = true;
            await evaluation.save();

            createdEvaluations.push(evaluation);

            // Update nextEvaluationDate if requested and auto-scheduling is enabled
            if (updateNextEvaluationDate === true && employee.schedulingPreferences?.autoSchedule) {
                try {
                    // Calculate new next evaluation date based on frequency
                    const today = new Date();
                    let newNextDate = new Date(today);

                    // Add frequency days to today
                    if (employee.schedulingPreferences.frequency) {
                        newNextDate.setTime(newNextDate.getTime() +
                            (employee.schedulingPreferences.frequency * 24 * 60 * 60 * 1000));
                    } else {
                        // Default to 90 days if no frequency is set
                        newNextDate.setDate(newNextDate.getDate() + 90);
                    }

                    // Update the user's nextEvaluationDate
                    await User.findByIdAndUpdate(employee._id, {
                        $set: {
                            'schedulingPreferences.nextEvaluationDate': newNextDate,
                            'schedulingPreferences.lastCalculatedAt': today
                        }
                    });

                    console.log(`[Scheduling] ✓ Updated nextEvaluationDate for ${employee.name} to ${newNextDate.toISOString()}`);
                } catch (updateError) {
                    console.error(`[Scheduling] ✕ Failed to update nextEvaluationDate for ${employee.name}:`, updateError.message);
                }
            }

            // Send email to employee
            if (employee.email) {
                try {
                    await sendEmail({
                        to: employee.email,
                        subject: 'New Evaluation Scheduled - LD Growth',
                        html: `
                            <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">
                                <div style="background-color: #E4002B; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
                                    <h1 style="color: white; margin: 0;">New Evaluation Scheduled</h1>
                                </div>

                                <div style="background-color: #f8f8f8; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
                                    <h2 style="color: #333; margin-top: 0;">Evaluation Details</h2>
                                    <p><strong>Employee Due Date:</strong> ${new Date(scheduledDate).toLocaleDateString()}</p>
                                    <p><strong>Evaluator:</strong> ${req.user.name}</p>
                                </div>

                                <div style="margin-bottom: 30px;">
                                    <p>Please log in to LD Growth to complete your self-evaluation before the deadline date.</p>
                                    <p>Your input is valuable for your professional development.</p>
                                </div>

                                <p style="margin-top: 30px;">
                                    Best regards,<br>LD Growth Team
                                </p>
                            </div>
                        `
                    });
                    console.log(`[Email] ✓ Sent evaluation notification to ${employee.email}`);
                } catch (emailError) {
                    console.error(`[Email] ✕ Failed to send evaluation notification to ${employee.email}:`, emailError.message);
                }
            }
        }

        console.log(`[Evaluation] Created ${createdEvaluations.length} evaluation(s)`);

        res.status(201).json({
            message: 'Evaluations created successfully',
            evaluations: createdEvaluations
        });

    } catch (error) {
        console.error('[Evaluation] Error creating evaluation:', error.message);
        res.status(500).json({ message: 'Error creating evaluation' });
    }
};

// Get all evaluations for store
export const getEvaluations = async (req, res) => {
    try {
        const isDirector = req.user.position === 'Director';
        const { employeeId, limit } = req.query;

        // Base query - always filter by store
        let query = { store: req.user.store._id };

        // If employeeId is provided, filter by employee
        if (employeeId) {
            query.employee = employeeId;
        }
        // If not a director and no employeeId specified, only show evaluations where user is employee or evaluator
        else if (!isDirector) {
            query.$or = [
                { employee: req.user._id },
                { evaluator: req.user._id }
            ];
        }

        // Create the query
        let evaluationsQuery = Evaluation.find(query)
            .populate({
                path: 'employee',
                select: 'name position manager',
                populate: {
                    path: 'manager',
                    select: 'name _id'
                }
            })
            .populate('evaluator', 'name position')
            .populate('template')
            .sort('-createdAt');

        // Apply limit if specified
        if (limit) {
            evaluationsQuery = evaluationsQuery.limit(parseInt(limit));
        }

        // Execute the query
        let evaluations = await evaluationsQuery;

        // Log the evaluation dates for debugging
        if (employeeId) {
            console.log(`Evaluations for employee ${employeeId}:`,
                evaluations.map(evaluation => ({
                    id: evaluation._id.toString(),
                    status: evaluation.status,
                    scheduledDate: evaluation.scheduledDate,
                    completedDate: evaluation.completedDate,
                    createdAt: evaluation.createdAt
                }))
            );
        }

        res.json({ evaluations });

    } catch (error) {
        console.error('Error getting evaluations:', error);
        res.status(500).json({ message: 'Error getting evaluations' });
    }
};

// Get specific evaluation
export const getEvaluation = async (req, res) => {
    try {
        const evaluationId = req.params.evaluationId;
        const isDirector = req.user.position === 'Director';

        if (!evaluationId) {
            console.error('Missing evaluation ID in request params:', req.params);
            return res.status(400).json({ message: 'Evaluation ID is required' });
        }

        console.log('Fetching evaluation:', {
            evaluationId,
            userId: req.user._id,
            userStore: req.user.store._id,
            isDirector
        });

        // Build query based on user role
        let query = {
            _id: evaluationId,
            store: req.user.store._id
        };

        // If not a director, only show evaluations where user is employee or evaluator
        if (!isDirector) {
            query.$or = [
                { employee: req.user._id },
                { evaluator: req.user._id }
            ];
        }

        const evaluation = await Evaluation.findOne(query)
        .populate({
            path: 'template',
            populate: {
                path: 'sections.criteria.gradingScale',
                model: 'GradingScale',
                select: 'name description grades isDefault'
            }
        })
        .populate('employee', 'name email position')
        .populate('evaluator', 'name email position');

        console.log('Evaluation query result:', {
            found: !!evaluation,
            evaluationId: evaluation?._id,
            employeeId: evaluation?.employee?._id,
            evaluatorId: evaluation?.evaluator?._id,
            storeId: evaluation?.store,
            templateId: evaluation?.template?._id,
            query
        });

        if (!evaluation) {
            console.error('Evaluation not found:', {
                evaluationId,
                userId: req.user._id,
                userStore: req.user.store._id,
                query
            });
            return res.status(404).json({ message: 'Evaluation not found' });
        }

        // Update legacy 'pending' status
        if (evaluation.status === 'pending') {
            evaluation.status = 'pending_self_evaluation';
            await evaluation.save();
        }

        // Get default grading scale for any missing scales
        const defaultScale = await GradingScale.findOne({
            store: req.user.store._id,
            isDefault: true,
            isActive: true
        });

        // Transform template data
        console.log('Raw evaluation:', JSON.stringify({
            id: evaluation._id,
            template: {
                id: evaluation.template._id,
                sections: evaluation.template.sections.map(s => ({
                    id: s._id,
                    criteria: s.criteria.map(c => ({
                        id: c._id,
                        name: c.name,
                        gradingScale: c.gradingScale || defaultScale
                    }))
                }))
            }
        }, null, 2));

        const transformedEvaluation = {
            ...evaluation.toObject(),
            template: {
                ...evaluation.template,
                sections: evaluation.template.sections.map(section => {
                    console.log('Processing section:', {
                        title: section.title,
                        criteriaCount: section.criteria.length,
                        criteria: section.criteria.map(c => ({
                            name: c.name,
                            hasGradingScale: !!(c.gradingScale || defaultScale),
                            gradingScaleId: (c.gradingScale || defaultScale)?._id
                        }))
                    });
                    return {
                        title: section.title,
                        description: section.description,
                        order: section.order,
                        questions: section.criteria.map(criterion => {
                            const scale = criterion.gradingScale || defaultScale;
                            console.log('Processing criterion:', {
                                name: criterion.name,
                                hasGradingScale: !!scale,
                                gradingScale: scale
                            });
                            return {
                                id: criterion._id.toString(),
                                text: criterion.name,
                                description: criterion.description,
                                type: scale ? 'rating' : 'text',
                                required: criterion.required,
                                gradingScale: scale ? {
                                    id: scale._id,
                                    name: scale.name,
                                    description: scale.description,
                                    grades: scale.grades.map(grade => ({
                                        ...grade,
                                        description: grade.description || getDefaultGradeDescription(grade.value),
                                        label: grade.label || getDefaultGradeLabel(grade.value)
                                    })),
                                    isDefault: scale.isDefault
                                } : null
                            };
                        })
                    };
                })
            },
            selfEvaluation: evaluation.selfEvaluation && evaluation.selfEvaluation.size > 0
                ? Object.fromEntries(evaluation.selfEvaluation)
                : {},
            managerEvaluation: evaluation.managerEvaluation && evaluation.managerEvaluation.size > 0
                ? Object.fromEntries(evaluation.managerEvaluation)
                : {}
        };

        // Helper functions for default grade descriptions
        function getDefaultGradeDescription(value) {
            switch (value) {
                case 1:
                    return 'Low Hands / Low Heart';
                case 2:
                    return 'High Hands / Low Heart';
                case 3:
                    return 'Low Hands / High Heart';
                case 4:
                    return 'High Hands / High Heart';
                default:
                    return '';
            }
        }

        function getDefaultGradeLabel(value) {
            switch (value) {
                case 1:
                    return 'Improvement Needed';
                case 2:
                    return 'Performer';
                case 3:
                    return 'Valued';
                case 4:
                    return 'Star';
                default:
                    return '';
            }
        }

        console.log('Transformed evaluation:', JSON.stringify(transformedEvaluation.template.sections, null, 2));

        res.json({ evaluation: transformedEvaluation });
    } catch (error) {
        console.error('Error getting evaluation:', {
            error: error.message,
            stack: error.stack,
            evaluationId: req.params.evaluationId,
            userId: req.user._id,
            userStore: req.user.store._id,
            userPosition: req.user.position
        });
        res.status(500).json({ message: 'Error getting evaluation' });
    }
};

// Update evaluation
export const updateEvaluation = async (req, res) => {
    try {
        const {
            overallComments,
            developmentPlan,
            sectionResults,
            scheduledDate
        } = req.body;

        const evaluation = await Evaluation.findOne({
            _id: req.params.evaluationId,
            store: req.user.storeId,
            status: 'draft'
        });

        if (!evaluation) {
            return res.status(404).json({ message: 'Draft evaluation not found' });
        }

        // Update fields
        evaluation.overallComments = overallComments;
        evaluation.developmentPlan = developmentPlan;
        evaluation.sectionResults = sectionResults;
        evaluation.scheduledDate = scheduledDate;

        await evaluation.save();

        res.json({ evaluation });

    } catch (error) {
        console.error('Update evaluation error:', error);
        res.status(500).json({ message: 'Error updating evaluation' });
    }
};

// Delete evaluation
export const deleteEvaluation = async (req, res) => {
    try {
        // Log the deletion attempt with user information
        console.log('Evaluation deletion attempt:', {
            evaluationId: req.params.evaluationId,
            userId: req.user._id,
            userPosition: req.user.position,
            action: 'delete_evaluation'
        });

        // This endpoint is protected by isDirector middleware
        const evaluation = await Evaluation.findOneAndDelete({
            _id: req.params.evaluationId,
            store: req.user.store._id
        });

        if (!evaluation) {
            return res.status(404).json({ message: 'Evaluation not found' });
        }

        console.log('Evaluation deleted successfully:', {
            evaluationId: evaluation._id,
            deletedBy: req.user._id,
            position: 'Director' // Only directors can reach this code path
        });

        res.json({ message: 'Evaluation deleted successfully' });

    } catch (error) {
        console.error('Delete evaluation error:', error);
        res.status(500).json({ message: 'Error deleting evaluation' });
    }
};

// Get employee's evaluations
export const getEmployeeEvaluations = async (req, res) => {
    try {
        // Check if user has access to employee's evaluations
        if (
            req.user.role === 'evaluator' &&
            req.params.employeeId !== req.user.userId
        ) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const evaluations = await Evaluation.find({
            employee: req.params.employeeId,
            store: req.user.storeId
        })
        .populate('evaluator', 'name email')
        .populate('template', 'name')
        .sort('-createdAt');

        res.json({ evaluations });

    } catch (error) {
        console.error('Get employee evaluations error:', error);
        res.status(500).json({ message: 'Error getting employee evaluations' });
    }
};

// Submit evaluation
export const submitEvaluation = async (req, res) => {
    try {
        const evaluation = await Evaluation.findOne({
            _id: req.params.evaluationId,
            store: req.user.storeId,
            status: 'draft'
        });

        if (!evaluation) {
            return res.status(404).json({ message: 'Draft evaluation not found' });
        }

        evaluation.status = 'submitted';
        evaluation.submittedAt = new Date();
        evaluation.completedDate = new Date();

        await evaluation.save();

        // Here you could add notification logic for the employee

        res.json({ evaluation });

    } catch (error) {
        console.error('Submit evaluation error:', error);
        res.status(500).json({ message: 'Error submitting evaluation' });
    }
};

// Submit self-evaluation
export const submitSelfEvaluation = async (req, res) => {
    try {
        const evaluation = await Evaluation.findOne({
            _id: req.params.evaluationId,
            employee: req.user._id,
            store: req.user.store._id
        })
        .populate('employee', 'name email position')
        .populate('evaluator', 'name email position')
        .populate('store', 'storeEmail');

        if (!evaluation) {
            return res.status(404).json({ message: 'Evaluation not found' });
        }

        // Update evaluation
        evaluation.selfEvaluation = new Map(Object.entries(req.body.evaluation));
        evaluation.status = 'pending_manager_review';
        await evaluation.save();

        // Create notification for evaluator
        await createNotificationIfNeeded(evaluation, 'self_evaluation_completed');

        // Send email notifications
        if (evaluation.evaluator.email) {
            try {
                await sendEmail({
                    to: evaluation.evaluator.email,
                    subject: `Self-Evaluation Completed - ${evaluation.employee.name}`,
                    html: `
                        <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">
                            <div style="background-color: #E4002B; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
                                <h1 style="color: white; margin: 0;">Self-Evaluation Completed</h1>
                            </div>

                            <div style="background-color: #f8f8f8; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
                                <h2 style="color: #333; margin-top: 0;">Employee Details</h2>
                                <p><strong>Employee:</strong> ${evaluation.employee.name}</p>
                                <p><strong>Position:</strong> ${evaluation.employee.position}</p>
                                <p><strong>Completion Date:</strong> ${new Date().toLocaleDateString()}</p>
                            </div>

                            <div style="margin-bottom: 30px;">
                                <p>The employee has completed their self-evaluation. Please log in to LD Growth to schedule the review session.</p>
                            </div>

                            <p style="margin-top: 30px;">
                                Best regards,<br>LD Growth Team
                            </p>
                        </div>
                    `
                });
                console.log('Successfully sent email to evaluator');
            } catch (emailError) {
                console.error('Failed to send evaluator email:', emailError);
            }
        }

        res.json({
            message: 'Self evaluation submitted successfully',
            evaluation
        });
    } catch (error) {
        console.error('Submit self evaluation error:', error);
        res.status(500).json({ message: 'Error submitting self evaluation' });
    }
};

// Schedule review session
export const scheduleReviewSession = async (req, res) => {
    try {
        const { reviewSessionDate } = req.body;

        const evaluation = await Evaluation.findOne({
            _id: req.params.evaluationId,
            evaluator: req.user._id,
            store: req.user.store._id,
            status: 'pending_manager_review'
        })
        .populate('employee', 'name email position')
        .populate('evaluator', 'name email')
        .populate('store', 'name storeEmail');

        if (!evaluation) {
            return res.status(404).json({ message: 'Evaluation not found or not ready for review' });
        }

        evaluation.reviewSessionDate = reviewSessionDate;
        evaluation.status = 'in_review_session';
        await evaluation.save();

        // Create notification for the employee
        await Notification.create({
            user: evaluation.employee._id,
            store: req.user.store._id,
            type: 'evaluation',
            title: 'Review Session Scheduled',
            message: `${evaluation.employee.name}'s evaluation review session has been scheduled for ${new Date(reviewSessionDate).toLocaleDateString()}.`,
            relatedId: evaluation._id,
            relatedModel: 'Evaluation',
            employee: {
                name: evaluation.employee.name,
                position: evaluation.employee.position || 'Employee',
                department: evaluation.employee.department || 'Uncategorized'
            }
        });

        // Send email to employee
        if (evaluation.employee.email) {
            try {
                const formattedDate = new Date(reviewSessionDate).toLocaleString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: 'numeric',
                    hour12: true
                });

                await sendEmail({
                    to: evaluation.employee.email,
                    subject: 'Your Evaluation Review Session Has Been Scheduled',
                    html: `
                        <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">
                            <div style="background-color: #E4002B; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
                                <h1 style="color: white; margin: 0;">Evaluation Review Session Scheduled</h1>
                            </div>

                            <div style="background-color: #f8f8f8; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
                                <h2 style="color: #333; margin-top: 0;">Session Details</h2>
                                <p><strong>Date and Time:</strong> ${formattedDate}</p>
                                <p><strong>Employee:</strong> ${evaluation.employee.name}</p>
                                <p><strong>Position:</strong> ${evaluation.employee.position || 'Team Member'}</p>
                                <p><strong>Evaluator:</strong> ${evaluation.evaluator.name}</p>
                            </div>

                            <div style="margin-bottom: 30px;">
                                <p>Your evaluation review session has been scheduled. Please ensure you are available at the specified time.</p>
                                <p>During this session, you will review your self-evaluation with your manager and discuss your performance.</p>
                            </div>

                            <p style="margin-top: 30px;">
                                Best regards,<br>LD Growth Team
                            </p>
                        </div>
                    `
                });
                console.log('Successfully sent review session email to employee:', evaluation.employee.email);
            } catch (emailError) {
                console.error('Failed to send review session email:', emailError);
            }
        }

        res.json({ evaluation });
    } catch (error) {
        console.error('Schedule review session error:', error);
        res.status(500).json({ message: 'Error scheduling review session' });
    }
};

// Complete manager evaluation
export const completeManagerEvaluation = async (req, res) => {
    try {
        console.log('Starting completeManagerEvaluation with:', {
            evaluationId: req.params.evaluationId,
            userId: req.user._id,
            requestBody: req.body
        });

        const evaluation = await Evaluation.findOne({
            _id: req.params.evaluationId,
            evaluator: req.user._id,
            store: req.user.store._id
        })
        .populate('employee', 'name email position metrics')
        .populate('evaluator', 'name position')
        .populate('store', 'storeEmail')
        .populate({
            path: 'template',
            populate: {
                path: 'sections.criteria.gradingScale',
                model: 'GradingScale'
            }
        });

        console.log('Found evaluation:', {
            found: !!evaluation,
            status: evaluation?.status,
            hasTemplate: !!evaluation?.template,
            templateSections: evaluation?.template?.sections?.length
        });

        if (!evaluation) {
            return res.status(404).json({ message: 'Evaluation not found' });
        }

        // Get default grading scale for any criteria without a specific scale
        const defaultScale = await GradingScale.findOne({
            store: req.user.store._id,
            isDefault: true,
            isActive: true
        });

        console.log('Default grading scale:', {
            found: !!defaultScale,
            grades: defaultScale?.grades
        });

        // Update evaluation data
        try {
            evaluation.managerEvaluation = new Map(Object.entries(req.body.evaluation));
        } catch (error) {
            console.error('Error creating managerEvaluation map:', error);
            return res.status(400).json({ message: 'Invalid evaluation data format' });
        }

        evaluation.overallComments = req.body.overallComments;
        evaluation.developmentPlan = req.body.developmentPlan;
        evaluation.status = 'completed';
        evaluation.completedDate = new Date();

        // Calculate percentage score using proper grading scales
        let totalScore = 0;
        let totalPossible = 0;

        console.log('Starting score calculation');
        evaluation.template.sections.forEach((section, sectionIndex) => {
            section.criteria.forEach((criterion, criterionIndex) => {
                const key = `${sectionIndex}-${criterionIndex}`;
                const score = req.body.evaluation[key];
                const scale = criterion.gradingScale || defaultScale;

                console.log('Processing criterion score:', {
                    key,
                    score,
                    hasScale: !!scale,
                    scaleGrades: scale?.grades
                });

                if (score !== undefined && scale) {
                    const numericScore = Number(score);
                    totalScore += numericScore;
                    // Use the highest possible value from the grading scale
                    const maxPossible = Math.max(...scale.grades.map(g => g.value));
                    totalPossible += maxPossible;
                }
            });
        });

        const percentageScore = totalPossible > 0 ? (totalScore / totalPossible) * 100 : 0;

        console.log('Score calculation complete:', {
            totalScore,
            totalPossible,
            percentageScore
        });

        // Get the user to update their metrics
        const user = await User.findById(evaluation.employee._id);
        if (!user) {
            console.error('Employee not found:', evaluation.employee._id);
            return res.status(404).json({ message: 'Employee not found' });
        }

        // Initialize metrics if they don't exist
        if (!user.metrics) {
            user.metrics = {
                evaluationScores: []
            };
        }

        // Add new evaluation score
        user.metrics.evaluationScores.push({
            date: evaluation.completedDate,
            score: percentageScore
        });

        try {
            // Save evaluation first
            await evaluation.save();
            console.log('Evaluation saved successfully');

            // Then save user
            await user.save();
            console.log('User metrics updated successfully');
        } catch (saveError) {
            console.error('Error saving documents:', saveError);
            throw saveError;
        }

        // Create notification for employee
        try {
            await createNotificationIfNeeded(evaluation, 'completed');
            console.log('Notification created successfully');
        } catch (notificationError) {
            console.error('Error creating notification:', notificationError);
            // Continue execution - don't fail the completion
        }

        // Send email to employee
        if (evaluation.employee.email) {
            try {
                await sendEmail({
                    to: evaluation.employee.email,
                    subject: 'Your Evaluation Has Been Completed',
                    html: `
                        <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">
                            <div style="background-color: #E4002B; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
                                <h1 style="color: white; margin: 0;">Evaluation Completed</h1>
                            </div>

                            <div style="background-color: #f8f8f8; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
                                <h2 style="color: #333; margin-top: 0;">Evaluation Details</h2>
                                <p><strong>Employee:</strong> ${evaluation.employee.name}</p>
                                <p><strong>Position:</strong> ${evaluation.employee.position || 'Team Member'}</p>
                                <p><strong>Evaluator:</strong> ${evaluation.evaluator.name}</p>
                                <p><strong>Completion Date:</strong> ${new Date().toLocaleDateString()}</p>
                            </div>

                            <div style="margin-bottom: 30px;">
                                <p>Your evaluation has been completed. Please log in to LD Growth to review and acknowledge your evaluation.</p>
                            </div>

                            <p style="margin-top: 30px;">
                                Best regards,<br>LD Growth Team
                            </p>
                        </div>
                    `
                });
                console.log('Completion email sent successfully');
            } catch (emailError) {
                console.error('Failed to send completion email:', emailError);
            }
        }

        // Convert Map to object for response
        const evaluationResponse = evaluation.toObject();
        evaluationResponse.managerEvaluation = Object.fromEntries(evaluation.managerEvaluation);

        console.log('Completion successful, sending response');
        res.json({
            message: 'Evaluation completed successfully',
            evaluation: evaluationResponse
        });
    } catch (error) {
        console.error('Error completing manager evaluation:', {
            error: error.message,
            stack: error.stack,
            evaluationId: req.params.evaluationId,
            userId: req.user._id
        });
        res.status(500).json({ message: 'Failed to complete evaluation', error: error.message });
    }
};

// Update evaluator (admin only)
export const updateEvaluator = async (req, res) => {
    try {
        const { evaluatorId } = req.body;

        if (!evaluatorId) {
            return res.status(400).json({ message: 'Evaluator ID is required' });
        }

        // Find the evaluation
        const evaluation = await Evaluation.findOne({
            _id: req.params.evaluationId,
            store: req.user.store._id
        });

        if (!evaluation) {
            return res.status(404).json({ message: 'Evaluation not found' });
        }

        // Don't allow changing evaluator if evaluation is completed
        if (evaluation.status === 'completed') {
            return res.status(400).json({ message: 'Cannot change evaluator for completed evaluations' });
        }

        // Verify the new evaluator exists and belongs to the same store
        const newEvaluator = await User.findOne({
            _id: evaluatorId,
            store: req.user.store._id,
            status: 'active'
        });

        if (!newEvaluator) {
            return res.status(404).json({ message: 'Evaluator not found or not in the same store' });
        }

        // Verify the new evaluator has manager permissions
        const managerPositions = ['Director', 'Leader'];
        if (!managerPositions.includes(newEvaluator.position)) {
            return res.status(400).json({ message: 'Selected user is not authorized to be an evaluator' });
        }

        // Update the evaluator
        evaluation.evaluator = evaluatorId;

        // Reset notification status for the new evaluator if evaluation is in progress
        if (evaluation.status === 'pending_manager_review' || evaluation.status === 'in_review_session') {
            evaluation.notificationStatus.evaluator.selfEvaluationCompleted = false;
            evaluation.notificationStatus.evaluator.reviewSessionScheduled = false;
        }

        await evaluation.save();

        // Populate the updated evaluation for response
        const updatedEvaluation = await Evaluation.findById(evaluation._id)
            .populate('employee', 'name position email')
            .populate('evaluator', 'name position email')
            .populate('template', 'name description')
            .populate('store', 'name');

        res.json({
            message: 'Evaluator updated successfully',
            evaluation: updatedEvaluation
        });

    } catch (error) {
        console.error('Update evaluator error:', error);
        res.status(500).json({ message: 'Error updating evaluator' });
    }
};

// Acknowledge evaluation
export const acknowledgeEvaluation = async (req, res) => {
    try {
        const evaluation = await Evaluation.findOne({
            _id: req.params.evaluationId,
            employee: req.user._id,
            store: req.user.store._id,
            status: 'completed'
        })
        .populate('employee', 'name position')
        .populate('evaluator', 'name position')
        .populate({
            path: 'template',
            populate: {
                path: 'sections.criteria.gradingScale'
            }
        })
        .populate('store', 'storeEmail name');

        if (!evaluation) {
            return res.status(404).json({ message: 'Completed evaluation not found' });
        }

        evaluation.acknowledgement = {
            acknowledged: true,
            date: new Date()
        };
        await evaluation.save();

        // Send email to store
        if (evaluation.store.storeEmail) {
            try {
                // Convert Map to object if needed
                const managerEvaluation = evaluation.managerEvaluation && evaluation.managerEvaluation.size > 0
                    ? Object.fromEntries(evaluation.managerEvaluation)
                    : {};

                console.log('Manager Evaluation data:', managerEvaluation);

                // Generate HTML for evaluation sections and responses
                let sectionsHtml = '';
                evaluation.template.sections.forEach((section, sectionIndex) => {
                    sectionsHtml += `
                        <div style="margin-bottom: 20px;">
                            <h3 style="color: #333;">${section.name}</h3>
                            ${section.description ? `<p style="color: #666; margin-bottom: 10px;">${section.description}</p>` : ''}
                            ${section.criteria.map((criterion, criterionIndex) => {
                                const key = `0-${criterionIndex}`;
                                const rating = managerEvaluation[key];
                                const scale = criterion.gradingScale;

                                console.log(`Key: ${key}, Rating:`, rating, 'Scale:', scale);

                                let ratingText = 'N/A';
                                let ratingColor = '#666';

                                if (rating && scale) {
                                    const grade = scale.grades.find(g => g.value === Number(rating));
                                    if (grade) {
                                        ratingText = `${rating} - ${grade.label}`;
                                        ratingColor = grade.color || '#666';
                                    }
                                }

                                return `
                                    <div style="margin-bottom: 15px; padding: 12px; background-color: #f5f5f5; border-radius: 8px;">
                                        <p style="margin: 0 0 8px 0; font-weight: 600;">${criterion.name}</p>
                                        ${criterion.description ? `<p style="margin: 0 0 8px 0; color: #666; font-size: 0.9em;">${criterion.description}</p>` : ''}
                                        <div style="display: flex; align-items: center;">
                                            <div style="width: 12px; height: 12px; border-radius: 50%; background-color: ${ratingColor}; margin-right: 8px;"></div>
                                            <p style="margin: 0; color: ${ratingColor}; font-weight: 500;">Rating: ${ratingText}</p>
                                        </div>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    `;
                });

                // Overall evaluation comments and development plan
                const summaryHtml = `
                    <div style="margin-bottom: 20px;">
                        <h3 style="color: #333;">Overall Comments</h3>
                        <p style="margin-bottom: 15px;">${evaluation.overallComments || 'No overall comments provided.'}</p>

                        <h3 style="color: #333;">Development Plan</h3>
                        <p>${evaluation.developmentPlan || 'No development plan provided.'}</p>
                    </div>
                `;

                await sendEmail({
                    to: evaluation.store.storeEmail,
                    subject: `Evaluation Acknowledged - ${evaluation.employee.name}`,
                    html: `
                        <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto;">
                            <h1 style="color: #E4002B;">Evaluation Acknowledgment</h1>

                            <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
                                <p><strong>Store:</strong> ${evaluation.store.name}</p>
                                <p><strong>Employee:</strong> ${evaluation.employee.name} (${evaluation.employee.position})</p>
                                <p><strong>Evaluator:</strong> ${evaluation.evaluator.name} (${evaluation.evaluator.position})</p>
                                <p><strong>Template:</strong> ${evaluation.template.name}</p>
                                <p><strong>Acknowledgment Date:</strong> ${new Date().toLocaleDateString()}</p>
                            </div>

                            <h2 style="color: #E4002B;">Evaluation Details</h2>
                            ${sectionsHtml}
                            ${summaryHtml}

                            <p style="margin-top: 30px;">
                                For more details, please log in to the LD Growth platform.
                            </p>
                            <p>Best regards,<br>LD Growth Team</p>
                        </div>
                    `
                });
            } catch (emailError) {
                console.error('Failed to send store notification email:', emailError);
                // Continue execution - don't fail the acknowledgment
            }
        }

        res.json({ evaluation });
    } catch (error) {
        console.error('Acknowledge evaluation error:', error);
        res.status(500).json({ message: 'Error acknowledging evaluation' });
    }
};

// Mark notification as viewed
export const markNotificationViewed = async (req, res) => {
    try {
        const evaluation = await Evaluation.findById(req.params.evaluationId);

        if (!evaluation) {
            return res.status(404).json({ message: 'Evaluation not found' });
        }

        // Check if user has permission to view this evaluation
        if (evaluation.employee.toString() !== req.user._id.toString() &&
            evaluation.evaluator.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to view this evaluation' });
        }

        // Check if notification is already viewed by this user
        const alreadyViewed = evaluation.notificationViewed.some(
            view => view.user.toString() === req.user._id.toString()
        );

        if (!alreadyViewed) {
            evaluation.notificationViewed.push({
                user: req.user._id,
                viewedAt: new Date()
            });
            await evaluation.save();
        }

        res.json({ message: 'Notification marked as viewed' });
    } catch (error) {
        console.error('Error marking notification as viewed:', error);
        res.status(500).json({
            message: 'Error marking notification as viewed',
            error: error.message
        });
    }
};

// Save evaluation draft
export const saveDraft = async (req, res) => {
    try {
        console.log('Save draft request:', {
            body: req.body,
            evaluationId: req.params.evaluationId,
            userId: req.user._id,
            userStore: req.user.store._id
        });

        const { managerEvaluation, overallComments } = req.body;

        const evaluation = await Evaluation.findOne({
            _id: req.params.evaluationId,
            evaluator: req.user._id,
            store: req.user.store._id,
            status: { $in: ['pending_manager_review', 'in_review_session'] }
        });

        if (!evaluation) {
            console.error('Evaluation not found or not in valid state:', {
                evaluationId: req.params.evaluationId,
                userId: req.user._id,
                userStore: req.user.store._id
            });
            return res.status(404).json({ message: 'Evaluation not found or not in valid state for saving draft' });
        }

        // Convert the evaluation data to a Map if provided
        if (managerEvaluation) {
            evaluation.managerEvaluation = new Map(Object.entries(managerEvaluation));
        }
        if (overallComments !== undefined) {
            evaluation.overallComments = overallComments;
        }

        await evaluation.save();

        console.log('Draft saved successfully:', {
            evaluationId: evaluation._id,
            status: evaluation.status,
            managerEvaluation: Object.fromEntries(evaluation.managerEvaluation || new Map()),
            overallComments: evaluation.overallComments
        });

        res.json({
            message: 'Draft saved successfully',
            evaluation: {
                ...evaluation.toObject(),
                managerEvaluation: Object.fromEntries(evaluation.managerEvaluation || new Map())
            }
        });

    } catch (error) {
        console.error('Save draft error:', {
            error: error.message,
            stack: error.stack,
            evaluationId: req.params.evaluationId,
            userId: req.user._id,
            userStore: req.user.store._id
        });
        res.status(500).json({ message: 'Error saving draft' });
    }
};

// Send completed evaluation email to store
export const sendCompletedEvaluationEmail = async (req, res) => {
    try {
        // First get the default grading scale
        const defaultScale = await GradingScale.findOne({
            store: req.user.store._id,
            isDefault: true,
            isActive: true
        });

        const evaluation = await Evaluation.findOne({
            _id: req.params.evaluationId,
            store: req.user.store._id,
            status: 'completed'
        })
        .populate({
            path: 'employee',
            select: 'name position'
        })
        .populate({
            path: 'evaluator',
            select: 'name position'
        })
        .populate({
            path: 'template',
            select: 'name sections description',
            populate: {
                path: 'sections.criteria.gradingScale',
                model: 'GradingScale'
            }
        })
        .populate('store', 'storeEmail name');

        if (!evaluation) {
            return res.status(404).json({ message: 'Completed evaluation not found' });
        }

        if (!evaluation.store.storeEmail) {
            return res.status(400).json({ message: 'Store email not configured' });
        }

        // Properly handle the manager evaluation data
        let managerEvaluation = {};
        if (evaluation.managerEvaluation) {
            if (evaluation.managerEvaluation instanceof Map) {
                managerEvaluation = Object.fromEntries(evaluation.managerEvaluation);
            } else if (typeof evaluation.managerEvaluation.get === 'function') {
                managerEvaluation = Object.fromEntries(evaluation.managerEvaluation);
            } else if (typeof evaluation.managerEvaluation === 'object') {
                managerEvaluation = evaluation.managerEvaluation;
            }
        }

        console.log('Processed Manager Evaluation data:', {
            managerEvaluation,
            keys: Object.keys(managerEvaluation),
            values: Object.values(managerEvaluation)
        });

        // Generate HTML for evaluation sections and responses
        let sectionsHtml = '';
        if (evaluation.template && evaluation.template.sections) {
            evaluation.template.sections.forEach((section, sectionIndex) => {
                console.log(`Processing section ${sectionIndex}:`, {
                    name: section.name || section.title,
                    criteriaCount: section?.criteria?.length
                });

                if (section && section.criteria) {
                    sectionsHtml += `
                        <div style="margin-bottom: 20px;">
                            <h3 style="color: #333;">${section.name || section.title}</h3>
                            ${section.description ? `<p style="color: #666; margin-bottom: 10px;">${section.description}</p>` : ''}
                            ${section.criteria.map((criterion, criterionIndex) => {
                                const key = `0-${criterionIndex}`;
                                const rating = managerEvaluation[key];
                                const scale = criterion.gradingScale || defaultScale;

                                console.log(`Processing criterion ${criterionIndex}:`, {
                                    key,
                                    rating,
                                    criterionName: criterion.name,
                                    hasGradingScale: !!scale,
                                    gradingScaleGrades: scale?.grades
                                });

                                let ratingText = 'N/A';
                                let ratingColor = '#666';

                                if (rating !== undefined && scale && scale.grades) {
                                    const grade = scale.grades.find(g => g.value === Number(rating));
                                    console.log('Found grade:', {
                                        rating,
                                        grade,
                                        allGrades: scale.grades
                                    });

                                    if (grade) {
                                        ratingText = `${rating} - ${grade.label}`;
                                        ratingColor = grade.color || '#666';
                                    }
                                }

                                return `
                                    <div style="margin-bottom: 15px; padding: 12px; background-color: #f5f5f5; border-radius: 8px;">
                                        <p style="margin: 0 0 8px 0; font-weight: 600;">${criterion.name}</p>
                                        ${criterion.description ? `<p style="margin: 0 0 8px 0; color: #666; font-size: 0.9em;">${criterion.description}</p>` : ''}
                                        <div style="display: flex; align-items: center;">
                                            <div style="width: 12px; height: 12px; border-radius: 50%; background-color: ${ratingColor}; margin-right: 8px;"></div>
                                            <p style="margin: 0; color: ${ratingColor}; font-weight: 500;">Rating: ${ratingText}</p>
                                        </div>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    `;
                }
            });
        }

        // Send email to store
        await sendEmail({
            to: evaluation.store.storeEmail,
            subject: `Completed Evaluation - ${evaluation.employee.name}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">
                    <div style="background-color: #E4002B; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
                        <h1 style="color: white; margin: 0;">Completed Evaluation Report</h1>
                    </div>

                    <div style="background-color: #f8f8f8; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
                        <h2 style="color: #333; margin-top: 0;">Evaluation Details</h2>
                        <p><strong>Employee:</strong> ${evaluation.employee.name} (${evaluation.employee.position || 'Team Member'})</p>
                        <p><strong>Evaluator:</strong> ${evaluation.evaluator.name}</p>
                        <p><strong>Completion Date:</strong> ${new Date().toLocaleDateString()}</p>
                        <p><strong>Template:</strong> ${evaluation.template.name}</p>
                    </div>

                    <div style="margin-bottom: 30px;">
                        <h2 style="color: #333;">Evaluation Results</h2>
                        ${sectionsHtml}
                    </div>

                    <div style="background-color: #f8f8f8; padding: 20px; border-radius: 8px;">
                        <h2 style="color: #333; margin-top: 0;">Overall Assessment</h2>
                        <div style="margin-bottom: 20px;">
                            <h3 style="color: #666;">Comments</h3>
                            <p style="margin: 0;">${evaluation.overallComments || 'No overall comments provided.'}</p>
                        </div>
                        <div>
                            <h3 style="color: #666;">Development Plan</h3>
                            <p style="margin: 0;">${evaluation.developmentPlan || 'No development plan provided.'}</p>
                        </div>
                    </div>
                </div>
            `
        });

        res.json({ message: 'Evaluation email sent successfully' });
    } catch (error) {
        console.error('Send completed evaluation email error:', error);
        res.status(500).json({ message: 'Error sending evaluation email' });
    }
};

// Send notification for unacknowledged evaluation
export const sendUnacknowledgedNotification = async (req, res) => {
    try {
        const { evaluationId } = req.params;

        const evaluation = await Evaluation.findOne({
            _id: evaluationId,
            status: 'completed',
            'acknowledgement.acknowledged': false
        })
        .populate('employee', 'name')
        .populate('evaluator', 'name');

        if (!evaluation) {
            return res.status(404).json({ message: 'Evaluation not found or already acknowledged' });
        }

        // Create notification for the employee
        const notification = new Notification({
            userId: evaluation.employee._id,
            storeId: evaluation.store,
            type: 'EVALUATION',
            status: 'UNREAD',
            title: 'Evaluation Acknowledgement Required',
            message: `${evaluation.employee.name}'s evaluation from ${evaluation.evaluator.name} requires acknowledgement.`,
            metadata: {
                evaluationId: evaluation._id,
                evaluationType: 'acknowledgement_required',
                scheduledDate: evaluation.scheduledDate
            },
            employee: {
                name: evaluation.employee.name,
                position: evaluation.employee.position || 'Employee',
                department: evaluation.employee.department || 'Uncategorized'
            }
        });

        await notification.save();

        res.json({
            message: 'Notification sent successfully',
            notification
        });
    } catch (error) {
        console.error('Error sending unacknowledged notification:', error);
        res.status(500).json({ message: 'Error sending notification' });
    }
};

// Start review without scheduling
export const startReview = async (req, res) => {
    try {
        const evaluation = await Evaluation.findOne({
            _id: req.params.evaluationId,
            evaluator: req.user._id,
            store: req.user.store._id,
            status: 'pending_manager_review'
        });

        if (!evaluation) {
            return res.status(404).json({ message: 'Evaluation not found or cannot be started' });
        }

        // Update status to in_review_session
        evaluation.status = 'in_review_session';
        evaluation.reviewSessionDate = new Date(); // Set to current time since we're starting now

        await evaluation.save();

        // Create notification for the employee
        await createNotificationIfNeeded(evaluation, 'review_started');

        res.json({
            message: 'Review started successfully',
            evaluation
        });

    } catch (error) {
        console.error('Start review error:', error);
        res.status(500).json({ message: 'Error starting review' });
    }
};