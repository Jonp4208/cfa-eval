import { Playbook } from '@/services/playbookService';

// Progress callback type
type ProgressCallback = (step: string, progress: number) => void;

export const generatePlaybookPDF = async (playbook: Playbook, onProgress?: ProgressCallback): Promise<Blob> => {
  try {
    onProgress?.('Preparing content...', 10);

    // Generate HTML content for the playbook
    const htmlContent = generatePlaybookHTML(playbook);

    onProgress?.('Sending to server for PDF generation...', 30);

    // Send HTML to server for Puppeteer processing
    const response = await fetch('/api/generate-pdf', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        html: htmlContent,
        options: {
          format: 'A4',
          margin: {
            top: '20mm',
            right: '20mm',
            bottom: '20mm',
            left: '20mm'
          },
          printBackground: true,
          preferCSSPageSize: true
        }
      })
    });

    if (!response.ok) {
      throw new Error('Failed to generate PDF');
    }

    onProgress?.('Processing PDF...', 70);

    const pdfBlob = await response.blob();

    onProgress?.('Complete!', 100);

    return pdfBlob;
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
    <div style="font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.5; color: #2d3748; max-width: 100%; background: white; padding: 0; margin: 0;">
      <!-- Professional Header with proper margins -->
      <div style="text-align: center; margin-bottom: 20px; page-break-inside: avoid; background: linear-gradient(135deg, #E51636 0%, #C41E3A 100%); color: white; padding: 20px 15mm; margin: 0 -15mm 20px -15mm;">
        <h1 style="font-size: 24px; color: white; margin: 0 0 6px 0; font-weight: 700; letter-spacing: -0.5px; text-shadow: 0 2px 4px rgba(0,0,0,0.3);">${playbook.title}</h1>
        ${playbook.subtitle ? `<h2 style="font-size: 14px; color: rgba(255,255,255,0.9); margin: 0 0 6px 0; font-weight: 400;">${playbook.subtitle}</h2>` : ''}
        ${playbook.description ? `<p style="font-size: 12px; color: rgba(255,255,255,0.8); margin: 0; max-width: 600px; margin-left: auto; margin-right: auto; line-height: 1.3;">${playbook.description}</p>` : ''}
        <div style="background: rgba(255,255,255,0.3); height: 1px; width: 60px; margin: 10px auto 0;"></div>
      </div>

      <!-- Optimized Content Layout -->
      <div style="margin-bottom: 20px;">
        ${contentBlocks}
      </div>

      <!-- Compact Footer -->
      <div style="margin-top: 30px; padding: 12px 0; border-top: 1px solid #e2e8f0; text-align: center; background: #f8fafc; page-break-inside: avoid;">
        <div style="font-size: 10px; color: #718096;">
          <strong style="color: #4a5568;">Generated:</strong> ${new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })} ${playbook.category ? ` • Category: ${playbook.category}` : ''} ${playbook.targetRole ? ` • Target Role: ${playbook.targetRole}` : ''}
        </div>
      </div>
    </div>
  `;
};

const renderContentBlockHTML = (block: any): string => {
  switch (block.type) {
    case 'header':
      return `
        <div style="margin: 20px 0 15px 0; page-break-inside: avoid;">
          <h2 style="font-size: 22px; color: #E51636; margin: 0; font-weight: 600; border-left: 4px solid #E51636; padding-left: 15px; line-height: 1.2; text-shadow: 0 1px 2px rgba(0,0,0,0.05);">
            ${block.content.text || ''}
          </h2>
          <div style="height: 2px; background: linear-gradient(90deg, #E51636 0%, transparent 100%); margin-top: 8px; margin-left: 19px; width: 50%;"></div>
        </div>
      `;

    case 'text':
      return `
        <div style="margin: 12px 0;">
          <p style="font-size: 14px; line-height: 1.4; margin: 0; color: #4a5568; text-align: justify;">
            ${block.content.text}
          </p>
        </div>
      `;

    case 'list':
      const listItems = block.content.items.map((item: string) =>
        `<li style="margin: 8px 0; font-size: 13px; line-height: 1.4; color: #4a5568;">${item}</li>`
      ).join('');

      return `
        <div style="margin: 12px 0; page-break-inside: avoid;">
          <h3 style="font-size: 16px; color: #2d3748; margin: 0 0 10px 0; font-weight: 600;">
            ${block.content.title}
          </h3>
          <${block.content.listType === 'ordered' ? 'ol' : 'ul'} style="margin: 0; padding-left: 25px; color: #4a5568;">
            ${listItems}
          </${block.content.listType === 'ordered' ? 'ol' : 'ul'}>
        </div>
      `;

    case 'step-section':
      // Only force page break before step 3 - let step 4 flow naturally after step 3
      const pageBreakBefore = block.content.stepNumber && block.content.stepNumber === 3 ? 'page-break-before: always;' : '';

      // Add implementation tips for Step 1 only - right after the step description
      const implementationTips = block.content.stepNumber === 1 ? `
        <div style="background: #f0f9ff; border: 1px solid #bfdbfe; border-radius: 6px; padding: 12px; margin: 10px 0;">
          <h4 style="color: #1e40af; font-size: 13px; font-weight: 600; margin: 0 0 8px 0; display: flex; align-items: center;">
            <span style="background: #3b82f6; color: white; width: 18px; height: 18px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-right: 6px; font-size: 10px;">💡</span>
            Implementation Tips
          </h4>
          <ul style="margin: 0; padding-left: 15px; color: #374151; font-size: 11px; line-height: 1.4;">
            <li style="margin: 4px 0;"><strong>Start small:</strong> Begin with 2-3 items per quadrant, don't overwhelm yourself</li>
            <li style="margin: 4px 0;"><strong>Be honest:</strong> If everything feels urgent, step back and reassess objectively</li>
            <li style="margin: 4px 0;"><strong>Review weekly:</strong> Spend 15 minutes every Monday updating your matrix</li>
            <li style="margin: 4px 0;"><strong>Ask "What happens if I don't do this today?"</strong> to determine true urgency</li>
            <li style="margin: 4px 0;"><strong>Focus on quadrant 2:</strong> Important but not urgent tasks prevent future crises</li>
          </ul>
        </div>
      ` : '';

      return `
        <div style="background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); border-left: 4px solid #E51636; padding: 15px; margin: 12px 0; page-break-inside: avoid; border-radius: 0 8px 8px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.05); ${pageBreakBefore}">
          <div style="display: flex; align-items: center; margin-bottom: 8px;">
            <div style="background: linear-gradient(135deg, #E51636 0%, #C41E3A 100%); color: white; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; margin-right: 10px; font-size: 14px; text-align: center; line-height: 1; box-shadow: 0 2px 4px rgba(229, 22, 54, 0.3);">
              ${block.content.stepNumber || ''}
            </div>
            <h3 style="font-size: 17px; color: #E51636; margin: 0; font-weight: 600; line-height: 1.2;">
              ${block.content.title || ''}
            </h3>
          </div>
          <p style="color: #4a5568; font-weight: 400; margin: 0 0 8px 0; font-size: 13px; line-height: 1.3;">
            ${block.content.description || ''}
          </p>
          ${implementationTips}
        </div>
      `;

    case 'priority-matrix':
      return `
        <div style="background: #ffffff; border: 2px solid #e2e8f0; border-radius: 8px; padding: 15px; margin: 12px 0; page-break-inside: avoid; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
          <h4 style="font-size: 15px; color: #2d3748; margin: 0 0 12px 0; font-weight: 600; text-align: center;">Priority Matrix</h4>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
            <!-- Urgent + Important -->
            <div style="background: #fef2f2; border: 2px solid #dc2626; padding: 10px; text-align: center; border-radius: 6px;">
              <div style="font-weight: bold; color: #991b1b; margin-bottom: 3px; font-size: 10px;">URGENT + IMPORTANT</div>
              <div style="font-size: 9px; font-weight: 700; color: white; margin-bottom: 6px; background: #dc2626; padding: 2px 4px; display: inline-block; border-radius: 3px;">DO FIRST</div>
              <div style="font-size: 11px; color: #7f1d1d; line-height: 1.2;">
                ${block.content.urgentImportant || 'Critical tasks requiring immediate attention'}
              </div>
            </div>

            <!-- Important + Not Urgent -->
            <div style="background: #eff6ff; border: 2px solid #2563eb; padding: 10px; text-align: center; border-radius: 6px;">
              <div style="font-weight: bold; color: #1e40af; margin-bottom: 3px; font-size: 10px;">IMPORTANT + NOT URGENT</div>
              <div style="font-size: 9px; font-weight: 700; color: white; margin-bottom: 6px; background: #2563eb; padding: 2px 4px; display: inline-block; border-radius: 3px;">SCHEDULE</div>
              <div style="font-size: 11px; color: #1e3a8a; line-height: 1.2;">
                ${block.content.importantNotUrgent || 'Strategic tasks to plan and schedule'}
              </div>
            </div>

            <!-- Urgent + Not Important -->
            <div style="background: #fffbeb; border: 2px solid #d97706; padding: 10px; text-align: center; border-radius: 6px;">
              <div style="font-weight: bold; color: #92400e; margin-bottom: 3px; font-size: 10px;">URGENT + NOT IMPORTANT</div>
              <div style="font-size: 9px; font-weight: 700; color: white; margin-bottom: 6px; background: #d97706; padding: 2px 4px; display: inline-block; border-radius: 3px;">DELEGATE</div>
              <div style="font-size: 11px; color: #78350f; line-height: 1.2;">
                ${block.content.urgentNotImportant || 'Tasks to assign to team members'}
              </div>
            </div>

            <!-- Not Urgent + Not Important -->
            <div style="background: #f9fafb; border: 2px solid #6b7280; padding: 10px; text-align: center; border-radius: 6px;">
              <div style="font-weight: bold; color: #374151; margin-bottom: 3px; font-size: 10px;">NOT URGENT + NOT IMPORTANT</div>
              <div style="font-size: 9px; font-weight: 700; color: white; margin-bottom: 6px; background: #6b7280; padding: 2px 4px; display: inline-block; border-radius: 3px;">ELIMINATE</div>
              <div style="font-size: 11px; color: #1f2937; line-height: 1.2;">
                ${block.content.notUrgentNotImportant || 'Activities to minimize or eliminate'}
              </div>
            </div>
          </div>

          <!-- Example section - appears right after the matrix -->
          <div style="background: #fef7ed; border: 1px solid #fed7aa; border-radius: 6px; padding: 12px; margin: 12px 0 0 0;">
            <h4 style="color: #ea580c; font-size: 13px; font-weight: 600; margin: 0 0 8px 0; display: flex; align-items: center;">
              <span style="background: #ea580c; color: white; width: 18px; height: 18px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-right: 6px; font-size: 10px;">📋</span>
              Example: Leadership Task Prioritization
            </h4>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 10px; line-height: 1.3;">
              <div style="background: rgba(220, 38, 38, 0.1); padding: 6px; border-radius: 4px;">
                <strong style="color: #991b1b;">DO FIRST:</strong><br>
                • Staff safety incident<br>
                • Customer complaint escalation
              </div>
              <div style="background: rgba(37, 99, 235, 0.1); padding: 6px; border-radius: 4px;">
                <strong style="color: #1e40af;">SCHEDULE:</strong><br>
                • Team training program<br>
                • Performance reviews
              </div>
              <div style="background: rgba(217, 119, 6, 0.1); padding: 6px; border-radius: 4px;">
                <strong style="color: #92400e;">DELEGATE:</strong><br>
                • Routine reports<br>
                • Supply ordering
              </div>
              <div style="background: rgba(107, 114, 128, 0.1); padding: 6px; border-radius: 4px;">
                <strong style="color: #374151;">ELIMINATE:</strong><br>
                • Unnecessary meetings<br>
                • Redundant paperwork
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
        <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px; margin: 8px 0; box-shadow: 0 1px 2px rgba(0,0,0,0.05); page-break-inside: avoid;">
          <div style="margin-bottom: 8px; text-align: center;">
            <div style="font-size: 14px; font-weight: 600; color: #E51636; background: #fef2f2; padding: 6px 12px; border-radius: 4px; display: inline-block;">
              <span style="background: #f59e0b; color: white; width: 18px; height: 18px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-right: 6px; font-size: 11px; text-align: center; line-height: 1;">${i + 1}</span>
              ${goal.title || `Goal ${i + 1}`}
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 8px;">
            <div style="background: #f8fafc; border-left: 3px solid #E51636; padding: 8px; border-radius: 0 4px 4px 0;">
              <div style="font-weight: bold; color: #E51636; font-size: 11px; margin-bottom: 4px; display: flex; align-items: center;">
                <span style="background: #E51636; color: white; width: 16px; height: 16px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-right: 6px; font-size: 10px; text-align: center; line-height: 1;">S</span>
                Specific
              </div>
              <div style="color: #4a5568; font-size: 10px; line-height: 1.3;">
                ${goal.specific || 'What exactly needs to be accomplished?'}
              </div>
            </div>

            <div style="background: #f8fafc; border-left: 3px solid #E51636; padding: 8px; border-radius: 0 4px 4px 0;">
              <div style="font-weight: bold; color: #E51636; font-size: 11px; margin-bottom: 4px; display: flex; align-items: center;">
                <span style="background: #E51636; color: white; width: 16px; height: 16px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-right: 6px; font-size: 10px; text-align: center; line-height: 1;">M</span>
                Measurable
              </div>
              <div style="color: #4a5568; font-size: 10px; line-height: 1.3;">
                ${goal.measurable || 'How will you track progress?'}
              </div>
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px;">
            <div style="background: #f8fafc; border-left: 3px solid #E51636; padding: 8px; border-radius: 0 4px 4px 0;">
              <div style="font-weight: bold; color: #E51636; font-size: 11px; margin-bottom: 4px; display: flex; align-items: center;">
                <span style="background: #E51636; color: white; width: 16px; height: 16px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-right: 6px; font-size: 10px; text-align: center; line-height: 1;">A</span>
                Achievable
              </div>
              <div style="color: #4a5568; font-size: 10px; line-height: 1.3;">
                ${goal.achievable || 'Is this realistic?'}
              </div>
            </div>

            <div style="background: #f8fafc; border-left: 3px solid #E51636; padding: 8px; border-radius: 0 4px 4px 0;">
              <div style="font-weight: bold; color: #E51636; font-size: 11px; margin-bottom: 4px; display: flex; align-items: center;">
                <span style="background: #E51636; color: white; width: 16px; height: 16px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-right: 6px; font-size: 10px; text-align: center; line-height: 1;">R</span>
                Relevant
              </div>
              <div style="color: #4a5568; font-size: 10px; line-height: 1.3;">
                ${goal.relevant || 'Why does this matter?'}
              </div>
            </div>

            <div style="background: #f8fafc; border-left: 3px solid #E51636; padding: 8px; border-radius: 0 4px 4px 0;">
              <div style="font-weight: bold; color: #E51636; font-size: 11px; margin-bottom: 4px; display: flex; align-items: center;">
                <span style="background: #E51636; color: white; width: 16px; height: 16px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-right: 6px; font-size: 10px; text-align: center; line-height: 1;">T</span>
                Time-bound
              </div>
              <div style="color: #4a5568; font-size: 10px; line-height: 1.3;">
                ${goal.timeBound || 'When will this be done?'}
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
        <div style="background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%); border: 2px solid #E51636; border-radius: 8px; padding: 15px; margin: 12px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.05); page-break-inside: avoid;">
          <div style="text-align: center; margin-bottom: 12px;">
            <h4 style="font-size: 16px; font-weight: 600; color: #E51636; margin: 0; display: flex; align-items: center; justify-content: center; gap: 6px;">
              <span style="font-size: 18px;">📝</span>
              Your SMART Goals
            </h4>
            <div style="height: 2px; background: linear-gradient(90deg, #E51636 0%, transparent 100%); margin: 8px auto 0; width: 100px; border-radius: 1px;"></div>
          </div>
          <div>
            ${smartGoals}
          </div>
        </div>
      `;

    case 'checklist':
      const checklistItems = block.content.items?.map((item: string, index: number) =>
        `<li style="margin: 8px 0; font-size: 14px; display: flex; align-items: flex-start; line-height: 1.4;">
          <span style="color: #E51636; margin-right: 10px; font-weight: bold; font-size: 14px; min-width: 16px;">✓</span>
          <span style="color: #4a5568;">${item}</span>
        </li>`
      ).join('');

      return `
        <div style="background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); border: 2px solid #cbd5e0; border-radius: 8px; padding: 18px; margin: 15px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.05); page-break-inside: avoid;">
          <h4 style="font-weight: 600; color: #2d3748; margin: 0 0 12px 0; font-size: 16px; display: flex; align-items: center; gap: 8px;">
            <span style="background: #E51636; color: white; width: 24px; height: 24px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 12px;">📋</span>
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
