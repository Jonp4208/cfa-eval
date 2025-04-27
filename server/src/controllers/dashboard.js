import { Settings, Store, User, Evaluation, Template, Disciplinary, Notification, TrainingProgress } from '../models/index.js';
import logger from '../utils/logger.js';

// Get dashboard statistics
export const getDashboardStats = async (req, res) => {
    try {
        // Ensure user and store exist
        if (!req.user || !req.user.store) {
            return res.status(400).json({
                message: 'User or store information missing',
                error: 'Missing required user data'
            });
        }

        const { store, role, isAdmin } = req.user;

        // Get notifications for the user
        const notifications = await Notification.find({
            userId: req.user._id,
            status: 'UNREAD'
        }).lean();

        // Create a map of evaluation IDs to notification IDs
        const notificationMap = notifications.reduce((acc, notification) => {
            if (notification?.metadata?.evaluationId) {
                acc[notification.metadata.evaluationId.toString()] = notification._id;
            }
            return acc;
        }, {});

        // Build query based on user role
        let evaluationQuery = {
            store: store._id, // Use store._id explicitly
            status: { $ne: 'completed' },
            deleted: { $ne: true }
        };

        // If not admin/manager, only show own evaluations
        if (!isAdmin && !['manager', 'evaluator'].includes(role)) {
            evaluationQuery.$or = [
                { employee: req.user._id },
                { evaluator: req.user._id }
            ];
        }

        // Get matching evaluations with proper error handling
        let matchingEvaluations = [];
        try {
            matchingEvaluations = await Evaluation.find(evaluationQuery)
                .populate('employee', 'name')
                .populate('evaluator', 'name')
                .lean();
        } catch (error) {
            console.error('Error fetching matching evaluations:', error);
        }

        const pendingEvaluations = await Evaluation.countDocuments(evaluationQuery);

        // Get the start of the current quarter
        const now = new Date();
        const currentQuarter = Math.floor(now.getMonth() / 3);
        const startOfQuarter = new Date(now.getFullYear(), currentQuarter * 3, 1);

        const completedEvaluations = await Evaluation.countDocuments({
            store,
            status: 'completed',
            completedDate: { $gte: startOfQuarter }
        });

        // Get completed evaluations in last 30 days
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const completedReviewsLast30Days = await Evaluation.countDocuments({
            store,
            status: 'completed',
            completedDate: { $gte: thirtyDaysAgo }
        });

        // Get disciplinary stats
        let disciplinaryQuery = { store };

        // If user is not an admin/manager/evaluator, only show their own incidents
        if (!isAdmin && !['manager', 'evaluator'].includes(role)) {
            disciplinaryQuery.employee = req.user._id;
        }

        const openDisciplinaryIncidents = await Disciplinary.countDocuments({
            ...disciplinaryQuery,
            status: { $ne: 'Resolved' }
        });

        // Count resolved incidents this month
        const resolvedDisciplinaryThisMonth = await Disciplinary.countDocuments({
            ...disciplinaryQuery,
            status: 'Resolved',
            date: { $gte: new Date(now.getFullYear(), now.getMonth(), 1) }
        });

        // Get recent disciplinary incidents
        const recentDisciplinaryIncidents = await Disciplinary.find(disciplinaryQuery)
            .populate('employee', 'name')
            .populate('supervisor', 'name')
            .sort('-date')
            .limit(5);

        const totalEmployees = await User.countDocuments({
            store,
            status: 'active'  // Only count active employees
        });

        const activeTemplates = await Template.countDocuments({
            store,
            isActive: true
        });

        // Get upcoming evaluations for next 7 days
        const sevenDaysFromNow = new Date();
        sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

        // Build query for upcoming evaluations based on role
        let evaluationQueryUpcoming = {
            store,
            scheduledDate: { $gte: now, $lte: sevenDaysFromNow },
            status: { $ne: 'completed' }
        };

        // If not admin/manager/evaluator, only show own evaluations
        if (!isAdmin && !['manager', 'evaluator'].includes(role)) {
            evaluationQueryUpcoming.employee = req.user._id;
        }

        // Get upcoming evaluations with notifications
        const upcomingEvaluations = await Evaluation.find(evaluationQueryUpcoming)
            .populate('employee', 'name')
            .populate('evaluator', 'name')
            .populate('template', 'name')
            .lean();

        // Create notifications for evaluations that don't have one
        const notificationsToCreate = [];
        const evaluationsWithNotifications = await Promise.all(upcomingEvaluations.map(async (evaluation) => {
            if (!evaluation || !evaluation.employee || !evaluation.evaluator) {
                logger.error('Invalid evaluation data:', evaluation);
                return null;
            }

            // Only check notifications if the current user is the employee, evaluator, or manager
            const shouldCreateNotification =
                evaluation.employee._id?.toString() === req.user._id?.toString() ||
                evaluation.evaluator._id?.toString() === req.user._id?.toString() ||
                (evaluation.manager && evaluation.manager._id?.toString() === req.user._id?.toString());

            if (!shouldCreateNotification) {
                return {
                    ...evaluation,
                    notificationId: null
                };
            }

            // Check if ANY notification exists for this evaluation and user
            const existingNotification = await Notification.findOne({
                $and: [
                    {
                        $or: [
                            { userId: req.user._id },
                            { user: req.user._id }
                        ]
                    },
                    {
                        $or: [
                            { 'metadata.evaluationId': evaluation._id },
                            { evaluationId: evaluation._id }
                        ]
                    }
                ]
            }).lean();

            // If notification already exists, return it regardless of status
            if (existingNotification) {
                return {
                    ...evaluation,
                    notificationId: existingNotification._id
                };
            }

            // Create new notification with proper error handling
            try {
                const notification = new Notification({
                    userId: req.user._id,
                    storeId: store._id,
                    type: 'EVALUATION',
                    status: 'UNREAD',
                    title: 'Upcoming Evaluation',
                    message: getNotificationMessage(evaluation, req.user),
                    metadata: {
                        evaluationId: evaluation._id,
                        scheduledDate: evaluation.scheduledDate
                    },
                    employee: {
                        name: evaluation.employee?.name || 'Unknown',
                        position: evaluation.employee?.position || 'Team Member',
                        department: evaluation.employee?.department || 'Uncategorized'
                    }
                });

                notificationsToCreate.push(notification);
                return {
                    ...evaluation,
                    notificationId: notification._id
                };
            } catch (error) {
                logger.error('Error creating notification:', error);
                return {
                    ...evaluation,
                    notificationId: null
                };
            }
        }));

        // Filter out null values and save notifications
        const validEvaluations = evaluationsWithNotifications.filter(Boolean);
        if (notificationsToCreate.length > 0) {
            try {
                await Notification.insertMany(notificationsToCreate);
            } catch (error) {
                logger.error('Error saving notifications:', error);
            }
        }

        // Get recent activity with error handling
        let recentActivity = [];
        try {
            recentActivity = await Evaluation.find({
                store: store._id,
                updatedAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
            })
            .populate('employee', 'name')
            .populate('evaluator', 'name')
            .sort({ updatedAt: -1 })
            .limit(10)
            .lean();
        } catch (error) {
            logger.error('Error fetching recent activity:', error);
        }

        // Get new hires count (employees hired in the last 60 days)
        let newHiresCount = 0;
        try {
            const sixtyDaysAgo = new Date();
            sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

            newHiresCount = await User.countDocuments({
                store: store._id,
                status: 'active',
                startDate: { $gte: sixtyDaysAgo }
            });

            // Only log at debug level
            logger.debug(`New hires count: ${newHiresCount}`);
        } catch (error) {
            logger.error('Error fetching new hires count:', error);
        }

        res.json({
            pendingEvaluations,
            completedEvaluations,
            completedReviewsLast30Days,
            totalEmployees,
            activeTemplates,
            openDisciplinaryIncidents,
            resolvedDisciplinaryThisMonth,
            upcomingEvaluations: validEvaluations,
            newHiresCount,
            recentActivity: recentActivity.map(activity => ({
                id: activity._id,
                employeeName: activity.employee?.name || 'Unknown',
                evaluatorName: activity.evaluator?.name || 'Unknown',
                status: activity.status,
                updatedAt: activity.updatedAt
            }))
        });
    } catch (error) {
        logger.error('Error getting dashboard stats:', error);
        res.status(500).json({
            message: 'Error getting dashboard stats',
            error: error.message
        });
    }
};

