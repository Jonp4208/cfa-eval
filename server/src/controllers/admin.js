import { Store, User, StoreSubscription } from '../models/index.js';
import bcrypt from 'bcrypt';
import { setupNewStoreDefaults } from '../utils/setupNewStore.js';
import { sendEmail } from '../utils/email.js';
import emailTemplates from '../utils/emailTemplates.js';

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
      adminEmail,
      adminName
    } = req.body;

    // Generate standardized store email based on store number
    const storeEmail = `${storeNumber}@chick-fil-a.com`;

    // Validate required fields
    if (!storeNumber || !name || !storeAddress) {
      return res.status(400).json({
        message: 'Store number, name, and address are required'
      });
    }

    if (!adminEmail || !adminName) {
      return res.status(400).json({
        message: 'Admin email and name are required'
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

    // Generate a secure random password for the admin
    const generatedPassword = User.generateRandomPassword();

    // Create admin user
    const adminUser = new User({
      email: adminEmail,
      name: adminName,
      password: generatedPassword, // Will be hashed by the User model
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
      storeEmail: storeEmail, // Always set the generated email
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

    // Set up default grading scale and evaluation templates
    try {
      const setupResults = await setupNewStoreDefaults(store._id, adminUser._id);
      console.log(`✅ Created ${setupResults.templates.length} evaluation templates for ${store.name}`);
    } catch (setupError) {
      console.error('❌ Error setting up store defaults:', setupError);
      // Don't fail the store creation if template setup fails
    }

    // Send welcome email to admin with login credentials
    try {
      const adminWelcomeEmail = emailTemplates.welcomeStoreAdmin(adminUser, generatedPassword, store);
      await sendEmail(adminWelcomeEmail);
      console.log(`✅ Welcome email sent to admin: ${adminUser.email}`);
    } catch (emailError) {
      console.error('❌ Failed to send admin welcome email:', emailError);
      // Don't fail the store creation if email fails
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
 * Update store details
 */
export const updateStore = async (req, res) => {
  try {
    const { storeId } = req.params;
    const {
      storeNumber,
      name,
      storeAddress,
      storePhone,
      storeEmail,
      createdAt
    } = req.body;

    // Validate required fields
    if (!storeId) {
      return res.status(400).json({
        message: 'Store ID is required'
      });
    }

    // Check if store exists
    const store = await Store.findById(storeId);
    if (!store) {
      return res.status(404).json({ message: 'Store not found' });
    }

    // If store number is being changed, check for conflicts
    if (storeNumber && storeNumber !== store.storeNumber) {
      const existingStore = await Store.findOne({
        storeNumber,
        _id: { $ne: storeId }
      });
      if (existingStore) {
        return res.status(400).json({
          message: `Store with number ${storeNumber} already exists`
        });
      }
    }

    // Prepare update object
    const updateData = {};
    if (storeNumber !== undefined) updateData.storeNumber = storeNumber;
    if (name !== undefined) updateData.name = name;
    if (storeAddress !== undefined) updateData.storeAddress = storeAddress;
    if (storePhone !== undefined) updateData.storePhone = storePhone;
    if (storeEmail !== undefined) updateData.storeEmail = storeEmail;
    if (createdAt !== undefined) updateData.createdAt = new Date(createdAt);

    // Update the store
    const updatedStore = await Store.findByIdAndUpdate(
      storeId,
      updateData,
      { new: true, runValidators: true }
    );

    res.json({
      message: 'Store updated successfully',
      store: {
        _id: updatedStore._id,
        storeNumber: updatedStore.storeNumber,
        name: updatedStore.name,
        storeAddress: updatedStore.storeAddress,
        storePhone: updatedStore.storePhone,
        storeEmail: updatedStore.storeEmail,
        createdAt: updatedStore.createdAt,
        status: updatedStore.status
      }
    });
  } catch (error) {
    console.error('Error updating store:', error);
    res.status(500).json({
      message: 'Error updating store',
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
    const passwordResetEmail = emailTemplates.passwordReset(user, newPassword);
    await sendEmail(passwordResetEmail);

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
