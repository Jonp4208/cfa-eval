import express from 'express';
import { sendEmail } from '../utils/email.js';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

// Capture lead information and send email
router.post('/capture', async (req, res) => {
  try {
    const leadData = req.body;

    console.log('Received lead data:', leadData);

    // Handle both old interests format and new selectedFeatures format
    let selectedFeatures = [];

    if (leadData.selectedFeaturesList && Array.isArray(leadData.selectedFeaturesList)) {
      // New format - use the pre-formatted list
      selectedFeatures = leadData.selectedFeaturesList;
    } else if (leadData.selectedFeatures) {
      // New format - extract from selectedFeatures object
      selectedFeatures = Object.entries(leadData.selectedFeatures || {})
        .filter(([_, selected]) => selected)
        .map(([featureKey]) => {
          // Convert camelCase to Title Case with spaces
          return featureKey
            .replace(/([A-Z])/g, ' $1')
            .replace(/^./, str => str.toUpperCase());
        });
    } else if (leadData.interests) {
      // Legacy format - convert interests to features
      selectedFeatures = Object.entries(leadData.interests || {})
        .filter(([_, selected]) => selected)
        .map(([interest]) => {
          // Convert camelCase to Title Case with spaces
          return interest
            .replace(/([A-Z])/g, ' $1')
            .replace(/^./, str => str.toUpperCase());
        });
    }

    // Create HTML email content
    const emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #E4002B; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
          <h1 style="color: white; margin: 0;">New Trial Request</h1>
        </div>

        <div style="background-color: #f8f8f8; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
          <h2 style="color: #333; margin-top: 0;">Lead Information</h2>
          
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #ddd; width: 30%;"><strong>Name:</strong></td>
              <td style="padding: 10px; border-bottom: 1px solid #ddd;">${leadData.name || 'Not provided'}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #ddd;"><strong>Email:</strong></td>
              <td style="padding: 10px; border-bottom: 1px solid #ddd;">${leadData.email || 'Not provided'}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #ddd;"><strong>Phone:</strong></td>
              <td style="padding: 10px; border-bottom: 1px solid #ddd;">${leadData.phone || 'Not provided'}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #ddd;"><strong>Position:</strong></td>
              <td style="padding: 10px; border-bottom: 1px solid #ddd;">${leadData.position || 'Not provided'}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #ddd;"><strong>Store Number:</strong></td>
              <td style="padding: 10px; border-bottom: 1px solid #ddd;">${leadData.storeNumber || 'Not provided'}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #ddd;"><strong>Store Location:</strong></td>
              <td style="padding: 10px; border-bottom: 1px solid #ddd;">${leadData.storeLocation || 'Not provided'}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #ddd;"><strong>Employee Count:</strong></td>
              <td style="padding: 10px; border-bottom: 1px solid #ddd;">${leadData.employeeCount || 'Not provided'}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #ddd;"><strong>Selected Features:</strong></td>
              <td style="padding: 10px; border-bottom: 1px solid #ddd;">
                ${selectedFeatures.length > 0
                  ? selectedFeatures.map(feature => `<div>• ${feature}</div>`).join('')
                  : 'None selected'}
              </td>
            </tr>
            ${leadData.setupPreference ? `
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #ddd;"><strong>Setup Preference:</strong></td>
              <td style="padding: 10px; border-bottom: 1px solid #ddd;">
                <strong>${leadData.setupPreferenceLabel}</strong>
                ${leadData.setupPreference === 'guided'
                  ? '<br><span style="color: #2196f3;">📞 Wants personalized setup call!</span>'
                  : '<br><span style="color: #666;">Prefers self-guided setup</span>'
                }
              </td>
            </tr>
            ` : ''}
            ${leadData.calculatedCost !== undefined ? `
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #ddd;"><strong>Monthly Cost:</strong></td>
              <td style="padding: 10px; border-bottom: 1px solid #ddd;">
                <strong>$${leadData.calculatedCost}/month</strong>
                ${leadData.rawCost !== leadData.calculatedCost ? `
                  <br><small>Raw cost: $${leadData.rawCost} (saved $${leadData.savingsFromMaxPrice} from $200 cap)</small>
                ` : ''}
                ${leadData.isAtMaxPrice ? '<br><span style="color: #4caf50;">🎉 Reached maximum price!</span>' : ''}
              </td>
            </tr>
            ` : ''}
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #ddd;"><strong>Trial Type:</strong></td>
              <td style="padding: 10px; border-bottom: 1px solid #ddd;">${leadData.trialType || '14-day free trial'}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #ddd;"><strong>Additional Information:</strong></td>
              <td style="padding: 10px; border-bottom: 1px solid #ddd;">${leadData.message || 'Not provided'}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #ddd;"><strong>Submitted On:</strong></td>
              <td style="padding: 10px; border-bottom: 1px solid #ddd;">${leadData.submissionDate ? new Date(leadData.submissionDate).toLocaleString() : new Date().toLocaleString()}</td>
            </tr>
          </table>
        </div>

        <div style="text-align: center; padding: 20px; color: #666;">
          <p>This is an automated message from the LD Growth platform.</p>
        </div>
      </div>
    `;

    // Send email to the admin (your email)
    await sendEmail({
      to: process.env.ADMIN_EMAIL || process.env.EMAIL_USER,
      subject: `New Trial Request from ${leadData.name} - ${leadData.storeNumber}`,
      html: emailContent
    });

    // Send confirmation email to the lead
    const confirmationEmail = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #E4002B; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
          <h1 style="color: white; margin: 0;">Thank You for Your Interest!</h1>
        </div>

        <div style="background-color: #f8f8f8; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
          <p>Hello ${leadData.name},</p>
          
          <p>Thank you for your interest in LD Growth! We've received your request for a free trial.</p>
          
          <p>Our team will review your information and contact you shortly to set up your 14-day free trial access.</p>
          
          <p>If you have any immediate questions, please feel free to reply to this email.</p>
          
          <div style="margin: 30px 0; text-align: center;">
            <a href="https://www.ld-growth.com" style="background-color: #E4002B; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Visit Our Website</a>
          </div>
        </div>

        <div style="text-align: center; padding: 20px; color: #666;">
          <p>Best regards,<br>The LD Growth Team</p>
        </div>
      </div>
    `;

    await sendEmail({
      to: leadData.email,
      subject: 'Thank You for Your Interest in LD Growth',
      html: confirmationEmail
    });

    res.status(200).json({ success: true, message: 'Lead information received successfully' });
  } catch (error) {
    console.error('Error capturing lead:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to process your request. Please try again later.' 
    });
  }
});

export default router;
