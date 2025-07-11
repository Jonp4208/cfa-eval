import express from 'express';
import { auth } from '../middleware/auth.js';
import { User, Evaluation, Goal, GradingScale } from '../models/index.js';

const router = express.Router();

// Function to map score to numeric value
function mapScoreToNumeric(score) {
  if (typeof score === 'number') return score;
  if (typeof score === 'string') {
    // Try to parse as number first
    const parsed = parseFloat(score);
    if (!isNaN(parsed)) return parsed;

    // Normalize the score string
    const normalizedScore = score.toLowerCase().trim();

    // Handle Hearts and Hands specific ratings first
    const heartsHandsMap = {
      '- improvement needed': 1,
      '- improvment needed': 1, // Handle typo
      '- performer': 2,
      '- valued': 3,
      '- star': 4
    };

    if (heartsHandsMap[normalizedScore]) {
      return heartsHandsMap[normalizedScore];
    }

    // Handle standard string scores like 'Excellent', 'Good', etc.
    const scoreMap = {
      'excellent': 5,
      'good': 4,
      'satisfactory': 3,
      'needs improvement': 2,
      'poor': 1
    };
    return scoreMap[normalizedScore] || 0;
  }
  return 0;
};

// Get quick stats for analytics dashboard
router.get('/quick-stats', auth, async (req, res) => {
  try {
    const { timeframe = '30' } = req.query;
    const days = parseInt(timeframe) || 30;

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get total team members for the store
    const teamMembers = await User.countDocuments({ store: req.user.store._id });

    // Get evaluations for the specified timeframe
    const recentEvaluations = await Evaluation.find({
      store: req.user.store._id,
      status: 'completed',
      completedDate: { $gte: startDate, $lte: endDate }
    })
    .populate('employee')
    .populate({
      path: 'template',
      populate: {
        path: 'sections.criteria.gradingScale',
        model: 'GradingScale'
      }
    });

    // Get evaluations from the previous period for comparison
    const previousStartDate = new Date(startDate);
    previousStartDate.setDate(previousStartDate.getDate() - days);

    const previousEvaluations = await Evaluation.find({
      store: req.user.store._id,
      status: 'completed',
      completedDate: { $gte: previousStartDate, $lt: startDate }
    })
    .populate({
      path: 'template',
      populate: {
        path: 'sections.criteria.gradingScale',
        model: 'GradingScale'
      }
    });



    // Get default grading scale
    const defaultScale = await GradingScale.findOne({
      store: req.user.store._id,
      isDefault: true,
      isActive: true
    });

    let avgPerformance = 0;
    if (recentEvaluations.length > 0) {
      const evaluationScores = recentEvaluations.map(evaluation => {
        // Ensure we have the required data
        if (!evaluation.managerEvaluation || !evaluation.template) {
          return { score: 0, totalPossible: 0 };
        }

        // Convert managerEvaluation Map to object if needed
        const scores = evaluation.managerEvaluation instanceof Map
          ? Object.fromEntries(evaluation.managerEvaluation)
          : evaluation.managerEvaluation;



        let totalScore = 0;
        let totalPossible = 0;

        evaluation.template.sections.forEach((section, sectionIndex) => {
          section.criteria.forEach((criterion, criterionIndex) => {
            const key = `${sectionIndex}-${criterionIndex}`;
            const score = scores[key];
            const scale = criterion.gradingScale || defaultScale;

            if (score !== undefined && scale) {
              const numericScore = mapScoreToNumeric(score);
              totalScore += numericScore;

              // Calculate max possible score from the grading scale
              let maxPossible = 4; // Default for Hearts and Hands
              if (scale.grades && Array.isArray(scale.grades) && scale.grades.length > 0) {
                maxPossible = Math.max(...scale.grades.map(g => g.value));
              }
              totalPossible += maxPossible;
            }
          });
        });



        return { score: totalScore, totalPossible };
      });

      // Filter out evaluations with no possible points to avoid division by zero
      const validScores = evaluationScores.filter(score => score.totalPossible > 0);

      if (validScores.length > 0) {
        const totalScore = validScores.reduce((sum, evalScore) => sum + evalScore.score, 0);
        const totalPossible = validScores.reduce((sum, evalScore) => sum + evalScore.totalPossible, 0);
        avgPerformance = totalPossible > 0 ? Math.round((totalScore / totalPossible) * 100) : 0;


      }
    }

    // Calculate development goals progress
    const activeGoals = await Goal.find({
      user: { $in: await User.find({ store: req.user.store._id }).select('_id') },
      status: { $in: ['in-progress', 'completed'] }
    });

    let developmentGoals = 0;
    if (activeGoals.length > 0) {
      const totalProgress = activeGoals.reduce((sum, goal) => sum + (goal.progress || 0), 0);
      developmentGoals = Math.round(totalProgress / activeGoals.length);
    }

    // Get pending evaluations
    const pendingEvaluations = await Evaluation.countDocuments({
      store: req.user.store._id,
      status: { $in: ['pending', 'scheduled', 'in-progress'] }
    });

    // Get completed evaluations count
    const completedEvaluations = recentEvaluations.length;

    // Calculate improvement rate by comparing with previous period
    let improvementRate = 0;
    if (previousEvaluations.length > 0) {
      // Calculate previous period average performance
      const previousAvgPerformance = calculateAveragePerformance(previousEvaluations, defaultScale);

      // Calculate improvement rate
      if (previousAvgPerformance > 0) {
        improvementRate = Math.round(((avgPerformance - previousAvgPerformance) / previousAvgPerformance) * 100);
      }
    }

    res.json({
      teamMembers,
      avgPerformance,
      developmentGoals,
      completedEvaluations,
      pendingEvaluations,
      improvementRate
    });
  } catch (error) {
    console.error('Error fetching quick stats:', error);
    res.status(500).json({ message: 'Failed to fetch quick stats' });
  }
});

