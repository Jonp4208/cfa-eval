import { Store, User, StoreSubscription } from '../models/index.js';
import bcrypt from 'bcrypt';
import { sendEmail } from '../utils/email.js';

/**
 * Get all stores in the system
 */
export const getAllStores = async (req, res) => {
  try {
    // Get all stores with basic information
    const stores = await Store.find({})
      .select('_id storeNumber name storeAddress storePhone storeEmail createdAt')
      .sort({ createdAt: -1 });

    // Get count of users for each store
    const storesWithUserCount = await Promise.all(
      stores.map(async (store) => {
        const userCount = await User.countDocuments({ store: store._id });

        // Check if store has an active subscription
        const subscription = await StoreSubscription.findOne({ store: store._id });

        return {
          ...store.toObject(),
          userCount,
          subscription: subscription ? {
            status: subscription.subscriptionStatus,
            features: subscription.features
          } : null
        };
      })
    );

    res.json({ stores: storesWithUserCount });
  } catch (error) {
    console.error('Error getting all stores:', error);
    res.status(500).json({
      message: 'Error retrieving stores',
      error: error.message
    });
  }
};

/**
 * Add a new store to the system
 */
export const addStore = async (req, res) => {
  try {
    const {
      storeNumber,
      name,
      storeAddress,
      storePhone,
      storeEmail,
      adminEmail,
      adminName,
      adminPassword
    } = req.body;

    // Validate required fields
    if (!storeNumber || !name || !storeAddress) {
      return res.status(400).json({
        message: 'Store number, name, and address are required'
      });
    }

    if (!adminEmail || !adminName || !adminPassword) {
      return res.status(400).json({
        message: 'Admin email, name, and password are required'
      });
    }

    // Check if store already exists
    const existingStore = await Store.findOne({ storeNumber });
    if (existingStore) {
      return res.status(400).json({
        message: `Store with number ${storeNumber} already exists`
      });
    }

    // Check if admin email is already in use
    const existingUser = await User.findOne({ email: adminEmail });
    if (existingUser) {
      return res.status(400).json({
        message: `User with email ${adminEmail} already exists`
      });
    }

    // Create admin user
    const adminUser = new User({
      email: adminEmail,
      name: adminName,
      password: adminPassword, // Will be hashed by the User model
      position: 'Director',
      departments: ['Everything'],
      shift: 'day',
      isAdmin: true,
      role: 'admin',
      status: 'active'
    });

    // Create store
    const store = new Store({
      storeNumber,
      name,
      storeAddress,
      storePhone: storePhone || undefined,
      storeEmail: storeEmail || undefined,
      admins: []
    });

    // Save store first
    await store.save();

    // Add store reference to admin user and save
    adminUser.store = store._id;
    await adminUser.save();

    // Update store with admin reference
    store.admins = [adminUser._id];
    await store.save();

    // Send welcome email to admin
    try {
      await sendEmail({
        to: adminUser.email,
        subject: 'Welcome to LD Growth - Your Admin Account',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">
            <div style="background-color: #E4002B; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
              <h1 style="color: white; margin: 0;">Welcome to LD Growth!</h1>
            </div>
            <div style="background-color: #f8f8f8; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
              <h2 style="color: #333; margin-top: 0;">Hi ${adminUser.name},</h2>
              <p>Your admin account for <strong>${store.name}</strong> has been created.</p>
              <p><strong>Email:</strong> ${adminUser.email}</p>
              <p>You can now log in and start managing your store and team.</p>
              <div style="margin: 30px 0;">
                <a href="https://www.ld-growth.com" style="display: inline-block; background-color: #E4002B; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 500;">Log In to LD Growth</a>
              </div>
              <p>If you have any questions, reply to this email or contact support.</p>
            </div>
            <p style="color: #666; font-size: 14px;">This is an automated message. Please do not reply to this email.</p>
          </div>
        `
      })
    } catch (emailError) {
      console.error('Failed to send admin welcome email:', emailError)
    }

    res.status(201).json({
      message: 'Store and admin user created successfully',
      store: {
        _id: store._id,
        storeNumber: store.storeNumber,
        name: store.name
      },
      admin: {
        _id: adminUser._id,
        email: adminUser.email,
        name: adminUser.name
      }
    });
  } catch (error) {
    console.error('Error adding store:', error);
    res.status(500).json({
      message: 'Error adding store',
      error: error.message
    });
  }
};

/**
 * Update store status (active/inactive)
 */
export const updateStoreStatus = async (req, res) => {
  try {
    const { storeId, status } = req.body;

    if (!storeId || !status) {
      return res.status(400).json({
        message: 'Store ID and status are required'
      });
    }

    if (!['active', 'inactive'].includes(status)) {
      return res.status(400).json({
        message: 'Status must be either "active" or "inactive"'
      });
    }

    const store = await Store.findById(storeId);
    if (!store) {
      return res.status(404).json({ message: 'Store not found' });
    }

    // Update store status
    store.status = status;
    await store.save();

    // If store is inactive, update all users to inactive
    if (status === 'inactive') {
      await User.updateMany(
        { store: storeId },
        { status: 'inactive' }
      );
    }

    res.json({
      message: `Store status updated to ${status}`,
      store: {
        _id: store._id,
        storeNumber: store.storeNumber,
        name: store.name,
        status: store.status
      }
    });
  } catch (error) {
    console.error('Error updating store status:', error);
    res.status(500).json({
      message: 'Error updating store status',
      error: error.message
    });
  }
};

/**
 * Get store users and admins
 */
export const getStoreUsers = async (req, res) => {
  try {
    const { storeId } = req.params;

    if (!storeId) {
      return res.status(400).json({ message: 'Store ID is required' });
    }

    // Check if store exists
    const store = await Store.findById(storeId);
    if (!store) {
      return res.status(404).json({ message: 'Store not found' });
    }

    // Get all users for the store
    const users = await User.find({ store: storeId })
      .select('_id name email position departments isAdmin role status createdAt')
      .sort({ name: 1 });

    // Separate admins and regular users
    const admins = users.filter(user => user.isAdmin || user.role === 'admin');
    const regularUsers = users.filter(user => !user.isAdmin && user.role !== 'admin');

    res.json({
      store: {
        _id: store._id,
        storeNumber: store.storeNumber,
        name: store.name
      },
      admins,
      users: regularUsers,
      totalUsers: users.length
    });
  } catch (error) {
    console.error('Error getting store users:', error);
    res.status(500).json({
      message: 'Error retrieving store users',
      error: error.message
    });
  }
};

/**
 * Add a user to a store
 */
export const addStoreUser = async (req, res) => {
  try {
    const { storeId } = req.params;
    const {
      name,
      email,
      position,
      departments,
      isAdmin = false,
      generatePassword = true,
      password
    } = req.body;

    // Validate required fields
    if (!storeId || !name || !email || !position || !departments) {
      return res.status(400).json({
        message: 'Store ID, name, email, position, and departments are required'
      });
    }

    // Check if store exists
    const store = await Store.findById(storeId);
    if (!store) {
      return res.status(404).json({ message: 'Store not found' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        message: `User with email ${email} already exists`
      });
    }

    // Determine if user should be admin based on position or isAdmin flag
    const shouldBeAdmin = isAdmin || ['Store Director', 'Kitchen Director', 'Service Director', 'Store Leader', 'Director'].includes(position);

    // Generate or use provided password
    let userPassword;
    if (generatePassword) {
      userPassword = User.generateRandomPassword();
    } else if (password) {
      userPassword = password;
    } else {
      return res.status(400).json({
        message: 'Either generatePassword must be true or a password must be provided'
      });
    }

    // Create new user
    const user = new User({
      name,
      email,
      password: userPassword, // Will be hashed by the User model
      position,
      departments: Array.isArray(departments) ? departments : [departments],
      isAdmin: shouldBeAdmin,
      role: shouldBeAdmin ? 'admin' : 'user',
      store: storeId,
      status: 'active',
      shift: 'day' // Default to day shift
    });

    await user.save();

    // If user is an admin, update store's admins array
    if (shouldBeAdmin) {
      await Store.findByIdAndUpdate(storeId, {
        $addToSet: { admins: user._id }
      });
    }

    res.status(201).json({
      message: `${shouldBeAdmin ? 'Admin' : 'User'} added successfully`,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        position: user.position,
        isAdmin: user.isAdmin
      },
      generatedPassword: generatePassword ? userPassword : undefined
    });
  } catch (error) {
    console.error('Error adding store user:', error);
    res.status(500).json({
      message: 'Error adding user to store',
      error: error.message
    });
  }
};

/**
 * Update user email
 */
export const updateUserEmail = async (req, res) => {
  try {
    const { storeId, userId } = req.params;
    const { email } = req.body;

    // Validate required fields
    if (!storeId || !userId || !email) {
      return res.status(400).json({
        message: 'Store ID, user ID, and email are required'
      });
    }

    // Check if store exists
    const store = await Store.findById(storeId);
    if (!store) {
      return res.status(404).json({ message: 'Store not found' });
    }

    // Check if user exists and belongs to the store
    const user = await User.findOne({ _id: userId, store: storeId });
    if (!user) {
      return res.status(404).json({ message: 'User not found in this store' });
    }

    // Check if email is already in use by another user
    const existingUser = await User.findOne({
      email,
      _id: { $ne: userId } // Exclude the current user
    });

    if (existingUser) {
      return res.status(400).json({
        message: `Email ${email} is already in use by another user`
      });
    }

    // Update user's email
    user.email = email;
    await user.save();

    res.json({
      message: 'User email updated successfully',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Error updating user email:', error);
    res.status(500).json({
      message: 'Error updating user email',
      error: error.message
    });
  }
};

/**
 * Reset user password
 */
export const resetUserPassword = async (req, res) => {
  try {
    const { storeId, userId } = req.params;

    // Validate required fields
    if (!storeId || !userId) {
      return res.status(400).json({
        message: 'Store ID and user ID are required'
      });
    }

    // Check if store exists
    const store = await Store.findById(storeId);
    if (!store) {
      return res.status(404).json({ message: 'Store not found' });
    }

    // Check if user exists and belongs to the store
    const user = await User.findOne({ _id: userId, store: storeId });
    if (!user) {
      return res.status(404).json({ message: 'User not found in this store' });
    }

    // Generate a new password
    const newPassword = User.generateRandomPassword();

    // Update user's password
    user.password = newPassword;
    await user.save();

    // Send email with new password
    await sendEmail({
      to: user.email,
      subject: 'Password Reset - LD Growth',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #E4002B; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
            <h1 style="color: white; margin: 0;">Password Reset</h1>
          </div>

          <div style="background-color: #f8f8f8; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
            <p>Hello ${user.name},</p>

            <p>Your password has been reset by an administrator. Here are your new login credentials:</p>

            <div style="background-color: #fff; padding: 15px; border-radius: 4px; margin: 20px 0;">
              <p style="margin: 5px 0;"><strong>Access the site here:</strong> <a href="https://www.ld-growth.com" style="color: #E4002B;">www.ld-growth.com</a></p>
              <p style="margin: 5px 0;"><strong>Email:</strong> ${user.email}</p>
              <p style="margin: 5px 0;"><strong>New Password:</strong> ${newPassword}</p>
            </div>

            <p>For security reasons, please change your password after logging in.</p>
          </div>

          <div style="text-align: center; color: #666; font-size: 12px; margin-top: 30px;">
            <p>This is an automated message, please do not reply to this email.</p>
          </div>
        </div>
      `
    });

    res.json({
      message: 'User password reset successfully',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Error resetting user password:', error);
    res.status(500).json({
      message: 'Error resetting user password',
      error: error.message
    });
  }
};

/**
 * Update store subscription status (active/expired/trial/none)
 */
export const updateStoreSubscriptionStatus = async (req, res) => {
  try {
    const { storeId, subscriptionStatus } = req.body

    if (!storeId || !subscriptionStatus) {
      return res.status(400).json({
        message: 'Store ID and subscription status are required'
      })
    }

    if (!['active', 'expired', 'trial', 'none'].includes(subscriptionStatus)) {
      return res.status(400).json({
        message: 'Invalid subscription status'
      })
    }

    let subscription = await StoreSubscription.findOne({ store: storeId })
    if (!subscription) {
      // Create a new subscription if not found with all features enabled
      subscription = new StoreSubscription({
        store: storeId,
        subscriptionStatus,
        features: {
          fohTasks: true,
          setups: true,
          kitchen: true,
          documentation: true,
          training: true,
          evaluations: true,
          leadership: true,
          leadershipPlans: true
        }
      })
    } else {
      subscription.subscriptionStatus = subscriptionStatus
    }
    await subscription.save()

    res.json({
      message: `Subscription status updated to ${subscriptionStatus}`,
      subscription: {
        status: subscription.subscriptionStatus,
        features: subscription.features
      }
    })
  } catch (error) {
    console.error('Error updating subscription status:', error)
    res.status(500).json({
      message: 'Error updating subscription status',
      error: error.message
    })
  }
}

/**
 * Get store subscription details
 */
export const getStoreSubscription = async (req, res) => {
  try {
    const { storeId } = req.params;

    if (!storeId) {
      return res.status(400).json({ message: 'Store ID is required' });
    }

    // Check if store exists
    const store = await Store.findById(storeId);
    if (!store) {
      return res.status(404).json({ message: 'Store not found' });
    }

    // Get subscription details
    let subscription = await StoreSubscription.findOne({ store: storeId });
    if (!subscription) {
      // Create a new subscription with all features enabled
      subscription = new StoreSubscription({
        store: storeId,
        subscriptionStatus: 'active',
        features: {
          fohTasks: true,
          setups: true,
          kitchen: true,
          documentation: true,
          training: true,
          evaluations: true,
          leadership: true,
          leadershipPlans: true
        }
      });
      await subscription.save();
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

    // Format response
    const response = {
      store: {
        _id: store._id,
        storeNumber: store.storeNumber,
        name: store.name
      },
      subscription: subscription.toObject(),
      calculatedCost: currentCost
    };

    if (pendingCost !== null) {
      response.pendingCost = pendingCost;
    }

    res.json(response);
  } catch (error) {
    console.error('Error getting store subscription:', error);
    res.status(500).json({
      message: 'Error retrieving store subscription',
      error: error.message
    });
  }
};

/**
 * Update store subscription features
 */
export const updateStoreSubscriptionFeatures = async (req, res) => {
  try {
    const { storeId } = req.params;
    const { features, applyImmediately = false } = req.body;

    if (!storeId || !features) {
      return res.status(400).json({
        message: 'Store ID and features are required'
      });
    }

    // Check if store exists
    const store = await Store.findById(storeId);
    if (!store) {
      return res.status(404).json({ message: 'Store not found' });
    }

    // Find or create subscription
    let subscription = await StoreSubscription.findOne({ store: storeId });
    if (!subscription) {
      // Create a new subscription with all features enabled
      subscription = new StoreSubscription({
        store: storeId,
        subscriptionStatus: 'active',
        features: {
          fohTasks: true,
          setups: true,
          kitchen: true,
          documentation: true,
          training: true,
          evaluations: true,
          leadership: true,
          leadershipPlans: true
        }
      });
      await subscription.save();
    }

    if (applyImmediately) {
      // Apply changes immediately
      subscription.features = {
        ...subscription.features,
        ...features
      };

      // Clear any pending changes
      if (subscription.pendingChanges) {
        subscription.pendingChanges.hasChanges = false;
      }
    } else {
      // Set as pending changes
      const effectiveDate = subscription.currentPeriod?.endDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

      // Make sure we're sending the complete features object, not just the changed features
      const completeFeatures = {
        ...subscription.features,  // Start with current features
        ...features                // Apply the changes
      };

      subscription.pendingChanges = {
        hasChanges: true,
        features: completeFeatures,
        effectiveDate: effectiveDate,
        submittedAt: new Date()
      };
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

    // Format response
    const response = subscription.toObject();
    response.calculatedCost = currentCost;

    if (pendingCost !== null) {
      response.pendingCost = pendingCost;
    }

    res.json(response);
  } catch (error) {
    console.error('Error updating subscription features:', error);
    res.status(500).json({
      message: 'Error updating subscription features',
      error: error.message
    });
  }
};
