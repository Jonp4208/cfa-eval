// Assessment Recommendations Generator
// Provides specific, actionable recommendations based on assessment results

const LEADERSHIP_STYLE_RECOMMENDATIONS = {
  'Decision Making': {
    low: [
      'Practice the DECIDE model: Define the problem, Establish criteria, Consider alternatives, Identify best alternative, Develop action plan, Evaluate solution',
      'Start with smaller decisions to build confidence, then gradually take on more complex choices',
      'Create a decision-making framework with clear steps to follow consistently',
      'Seek mentoring from experienced leaders on decision-making processes'
    ],
    medium: [
      'Improve decision speed by setting time limits for different types of decisions',
      'Practice involving your team in decisions while maintaining final accountability',
      'Develop better data-gathering skills to make more informed choices',
      'Learn to balance analysis with intuition in your decision-making'
    ],
    high: [
      'Mentor others in effective decision-making techniques',
      'Lead complex, high-stakes decisions for your restaurant',
      'Develop decision-making frameworks for your team to use',
      'Share your decision-making expertise in leadership development programs'
    ]
  },
  'Communication': {
    low: [
      'Practice active listening by summarizing what others say before responding',
      'Work on clear, concise communication - aim for 30 seconds or less for most messages',
      'Take a communication skills course focused on restaurant leadership',
      'Practice giving feedback using the SBI model (Situation, Behavior, Impact)'
    ],
    medium: [
      'Adapt your communication style to different team members and situations',
      'Improve your ability to communicate during high-stress periods',
      'Practice facilitating team meetings and discussions',
      'Work on non-verbal communication and body language awareness'
    ],
    high: [
      'Become a communication coach for other leaders in your organization',
      'Lead training sessions on effective communication',
      'Develop communication standards and best practices for your team',
      'Mentor new leaders in communication skills'
    ]
  },
  'Team Development': {
    low: [
      'Create individual development plans for each team member',
      'Schedule regular one-on-one meetings to discuss growth and goals',
      'Learn basic coaching techniques and apply them weekly',
      'Identify each team member\'s strengths and development areas'
    ],
    medium: [
      'Implement a structured mentoring program for your team',
      'Create more challenging assignments to stretch team members',
      'Improve your ability to delegate meaningful responsibilities',
      'Develop better recognition and reward systems for growth'
    ],
    high: [
      'Design and lead leadership development programs',
      'Become a mentor for other managers in team development',
      'Create succession planning processes for key positions',
      'Share your team development expertise across the organization'
    ]
  },
  'Conflict Resolution': {
    low: [
      'Learn the basics of conflict resolution: listen, understand, find common ground, solve together',
      'Practice staying calm and neutral when tensions arise',
      'Address conflicts quickly before they escalate',
      'Seek training in mediation and conflict resolution techniques'
    ],
    medium: [
      'Develop skills in facilitating difficult conversations',
      'Learn to identify conflict triggers and prevent issues proactively',
      'Practice helping team members resolve conflicts independently',
      'Improve your emotional regulation during stressful situations'
    ],
    high: [
      'Become the go-to person for resolving complex team conflicts',
      'Train other leaders in conflict resolution techniques',
      'Develop conflict prevention strategies for your restaurant',
      'Mentor others in handling difficult conversations'
    ]
  },
  'Vision & Direction': {
    low: [
      'Clearly communicate your restaurant\'s mission and goals to your team',
      'Connect daily tasks to bigger picture outcomes for team members',
      'Practice painting a compelling picture of success for your team',
      'Learn to set clear, measurable goals that inspire action'
    ],
    medium: [
      'Involve your team in creating shared vision and goals',
      'Improve your ability to inspire and motivate during challenging times',
      'Develop better storytelling skills to communicate vision',
      'Create visual reminders of goals and progress for your team'
    ],
    high: [
      'Lead vision-setting processes for your restaurant or region',
      'Become a mentor for other leaders in vision communication',
      'Develop innovative approaches to goal-setting and achievement',
      'Share your vision leadership expertise in training programs'
    ]
  }
};