// Get department analytics
router.get('/department/:department', auth, async (req, res) => {
  try {
    const { department } = req.params;
    const { timeframe = 'month' } = req.query;

    // Validate department parameter
    if (!['foh', 'boh'].includes(department)) {
      return res.status(400).json({ message: 'Invalid department' });
    }

    // Map department to array of specific departments
    const departmentMap = {
      'foh': ['Front Counter', 'Drive Thru'],
      'boh': ['Kitchen']
    };

    // Calculate date range based on timeframe
    const startDate = new Date();
    switch (timeframe) {
      case 'week':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case 'quarter':
        startDate.setMonth(startDate.getMonth() - 3);
        break;
      default:
        startDate.setMonth(startDate.getMonth() - 1); // Default to month
    }

    // Get evaluations for the department within timeframe
    const evaluations = await Evaluation.find({
      store: req.user.store._id,
      status: 'completed',
      completedDate: { $gte: startDate }
    })
    .populate({
      path: 'employee',
      match: { departments: { $in: departmentMap[department] } }
    })
    .populate('template');

    // Filter out evaluations where employee doesn't match department
    const departmentEvaluations = evaluations.filter(evaluation => evaluation.employee);

    // Initialize department data structure
    const departmentData = {
      categories: department === 'foh' ? {
        'Front of House': 0,
        'Speed of Service': 0,
        'Order Accuracy': 0,
        'Cleanliness': 0,
        'Team Collaboration': 0
      } : {
        'Back of House': 0,
        'Food Quality': 0,
        'Kitchen Efficiency': 0,
        'Cleanliness': 0,
        'Team Collaboration': 0
      },
      topPerformers: [],
      improvementAreas: []
    };

    // Process evaluations to calculate metrics
    if (departmentEvaluations.length > 0) {
      // Calculate category averages
      const categoryScores = {};
      departmentEvaluations.forEach(evaluation => {
        // Convert managerEvaluation Map to object and process scores
        const scores = evaluation.managerEvaluation instanceof Map
          ? Object.fromEntries(evaluation.managerEvaluation)
          : evaluation.managerEvaluation;

        // Group scores by category from template
        evaluation.template.sections.forEach((section, sectionIndex) => {
          section.questions.forEach((question, questionIndex) => {
            const key = `${sectionIndex}-${questionIndex}`;
            const score = scores[key];
            if (typeof score === 'number') {
              if (!categoryScores[section.title]) {
                categoryScores[section.title] = [];
              }
              categoryScores[section.title].push(score);
            }
          });
        });
      });

      // Calculate averages for each category
      Object.keys(departmentData.categories).forEach(category => {
        if (categoryScores[category] && categoryScores[category].length > 0) {
          const avg = categoryScores[category].reduce((a, b) => a + b, 0) / categoryScores[category].length;
          departmentData.categories[category] = Number(avg.toFixed(2));
        }
      });

      // Calculate top performers
      const userScores = {};
      departmentEvaluations.forEach(evaluation => {
        const scores = evaluation.managerEvaluation instanceof Map
          ? Object.fromEntries(evaluation.managerEvaluation)
          : evaluation.managerEvaluation;

        let totalScore = 0;
        let totalQuestions = 0;

        evaluation.template.sections.forEach((section, sectionIndex) => {
          section.questions.forEach((question, questionIndex) => {
            const key = `${sectionIndex}-${questionIndex}`;
            const score = scores[key];
            if (typeof score === 'number') {
              totalScore += score;
              totalQuestions++;
            }
          });
        });

        const avgScore = totalQuestions > 0 ? totalScore / totalQuestions : 0;

        if (!userScores[evaluation.employee._id]) {
          userScores[evaluation.employee._id] = {
            id: evaluation.employee._id,
            name: evaluation.employee.name,
            position: evaluation.employee.position,
            scores: []
          };
        }
        userScores[evaluation.employee._id].scores.push(avgScore);
      });

      departmentData.topPerformers = Object.values(userScores)
        .map(user => ({
          id: user.id,
          name: user.name,
          position: user.position,
          score: Number((user.scores.reduce((a, b) => a + b, 0) / user.scores.length).toFixed(2)),
          improvement: 0 // We'll calculate this in a moment
        }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 5);

      // Calculate improvement percentages by comparing with previous evaluations
      const previousStartDate = new Date(startDate);
      previousStartDate.setMonth(previousStartDate.getMonth() - 1);

      const previousEvaluations = await Evaluation.find({
        store: req.user.store._id,
        status: 'completed',
        completedDate: { $gte: previousStartDate, $lt: startDate }
      })
      .populate({
        path: 'employee',
        match: { departments: { $in: departmentMap[department] } }
      })
      .populate('template');

      const previousUserScores = {};
      previousEvaluations.filter(e => e.employee).forEach(evaluation => {
        const scores = evaluation.managerEvaluation instanceof Map
          ? Object.fromEntries(evaluation.managerEvaluation)
          : evaluation.managerEvaluation;

        let totalScore = 0;
        let totalQuestions = 0;

        evaluation.template.sections.forEach((section, sectionIndex) => {
          section.questions.forEach((question, questionIndex) => {
            const key = `${sectionIndex}-${questionIndex}`;
            const score = scores[key];
            if (typeof score === 'number') {
              totalScore += score;
              totalQuestions++;
            }
          });
        });

        const avgScore = totalQuestions > 0 ? totalScore / totalQuestions : 0;

        if (!previousUserScores[evaluation.employee._id]) {
          previousUserScores[evaluation.employee._id] = [];
        }
        previousUserScores[evaluation.employee._id].push(avgScore);
      });

      // Update improvement percentages
      departmentData.topPerformers = departmentData.topPerformers.map(performer => {
        const previousScores = previousUserScores[performer.id];
        if (previousScores && previousScores.length > 0) {
          const previousAvg = previousScores.reduce((a, b) => a + b, 0) / previousScores.length;
          const improvement = ((performer.score - previousAvg) / previousAvg) * 100;
          return {
            ...performer,
            improvement: Number(improvement.toFixed(1))
          };
        }
        return performer;
      });

      // Calculate improvement areas
      const categoryTrends = Object.entries(departmentData.categories)
        .map(([category, score]) => ({
          category,
          score,
          trend: score < 3.5 ? 'down' : score < 4 ? 'stable' : 'up'
        }))
        .filter(area => area.score < 4)
        .sort((a, b) => a.score - b.score);

      departmentData.improvementAreas = categoryTrends.slice(0, 3);
    }

    res.json({ [department]: departmentData });
  } catch (error) {
    console.error('Error fetching department analytics:', error);
    res.status(500).json({ message: 'Failed to fetch department analytics' });
  }
});

// Get development metrics
router.get('/development', auth, async (req, res) => {
  try {
    const { employeeId, timeframe = 'quarter' } = req.query;

    // Calculate date range based on timeframe
    const startDate = new Date();
    switch (timeframe) {
      case 'month':
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case 'quarter':
        startDate.setMonth(startDate.getMonth() - 3);
        break;
      case 'year':
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
      default:
        startDate.setMonth(startDate.getMonth() - 3); // Default to quarter
    }

    // Build query for users
    const userQuery = { store: req.user.store._id };
    if (employeeId !== 'all') {
      if (employeeId === 'active') {
        userQuery.status = 'active';
      } else if (employeeId === 'new') {
        userQuery.startDate = { $gte: startDate };
      }
    }

    // Get evaluations for the time period
    const evaluations = await Evaluation.find({
      store: req.user.store._id,
      status: 'completed',
      completedDate: { $gte: startDate }
    }).populate('employee template');

    // Initialize response data structure
    const developmentData = {
      leadershipMetrics: [
        { trait: 'Communication', current: 0, previous: 0, focus: 'Improve team meetings' },
        { trait: 'Initiative', current: 0, previous: 0, focus: 'Take on new projects' },
        { trait: 'Teamwork', current: 0, previous: 0, focus: 'Collaborate more effectively' },
        { trait: 'Problem Solving', current: 0, previous: 0, focus: 'Handle challenges independently' },
        { trait: 'Reliability', current: 0, previous: 0, focus: 'Consistent performance' }
      ],
      softSkills: [
        {
          name: 'Front of House',
          description: 'Ability to handle guest interactions effectively',
          level: 0,
          recentAchievement: 'Improved guest satisfaction scores',
          nextGoal: 'Achieve consistent 5-star ratings'
        },
        {
          name: 'Back of House',
          description: 'Efficient handling of tasks and responsibilities',
          level: 0,
          recentAchievement: 'Reduced order preparation time',
          nextGoal: 'Optimize multitasking efficiency'
        }
      ],
      crossTraining: [
        {
          role: 'Front Counter',
          level: 0,
          lastTrained: new Date().toISOString(),
          nextStep: 'Advanced customer service training'
        },
        {
          role: 'Drive-Thru',
          level: 0,
          lastTrained: new Date().toISOString(),
          nextStep: 'Speed of service optimization'
        }
      ],
      personalGoals: []
    };

    // Process evaluations to calculate metrics
    if (evaluations.length > 0) {
      // Calculate leadership metrics
      const leadershipScores = {};
      evaluations.forEach(evaluation => {
        const scores = evaluation.managerEvaluation instanceof Map
          ? Object.fromEntries(evaluation.managerEvaluation)
          : evaluation.managerEvaluation;

        evaluation.template.sections.forEach((section, sectionIndex) => {
          section.questions.forEach((question, questionIndex) => {
            const key = `${sectionIndex}-${questionIndex}`;
            const score = scores[key];
            if (typeof score === 'number') {
              const metric = developmentData.leadershipMetrics.find(m =>
                section.title.toLowerCase().includes(m.trait.toLowerCase())
              );
              if (metric) {
                if (!leadershipScores[metric.trait]) {
                  leadershipScores[metric.trait] = [];
                }
                leadershipScores[metric.trait].push(score);
              }
            }
          });
        });
      });

      // Calculate averages for leadership metrics
      developmentData.leadershipMetrics = developmentData.leadershipMetrics.map(metric => ({
        ...metric,
        current: leadershipScores[metric.trait]?.length > 0
          ? Number((leadershipScores[metric.trait].reduce((a, b) => a + b, 0) / leadershipScores[metric.trait].length).toFixed(2))
          : 0,
        previous: Math.max(0, Math.min(5, Math.random() * 5)) // Placeholder - should be calculated from historical data
      }));

      // Calculate soft skills levels
      const softSkillScores = {};
      evaluations.forEach(evaluation => {
        const scores = evaluation.managerEvaluation instanceof Map
          ? Object.fromEntries(evaluation.managerEvaluation)
          : evaluation.managerEvaluation;

        evaluation.template.sections.forEach((section, sectionIndex) => {
          section.questions.forEach((question, questionIndex) => {
            const key = `${sectionIndex}-${questionIndex}`;
            const score = scores[key];
            if (typeof score === 'number') {
              const skill = developmentData.softSkills.find(s =>
                section.title.toLowerCase().includes(s.name.toLowerCase())
              );
              if (skill) {
                if (!softSkillScores[skill.name]) {
                  softSkillScores[skill.name] = [];
                }
                softSkillScores[skill.name].push(score);
              }
            }
          });
        });
      });

      // Calculate averages for soft skills
      developmentData.softSkills = developmentData.softSkills.map(skill => ({
        ...skill,
        level: softSkillScores[skill.name]?.length > 0
          ? Math.round(softSkillScores[skill.name].reduce((a, b) => a + b, 0) / softSkillScores[skill.name].length)
          : Math.floor(Math.random() * 5) + 1 // Fallback to random if no scores
      }));

      // Calculate cross-training levels
      developmentData.crossTraining = developmentData.crossTraining.map(training => ({
        ...training,
        level: Math.floor(Math.random() * 5) + 1 // Placeholder - should be calculated from actual training records
      }));

      // Add some sample personal goals
      developmentData.personalGoals = [
        {
          id: '1',
          title: 'Customer Service Excellence',
          description: 'Improve guest satisfaction scores',
          status: 'In Progress',
          progress: 75,
          targetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          milestones: [
            { id: '1-1', description: 'Complete advanced service training', completed: true },
            { id: '1-2', description: 'Achieve 90% satisfaction rate', completed: false }
          ]
        },
        {
          id: '2',
          title: 'Leadership Development',
          description: 'Prepare for team leader role',
          status: 'In Progress',
          progress: 40,
          targetDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
          milestones: [
            { id: '2-1', description: 'Complete leadership training', completed: true },
            { id: '2-2', description: 'Lead 5 team meetings', completed: false }
          ]
        }
      ];
    }

    res.json(developmentData);
  } catch (error) {
    console.error('Error fetching development metrics:', error);
    res.status(500).json({ message: 'Failed to fetch development metrics' });
  }
});

// Performance Analytics Endpoint
router.get('/performance', auth, async (req, res) => {
  try {
    const { timeframe = 'month', department = 'all', shift = 'all' } = req.query;

    // Calculate date range based on timeframe
    const endDate = new Date();
    let startDate = new Date();

    switch (timeframe) {
      case 'week':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case 'quarter':
        startDate.setMonth(startDate.getMonth() - 3);
        break;
      case 'year':
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
    }

    // Map department to array of specific departments
    const departmentMap = {
      'foh': ['Front Counter', 'Drive Thru'],
      'boh': ['Kitchen'],
      'all': ['Front Counter', 'Drive Thru', 'Kitchen', 'Everything']
    };

    // Build base query
    const baseQuery = {
      createdAt: { $gte: startDate, $lte: endDate },
      status: 'completed'
    };

    // Add department filter if specified
    if (department !== 'all') {
      baseQuery['employee.departments'] = { $in: departmentMap[department] };
    }

    // Add shift filter if specified
    if (shift !== 'all') {
      baseQuery.shift = shift;
    }

    // Fetch evaluations
    const evaluations = await Evaluation.find(baseQuery)
      .populate('employee')
      .populate('template')
      .lean();

    if (!evaluations.length) {
      return res.json({
        averages: {
          overall: 0,
          foh: 0,
          boh: 0,
          dayShift: 0,
          nightShift: 0
        },
        departmentComparison: [],
        shiftComparison: []
      });
    }

    // Calculate averages
    let scores = {
      overall: [],
      foh: [],
      boh: [],
      dayShift: [],
      nightShift: []
    };

    // Process evaluations for averages
    evaluations.forEach(evaluation => {
      const score = evaluation.finalScore || 0;
      scores.overall.push(score);

      // Check if employee has any FOH departments
      if (evaluation.employee?.departments?.some(d => departmentMap['foh'].includes(d))) {
        scores.foh.push(score);
      }
      // Check if employee has any BOH departments
      if (evaluation.employee?.departments?.some(d => departmentMap['boh'].includes(d))) {
        scores.boh.push(score);
      }

      if (evaluation.shift === 'day') {
        scores.dayShift.push(score);
      } else if (evaluation.shift === 'night') {
        scores.nightShift.push(score);
      }
    });

    // Calculate average for each category
    const calculateAverage = arr => arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;

    const averages = {
      overall: calculateAverage(scores.overall),
      foh: calculateAverage(scores.foh),
      boh: calculateAverage(scores.boh),
      dayShift: calculateAverage(scores.dayShift),
      nightShift: calculateAverage(scores.nightShift)
    };

    // Calculate department comparison by criteria
    const departmentComparison = [];
    const criteriaScores = {};

    evaluations.forEach(evaluation => {
      const scores = evaluation.managerEvaluation instanceof Map
        ? Object.fromEntries(evaluation.managerEvaluation)
        : evaluation.managerEvaluation;

      evaluation.template.sections.forEach((section, sectionIndex) => {
        section.questions.forEach((question, questionIndex) => {
          const key = `${sectionIndex}-${questionIndex}`;
          const score = scores[key];
          if (typeof score === 'number') {
            if (!criteriaScores[section.title]) {
              criteriaScores[section.title] = { foh: [], boh: [] };
            }

            // Check if employee has any FOH departments
            if (evaluation.employee?.departments?.some(d => departmentMap['foh'].includes(d))) {
              criteriaScores[section.title].foh.push(score);
            }
            // Check if employee has any BOH departments
            if (evaluation.employee?.departments?.some(d => departmentMap['boh'].includes(d))) {
              criteriaScores[section.title].boh.push(score);
            }
          }
        });
      });
    });

    Object.entries(criteriaScores).forEach(([criterion, scores]) => {
      departmentComparison.push({
        category: criterion,
        foh: calculateAverage(scores.foh),
        boh: calculateAverage(scores.boh)
      });
    });

    // Calculate shift comparison over time
    const shiftComparison = [];
    const dateScores = {};

    evaluations.forEach(evaluation => {
      const date = evaluation.createdAt.toISOString().split('T')[0];
      if (!dateScores[date]) {
        dateScores[date] = { day: [], night: [] };
      }

      if (evaluation.shift === 'day') {
        dateScores[date].day.push(evaluation.finalScore);
      } else if (evaluation.shift === 'night') {
        dateScores[date].night.push(evaluation.finalScore);
      }
    });

    Object.entries(dateScores)
      .sort(([dateA], [dateB]) => new Date(dateA) - new Date(dateB))
      .forEach(([date, scores]) => {
        shiftComparison.push({
          date,
          dayShift: calculateAverage(scores.day),
          nightShift: calculateAverage(scores.night)
        });
      });

    res.json({
      averages,
      departmentComparison,
      shiftComparison
    });

  } catch (error) {
    console.error('Error fetching performance analytics:', error);
    res.status(500).json({ message: 'Failed to fetch performance analytics' });
  }
});

// Team Dynamics Analytics Endpoint
router.get('/team-dynamics', auth, async (req, res) => {
  try {
    const { shift = 'all', timeframe = 'month' } = req.query;

    // Calculate date range based on timeframe
    const endDate = new Date();
    let startDate = new Date();

    switch (timeframe) {
      case 'week':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case 'quarter':
        startDate.setMonth(startDate.getMonth() - 3);
        break;
      case 'year':
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
    }

    // Build base query
    const baseQuery = {
      store: req.user.store._id,
      createdAt: { $gte: startDate, $lte: endDate },
      status: 'completed'
    };

    // Add shift filter if specified
    if (shift !== 'all') {
      baseQuery.shift = shift;
    }

    // Fetch evaluations
    const evaluations = await Evaluation.find(baseQuery)
      .populate('employee')
      .populate('template')
      .lean();

    if (!evaluations.length) {
      return res.json({
        cohesionMetrics: [],
        communicationMetrics: [],
        shiftTeams: [],
        mentorships: []
      });
    }

    // Calculate cohesion metrics
    const cohesionMetrics = [
      { attribute: 'Teamwork', score: 0, insight: 'Team collaboration effectiveness' },
      { attribute: 'Communication', score: 0, insight: 'Information flow and clarity' },
      { attribute: 'Support', score: 0, insight: 'Mutual assistance and backup' },
      { attribute: 'Efficiency', score: 0, insight: 'Task coordination and completion' },
      { attribute: 'Morale', score: 0, insight: 'Team spirit and motivation' }
    ];

    // Process evaluations for cohesion metrics
    evaluations.forEach(evaluation => {
      const scores = evaluation.managerEvaluation instanceof Map
        ? Object.fromEntries(evaluation.managerEvaluation)
        : evaluation.managerEvaluation;

      evaluation.template.sections.forEach((section, sectionIndex) => {
        section.questions.forEach((question, questionIndex) => {
          const key = `${sectionIndex}-${questionIndex}`;
          const score = scores[key];
          if (typeof score === 'number') {
            const metric = cohesionMetrics.find(m => section.title.toLowerCase().includes(m.attribute.toLowerCase()));
            if (metric) {
              metric.score = metric.score === 0 ? score : (metric.score + score) / 2;
            }
          }
        });
      });
    });

    // Calculate communication metrics
    const communicationMetrics = [
      {
        type: 'Team Meetings',
        description: 'Effectiveness of team discussions',
        score: 0,
        feedback: 'Regular team meetings help align goals'
      },
      {
        type: 'Shift Handover',
        description: 'Information transfer between shifts',
        score: 0,
        feedback: 'Clear communication during shift changes'
      },
      {
        type: 'Guest Communication',
        description: 'Interaction with customers',
        score: 0,
        feedback: 'Professional and friendly guest service'
      }
    ];

    // Process evaluations for communication metrics
    evaluations.forEach(evaluation => {
      const scores = evaluation.managerEvaluation instanceof Map
        ? Object.fromEntries(evaluation.managerEvaluation)
        : evaluation.managerEvaluation;

      evaluation.template.sections.forEach((section, sectionIndex) => {
        section.questions.forEach((question, questionIndex) => {
          const key = `${sectionIndex}-${questionIndex}`;
          const score = scores[key];
          if (typeof score === 'number') {
            const metric = communicationMetrics.find(m => section.title.toLowerCase().includes(m.type.toLowerCase()));
            if (metric) {
              metric.score = metric.score === 0 ? score : (metric.score + score) / 2;
            }
          }
        });
      });
    });

    // Calculate shift team metrics
    const shiftTeams = [];
    const shifts = ['Morning', 'Afternoon', 'Evening'];

    shifts.forEach(shiftName => {
      const shiftEvals = evaluations.filter(evaluation =>
        evaluation.shift?.toLowerCase() === shiftName.toLowerCase()
      );

      if (shiftEvals.length) {
        const teamMetrics = {
          id: shiftName.toLowerCase(),
          name: `${shiftName} Shift`,
          teamwork: 0,
          efficiency: 0,
          morale: 0,
          highlights: [],
          improvements: []
        };

        shiftEvals.forEach(evaluation => {
          const scores = evaluation.managerEvaluation instanceof Map
            ? Object.fromEntries(evaluation.managerEvaluation)
            : evaluation.managerEvaluation;

          evaluation.template.sections.forEach((section, sectionIndex) => {
            section.questions.forEach((question, questionIndex) => {
              const key = `${sectionIndex}-${questionIndex}`;
              const score = scores[key];
              if (typeof score === 'number') {
                if (section.title.toLowerCase().includes('teamwork')) {
                  teamMetrics.teamwork += score;
                } else if (section.title.toLowerCase().includes('efficiency')) {
                  teamMetrics.efficiency += score;
                } else if (section.title.toLowerCase().includes('morale')) {
                  teamMetrics.morale += score;
                }
              }
            });
          });
        });

        // Calculate averages
        const evaluationCount = shiftEvals.length;
        teamMetrics.teamwork = Math.round((teamMetrics.teamwork / evaluationCount) * 20);
        teamMetrics.efficiency = Math.round((teamMetrics.efficiency / evaluationCount) * 20);
        teamMetrics.morale = Math.round((teamMetrics.morale / evaluationCount) * 20);

        // Add highlights and improvements based on scores
        if (teamMetrics.teamwork >= 80) {
          teamMetrics.highlights.push('Strong team collaboration');
        } else {
          teamMetrics.improvements.push('Focus on team building activities');
        }

        if (teamMetrics.efficiency >= 80) {
          teamMetrics.highlights.push('Excellent operational efficiency');
        } else {
          teamMetrics.improvements.push('Optimize workflow processes');
        }

        shiftTeams.push(teamMetrics);
      }
    });

    // Get active mentorship relationships
    const mentorships = await Goal.find({
      store: req.user.store._id,
      type: 'mentorship',
      status: { $in: ['active', 'completed'] }
    })
    .populate('assignedTo')
    .populate('assignedBy')
    .lean();

    const mentorshipData = mentorships.map(mentorship => ({
      id: mentorship._id.toString(),
      mentor: mentorship.assignedBy.name,
      mentee: mentorship.assignedTo.name,
      startDate: mentorship.startDate,
      status: mentorship.status === 'active' ? 'Active' : 'Completed',
      goalsCompleted: mentorship.completedMilestones?.length || 0,
      totalGoals: mentorship.milestones?.length || 0,
      achievements: mentorship.achievements || []
    }));

    res.json({
      cohesionMetrics,
      communicationMetrics,
      shiftTeams,
      mentorships: mentorshipData
    });

  } catch (error) {
    console.error('Error fetching team dynamics:', error);
    res.status(500).json({ message: 'Failed to fetch team dynamics data' });
  }
});

// Team Analytics Endpoint
router.get('/team', auth, async (req, res) => {
  try {
    const { timeframe = 'month', sortBy = 'score', position = 'all' } = req.query;

    // Calculate date range
    const endDate = new Date();
    let startDate = new Date();
    switch (timeframe) {
      case 'week': startDate.setDate(startDate.getDate() - 7); break;
      case 'month': startDate.setMonth(startDate.getMonth() - 1); break;
      case 'quarter': startDate.setMonth(startDate.getMonth() - 3); break;
      case 'year': startDate.setFullYear(startDate.getFullYear() - 1); break;
    }

    // Build query
    const query = {
      store: req.user.store._id,
      status: 'completed',
      createdAt: { $gte: startDate, $lte: endDate }
    };

    // Fetch evaluations with populated employee data
    const evaluations = await Evaluation.find(query)
      .populate('employee')
      .lean();

    // Process evaluations into team member data
    const memberMap = new Map();
    evaluations.forEach(evaluation => {
      if (!evaluation.employee) return;

      const { _id, name, position } = evaluation.employee;
      if (position === 'all' || position.toLowerCase() === position.toLowerCase()) {
        if (!memberMap.has(_id)) {
          memberMap.set(_id, {
            id: _id,
            name,
            position,
            score: 0,
            improvement: 0,
            categories: {},
            recentEvaluations: []
          });
        }

        const member = memberMap.get(_id);
        const scores = Object.fromEntries(evaluation.managerEvaluation);

        // Update categories
        Object.entries(scores).forEach(([category, score]) => {
          if (!member.categories[category]) {
            member.categories[category] = score;
          } else {
            member.categories[category] = (member.categories[category] + score) / 2;
          }
        });

        // Add to recent evaluations
        member.recentEvaluations.push({
          id: evaluation._id.toString(),
          date: evaluation.createdAt,
          score: evaluation.finalScore
        });

        // Update overall score
        member.score = Object.values(member.categories).reduce((a, b) => a + b, 0) /
                      Object.values(member.categories).length;
      }
    });

    // Convert to array and sort
    let members = Array.from(memberMap.values());

    switch (sortBy) {
      case 'score':
        members.sort((a, b) => b.score - a.score);
        break;
      case 'improvement':
        members.sort((a, b) => b.improvement - a.improvement);
        break;
      case 'name':
        members.sort((a, b) => a.name.localeCompare(b.name));
        break;
    }

    res.json({ members });
  } catch (error) {
    console.error('Error fetching team analytics:', error);
    res.status(500).json({ message: 'Failed to fetch team analytics' });
  }
});

// Helper function to get rating value
const getRatingValue = (rating, gradingScale) => {
  if (!rating) return 0;
  if (typeof rating === 'number') return rating;

  // If the rating is a numeric string, convert it to a number
  const numericValue = Number(rating);
  if (!isNaN(numericValue)) return numericValue;

  const normalizedRating = rating.toLowerCase().trim();

  // Handle Hearts and Hands specific ratings first
  const heartsHandsMap = {
    '- improvement needed': 1,
    '- improvment needed': 1, // Handle typo
    '- performer': 2,
    '- valued': 3,
    '- star': 4
  };

  // Check Hearts and Hands mapping first
  if (heartsHandsMap[normalizedRating]) {
    return heartsHandsMap[normalizedRating];
  }

  // If we have a grading scale with grades, find the grade by label
  if (gradingScale && gradingScale.grades && Array.isArray(gradingScale.grades)) {
    // Try to find by exact label match first
    const grade = gradingScale.grades.find(g => {
      const gradeLabelLower = g.label.toLowerCase();
      return normalizedRating.includes(gradeLabelLower) ||
             normalizedRating.includes(`- ${gradeLabelLower}`) ||
             gradeLabelLower === normalizedRating.replace('- ', '');
    });

    // Return the grade's value if found
    if (grade) {
      return grade.value;
    }
  }

  return 0;
};

// Team Member Scores Endpoint
router.get('/team-scores', auth, async (req, res) => {
  try {
    // Get all completed evaluations
    const evaluations = await Evaluation.find({
      store: req.user.store._id,
      status: 'completed'
    })
    .populate('employee')
    .populate({
      path: 'template',
      populate: {
        path: 'sections.criteria.gradingScale',
        model: 'GradingScale'
      }
    })
    .sort({ completedDate: -1 });

    // Get default grading scale
    const defaultScale = await GradingScale.findOne({
      store: req.user.store._id,
      isDefault: true,
      isActive: true
    });

    // Group evaluations by employee and calculate scores
    const teamScores = {};

    evaluations.forEach(evaluation => {
      if (!evaluation.employee) return;

      const employeeId = evaluation.employee._id.toString();
      const scores = evaluation.managerEvaluation instanceof Map
        ? Object.fromEntries(evaluation.managerEvaluation)
        : evaluation.managerEvaluation;

      if (!scores || !evaluation.template) return;

      let totalScore = 0;
      let totalPossible = 0;

      // Calculate total score by iterating through template sections and questions
      evaluation.template.sections.forEach((section, sectionIndex) => {
        section.criteria.forEach((criterion, questionIndex) => {
          const key = `${sectionIndex}-${questionIndex}`;
          const score = scores[key];
          const scale = criterion.gradingScale || defaultScale;

          if (score !== undefined && scale) {
            const numericScore = getRatingValue(score, scale);
            totalScore += numericScore;

            // Handle different scale types
            if (scale.grades && Array.isArray(scale.grades) && scale.grades.length > 0) {
              totalPossible += Math.max(...scale.grades.map(g => g.value));
            } else {
              // For Hearts and Hands or other scales without grades array, use 4 as max
              totalPossible += 4;
            }
          }
        });
      });

      if (!teamScores[employeeId]) {
        // Map departments array to primary department
        let primaryDepartment = 'N/A';
        if (evaluation.employee.departments && evaluation.employee.departments.length > 0) {
          // Map specific departments to FOH/BOH
          const fohDepartments = ['Front Counter', 'Drive Thru'];
          const bohDepartments = ['Kitchen'];

          // Check if user has departments from both FOH and BOH
          const hasFOH = evaluation.employee.departments.some(dept => fohDepartments.includes(dept));
          const hasBOH = evaluation.employee.departments.some(dept => bohDepartments.includes(dept));

          if (evaluation.employee.departments.includes('Everything')) {
            primaryDepartment = 'All Departments';
          } else if (hasFOH && hasBOH) {
            primaryDepartment = 'FOH/BOH';
          } else if (hasFOH) {
            primaryDepartment = 'FOH';
          } else if (hasBOH) {
            primaryDepartment = 'BOH';
          } else {
            // If no standard mappings found, join all departments
            primaryDepartment = evaluation.employee.departments.join(', ');
          }
        }

        teamScores[employeeId] = {
          id: employeeId,
          name: evaluation.employee.name,
          position: evaluation.employee.position,
          department: primaryDepartment,
          evaluations: []
        };
      }

      teamScores[employeeId].evaluations.push({
        score: totalScore,
        totalPossible: totalPossible,
        date: evaluation.completedDate
      });
    });

    // Calculate overall averages and format response
    const teamMembers = Object.values(teamScores).map(member => {
      const totalScore = member.evaluations.reduce((sum, evaluation) => sum + evaluation.score, 0);
      const totalPossible = member.evaluations.reduce((sum, evaluation) => sum + evaluation.totalPossible, 0);
      const averagePercentage = totalPossible > 0 ? (totalScore / totalPossible) * 100 : 0;

      const recentEval = member.evaluations[0];
      const recentScore = recentEval ? Number(((recentEval.score / recentEval.totalPossible) * 100).toFixed(2)) : 0;

      return {
        id: member.id,
        name: member.name,
        position: member.position,
        department: member.department,
        averageScore: Number(averagePercentage.toFixed(2)),
        numberOfEvaluations: member.evaluations.length,
        recentScore: recentScore,
        recentPoints: recentEval ? `${recentEval.score}/${recentEval.totalPossible}` : null,
        recentEvaluationDate: recentEval ? recentEval.date : null
      };
    });

    res.json({ teamMembers });
  } catch (error) {
    console.error('Error fetching team member scores:', error);
    res.status(500).json({ message: 'Failed to fetch team member scores' });
  }
});

// Performance Trends Endpoint
router.get('/performance-trends', auth, async (req, res) => {
  try {
    // Get evaluations from the last 6 months
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 6); // Last 6 months

    const evaluations = await Evaluation.find({
      store: req.user.store._id,
      status: 'completed',
      completedDate: { $gte: startDate, $lte: endDate }
    })
    .populate('employee')
    .populate({
      path: 'template',
      populate: {
        path: 'sections.criteria.gradingScale',
        model: 'GradingScale'
      }
    })
    .sort({ completedDate: -1 }); // Sort by most recent first

    // Get default grading scale
    const defaultScale = await GradingScale.findOne({
      store: req.user.store._id,
      isDefault: true,
      isActive: true
    });

    // Group evaluations by month
    const months = {};
    const fohDepartments = ['Front Counter', 'Drive Thru'];
    const bohDepartments = ['Kitchen'];

    evaluations.forEach(evaluation => {
      if (!evaluation.employee?.departments) {
        return;
      }

      const evalDate = new Date(evaluation.completedDate);
      // Get month
      const year = evalDate.getFullYear();
      const month = evalDate.getMonth() + 1; // JavaScript months are 0-indexed
      const monthKey = `${year}-${month.toString().padStart(2, '0')}`; // Format: YYYY-MM

      if (!months[monthKey]) {
        months[monthKey] = {
          FOH: { total: 0, count: 0, totalPossible: 0 },
          BOH: { total: 0, count: 0, totalPossible: 0 }
        };
      }

      // Calculate evaluation score
      let totalScore = 0;
      let totalPossible = 0;

      const managerEvaluation = evaluation.managerEvaluation instanceof Map
        ? Object.fromEntries(evaluation.managerEvaluation)
        : evaluation.managerEvaluation;

      evaluation.template.sections.forEach((section, sectionIndex) => {
        section.criteria.forEach((criterion, questionIndex) => {
          const key = `${sectionIndex}-${questionIndex}`;
          const score = managerEvaluation[key];
          const scale = criterion.gradingScale || defaultScale;

          if (score !== undefined && scale) {
            const numericScore = getRatingValue(score, scale);
            totalScore += numericScore;

            // Handle different scale types
            if (scale.grades && Array.isArray(scale.grades) && scale.grades.length > 0) {
              totalPossible += Math.max(...scale.grades.map(g => g.value));
            } else {
              // For Hearts and Hands or other scales without grades array, use 4 as max
              totalPossible += 4;
            }
          }
        });
      });

      // Determine if employee is FOH or BOH based on departments
      const isFOH = evaluation.employee.departments.some(dept => fohDepartments.includes(dept));
      const isBOH = evaluation.employee.departments.some(dept => bohDepartments.includes(dept));

      if (isFOH) {
        months[monthKey].FOH.total += totalScore;
        months[monthKey].FOH.totalPossible += totalPossible;
        months[monthKey].FOH.count++;
      }
      if (isBOH) {
        months[monthKey].BOH.total += totalScore;
        months[monthKey].BOH.totalPossible += totalPossible;
        months[monthKey].BOH.count++;
      }
    });

    // Convert to array and sort by month
    const sortedMonths = Object.entries(months)
      .sort(([a], [b]) => {
        // Compare dates directly since they're in YYYY-MM format
        return b.localeCompare(a); // Sort in descending order (most recent first)
      })
      .slice(0, 6); // Get last 6 months

    // Format response
    const performanceTrends = sortedMonths.map(([monthKey, scores], index) => {
      // Parse the month key to get a more readable format
      const [year, month] = monthKey.split('-');
      // Format the month name
      const date = new Date(parseInt(year), parseInt(month) - 1, 1);
      const monthName = date.toLocaleString('en-US', { month: 'short', year: 'numeric' });

      return {
        name: monthName,
        FOH: scores.FOH.count > 0
          ? Number(((scores.FOH.total / scores.FOH.totalPossible) * 100).toFixed(1))
          : null,
        BOH: scores.BOH.count > 0
          ? Number(((scores.BOH.total / scores.BOH.totalPossible) * 100).toFixed(1))
          : null,
        // Add additional context data
        evaluationCount: scores.FOH.count + scores.BOH.count,
        fohCount: scores.FOH.count,
        bohCount: scores.BOH.count
      };
    }).reverse(); // Reverse so oldest month is first

    res.json({ performanceTrends });
  } catch (error) {
    console.error('Error fetching performance trends:', error);
    res.status(500).json({ message: 'Failed to fetch performance trends' });
  }
});



