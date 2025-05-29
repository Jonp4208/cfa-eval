import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
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
 * Invoice PDF generation is now handled client-side using @react-pdf/renderer
 * This function returns an error directing users to use client-side generation
 * @param {Object} invoice - The invoice object
 * @returns {Promise<string>} - The path to the generated PDF file
 */
export const generateInvoicePdf = async (invoice) => {
  throw new Error('Server-side invoice PDF generation has been disabled for security reasons. Please use client-side PDF generation with @react-pdf/renderer instead.');
};
