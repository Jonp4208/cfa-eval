import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Playbook } from '@/services/playbookService';

// Progress callback type
type ProgressCallback = (step: string, progress: number) => void;

export const generatePlaybookPDF = async (playbook: Playbook, onProgress?: ProgressCallback): Promise<Blob> => {
  try {
    onProgress?.('Preparing content...', 10);

    // Create a temporary container for rendering with optimized styling
    const tempContainer = document.createElement('div');
    tempContainer.style.position = 'absolute';
    tempContainer.style.left = '-9999px';
    tempContainer.style.top = '0';
    tempContainer.style.width = '800px'; // Optimized width
    tempContainer.style.backgroundColor = '#ffffff';
    tempContainer.style.padding = '40px 30px'; // Reduced padding
    tempContainer.style.fontFamily = '"Segoe UI", Arial, sans-serif'; // Simplified font stack
    tempContainer.style.lineHeight = '1.6'; // Good balance
    tempContainer.style.color = '#2d3748';
    tempContainer.style.fontSize = '15px'; // Slightly smaller base font
    tempContainer.style.boxSizing = 'border-box';

    document.body.appendChild(tempContainer);

    onProgress?.('Generating HTML...', 25);

    // Generate HTML content for the playbook
    const htmlContent = generatePlaybookHTML(playbook);
    tempContainer.innerHTML = htmlContent;

    onProgress?.('Loading fonts and images...', 40);

    // Reduced wait time for faster generation
    await new Promise(resolve => setTimeout(resolve, 300));

    onProgress?.('Rendering content...', 60);

    // Create canvas with balanced quality/performance settings
    const canvas = await html2canvas(tempContainer, {
      scale: 2, // Balanced scale for good quality and performance
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      width: 800,
      height: tempContainer.scrollHeight,
      logging: false,
      removeContainer: true,
      ignoreElements: (element) => {
        // Skip rendering of certain elements for performance
        return element.classList?.contains('skip-pdf') || false;
      }
    });

    // Remove temporary container
    document.body.removeChild(tempContainer);

    onProgress?.('Creating PDF pages...', 80);

    // Create PDF with optimized settings
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 15; // Reduced margins for more content space
    const contentWidth = pageWidth - (2 * margin);
    const contentHeight = pageHeight - (2 * margin);

    // Calculate scaling
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    const ratio = contentWidth / imgWidth;
    const scaledHeight = imgHeight * ratio;

    // Calculate how many pages we need
    const totalPages = Math.ceil(scaledHeight / contentHeight);

    for (let pageNum = 0; pageNum < totalPages; pageNum++) {
      // Add new page if not the first page
      if (pageNum > 0) {
        pdf.addPage();
      }

      // Calculate the portion of the image for this page
      const sourceY = (pageNum * contentHeight) / ratio;
      const sourceHeight = Math.min(contentHeight / ratio, imgHeight - sourceY);

      // Create a temporary canvas for this page
      const pageCanvas = document.createElement('canvas');
      const pageCtx = pageCanvas.getContext('2d');
      pageCanvas.width = imgWidth;
      pageCanvas.height = sourceHeight;

      // Draw the portion of the original canvas onto the page canvas
      pageCtx?.drawImage(
        canvas,
        0, sourceY,           // Source x, y
        imgWidth, sourceHeight, // Source width, height
        0, 0,                 // Destination x, y
        imgWidth, sourceHeight  // Destination width, height
      );

      // Convert to image and add to PDF
      const pageImgData = pageCanvas.toDataURL('image/png');
      const finalHeight = Math.min(contentHeight, scaledHeight - (pageNum * contentHeight));

      pdf.addImage(pageImgData, 'PNG', margin, margin, contentWidth, finalHeight);
    }

    onProgress?.('Finalizing PDF...', 95);

    // Return the PDF as a blob
    const blob = new Blob([pdf.output('blob')], { type: 'application/pdf' });

    onProgress?.('Complete!', 100);

    return blob;
  } catch (error) {
    console.error('Error generating playbook PDF:', error);
    throw error;
  }
};

