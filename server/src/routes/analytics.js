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

    // Handle string scores like 'Excellent', 'Good', etc.
    const scoreMap = {
      'excellent': 5,
      'good': 4,
      'satisfactory': 3,
      'needs improvement': 2,
      'poor': 1
    };
    return scoreMap[score.toLowerCase()] || 0;
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

    console.log('Found evaluations:', recentEvaluations.length);
    console.log('Sample evaluation:', recentEvaluations[0]);

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
          console.log('Skipping evaluation - missing data:', evaluation._id);
          return { score: 0, totalPossible: 0 };
        }

        // Convert managerEvaluation Map to object if needed
        const scores = evaluation.managerEvaluation instanceof Map
          ? Object.fromEntries(evaluation.managerEvaluation)
          : evaluation.managerEvaluation;

        console.log('Processing scores:', scores);

        let totalScore = 0;
        let totalPossible = 0;

        evaluation.template.sections.forEach((section, sectionIndex) => {
          section.criteria.forEach((criterion, criterionIndex) => {
            const key = `${sectionIndex}-${criterionIndex}`;
            const score = scores[key];
            const scale = criterion.gradingScale || defaultScale;

            if (score !== undefined && scale && scale.grades) {
              const numericScore = mapScoreToNumeric(score);
              totalScore += numericScore;

              // Calculate max possible score from the grading scale
              const maxPossible = Math.max(...scale.grades.map(g => g.value));
              totalPossible += maxPossible;

              console.log('Criterion calculation:', {
                key,
                score,
                numericScore,
                maxPossible
              });
            }
          });
        });

        console.log('Evaluation calculation:', {
          evaluationId: evaluation._id,
          totalScore,
          totalPossible,
          scores
        });

        return { score: totalScore, totalPossible };
      });

      // Filter out evaluations with no possible points to avoid division by zero
      const validScores = evaluationScores.filter(score => score.totalPossible > 0);

      if (validScores.length > 0) {
        const totalScore = validScores.reduce((sum, evalScore) => sum + evalScore.score, 0);
        const totalPossible = validScores.reduce((sum, evalScore) => sum + evalScore.totalPossible, 0);
        avgPerformance = totalPossible > 0 ? Math.round((totalScore / totalPossible) * 100) : 0;

        console.log('Final calculation:', {
          totalScore,
          totalPossible,
          numberOfEvaluations: validScores.length,
          avgPerformance
        });
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
  if (!rating || !gradingScale) return 0;
  if (typeof rating === 'number') return rating;

  // If the rating is a numeric string, convert it to a number
  const numericValue = Number(rating);
  if (!isNaN(numericValue)) return numericValue;

  // If we have a grading scale, find the grade by label
  const grade = gradingScale.grades.find(g =>
    rating.includes(g.label) || rating.includes(`- ${g.label}`)
  );

  // Return the grade's value if found
  if (grade) {
    return grade.value;
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
            totalPossible += Math.max(...scale.grades.map(g => g.value)); // Use highest value from scale
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
            totalPossible += Math.max(...scale.grades.map(g => g.value));
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

// Update the existing mapScoreToNumeric function to handle additional score formats
// This extends the function defined at the top of the file
function extendedScoreMapping(score) {
  // First try the original mapping function
  const basicScore = mapScoreToNumeric(score);
  if (basicScore > 0) return basicScore;

  // Handle numeric scores
  if (!isNaN(score)) {
    return Number(score);
  }

  // Handle text-based scores with dashes
  const dashScoreMap = {
    '- Star': 4,
    '- Excellent': 5,
    '- Very Good': 4,
    '- Valued': 3,
    '- Performer': 2,
    '- Improvement Needed': 1,
    '- Improvment Needed': 1 // Handle misspelling
  };

  return dashScoreMap[score] || 0;
};

router.get('/shift-comparison', auth, async (req, res) => {
  try {
    const { timeframe = 'month', store } = req.query;
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

    // First find all employees by shift
    const dayShiftEmployees = await User.find({
      store: storeId,
      shift: 'day',
      status: 'active'
    }).select('_id name position');

    const nightShiftEmployees = await User.find({
      store: storeId,
      shift: 'night',
      status: 'active'
    }).select('_id name position');

    // Get evaluations for day shift employees
    const dayShiftEvaluations = await Evaluation.find({
      store: storeId,
      employee: { $in: dayShiftEmployees.map(emp => emp._id) },
      createdAt: { $gte: startDate, $lte: endDate },
      status: 'completed'
    }).populate('template');

    // Get evaluations for night shift employees
    const nightShiftEvaluations = await Evaluation.find({
      store: storeId,
      employee: { $in: nightShiftEmployees.map(emp => emp._id) },
      createdAt: { $gte: startDate, $lte: endDate },
      status: 'completed'
    }).populate('template');

    // Initialize metrics
    const dayShiftScores = [];
    const nightShiftScores = [];
    const metrics = {};

    // Process day shift evaluations
    dayShiftEvaluations.forEach(evaluation => {
      const employee = dayShiftEmployees.find(emp => emp._id.toString() === evaluation.employee.toString());
      if (!employee) return;

      const scores = evaluation.managerEvaluation instanceof Map
        ? Object.fromEntries(evaluation.managerEvaluation)
        : evaluation.managerEvaluation;

      let totalScore = 0;
      let totalPossible = 0;

      evaluation.template.sections.forEach((section, sectionIndex) => {
        section.criteria.forEach((criterion, criterionIndex) => {
          const key = `${sectionIndex}-${criterionIndex}`;
          const score = scores[key];
          if (score !== undefined) {
            const numericScore = extendedScoreMapping(score);
            totalScore += numericScore;
            totalPossible += criterion.gradingScale?.grades
              ? Math.max(...criterion.gradingScale.grades.map(g => g.value))
              : 5; // Default max score if no grading scale

            // Add to category metrics
            if (!metrics[section.title]) {
              metrics[section.title] = { day: [], night: [] };
            }
            metrics[section.title].day.push(numericScore);
          }
        });
      });

      if (totalPossible > 0) {
        const avgScore = (totalScore / totalPossible) * 100;
        dayShiftScores.push({
          score: avgScore,
          name: employee.name,
          position: employee.position
        });
      }
    });

    // Process night shift evaluations
    nightShiftEvaluations.forEach(evaluation => {
      const employee = nightShiftEmployees.find(emp => emp._id.toString() === evaluation.employee.toString());
      if (!employee) return;

      const scores = evaluation.managerEvaluation instanceof Map
        ? Object.fromEntries(evaluation.managerEvaluation)
        : evaluation.managerEvaluation;

      let totalScore = 0;
      let totalPossible = 0;

      evaluation.template.sections.forEach((section, sectionIndex) => {
        section.criteria.forEach((criterion, criterionIndex) => {
          const key = `${sectionIndex}-${criterionIndex}`;
          const score = scores[key];
          if (score !== undefined) {
            const numericScore = extendedScoreMapping(score);
            totalScore += numericScore;
            totalPossible += criterion.gradingScale?.grades
              ? Math.max(...criterion.gradingScale.grades.map(g => g.value))
              : 5; // Default max score if no grading scale

            // Add to category metrics
            if (!metrics[section.title]) {
              metrics[section.title] = { day: [], night: [] };
            }
            metrics[section.title].night.push(numericScore);
          }
        });
      });

      if (totalPossible > 0) {
        const avgScore = (totalScore / totalPossible) * 100;
        nightShiftScores.push({
          score: avgScore,
          name: employee.name,
          position: employee.position
        });
      }
    });

    // Calculate averages for each category
    const metricsArray = Object.entries(metrics).map(([category, scores]) => ({
      category,
      day: scores.day.length ? (scores.day.reduce((a, b) => a + b, 0) / scores.day.length) : 0,
      night: scores.night.length ? (scores.night.reduce((a, b) => a + b, 0) / scores.night.length) : 0
    }));

    // Sort performers by score
    const sortByScore = (a, b) => b.score - a.score;
    const dayTopPerformers = dayShiftScores.sort(sortByScore);
    const nightTopPerformers = nightShiftScores.sort(sortByScore);

    // Calculate overall averages
    const dayAverage = dayShiftScores.length
      ? dayShiftScores.reduce((acc, curr) => acc + curr.score, 0) / dayShiftScores.length
      : 0;
    const nightAverage = nightShiftScores.length
      ? nightShiftScores.reduce((acc, curr) => acc + curr.score, 0) / nightShiftScores.length
      : 0;

    // Calculate department comparisons
    const departmentComparisons = [
      {
        category: 'Front of House',
        day: dayShiftScores.length ? dayShiftScores.reduce((acc, curr) => acc + curr.score, 0) / dayShiftScores.length : 0,
        night: nightShiftScores.length ? nightShiftScores.reduce((acc, curr) => acc + curr.score, 0) / nightShiftScores.length : 0
      },
      {
        category: 'Back of House',
        day: dayShiftScores.length ? dayShiftScores.reduce((acc, curr) => acc + curr.score, 0) / dayShiftScores.length : 0,
        night: nightShiftScores.length ? nightShiftScores.reduce((acc, curr) => acc + curr.score, 0) / nightShiftScores.length : 0
      }
    ];

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
      departmentComparison: departmentComparisons
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
    .populate('template')
    .sort({ createdAt: 1 });

    // Group evaluations by period (month or week)
    const groupedEvaluations = {};
    const statusBreakdown = {
      'Completed': 0,
      'Pending': 0,
      'Scheduled': 0,
      'Draft': 0
    };

    // Department breakdown
    const departmentBreakdown = {};

    // Track completion times
    const completionTimes = [];

    evaluations.forEach(evaluation => {
      // Update status counts
      const status = evaluation.status.charAt(0).toUpperCase() + evaluation.status.slice(1);
      statusBreakdown[status] = (statusBreakdown[status] || 0) + 1;

      // Group by department if employee exists
      if (evaluation.employee && evaluation.employee.departments) {
        const department = evaluation.employee.departments[0] || 'Other';
        if (!departmentBreakdown[department]) {
          departmentBreakdown[department] = { count: 0, totalScore: 0 };
        }
        departmentBreakdown[department].count++;

        // Add score if completed
        if (evaluation.status === 'completed' && evaluation.managerEvaluation) {
          const score = calculateEvaluationScore(evaluation);
          departmentBreakdown[department].totalScore += score.score / score.totalPossible * 100;
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
        if (evaluation.managerEvaluation) {
          const score = calculateEvaluationScore(evaluation);
          if (score.totalPossible > 0) {
            groupedEvaluations[periodKey].totalScore += score.score / score.totalPossible * 100;
            groupedEvaluations[periodKey].scoreCount++;
          }
        }
      } else {
        groupedEvaluations[periodKey].pending++;
      }
    });

    // Convert grouped data to array format for the response
    const trends = Object.keys(groupedEvaluations).map(period => ({
      period,
      completed: groupedEvaluations[period].completed,
      pending: groupedEvaluations[period].pending,
      avgScore: groupedEvaluations[period].scoreCount > 0
        ? Math.round(groupedEvaluations[period].totalScore / groupedEvaluations[period].scoreCount)
        : null
    }));

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
    .populate('template');

    // Get previous period evaluations
    const previousEvaluations = await Evaluation.find({
      store: req.user.store._id,
      createdAt: { $gte: previousStartDate, $lt: startDate },
      status: 'completed'
    })
    .populate('employee')
    .populate('template');

    // Group by department
    const departmentData = {};
    const skillData = {};
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

      // Calculate score
      if (evaluation.managerEvaluation) {
        const score = calculateEvaluationScore(evaluation);
        if (score.totalPossible > 0) {
          const percentScore = score.score / score.totalPossible * 100;
          departmentData[department].totalScore += percentScore;

          // Process skills data
          if (evaluation.template && evaluation.template.sections) {
            evaluation.template.sections.forEach(section => {
              const skillName = section.name;
              if (!skillData[skillName]) {
                skillData[skillName] = {
                  'Front Counter': { total: 0, count: 0 },
                  'Drive Thru': { total: 0, count: 0 },
                  'Kitchen': { total: 0, count: 0 }
                };
              }

              // Calculate section score
              let sectionScore = 0;
              let sectionPossible = 0;

              if (section.criteria) {
                section.criteria.forEach(criterion => {
                  const criterionId = criterion._id.toString();
                  const rating = evaluation.managerEvaluation[criterionId];

                  if (rating !== undefined && criterion.gradingScale) {
                    sectionScore += rating;
                    sectionPossible += criterion.gradingScale.maxPoints || 5;
                  }
                });
              }

              if (sectionPossible > 0 && departmentData[department]) {
                const sectionPercentage = sectionScore / sectionPossible * 100;
                skillData[skillName][department].total += sectionPercentage;
                skillData[skillName][department].count++;
              }
            });
          }

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

      // Calculate score
      if (evaluation.managerEvaluation) {
        const score = calculateEvaluationScore(evaluation);
        if (score.totalPossible > 0) {
          const percentScore = score.score / score.totalPossible * 100;
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

    // Format skills data for response
    const skillComparison = Object.keys(skillData)
      .filter(skill => [
        'Customer Service', 'Speed', 'Accuracy', 'Teamwork', 'Cleanliness'
      ].includes(skill) || Object.keys(skillData).length <= 5)
      .map(skill => {
        const data = skillData[skill];
        return {
          skill,
          'Front Counter': data['Front Counter'].count > 0
            ? Math.round(data['Front Counter'].total / data['Front Counter'].count)
            : 0,
          'Drive Thru': data['Drive Thru'].count > 0
            ? Math.round(data['Drive Thru'].total / data['Drive Thru'].count)
            : 0,
          'Kitchen': data['Kitchen'].count > 0
            ? Math.round(data['Kitchen'].total / data['Kitchen'].count)
            : 0
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

    res.json({
      departments,
      skillComparison,
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

        if (score !== undefined && scale && scale.grades) {
          const numericScore = extendedScoreMapping(score);
          totalScore += numericScore;

          // Calculate max possible score from the grading scale
          const maxPossible = Math.max(...scale.grades.map(g => g.value));
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
    return totalPossible > 0 ? Math.round((totalScore / totalPossible) * 100) : 0;
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

export default router;