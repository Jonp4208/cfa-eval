import User from '../models/User.js';
import jwt from 'jsonwebtoken';

/**
 * Switch the current user's store
 * Only available for Jonathon Pope's account
 */
export const switchUserStore = async (req, res) => {
  try {
    const { storeId } = req.body;
    
    // Only allow Jonathon Pope to switch stores
    if (req.user.email !== 'jonp4208@gmail.com') {
      return res.status(403).json({ 
        message: 'Only authorized users can switch stores' 
      });
    }

    if (!storeId) {
      return res.status(400).json({ 
        message: 'Store ID is required' 
      });
    }

    // Update user's store
    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { store: storeId },
      { new: true }
    ).populate('store');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate a new token with the updated store
    const token = jwt.sign(
      { userId: user._id, store: user.store._id },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Generate a new refresh token
    const refreshToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Store switched successfully',
      token,
      refreshToken,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        position: user.position,
        role: user.role,
        store: user.store,
        status: user.status,
        departments: user.departments
      }
    });
  } catch (error) {
    console.error('Switch store error:', error);
    res.status(500).json({ 
      message: 'Error switching store',
      error: error.message 
    });
  }
};
