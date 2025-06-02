import api from '@/lib/axios';

export interface Message {
  _id: string;
  userId: string;
  storeId: string;
  subject: string;
  message: string;
  category: 'bug' | 'feature_request' | 'question' | 'billing' | 'technical_support' | 'other';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'new' | 'in_progress' | 'resolved' | 'closed';
  contactEmail: string;
  contactPhone?: string;
  adminResponse?: string;
  respondedBy?: string;
  respondedAt?: string;
  readAt?: string;
  resolvedAt?: string;
  createdAt: string;
  updatedAt: string;
  userDetails?: {
    _id: string;
    name: string;
    email: string;
    position: string;
    departments: string[];
  };
  storeDetails?: {
    _id: string;
    name: string;
    storeNumber: string;
    storeAddress: string;
  };
}

export interface CreateMessageData {
  subject: string;
  message: string;
  category: Message['category'];
  contactEmail: string;
  contactPhone?: string;
  priority?: Message['priority'];
}

export interface UpdateMessageStatusData {
  status: Message['status'];
  adminResponse?: string;
}

export interface MessageStats {
  overview: {
    total: number;
    new: number;
    inProgress: number;
    resolved: number;
    closed: number;
    urgent: number;
    high: number;
  };
  byCategory: Array<{
    _id: string;
    count: number;
  }>;
}

export interface MessagesResponse {
  messages: Message[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

const messageService = {
  /**
   * Create a new message
   */
  createMessage: async (messageData: CreateMessageData): Promise<{ message: string; data: Message }> => {
    const response = await api.post('/api/messages', messageData);
    return response.data;
  },

  /**
   * Get user's own messages
   */
  getUserMessages: async (params?: {
    status?: string;
    category?: string;
    priority?: string;
    page?: number;
    limit?: number;
  }): Promise<MessagesResponse> => {
    const response = await api.get('/api/messages/my-messages', { params });
    return response.data;
  },

  /**
   * Get user's message by ID
   */
  getUserMessageById: async (id: string): Promise<{ message: Message }> => {
    const response = await api.get(`/api/messages/my-messages/${id}`);
    return response.data;
  },

  /**
   * Get all messages (admin only)
   */
  getAllMessages: async (params?: {
    status?: string;
    category?: string;
    priority?: string;
    page?: number;
    limit?: number;
  }): Promise<MessagesResponse> => {
    const response = await api.get('/api/messages', { params });
    return response.data;
  },

  /**
   * Get message by ID (admin only)
   */
  getMessageById: async (id: string): Promise<{ message: Message }> => {
    const response = await api.get(`/api/messages/${id}`);
    return response.data;
  },

  /**
   * Update message status (admin only)
   */
  updateMessageStatus: async (id: string, updateData: UpdateMessageStatusData): Promise<{ message: string; data: Message }> => {
    const response = await api.put(`/api/messages/${id}/status`, updateData);
    return response.data;
  },

  /**
   * Get message statistics (admin only)
   */
  getMessageStats: async (): Promise<MessageStats> => {
    const response = await api.get('/api/messages/stats');
    return response.data;
  }
};

export default messageService;
