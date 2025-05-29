import api from '../axios';

export interface TeamSurvey {
  _id: string;
  title: string;
  description: string;
  store: string;
  createdBy: {
    _id: string;
    name: string;
    email: string;
  };
  status: 'draft' | 'active' | 'closed' | 'archived';
  questions: SurveyQuestion[];
  targetAudience: {
    departments: string[];
    positions: string[];
    includeAll: boolean;
  };
  schedule: {
    startDate: string;
    endDate: string;
    frequency: 'one-time' | 'quarterly' | 'monthly';
  };
  analytics: {
    totalInvited: number;
    totalResponses: number;
    responseRate: number;
    lastCalculated?: string;
  };
  settings: {
    allowMultipleResponses: boolean;
    showProgressBar: boolean;
    requireAllQuestions: boolean;
    sendReminders: boolean;
    reminderDays: number[];
  };
  createdAt: string;
  updatedAt: string;
}

export interface SurveyQuestion {
  id: string;
  text: string;
  type: 'rating' | 'text' | 'multiple_choice';
  required: boolean;
  options?: string[];
  ratingScale?: {
    min: number;
    max: number;
  };
}

export interface SurveyResponse {
  _id: string;
  survey: string;
  demographics: {
    department: string;
    position: string;
    experienceLevel: string;
    employmentType: string;
  };
  responses: {
    questionId: string;
    questionText: string;
    questionType: string;
    answer: any;
    skipped: boolean;
  }[];
  status: 'in_progress' | 'completed' | 'abandoned';
  completionPercentage: number;
  completedAt?: string;
  metadata: {
    timeSpent: number;
    deviceType: string;
  };
}

export interface DashboardStats {
  activeSurveys: number;
  totalResponses: number;
  avgResponseRate: number;
  recentSurveys: Partial<TeamSurvey>[];
}

export interface SurveyAnalytics {
  survey: {
    id: string;
    title: string;
    status: string;
    analytics: TeamSurvey['analytics'];
  };
  overallScore: number | null;
  questionAnalytics: {
    questionId: string;
    questionText: string;
    questionType: string;
    totalResponses: number;
    averageRating?: number;
    textResponses?: string[];
    ratingDistribution?: number[];
  }[];
  demographics: {
    totalResponses: number;
    departmentBreakdown: string[];
    positionBreakdown: string[];
    experienceBreakdown: string[];
    employmentTypeBreakdown: string[];
  };
  responseTimeline: {
    _id: string;
    count: number;
  }[];
}

class TeamSurveysService {
  // Dashboard
  async getDashboardStats(): Promise<DashboardStats> {
    const response = await api.get('/api/team-surveys/dashboard');
    return response.data;
  }

  // Survey Management
  async getSurveys(params?: { status?: string; page?: number; limit?: number }): Promise<{
    surveys: TeamSurvey[];
    pagination: {
      current: number;
      pages: number;
      total: number;
    };
  }> {
    const response = await api.get('/api/team-surveys', { params });
    return response.data;
  }

  async getSurvey(surveyId: string): Promise<TeamSurvey> {
    const response = await api.get(`/api/team-surveys/${surveyId}`);
    return response.data;
  }

  async createSurvey(surveyData: Partial<TeamSurvey>): Promise<{ message: string; survey: TeamSurvey }> {
    const response = await api.post('/api/team-surveys', surveyData);
    return response.data;
  }

  async updateSurvey(surveyId: string, surveyData: Partial<TeamSurvey>): Promise<{ message: string; survey: TeamSurvey }> {
    const response = await api.put(`/api/team-surveys/${surveyId}`, surveyData);
    return response.data;
  }

  async deleteSurvey(surveyId: string): Promise<{ message: string }> {
    const response = await api.delete(`/api/team-surveys/${surveyId}`);
    return response.data;
  }

  // Survey Lifecycle
  async activateSurvey(surveyId: string): Promise<{ message: string; survey: TeamSurvey; tokensGenerated: number }> {
    const response = await api.post(`/api/team-surveys/${surveyId}/activate`);
    return response.data;
  }

