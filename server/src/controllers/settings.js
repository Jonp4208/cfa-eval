// File: src/controllers/settings.js
import { Settings, Store } from '../models/index.js';
import { validateAndRepairSettings, validateAutoScheduling } from '../utils/settingsValidator.js';
import { handleError, ErrorCategory } from '../utils/errorHandler.js';
import { scheduleStoreEvaluations } from '../services/evaluationScheduler.js';

const DEFAULT_USER_ACCESS = {
  roleManagement: {
    storeDirectorAccess: true,
    kitchenDirectorAccess: true,
    serviceDirectorAccess: true,
    storeLeaderAccess: true,
    trainingLeaderAccess: true,
    shiftLeaderAccess: true,
    fohLeaderAccess: true,
    bohLeaderAccess: true,
    dtLeaderAccess: true
  },
  evaluation: {
    departmentRestriction: true,
    requireStoreLeaderReview: true,
    requireDirectorApproval: true,
    trainingAccess: true,
    certificationApproval: true,
    metricsAccess: true,
    workflowType: 'standard'
  }
};

const DEFAULT_SETTINGS = {
  evaluations: {
    scheduling: {
      autoSchedule: false,
      frequency: 90,
      cycleStart: 'hire_date',
      transitionMode: 'complete_cycle'
    }
  }
};

export const getSettings = async (req, res) => {
  try {
    if (!req.user?.store) {
      return res.status(400).json({ error: 'Store ID is required' });
    }

    // Validate and repair settings if needed
    const validation = await validateAndRepairSettings(req.user.store);

    // If repairs were made, log them
    if (validation.wasRepaired) {
      handleError(
        new Error('Settings were automatically repaired'),
        ErrorCategory.SETTINGS,
        {
          storeId: req.user.store,
          repairs: validation.repairs,
          function: 'getSettings'
        }
      );
    }

    // Log warnings but don't treat them as errors
    if (validation.warnings && validation.warnings.length > 0) {
      console.log('Settings validation warnings:', validation.warnings);
    }

    // Get store info to include in the response
    const store = await Store.findById(req.user.store);
    if (!store) {
      return res.status(404).json({ error: 'Store not found' });
    }

    // Combine settings with store info
    const response = {
      ...validation.settings.toObject(),
      storeName: store.name,
      storeNumber: store.storeNumber,
      storeAddress: store.storeAddress,
      storePhone: store.storePhone,
      storeEmail: store.storeEmail,
      visionStatement: store.visionStatement,
      missionStatement: store.missionStatement
    };

    res.json(response);
  } catch (error) {
    handleError(error, ErrorCategory.SETTINGS, {
      storeId: req.user?.store,
      function: 'getSettings'
    });
    res.status(500).json({ error: error.message });
  }
};

