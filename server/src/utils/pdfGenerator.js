import logger from './logger.js';

/**
 * PDF generation is now handled client-side using @react-pdf/renderer
 * This endpoint returns an error directing users to use client-side generation
 * @param {string} html - HTML content to convert to PDF
 * @param {object} options - PDF generation options
 * @returns {Promise<Buffer>} - PDF buffer
 */
export const generatePDF = async (html, options = {}) => {
  try {
    logger.info('PDF generation request received - redirecting to client-side generation', {
      htmlLength: html.length,
      environment: process.env.NODE_ENV
    });

    // Since html-pdf-node has been removed due to security vulnerabilities,
    // PDF generation is now handled client-side using @react-pdf/renderer
    throw new Error('Server-side PDF generation has been disabled for security reasons. Please use client-side PDF generation with @react-pdf/renderer instead.');

  } catch (error) {
    logger.error('PDF generation error:', {
      error: error.message,
      environment: process.env.NODE_ENV
    });

    throw error;
  }
};