const CUSTOMER_SERVICE_RECOMMENDATIONS = {
  'Service Standards': {
    low: [
      'Create clear, written service standards for each position in your restaurant',
      'Implement daily service standard reminders during pre-shift meetings',
      'Practice observing and coaching service behaviors in real-time',
      'Develop a simple checklist for consistent service delivery'
    ],
    medium: [
      'Involve your team in refining and improving service standards',
      'Create service standard training modules for new team members',
      'Implement regular service standard assessments and feedback',
      'Develop recognition programs for consistent service excellence'
    ],
    high: [
      'Lead service standard development for your region or company',
      'Mentor other managers in implementing effective service standards',
      'Create innovative approaches to service consistency',
      'Share your service standard expertise in training programs'
    ]
  },
  'Customer Recovery': {
    low: [
      'Learn the LAST method: Listen, Apologize, Solve, Thank',
      'Practice empathetic responses to customer complaints',
      'Develop a step-by-step process for handling service failures',
      'Empower team members with specific recovery tools and authority'
    ],
    medium: [
      'Train your team in advanced service recovery techniques',
      'Implement proactive service recovery to prevent complaints',
      'Develop systems to track and learn from service failures',
      'Create memorable recovery experiences that exceed expectations'
    ],
    high: [
      'Become the service recovery expert for your organization',
      'Design service recovery training programs for other locations',
      'Develop innovative recovery strategies that create loyal customers',
      'Mentor other leaders in turning complaints into opportunities'
    ]
  },
  'Team Training': {
    low: [
      'Create structured onboarding programs for customer service skills',
      'Practice role-playing different customer scenarios with your team',
      'Implement regular service skill coaching sessions',
      'Develop simple training materials for consistent service delivery'
    ],
    medium: [
      'Design advanced customer service training modules',
      'Create peer-to-peer learning opportunities for service skills',
      'Implement service skill assessments and development plans',
      'Develop recognition systems for service learning and improvement'
    ],
    high: [
      'Lead customer service training development for your organization',
      'Become a master trainer for service excellence programs',
      'Create innovative training methods for service skills',
      'Mentor other managers in developing their teams\' service capabilities'
    ]
  },
  'Leading by Example': {
    low: [
      'Spend more time on the floor interacting with customers',
      'Practice the service behaviors you want to see from your team',
      'Make customer interactions a visible priority in your daily routine',
      'Ask for feedback on your own customer service behaviors'
    ],
    medium: [
      'Use customer interactions as teaching moments for your team',
      'Develop your ability to maintain service excellence under pressure',
      'Create opportunities for team members to observe your service approach',
      'Improve your ability to coach service skills in real-time'
    ],
    high: [
      'Become the service role model for your organization',
      'Lead by example in the most challenging customer situations',
      'Mentor other leaders in service leadership behaviors',
      'Share your service leadership expertise in development programs'
    ]
  },
  'Service Culture': {
    low: [
      'Regularly communicate how each role impacts the customer experience',
      'Create team discussions about service excellence and guest satisfaction',
      'Implement regular recognition for service-focused behaviors',
      'Encourage team members to share customer service ideas and feedback'
    ],
    medium: [
      'Develop team rituals and traditions around service excellence',
      'Create opportunities for team members to lead service improvements',
      'Implement customer feedback sharing and discussion sessions',
      'Build service excellence into your team\'s identity and pride'
    ],
    high: [
      'Create a service culture that other locations want to emulate',
      'Lead culture development initiatives for your organization',
      'Mentor other managers in building service-focused cultures',
      'Share your culture-building expertise in leadership programs'
    ]
  }
};

// Generate recommendations based on assessment results
export const generateRecommendations = (assessmentType, areaScores, overallScore) => {
  const recommendations = [];
  const recommendationMap = assessmentType === 'leadership' ? LEADERSHIP_STYLE_RECOMMENDATIONS : CUSTOMER_SERVICE_RECOMMENDATIONS;
  
  // Categorize scores
  const lowAreas = [];
  const mediumAreas = [];
  const highAreas = [];
  
  Object.entries(areaScores).forEach(([area, score]) => {
    if (score < 3) {
      lowAreas.push({ area, score });
    } else if (score < 4) {
      mediumAreas.push({ area, score });
    } else {
      highAreas.push({ area, score });
    }
  });
  
  // Sort areas by score (lowest first for development, highest first for strengths)
  lowAreas.sort((a, b) => a.score - b.score);
  mediumAreas.sort((a, b) => a.score - b.score);
  highAreas.sort((a, b) => b.score - a.score);
  
  // Add development recommendations for low areas (max 2)
  lowAreas.slice(0, 2).forEach(({ area, score }) => {
    const areaRecommendations = recommendationMap[area]?.low || [];
    if (areaRecommendations.length > 0) {
      recommendations.push({
        type: 'development',
        priority: 'high',
        area,
        score,
        recommendation: areaRecommendations[Math.floor(Math.random() * areaRecommendations.length)]
      });
    }
  });
  
  // Add improvement recommendations for medium areas (max 1)
  if (mediumAreas.length > 0) {
    const { area, score } = mediumAreas[0];
    const areaRecommendations = recommendationMap[area]?.medium || [];
    if (areaRecommendations.length > 0) {
      recommendations.push({
        type: 'improvement',
        priority: 'medium',
        area,
        score,
        recommendation: areaRecommendations[Math.floor(Math.random() * areaRecommendations.length)]
      });
    }
  }
  
  // Add leverage recommendations for high areas (max 1)
  if (highAreas.length > 0) {
    const { area, score } = highAreas[0];
    const areaRecommendations = recommendationMap[area]?.high || [];
    if (areaRecommendations.length > 0) {
      recommendations.push({
        type: 'leverage',
        priority: 'low',
        area,
        score,
        recommendation: areaRecommendations[Math.floor(Math.random() * areaRecommendations.length)]
      });
    }
  }
  
  // Add overall recommendation based on overall score
  if (overallScore < 3) {
    recommendations.unshift({
      type: 'foundational',
      priority: 'high',
      area: 'Overall Leadership',
      score: overallScore,
      recommendation: assessmentType === 'leadership' 
        ? 'Focus on foundational leadership skills through structured mentoring, leadership training programs, and regular coaching sessions with experienced leaders.'
        : 'Focus on customer service fundamentals through hands-on training, shadowing experienced service leaders, and daily practice with immediate feedback.'
    });
  }
  
  return recommendations.slice(0, 4); // Return max 4 recommendations
};

export default { generateRecommendations };
