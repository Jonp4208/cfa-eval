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

  welcomeNewUser: (user, password, storeName) => ({
    to: user.email,
    subject: '🚀 Welcome to Your Leadership Journey - LD Growth',
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 700px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.1);">

        <!-- Hero Header with Gradient -->
        <div style="background: linear-gradient(135deg, #E51636 0%, #B91429 50%, #8B0F1F 100%); padding: 40px 30px; text-align: center; position: relative; overflow: hidden;">
          <!-- Decorative elements -->
          <div style="position: absolute; top: -50px; right: -50px; width: 100px; height: 100px; background: rgba(255,255,255,0.1); border-radius: 50%; opacity: 0.3;"></div>
          <div style="position: absolute; bottom: -30px; left: -30px; width: 60px; height: 60px; background: rgba(255,255,255,0.1); border-radius: 50%; opacity: 0.4;"></div>

          <h1 style="color: white; margin: 0 0 10px 0; font-size: 32px; font-weight: 700; text-shadow: 0 2px 4px rgba(0,0,0,0.3);">
            🎉 Welcome to LD Growth!
          </h1>
          <p style="color: rgba(255,255,255,0.95); margin: 0; font-size: 18px; font-weight: 400; line-height: 1.4;">
            Your Leadership Journey Starts Today
          </p>
        </div>

        <!-- Main Content -->
        <div style="padding: 40px 30px;">

          <!-- Personal Greeting -->
          <div style="text-align: center; margin-bottom: 35px;">
            <h2 style="color: #2D3748; margin: 0 0 15px 0; font-size: 24px; font-weight: 600;">
              Hello ${user.name}! 👋
            </h2>
            <p style="color: #4A5568; margin: 0; font-size: 16px; line-height: 1.6;">
              Get ready to take your leadership to the next level! You're about to embark on an incredible journey of growth, development, and transformation at <strong>${storeName}</strong>.
            </p>
          </div>

          <!-- Inspirational Quote Box -->
          <div style="background: linear-gradient(135deg, #F7FAFC 0%, #EDF2F7 100%); border-left: 4px solid #E51636; padding: 25px; margin: 30px 0; border-radius: 8px; position: relative;">
            <div style="position: absolute; top: 15px; right: 20px; font-size: 40px; color: #E51636; opacity: 0.3;">"</div>
            <p style="margin: 0; font-style: italic; color: #2D3748; font-size: 16px; line-height: 1.6; font-weight: 500;">
              "Leadership is not about being in charge. It's about taking care of those in your charge."
            </p>
            <p style="margin: 10px 0 0 0; color: #718096; font-size: 14px; text-align: right;">
              — Simon Sinek
            </p>
          </div>

          <!-- Login Credentials Card -->
          <div style="background: linear-gradient(135deg, #FFF5F5 0%, #FED7D7 20%, #FFF5F5 100%); border: 2px solid #E51636; border-radius: 12px; padding: 25px; margin: 30px 0; text-align: center; position: relative; overflow: hidden;">
            <div style="position: absolute; top: -20px; right: -20px; width: 40px; height: 40px; background: rgba(229, 22, 54, 0.1); border-radius: 50%;"></div>
            <div style="position: absolute; bottom: -15px; left: -15px; width: 30px; height: 30px; background: rgba(229, 22, 54, 0.1); border-radius: 50%;"></div>

            <h3 style="color: #E51636; margin: 0 0 20px 0; font-size: 20px; font-weight: 600;">
              🔑 Your Access Details
            </h3>

            <div style="background: white; border-radius: 8px; padding: 20px; margin: 15px 0; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
              <div style="margin-bottom: 15px;">
                <p style="margin: 0 0 5px 0; color: #4A5568; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Website</p>
                <a href="https://www.ld-growth.com" style="color: #E51636; font-size: 18px; font-weight: 600; text-decoration: none; display: inline-block; padding: 8px 16px; background: rgba(229, 22, 54, 0.1); border-radius: 6px; transition: all 0.3s ease;">
                  www.ld-growth.com
                </a>
              </div>

              <div style="margin-bottom: 15px;">
                <p style="margin: 0 0 5px 0; color: #4A5568; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Email</p>
                <p style="margin: 0; color: #2D3748; font-size: 16px; font-weight: 500; background: #F7FAFC; padding: 8px 12px; border-radius: 6px; border: 1px solid #E2E8F0;">
                  ${user.email}
                </p>
              </div>

              <div>
                <p style="margin: 0 0 5px 0; color: #4A5568; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Temporary Password</p>
                <p style="margin: 0; color: #2D3748; font-size: 16px; font-weight: 600; background: #FFF5F5; padding: 12px; border-radius: 6px; border: 2px solid #E51636; font-family: 'Courier New', monospace; letter-spacing: 1px;">
                  ${password}
                </p>
              </div>
            </div>
          </div>

          <!-- Call to Action Button -->
          <div style="text-align: center; margin: 35px 0;">
            <a href="https://www.ld-growth.com" style="display: inline-block; background: linear-gradient(135deg, #E51636 0%, #B91429 100%); color: white; padding: 16px 32px; text-decoration: none; border-radius: 50px; font-size: 18px; font-weight: 600; box-shadow: 0 4px 15px rgba(229, 22, 54, 0.4); transition: all 0.3s ease; text-transform: uppercase; letter-spacing: 0.5px;">
              🚀 Start Your Journey
            </a>
          </div>

          <!-- What's Next Section -->
          <div style="background: linear-gradient(135deg, #F0FFF4 0%, #C6F6D5 20%, #F0FFF4 100%); border-radius: 12px; padding: 25px; margin: 30px 0;">
            <h3 style="color: #22543D; margin: 0 0 20px 0; font-size: 20px; font-weight: 600; text-align: center;">
              🎯 What's Next?
            </h3>

            <div style="display: grid; gap: 15px;">
              <div style="display: flex; align-items: flex-start; gap: 12px;">
                <div style="background: #38A169; color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: bold; flex-shrink: 0; margin-top: 2px;">1</div>
                <div>
                  <p style="margin: 0; color: #22543D; font-weight: 600; font-size: 16px;">Log in and change your password</p>
                  <p style="margin: 5px 0 0 0; color: #2F855A; font-size: 14px;">For your security, please update your password immediately after your first login.</p>
                </div>
              </div>

              <div style="display: flex; align-items: flex-start; gap: 12px;">
                <div style="background: #38A169; color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: bold; flex-shrink: 0; margin-top: 2px;">2</div>
                <div>
                  <p style="margin: 0; color: #22543D; font-weight: 600; font-size: 16px;">Explore your dashboard</p>
                  <p style="margin: 5px 0 0 0; color: #2F855A; font-size: 14px;">Discover all the leadership development tools and resources available to you.</p>
                </div>
              </div>

              <div style="display: flex; align-items: flex-start; gap: 12px;">
                <div style="background: #38A169; color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: bold; flex-shrink: 0; margin-top: 2px;">3</div>
                <div>
                  <p style="margin: 0; color: #22543D; font-weight: 600; font-size: 16px;">Begin your first assessment</p>
                  <p style="margin: 5px 0 0 0; color: #2F855A; font-size: 14px;">Start with a leadership style assessment to understand your unique strengths.</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Personal Message from Jonathon -->
          <div style="background: linear-gradient(135deg, #EBF8FF 0%, #BEE3F8 20%, #EBF8FF 100%); border-radius: 12px; padding: 25px; margin: 30px 0; border-left: 4px solid #3182CE;">
            <h3 style="color: #2B6CB0; margin: 0 0 15px 0; font-size: 18px; font-weight: 600;">
              📧 A Personal Note from Jonathon
            </h3>
            <p style="margin: 0 0 15px 0; color: #2D3748; font-size: 16px; line-height: 1.6;">
              Welcome to the LD Growth family! I'm thrilled you've joined us on this leadership development journey. With 15 years of leadership experience and 10 years at Chick-fil-A, I've designed this platform specifically for leaders like you who want to make a real difference.
            </p>
            <p style="margin: 0; color: #2D3748; font-size: 16px; line-height: 1.6;">
              If you have any questions or need assistance getting started, don't hesitate to reach out. I'm here to support your growth every step of the way!
            </p>

            <div style="margin-top: 20px; padding-top: 15px; border-top: 1px solid #CBD5E0;">
              <p style="margin: 0; color: #2B6CB0; font-weight: 600;">
                Jonathon Pope<br>
                <span style="font-weight: 400; color: #4A5568;">Founder, LD Growth</span><br>
                <a href="mailto:Jonathon@LD-Growth.com" style="color: #E51636; text-decoration: none;">Jonathon@LD-Growth.com</a>
              </p>
            </div>
          </div>

          <!-- Security Notice -->
          <div style="background: #FFF5F5; border: 1px solid #FEB2B2; border-radius: 8px; padding: 20px; margin: 25px 0;">
            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
              <span style="font-size: 20px;">🔒</span>
              <h4 style="margin: 0; color: #C53030; font-size: 16px; font-weight: 600;">Important Security Notice</h4>
            </div>
            <p style="margin: 0; color: #742A2A; font-size: 14px; line-height: 1.5;">
              For your security, please change your password immediately upon first login. Your temporary password is only meant for initial access.
            </p>
          </div>

        </div>

        <!-- Footer -->
        <div style="background: #F7FAFC; padding: 25px 30px; text-align: center; border-top: 1px solid #E2E8F0;">
          <p style="margin: 0 0 10px 0; color: #4A5568; font-size: 14px;">
            Ready to unlock your leadership potential? Your journey begins now! 🌟
          </p>
          <p style="margin: 0; color: #718096; font-size: 12px;">
            © 2024 LD Growth. Empowering leaders, one step at a time.
          </p>
        </div>

      </div>
    `,
  }),
};

export default emailTemplates;