import logger from './logger.js';

/**
 * Generate PDF from HTML content using html-pdf-node with production-ready configuration
 * @param {string} html - HTML content to convert to PDF
 * @param {object} options - PDF generation options
 * @returns {Promise<Buffer>} - PDF buffer
 */
export const generatePDF = async (html, options = {}) => {
  try {
    logger.info('Starting PDF generation', {
      htmlLength: html.length,
      environment: process.env.NODE_ENV,
      platform: process.platform,
      nodeVersion: process.version
    });

    // Import html-pdf-node dynamically
    const htmlPdf = await import('html-pdf-node');
    logger.info('html-pdf-node imported successfully');

    // Prepare full HTML with proper styling
    const fullHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            * {
              box-sizing: border-box;
            }
            body {
              font-family: 'Segoe UI', Arial, sans-serif;
              line-height: 1.6;
              color: #2d3748;
              margin: 0;
              padding: 15mm;
              background: white;
            }
            @page {
              margin: 15mm;
              size: A4;
            }
            @media print {
              body {
                padding: 0;
              }
            }
          </style>
        </head>
        <body>
          ${html}
        </body>
      </html>
    `;

    // Configure PDF options with production-specific settings
    const pdfOptions = {
      format: options.format || 'A4',
      margin: options.margin || {
        top: '15mm',
        right: '15mm',
        bottom: '15mm',
        left: '15mm'
      },
      printBackground: options.printBackground !== false,
      preferCSSPageSize: options.preferCSSPageSize !== false,
      displayHeaderFooter: false,
      timeout: 60000
    };

    // Add production-specific Puppeteer launch options
    if (process.env.NODE_ENV === 'production') {
      pdfOptions.args = [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--single-process',
        '--disable-gpu',
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor'
      ];
      
      // Use the Chrome executable provided by the Heroku buildpack
      if (process.env.GOOGLE_CHROME_BIN) {
        pdfOptions.executablePath = process.env.GOOGLE_CHROME_BIN;
        logger.info('Using Chrome executable from buildpack:', process.env.GOOGLE_CHROME_BIN);
      } else if (process.env.CHROME_BIN) {
        pdfOptions.executablePath = process.env.CHROME_BIN;
        logger.info('Using Chrome executable from CHROME_BIN:', process.env.CHROME_BIN);
      } else {
        logger.warn('No Chrome executable path found in environment variables');
      }
    }

    logger.info('Generating PDF with options:', {
      format: pdfOptions.format,
      timeout: pdfOptions.timeout,
      executablePath: pdfOptions.executablePath || 'default',
      argsCount: pdfOptions.args ? pdfOptions.args.length : 0
    });

    // Generate PDF
    const pdfBuffer = await htmlPdf.default.generatePdf(
      { content: fullHtml },
      pdfOptions
    );

    logger.info('PDF generated successfully', { 
      bufferSize: pdfBuffer.length,
      bufferType: typeof pdfBuffer
    });

    return pdfBuffer;

  } catch (error) {
    logger.error('Error generating PDF:', {
      error: error.message,
      stack: error.stack,
      name: error.name,
      environment: process.env.NODE_ENV,
      chromeExecutable: process.env.GOOGLE_CHROME_BIN || process.env.CHROME_BIN || 'not set',
      platform: process.platform
    });
    
    throw error;
  }
};

/**
 * Test PDF generation functionality
 * @returns {Promise<boolean>} - True if PDF generation works
 */
export const testPDFGeneration = async () => {
  try {
    const testHtml = '<h1>Test PDF</h1><p>This is a test PDF generation.</p>';
    const pdfBuffer = await generatePDF(testHtml);
    return pdfBuffer && pdfBuffer.length > 0;
  } catch (error) {
    logger.error('PDF generation test failed:', error);
    return false;
  }
};
