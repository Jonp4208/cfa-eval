import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/index.js';
import crypto from 'crypto';
import { sendEmail } from '../utils/email.js';

// Register new user
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    console.log('Registration attempt for:', email);

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
    console.log('User created:', user);

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
    console.log('Login attempt for:', email);

    if (!email || !password) {
      return res.status(400).json({ message: 'Failed to log in: Email and password are required' });
    }

    // Convert email to lowercase before searching
    const user = await User.findOne({ email: email.toLowerCase() }).populate('store');
    if (!user) {
      console.log('User not found:', email);
      return res.status(401).json({ message: 'Failed to log in: Email not found' });
    }

    // Check if user is active
    if (user.status === 'inactive') {
      console.log('Inactive user attempted login:', email);
      return res.status(403).json({ message: 'Failed to log in: Account is inactive' });
    }

    console.log('Comparing passwords...');
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log('Password mismatch for:', email);
      return res.status(401).json({ message: 'Failed to log in: Incorrect password' });
    }

    // Check if user has required fields
    if (!user.store) {
      console.log('User has no store assigned:', email);
      return res.status(403).json({ message: 'Failed to log in: Account not configured properly' });
    }

    console.log('Login successful for:', email);

    // Generate access token (short-lived)
    const token = jwt.sign(
      { userId: user.id, store: user.store },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
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
    console.error('Login error:', err);
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
      }
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
      const emailContent = `
        <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #E4002B; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
            <h1 style="color: white; margin: 0;">Password Reset</h1>
          </div>

          <div style="background-color: #f8f8f8; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
            <p>Hello ${user.name},</p>

            <p>You recently requested to reset your password for your LD Growth account. Here are your new login credentials:</p>

            <div style="background-color: #fff; padding: 15px; border-radius: 4px; margin: 20px 0;">
              <p style="margin: 5px 0;"><strong>Access the site here:</strong> <a href="https://www.ld-growth.com" style="color: #E4002B;">www.ld-growth.com</a></p>
              <p style="margin: 5px 0;"><strong>Email:</strong> ${user.email}</p>
              <p style="margin: 5px 0;"><strong>Temporary Password:</strong> ${newPassword}</p>
            </div>

            <p style="color: #E4002B; font-weight: bold;">Important Security Notice:</p>
            <p>For your security, please change your password immediately after logging in.</p>

            <p style="color: #666;">If you didn't request a password reset, please contact your administrator immediately.</p>
          </div>

          <div style="text-align: center; padding: 20px; color: #666;">
            <p>Thank you,<br>LD Growth Team</p>
          </div>
        </div>
      `;

      try {
        console.log('Attempting to send email to:', email);
        await sendEmail({
          to: email,
          subject: 'Your Temporary Password - LD Growth',
          html: emailContent
        });
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