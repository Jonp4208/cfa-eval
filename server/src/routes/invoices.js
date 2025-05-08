import express from 'express';
import { auth } from '../middleware/auth.js';
import { isStoreAdmin } from '../middleware/roles.js';
import Invoice from '../models/Invoice.js';
import expressAsyncHandler from 'express-async-handler';
import { sendEmail } from '../utils/email.js';
import { generateInvoicePdf } from '../utils/invoicePdf.js';
import fs from 'fs/promises';
import path from 'path';

const router = express.Router();

// All routes require authentication
router.use(auth);

// All invoice routes require admin access
router.use(isStoreAdmin);

// Get all invoices
router.get('/', expressAsyncHandler(async (req, res) => {
  const { status, client } = req.query;
  const filter = { store: req.user.store };

  if (status) {
    filter.status = status;
  }

  if (client) {
    filter['client.name'] = { $regex: client, $options: 'i' };
  }

  const invoices = await Invoice.find(filter)
    .sort({ createdAt: -1 });

  res.json({ invoices });
}));

// Get invoice by ID
router.get('/:id', expressAsyncHandler(async (req, res) => {
  const invoice = await Invoice.findOne({
    _id: req.params.id,
    store: req.user.store
  });

  if (!invoice) {
    return res.status(404).json({ message: 'Invoice not found' });
  }

  res.json({ invoice });
}));