router.get('/shift-comparison', auth, async (req, res) => {
  try {
    const { timeframe = 'month', store, template, position } = req.query;
    const storeId = store || req.user.store._id;

    // Get the date range based on timeframe
    const endDate = new Date();
    const startDate = new Date();
    switch (timeframe) {
      case 'week':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case 'quarter':
        startDate.setMonth(startDate.getMonth() - 3);
        break;
      case 'year':
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
      default:
        startDate.setMonth(startDate.getMonth() - 1);
    }

    // Get ALL active employees for the store
    const allEmployees = await User.find({
      store: storeId,
      status: 'active'
    }).select('_id name position shift');

    // Build evaluation query with filters
    const evaluationQuery = {
      store: storeId,
      completedDate: { $gte: startDate, $lte: endDate },
      status: 'completed'
    };

    // Add template filter if specified
    if (template) {
      evaluationQuery.template = template;
    }

    // Get ALL completed evaluations for the store within the timeframe
    const allEvaluations = await Evaluation.find(evaluationQuery).populate({
      path: 'employee',
      select: 'name position shift departments'
    }).populate({
      path: 'template',
      populate: {
        path: 'sections.criteria.gradingScale',
        model: 'GradingScale'
      }
    });

    // Get default grading scale
    const defaultScale = await GradingScale.findOne({
      store: storeId,
      isDefault: true,
      isActive: true
    });

    // Initialize metrics and employee score tracking by shift and department
    const dayShiftScores = new Map(); // Use Map to avoid duplicates
    const nightShiftScores = new Map();
    const metrics = {};
    const departmentMetrics = {
      'Front Counter': { day: [], night: [] },
      'Drive Thru': { day: [], night: [] },
      'Kitchen': { day: [], night: [] }
    };

    // Process ALL evaluations and categorize by employee shift
    allEvaluations.forEach(evaluation => {
      if (!evaluation.employee) return;

      const employee = evaluation.employee;

      // Apply position filter if specified
      if (position && employee.position !== position) {
        return; // Skip this evaluation if position doesn't match
      }

      const employeeShift = employee.shift || 'day'; // Default to day if no shift specified

      const scores = evaluation.managerEvaluation instanceof Map
        ? Object.fromEntries(evaluation.managerEvaluation)
        : evaluation.managerEvaluation;

      let totalScore = 0;
      let totalPossible = 0;

      evaluation.template.sections.forEach((section, sectionIndex) => {
        section.criteria.forEach((criterion, criterionIndex) => {
          const key = `${sectionIndex}-${criterionIndex}`;
          const score = scores[key];
          const scale = criterion.gradingScale || defaultScale;

          if (score !== undefined && scale) {
            const numericScore = getRatingValue(score, scale);
            totalScore += numericScore;

            // Handle different scale types
            if (scale.grades && Array.isArray(scale.grades) && scale.grades.length > 0) {
              totalPossible += Math.max(...scale.grades.map(g => g.value));
            } else {
              // For Hearts and Hands or other scales without grades array, use 4 as max
              totalPossible += 4;
            }

            // Add to category metrics - convert to percentage
            if (!metrics[section.title]) {
              metrics[section.title] = { day: [], night: [] };
            }

            // Calculate the max possible score for this criterion
            const maxPossible = scale.grades && Array.isArray(scale.grades) && scale.grades.length > 0
              ? Math.max(...scale.grades.map(g => g.value))
              : 4; // For Hearts and Hands or other scales without grades array

            const percentageScore = (numericScore / maxPossible) * 100;

            if (employeeShift === 'day') {
              metrics[section.title].day.push(percentageScore);
            } else if (employeeShift === 'night') {
              metrics[section.title].night.push(percentageScore);
            }
          }
        });
      });

      if (totalPossible > 0) {
        const avgScore = (totalScore / totalPossible) * 100;
        const employeeId = employee._id.toString();
        const targetMap = employeeShift === 'day' ? dayShiftScores : nightShiftScores;

        // Get employee department for department-specific metrics
        let employeeDepartment = 'Front Counter'; // Default

        if (employee.departments && employee.departments.length > 0) {
          // Use the first department if multiple are assigned
          employeeDepartment = employee.departments[0];
        } else {
          // Fallback: try to determine from position name or create variety for testing
          const positionLower = employee.position ? employee.position.toLowerCase() : '';
          const nameLower = employee.name ? employee.name.toLowerCase() : '';

          if (positionLower.includes('kitchen') || positionLower.includes('cook') || positionLower.includes('prep') || nameLower.includes('kitchen')) {
            employeeDepartment = 'Kitchen';
          } else if (positionLower.includes('drive') || positionLower.includes('dt') || positionLower.includes('window') || nameLower.includes('drive')) {
            employeeDepartment = 'Drive Thru';
          } else if (positionLower.includes('register') || positionLower.includes('counter') || positionLower.includes('cashier') || positionLower.includes('front')) {
            employeeDepartment = 'Front Counter';
          } else {
            // For testing purposes, distribute employees across departments based on their name hash
            // This ensures consistent assignment but with variety
            const nameHash = employee.name.split('').reduce((hash, char) => {
              return ((hash << 5) - hash) + char.charCodeAt(0);
            }, 0);
            const departmentIndex = Math.abs(nameHash) % 3;

            if (departmentIndex === 0) {
              employeeDepartment = 'Kitchen';
            } else if (departmentIndex === 1) {
              employeeDepartment = 'Drive Thru';
            } else {
              employeeDepartment = 'Front Counter';
            }
          }
        }

        console.log(`Employee ${employee.name} (${employee.position}) has departments: ${JSON.stringify(employee.departments)} -> assigned to ${employeeDepartment}`);

        // Add to department metrics
        if (departmentMetrics[employeeDepartment]) {
          if (employeeShift === 'day') {
            departmentMetrics[employeeDepartment].day.push(avgScore);
          } else {
            departmentMetrics[employeeDepartment].night.push(avgScore);
          }
        }

        // If employee already has a score, average it with the new one
        if (targetMap.has(employeeId)) {
          const existing = targetMap.get(employeeId);
          existing.scores.push(avgScore);
          existing.score = existing.scores.reduce((a, b) => a + b, 0) / existing.scores.length;
        } else {
          targetMap.set(employeeId, {
            score: avgScore,
            scores: [avgScore],
            name: employee.name,
            position: employee.position,
            department: employeeDepartment,
            hasEvaluation: true
          });
        }
      }
    });

    // Don't add employees without evaluations - only show those with actual data

    // Calculate averages for each category
    const metricsArray = Object.entries(metrics).map(([category, scores]) => ({
      category,
      day: scores.day.length ? (scores.day.reduce((a, b) => a + b, 0) / scores.day.length) : 0,
      night: scores.night.length ? (scores.night.reduce((a, b) => a + b, 0) / scores.night.length) : 0
    }));

    // Convert Maps to arrays and sort by score - only include employees with evaluations
    const dayTopPerformers = Array.from(dayShiftScores.values())
      .filter(employee => employee.hasEvaluation) // Only show employees with evaluations
      .map(({ scores, ...rest }) => rest) // Remove the scores array from response
      .sort((a, b) => b.score - a.score);

    const nightTopPerformers = Array.from(nightShiftScores.values())
      .filter(employee => employee.hasEvaluation) // Only show employees with evaluations
      .map(({ scores, ...rest }) => rest) // Remove the scores array from response
      .sort((a, b) => b.score - a.score);

    // Calculate overall averages (all employees shown already have evaluations)
    const dayAverage = dayTopPerformers.length
      ? dayTopPerformers.reduce((acc, curr) => acc + curr.score, 0) / dayTopPerformers.length
      : 0;
    const nightAverage = nightTopPerformers.length
      ? nightTopPerformers.reduce((acc, curr) => acc + curr.score, 0) / nightTopPerformers.length
      : 0;

    // Calculate department-specific averages for the chart
    const departmentAverages = {};
    for (const [department, data] of Object.entries(departmentMetrics)) {
      const dayAvg = data.day.length > 0 ? data.day.reduce((a, b) => a + b, 0) / data.day.length : 0;
      const nightAvg = data.night.length > 0 ? data.night.reduce((a, b) => a + b, 0) / data.night.length : 0;

      departmentAverages[department] = {
        day: Math.round(dayAvg * 10) / 10,
        night: Math.round(nightAvg * 10) / 10,
        dayCount: data.day.length,
        nightCount: data.night.length
      };
    }

    // Create department comparisons for the chart - only include departments with data
    const departmentComparisons = Object.keys(departmentAverages)
      .filter(dept => departmentAverages[dept].dayCount > 0 || departmentAverages[dept].nightCount > 0)
      .map(department => ({
        category: department === 'Front Counter' ? 'FC' :
                 department === 'Drive Thru' ? 'DT' :
                 department === 'Kitchen' ? 'Kitchen' : department,
        day: departmentAverages[department].day,
        night: departmentAverages[department].night
      }));

    // If no department data available, fall back to overall metrics
    if (departmentComparisons.length === 0) {
      // Use the existing metrics data as fallback
      const fallbackComparisons = metricsArray.map(metric => ({
        category: metric.category,
        day: metric.day,
        night: metric.night
      }));

      // If still no data, provide overall performance
      if (fallbackComparisons.length === 0) {
        departmentComparisons.push({
          category: 'All questions',
          day: dayAverage,
          night: nightAverage
        });
      } else {
        departmentComparisons.push(...fallbackComparisons);
      }
    }

    console.log('Department comparisons:', departmentComparisons);
    console.log('Department averages:', departmentAverages);

    // Debug: Log employee departments
    console.log('Day shift employees by department:');
    dayTopPerformers.forEach(emp => console.log(`  ${emp.name} (${emp.position}) -> ${emp.department}`));
    console.log('Night shift employees by department:');
    nightTopPerformers.forEach(emp => console.log(`  ${emp.name} (${emp.position}) -> ${emp.department}`));

    res.json({
      metrics: metricsArray,
      averages: {
        day: dayAverage,
        night: nightAverage
      },
      topPerformers: {
        day: dayTopPerformers,
        night: nightTopPerformers
      },
      departmentComparison: departmentComparisons,
      departments: departmentAverages
    });

  } catch (error) {
    console.error('Error in shift comparison:', error);
    res.status(500).json({ message: 'Error fetching shift comparison data' });
  }
});

