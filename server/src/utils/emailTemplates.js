const emailTemplates = {
  trainingAssigned: (employee, plan, startDate) => ({
    to: employee.email,
    subject: '📚 New Training Plan Assigned - LD Growth',
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 700px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.1);">

        <!-- Hero Header with Gradient -->
        <div style="background: linear-gradient(135deg, #059669 0%, #047857 50%, #065F46 100%); padding: 40px 30px; text-align: center; position: relative; overflow: hidden;">
          <!-- Decorative elements -->
          <div style="position: absolute; top: -50px; right: -50px; width: 100px; height: 100px; background: rgba(255,255,255,0.1); border-radius: 50%; opacity: 0.3;"></div>
          <div style="position: absolute; bottom: -30px; left: -30px; width: 60px; height: 60px; background: rgba(255,255,255,0.1); border-radius: 50%; opacity: 0.4;"></div>

          <h1 style="color: white; margin: 0 0 10px 0; font-size: 32px; font-weight: 700; text-shadow: 0 2px 4px rgba(0,0,0,0.3);">
            📚 New Training Assigned!
          </h1>
          <p style="color: rgba(255,255,255,0.95); margin: 0; font-size: 18px; font-weight: 400; line-height: 1.4;">
            Your Development Journey Continues
          </p>
        </div>

        <!-- Main Content -->
        <div style="padding: 40px 30px;">

          <!-- Personal Greeting -->
          <div style="text-align: center; margin-bottom: 35px;">
            <h2 style="color: #2D3748; margin: 0 0 15px 0; font-size: 24px; font-weight: 600;">
              Hello ${employee.name}! 👋
            </h2>
            <p style="color: #4A5568; margin: 0; font-size: 16px; line-height: 1.6;">
              Exciting news! You've been assigned a new training plan to help accelerate your leadership development. This is another step forward in your growth journey!
            </p>
          </div>

          <!-- Training Plan Details Card -->
          <div style="background: linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 20%, #F0FDF4 100%); border: 2px solid #059669; border-radius: 12px; padding: 25px; margin: 30px 0; text-align: center; position: relative; overflow: hidden;">
            <div style="position: absolute; top: -20px; right: -20px; width: 40px; height: 40px; background: rgba(5, 150, 105, 0.1); border-radius: 50%;"></div>
            <div style="position: absolute; bottom: -15px; left: -15px; width: 30px; height: 30px; background: rgba(5, 150, 105, 0.1); border-radius: 50%;"></div>

            <h3 style="color: #059669; margin: 0 0 20px 0; font-size: 20px; font-weight: 600;">
              📋 Training Plan Details
            </h3>

            <div style="background: white; border-radius: 8px; padding: 20px; margin: 15px 0; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
              <div style="margin-bottom: 15px;">
                <p style="margin: 0 0 5px 0; color: #4A5568; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Training Plan</p>
                <p style="margin: 0; color: #2D3748; font-size: 18px; font-weight: 600; color: #059669;">
                  ${plan.name}
                </p>
              </div>

              <div style="margin-bottom: 15px;">
                <p style="margin: 0 0 5px 0; color: #4A5568; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Start Date</p>
                <p style="margin: 0; color: #2D3748; font-size: 16px; font-weight: 500; background: #F7FAFC; padding: 8px 12px; border-radius: 6px; border: 1px solid #E2E8F0;">
                  ${new Date(startDate).toLocaleDateString()}
                </p>
              </div>

              <div>
                <p style="margin: 0 0 5px 0; color: #4A5568; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Duration</p>
                <p style="margin: 0; color: #2D3748; font-size: 16px; font-weight: 500; background: #F7FAFC; padding: 8px 12px; border-radius: 6px; border: 1px solid #E2E8F0;">
                  ${plan.modules?.length || 0} modules
                </p>
              </div>
            </div>
          </div>

          <!-- Call to Action Button -->
          <div style="text-align: center; margin: 35px 0;">
            <a href="https://www.ld-growth.com" style="display: inline-block; background: linear-gradient(135deg, #059669 0%, #047857 100%); color: white; padding: 16px 32px; text-decoration: none; border-radius: 50px; font-size: 18px; font-weight: 600; box-shadow: 0 4px 15px rgba(5, 150, 105, 0.4); transition: all 0.3s ease; text-transform: uppercase; letter-spacing: 0.5px;">
              🚀 Start Training
            </a>
          </div>

          <!-- Motivational Message -->
          <div style="background: linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 20%, #FFFBEB 100%); border-radius: 12px; padding: 25px; margin: 30px 0; border-left: 4px solid #F59E0B;">
            <h3 style="color: #92400E; margin: 0 0 15px 0; font-size: 18px; font-weight: 600;">
              💪 Your Growth Journey
            </h3>
            <p style="margin: 0; color: #2D3748; font-size: 16px; line-height: 1.6;">
              Every great leader started with a commitment to continuous learning. This training plan is designed to help you develop new skills, gain confidence, and take your leadership to the next level. You've got this!
            </p>
          </div>

        </div>

        <!-- Footer -->
        <div style="background: #F7FAFC; padding: 25px 30px; text-align: center; border-top: 1px solid #E2E8F0;">
          <p style="margin: 0 0 10px 0; color: #4A5568; font-size: 14px;">
            Ready to grow? Your training awaits! 🌟
          </p>
          <p style="margin: 0; color: #718096; font-size: 12px;">
            © 2024 LD Growth. Empowering leaders, one step at a time.
          </p>
        </div>

      </div>
    `,
  }),

  moduleCompleted: (employee, module) => ({
    to: employee.email,
    subject: '🎉 Training Module Completed - Congratulations!',
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 700px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.1);">

        <!-- Hero Header with Gradient -->
        <div style="background: linear-gradient(135deg, #7C3AED 0%, #6D28D9 50%, #5B21B6 100%); padding: 40px 30px; text-align: center; position: relative; overflow: hidden;">
          <!-- Decorative elements -->
          <div style="position: absolute; top: -50px; right: -50px; width: 100px; height: 100px; background: rgba(255,255,255,0.1); border-radius: 50%; opacity: 0.3;"></div>
          <div style="position: absolute; bottom: -30px; left: -30px; width: 60px; height: 60px; background: rgba(255,255,255,0.1); border-radius: 50%; opacity: 0.4;"></div>

          <h1 style="color: white; margin: 0 0 10px 0; font-size: 32px; font-weight: 700; text-shadow: 0 2px 4px rgba(0,0,0,0.3);">
            🎉 Congratulations!
          </h1>
          <p style="color: rgba(255,255,255,0.95); margin: 0; font-size: 18px; font-weight: 400; line-height: 1.4;">
            Module Completed Successfully
          </p>
        </div>

        <!-- Main Content -->
        <div style="padding: 40px 30px;">

          <!-- Personal Greeting -->
          <div style="text-align: center; margin-bottom: 35px;">
            <h2 style="color: #2D3748; margin: 0 0 15px 0; font-size: 24px; font-weight: 600;">
              Amazing work, ${employee.name}! 🌟
            </h2>
            <p style="color: #4A5568; margin: 0; font-size: 16px; line-height: 1.6;">
              You've successfully completed another training module! Each step forward brings you closer to becoming the leader you're meant to be.
            </p>
          </div>

          <!-- Achievement Card -->
          <div style="background: linear-gradient(135deg, #FAF5FF 0%, #E9D5FF 20%, #FAF5FF 100%); border: 2px solid #7C3AED; border-radius: 12px; padding: 25px; margin: 30px 0; text-align: center; position: relative; overflow: hidden;">
            <div style="position: absolute; top: -20px; right: -20px; width: 40px; height: 40px; background: rgba(124, 58, 237, 0.1); border-radius: 50%;"></div>
            <div style="position: absolute; bottom: -15px; left: -15px; width: 30px; height: 30px; background: rgba(124, 58, 237, 0.1); border-radius: 50%;"></div>

            <h3 style="color: #7C3AED; margin: 0 0 20px 0; font-size: 20px; font-weight: 600;">
              🏆 Module Achievement
            </h3>

            <div style="background: white; border-radius: 8px; padding: 20px; margin: 15px 0; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
              <div style="margin-bottom: 15px;">
                <p style="margin: 0 0 5px 0; color: #4A5568; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Completed Module</p>
                <p style="margin: 0; color: #2D3748; font-size: 18px; font-weight: 600; color: #7C3AED;">
                  ${module.name}
                </p>
              </div>

              <div>
                <p style="margin: 0 0 5px 0; color: #4A5568; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Training Plan</p>
                <p style="margin: 0; color: #2D3748; font-size: 16px; font-weight: 500; background: #F7FAFC; padding: 8px 12px; border-radius: 6px; border: 1px solid #E2E8F0;">
                  ${employee.trainingPlan?.name || 'Leadership Development'}
                </p>
              </div>
            </div>
          </div>

          <!-- Motivational Message -->
          <div style="background: linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 20%, #F0FDF4 100%); border-radius: 12px; padding: 25px; margin: 30px 0; border-left: 4px solid #059669;">
            <h3 style="color: #059669; margin: 0 0 15px 0; font-size: 18px; font-weight: 600;">
              🚀 Keep the Momentum Going!
            </h3>
            <p style="margin: 0; color: #2D3748; font-size: 16px; line-height: 1.6;">
              Every module you complete is a building block in your leadership foundation. You're developing skills that will serve you throughout your career. Keep up the excellent work!
            </p>
          </div>

          <!-- Call to Action Button -->
          <div style="text-align: center; margin: 35px 0;">
            <a href="https://www.ld-growth.com" style="display: inline-block; background: linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%); color: white; padding: 16px 32px; text-decoration: none; border-radius: 50px; font-size: 18px; font-weight: 600; box-shadow: 0 4px 15px rgba(124, 58, 237, 0.4); transition: all 0.3s ease; text-transform: uppercase; letter-spacing: 0.5px;">
              🎯 Continue Training
            </a>
          </div>

        </div>

        <!-- Footer -->
        <div style="background: #F7FAFC; padding: 25px 30px; text-align: center; border-top: 1px solid #E2E8F0;">
          <p style="margin: 0 0 10px 0; color: #4A5568; font-size: 14px;">
            Proud of your progress! Keep growing! 🌟
          </p>
          <p style="margin: 0; color: #718096; font-size: 12px;">
            © 2024 LD Growth. Empowering leaders, one step at a time.
          </p>
        </div>

      </div>
    `,
  }),

  trainingCompleted: (employee, plan) => ({
    to: employee.email,
    subject: '🏆 Training Plan Completed - Outstanding Achievement!',
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 700px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.1);">

        <!-- Hero Header with Gradient -->
        <div style="background: linear-gradient(135deg, #F59E0B 0%, #D97706 50%, #B45309 100%); padding: 40px 30px; text-align: center; position: relative; overflow: hidden;">
          <!-- Decorative elements -->
          <div style="position: absolute; top: -50px; right: -50px; width: 100px; height: 100px; background: rgba(255,255,255,0.1); border-radius: 50%; opacity: 0.3;"></div>
          <div style="position: absolute; bottom: -30px; left: -30px; width: 60px; height: 60px; background: rgba(255,255,255,0.1); border-radius: 50%; opacity: 0.4;"></div>

          <h1 style="color: white; margin: 0 0 10px 0; font-size: 32px; font-weight: 700; text-shadow: 0 2px 4px rgba(0,0,0,0.3);">
            🏆 Outstanding Achievement!
          </h1>
          <p style="color: rgba(255,255,255,0.95); margin: 0; font-size: 18px; font-weight: 400; line-height: 1.4;">
            Training Plan Completed
          </p>
        </div>

        <!-- Main Content -->
        <div style="padding: 40px 30px;">

          <!-- Personal Greeting -->
          <div style="text-align: center; margin-bottom: 35px;">
            <h2 style="color: #2D3748; margin: 0 0 15px 0; font-size: 24px; font-weight: 600;">
              Incredible work, ${employee.name}! 🎉
            </h2>
            <p style="color: #4A5568; margin: 0; font-size: 16px; line-height: 1.6;">
              You've reached a major milestone in your leadership journey! Completing an entire training plan demonstrates your commitment to growth and excellence.
            </p>
          </div>

          <!-- Achievement Card -->
          <div style="background: linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 20%, #FFFBEB 100%); border: 2px solid #F59E0B; border-radius: 12px; padding: 25px; margin: 30px 0; text-align: center; position: relative; overflow: hidden;">
            <div style="position: absolute; top: -20px; right: -20px; width: 40px; height: 40px; background: rgba(245, 158, 11, 0.1); border-radius: 50%;"></div>
            <div style="position: absolute; bottom: -15px; left: -15px; width: 30px; height: 30px; background: rgba(245, 158, 11, 0.1); border-radius: 50%;"></div>

            <h3 style="color: #F59E0B; margin: 0 0 20px 0; font-size: 20px; font-weight: 600;">
              🎓 Training Plan Achievement
            </h3>

            <div style="background: white; border-radius: 8px; padding: 20px; margin: 15px 0; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
              <div style="margin-bottom: 15px;">
                <p style="margin: 0 0 5px 0; color: #4A5568; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Completed Training Plan</p>
                <p style="margin: 0; color: #2D3748; font-size: 18px; font-weight: 600; color: #F59E0B;">
                  ${plan.name}
                </p>
              </div>

              <div style="background: #F0FDF4; border: 1px solid #BBF7D0; border-radius: 6px; padding: 15px;">
                <p style="margin: 0; color: #059669; font-size: 16px; font-weight: 600; text-align: center;">
                  ✅ 100% Complete
                </p>
              </div>
            </div>
          </div>

          <!-- Celebration Message -->
          <div style="background: linear-gradient(135deg, #EBF8FF 0%, #BEE3F8 20%, #EBF8FF 100%); border-radius: 12px; padding: 25px; margin: 30px 0; border-left: 4px solid #3182CE;">
            <h3 style="color: #2B6CB0; margin: 0 0 15px 0; font-size: 18px; font-weight: 600;">
              🌟 This is a Significant Achievement!
            </h3>
            <p style="margin: 0 0 15px 0; color: #2D3748; font-size: 16px; line-height: 1.6;">
              Your dedication to learning and improvement is truly appreciated. You've invested in yourself and your future, and that commitment will pay dividends throughout your leadership career.
            </p>
            <p style="margin: 0; color: #2D3748; font-size: 16px; line-height: 1.6;">
              You're not just completing training - you're building the foundation for exceptional leadership!
            </p>
          </div>

          <!-- Call to Action Button -->
          <div style="text-align: center; margin: 35px 0;">
            <a href="https://www.ld-growth.com" style="display: inline-block; background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%); color: white; padding: 16px 32px; text-decoration: none; border-radius: 50px; font-size: 18px; font-weight: 600; box-shadow: 0 4px 15px rgba(245, 158, 11, 0.4); transition: all 0.3s ease; text-transform: uppercase; letter-spacing: 0.5px;">
              🚀 Continue Growing
            </a>
          </div>

          <!-- Personal Message from Jonathon -->
          <div style="background: linear-gradient(135deg, #FFF5F5 0%, #FED7D7 20%, #FFF5F5 100%); border-radius: 12px; padding: 25px; margin: 30px 0; border-left: 4px solid #E51636;">
            <h3 style="color: #C53030; margin: 0 0 15px 0; font-size: 18px; font-weight: 600;">
              📧 A Personal Congratulations from Jonathon
            </h3>
            <p style="margin: 0; color: #2D3748; font-size: 16px; line-height: 1.6;">
              Congratulations on this outstanding achievement! Completing a full training plan shows the kind of commitment and dedication that separates good leaders from great ones. I'm proud of your progress and excited to see how you'll apply these new skills in your leadership role.
            </p>

            <div style="margin-top: 20px; padding-top: 15px; border-top: 1px solid #FEB2B2;">
              <p style="margin: 0; color: #C53030; font-weight: 600;">
                Jonathon Pope<br>
                <span style="font-weight: 400; color: #4A5568;">Founder, LD Growth</span>
              </p>
            </div>
          </div>

        </div>

        <!-- Footer -->
        <div style="background: #F7FAFC; padding: 25px 30px; text-align: center; border-top: 1px solid #E2E8F0;">
          <p style="margin: 0 0 10px 0; color: #4A5568; font-size: 14px;">
            Celebrating your success! The future is bright! 🌟
          </p>
          <p style="margin: 0; color: #718096; font-size: 12px;">
            © 2024 LD Growth. Empowering leaders, one step at a time.
          </p>
        </div>

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
              <a href="mailto:Jonathon@LD-Growth.com" style="color: #E51636;">Jonathon@LD-Growth.com</a>
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

  welcomeStoreAdmin: (adminUser, password, store) => ({
    to: adminUser.email,
    subject: '🏪 Welcome to LD Growth - Your Store Admin Account',
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 700px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.1);">

        <!-- Hero Header with Gradient -->
        <div style="background: linear-gradient(135deg, #E51636 0%, #B91429 50%, #8B0F1F 100%); padding: 40px 30px; text-align: center; position: relative; overflow: hidden;">
          <!-- Decorative elements -->
          <div style="position: absolute; top: -50px; right: -50px; width: 100px; height: 100px; background: rgba(255,255,255,0.1); border-radius: 50%; opacity: 0.3;"></div>
          <div style="position: absolute; bottom: -30px; left: -30px; width: 60px; height: 60px; background: rgba(255,255,255,0.1); border-radius: 50%; opacity: 0.4;"></div>

          <h1 style="color: white; margin: 0 0 10px 0; font-size: 32px; font-weight: 700; text-shadow: 0 2px 4px rgba(0,0,0,0.3);">
            🏪 Welcome to LD Growth!
          </h1>
          <p style="color: rgba(255,255,255,0.95); margin: 0; font-size: 18px; font-weight: 400; line-height: 1.4;">
            Your Store Admin Account is Ready
          </p>
        </div>

        <!-- Main Content -->
        <div style="padding: 40px 30px;">

          <!-- Personal Greeting -->
          <div style="text-align: center; margin-bottom: 35px;">
            <h2 style="color: #2D3748; margin: 0 0 15px 0; font-size: 24px; font-weight: 600;">
              Hello ${adminUser.name}! 👋
            </h2>
            <p style="color: #4A5568; margin: 0; font-size: 16px; line-height: 1.6;">
              Congratulations! Your admin account for <strong>${store.name}</strong> has been created successfully. You're now ready to lead your team's development journey with LD Growth's powerful leadership tools.
            </p>
          </div>

          <!-- Store Information Card -->
          <div style="background: linear-gradient(135deg, #F0FFF4 0%, #C6F6D5 20%, #F0FFF4 100%); border: 2px solid #38A169; border-radius: 12px; padding: 25px; margin: 30px 0; text-align: center; position: relative; overflow: hidden;">
            <div style="position: absolute; top: -20px; right: -20px; width: 40px; height: 40px; background: rgba(56, 161, 105, 0.1); border-radius: 50%;"></div>
            <div style="position: absolute; bottom: -15px; left: -15px; width: 30px; height: 30px; background: rgba(56, 161, 105, 0.1); border-radius: 50%;"></div>

            <h3 style="color: #22543D; margin: 0 0 20px 0; font-size: 20px; font-weight: 600;">
              🏢 Your Store Information
            </h3>

            <div style="background: white; border-radius: 8px; padding: 20px; margin: 15px 0; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
              <div style="margin-bottom: 15px;">
                <p style="margin: 0 0 5px 0; color: #4A5568; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Store Name</p>
                <p style="margin: 0; color: #2D3748; font-size: 18px; font-weight: 600; color: #22543D;">
                  ${store.name}
                </p>
              </div>

              <div style="margin-bottom: 15px;">
                <p style="margin: 0 0 5px 0; color: #4A5568; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Store Number</p>
                <p style="margin: 0; color: #2D3748; font-size: 16px; font-weight: 500; background: #F7FAFC; padding: 8px 12px; border-radius: 6px; border: 1px solid #E2E8F0;">
                  #${store.storeNumber}
                </p>
              </div>

              <div>
                <p style="margin: 0 0 5px 0; color: #4A5568; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Store Email</p>
                <p style="margin: 0; color: #2D3748; font-size: 16px; font-weight: 500; background: #F7FAFC; padding: 8px 12px; border-radius: 6px; border: 1px solid #E2E8F0;">
                  ${store.storeEmail}
                </p>
              </div>
            </div>
          </div>

          <!-- Login Credentials Card -->
          <div style="background: linear-gradient(135deg, #FFF5F5 0%, #FED7D7 20%, #FFF5F5 100%); border: 2px solid #E51636; border-radius: 12px; padding: 25px; margin: 30px 0; text-align: center; position: relative; overflow: hidden;">
            <div style="position: absolute; top: -20px; right: -20px; width: 40px; height: 40px; background: rgba(229, 22, 54, 0.1); border-radius: 50%;"></div>
            <div style="position: absolute; bottom: -15px; left: -15px; width: 30px; height: 30px; background: rgba(229, 22, 54, 0.1); border-radius: 50%;"></div>

            <h3 style="color: #E51636; margin: 0 0 20px 0; font-size: 20px; font-weight: 600;">
              🔑 Your Admin Login Details
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
                  ${adminUser.email}
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
              🚀 Access Your Admin Dashboard
            </a>
          </div>

          <!-- Admin Powers Section -->
          <div style="background: linear-gradient(135deg, #EBF8FF 0%, #BEE3F8 20%, #EBF8FF 100%); border-radius: 12px; padding: 25px; margin: 30px 0;">
            <h3 style="color: #2B6CB0; margin: 0 0 20px 0; font-size: 20px; font-weight: 600; text-align: center;">
              🎯 Your Admin Superpowers
            </h3>

            <div style="display: grid; gap: 15px;">
              <div style="display: flex; align-items: flex-start; gap: 12px;">
                <div style="background: #3182CE; color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: bold; flex-shrink: 0; margin-top: 2px;">👥</div>
                <div>
                  <p style="margin: 0; color: #2B6CB0; font-weight: 600; font-size: 16px;">Manage Your Team</p>
                  <p style="margin: 5px 0 0 0; color: #4A5568; font-size: 14px;">Add team members, assign roles, and track their development progress.</p>
                </div>
              </div>

              <div style="display: flex; align-items: flex-start; gap: 12px;">
                <div style="background: #3182CE; color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: bold; flex-shrink: 0; margin-top: 2px;">📊</div>
                <div>
                  <p style="margin: 0; color: #2B6CB0; font-weight: 600; font-size: 16px;">Track Performance & Analytics</p>
                  <p style="margin: 5px 0 0 0; color: #4A5568; font-size: 14px;">Access detailed reports and insights on your team's leadership growth.</p>
                </div>
              </div>

              <div style="display: flex; align-items: flex-start; gap: 12px;">
                <div style="background: #3182CE; color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: bold; flex-shrink: 0; margin-top: 2px;">📚</div>
                <div>
                  <p style="margin: 0; color: #2B6CB0; font-weight: 600; font-size: 16px;">Create Training Plans</p>
                  <p style="margin: 5px 0 0 0; color: #4A5568; font-size: 14px;">Design custom development paths and assign leadership assessments.</p>
                </div>
              </div>

              <div style="display: flex; align-items: flex-start; gap: 12px;">
                <div style="background: #3182CE; color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: bold; flex-shrink: 0; margin-top: 2px;">⚙️</div>
                <div>
                  <p style="margin: 0; color: #2B6CB0; font-weight: 600; font-size: 16px;">Configure Store Settings</p>
                  <p style="margin: 5px 0 0 0; color: #4A5568; font-size: 14px;">Customize your store's preferences and leadership development goals.</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Personal Message from Jonathon -->
          <div style="background: linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 20%, #FFFBEB 100%); border-radius: 12px; padding: 25px; margin: 30px 0; border-left: 4px solid #F59E0B;">
            <h3 style="color: #92400E; margin: 0 0 15px 0; font-size: 18px; font-weight: 600;">
              📧 A Personal Note from Jonathon
            </h3>
            <p style="margin: 0 0 15px 0; color: #2D3748; font-size: 16px; line-height: 1.6;">
              Welcome to the LD Growth family! As a store admin, you're taking on a crucial role in developing the next generation of Chick-fil-A leaders. With 15 years of leadership experience and 10 years at Chick-fil-A, I've built this platform specifically for leaders like you who want to make a lasting impact.
            </p>
            <p style="margin: 0; color: #2D3748; font-size: 16px; line-height: 1.6;">
              Your leadership will shape not just individual careers, but the entire culture of excellence at your store. I'm excited to support you on this journey!
            </p>

            <div style="margin-top: 20px; padding-top: 15px; border-top: 1px solid #FDE68A;">
              <p style="margin: 0; color: #92400E; font-weight: 600;">
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
              For your security, please change your password immediately upon first login. As an admin, you have access to sensitive team data - keeping your account secure is crucial.
            </p>
          </div>

        </div>

        <!-- Footer -->
        <div style="background: #F7FAFC; padding: 25px 30px; text-align: center; border-top: 1px solid #E2E8F0;">
          <p style="margin: 0 0 10px 0; color: #4A5568; font-size: 14px;">
            Ready to lead your team to greatness? Your admin journey begins now! 🌟
          </p>
          <p style="margin: 0; color: #718096; font-size: 12px;">
            © 2024 LD Growth. Empowering leaders, one store at a time.
          </p>
        </div>

      </div>
    `,
  }),

  passwordReset: (user, newPassword) => ({
    to: user.email,
    subject: '🔒 Password Reset - LD Growth',
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 700px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.1);">

        <!-- Hero Header with Gradient -->
        <div style="background: linear-gradient(135deg, #DC2626 0%, #B91C1C 50%, #991B1B 100%); padding: 40px 30px; text-align: center; position: relative; overflow: hidden;">
          <!-- Decorative elements -->
          <div style="position: absolute; top: -50px; right: -50px; width: 100px; height: 100px; background: rgba(255,255,255,0.1); border-radius: 50%; opacity: 0.3;"></div>
          <div style="position: absolute; bottom: -30px; left: -30px; width: 60px; height: 60px; background: rgba(255,255,255,0.1); border-radius: 50%; opacity: 0.4;"></div>

          <h1 style="color: white; margin: 0 0 10px 0; font-size: 32px; font-weight: 700; text-shadow: 0 2px 4px rgba(0,0,0,0.3);">
            🔒 Password Reset
          </h1>
          <p style="color: rgba(255,255,255,0.95); margin: 0; font-size: 18px; font-weight: 400; line-height: 1.4;">
            Your New Login Credentials
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
              Your password has been reset by an administrator. Below are your new login credentials to access LD Growth.
            </p>
          </div>

          <!-- New Credentials Card -->
          <div style="background: linear-gradient(135deg, #FFF5F5 0%, #FED7D7 20%, #FFF5F5 100%); border: 2px solid #DC2626; border-radius: 12px; padding: 25px; margin: 30px 0; text-align: center; position: relative; overflow: hidden;">
            <div style="position: absolute; top: -20px; right: -20px; width: 40px; height: 40px; background: rgba(220, 38, 38, 0.1); border-radius: 50%;"></div>
            <div style="position: absolute; bottom: -15px; left: -15px; width: 30px; height: 30px; background: rgba(220, 38, 38, 0.1); border-radius: 50%;"></div>

            <h3 style="color: #DC2626; margin: 0 0 20px 0; font-size: 20px; font-weight: 600;">
              🔑 Your New Login Details
            </h3>

            <div style="background: white; border-radius: 8px; padding: 20px; margin: 15px 0; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
              <div style="margin-bottom: 15px;">
                <p style="margin: 0 0 5px 0; color: #4A5568; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Website</p>
                <a href="https://www.ld-growth.com" style="color: #DC2626; font-size: 18px; font-weight: 600; text-decoration: none; display: inline-block; padding: 8px 16px; background: rgba(220, 38, 38, 0.1); border-radius: 6px; transition: all 0.3s ease;">
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
                <p style="margin: 0 0 5px 0; color: #4A5568; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">New Password</p>
                <p style="margin: 0; color: #2D3748; font-size: 16px; font-weight: 600; background: #FFF5F5; padding: 12px; border-radius: 6px; border: 2px solid #DC2626; font-family: 'Courier New', monospace; letter-spacing: 1px;">
                  ${newPassword}
                </p>
              </div>
            </div>
          </div>

          <!-- Call to Action Button -->
          <div style="text-align: center; margin: 35px 0;">
            <a href="https://www.ld-growth.com" style="display: inline-block; background: linear-gradient(135deg, #DC2626 0%, #B91C1C 100%); color: white; padding: 16px 32px; text-decoration: none; border-radius: 50px; font-size: 18px; font-weight: 600; box-shadow: 0 4px 15px rgba(220, 38, 38, 0.4); transition: all 0.3s ease; text-transform: uppercase; letter-spacing: 0.5px;">
              🚀 Login Now
            </a>
          </div>

          <!-- Security Notice -->
          <div style="background: #FFF5F5; border: 1px solid #FEB2B2; border-radius: 8px; padding: 20px; margin: 25px 0;">
            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
              <span style="font-size: 20px;">🔒</span>
              <h4 style="margin: 0; color: #C53030; font-size: 16px; font-weight: 600;">Important Security Notice</h4>
            </div>
            <p style="margin: 0; color: #742A2A; font-size: 14px; line-height: 1.5;">
              For your security, please change your password immediately after logging in. If you didn't request this password reset, please contact your administrator immediately.
            </p>
          </div>

          <!-- Support Section -->
          <div style="background: linear-gradient(135deg, #EBF8FF 0%, #BEE3F8 20%, #EBF8FF 100%); border-radius: 12px; padding: 25px; margin: 30px 0; border-left: 4px solid #3182CE;">
            <h3 style="color: #2B6CB0; margin: 0 0 15px 0; font-size: 18px; font-weight: 600;">
              📧 Need Help?
            </h3>
            <p style="margin: 0; color: #2D3748; font-size: 16px; line-height: 1.6;">
              If you have any questions or need assistance, don't hesitate to reach out to our support team at <a href="mailto:Jonathon@LD-Growth.com" style="color: #E51636; text-decoration: none; font-weight: 600;">Jonathon@LD-Growth.com</a>
            </p>
          </div>

        </div>

        <!-- Footer -->
        <div style="background: #F7FAFC; padding: 25px 30px; text-align: center; border-top: 1px solid #E2E8F0;">
          <p style="margin: 0 0 10px 0; color: #4A5568; font-size: 14px;">
            Your security is our priority. Welcome back to LD Growth! 🌟
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