// Create new invoice
router.post('/', expressAsyncHandler(async (req, res) => {
  const {
    client,
    issueDate,
    dueDate,
    items,
    subtotal,
    taxRate,
    taxAmount,
    total,
    notes,
    terms,
    paymentMethod,
    paymentDetails
  } = req.body;

  try {
    const invoice = new Invoice({
      client,
      issueDate: issueDate || new Date(),
      dueDate,
      items,
      subtotal,
      taxRate: taxRate || 0,
      taxAmount: taxAmount || 0,
      total,
      notes,
      terms,
      status: 'draft',
      paymentMethod: paymentMethod || 'bank_transfer',
      paymentDetails,
      createdBy: req.user._id,
      store: req.user.store
    });

    console.log('Creating invoice with data:', {
      client: client.name,
      items: items.length,
      total,
      store: req.user.store
    });

    const savedInvoice = await invoice.save();
    console.log('Invoice saved successfully:', savedInvoice._id);
    res.status(201).json({ invoice: savedInvoice });
  } catch (error) {
    console.error('Error creating invoice:', error);
    res.status(500).json({
      message: 'Failed to create invoice',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}));

// Update invoice
router.put('/:id', expressAsyncHandler(async (req, res) => {
  const invoice = await Invoice.findOne({
    _id: req.params.id,
    store: req.user.store
  });

  if (!invoice) {
    return res.status(404).json({ message: 'Invoice not found' });
  }

  // Don't allow updating sent invoices
  if (invoice.status === 'sent' || invoice.status === 'paid') {
    return res.status(400).json({
      message: 'Cannot update invoices that have been sent or paid'
    });
  }

  const {
    client,
    issueDate,
    dueDate,
    items,
    subtotal,
    taxRate,
    taxAmount,
    total,
    notes,
    terms,
    paymentMethod,
    paymentDetails
  } = req.body;

  // Update fields
  if (client) invoice.client = client;
  if (issueDate) invoice.issueDate = issueDate;
  if (dueDate) invoice.dueDate = dueDate;
  if (items) invoice.items = items;
  if (subtotal !== undefined) invoice.subtotal = subtotal;
  if (taxRate !== undefined) invoice.taxRate = taxRate;
  if (taxAmount !== undefined) invoice.taxAmount = taxAmount;
  if (total !== undefined) invoice.total = total;
  if (notes !== undefined) invoice.notes = notes;
  if (terms !== undefined) invoice.terms = terms;
  if (paymentMethod) invoice.paymentMethod = paymentMethod;
  if (paymentDetails) invoice.paymentDetails = paymentDetails;

  await invoice.save();
  res.json({ invoice });
}));

// Send invoice by email
router.post('/:id/send', expressAsyncHandler(async (req, res) => {
  const invoice = await Invoice.findOne({
    _id: req.params.id,
    store: req.user.store
  });

  if (!invoice) {
    return res.status(404).json({ message: 'Invoice not found' });
  }

  // Create email content
  const emailContent = `
    <h1>Invoice #${invoice.invoiceNumber}</h1>
    <p>Dear ${invoice.client.name},</p>
    <p>Please find attached your invoice #${invoice.invoiceNumber} for the amount of $${invoice.total.toFixed(2)}.</p>
    <p>Due date: ${new Date(invoice.dueDate).toLocaleDateString()}</p>
    <h2>Invoice Details</h2>
    <table border="1" cellpadding="5" style="border-collapse: collapse;">
      <tr>
        <th>Description</th>
        <th>Quantity</th>
        <th>Unit Price</th>
        <th>Amount</th>
      </tr>
      ${invoice.items.map(item => `
        <tr>
          <td>${item.description}</td>
          <td>${item.quantity}</td>
          <td>$${item.unitPrice.toFixed(2)}</td>
          <td>$${item.amount.toFixed(2)}</td>
        </tr>
      `).join('')}
      <tr>
        <td colspan="3" align="right"><strong>Subtotal:</strong></td>
        <td>$${invoice.subtotal.toFixed(2)}</td>
      </tr>
      <tr>
        <td colspan="3" align="right"><strong>Tax (${invoice.taxRate}%):</strong></td>
        <td>$${invoice.taxAmount.toFixed(2)}</td>
      </tr>
      <tr>
        <td colspan="3" align="right"><strong>Total:</strong></td>
        <td>$${invoice.total.toFixed(2)}</td>
      </tr>
    </table>
    ${invoice.notes ? `<p><strong>Notes:</strong> ${invoice.notes}</p>` : ''}
    ${invoice.terms ? `<p><strong>Terms:</strong> ${invoice.terms}</p>` : ''}
    <h3>Payment Details</h3>
    <p>Payment Method: ${invoice.paymentMethod.replace('_', ' ')}</p>
    ${invoice.paymentDetails.bankName ? `<p>Bank: ${invoice.paymentDetails.bankName}</p>` : ''}
    ${invoice.paymentDetails.accountName ? `<p>Account Name: ${invoice.paymentDetails.accountName}</p>` : ''}
    ${invoice.paymentDetails.accountNumber ? `<p>Account Number: ${invoice.paymentDetails.accountNumber}</p>` : ''}
    <p>Thank you for your business!</p>
  `;

  try {
    let emailSent = false;
    let pdfPath = null;

    try {
      // Generate PDF invoice
      console.log('Generating PDF for invoice:', invoice.invoiceNumber);
      pdfPath = await generateInvoicePdf(invoice);
      console.log('PDF generated successfully at:', pdfPath);

      // Prepare email with PDF attachment
      const attachments = [{
        filename: `Invoice-${invoice.invoiceNumber}.pdf`,
        path: pdfPath,
        contentType: 'application/pdf'
      }];

      // Send email with attachment
      await sendEmail({
        to: invoice.client.email,
        subject: `Invoice #${invoice.invoiceNumber}`,
        html: emailContent,
        attachments
      });

      emailSent = true;
      console.log(`Email with PDF attachment sent successfully to ${invoice.client.email}`);
    } catch (emailError) {
      console.error('Error sending invoice email:', emailError);
      // We'll continue even if email fails
    } finally {
      // Clean up the temporary PDF file if it was created
      if (pdfPath) {
        try {
          await fs.unlink(pdfPath);
          console.log('Temporary PDF file deleted:', pdfPath);
        } catch (unlinkError) {
          console.error('Error deleting temporary PDF file:', unlinkError);
        }
      }
    }

    // Update invoice status regardless of email success
    invoice.status = 'sent';
    invoice.sentAt = new Date();
    await invoice.save();

    res.json({
      success: true,
      message: emailSent
        ? 'Invoice marked as sent and email sent successfully with PDF attachment'
        : 'Invoice marked as sent, but email could not be sent. Please check your email configuration.',
      emailSent,
      invoice
    });
  } catch (error) {
    console.error('Error processing invoice:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process invoice',
      error: error.message
    });
  }
}));

// Mark invoice as paid
router.post('/:id/mark-paid', expressAsyncHandler(async (req, res) => {
  const invoice = await Invoice.findOne({
    _id: req.params.id,
    store: req.user.store
  });

  if (!invoice) {
    return res.status(404).json({ message: 'Invoice not found' });
  }

  invoice.status = 'paid';
  invoice.paidAt = new Date();
  await invoice.save();

  res.json({
    success: true,
    message: 'Invoice marked as paid',
    invoice
  });
}));

// Delete invoice (only drafts can be deleted)
router.delete('/:id', expressAsyncHandler(async (req, res) => {
  const invoice = await Invoice.findOne({
    _id: req.params.id,
    store: req.user.store
  });

  if (!invoice) {
    return res.status(404).json({ message: 'Invoice not found' });
  }

  if (invoice.status !== 'draft') {
    return res.status(400).json({
      message: 'Only draft invoices can be deleted'
    });
  }

  await Invoice.deleteOne({ _id: invoice._id });

  res.json({
    success: true,
    message: 'Invoice deleted successfully'
  });
}));

export default router;
