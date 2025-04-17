import express from 'express';
import { auth } from '../middleware/auth.js';
import { isDirector, isStoreAdmin } from '../middleware/roles.js';
import { StoreSubscription } from '../models/index.js';

const router = express.Router();

// Get subscription status for the current store
router.get('/status', auth, async (req, res) => {
  try {
    const storeId = req.user.store;
    
    let subscription = await StoreSubscription.findOne({ store: storeId });
    
    // If no subscription exists, create a default one
    if (!subscription) {
      subscription = await StoreSubscription.create({
        store: storeId,
        subscriptionStatus: 'none',
        features: {
          leadershipPlans: false
        }
      });
    }
    
    res.json(subscription);
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
        subscriptionStatus,
        features
      });
    } else {
      subscription.subscriptionStatus = subscriptionStatus || subscription.subscriptionStatus;
      
      if (features) {
        subscription.features = {
          ...subscription.features,
          ...features
        };
      }
    }
    
    await subscription.save();
    
    res.json(subscription);
  } catch (error) {
    console.error('Error updating subscription:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add payment record
router.post('/payment', auth, isDirector, async (req, res) => {
  try {
    const { amount, paymentMethod, transactionId, notes } = req.body;
    const storeId = req.user.store;
    
    if (!amount) {
      return res.status(400).json({ message: 'Payment amount is required' });
    }
    
    let subscription = await StoreSubscription.findOne({ store: storeId });
    
    if (!subscription) {
      subscription = new StoreSubscription({
        store: storeId,
        subscriptionStatus: 'active',
        features: {
          leadershipPlans: true
        }
      });
    } else {
      subscription.subscriptionStatus = 'active';
      subscription.features.leadershipPlans = true;
    }
    
    // Set subscription period (1 year from now)
    const now = new Date();
    const oneYearFromNow = new Date(now);
    oneYearFromNow.setFullYear(now.getFullYear() + 1);
    
    subscription.currentPeriod = {
      startDate: now,
      endDate: oneYearFromNow
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

export default router;