export const updateSettings = async (req, res) => {
  try {
    if (!req.user?.store) {
      return res.status(400).json({ error: 'Store ID is required' });
    }

    // Check for admin access for sensitive settings
    const isAdmin = req.user.role === 'admin';
    if (!isAdmin) {
      // Only allow updating personal preferences if not an admin
      const allowedFields = ['darkMode', 'compactMode', 'language'];
      const requestedFields = Object.keys(req.body);
      const hasRestrictedFields = requestedFields.some(field => !allowedFields.includes(field));

      if (hasRestrictedFields) {
        return res.status(403).json({ error: 'Only administrators can update these settings' });
      }
    }

    // Get current settings
    let settings = await Settings.findOne({ store: req.user.store });
    if (!settings) {
      settings = new Settings({
        store: req.user.store,
        ...DEFAULT_SETTINGS
      });
    }

    // Handle resetToDefault flag
    if (req.body.resetToDefault) {
      if (!isAdmin) {
        return res.status(403).json({ error: 'Only administrators can reset settings to default' });
      }
      Object.assign(settings, DEFAULT_SETTINGS);
      await settings.save();
      return res.json(settings);
    }

    let schedulingResults = null;

    // Update evaluation settings
    if (req.body.evaluations) {
      if (!isAdmin) {
        return res.status(403).json({ error: 'Only administrators can update evaluation settings' });
      }

      // Ensure nested objects exist
      if (!settings.evaluations) {
        settings.evaluations = {};
      }
      if (!settings.evaluations.scheduling) {
        settings.evaluations.scheduling = {};
      }

      // If enabling auto-scheduling, validate all requirements are met
      if (req.body.evaluations.scheduling?.autoSchedule) {
        const autoScheduleValidation = await validateAutoScheduling(req.user.store);

        // Only block enabling if there are critical issues
        if (!autoScheduleValidation.isValid) {
          // Preserve existing settings in the error response
          return res.status(400).json({
            error: 'Cannot enable auto-scheduling due to configuration issues',
            issues: autoScheduleValidation.issues,
            configurationIssues: autoScheduleValidation.configurationIssues,
            currentSettings: settings.toObject()
          });
        }

        // Update scheduling settings while preserving existing values
        if (req.body.evaluations.scheduling) {
          const currentScheduling = settings.evaluations?.scheduling || {};
          settings.evaluations.scheduling = {
            ...currentScheduling,
            ...req.body.evaluations.scheduling,
            // Ensure required fields have defaults or keep existing values
            frequency: req.body.evaluations.scheduling.frequency || currentScheduling.frequency || 90,
            cycleStart: req.body.evaluations.scheduling.cycleStart || currentScheduling.cycleStart || 'hire_date',
            transitionMode: req.body.evaluations.scheduling.transitionMode || currentScheduling.transitionMode || 'complete_cycle'
          };
        }

        // Save settings before scheduling
        await settings.save();

        // Run initial scheduling
        try {
          schedulingResults = await scheduleStoreEvaluations(req.user.store);

          // Include scheduling results summary
          if (schedulingResults) {
            console.log('Auto-scheduling results:', {
              store: req.user.store,
              scheduled: schedulingResults.scheduled?.length || 0,
              skipped: schedulingResults.skipped?.length || 0,
              errors: schedulingResults.errors?.length || 0
            });
          }
        } catch (error) {
          // Log the error but don't prevent settings from being saved
          handleError(error, ErrorCategory.SETTINGS, {
            storeId: req.user.store,
            function: 'updateSettings - initial scheduling'
          });
          // Include error info in response
          schedulingResults = { error: error.message };
        }
      } else {
        // Update scheduling settings normally
        if (req.body.evaluations.scheduling) {
          settings.evaluations.scheduling = {
            ...settings.evaluations.scheduling,
            ...req.body.evaluations.scheduling
          };
        }
      }

      // Update other evaluation settings if they exist
      const { scheduling, ...otherEvalSettings } = req.body.evaluations;
      if (Object.keys(otherEvalSettings).length > 0) {
        settings.evaluations = {
          ...settings.evaluations,
          ...otherEvalSettings
        };
      }
    }

    // Update personal preferences
    if (req.body.darkMode !== undefined) {
      settings.darkMode = req.body.darkMode;
    }
    if (req.body.compactMode !== undefined) {
      settings.compactMode = req.body.compactMode;
    }
    if (req.body.language !== undefined) {
      settings.language = req.body.language;
    }

    // Update UI preferences (like mobile navigation)
    if (req.body.uiPreferences) {
      // Initialize if not exists
      if (!settings.uiPreferences) {
        settings.uiPreferences = {};
      }

      // Update mobile navigation preferences
      if (req.body.uiPreferences.mobileNavigation) {
        if (!settings.uiPreferences.mobileNavigation) {
          settings.uiPreferences.mobileNavigation = {};
        }

        // Update items array
        if (req.body.uiPreferences.mobileNavigation.items) {
          settings.uiPreferences.mobileNavigation.items =
            req.body.uiPreferences.mobileNavigation.items;

          // Log the update for debugging
          console.log('Updated mobile navigation items:',
            settings.uiPreferences.mobileNavigation.items);
        }

        // Update max items
        if (req.body.uiPreferences.mobileNavigation.maxItems !== undefined) {
          settings.uiPreferences.mobileNavigation.maxItems =
            req.body.uiPreferences.mobileNavigation.maxItems;
        }
      }
    }

    // Save the settings
    await settings.save();

    // Get store info to include in the response
    const store = await Store.findById(req.user.store);
    if (!store) {
      return res.status(404).json({ error: 'Store not found' });
    }

    // Only run validation if we're updating evaluation settings
    // Skip validation for UI preferences and other non-evaluation updates
    let response = {
      ...settings.toObject(),
      storeName: store.name,
      storeNumber: store.storeNumber,
      storeAddress: store.storeAddress,
      storePhone: store.storePhone,
      storeEmail: store.storeEmail,
      visionStatement: store.visionStatement,
      missionStatement: store.missionStatement
    };

    if (req.body.evaluations) {
      // Get final validation state including configuration issues
      const finalValidation = await validateAutoScheduling(req.user.store);

      // Return settings with scheduling results and configuration issues
      response = {
        ...response,
        schedulingResults,
        evaluations: {
          ...response.evaluations,
          configurationIssues: finalValidation.configurationIssues
        }
      };
    }

    res.json(response);
  } catch (error) {
    handleError(error, ErrorCategory.SETTINGS, {
      storeId: req.user?.store,
      function: 'updateSettings'
    });
    res.status(500).json({ error: error.message });
  }
};

