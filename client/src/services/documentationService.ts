import api from '@/lib/axios';

// Combined record type that includes a source field to identify the origin
export interface CombinedRecord extends Omit<DocumentationRecord, 'source'> {
  source: 'documentation' | 'disciplinary';
}

export interface PIPGoal {
  description: string;
  targetDate: string;
  completed: boolean;
  completedDate?: string;
  evidence?: string;
}

export interface PIPCheckIn {
  date: string;
  completed: boolean;
  notes?: string;
  rating?: number;
  completedBy?: {
    _id: string;
    name: string;
  };
}

export interface PIPResource {
  title: string;
  type: 'training' | 'document' | 'video' | 'meeting';
  url?: string;
  completed: boolean;
  completedDate?: string;
}

export interface PIPDetails {
  goals: PIPGoal[];
  timeline: number;
  checkInDates: PIPCheckIn[];
  resources: PIPResource[];
  successCriteria: string;
  consequences: string;
  finalOutcome: 'successful' | 'unsuccessful' | 'extended' | 'pending';
  finalNotes?: string;
  completedDate?: string;
}

export interface DocumentationRecord {
  _id: string;
  employee: {
    _id: string;
    name: string;
    position: string;
    department: string;
  };
  date: string;
  type: string;
  category: 'Disciplinary' | 'PIP' | 'Administrative';
  severity?: 'Minor' | 'Moderate' | 'Major' | 'Critical';
  status: 'Open' | 'Pending Acknowledgment' | 'Pending Follow-up' | 'Resolved' | 'Documented';
  description: string;
  witnesses?: string;
  actionTaken?: string;
  requiresFollowUp: boolean;
  followUpDate?: string;
  followUpActions?: string;
  acknowledgment?: {
    acknowledged: boolean;
    date: string;
    comments?: string;
    rating: number;
  };
  previousIncidents: boolean;
  documentationAttached: boolean;
  notifyEmployee: boolean;
  pipDetails?: PIPDetails;
  supervisor: {
    _id: string;
    name: string;
  };
  followUps: Array<{
    _id: string;
    date: string;
    note: string;
    by: {
      _id: string;
      name: string;
    };
    status: 'Pending' | 'Completed';
  }>;
  documents: Array<{
    _id: string;
    name: string;
    type: string;
    category: 'Disciplinary' | 'PIP' | 'Administrative';
    url: string;
    uploadedBy: {
      _id: string;
      name: string;
    };
    createdAt: string;
  }>;
  createdBy: {
    _id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateDocumentData {
  employeeId: string;
  date: string;
  type: string;
  category: string;
  severity?: string;
  description: string;
  witnesses?: string;
  actionTaken?: string;
  followUpDate?: string;
  followUpActions?: string;
  previousIncidents: boolean;
  documentationAttached: boolean;
  notifyEmployee: boolean;
  pipDetails?: PIPDetails;
  documentAttachment?: {
    name: string;
    type: string;
    category: string;
    url: string;
    key: string;
  };
}

const documentationService = {
  // Get all documents
  getAllDocuments: async (): Promise<DocumentationRecord[]> => {
    const response = await api.get('/api/documentation');
    return response.data;
  },

  // Get employee documents
  getEmployeeDocuments: async (employeeId: string): Promise<DocumentationRecord[]> => {
    const response = await api.get(`/api/documentation/employee/${employeeId}`);
    return response.data;
  },

  // Get document by ID
  getDocumentById: async (id: string): Promise<DocumentationRecord> => {
    const response = await api.get(`/api/documentation/${id}`);
    return response.data;
  },

  // Create new document
  createDocument: async (data: CreateDocumentData): Promise<DocumentationRecord> => {
    // First create the document
    const response = await api.post('/api/documentation', data);
    const createdDocument = response.data;
    
    // If document attachment is provided, attach it to the document
    if (data.documentAttachment) {
      const attachmentData = {
        name: data.documentAttachment.name,
        type: data.documentAttachment.type,
        category: data.documentAttachment.category,
        url: data.documentAttachment.url
      };
      
      // Attach the document
      await api.post(`/api/documentation/${createdDocument._id}/document`, attachmentData);
      
      // Refresh the document data
      const updatedResponse = await api.get(`/api/documentation/${createdDocument._id}`);
      return updatedResponse.data;
    }
    
    return createdDocument;
  },

  // Upload file and attach to a document
  uploadDocumentFile: async (file: File): Promise<{url: string, key: string, name: string, type: string}> => {
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      // Set a timeout of 30 seconds for the upload
      const response = await api.post('/api/users/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        timeout: 30000, // 30 second timeout
        onUploadProgress: (progressEvent) => {
          console.log('Upload progress:', Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1)), '%');
        }
      });
      return response.data;
    } catch (error: any) {
      console.error('File upload failed:', error.message);
      if (error.code === 'ECONNABORTED') {
        throw new Error('File upload timed out. Please try with a smaller file or check your connection.');
      }
      throw error;
    }
  },

  // Update document
  updateDocument: async (id: string, data: Partial<CreateDocumentData>): Promise<DocumentationRecord> => {
    const response = await api.put(`/api/documentation/${id}`, data);
    return response.data;
  },

  // Acknowledge document
  acknowledgeDocument: async (id: string, data: { comments?: string; rating: number }): Promise<DocumentationRecord> => {
    const response = await api.post(`/api/documentation/${id}/acknowledge`, data);
    return response.data;
  },

  // Add follow-up
  addFollowUp: async (id: string, data: { date: string; note: string; status: string }): Promise<DocumentationRecord> => {
    const response = await api.post(`/api/documentation/${id}/follow-up`, data);
    return response.data;
  },

  // Complete follow-up
  completeFollowUp: async (id: string, followUpId: string, data: { note: string }): Promise<DocumentationRecord> => {
    const response = await api.post(`/api/documentation/${id}/follow-up/${followUpId}/complete`, data);
    return response.data;
  },

  // Add document attachment
  addDocumentAttachment: async (id: string, data: { name: string; type: string; category: string; url: string }): Promise<DocumentationRecord> => {
    const response = await api.post(`/api/documentation/${id}/document`, data);
    return response.data;
  },

  // Delete document
  deleteDocument: async (id: string): Promise<void> => {
    await api.delete(`/api/documentation/${id}`);
  },

  // Delete document attachment
  deleteDocumentAttachment: async (documentId: string, attachmentId: string): Promise<{ message: string }> => {
    const response = await api.delete(`/api/documentation/${documentId}/document/${attachmentId}`);
    return response.data;
  },

  // Get all documentation and disciplinary records combined
  getAllCombinedRecords: async (): Promise<CombinedRecord[]> => {
    try {
      // Fetch both types of records
      let documentationRecords = [];
      let disciplinaryRecords = [];

      try {
        const documentationResponse = await api.get('/api/documentation');
        documentationRecords = documentationResponse.data;
        console.log('Raw documentation records:', documentationRecords);
      } catch (error) {
        console.warn('Documentation API not available:', error);
      }

      try {
        const disciplinaryResponse = await api.get('/api/disciplinary');
        disciplinaryRecords = disciplinaryResponse.data;
        console.log('Raw disciplinary records:', disciplinaryRecords);
      } catch (error) {
        console.warn('Disciplinary API not available:', error);
      }

      // Process documentation records
      const taggedDocumentationRecords = documentationRecords
        .filter((record: DocumentationRecord) => record && record._id && record.employee && record.employee._id)
        .map((record: DocumentationRecord) => ({
          ...record,
          source: 'documentation'
        }));

      // Process disciplinary records
      const taggedDisciplinaryRecords = disciplinaryRecords
        .filter((record: any) => record && record._id && record.employee && record.employee._id)
        .map((record: any) => ({
          ...record,
          source: 'disciplinary',
          // Ensure these fields exist for compatibility
          category: 'Disciplinary',
          status: record.status || 'Open',
          description: record.description || '(No description)',
          type: record.type || 'Disciplinary'
        }));

      // Combine all records
      const allRecords = [...taggedDocumentationRecords, ...taggedDisciplinaryRecords];

      // Log the records
      console.log('Documentation records:', taggedDocumentationRecords.length);
      console.log('Disciplinary records:', taggedDisciplinaryRecords.length);
      console.log('Total records:', allRecords.length);

      return allRecords;
    } catch (error) {
      console.error('Error fetching combined records:', error);
      throw error;
    }
  },

  // Send email
  sendEmail: async (id: string): Promise<{ message: string }> => {
    const response = await api.post(`/api/documentation/${id}/send-email`);
    return response.data;
  },

  // Send unacknowledged notification
  sendUnacknowledgedNotification: async (id: string): Promise<{ message: string }> => {
    const response = await api.post(`/api/documentation/${id}/notify-unacknowledged`);
    return response.data;
  }
};

export default documentationService;