  async closeSurvey(surveyId: string): Promise<{ message: string; survey: TeamSurvey }> {
    const response = await api.post(`/api/team-surveys/${surveyId}/close`);
    return response.data;
  }

  async generateTokens(surveyId: string, userIds: string[]): Promise<{ message: string; tokens: { userId: string; token: string }[] }> {
    const response = await api.post(`/api/team-surveys/${surveyId}/generate-tokens`, { userIds });
    return response.data;
  }

  // Analytics and Reporting


  async getSurveyAnalytics(surveyId: string, filters?: {
    department?: string;
    position?: string;
    experienceLevel?: string;
    employmentType?: string;
  }): Promise<SurveyAnalytics> {
    const params = new URLSearchParams();
    if (filters?.department) params.append('department', filters.department);
    if (filters?.position) params.append('position', filters.position);
    if (filters?.experienceLevel) params.append('experienceLevel', filters.experienceLevel);
    if (filters?.employmentType) params.append('employmentType', filters.employmentType);

    const response = await api.get(`/api/team-surveys/${surveyId}/analytics?${params.toString()}`);
    return response.data;
  }

  async exportSurveyResults(surveyId: string): Promise<any> {
    const response = await api.get(`/api/team-surveys/${surveyId}/export`);
    return response.data;
  }

  // Anonymous Survey Taking (no auth required)
  async getSurveyByToken(token: string): Promise<{
    survey: {
      id: string;
      title: string;
      description: string;
      questions: SurveyQuestion[];
      settings: TeamSurvey['settings'];
    };
    existingResponse: Partial<SurveyResponse> | null;
    suggestedDemographics?: SurveyResponse['demographics'];
  }> {
    const response = await api.get(`/api/team-surveys/take/${token}`);
    return response.data;
  }

  async submitSurveyResponse(token: string, responseData: {
    demographics: SurveyResponse['demographics'];
    responses: SurveyResponse['responses'];
    deviceInfo?: {
      deviceType: string;
      userAgent: string;
    };
  }): Promise<{ message: string; responseId: string }> {
    const response = await api.post(`/api/team-surveys/take/${token}`, responseData);
    return response.data;
  }

  async updateSurveyResponse(token: string, responseData: {
    demographics?: Partial<SurveyResponse['demographics']>;
    responses?: SurveyResponse['responses'];
    deviceInfo?: {
      deviceType: string;
      userAgent: string;
    };
  }): Promise<{ message: string; response: { id: string; completionPercentage: number; status: string } }> {
    const response = await api.put(`/api/team-surveys/take/${token}`, responseData);
    return response.data;
  }

  // Helper methods
  getDefaultQuestions(): SurveyQuestion[] {
    return [
      {
        id: 'q1',
        text: 'How satisfied are you with your overall work experience at Chick-fil-A?',
        type: 'rating',
        required: true,
        ratingScale: { min: 1, max: 10 }
      },
      {
        id: 'q2',
        text: 'How would you rate your work-life balance?',
        type: 'rating',
        required: true,
        ratingScale: { min: 1, max: 10 }
      },
      {
        id: 'q3',
        text: 'Do you feel that Chick-fil-A values and respects your contributions?',
        type: 'rating',
        required: true,
        ratingScale: { min: 1, max: 10 }
      },
      {
        id: 'q4',
        text: 'How comfortable are you with the working conditions (e.g., cleanliness, equipment, facilities)?',
        type: 'rating',
        required: true,
        ratingScale: { min: 1, max: 10 }
      },
      {
        id: 'q5',
        text: 'How would you rate the communication between team members and leadership?',
        type: 'rating',
        required: true,
        ratingScale: { min: 1, max: 10 }
      }
      // Add more default questions as needed
    ];
  }

  getDeviceInfo() {
    const userAgent = navigator.userAgent;
    let deviceType = 'desktop';

    if (/Mobile|Android|iPhone|iPad/.test(userAgent)) {
      if (/iPad/.test(userAgent)) {
        deviceType = 'tablet';
      } else {
        deviceType = 'mobile';
      }
    }

    return {
      deviceType,
      userAgent
    };
  }
}

export const teamSurveysService = new TeamSurveysService();