export const validateSettings = async (req, res) => {
  try {
    if (!req.user?.store) {
      return res.status(400).json({ error: 'Store ID is required' });
    }

    const autoScheduleValidation = await validateAutoScheduling(req.user.store);

    res.json({
      isValid: autoScheduleValidation.isValid,
      issues: autoScheduleValidation.issues,
      employeeCount: autoScheduleValidation.employeeCount,
      settings: autoScheduleValidation.settings
    });
  } catch (error) {
    handleError(error, ErrorCategory.SETTINGS, {
      storeId: req.user?.store,
      function: 'validateSettings'
    });
    res.status(500).json({ error: error.message });
  }
};

export const resetSettings = async (req, res) => {
  try {
    if (!req.user.store) {
      return res.status(400).json({ error: 'Store ID is required' });
    }

    await Settings.findOneAndDelete({ store: req.user.store });
    const settings = await Settings.create({
      store: req.user.store,
      darkMode: false,
      compactMode: false
    });

    // Get store info
    const store = await Store.findById(req.user.store);

    // Combine settings with store info
    const response = {
      ...settings.toObject(),
      storeName: store.name,
      storeNumber: store.storeNumber,
      storeAddress: store.storeAddress,
      storePhone: store.storePhone,
      storeEmail: store.storeEmail,
      visionStatement: store.visionStatement,
      missionStatement: store.missionStatement
    };

    res.json(response);
  } catch (error) {
    console.error('Error in resetSettings:', error);
    res.status(500).json({ error: error.message });
  }
};

export const getStoreInfo = async (req, res) => {
  try {
    if (!req.user.store) {
      return res.status(400).json({ error: 'Store ID is required' });
    }

    const store = await Store.findById(req.user.store);
    if (!store) {
      return res.status(404).json({ error: 'Store not found' });
    }

    res.json(store);
  } catch (error) {
    console.error('Error in getStoreInfo:', error);
    res.status(500).json({ error: error.message });
  }
};