const generatePlaybookHTML = (playbook: Playbook): string => {
  // Filter out step 5 and sort content blocks
  const contentBlocks = playbook.contentBlocks
    .filter(block => {
      // Remove step 5 (step sections with stepNumber 5)
      if (block.type === 'step-section' && block.content.stepNumber === 5) {
        return false;
      }
      return true;
    })
    .sort((a, b) => a.order - b.order)
    .map(block => renderContentBlockHTML(block))
    .join('');

  return `
    <div style="font-family: inherit; line-height: inherit; color: inherit; max-width: 100%;">
      <!-- Professional Header -->
      <div style="text-align: center; margin-bottom: 40px;">
        <div style="background: #E51636; height: 4px; width: 100%; margin-bottom: 25px;"></div>
        <h1 style="font-size: 32px; color: #E51636; margin: 0 0 12px 0; font-weight: 700;">${playbook.title}</h1>
        ${playbook.subtitle ? `<h2 style="font-size: 18px; color: #4a5568; margin: 0 0 12px 0; font-weight: 400;">${playbook.subtitle}</h2>` : ''}
        ${playbook.description ? `<p style="font-size: 15px; color: #718096; margin: 0; max-width: 600px; margin-left: auto; margin-right: auto;">${playbook.description}</p>` : ''}
        <div style="background: #E51636; height: 2px; width: 100px; margin: 20px auto 0;"></div>
      </div>

      <!-- Enhanced Content -->
      <div style="margin-bottom: 50px;">
        ${contentBlocks}
      </div>

      <!-- Professional Footer -->
      <div style="margin-top: 60px; padding: 25px 0; border-top: 2px solid #e2e8f0; text-align: center; background: #f8fafc; border-radius: 8px;">
        <div style="font-size: 13px; color: #718096; margin-bottom: 8px;">
          <strong style="color: #4a5568;">Generated:</strong> ${new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </div>
        <div style="font-size: 12px; color: #a0aec0;">
          ${playbook.category ? `Category: ${playbook.category}` : ''} ${playbook.category && playbook.targetRole ? ' • ' : ''} ${playbook.targetRole ? `Target Role: ${playbook.targetRole}` : ''}
        </div>
      </div>
    </div>
  `;
};

