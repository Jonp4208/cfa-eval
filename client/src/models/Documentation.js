// Documentation type definitions

/**
 * Interface for a Document that appears on a user profile
 */
export interface Document {
  id?: string;
  _id?: string | { toString(): string }; // MongoDB ObjectId or its string representation
  type: 'review' | 'disciplinary' | 'coaching' | 'medical' | 'conversation' | 'other';
  date: string;
  title: string;
  description: string;
  createdBy: string;
  fileUrl?: string;
  fileName?: string;
  fileType?: string;
  notifyEmployee?: boolean;
}

/**
 * Interface for a full Documentation Record from the main collection
 */
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
  category: 'Disciplinary' | 'Administrative';
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
    category: 'Disciplinary' | 'Administrative';
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