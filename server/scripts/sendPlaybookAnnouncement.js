import mongoose from 'mongoose';
import User from '../src/models/User.js';
import { sendEmail, verifyEmailConfig } from '../src/utils/email.js';
import emailTemplates from '../src/utils/emailTemplates.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const LEADERSHIP_POSITIONS = [
  'Director',
  'Leader',
  'Manager',
  'Supervisor',
  'Team Lead',
  'Assistant Manager',
  'Shift Leader',
  'Department Head'
];

async function sendPlaybookAnnouncement() {
  try {
    console.log('🚀 Starting Playbook Announcement Email Campaign...');

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Force email configuration verification
    console.log('🔧 Verifying email configuration...');
    const emailConfigValid = await verifyEmailConfig();
    if (!emailConfigValid) {
      console.log('❌ Email configuration failed. Check your EMAIL_USER and EMAIL_PASSWORD environment variables.');
      console.log('💡 Make sure these environment variables are set:');
      console.log('   - EMAIL_USER: Your email address');
      console.log('   - EMAIL_PASSWORD: Your email password or app-specific password');
      return;
    }
    console.log('✅ Email configuration verified - ready to send real emails!');

    // Find all users with leadership positions
    const leadershipUsers = await User.find({
      position: {
        $in: LEADERSHIP_POSITIONS.map(pos => new RegExp(pos, 'i'))
      },
      email: { $exists: true, $ne: '' }
    }).select('name email position');

    console.log(`📧 Found ${leadershipUsers.length} leadership users to email:`);

    // Log the users we found for verification
    leadershipUsers.forEach(user => {
      console.log(`   - ${user.name} (${user.position}) - ${user.email}`);
    });

    if (leadershipUsers.length === 0) {
      console.log('❌ No leadership users found. Exiting...');
      return;
    }

    // Ask for confirmation before sending
    console.log('\n⚠️  CONFIRMATION REQUIRED:');
    console.log(`About to send playbook announcement emails to ${leadershipUsers.length} users.`);
    console.log('This action cannot be undone.');

    // In a real script, you might want to add a prompt here
    // For now, we'll add a safety check
    const SEND_EMAILS = process.env.SEND_EMAILS === 'true';

    if (!SEND_EMAILS) {
      console.log('❌ SEND_EMAILS environment variable not set to "true".');
      console.log('Set SEND_EMAILS=true to actually send emails.');
      console.log('This is a safety measure to prevent accidental sends.');
      return;
    }

    console.log('✅ Proceeding with email send...');

    let successCount = 0;
    let errorCount = 0;
    const errors = [];

    // Send emails with rate limiting
    for (let i = 0; i < leadershipUsers.length; i++) {
      const user = leadershipUsers[i];

      try {
        console.log(`📤 Sending email ${i + 1}/${leadershipUsers.length} to ${user.name} (${user.email})...`);

        const emailTemplate = emailTemplates.playbookAnnouncement(user);

        await sendEmail({
          to: user.email,
          subject: emailTemplate.subject,
          html: emailTemplate.html
        });

        successCount++;
        console.log(`   ✅ Success`);

        // Rate limiting: wait 1 second between emails to avoid overwhelming the email service
        if (i < leadershipUsers.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }

      } catch (error) {
        errorCount++;
        const errorMsg = `Failed to send to ${user.name} (${user.email}): ${error.message}`;
        errors.push(errorMsg);
        console.log(`   ❌ ${errorMsg}`);
      }
    }

    // Final summary
    console.log('\n📊 EMAIL CAMPAIGN SUMMARY:');
    console.log(`✅ Successfully sent: ${successCount} emails`);
    console.log(`❌ Failed to send: ${errorCount} emails`);

    if (errors.length > 0) {
      console.log('\n❌ ERRORS:');
      errors.forEach(error => console.log(`   - ${error}`));
    }

    if (successCount > 0) {
      console.log('\n🎉 Playbook announcement campaign completed successfully!');
      console.log('📈 Leadership teams have been notified about the new playbook feature.');
    }

  } catch (error) {
    console.error('💥 Fatal error in email campaign:', error);
  } finally {
    // Close MongoDB connection
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

// Handle script termination gracefully
process.on('SIGINT', async () => {
  console.log('\n⚠️  Script interrupted by user');
  await mongoose.disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n⚠️  Script terminated');
  await mongoose.disconnect();
  process.exit(0);
});

// Run the script
if (import.meta.url === `file://${process.argv[1]}`) {
  sendPlaybookAnnouncement();
}

export default sendPlaybookAnnouncement;
