import { pdf } from '@react-pdf/renderer';
import { createElement } from 'react';
import PlaybookPDF from './ReactPdfPlaybook';
import { Playbook } from '../types';

export type ProgressCallback = (step: string, progress: number) => void;

/**
 * Generate and download a PDF using React PDF (client-side only)
 * @param playbook - The playbook data to convert to PDF
 * @param onProgress - Optional progress callback
 */
export const generateReactPDF = async (
  playbook: Playbook, 
  onProgress?: ProgressCallback
): Promise<Blob> => {
  try {
    onProgress?.('Preparing PDF document...', 10);

    // Create the React PDF document
    const MyDocument = createElement(PlaybookPDF, { playbook });
    
    onProgress?.('Generating PDF...', 50);

    // Generate the PDF blob
    const blob = await pdf(MyDocument).toBlob();
    
    onProgress?.('PDF generated successfully!', 100);

    return blob;
  } catch (error) {
    console.error('Error generating React PDF:', error);
    throw new Error(`Failed to generate PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Download a PDF file using React PDF
 * @param playbook - The playbook data to convert to PDF
 * @param onProgress - Optional progress callback
 */
export const downloadReactPDF = async (
  playbook: Playbook,
  onProgress?: ProgressCallback
): Promise<void> => {
  try {
    // Generate the PDF blob
    const pdfBlob = await generateReactPDF(playbook, onProgress);

    // Create download link
    const url = URL.createObjectURL(pdfBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${playbook.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_playbook.pdf`;
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error downloading React PDF:', error);
    throw error;
  }
};

/**
 * Preview a PDF in a new window/tab using React PDF
 * @param playbook - The playbook data to convert to PDF
 * @param onProgress - Optional progress callback
 */
export const previewReactPDF = async (
  playbook: Playbook,
  onProgress?: ProgressCallback
): Promise<void> => {
  try {
    // Generate the PDF blob
    const pdfBlob = await generateReactPDF(playbook, onProgress);

    // Create blob URL and open in new window
    const url = URL.createObjectURL(pdfBlob);
    const newWindow = window.open(url, '_blank');
    
    if (!newWindow) {
      throw new Error('Failed to open PDF preview. Please check your popup blocker settings.');
    }

    // Clean up URL after a delay to allow the window to load
    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 1000);
  } catch (error) {
    console.error('Error previewing React PDF:', error);
    throw error;
  }
};

/**
 * Get PDF as base64 string using React PDF
 * @param playbook - The playbook data to convert to PDF
 * @param onProgress - Optional progress callback
 */
export const getPDFAsBase64 = async (
  playbook: Playbook,
  onProgress?: ProgressCallback
): Promise<string> => {
  try {
    onProgress?.('Preparing PDF document...', 10);

    // Create the React PDF document
    const MyDocument = createElement(PlaybookPDF, { playbook });
    
    onProgress?.('Generating PDF...', 50);

    // Generate the PDF as base64
    const base64 = await pdf(MyDocument).toString();
    
    onProgress?.('PDF generated successfully!', 100);

    return base64;
  } catch (error) {
    console.error('Error generating React PDF as base64:', error);
    throw new Error(`Failed to generate PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Test React PDF generation functionality
 * @returns Promise<boolean> - True if PDF generation works
 */
export const testReactPDFGeneration = async (): Promise<boolean> => {
  try {
    const testPlaybook: Playbook = {
      id: 'test',
      title: 'Test Playbook',
      description: 'This is a test playbook for PDF generation.',
      contentBlocks: [
        {
          id: 'test-1',
          type: 'step-section',
          order: 1,
          content: {
            stepNumber: 1,
            title: 'Test Step'
          }
        },
        {
          id: 'test-2',
          type: 'text',
          order: 2,
          content: {
            text: 'This is a test text block.'
          }
        }
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
      userId: 'test-user'
    };

    const blob = await generateReactPDF(testPlaybook);
    return blob && blob.size > 0;
  } catch (error) {
    console.error('React PDF generation test failed:', error);
    return false;
  }
};
