import api from '@/lib/axios';

export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

export interface InvoiceClient {
  name: string;
  email: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  phone?: string;
}

export interface PaymentDetails {
  bankName?: string;
  accountName?: string;
  accountNumber?: string;
  routingNumber?: string;
  swiftCode?: string;
}

export interface Invoice {
  _id?: string;
  invoiceNumber?: string;
  client: InvoiceClient;
  issueDate: Date | string;
  dueDate: Date | string;
  items: InvoiceItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  notes?: string;
  terms?: string;
  status?: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  paymentMethod?: 'bank_transfer' | 'credit_card' | 'paypal' | 'cash' | 'check' | 'other';
  paymentDetails?: PaymentDetails;
  sentAt?: Date | string;
  paidAt?: Date | string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface InvoiceFilter {
  status?: string;
  client?: string;
}

const invoiceService = {
  // Get all invoices with optional filtering
  getAllInvoices: async (filter?: InvoiceFilter) => {
    const response = await api.get('/api/invoices', { params: filter });
    return response.data.invoices;
  },

  // Get a single invoice by ID
  getInvoiceById: async (id: string) => {
    const response = await api.get(`/api/invoices/${id}`);
    return response.data.invoice;
  },

  // Create a new invoice
  createInvoice: async (invoiceData: Invoice) => {
    const response = await api.post('/api/invoices', invoiceData);
    return response.data.invoice;
  },

  // Update an existing invoice
  updateInvoice: async (id: string, invoiceData: Partial<Invoice>) => {
    const response = await api.put(`/api/invoices/${id}`, invoiceData);
    return response.data.invoice;
  },

  // Send an invoice by email
  sendInvoice: async (id: string) => {
    const response = await api.post(`/api/invoices/${id}/send`);
    return response.data;
  },

  // Mark an invoice as paid
  markAsPaid: async (id: string) => {
    const response = await api.post(`/api/invoices/${id}/mark-paid`);
    return response.data;
  },

  // Delete a draft invoice
  deleteInvoice: async (id: string) => {
    const response = await api.delete(`/api/invoices/${id}`);
    return response.data;
  },

  // Calculate invoice totals
  calculateTotals: (items: InvoiceItem[], taxRate: number = 0) => {
    const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
    const taxAmount = (subtotal * taxRate) / 100;
    const total = subtotal + taxAmount;
    
    return {
      subtotal,
      taxAmount,
      total
    };
  }
};

export default invoiceService;