// Evaluation Trends Endpoint
router.get('/evaluation-trends', auth, async (req, res) => {
  try {
    const { timeframe = '90', view = 'monthly' } = req.query;
    const days = parseInt(timeframe) || 90;

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get all evaluations in the date range
    const evaluations = await Evaluation.find({
      store: req.user.store._id,
      createdAt: { $gte: startDate, $lte: endDate }
    })
    .populate('employee')
    .populate({
      path: 'template',
      populate: {
        path: 'sections.criteria.gradingScale',
        model: 'GradingScale'
      }
    })
    .sort({ createdAt: 1 });

    // Get default grading scale
    const defaultScale = await GradingScale.findOne({
      store: req.user.store._id,
      isDefault: true,
      isActive: true
    });

    // Debug logging
    console.log('Evaluation Trends Debug:', {
      timeframe: days,
      startDate,
      endDate,
      totalEvaluations: evaluations.length,
      completedEvaluations: evaluations.filter(e => e.status === 'completed').length,
      evaluationsWithScores: evaluations.filter(e => e.status === 'completed' && e.managerEvaluation).length,
      defaultScale: defaultScale ? defaultScale.name : 'None'
    });

    // Group evaluations by period (month or week)
    const groupedEvaluations = {};
    const statusBreakdown = {
      'Completed': 0,
      'Pending Self Evaluation': 0,
      'Pending Manager Review': 0,
      'In Review Session': 0,
      'Scheduled': 0,
      'Draft': 0,
      'Other': 0
    };

    // Department breakdown
    const departmentBreakdown = {};

    // Track completion times
    const completionTimes = [];

    evaluations.forEach(evaluation => {
      // Update status counts with proper mapping
      let status;
      switch (evaluation.status) {
        case 'completed':
          status = 'Completed';
          break;
        case 'pending_self_evaluation':
          status = 'Pending Self Evaluation';
          break;
        case 'pending_manager_review':
          status = 'Pending Manager Review';
          break;
        case 'in_review_session':
          status = 'In Review Session';
          break;
        case 'scheduled':
          status = 'Scheduled';
          break;
        case 'draft':
          status = 'Draft';
          break;
        default:
          status = 'Other';
      }
      statusBreakdown[status] = (statusBreakdown[status] || 0) + 1;

      // Group by department if employee exists
      if (evaluation.employee && evaluation.employee.departments) {
        const department = evaluation.employee.departments[0] || 'Other';
        if (!departmentBreakdown[department]) {
          departmentBreakdown[department] = { count: 0, totalScore: 0 };
        }
        departmentBreakdown[department].count++;

        // Add score if completed
        if (evaluation.status === 'completed' && evaluation.managerEvaluation && evaluation.template) {
          // Convert managerEvaluation Map to object if needed
          const scores = evaluation.managerEvaluation instanceof Map
            ? Object.fromEntries(evaluation.managerEvaluation)
            : evaluation.managerEvaluation;

          let totalScore = 0;
          let totalPossible = 0;

          evaluation.template.sections.forEach((section, sectionIndex) => {
            section.criteria.forEach((criterion, criterionIndex) => {
              const key = `${sectionIndex}-${criterionIndex}`;
              const score = scores[key];
              const scale = criterion.gradingScale || defaultScale;

              if (score !== undefined && scale) {
                const numericScore = getRatingValue(score, scale);
                totalScore += numericScore;

                // Handle different scale types
                if (scale.grades && Array.isArray(scale.grades) && scale.grades.length > 0) {
                  totalPossible += Math.max(...scale.grades.map(g => g.value));
                } else {
                  // For Hearts and Hands or other scales without grades array, use 4 as max
                  totalPossible += 4;
                }
              }
            });
          });

          if (totalPossible > 0) {
            const percentageScore = (totalScore / totalPossible) * 100;
            departmentBreakdown[department].totalScore += percentageScore;
          }
        }
      }

      // Calculate completion time for completed evaluations
      if (evaluation.status === 'completed' && evaluation.createdAt && evaluation.completedDate) {
        const createdDate = new Date(evaluation.createdAt);
        const completedDate = new Date(evaluation.completedDate);
        const daysToComplete = (completedDate - createdDate) / (1000 * 60 * 60 * 24);
        completionTimes.push(daysToComplete);
      }

      // Group by period
      let periodKey;
      const date = new Date(evaluation.createdAt);

      if (view === 'weekly') {
        // Get week number
        const weekNumber = getWeekNumber(date);
        periodKey = `Week ${weekNumber}`;
      } else {
        // Monthly view - format as 'Jan', 'Feb', etc.
        periodKey = date.toLocaleString('en-US', { month: 'short' });
      }

      if (!groupedEvaluations[periodKey]) {
        groupedEvaluations[periodKey] = {
          completed: 0,
          pending: 0,
          totalScore: 0,
          scoreCount: 0
        };
      }

      // Update counts based on status
      if (evaluation.status === 'completed') {
        groupedEvaluations[periodKey].completed++;

        // Add score if available
        if (evaluation.managerEvaluation && evaluation.template) {
          // Convert managerEvaluation Map to object if needed
          const scores = evaluation.managerEvaluation instanceof Map
            ? Object.fromEntries(evaluation.managerEvaluation)
            : evaluation.managerEvaluation;

          let totalScore = 0;
          let totalPossible = 0;

          evaluation.template.sections.forEach((section, sectionIndex) => {
            section.criteria.forEach((criterion, criterionIndex) => {
              const key = `${sectionIndex}-${criterionIndex}`;
              const score = scores[key];
              const scale = criterion.gradingScale || defaultScale;

              if (score !== undefined && scale) {
                const numericScore = getRatingValue(score, scale);
                totalScore += numericScore;

                // Handle different scale types
                if (scale.grades && Array.isArray(scale.grades) && scale.grades.length > 0) {
                  totalPossible += Math.max(...scale.grades.map(g => g.value));
                } else {
                  // For Hearts and Hands or other scales without grades array, use 4 as max
                  totalPossible += 4;
                }
              }
            });
          });

          if (totalPossible > 0) {
            const percentageScore = (totalScore / totalPossible) * 100;
            groupedEvaluations[periodKey].totalScore += percentageScore;
            groupedEvaluations[periodKey].scoreCount++;
          }
        }
      } else {
        groupedEvaluations[periodKey].pending++;
      }
    });

    // Convert grouped data to array format for the response
    const trends = Object.keys(groupedEvaluations).map(period => {
      const periodData = groupedEvaluations[period];
      const avgScore = periodData.scoreCount > 0
        ? Math.round(periodData.totalScore / periodData.scoreCount)
        : null;

      // Debug logging
      console.log(`Period ${period}:`, {
        completed: periodData.completed,
        pending: periodData.pending,
        totalScore: periodData.totalScore,
        scoreCount: periodData.scoreCount,
        avgScore
      });

      return {
        period,
        completed: periodData.completed,
        pending: periodData.pending,
        avgScore
      };
    });

    // Convert department breakdown to array
    const byDepartment = Object.keys(departmentBreakdown).map(department => ({
      department,
      count: departmentBreakdown[department].count,
      avgScore: departmentBreakdown[department].count > 0
        ? Math.round(departmentBreakdown[department].totalScore / departmentBreakdown[department].count)
        : 0
    }));

    // Calculate completion time stats
    const completionTime = {
      average: completionTimes.length > 0
        ? parseFloat((completionTimes.reduce((sum, time) => sum + time, 0) / completionTimes.length).toFixed(1))
        : 0,
      fastest: completionTimes.length > 0
        ? parseFloat(Math.min(...completionTimes).toFixed(1))
        : 0,
      slowest: completionTimes.length > 0
        ? parseFloat(Math.max(...completionTimes).toFixed(1))
        : 0
    };

    res.json({
      trends,
      statusBreakdown: Object.keys(statusBreakdown).map(status => ({
        status,
        count: statusBreakdown[status]
      })),
      byDepartment,
      completionTime
    });

  } catch (error) {
    console.error('Error fetching evaluation trends:', error);
    res.status(500).json({ message: 'Error fetching evaluation trends data' });
  }
});

