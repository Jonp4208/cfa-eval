import { Store, User, StoreSubscription } from '../models/index.js';
import bcrypt from 'bcrypt';

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
