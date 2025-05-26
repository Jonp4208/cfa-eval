import mongoose from 'mongoose';
import { sendEmail, verifyEmailConfig } from '../src/utils/email.js';
import emailTemplates from '../src/utils/emailTemplates.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function sendTestEmail() {
  try {
    console.log('🧪 Sending test playbook announcement email...');

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Force email configuration verification
    console.log('🔧 Verifying email configuration...');
    const emailConfigValid = await verifyEmailConfig();
    if (!emailConfigValid) {
      console.log('❌ Email configuration failed. Check your EMAIL_USER and EMAIL_PASSWORD environment variables.');
      return;
    }
    console.log('✅ Email configuration verified successfully');

    // Create a test user object (you)
    const testUser = {
      name: 'Jonathon Pope',
      email: 'jonp4208@gmail.com',
      position: 'Director'
    };

    console.log(`📧 Sending test email to: ${testUser.name} (${testUser.email})`);

    // Generate the email template
    const emailTemplate = emailTemplates.playbookAnnouncement(testUser);

    // Send the email
    await sendEmail({
      to: testUser.email,
      subject: emailTemplate.subject,
      html: emailTemplate.html
    });

    console.log('✅ Test email sent successfully!');
    console.log('📬 Check your inbox for the playbook announcement email.');
    console.log('');
    console.log('📋 Email Details:');
    console.log(`   To: ${testUser.email}`);
    console.log(`   Subject: ${emailTemplate.subject}`);
    console.log(`   Content: Professional HTML email with playbook announcement`);

  } catch (error) {
    console.error('💥 Error sending test email:', error.message);
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

// Run the script
sendTestEmail();