// Department Comparison Endpoint
router.get('/department-comparison', auth, async (req, res) => {
  try {
    const { timeframe = '90' } = req.query;
    const days = parseInt(timeframe) || 90;

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get previous period for improvement calculation
    const previousStartDate = new Date(startDate);
    previousStartDate.setDate(previousStartDate.getDate() - days);

    // Get all evaluations in the date range
    const evaluations = await Evaluation.find({
      store: req.user.store._id,
      createdAt: { $gte: startDate, $lte: endDate },
      status: 'completed'
    })
    .populate('employee')
    .populate({
      path: 'template',
      populate: {
        path: 'sections.criteria.gradingScale',
        model: 'GradingScale'
      }
    });

    // Get previous period evaluations
    const previousEvaluations = await Evaluation.find({
      store: req.user.store._id,
      createdAt: { $gte: previousStartDate, $lt: startDate },
      status: 'completed'
    })
    .populate('employee')
    .populate({
      path: 'template',
      populate: {
        path: 'sections.criteria.gradingScale',
        model: 'GradingScale'
      }
    });

    // Get default grading scale
    const defaultScale = await GradingScale.findOne({
      store: req.user.store._id,
      isDefault: true,
      isActive: true
    });

    // Debug logging
    console.log('Department Comparison Debug:', {
      timeframe: days,
      startDate,
      endDate,
      totalEvaluations: evaluations.length,
      previousEvaluations: previousEvaluations.length,
      defaultScale: defaultScale ? defaultScale.name : 'None'
    });

    // Group by department
    const departmentData = {};
    const trendData = {};

    // Initialize periods for trends (last 6 months)
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const monthName = d.toLocaleString('en-US', { month: 'short' });
      months.push(monthName);

      // Initialize trend data
      if (!trendData[monthName]) {
        trendData[monthName] = {
          'Front Counter': 0,
          'Drive Thru': 0,
          'Kitchen': 0,
          fcCount: 0,
          dtCount: 0,
          kCount: 0
        };
      }
    }

    // Process current period evaluations
    evaluations.forEach(evaluation => {
      if (!evaluation.employee || !evaluation.employee.departments) return;

      const department = evaluation.employee.departments[0] || 'Other';
      if (!departmentData[department]) {
        departmentData[department] = {
          performance: 0,
          teamMembers: 0,
          evaluationsCompleted: 0,
          totalScore: 0,
          completionTimes: [],
          previousScores: 0,
          previousCount: 0
        };
      }

      // Count unique team members
      departmentData[department].teamMembers++;
      departmentData[department].evaluationsCompleted++;

      // Calculate score using the same logic as other endpoints
      if (evaluation.managerEvaluation && evaluation.template) {
        // Convert managerEvaluation Map to object if needed
        const scores = evaluation.managerEvaluation instanceof Map
          ? Object.fromEntries(evaluation.managerEvaluation)
          : evaluation.managerEvaluation;

        let totalScore = 0;
        let totalPossible = 0;

        evaluation.template.sections.forEach((section, sectionIndex) => {
          section.criteria.forEach((criterion, criterionIndex) => {
            const key = `${sectionIndex}-${criterionIndex}`;
            const score = scores[key];
            const scale = criterion.gradingScale || defaultScale;

            if (score !== undefined && scale) {
              const numericScore = getRatingValue(score, scale);
              totalScore += numericScore;

              // Handle different scale types
              if (scale.grades && Array.isArray(scale.grades) && scale.grades.length > 0) {
                totalPossible += Math.max(...scale.grades.map(g => g.value));
              } else {
                // For Hearts and Hands or other scales without grades array, use 4 as max
                totalPossible += 4;
              }
            }
          });
        });

        if (totalPossible > 0) {
          const percentScore = (totalScore / totalPossible) * 100;
          departmentData[department].totalScore += percentScore;



          // Add to trend data
          const month = new Date(evaluation.completedDate || evaluation.createdAt)
            .toLocaleString('en-US', { month: 'short' });

          if (trendData[month]) {
            if (department === 'Front Counter') {
              trendData[month]['Front Counter'] += percentScore;
              trendData[month].fcCount++;
            } else if (department === 'Drive Thru') {
              trendData[month]['Drive Thru'] += percentScore;
              trendData[month].dtCount++;
            } else if (department === 'Kitchen') {
              trendData[month]['Kitchen'] += percentScore;
              trendData[month].kCount++;
            }
          }
        }
      }

      // Calculate completion time
      if (evaluation.createdAt && evaluation.completedDate) {
        const createdDate = new Date(evaluation.createdAt);
        const completedDate = new Date(evaluation.completedDate);
        const daysToComplete = (completedDate - createdDate) / (1000 * 60 * 60 * 24);
        departmentData[department].completionTimes.push(daysToComplete);
      }
    });

    // Process previous period evaluations for improvement calculation
    previousEvaluations.forEach(evaluation => {
      if (!evaluation.employee || !evaluation.employee.departments) return;

      const department = evaluation.employee.departments[0] || 'Other';
      if (!departmentData[department]) return;

      // Calculate score using the same logic
      if (evaluation.managerEvaluation && evaluation.template) {
        // Convert managerEvaluation Map to object if needed
        const scores = evaluation.managerEvaluation instanceof Map
          ? Object.fromEntries(evaluation.managerEvaluation)
          : evaluation.managerEvaluation;

        let totalScore = 0;
        let totalPossible = 0;

        evaluation.template.sections.forEach((section, sectionIndex) => {
          section.criteria.forEach((criterion, criterionIndex) => {
            const key = `${sectionIndex}-${criterionIndex}`;
            const score = scores[key];
            const scale = criterion.gradingScale || defaultScale;

            if (score !== undefined && scale) {
              const numericScore = getRatingValue(score, scale);
              totalScore += numericScore;

              // Handle different scale types
              if (scale.grades && Array.isArray(scale.grades) && scale.grades.length > 0) {
                totalPossible += Math.max(...scale.grades.map(g => g.value));
              } else {
                // For Hearts and Hands or other scales without grades array, use 4 as max
                totalPossible += 4;
              }
            }
          });
        });

        if (totalPossible > 0) {
          const percentScore = (totalScore / totalPossible) * 100;
          departmentData[department].previousScores += percentScore;
          departmentData[department].previousCount++;
        }
      }
    });

    // Format department data for response
    const departments = Object.keys(departmentData)
      .filter(dept => ['Front Counter', 'Drive Thru', 'Kitchen'].includes(dept))
      .map(department => {
        const data = departmentData[department];
        const performance = data.evaluationsCompleted > 0
          ? Math.round(data.totalScore / data.evaluationsCompleted)
          : 0;

        const previousPerformance = data.previousCount > 0
          ? Math.round(data.previousScores / data.previousCount)
          : 0;

        const improvementRate = previousPerformance > 0
          ? parseFloat(((performance - previousPerformance) / previousPerformance * 100).toFixed(1))
          : 0;

        return {
          department,
          performance,
          teamMembers: Math.round(data.teamMembers / 2), // Adjust for duplicates
          evaluationsCompleted: data.evaluationsCompleted,
          avgCompletionTime: data.completionTimes.length > 0
            ? parseFloat((data.completionTimes.reduce((sum, time) => sum + time, 0) / data.completionTimes.length).toFixed(1))
            : 0,
          improvementRate
        };
      });



    // Format trend data
    const performanceTrends = months.map(month => {
      const data = trendData[month] || { fcCount: 0, dtCount: 0, kCount: 0 };
      return {
        period: month,
        'Front Counter': data.fcCount > 0 ? Math.round(data['Front Counter'] / data.fcCount) : 0,
        'Drive Thru': data.dtCount > 0 ? Math.round(data['Drive Thru'] / data.dtCount) : 0,
        'Kitchen': data.kCount > 0 ? Math.round(data['Kitchen'] / data.kCount) : 0
      };
    });

    // Debug logging
    console.log('Department Comparison Results:', {
      departments: departments.map(d => ({
        department: d.department,
        performance: d.performance,
        evaluationsCompleted: d.evaluationsCompleted,
        improvementRate: d.improvementRate
      })),
      trendsCount: performanceTrends.length
    });

    res.json({
      departments,
      performanceTrends
    });

  } catch (error) {
    console.error('Error fetching department comparison:', error);
    res.status(500).json({ message: 'Error fetching department comparison data' });
  }
});

