const emailTemplates = {
  trainingAssigned: (employee, plan, startDate) => ({
    subject: 'New Training Plan Assigned',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #E51636;">New Training Plan Assigned</h2>
        <p>Hello ${employee.name},</p>
        <p>You have been assigned a new training plan:</p>
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 15px 0;">
          <ul style="list-style: none; padding: 0;">
            <li style="margin: 10px 0;"><strong>Plan:</strong> ${plan.name}</li>
            <li style="margin: 10px 0;"><strong>Start Date:</strong> ${new Date(startDate).toLocaleDateString()}</li>
            <li style="margin: 10px 0;"><strong>Duration:</strong> ${plan.modules.length} modules</li>
          </ul>
        </div>
        <p>Please log in to the training portal to begin your training:</p>
        <p>
          <a href="https://cfa-eval-app.vercel.app"
             style="display: inline-block; background-color: #E51636; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 500;">
            Access Training Portal
          </a>
        </p>
        <p style="color: #666; font-size: 12px;">If the button above doesn't work, copy and paste this link into your browser:</p>
        <p style="color: #666; font-size: 12px;">https://cfa-eval-app.vercel.app</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p>Best regards,<br>Training Team</p>
      </div>
    `,
  }),

  moduleCompleted: (employee, module) => ({
    subject: 'Training Module Completed',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #E51636;">Training Module Completed</h2>
        <p>Hello ${employee.name},</p>
        <p>Congratulations on completing the following training module:</p>
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 15px 0;">
          <ul style="list-style: none; padding: 0;">
            <li style="margin: 10px 0;"><strong>Module:</strong> ${module.name}</li>
            <li style="margin: 10px 0;"><strong>Plan:</strong> ${employee.trainingPlan.name}</li>
          </ul>
        </div>
        <p>Keep up the good work!</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p>Best regards,<br>Training Team</p>
      </div>
    `,
  }),

  trainingCompleted: (employee, plan) => ({
    subject: 'Training Plan Completed',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #E51636;">Training Plan Completed</h2>
        <p>Hello ${employee.name},</p>
        <p>Congratulations on completing your training plan:</p>
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 15px 0;">
          <ul style="list-style: none; padding: 0;">
            <li style="margin: 10px 0;"><strong>Plan:</strong> ${plan.name}</li>
          </ul>
        </div>
        <p>This is a significant achievement! Your dedication to learning and improvement is appreciated.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p>Best regards,<br>Training Team</p>
      </div>
    `,
  }),

  upcomingTraining: (employee, plan, daysUntilStart) => ({
    subject: 'Upcoming Training Reminder',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #E51636;">Upcoming Training Reminder</h2>
        <p>Hello ${employee.name},</p>
        <p>This is a reminder about your upcoming training:</p>
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 15px 0;">
          <ul style="list-style: none; padding: 0;">
            <li style="margin: 10px 0;"><strong>Plan:</strong> ${plan.name}</li>
            <li style="margin: 10px 0;"><strong>Starts In:</strong> ${daysUntilStart} days</li>
            <li style="margin: 10px 0;"><strong>Start Date:</strong> ${new Date(plan.startDate).toLocaleDateString()}</li>
          </ul>
        </div>
        <p>Please ensure you are prepared to begin your training on the specified start date.</p>
        <p>You can access the training portal here:</p>
        <p>
          <a href="https://cfa-eval-app.vercel.app"
             style="display: inline-block; background-color: #E51636; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 500;">
            Access Training Portal
          </a>
        </p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p>Best regards,<br>Training Team</p>
      </div>
    `,
  }),

  progressUpdate: (manager, updates) => ({
    subject: 'Training Progress Update',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #E51636;">Training Progress Update</h2>
        <p>Hello ${manager.name},</p>
        <p>Here's a summary of recent training progress:</p>
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 15px 0;">
          <ul style="list-style: none; padding: 0;">
            ${updates.map(update => `
              <li style="margin: 10px 0; padding: 10px; background-color: white; border-radius: 3px;">
                <strong>${update.employee.name}:</strong>
                ${update.type === 'module'
                  ? `Completed module "${update.module.name}"`
                  : `Completed training plan "${update.plan.name}"`}
              </li>
            `).join('')}
          </ul>
        </div>
        <p>
          <a href="https://cfa-eval-app.vercel.app"
             style="display: inline-block; background-color: #E51636; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 500;">
            View Detailed Progress
          </a>
        </p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p>Best regards,<br>Training Team</p>
      </div>
    `,
  }),

  playbookAnnouncement: (user) => ({
    subject: '🚀 New Feature Alert: Leadership Playbooks Now Available in LD Growth',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 700px; margin: 0 auto; background-color: #ffffff;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #E51636 0%, #B91429 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">🚀 New Feature Alert</h1>
          <p style="color: white; margin: 10px 0 0 0; font-size: 18px; opacity: 0.9;">Leadership Playbooks Now Available!</p>
        </div>

        <!-- Content -->
        <div style="padding: 30px;">
          <p style="font-size: 16px; color: #333; margin-bottom: 20px;">Dear ${user.name},</p>

          <p style="font-size: 16px; color: #333; line-height: 1.6; margin-bottom: 20px;">
            We're excited to announce a powerful new addition to your LD Growth platform: <strong>Leadership Playbooks</strong>!
          </p>

          <!-- What Are Playbooks Section -->
          <div style="background-color: #f8f9fa; padding: 25px; border-radius: 10px; margin: 25px 0; border-left: 4px solid #E51636;">
            <h2 style="color: #E51636; margin: 0 0 15px 0; font-size: 20px;">📖 What Are Leadership Playbooks?</h2>
            <p style="color: #333; line-height: 1.6; margin: 0;">
              Leadership Playbooks are comprehensive, step-by-step guides designed to help you tackle common leadership challenges with proven frameworks and actionable strategies. Think of them as your personal leadership handbook, available 24/7.
            </p>
          </div>

          <!-- Features Section -->
          <h2 style="color: #E51636; margin: 30px 0 20px 0; font-size: 20px;">✨ What's New:</h2>

          <div style="background-color: #fff; border: 1px solid #e9ecef; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
            <h3 style="color: #E51636; margin: 0 0 15px 0; font-size: 16px;">🎯 Complete 5-Step Framework:</h3>
            <ul style="color: #333; line-height: 1.8; margin: 0; padding-left: 20px;">
              <li><strong>Step 1:</strong> Priority Matrix (Urgent vs Important)</li>
              <li><strong>Step 2:</strong> SMART Goal Creation</li>
              <li><strong>Step 3:</strong> Weekly Priority Assessment</li>
              <li><strong>Step 4:</strong> Monthly Priority Review</li>
              <li><strong>Step 5:</strong> Implementation & Systems</li>
            </ul>
          </div>

          <div style="background-color: #fff; border: 1px solid #e9ecef; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
            <h3 style="color: #E51636; margin: 0 0 15px 0; font-size: 16px;">📱 Easy Access:</h3>
            <ul style="color: #333; line-height: 1.8; margin: 0; padding-left: 20px;">
              <li>Click any playbook to instantly preview the full content</li>
              <li>Print-friendly format for offline reference</li>
              <li>Clean, professional layout optimized for quick reading</li>
            </ul>
          </div>

          <div style="background-color: #fff; border: 1px solid #e9ecef; border-radius: 8px; padding: 20px; margin-bottom: 25px;">
            <h3 style="color: #E51636; margin: 0 0 15px 0; font-size: 16px;">🛠️ Create Custom Playbooks:</h3>
            <ul style="color: #333; line-height: 1.8; margin: 0; padding-left: 20px;">
              <li>Build playbooks tailored to your store's specific needs</li>
              <li>Use our proven framework as your foundation</li>
              <li>Share best practices across your leadership team</li>
            </ul>
          </div>

          <!-- Getting Started Section -->
          <div style="background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); padding: 25px; border-radius: 10px; margin: 25px 0;">
            <h2 style="color: #E51636; margin: 0 0 20px 0; font-size: 20px;">🎬 Getting Started:</h2>
            <ol style="color: #333; line-height: 1.8; margin: 0; padding-left: 20px;">
              <li><strong>Log into LD Growth</strong> → Navigate to <strong>Leadership</strong> → <strong>Playbooks</strong></li>
              <li><strong>Try the Demo:</strong> Click on "Director of Facilities Playbook" to see how it works</li>
              <li><strong>Create Your Own:</strong> Use the "Create New Playbook" button to build custom guides</li>
              <li><strong>Share & Print:</strong> Use playbooks during team meetings and training sessions</li>
            </ol>
          </div>

          <!-- Call to Action -->
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://www.ld-growth.com/leadership/playbooks"
               style="display: inline-block; background: linear-gradient(135deg, #E51636 0%, #B91429 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; font-size: 16px; box-shadow: 0 4px 15px rgba(229, 22, 54, 0.3);">
              🚀 Explore Playbooks Now
            </a>
          </div>

          <p style="font-size: 16px; color: #333; line-height: 1.6; margin: 25px 0;">
            As always, if you have any questions or need assistance, don't hesitate to reach out.
          </p>

          <!-- Footer -->
          <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 30px;">
            <p style="margin: 0; color: #333;">
              Best regards,<br>
              <strong>Jonathon Pope</strong><br>
              LD Growth Platform<br>
              <a href="mailto:jonp4208@gmail.com" style="color: #E51636;">jonp4208@gmail.com</a>
            </p>
          </div>

          <!-- P.S. -->
          <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 15px; margin-top: 20px;">
            <p style="margin: 0; color: #856404; font-style: italic;">
              <strong>P.S.</strong> We'd love to hear what playbooks would be most valuable for your store. Reply with your ideas and we'll consider adding them to our library!
            </p>
          </div>
        </div>
      </div>
    `,
  }),
};

export default emailTemplates;