const renderContentBlockHTML = (block: any): string => {
  switch (block.type) {
    case 'header':
      return `
        <div style="margin: 40px 0 25px 0; page-break-inside: avoid;">
          <h2 style="font-size: 28px; color: #E51636; margin: 0; font-weight: 600; border-left: 5px solid #E51636; padding-left: 20px; line-height: 1.3; text-shadow: 0 1px 2px rgba(0,0,0,0.05);">
            ${block.content.text || ''}
          </h2>
          <div style="height: 2px; background: linear-gradient(90deg, #E51636 0%, transparent 100%); margin-top: 10px; margin-left: 25px; width: 60%;"></div>
        </div>
      `;

    case 'text':
      return `
        <div style="margin: 25px 0;">
          <p style="font-size: 16px; line-height: 1.7; margin: 0; color: #4a5568; text-align: justify;">
            ${block.content.text}
          </p>
        </div>
      `;

    case 'list':
      const listItems = block.content.items.map((item: string) =>
        `<li style="margin: 12px 0; font-size: 15px; line-height: 1.6; color: #4a5568;">${item}</li>`
      ).join('');

      return `
        <div style="margin: 25px 0; page-break-inside: avoid;">
          <h3 style="font-size: 18px; color: #2d3748; margin: 0 0 15px 0; font-weight: 600;">
            ${block.content.title}
          </h3>
          <${block.content.listType === 'ordered' ? 'ol' : 'ul'} style="margin: 0; padding-left: 30px; color: #4a5568;">
            ${listItems}
          </${block.content.listType === 'ordered' ? 'ol' : 'ul'}>
        </div>
      `;

    case 'step-section':
      // Add page break before each step (except step 1)
      const pageBreakBefore = block.content.stepNumber && block.content.stepNumber > 1 ? 'page-break-before: always;' : '';

      return `
        <div style="background: #f0f9ff; border-left: 5px solid #E51636; padding: 25px; margin: 30px 0; page-break-inside: avoid; ${pageBreakBefore}">
          <div style="display: flex; align-items: center; margin-bottom: 15px;">
            <div style="background: #E51636; color: white; width: 35px; height: 35px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; margin-right: 15px; font-size: 16px; text-align: center; line-height: 1;">
              ${block.content.stepNumber || ''}
            </div>
            <h3 style="font-size: 20px; color: #E51636; margin: 0; font-weight: 600;">
              ${block.content.title || ''}
            </h3>
          </div>
          <p style="color: #4a5568; font-weight: 500; margin: 0; font-size: 15px; line-height: 1.5;">
            ${block.content.description || ''}
          </p>
        </div>
      `;

    case 'priority-matrix':
      return `
        <div style="background: #ffffff; border: 2px solid #e2e8f0; padding: 25px; margin: 30px 0; page-break-inside: avoid;">
          <h4 style="font-size: 18px; color: #2d3748; margin: 0 0 20px 0; font-weight: 600; text-align: center;">Priority Matrix</h4>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
            <!-- Urgent + Important -->
            <div style="background: #fef2f2; border: 2px solid #dc2626; padding: 15px; text-align: center;">
              <div style="font-weight: bold; color: #991b1b; margin-bottom: 6px; font-size: 13px;">URGENT + IMPORTANT</div>
              <div style="font-size: 12px; font-weight: 700; color: white; margin-bottom: 10px; background: #dc2626; padding: 3px 6px; display: inline-block;">DO FIRST</div>
              <div style="font-size: 13px; color: #7f1d1d; line-height: 1.4;">
                ${block.content.urgentImportant || 'Critical tasks requiring immediate attention'}
              </div>
            </div>

            <!-- Important + Not Urgent -->
            <div style="background: #eff6ff; border: 2px solid #2563eb; padding: 15px; text-align: center;">
              <div style="font-weight: bold; color: #1e40af; margin-bottom: 6px; font-size: 13px;">IMPORTANT + NOT URGENT</div>
              <div style="font-size: 12px; font-weight: 700; color: white; margin-bottom: 10px; background: #2563eb; padding: 3px 6px; display: inline-block;">SCHEDULE</div>
              <div style="font-size: 13px; color: #1e3a8a; line-height: 1.4;">
                ${block.content.importantNotUrgent || 'Strategic tasks to plan and schedule'}
              </div>
            </div>

            <!-- Urgent + Not Important -->
            <div style="background: #fffbeb; border: 2px solid #d97706; padding: 15px; text-align: center;">
              <div style="font-weight: bold; color: #92400e; margin-bottom: 6px; font-size: 13px;">URGENT + NOT IMPORTANT</div>
              <div style="font-size: 12px; font-weight: 700; color: white; margin-bottom: 10px; background: #d97706; padding: 3px 6px; display: inline-block;">DELEGATE</div>
              <div style="font-size: 13px; color: #78350f; line-height: 1.4;">
                ${block.content.urgentNotImportant || 'Tasks to assign to team members'}
              </div>
            </div>

            <!-- Not Urgent + Not Important -->
            <div style="background: #f9fafb; border: 2px solid #6b7280; padding: 15px; text-align: center;">
              <div style="font-weight: bold; color: #374151; margin-bottom: 6px; font-size: 13px;">NOT URGENT + NOT IMPORTANT</div>
              <div style="font-size: 12px; font-weight: 700; color: white; margin-bottom: 10px; background: #6b7280; padding: 3px 6px; display: inline-block;">ELIMINATE</div>
              <div style="font-size: 13px; color: #1f2937; line-height: 1.4;">
                ${block.content.notUrgentNotImportant || 'Activities to minimize or eliminate'}
              </div>
            </div>
          </div>
        </div>
      `;

    case 'smart-template':
      // Only render if there are actual goals with content
      const smartGoals = block.content.goals?.filter((goal: any) =>
        goal && (goal.title || goal.specific || goal.measurable || goal.achievable || goal.relevant || goal.timeBound)
      ).map((goal: any, i: number) => `
        <div style="background: #ffffff; border: 2px solid #e2e8f0; border-radius: 12px; padding: 25px; margin: 25px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.05); page-break-inside: avoid;">
          <div style="margin-bottom: 20px; text-align: center;">
            <div style="font-size: 18px; font-weight: 600; color: #E51636; background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%); padding: 12px 20px; border-radius: 8px; display: inline-block;">
              <span style="background: #f59e0b; color: white; width: 24px; height: 24px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-right: 10px; font-size: 14px; text-align: center; line-height: 1;">${i + 1}</span>
              ${goal.title || `Goal ${i + 1}`}
            </div>
          </div>

          <div style="margin-bottom: 15px;">
            <div style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); border-left: 4px solid #E51636; border-radius: 0 8px 8px 0; padding: 15px; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
              <div style="font-weight: bold; color: #E51636; font-size: 16px; margin-bottom: 8px; display: flex; align-items: center;">
                <span style="background: #E51636; color: white; width: 24px; height: 24px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-right: 10px; font-size: 14px; text-align: center; line-height: 1;">S</span>
                Specific
              </div>
              <div style="margin-top: 8px; color: #4a5568; font-size: 15px; line-height: 1.6; padding-left: 34px;">
                ${goal.specific || 'What exactly needs to be accomplished? Be precise and clear about the desired outcome.'}
              </div>
            </div>
          </div>

          <div style="margin-bottom: 15px;">
            <div style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); border-left: 4px solid #E51636; border-radius: 0 8px 8px 0; padding: 15px; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
              <div style="font-weight: bold; color: #E51636; font-size: 16px; margin-bottom: 8px; display: flex; align-items: center;">
                <span style="background: #E51636; color: white; width: 24px; height: 24px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-right: 10px; font-size: 14px; text-align: center; line-height: 1;">M</span>
                Measurable
              </div>
              <div style="margin-top: 8px; color: #4a5568; font-size: 15px; line-height: 1.6; padding-left: 34px;">
                ${goal.measurable || 'How will you know when it\'s complete? What metrics will you use to track progress?'}
              </div>
            </div>
          </div>

          <div style="margin-bottom: 15px;">
            <div style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); border-left: 4px solid #E51636; border-radius: 0 8px 8px 0; padding: 15px; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
              <div style="font-weight: bold; color: #E51636; font-size: 16px; margin-bottom: 8px; display: flex; align-items: center;">
                <span style="background: #E51636; color: white; width: 24px; height: 24px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-right: 10px; font-size: 14px; text-align: center; line-height: 1;">A</span>
                Achievable
              </div>
              <div style="margin-top: 8px; color: #4a5568; font-size: 15px; line-height: 1.6; padding-left: 34px;">
                ${goal.achievable || 'Can this realistically be accomplished with available resources and constraints?'}
              </div>
            </div>
          </div>

          <div style="margin-bottom: 15px;">
            <div style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); border-left: 4px solid #E51636; border-radius: 0 8px 8px 0; padding: 15px; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
              <div style="font-weight: bold; color: #E51636; font-size: 16px; margin-bottom: 8px; display: flex; align-items: center;">
                <span style="background: #E51636; color: white; width: 24px; height: 24px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-right: 10px; font-size: 14px; text-align: center; line-height: 1;">R</span>
                Relevant
              </div>
              <div style="margin-top: 8px; color: #4a5568; font-size: 15px; line-height: 1.6; padding-left: 34px;">
                ${goal.relevant || 'Why does this matter to your organization\'s success and strategic objectives?'}
              </div>
            </div>
          </div>

          <div style="margin-bottom: 0;">
            <div style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); border-left: 4px solid #E51636; border-radius: 0 8px 8px 0; padding: 15px; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
              <div style="font-weight: bold; color: #E51636; font-size: 16px; margin-bottom: 8px; display: flex; align-items: center;">
                <span style="background: #E51636; color: white; width: 24px; height: 24px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-right: 10px; font-size: 14px; text-align: center; line-height: 1;">T</span>
                Time-bound
              </div>
              <div style="margin-top: 8px; color: #4a5568; font-size: 15px; line-height: 1.6; padding-left: 34px;">
                ${goal.timeBound || 'When will this be completed? Set a specific deadline with milestones.'}
              </div>
            </div>
          </div>
        </div>
      `).join('');

      // Only render the container if there are actual goals
      if (!smartGoals || smartGoals.length === 0) {
        return '';
      }

      return `
        <div style="background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%); border: 3px solid #E51636; border-radius: 16px; padding: 35px; margin: 40px 0; box-shadow: 0 8px 25px rgba(0,0,0,0.1); page-break-inside: avoid;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h4 style="font-size: 24px; font-weight: 700; color: #E51636; margin: 0; display: flex; align-items: center; justify-content: center; gap: 10px;">
              <span style="font-size: 28px;">📝</span>
              Your SMART Goals
            </h4>
            <div style="height: 3px; background: linear-gradient(90deg, #E51636 0%, transparent 100%); margin: 15px auto 0; width: 150px; border-radius: 2px;"></div>
          </div>
          <div>
            ${smartGoals}
          </div>
        </div>
      `;

    case 'checklist':
      const checklistItems = block.content.items?.map((item: string, index: number) =>
        `<li style="margin: 12px 0; font-size: 15px; display: flex; align-items: flex-start; line-height: 1.6;">
          <span style="color: #E51636; margin-right: 12px; font-weight: bold; font-size: 16px; min-width: 20px;">✓</span>
          <span style="color: #4a5568;">${item}</span>
        </li>`
      ).join('');

      return `
        <div style="background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); border: 2px solid #cbd5e0; border-radius: 12px; padding: 25px; margin: 30px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.05); page-break-inside: avoid;">
          <h4 style="font-weight: 600; color: #2d3748; margin: 0 0 20px 0; font-size: 18px; display: flex; align-items: center; gap: 10px;">
            <span style="background: #E51636; color: white; width: 28px; height: 28px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 14px;">📋</span>
            ${block.content.title}
          </h4>
          <ul style="margin: 0; padding: 0; list-style: none;">
            ${checklistItems}
          </ul>
        </div>
      `;

    case 'leadership-examples':
      const examples = block.content.examples?.map((example: any, index: number) => `
        <div style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); border-left: 4px solid #E51636; border-radius: 0 8px 8px 0; padding: 20px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
          <div style="font-weight: bold; color: #E51636; font-size: 16px; margin-bottom: 10px; display: flex; align-items: center; gap: 8px;">
            <span style="background: #E51636; color: white; width: 24px; height: 24px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 12px; text-align: center; line-height: 1;">${index + 1}</span>
            ${example.title}
          </div>
          <div style="margin-top: 12px; color: #4a5568; font-size: 15px; line-height: 1.6;">
            <strong style="color: #2d3748;">Goal:</strong> ${example.goal}
          </div>
        </div>
      `).join('');

      return `
        <div style="background: #ffffff; border: 3px solid #E51636; border-radius: 12px; padding: 30px; margin: 35px 0; box-shadow: 0 4px 6px rgba(0,0,0,0.05); page-break-inside: avoid;">
          <div style="text-align: center; margin-bottom: 25px;">
            <h4 style="font-size: 20px; font-weight: 600; color: #E51636; margin: 0; display: flex; align-items: center; justify-content: center; gap: 10px;">
              <span style="font-size: 24px;">💡</span>
              Leadership SMART Goal Examples
            </h4>
            <div style="height: 2px; background: linear-gradient(90deg, #E51636 0%, transparent 100%); margin: 15px auto 0; width: 120px; border-radius: 1px;"></div>
          </div>
          <div>
            ${examples}
          </div>
        </div>
      `;

    case 'practice-section':
      const exercises = block.content.exercises?.map((exercise: any, index: number) => {
        const fields = exercise.fields?.map((field: any) =>
          `<div style="margin: 15px 0; font-size: 15px; line-height: 1.6;">
            <strong style="color: #2d3748; display: block; margin-bottom: 5px;">${field.label}:</strong>
            <div style="color: #4a5568; padding: 8px 12px; background: #f7fafc; border-radius: 6px; border-left: 3px solid #E51636;">
              ${field.value || 'Complete this section with your specific details and action items.'}
            </div>
          </div>`
        ).join('');

        return `
          <div style="background: #ffffff; border: 2px solid #e2e8f0; border-radius: 10px; padding: 25px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
            <h4 style="font-size: 17px; color: #2d3748; margin: 0 0 20px 0; font-weight: 600; display: flex; align-items: center; gap: 8px;">
              <span style="background: #f59e0b; color: white; width: 24px; height: 24px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 12px; text-align: center; line-height: 1;">${index + 1}</span>
              ${exercise.title}
            </h4>
            <div>
              ${fields}
            </div>
          </div>
        `;
      }).join('');

      return `
        <div style="background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%); border: 3px solid #f59e0b; border-radius: 12px; padding: 30px; margin: 35px 0; box-shadow: 0 4px 6px rgba(0,0,0,0.05); page-break-inside: avoid;">
          <div style="text-align: center; margin-bottom: 25px;">
            <h3 style="color: #92400e; font-size: 20px; margin: 0; font-weight: 600; display: flex; align-items: center; justify-content: center; gap: 10px;">
              <span style="font-size: 24px;">🎯</span>
              ${block.content.title || ''}
            </h3>
            <div style="height: 2px; background: linear-gradient(90deg, #f59e0b 0%, transparent 100%); margin: 15px auto 0; width: 120px; border-radius: 1px;"></div>
          </div>
          <p style="font-size: 16px; margin: 0 0 25px 0; font-weight: 500; color: #78350f; text-align: center; line-height: 1.6;">
            ${block.content.description || ''}
          </p>
          ${exercises}
        </div>
      `;

    default:
      // Don't render unsupported content blocks - return empty string
      return '';
  }
};

export const downloadPlaybookPDF = async (playbook: Playbook, onProgress?: ProgressCallback): Promise<void> => {
  try {
    const pdfBlob = await generatePlaybookPDF(playbook, onProgress);
    const url = URL.createObjectURL(pdfBlob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `${playbook.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_playbook.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error downloading playbook PDF:', error);
    throw error;
  }
};