// Helper function to generate notification message
function getNotificationMessage(evaluation, user) {
    if (!evaluation || !evaluation.employee || !evaluation.scheduledDate) {
        return 'Upcoming evaluation scheduled';
    }

    if (evaluation.employee._id?.toString() === user._id?.toString()) {
        return `You have an evaluation scheduled for ${new Date(evaluation.scheduledDate).toLocaleDateString()}`;
    } else if (evaluation.evaluator._id?.toString() === user._id?.toString()) {
        return `You have an evaluation to conduct for ${evaluation.employee.name || 'Unknown'} scheduled for ${new Date(evaluation.scheduledDate).toLocaleDateString()}`;
    } else {
        return `An evaluation is scheduled for ${evaluation.employee.name || 'Unknown'} on ${new Date(evaluation.scheduledDate).toLocaleDateString()}`;
    }
}

// Get recent activity
export const getRecentActivity = async (req, res) => {
    try {
        const storeId = req.user.storeId;
        const activity = await getActivityLogs(storeId);
        res.json({ activity });
    } catch (error) {
        logger.error('Recent activity error:', error);
        res.status(500).json({ message: 'Error fetching recent activity' });
    }
};

// Helper function to get activity logs
const getActivityLogs = async (storeId) => {
    // Get recent evaluations
    const recentEvaluations = await Evaluation.find({
        store: storeId,
        updatedAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } // Last 7 days
    })
    .populate('employee', 'name')
    .populate('evaluator', 'name')
    .sort('-updatedAt')
    .limit(10);

    // Get recent template changes
    const recentTemplates = await Template.find({
        store: storeId,
        updatedAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    })
    .populate('createdBy', 'name')
    .sort('-updatedAt')
    .limit(5);

    // Combine and format activity
    const activity = [
        ...recentEvaluations.map(evaluation => ({
            id: evaluation._id.toString(),
            type: 'Evaluation',
            description: `${evaluation.evaluator.name} ${evaluation.status === 'draft' ? 'started' : evaluation.status} evaluation for ${evaluation.employee.name}`,
            date: evaluation.updatedAt
        })),
        ...recentTemplates.map(template => ({
            id: template._id.toString(),
            type: 'Template',
            description: `${template.createdBy.name} ${template.createdAt === template.updatedAt ? 'created' : 'updated'} template "${template.name}"`,
            date: template.updatedAt
        }))
    ];

    // Sort by date
    return activity.sort((a, b) => b.date - a.date).slice(0, 10);
};

