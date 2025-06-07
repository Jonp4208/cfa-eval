import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/index.js';
import crypto from 'crypto';
import { sendEmail } from '../utils/email.js';
import emailTemplates from '../utils/emailTemplates.js';
import logger from '../utils/logger.js';

// Register new user
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Convert email to lowercase before searching and creating user
    const user = await User.findOne({ email: email.toLowerCase() });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = new User({
      name,
      email: email.toLowerCase(),
      password: hashedPassword
    });

    await user.save();

    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({ token });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Login user
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Failed to log in: Email and password are required' });
    }

    // Convert email to lowercase before searching
    const user = await User.findOne({ email: email.toLowerCase() }).populate('store');
    if (!user) {
      return res.status(401).json({ message: 'Failed to log in: Email not found' });
    }

    // Check if user is active
    if (user.status === 'inactive') {
      return res.status(403).json({ message: 'Failed to log in: Account is inactive' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Failed to log in: Incorrect password' });
    }

    // Check if user has required fields
    if (!user.store) {
      return res.status(403).json({ message: 'Failed to log in: Account not configured properly' });
    }

    // Generate access token (short-lived)
    const token = jwt.sign(
      { userId: user.id, store: user.store },
      process.env.JWT_SECRET,
      { expiresIn: '8h' } // Extended to 8 hours to reduce timeouts
    );

    // Generate refresh token (long-lived)
    const refreshToken = jwt.sign(
      { userId: user.id },
      process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
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
  } catch (err) {
    logger.error('Login error:', err);
    res.status(500).json({ message: 'Failed to log in: Server error' });
  }
};

// Get user profile
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId)
      .populate('store')
      .select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        position: user.position,
        role: user.role,
        store: user.store,
        departments: user.departments
      },
      store: user.store
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Error getting profile' });
  }
};

// Update user profile
export const updateProfile = async (req, res) => {
  try {
    const updates = {};
    const allowedUpdates = ['name', 'email', 'password'];

    Object.keys(req.body).forEach(update => {
      if (allowedUpdates.includes(update)) {
        updates[update] = req.body[update];
      }
    });

    // If updating password, hash it
    if (updates.password) {
      updates.password = await bcrypt.hash(updates.password, 10);
    }

    const user = await User.findByIdAndUpdate(
      req.user.userId,
      updates,
      { new: true }
    ).populate('store');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        store: user.store
      }
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Error updating profile' });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    console.log('Received forgot password request:', req.body);
    const { email } = req.body;

    if (!email) {
      console.log('No email provided');
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    // Find user by email
    const user = await User.findOne({ email });
    console.log('User found:', user ? 'Yes' : 'No');

    if (user) {
      // Generate a new temporary password
      const newPassword = User.generateRandomPassword();
      console.log('Generated temporary password');

      // Update user's password
      user.password = newPassword;
      user.resetPasswordToken = undefined;
      user.resetPasswordExpiry = undefined;
      await user.save();
      console.log('Temporary password saved for user');

      // Send email with temporary password
      try {
        console.log('Attempting to send email to:', email);
        const passwordResetEmail = emailTemplates.passwordReset(user, newPassword);
        await sendEmail(passwordResetEmail);
        console.log('Temporary password email sent successfully');
      } catch (emailError) {
        console.error('Error sending temporary password email:', emailError);
        return res.status(500).json({
          success: false,
          message: 'Error sending temporary password email. Please try again.'
        });
      }
    }

    // Always return success to prevent email enumeration
    console.log('Sending success response');
    res.json({
      success: true,
      message: 'If an account exists with this email, you will receive a temporary password.'
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing password reset request'
    });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    // Find user with valid reset token
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpiry: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    // Update password and clear reset token
    user.password = newPassword; // The User model's pre-save middleware will hash this
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiry = undefined;
    await user.save();

    res.json({ message: 'Password reset successful' });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Error resetting password' });
  }
};

// Temporary function to delete user by email
export const deleteUserByEmail = async (req, res) => {
  try {
    const { email } = req.params;
    console.log('Attempting to delete user with email:', email);

    const result = await User.deleteOne({ email });
    console.log('Delete result:', result);

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User deleted successfully', result });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Error deleting user', error: error.message });
  }
};