export const updateStoreInfo = async (req, res) => {
  try {
    if (!req.user.store) {
      return res.status(400).json({ error: 'Store ID is required' });
    }

    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only admins can update store information' });
    }

    // Allow updating all store fields except storeNumber (which should be immutable)
    const { name, storeAddress, storePhone, storeEmail, visionStatement, missionStatement } = req.body;
    const updates = {};

    if (name !== undefined) updates.name = name;
    if (storeAddress !== undefined) updates.storeAddress = storeAddress;
    if (storePhone !== undefined) updates.storePhone = storePhone;
    if (storeEmail !== undefined) updates.storeEmail = storeEmail;
    if (visionStatement !== undefined) updates.visionStatement = visionStatement;
    if (missionStatement !== undefined) updates.missionStatement = missionStatement;

    const store = await Store.findByIdAndUpdate(
      req.user.store,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!store) {
      return res.status(404).json({ error: 'Store not found' });
    }

    // Return the full store info in the response
    const response = {
      storeName: store.name,
      storeNumber: store.storeNumber,
      storeAddress: store.storeAddress,
      storePhone: store.storePhone,
      storeEmail: store.storeEmail,
      visionStatement: store.visionStatement,
      missionStatement: store.missionStatement
    };

    res.json(response);
  } catch (error) {
    console.error('Error in updateStoreInfo:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get waste item prices for the current store
export const getWasteItemPrices = async (req, res) => {
  try {
    if (!req.user?.store) {
      return res.status(400).json({ error: 'Store ID is required' })
    }
    const settings = await Settings.findOne({ store: req.user.store })
    if (!settings) {
      return res.status(404).json({ error: 'Settings not found for this store' })
    }
    // Convert Map to plain object
    const prices = Object.fromEntries(settings.wasteItemPrices || [])
    res.json(prices)
  } catch (error) {
    handleError(error, ErrorCategory.SETTINGS, {
      storeId: req.user?.store,
      function: 'getWasteItemPrices'
    })
    res.status(500).json({ error: error.message })
  }
}

// Update waste item prices for the current store
export const updateWasteItemPrices = async (req, res) => {
  try {
    if (!req.user?.store) {
      return res.status(400).json({ error: 'Store ID is required' })
    }
    const isAdmin = req.user.role === 'admin'
    if (!isAdmin) {
      return res.status(403).json({ error: 'Only administrators can update item prices' })
    }
    const { prices } = req.body
    if (!prices || typeof prices !== 'object') {
      return res.status(400).json({ error: 'Invalid prices object' })
    }
    let settings = await Settings.findOne({ store: req.user.store })
    if (!settings) {
      settings = new Settings({ store: req.user.store })
    }
    // Set prices (overwrite all)
    settings.wasteItemPrices = prices
    await settings.save()
    res.json(Object.fromEntries(settings.wasteItemPrices))
  } catch (error) {
    handleError(error, ErrorCategory.SETTINGS, {
      storeId: req.user?.store,
      function: 'updateWasteItemPrices'
    })
    res.status(500).json({ error: error.message })
  }
}

// Get custom waste items for the current store
export const getCustomWasteItems = async (req, res) => {
  try {
    if (!req.user?.store) {
      return res.status(400).json({ error: 'Store ID is required' })
    }
    const settings = await Settings.findOne({ store: req.user.store })
    if (!settings) {
      return res.status(404).json({ error: 'Settings not found for this store' })
    }

    res.json(settings.customWasteItems || [])
  } catch (error) {
    handleError(error, ErrorCategory.SETTINGS, {
      storeId: req.user?.store,
      function: 'getCustomWasteItems'
    })
    res.status(500).json({ error: error.message })
  }
}

// Add a new custom waste item
export const addCustomWasteItem = async (req, res) => {
  try {
    if (!req.user?.store) {
      return res.status(400).json({ error: 'Store ID is required' })
    }
    const isAdmin = req.user.role === 'admin'
    if (!isAdmin) {
      return res.status(403).json({ error: 'Only administrators can add custom waste items' })
    }

    const { name, unit, defaultCost, icon, mealPeriod } = req.body

    if (!name || !mealPeriod) {
      return res.status(400).json({ error: 'Name and meal period are required' })
    }

    let settings = await Settings.findOne({ store: req.user.store })
    if (!settings) {
      settings = new Settings({ store: req.user.store })
    }

    // Check if item with same name already exists
    const existingItem = settings.customWasteItems?.find(item =>
      item.name.toLowerCase() === name.toLowerCase() &&
      item.mealPeriod === mealPeriod
    )

    if (existingItem) {
      return res.status(400).json({ error: 'An item with this name already exists for this meal period' })
    }

    // Add the new item
    const newItem = {
      name,
      unit: unit || 'pieces',
      defaultCost: defaultCost || 1.0,
      icon: icon || '🍽️',
      mealPeriod,
      isCustom: true
    }

    if (!settings.customWasteItems) {
      settings.customWasteItems = []
    }

    settings.customWasteItems.push(newItem)
    await settings.save()

    res.status(201).json(newItem)
  } catch (error) {
    handleError(error, ErrorCategory.SETTINGS, {
      storeId: req.user?.store,
      function: 'addCustomWasteItem'
    })
    res.status(500).json({ error: error.message })
  }
}

// Update a custom waste item
export const updateCustomWasteItem = async (req, res) => {
  try {
    if (!req.user?.store) {
      return res.status(400).json({ error: 'Store ID is required' })
    }
    const isAdmin = req.user.role === 'admin'
    if (!isAdmin) {
      return res.status(403).json({ error: 'Only administrators can update custom waste items' })
    }

    const { itemId } = req.params
    const { name, unit, defaultCost, icon, mealPeriod } = req.body

    if (!itemId) {
      return res.status(400).json({ error: 'Item ID is required' })
    }

    let settings = await Settings.findOne({ store: req.user.store })
    if (!settings || !settings.customWasteItems) {
      return res.status(404).json({ error: 'No custom waste items found' })
    }

    // Find the item to update
    const itemIndex = settings.customWasteItems.findIndex(item => item._id.toString() === itemId)

    if (itemIndex === -1) {
      return res.status(404).json({ error: 'Custom waste item not found' })
    }

    // Check if updating to a name that already exists (excluding this item)
    if (name) {
      const duplicateName = settings.customWasteItems.some((item, index) =>
        index !== itemIndex &&
        item.name.toLowerCase() === name.toLowerCase() &&
        item.mealPeriod === (mealPeriod || settings.customWasteItems[itemIndex].mealPeriod)
      )

      if (duplicateName) {
        return res.status(400).json({ error: 'An item with this name already exists for this meal period' })
      }
    }

    // Update the item
    if (name) settings.customWasteItems[itemIndex].name = name
    if (unit) settings.customWasteItems[itemIndex].unit = unit
    if (defaultCost !== undefined) settings.customWasteItems[itemIndex].defaultCost = defaultCost
    if (icon) settings.customWasteItems[itemIndex].icon = icon
    if (mealPeriod) settings.customWasteItems[itemIndex].mealPeriod = mealPeriod

    await settings.save()

    res.json(settings.customWasteItems[itemIndex])
  } catch (error) {
    handleError(error, ErrorCategory.SETTINGS, {
      storeId: req.user?.store,
      function: 'updateCustomWasteItem'
    })
    res.status(500).json({ error: error.message })
  }
}

// Delete a custom waste item
export const deleteCustomWasteItem = async (req, res) => {
  try {
    if (!req.user?.store) {
      return res.status(400).json({ error: 'Store ID is required' })
    }
    const isAdmin = req.user.role === 'admin'
    if (!isAdmin) {
      return res.status(403).json({ error: 'Only administrators can delete custom waste items' })
    }

    const { itemId } = req.params

    if (!itemId) {
      return res.status(400).json({ error: 'Item ID is required' })
    }

    let settings = await Settings.findOne({ store: req.user.store })
    if (!settings || !settings.customWasteItems) {
      return res.status(404).json({ error: 'No custom waste items found' })
    }

    // Find the item to delete
    const itemIndex = settings.customWasteItems.findIndex(item => item._id.toString() === itemId)

    if (itemIndex === -1) {
      return res.status(404).json({ error: 'Custom waste item not found' })
    }

    // Remove the item
    settings.customWasteItems.splice(itemIndex, 1)
    await settings.save()

    res.json({ message: 'Custom waste item deleted successfully' })
  } catch (error) {
    handleError(error, ErrorCategory.SETTINGS, {
      storeId: req.user?.store,
      function: 'deleteCustomWasteItem'
    })
    res.status(500).json({ error: error.message })
  }
}