// Get team member dashboard data
export const getTeamMemberDashboard = async (req, res) => {
    try {
        const user = await User.findById(req.user._id)
            .populate({
                path: 'evaluations',
                match: { deleted: { $ne: true } },
                select: 'scheduledDate completedDate template status evaluator createdAt acknowledged deleted store',
                populate: [
                    { path: 'template', select: 'name' },
                    { path: 'evaluator', select: 'name position' },
                    { path: 'store', select: 'name storeNumber' }
                ]
            })
            .populate('store', 'name storeNumber location')
            .populate('evaluator', 'name')
            .populate('manager', 'name')
            .select('name position departments positionType status evaluations development recognition');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Only log minimal information at debug level
        logger.debug(`Finding next evaluation for user ${user._id}`);

        // Find next evaluation
        const nextEvaluation = await Evaluation.findOne({
            employee: user._id,
            deleted: { $ne: true },
            status: { $ne: 'completed' },
            scheduledDate: { $exists: true }
        })
        .sort({ scheduledDate: 1 })
        .select('scheduledDate status template evaluator')
        .populate('template', 'name')
        .populate('evaluator', 'name')
        .lean();

        // Log only basic information about the result
        logger.debug(`Next evaluation found: ${nextEvaluation ? 'yes' : 'no'}`);

        logger.debug(`Finding last completed evaluation for user ${user._id}`);
        // Find last completed evaluation with a separate query
        const lastCompletedEvaluation = await Evaluation.findOne({
            employee: user._id,
            deleted: { $ne: true },
            status: 'completed',
            completedDate: { $exists: true }
        })
        .sort({ completedDate: -1 })
        .select('completedDate')
        .lean();

        logger.debug(`Last completed evaluation found: ${lastCompletedEvaluation ? 'yes' : 'no'}`);

        // Get completed evaluations count (excluding deleted)
        const completedEvaluations = user.evaluations?.filter(e => e.status === 'completed' && !e.deleted) || [];
        const completedCount = completedEvaluations.length;

        // Calculate current performance from completed evaluations
        let currentPerformance = null;
        if (completedCount > 0) {
            currentPerformance = Math.round(
                completedEvaluations
                    .slice(0, 3)
                    .reduce((sum, evaluation) => sum + (evaluation.score || 0), 0) /
                Math.min(completedCount, 3)
            );
        }

        // Get active development goals
        const activeGoals = user.development
            ? user.development
                .filter(goal => goal.status !== 'completed')
                .map(goal => ({
                    id: goal._id.toString(),
                    name: goal.goal,
                    progress: goal.progress || 0,
                    targetDate: goal.targetDate
                }))
            : [];

        // Get recent achievements/recognition
        const recentAchievements = user.recognition
            ? user.recognition
                .sort((a, b) => b.date - a.date)
                .slice(0, 3)
                .map(achievement => ({
                    id: achievement._id.toString(),
                    title: achievement.title,
                    date: achievement.date
                }))
            : [];

        const dashboardData = {
            name: user.name,
            position: user.position || 'Team Member',
            departments: user.departments || ['General'],
            store: {
                name: user.store?.name,
                number: user.store?.storeNumber,
                location: user.store?.location
            },
            currentPerformance,
            nextEvaluation: nextEvaluation ? {
                date: nextEvaluation.scheduledDate || nextEvaluation.createdAt,
                templateName: nextEvaluation.template?.name || 'General Evaluation',
                status: nextEvaluation.status,
                evaluator: nextEvaluation.evaluator?.name,
                id: nextEvaluation._id,
                acknowledged: nextEvaluation.acknowledged || false,
                lastEvaluationDate: lastCompletedEvaluation?.completedDate || null
            } : {
                date: null,
                templateName: 'Not Scheduled',
                status: 'not_scheduled',
                evaluator: null,
                id: null,
                acknowledged: false,
                lastEvaluationDate: lastCompletedEvaluation?.completedDate || null
            },
            evaluator: user.evaluator?.name,
            manager: user.manager?.name,
            activeGoals: activeGoals.length,
            goals: activeGoals,
            achievements: recentAchievements,
            recentEvaluations: completedEvaluations
                .slice(0, 3)
                .map(evaluation => ({
                    date: evaluation.date,
                    score: evaluation.score,
                    template: evaluation.template?.name,
                    evaluator: evaluation.evaluator?.name
                })),
            training: {
                required: [], // Will be populated from training progress
                completed: []  // Will be populated from training progress
            }
        };

        // Fetch training progress
        const trainingProgress = await TrainingProgress.find({
            employee: user._id,
            deleted: { $ne: true }
        })
        .populate('trainingPlan')
        .lean();

        // Process training progress
        if (trainingProgress) {
            dashboardData.training = {
                required: trainingProgress
                    .filter(progress => progress.status !== 'COMPLETED')
                    .map(progress => ({
                        id: progress._id.toString(),
                        name: progress.trainingPlan?.name || 'Unnamed Training',
                        type: progress.trainingPlan?.type || 'REGULAR',
                        completedModules: progress.moduleProgress?.filter(m => m.status === 'COMPLETED').length || 0,
                        totalModules: progress.trainingPlan?.modules?.length || 0,
                        progress: Math.round((progress.moduleProgress?.filter(m => m.status === 'COMPLETED').length || 0) /
                                 (progress.trainingPlan?.modules?.length || 1) * 100)
                    })),
                completed: trainingProgress
                    .filter(progress => progress.status === 'COMPLETED')
                    .map(progress => ({
                        id: progress._id.toString(),
                        name: progress.trainingPlan?.name || 'Unnamed Training',
                        type: progress.trainingPlan?.type || 'REGULAR',
                        completedAt: progress.completedAt
                    }))
                    .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt))
                    .slice(0, 3)
            };
        }

        res.json(dashboardData);
    } catch (error) {
        console.error('Error getting team member dashboard:', error);
        res.status(500).json({
            message: 'Error getting team member dashboard',
            error: error.message
        });
    }
};