# Playbook Announcement Email Campaign

This directory contains scripts to send the new playbook feature announcement to all Directors and Leaders in the system.

## 📧 What It Does

The email campaign will:
- Find all users with leadership positions (Director, Leader, Manager, Supervisor, etc.)
- Send a beautifully formatted HTML email announcing the new playbook feature
- Include step-by-step instructions and direct links to the playbook section
- Provide comprehensive error reporting and success metrics

## 🎯 Target Audience

The script targets users with these positions:
- Director
- Leader  
- Manager
- Supervisor
- Team Lead
- Assistant Manager
- Shift Leader
- Department Head

## 🚀 How to Run

### Step 1: Preview Recipients (Safe Mode)
First, run without actually sending emails to see who would receive them:

```bash
cd server
npm run send-playbook-announcement
```

This will show you all the users who would receive emails but won't actually send them.

### Step 2: Send Emails (Live Mode)
When you're ready to actually send the emails:

```bash
cd server
SEND_EMAILS=true npm run send-playbook-announcement
```

## 🛡️ Safety Features

- **Dry Run by Default**: Won't send emails unless `SEND_EMAILS=true` is set
- **Recipient Preview**: Shows exactly who will receive emails before sending
- **Rate Limiting**: 1-second delay between emails to avoid overwhelming email service
- **Error Handling**: Continues sending even if some emails fail
- **Comprehensive Reporting**: Shows success/failure counts and detailed error messages

## 📊 Email Template Features

The email includes:
- **Professional Design**: Branded with LD Growth colors and styling
- **Responsive Layout**: Looks great on desktop and mobile
- **Clear Call-to-Action**: Direct link to the playbooks section
- **Step-by-Step Instructions**: How to get started with playbooks
- **Feature Highlights**: Complete 5-step framework explanation
- **Use Cases**: Perfect for onboarding, training, problem-solving
- **Contact Information**: Jonathon's email for questions

## 📝 Example Output

```
🚀 PLAYBOOK ANNOUNCEMENT EMAIL CAMPAIGN
=====================================

🚀 Starting Playbook Announcement Email Campaign...
✅ Connected to MongoDB
📧 Found 15 leadership users to email:
   - John Smith (Director) - john.smith@example.com
   - Jane Doe (Manager) - jane.doe@example.com
   - Mike Johnson (Team Lead) - mike.johnson@example.com
   ...

📤 Sending email 1/15 to John Smith (john.smith@example.com)...
   ✅ Success
📤 Sending email 2/15 to Jane Doe (jane.doe@example.com)...
   ✅ Success
...

📊 EMAIL CAMPAIGN SUMMARY:
✅ Successfully sent: 15 emails
❌ Failed to send: 0 emails

🎉 Playbook announcement campaign completed successfully!
📈 Leadership teams have been notified about the new playbook feature.
```

## 🔧 Troubleshooting

### No Users Found
If the script reports "No leadership users found":
- Check that users have positions set in their profiles
- Verify the position names match the LEADERSHIP_POSITIONS array
- Ensure users have valid email addresses

### Email Sending Failures
If emails fail to send:
- Check that the email service is properly configured
- Verify SMTP settings in environment variables
- Check for rate limiting from the email provider

### Environment Issues
Make sure these environment variables are set:
- `MONGODB_URI`: Database connection string
- Email service configuration (SMTP settings)

## 📁 Files

- `sendPlaybookAnnouncement.js`: Main email campaign logic
- `runPlaybookAnnouncement.js`: Simple runner script
- `README.md`: This documentation file

## 🎯 Next Steps

After running the campaign:
1. Monitor email delivery rates
2. Track playbook adoption in the analytics
3. Gather feedback from leadership teams
4. Consider follow-up campaigns for new features

## ⚠️ Important Notes

- This is a one-time announcement campaign
- Don't run multiple times unless intentional
- Always test with a small group first if unsure
- Keep the SEND_EMAILS safety check in place
