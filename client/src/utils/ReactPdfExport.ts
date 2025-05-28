import { pdf } from '@react-pdf/renderer';
import { createElement } from 'react';
import PlaybookPDF from './ReactPdfPlaybook';

export type ProgressCallback = (step: string, progress: number) => void;

// Define the playbook data structure that matches SimplePlaybookEditor
interface PlaybookData {
  title: string;
  subtitle: string;
  urgentImportantDescription: string;
  importantNotUrgentDescription: string;
  urgentNotImportantDescription: string;
  notUrgentNotImportantDescription: string;
  smartGoals: Array<{
    id: number;
    title: string;
    specific: string;
    measurable: string;
    achievable: string;
    relevant: string;
    timeBound: string;
  }>;
}

/**
 * Generate and download a PDF using React PDF (client-side only)
 * @param playbookData - The playbook data to convert to PDF
 * @param onProgress - Optional progress callback
 */
export const generateReactPDF = async (
  playbookData: PlaybookData,
  onProgress?: ProgressCallback
): Promise<Blob> => {
  try {
    onProgress?.('Preparing PDF document...', 10);

    // Create the React PDF document
    const MyDocument = createElement(PlaybookPDF, { playbookData });

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
 * @param playbookData - The playbook data to convert to PDF
 * @param onProgress - Optional progress callback
 */
export const downloadReactPDF = async (
  playbookData: PlaybookData,
  onProgress?: ProgressCallback
): Promise<void> => {
  try {
    // Generate the PDF blob
    const pdfBlob = await generateReactPDF(playbookData, onProgress);

    // Create download link
    const url = URL.createObjectURL(pdfBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${playbookData.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_playbook.pdf`;

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
 * @param playbookData - The playbook data to convert to PDF
 * @param onProgress - Optional progress callback
 */
export const previewReactPDF = async (
  playbookData: PlaybookData,
  onProgress?: ProgressCallback
): Promise<void> => {
  try {
    // Generate the PDF blob
    const pdfBlob = await generateReactPDF(playbookData, onProgress);

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
 * @param playbookData - The playbook data to convert to PDF
 * @param onProgress - Optional progress callback
 */
export const getPDFAsBase64 = async (
  playbookData: PlaybookData,
  onProgress?: ProgressCallback
): Promise<string> => {
  try {
    onProgress?.('Preparing PDF document...', 10);

    // Create the React PDF document
    const MyDocument = createElement(PlaybookPDF, { playbookData });

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
    const testPlaybookData: PlaybookData = {
      title: 'Test Playbook',
      subtitle: 'Test Subtitle',
      urgentImportantDescription: 'Test urgent important items',
      importantNotUrgentDescription: 'Test important not urgent items',
      urgentNotImportantDescription: 'Test urgent not important items',
      notUrgentNotImportantDescription: 'Test not urgent not important items',
      smartGoals: [
        {
          id: 1,
          title: 'Test Goal',
          specific: 'Test specific description',
          measurable: 'Test measurable description',
          achievable: 'Test achievable description',
          relevant: 'Test relevant description',
          timeBound: 'Test time-bound description'
        }
      ]
    };

    const blob = await generateReactPDF(testPlaybookData);
    return blob && blob.size > 0;
  } catch (error) {
    console.error('React PDF generation test failed:', error);
    return false;
  }
};
