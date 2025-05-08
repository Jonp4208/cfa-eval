import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import htmlPdf from 'html-pdf-node';
import { format } from 'date-fns';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../../uploads/invoices');
const ensureUploadsDir = async () => {
  try {
    await fs.mkdir(uploadsDir, { recursive: true });
  } catch (error) {
    console.error('Error creating uploads directory:', error);
  }
};

/**
 * Generate a PDF invoice from an invoice object
 * @param {Object} invoice - The invoice object
 * @returns {Promise<string>} - The path to the generated PDF file
 */
export const generateInvoicePdf = async (invoice) => {
  await ensureUploadsDir();
  
  // Format dates
  const issueDate = invoice.issueDate ? format(new Date(invoice.issueDate), 'MMMM d, yyyy') : 'N/A';
  const dueDate = invoice.dueDate ? format(new Date(invoice.dueDate), 'MMMM d, yyyy') : 'N/A';
  
  // Generate HTML content for the invoice
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Invoice #${invoice.invoiceNumber}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 20px;
          color: #333;
        }
        .invoice-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 30px;
        }
        .invoice-title {
          font-size: 28px;
          color: #1a1a1a;
          margin: 0;
        }
        .invoice-number {
          color: #666;
          margin-top: 5px;
        }
        .invoice-meta {
          text-align: right;
        }
        .invoice-meta p {
          margin: 5px 0;
        }
        .invoice-section {
          margin-bottom: 30px;
        }
        .section-title {
          font-size: 18px;
          margin-bottom: 10px;
          border-bottom: 1px solid #eee;
          padding-bottom: 5px;
        }
        .client-info p {
          margin: 5px 0;
        }
        table {
          width: 100%;
          border-collapse: collapse;
        }
        th, td {
          padding: 12px;
          text-align: left;
          border: 1px solid #ddd;
        }
        th {
          background-color: #f8f9fa;
          font-weight: 600;
        }
        tr:nth-child(even) {
          background-color: #f2f2f2;
        }
        .text-right {
          text-align: right;
        }
        .totals-table {
          width: 100%;
          margin-top: 20px;
        }
        .totals-table td {
          padding: 8px;
        }
        .totals-table .label {
          text-align: right;
          font-weight: bold;
          width: 80%;
        }
        .totals-table .amount {
          text-align: right;
          width: 20%;
        }
        .total-row {
          font-weight: bold;
          background-color: #f8f9fa;
        }
        .terms {
          margin-top: 40px;
        }
        .payment-details {
          margin-top: 30px;
        }
        .footer {
          margin-top: 50px;
          text-align: center;
          color: #666;
          font-size: 14px;
        }
      </style>
    </head>
    <body>
      <div class="invoice-header">
        <div>
          <h1 class="invoice-title">INVOICE</h1>
          <div class="invoice-number">#${invoice.invoiceNumber}</div>
        </div>
        <div class="invoice-meta">
          <p><strong>Issue Date:</strong> ${issueDate}</p>
          <p><strong>Due Date:</strong> ${dueDate}</p>
        </div>
      </div>
      
      <div class="invoice-section">
        <h2 class="section-title">Bill To:</h2>
        <div class="client-info">
          <p><strong>${invoice.client.name}</strong></p>
          ${invoice.client.email ? `<p>Email: ${invoice.client.email}</p>` : ''}
          ${invoice.client.phone ? `<p>Phone: ${invoice.client.phone}</p>` : ''}
          ${invoice.client.address?.street ? `<p>${invoice.client.address.street}</p>` : ''}
          ${(invoice.client.address?.city || invoice.client.address?.state || invoice.client.address?.zipCode) ? 
            `<p>${[
              invoice.client.address?.city, 
              invoice.client.address?.state, 
              invoice.client.address?.zipCode
            ].filter(Boolean).join(', ')}</p>` : ''
          }
          ${invoice.client.address?.country ? `<p>${invoice.client.address.country}</p>` : ''}
        </div>
      </div>
      
      <div class="invoice-section">
        <h2 class="section-title">Invoice Items:</h2>
        <table>
          <thead>
            <tr>
              <th>Description</th>
              <th>Quantity</th>
              <th>Unit Price</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            ${invoice.items.map(item => `
              <tr>
                <td>${item.description}</td>
                <td>${item.quantity}</td>
                <td class="text-right">$${item.unitPrice.toFixed(2)}</td>
                <td class="text-right">$${item.amount.toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <table class="totals-table">
          <tr>
            <td class="label">Subtotal:</td>
            <td class="amount">$${invoice.subtotal.toFixed(2)}</td>
          </tr>
          <tr>
            <td class="label">Tax (${invoice.taxRate}%):</td>
            <td class="amount">$${invoice.taxAmount.toFixed(2)}</td>
          </tr>
          <tr class="total-row">
            <td class="label">Total:</td>
            <td class="amount">$${invoice.total.toFixed(2)}</td>
          </tr>
        </table>
      </div>
      
      <div class="terms">
        <h2 class="section-title">Terms & Conditions:</h2>
        <p>${invoice.terms || 'Payment due within 30 days of invoice date.'}</p>
      </div>
      
      <div class="payment-details">
        <h2 class="section-title">Payment Details:</h2>
        <p><strong>Payment Method:</strong> ${(invoice.paymentMethod || 'bank_transfer').replace('_', ' ')}</p>
        ${invoice.paymentDetails?.bankName ? `<p><strong>Bank:</strong> ${invoice.paymentDetails.bankName}</p>` : ''}
        ${invoice.paymentDetails?.accountName ? `<p><strong>Account Name:</strong> ${invoice.paymentDetails.accountName}</p>` : ''}
        ${invoice.paymentDetails?.accountNumber ? `<p><strong>Account Number:</strong> ${invoice.paymentDetails.accountNumber}</p>` : ''}
        ${invoice.paymentDetails?.routingNumber ? `<p><strong>Routing Number:</strong> ${invoice.paymentDetails.routingNumber}</p>` : ''}
      </div>
      
      <div class="footer">
        <p>Thank you for your business!</p>
      </div>
    </body>
    </html>
  `;
  
  // Generate PDF
  const options = {
    format: 'A4',
    margin: {
      top: '20mm',
      right: '20mm',
      bottom: '20mm',
      left: '20mm'
    }
  };
  
  const file = { content: htmlContent };
  
  try {
    const pdfBuffer = await htmlPdf.generatePdf(file, options);
    
    // Save PDF to file
    const fileName = `invoice-${invoice.invoiceNumber}-${Date.now()}.pdf`;
    const filePath = path.join(uploadsDir, fileName);
    await fs.writeFile(filePath, pdfBuffer);
    
    return filePath;
  } catch (error) {
    console.error('Error generating invoice PDF:', error);
    throw error;
  }
};
