import express from 'express';
import { auth } from '../middleware/auth.js';
import { isJonathonPope } from '../middleware/roles.js';
import {
  getAllStores,
  addStore,
  updateStoreStatus,
  getStoreUsers,
  addStoreUser,
  updateUserEmail,
  resetUserPassword,
  updateStoreSubscriptionStatus,
  getStoreSubscription,
  updateStoreSubscriptionFeatures
} from '../controllers/admin.js';
import { sendEmail } from '../utils/email.js';

const router = express.Router();

// Set up authentication and access control middleware
// Skip auth for reactivation request
router.use((req, res, next) => {
  if (req.path === '/request-reactivation') {
    return next();
  }
  auth(req, res, next);
});

// Skip Jonathon Pope check for reactivation request
router.use((req, res, next) => {
  if (req.path === '/request-reactivation') {
    return next();
  }
  isJonathonPope(req, res, next);
});

// Get all stores
router.get('/stores', getAllStores);

// Add a new store
router.post('/stores', addStore);

// Update store status
router.put('/stores/status', updateStoreStatus);

// Get store users and admins
router.get('/stores/:storeId/users', getStoreUsers);

// Add a user to a store
router.post('/stores/:storeId/users', addStoreUser);

// Update user email
router.put('/stores/:storeId/users/:userId/email', updateUserEmail);

// Reset user password
router.post('/stores/:storeId/users/:userId/reset-password', resetUserPassword);

// Update store subscription status
router.put('/stores/subscription-status', updateStoreSubscriptionStatus);

// Get store subscription details
router.get('/stores/:storeId/subscription', getStoreSubscription);

// Update store subscription features
router.put('/stores/:storeId/subscription/features', updateStoreSubscriptionFeatures);

// Request subscription reactivation - no auth required
router.post('/request-reactivation', async (req, res) => {
  try {
    const { storeId, storeName, storeNumber, userName, userEmail } = req.body;

    // Log the request for debugging
    console.log('Reactivation request received:', {
      storeId,
      storeName,
      storeNumber,
      userName,
      userEmail
    });

    // We'll try to send the email even with minimal information

    // Send email to Jonathon
    const jonathonEmail = "jonp4208@gmail.com";

    // Prepare email content with whatever information we have
    const emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #E4002B;">Subscription Reactivation Request</h1>

        ${storeName || storeNumber ? `
          <p><strong>Store:</strong> ${storeName || 'Unknown'} ${storeNumber ? `(${storeNumber})` : ''}</p>
        ` : ''}

        ${storeId ? `<p><strong>Store ID:</strong> ${storeId}</p>` : ''}

        ${userName || userEmail ? `
          <p><strong>Requested By:</strong> ${userName || 'Unknown'} ${userEmail ? `(${userEmail})` : ''}</p>
        ` : ''}

        <p><strong>Request Time:</strong> ${new Date().toLocaleString()}</p>

        <div style="margin-top: 20px; padding: 15px; background-color: #f8f9fa; border-radius: 5px;">
          <p>A user has requested to reactivate their subscription. Please update their subscription status in the admin panel.</p>

          ${!storeId ? `
            <p style="color: #E4002B; font-weight: bold;">Note: This request is missing the Store ID. You may need to contact the user for more information.</p>
          ` : ''}
        </div>
      </div>
    `;

    // Create a subject line with available information
    let subject = 'Subscription Reactivation Request';
    if (storeName || storeNumber) {
      subject += ` - ${storeName || 'Unknown'}`;
      if (storeNumber) {
        subject += ` (${storeNumber})`;
      }
    }

    await sendEmail({
      to: jonathonEmail,
      subject,
      html: emailContent
    });

    res.status(200).json({ message: 'Reactivation request sent successfully' });
  } catch (error) {
    console.error('Error requesting reactivation:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
