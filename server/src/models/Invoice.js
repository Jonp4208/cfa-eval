import mongoose from 'mongoose';

const invoiceSchema = new mongoose.Schema({
  invoiceNumber: {
    type: String,
    unique: true
  },
  client: {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    },
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String
    },
    phone: String
  },
  issueDate: {
    type: Date,
    default: Date.now,
    required: true
  },
  dueDate: {
    type: Date,
    required: true
  },
  items: [{
    description: {
      type: String,
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    unitPrice: {
      type: Number,
      required: true,
      min: 0
    },
    amount: {
      type: Number,
      required: true,
      min: 0
    }
  }],
  subtotal: {
    type: Number,
    required: true,
    min: 0
  },
  taxRate: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  taxAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  total: {
    type: Number,
    required: true,
    min: 0
  },
  notes: String,
  terms: String,
  status: {
    type: String,
    enum: ['draft', 'sent', 'paid', 'overdue', 'cancelled'],
    default: 'draft'
  },
  paymentMethod: {
    type: String,
    enum: ['bank_transfer', 'credit_card', 'paypal', 'cash', 'check', 'other'],
    default: 'bank_transfer'
  },
  paymentDetails: {
    bankName: String,
    accountName: String,
    accountNumber: String,
    routingNumber: String,
    swiftCode: String
  },
  sentAt: Date,
  paidAt: Date,
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  store: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Store',
    required: true
  }
}, {
  timestamps: true
});

// Generate a unique invoice number before saving
invoiceSchema.pre('save', async function(next) {
  if (!this.isNew || this.invoiceNumber) {
    return next();
  }

  try {
    console.log('Generating invoice number for store:', this.store);

    // Find the latest invoice by _id instead of createdAt
    const latestInvoice = await this.constructor.findOne({
      store: this.store
    }).sort({ _id: -1 });

    let nextNumber = 1;
    if (latestInvoice && latestInvoice.invoiceNumber) {
      console.log('Found latest invoice:', latestInvoice.invoiceNumber);
      // Extract the numeric part if the invoice number follows a pattern like INV-0001
      const match = latestInvoice.invoiceNumber.match(/(\d+)$/);
      if (match) {
        nextNumber = parseInt(match[1], 10) + 1;
      }
    }

    // Format with leading zeros (e.g., INV-0001)
    this.invoiceNumber = `INV-${nextNumber.toString().padStart(4, '0')}`;
    console.log('Generated invoice number:', this.invoiceNumber);
    next();
  } catch (error) {
    console.error('Error generating invoice number:', error);
    // Don't fail the save if we can't generate a number
    this.invoiceNumber = `INV-${Date.now()}`;
    next();
  }
});

export default mongoose.model('Invoice', invoiceSchema);