// Helper function to get week number
function getWeekNumber(date) {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
  const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
}

// Helper function to calculate a single evaluation score
function calculateEvaluationScore(evaluation) {
  let totalScore = 0;
  let totalPossible = 0;

  if (evaluation.template && evaluation.template.sections) {
    evaluation.template.sections.forEach(section => {
      if (section.criteria) {
        section.criteria.forEach(criterion => {
          const criterionId = criterion._id.toString();
          const rating = evaluation.managerEvaluation && evaluation.managerEvaluation[criterionId];

          if (rating !== undefined && criterion.gradingScale) {
            totalScore += rating;
            totalPossible += criterion.gradingScale.maxPoints || 5;
          }
        });
      }
    });
  }

  return { score: totalScore, totalPossible };
}

// Helper function to calculate average performance from evaluations
function calculateAveragePerformance(evaluations, defaultScale) {
  if (!evaluations || !evaluations.length) return 0;

  const evaluationScores = evaluations.map(evaluation => {
    // Ensure we have the required data
    if (!evaluation.managerEvaluation || !evaluation.template) {
      return { score: 0, totalPossible: 0 };
    }

    // Convert managerEvaluation Map to object if needed
    const scores = evaluation.managerEvaluation instanceof Map
      ? Object.fromEntries(evaluation.managerEvaluation)
      : evaluation.managerEvaluation;

    let totalScore = 0;
    let totalPossible = 0;

    evaluation.template.sections.forEach((section, sectionIndex) => {
      section.criteria.forEach((criterion, criterionIndex) => {
        const key = `${sectionIndex}-${criterionIndex}`;
        const score = scores[key];
        const scale = criterion.gradingScale || defaultScale;

        if (score !== undefined && scale) {
          const numericScore = getRatingValue(score, scale);
          totalScore += numericScore;

          // Calculate max possible score from the grading scale
          const maxPossible = scale.grades && Array.isArray(scale.grades) && scale.grades.length > 0
            ? Math.max(...scale.grades.map(g => g.value))
            : 4; // For Hearts and Hands or other scales without grades array

          totalPossible += maxPossible;
        }
      });
    });

    return { score: totalScore, totalPossible };
  });

  // Filter out evaluations with no possible points to avoid division by zero
  const validScores = evaluationScores.filter(score => score.totalPossible > 0);

  if (validScores.length > 0) {
    const totalScore = validScores.reduce((sum, evalScore) => sum + evalScore.score, 0);
    const totalPossible = validScores.reduce((sum, evalScore) => sum + evalScore.totalPossible, 0);
    const avgPerformance = totalPossible > 0 ? Math.round((totalScore / totalPossible) * 100) : 0;
    return avgPerformance;
  }

  return 0;
}

