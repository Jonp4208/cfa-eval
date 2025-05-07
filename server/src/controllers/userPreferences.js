import UserPreferences from '../models/UserPreferences.js';
import { handleError, ErrorCategory } from '../utils/errorHandler.js';

// Get user preferences
export const getUserPreferences = async (req, res) => {
  try {
    if (!req.user?._id) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    // Find or create user preferences
    let userPreferences = await UserPreferences.findOne({ user: req.user._id });

    if (!userPreferences) {
      // Create default preferences if none exist
      userPreferences = new UserPreferences({
        user: req.user._id,
        uiPreferences: {
          mobileNavigation: {
            items: [
              { key: 'dashboard', show: true },
              { key: 'foh', show: true },
              { key: 'documentation', show: true },
              { key: 'evaluations', show: true },
              { key: 'users', show: true }
            ],
            maxItems: 5
          }
        }
      });
      await userPreferences.save();
    }

    res.json(userPreferences);
  } catch (error) {
    handleError(error, ErrorCategory.USER_PREFERENCES, {
      userId: req.user?._id,
      function: 'getUserPreferences'
    });
    res.status(500).json({ error: error.message });
  }
};

// Update user preferences
export const updateUserPreferences = async (req, res) => {
  try {
    if (!req.user?._id) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    // Find or create user preferences
    let userPreferences = await UserPreferences.findOne({ user: req.user._id });

    if (!userPreferences) {
      userPreferences = new UserPreferences({
        user: req.user._id
      });
    }

    // Update UI preferences
    if (req.body.uiPreferences) {
      // Initialize if not exists
      if (!userPreferences.uiPreferences) {
        userPreferences.uiPreferences = {};
      }

      // Update mobile navigation preferences
      if (req.body.uiPreferences.mobileNavigation) {
        if (!userPreferences.uiPreferences.mobileNavigation) {
          userPreferences.uiPreferences.mobileNavigation = {};
        }

        // Update items array
        if (req.body.uiPreferences.mobileNavigation.items) {
          userPreferences.uiPreferences.mobileNavigation.items =
            req.body.uiPreferences.mobileNavigation.items;

          // Log the update for debugging
          console.log('Updated mobile navigation items for user:',
            req.user._id, userPreferences.uiPreferences.mobileNavigation.items);
        }

        // Update max items
        if (req.body.uiPreferences.mobileNavigation.maxItems !== undefined) {
          userPreferences.uiPreferences.mobileNavigation.maxItems =
            req.body.uiPreferences.mobileNavigation.maxItems;
        }
      }

      // Update theme preference
      if (req.body.uiPreferences.theme) {
        userPreferences.uiPreferences.theme = req.body.uiPreferences.theme;
      }
    }

    // Update notification preferences
    if (req.body.notificationPreferences) {
      userPreferences.notificationPreferences = {
        ...userPreferences.notificationPreferences,
        ...req.body.notificationPreferences
      };
    }

    // Save the updated preferences
    await userPreferences.save();

    res.json(userPreferences);
  } catch (error) {
    handleError(error, ErrorCategory.USER_PREFERENCES, {
      userId: req.user?._id,
      function: 'updateUserPreferences'
    });
    res.status(500).json({ error: error.message });
  }
};

// Reset user preferences to default
export const resetUserPreferences = async (req, res) => {
  try {
    if (!req.user?._id) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    console.log(`Resetting preferences for user ${req.user._id}`);

    // Delete existing preferences
    const deleteResult = await UserPreferences.findOneAndDelete({ user: req.user._id });
    console.log('Delete result:', deleteResult ? 'Preferences deleted' : 'No preferences found to delete');

    // Create new preferences with defaults
    const defaultItems = [
      { key: 'dashboard', show: true },
      { key: 'foh', show: true },
      { key: 'documentation', show: true },
      { key: 'evaluations', show: true },
      { key: 'users', show: true }
    ];

    const userPreferences = new UserPreferences({
      user: req.user._id,
      uiPreferences: {
        mobileNavigation: {
          items: defaultItems,
          maxItems: 5
        }
      }
    });

    const savedPreferences = await userPreferences.save();
    console.log('New preferences created with default items:', defaultItems);

    res.json(savedPreferences);
  } catch (error) {
    console.error('Error resetting user preferences:', error);
    handleError(error, ErrorCategory.USER_PREFERENCES, {
      userId: req.user?._id,
      function: 'resetUserPreferences'
    });
    res.status(500).json({ error: error.message });
  }
};
