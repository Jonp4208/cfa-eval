import express from 'express';
import { auth } from '../middleware/auth.js';
import { isDirector, isStoreAdmin } from '../middleware/roles.js';
import { StoreSubscription, Store, User } from '../models/index.js';
import { sendEmail } from '../utils/email.js';

const router = express.Router();

// Get subscription status for the current store
router.get('/status', auth, async (req, res) => {
  try {
    const storeId = req.user.store;

    let subscription = await StoreSubscription.findOne({ store: storeId });

    // If no subscription exists, create a default one with all features enabled
    if (!subscription) {
      subscription = await StoreSubscription.create({
        store: storeId,
        subscriptionStatus: 'active', // Default to active
        features: {
          fohTasks: true, // All features enabled by default
          setups: true,
          kitchen: true,
          documentation: true,
          training: true,
          evaluations: true,
          leadership: true,
          leadershipPlans: true
        },
        pricing: {
          sectionPrice: 50,
          maxPrice: 200
        }
      });
    }

    // Calculate the current subscription cost
    const enabledSections = Object.entries(subscription.features)
      .filter(([key, value]) => value === true && key !== 'leadershipPlans')
      .length;

    const currentCost = Math.min(
      enabledSections * (subscription.pricing?.sectionPrice || 50),
      subscription.pricing?.maxPrice || 200
    );

    // Calculate pending cost if there are pending changes
    let pendingCost = null;
    if (subscription.pendingChanges && subscription.pendingChanges.hasChanges) {
      const pendingEnabledSections = Object.entries(subscription.pendingChanges.features)
        .filter(([key, value]) => value === true && key !== 'leadershipPlans')
        .length;

      pendingCost = Math.min(
        pendingEnabledSections * (subscription.pricing?.sectionPrice || 50),
        subscription.pricing?.maxPrice || 200
      );
    }

    // Add calculated cost to the response
    const response = subscription.toObject();
    response.calculatedCost = currentCost;

    // Add pending cost if applicable
    if (pendingCost !== null) {
      response.pendingCost = pendingCost;
    }

    res.json(response);
  } catch (error) {
    console.error('Error fetching subscription status:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update subscription status (admin only)
router.put('/status', auth, isStoreAdmin, async (req, res) => {
  try {
    const { subscriptionStatus, features } = req.body;
    const storeId = req.user.store;

    let subscription = await StoreSubscription.findOne({ store: storeId });

    if (!subscription) {
      subscription = new StoreSubscription({
        store: storeId,
        subscriptionStatus: subscriptionStatus || 'active',
        features: features || {
          fohTasks: true, // All features enabled by default
          setups: true,
          kitchen: true,
          documentation: true,
          training: true,
          evaluations: true,
          leadership: true,
          leadershipPlans: true
        }
      });
    } else {
      subscription.subscriptionStatus = subscriptionStatus || subscription.subscriptionStatus;

      if (features) {
        subscription.features = {
          ...subscription.features,
          ...features
        };

        // For backward compatibility, if leadership is enabled, also enable leadershipPlans
        if (features.leadership === true) {
          subscription.features.leadershipPlans = true;
        }
      }
    }

    await subscription.save();

    // Calculate the current subscription cost
    const enabledSections = Object.entries(subscription.features)
      .filter(([key, value]) => value === true && key !== 'leadershipPlans')
      .length;

    const currentCost = Math.min(
      enabledSections * (subscription.pricing?.sectionPrice || 50),
      subscription.pricing?.maxPrice || 200
    );

    // Add calculated cost to the response
    const response = subscription.toObject();
    response.calculatedCost = currentCost;

    res.json(response);
  } catch (error) {
    console.error('Error updating subscription:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Toggle subscription features
router.put('/features', auth, isStoreAdmin, async (req, res) => {
  try {
    const { features } = req.body;
    const storeId = req.user.store;

    if (!features) {
      return res.status(400).json({ message: 'Features are required' });
    }

    let subscription = await StoreSubscription.findOne({ store: storeId });

    if (!subscription) {
      subscription = new StoreSubscription({
        store: storeId,
        subscriptionStatus: 'active', // Default to active
        features: features || {
          fohTasks: true, // All features enabled by default
          setups: true,
          kitchen: true,
          documentation: true,
          training: true,
          evaluations: true,
          leadership: true,
          leadershipPlans: true
        }
      });
    } else {
      // Ensure we have all features with proper defaults
      const completeFeatures = {
        fohTasks: subscription.features.fohTasks ?? true,
        setups: subscription.features.setups ?? true,
        kitchen: subscription.features.kitchen ?? true,
        documentation: subscription.features.documentation ?? true,
        training: subscription.features.training ?? true,
        evaluations: subscription.features.evaluations ?? true,
        leadership: subscription.features.leadership ?? true,
        leadershipPlans: subscription.features.leadershipPlans ?? true,
        ...features  // Apply the changes
      };

      subscription.features = completeFeatures;

      // For backward compatibility, if leadership is enabled, also enable leadershipPlans
      if (features.leadership === true) {
        subscription.features.leadershipPlans = true;
      }
    }

    await subscription.save();

    // Calculate the current subscription cost
    const enabledSections = Object.entries(subscription.features)
      .filter(([key, value]) => value === true && key !== 'leadershipPlans')
      .length;

    const currentCost = Math.min(
      enabledSections * (subscription.pricing?.sectionPrice || 50),
      subscription.pricing?.maxPrice || 200
    );

    // Add calculated cost to the response
    const response = subscription.toObject();
    response.calculatedCost = currentCost;

    res.json(response);
  } catch (error) {
    console.error('Error updating subscription features:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Start a free trial
router.post('/start-trial', auth, isStoreAdmin, async (req, res) => {
  try {
    const storeId = req.user.store;

    let subscription = await StoreSubscription.findOne({ store: storeId });

    if (!subscription) {
      subscription = new StoreSubscription({
        store: storeId,
        subscriptionStatus: 'trial'
      });
    } else {
      subscription.subscriptionStatus = 'trial';
    }

    // Set trial period (14 days)
    const now = new Date();
    const trialEndDate = new Date(now);
    trialEndDate.setDate(now.getDate() + 14);

    subscription.trialInfo = {
      isInTrial: true,
      trialStartDate: now,
      trialEndDate: trialEndDate
    };

    // Enable all features during trial
    subscription.features = {
      fohTasks: true,
      setups: true,
      kitchen: true,
      documentation: true,
      training: true,
      evaluations: true,
      leadership: true,
      leadershipPlans: true
    };

    await subscription.save();

    res.status(200).json(subscription);
  } catch (error) {
    console.error('Error starting trial:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add payment record
router.post('/payment', auth, isDirector, async (req, res) => {
  try {
    const { amount, paymentMethod, transactionId, notes, enabledFeatures } = req.body;
    const storeId = req.user.store;

    if (!amount) {
      return res.status(400).json({ message: 'Payment amount is required' });
    }

    let subscription = await StoreSubscription.findOne({ store: storeId });

    if (!subscription) {
      subscription = new StoreSubscription({
        store: storeId,
        subscriptionStatus: 'active',
        features: enabledFeatures || {
          fohTasks: true, // All features enabled by default
          setups: true,
          kitchen: true,
          documentation: true,
          training: true,
          evaluations: true,
          leadership: true,
          leadershipPlans: true
        }
      });
    } else {
      subscription.subscriptionStatus = 'active';

      // Update features if provided
      if (enabledFeatures) {
        subscription.features = {
          ...subscription.features,
          ...enabledFeatures
        };
      }

      // End trial if in trial
      if (subscription.trialInfo?.isInTrial) {
        subscription.trialInfo.isInTrial = false;
      }
    }

    // Set subscription period (1 month from now)
    const now = new Date();
    const oneMonthFromNow = new Date(now);
    oneMonthFromNow.setMonth(now.getMonth() + 1);

    subscription.currentPeriod = {
      startDate: now,
      endDate: oneMonthFromNow
    };

    // Add payment record
    subscription.paymentHistory.push({
      amount,
      date: now,
      paymentMethod,
      transactionId,
      notes
    });

    await subscription.save();

    res.status(201).json(subscription);
  } catch (error) {
    console.error('Error recording payment:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Submit subscription changes to take effect at next billing date
router.post('/submit-changes', auth, isStoreAdmin, async (req, res) => {
  try {
    const { features } = req.body;
    const storeId = req.user.store;

    if (!features) {
      return res.status(400).json({ message: 'Features are required' });
    }

    let subscription = await StoreSubscription.findOne({ store: storeId });

    if (!subscription) {
      return res.status(404).json({ message: 'Subscription not found' });
    }

    // Calculate the next billing date (end of current period)
    let effectiveDate;
    if (subscription.currentPeriod && subscription.currentPeriod.endDate) {
      effectiveDate = new Date(subscription.currentPeriod.endDate);
    } else {
      // If no current period, set effective date to 1 month from now
      effectiveDate = new Date();
      effectiveDate.setMonth(effectiveDate.getMonth() + 1);
    }

    // Make sure we're sending the complete features object, not just the changed features
    const completeFeatures = {
      fohTasks: features.fohTasks ?? true,
      setups: features.setups ?? true,
      kitchen: features.kitchen ?? true,
      documentation: features.documentation ?? true,
      training: features.training ?? true,
      evaluations: features.evaluations ?? true,
      leadership: features.leadership ?? true,
      leadershipPlans: features.leadershipPlans ?? true
    };

    // Save the pending changes
    subscription.pendingChanges = {
      hasChanges: true,
      features: completeFeatures,
      effectiveDate: effectiveDate,
      submittedAt: new Date()
    };

    await subscription.save();

    // Calculate the future cost based on pending changes
    const pendingEnabledSections = Object.entries(features)
      .filter(([key, value]) => value === true && key !== 'leadershipPlans')
      .length;

    const pendingCost = Math.min(
      pendingEnabledSections * (subscription.pricing?.sectionPrice || 50),
      subscription.pricing?.maxPrice || 200
    );

    // Get store information for the email
    const store = await Store.findById(storeId);
    const storeName = store ? store.name : 'Unknown Store';
    const storeNumber = store ? store.storeNumber : 'Unknown';

    // Send email notification directly to Jonathon
    const jonathonEmail = "jonp4208@gmail.com";

    if (jonathonEmail) {
      const emailContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #E4002B;">Subscription Change Request</h1>
          <p><strong>Store:</strong> ${storeName} (${storeNumber})</p>
          <p><strong>Requested By:</strong> ${req.user.name} (${req.user.email})</p>
          <p><strong>Effective Date:</strong> ${effectiveDate.toLocaleDateString()}</p>
          <p><strong>New Monthly Cost:</strong> $${pendingCost}</p>

          <h2>Subscription Changes:</h2>
          <ul>
            ${Object.entries(features).map(([key, value]) => {
              const currentValue = subscription.features[key];
              if (currentValue !== value) {
                const featureName = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                return `<li>${featureName}: ${currentValue ? 'Enabled' : 'Disabled'} → ${value ? 'Enabled' : 'Disabled'}</li>`;
              }
              return '';
            }).filter(item => item !== '').join('')}
          </ul>

          <p>Please update the subscription in the billing system for the next billing cycle.</p>
        </div>
      `;

      await sendEmail({
        to: jonathonEmail,
        subject: `Subscription Change Request - ${storeName} (${storeNumber})`,
        html: emailContent
      });
    }

    // Add calculated costs to the response
    const response = subscription.toObject();
    response.calculatedCost = Math.min(
      Object.entries(subscription.features)
        .filter(([key, value]) => value === true && key !== 'leadershipPlans')
        .length * (subscription.pricing?.sectionPrice || 50),
      subscription.pricing?.maxPrice || 200
    );
    response.pendingCost = pendingCost;

    res.status(200).json(response);
  } catch (error) {
    console.error('Error submitting subscription changes:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Request subscription reactivation
router.post('/request-reactivation', auth, async (req, res) => {
  try {
    const { storeId, storeName, storeNumber, userName, userEmail } = req.body;

    // Validate required fields
    if (!storeId) {
      return res.status(400).json({ message: 'Store ID is required' });
    }

    // Get store information if not provided
    let storeInfo = { name: storeName, storeNumber };
    if (!storeName || !storeNumber) {
      const store = await Store.findById(storeId);
      if (store) {
        storeInfo.name = store.name;
        storeInfo.storeNumber = store.storeNumber;
      }
    }

    // Get user information if not provided
    let userInfo = { name: userName, email: userEmail };
    if (!userName || !userEmail) {
      userInfo.name = req.user.name;
      userInfo.email = req.user.email;
    }

    // Get subscription information
    const subscription = await StoreSubscription.findOne({ store: storeId });
    const subscriptionStatus = subscription ? subscription.subscriptionStatus : 'unknown';

    // Send email to Jonathon
    const jonathonEmail = "jonp4208@gmail.com";

    const emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #E4002B;">Subscription Reactivation Request</h1>
        <p><strong>Store:</strong> ${storeInfo.name} (${storeInfo.storeNumber})</p>
        <p><strong>Current Status:</strong> ${subscriptionStatus}</p>
        <p><strong>Requested By:</strong> ${userInfo.name} (${userInfo.email})</p>
        <p><strong>Request Time:</strong> ${new Date().toLocaleString()}</p>

        <div style="margin-top: 20px; padding: 15px; background-color: #f8f9fa; border-radius: 5px;">
          <p>The user has requested to reactivate their subscription. Please update their subscription status in the admin panel.</p>
        </div>
      </div>
    `;

    await sendEmail({
      to: jonathonEmail,
      subject: `Subscription Reactivation Request - ${storeInfo.name} (${storeInfo.storeNumber})`,
      html: emailContent
    });

    res.status(200).json({ message: 'Reactivation request sent successfully' });
  } catch (error) {
    console.error('Error requesting reactivation:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