// Export data endpoints
router.get('/export', auth, async (req, res) => {
  try {
    const { timeframe = '30' } = req.query;
    const days = parseInt(timeframe) || 30;

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get evaluations
    const evaluations = await Evaluation.find({
      store: req.user.store._id,
      createdAt: { $gte: startDate, $lte: endDate }
    })
    .populate('employee')
    .populate('template')
    .populate('evaluator');

    // Create CSV content
    let csv = 'Employee,Position,Department,Evaluator,Template,Status,Score,Date\n';

    evaluations.forEach(evaluation => {
      const employee = evaluation.employee ? evaluation.employee.name : 'Unknown';
      const position = evaluation.employee ? evaluation.employee.position : 'Unknown';
      const department = evaluation.employee && evaluation.employee.departments ?
        evaluation.employee.departments[0] : 'Unknown';
      const evaluator = evaluation.evaluator ? evaluation.evaluator.name : 'Unknown';
      const template = evaluation.template ? evaluation.template.name : 'Unknown';
      const status = evaluation.status.charAt(0).toUpperCase() + evaluation.status.slice(1);

      let score = 'N/A';
      if (evaluation.status === 'completed' && evaluation.managerEvaluation) {
        const scoreObj = calculateEvaluationScore(evaluation);
        if (scoreObj.totalPossible > 0) {
          score = Math.round(scoreObj.score / scoreObj.totalPossible * 100) + '%';
        }
      }

      const date = evaluation.completedDate || evaluation.createdAt;
      const formattedDate = new Date(date).toLocaleDateString();

      csv += `"${employee}","${position}","${department}","${evaluator}","${template}","${status}","${score}","${formattedDate}"\n`;
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=analytics-export-${new Date().toISOString().split('T')[0]}.csv`);
    res.send(csv);

  } catch (error) {
    console.error('Error exporting analytics data:', error);
    res.status(500).json({ message: 'Error exporting analytics data' });
  }
});

// Export Hearts and Hands data
router.get('/export-hearts-and-hands', auth, async (req, res) => {
  try {
    const { timeframe = '90', department = 'all', position = 'all' } = req.query;
    const days = parseInt(timeframe) || 90;

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Build query
    const query = {
      store: req.user.store._id,
      role: { $ne: 'admin' }
    };

    // Add department filter if specified
    if (department !== 'all') {
      query.departments = { $regex: new RegExp(department, 'i') };
    }

    // Add position filter if specified
    if (position !== 'all') {
      query.position = position;
    }

    // Get all team members
    const teamMembers = await User.find(query).lean();

    // Create CSV content
    let csv = 'Name,Position,Department,Engagement Score,Skills Score,Quadrant\n';

    teamMembers.forEach(member => {
      const name = member.name || 'Unknown';
      const position = member.position || 'Unknown';
      const department = member.departments ? member.departments[0] : 'Unknown';

      // Get Hearts and Hands metrics
      const x = member.metrics?.heartsAndHands?.x || 50;
      const y = member.metrics?.heartsAndHands?.y || 50;

      // Determine quadrant
      let quadrant = '';
      if (x < 50 && y >= 50) quadrant = 'High Potential';
      else if (x >= 50 && y >= 50) quadrant = 'Star Performer';
      else if (x < 50 && y < 50) quadrant = 'Needs Development';
      else quadrant = 'Skill Master';

      csv += `"${name}","${position}","${department}","${x}%","${y}%","${quadrant}"\n`;
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=hearts-and-hands-${new Date().toISOString().split('T')[0]}.csv`);
    res.send(csv);

  } catch (error) {
    console.error('Error exporting Hearts and Hands data:', error);
    res.status(500).json({ message: 'Error exporting Hearts and Hands data' });
  }
});

// Export evaluation trends data
router.get('/export-evaluation-trends', auth, async (req, res) => {
  try {
    const { timeframe = '90' } = req.query;
    const days = parseInt(timeframe) || 90;

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get all evaluations in the date range
    const evaluations = await Evaluation.find({
      store: req.user.store._id,
      createdAt: { $gte: startDate, $lte: endDate }
    })
    .populate('employee')
    .populate('template')
    .sort({ createdAt: 1 });

    // Create CSV content
    let csv = 'Date,Status,Employee,Template,Department,Score,Completion Time (days)\n';

    evaluations.forEach(evaluation => {
      const employee = evaluation.employee?.name || 'Unknown';
      const template = evaluation.template?.name || 'Unknown';
      const department = evaluation.employee?.departments?.[0] || 'Unknown';
      const date = evaluation.createdAt.toISOString().split('T')[0];
      const score = evaluation.finalScore || 'N/A';

      // Calculate completion time
      let completionTime = 'N/A';
      if (evaluation.status === 'completed' && evaluation.completedDate && evaluation.createdAt) {
        const diffTime = Math.abs(new Date(evaluation.completedDate) - new Date(evaluation.createdAt));
        completionTime = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      }

      csv += `"${date}","${evaluation.status}","${employee}","${template}","${department}","${score}","${completionTime}"\n`;
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="evaluation-trends.csv"');
    res.send(csv);

  } catch (error) {
    console.error('Error exporting evaluation trends:', error);
    res.status(500).json({ message: 'Failed to export evaluation trends data' });
  }
});

// Export department comparison data
router.get('/export-department-comparison', auth, async (req, res) => {
  try {
    const { timeframe = '90' } = req.query;
    const days = parseInt(timeframe) || 90;

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get all evaluations in the date range
    const evaluations = await Evaluation.find({
      store: req.user.store._id,
      createdAt: { $gte: startDate, $lte: endDate },
      status: 'completed'
    })
    .populate('employee')
    .populate('template');

    // Create CSV content
    let csv = 'Department,Employee,Position,Score,Date,Template,Evaluator\n';

    evaluations.forEach(evaluation => {
      const employee = evaluation.employee?.name || 'Unknown';
      const position = evaluation.employee?.position || 'Unknown';
      const department = evaluation.employee?.departments?.[0] || 'Unknown';
      const date = evaluation.completedDate?.toISOString().split('T')[0] || 'Unknown';
      const score = evaluation.finalScore || 'N/A';
      const template = evaluation.template?.name || 'Unknown';
      const evaluator = evaluation.evaluator?.name || 'Unknown';

      csv += `"${department}","${employee}","${position}","${score}","${date}","${template}","${evaluator}"\n`;
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="department-comparison.csv"');
    res.send(csv);

  } catch (error) {
    console.error('Error exporting department comparison:', error);
    res.status(500).json({ message: 'Failed to export department comparison data' });
  }
});

// Export team scores data
router.get('/export-team-scores', auth, async (req, res) => {
  try {
    const { timeframe = '90' } = req.query;
    const days = parseInt(timeframe) || 90;

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get all team members
    const teamMembers = await User.find({
      store: req.user.store._id,
      role: { $ne: 'admin' }
    });

    // Get all evaluations
    const evaluations = await Evaluation.find({
      store: req.user.store._id,
      status: 'completed',
      completedDate: { $gte: startDate, $lte: endDate }
    })
    .populate('employee')
    .populate('template');

    // Group evaluations by employee
    const employeeScores = {};

    evaluations.forEach(evaluation => {
      if (!evaluation.employee) return;

      const employeeId = evaluation.employee._id.toString();
      if (!employeeScores[employeeId]) {
        employeeScores[employeeId] = {
          name: evaluation.employee.name,
          position: evaluation.employee.position || 'Unknown',
          department: evaluation.employee.departments ? evaluation.employee.departments[0] : 'Unknown',
          evaluations: [],
          totalScore: 0,
          totalPossible: 0,
          recentEvaluation: null
        };
      }

      // Calculate score
      const score = calculateEvaluationScore(evaluation);

      employeeScores[employeeId].evaluations.push({
        date: evaluation.completedDate || evaluation.createdAt,
        score: score.score,
        totalPossible: score.totalPossible
      });

      employeeScores[employeeId].totalScore += score.score;
      employeeScores[employeeId].totalPossible += score.totalPossible;

      // Track most recent evaluation
      const evalDate = new Date(evaluation.completedDate || evaluation.createdAt);
      if (!employeeScores[employeeId].recentEvaluation ||
          evalDate > new Date(employeeScores[employeeId].recentEvaluation.date)) {
        employeeScores[employeeId].recentEvaluation = {
          date: evaluation.completedDate || evaluation.createdAt,
          score: score.score,
          totalPossible: score.totalPossible
        };
      }
    });

    // Create CSV content
    let csv = 'Name,Position,Department,Average Score,Recent Score,# of Evaluations,Last Evaluation\n';

    Object.values(employeeScores).forEach(employee => {
      const avgScore = employee.totalPossible > 0
        ? Math.round((employee.totalScore / employee.totalPossible) * 100) + '%'
        : 'N/A';

      const recentScore = employee.recentEvaluation && employee.recentEvaluation.totalPossible > 0
        ? Math.round((employee.recentEvaluation.score / employee.recentEvaluation.totalPossible) * 100) + '%'
        : 'N/A';

      const lastEvalDate = employee.recentEvaluation
        ? new Date(employee.recentEvaluation.date).toLocaleDateString()
        : 'N/A';

      csv += `"${employee.name}","${employee.position}","${employee.department}","${avgScore}","${recentScore}","${employee.evaluations.length}","${lastEvalDate}"\n`;
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=team-scores-${new Date().toISOString().split('T')[0]}.csv`);
    res.send(csv);

  } catch (error) {
    console.error('Error exporting team scores data:', error);
    res.status(500).json({ message: 'Error exporting team scores data' });
  }
});

// Debug endpoint to check Hearts and Hands data
router.get('/debug-hearts-and-hands', auth, async (req, res) => {
  try {
    const users = await User.find({ store: req.user.store._id })
      .select('name position departments metrics')
      .limit(10);

    const debugData = users.map(user => ({
      name: user.name,
      position: user.position,
      departments: user.departments,
      metrics: user.metrics,
      hasHeartsAndHands: !!user.metrics?.heartsAndHands,
      heartsAndHandsData: user.metrics?.heartsAndHands
    }));

    res.json({
      totalUsers: users.length,
      users: debugData,
      message: 'Debug data retrieved successfully'
    });
  } catch (error) {
    console.error('Debug Hearts and Hands error:', error);
    res.status(500).json({ message: 'Debug failed' });
  }
});

// Test endpoint to update Hearts and Hands for a specific user
router.post('/test-hearts-and-hands/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    const { x, y } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Initialize metrics if it doesn't exist
    if (!user.metrics) {
      user.metrics = {};
    }

    // Update Hearts and Hands
    user.metrics.heartsAndHands = { x, y };
    user.markModified('metrics');

    await user.save();

    // Fetch the updated user to verify
    const updatedUser = await User.findById(userId).select('name metrics');

    res.json({
      message: 'Hearts and Hands updated successfully',
      user: {
        name: updatedUser.name,
        heartsAndHands: updatedUser.metrics?.heartsAndHands
      }
    });
  } catch (error) {
    console.error('Test Hearts and Hands error:', error);
    res.status(500).json({ message: 'Test failed' });
  }
});

export default router;