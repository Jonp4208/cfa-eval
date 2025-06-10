import FoodItem from '../models/FoodItem.js';
import logger from '../utils/logger.js';

// Default food items that should be available to all stores
const defaultFoodItems = [
  {
    key: 'sandwich_regular',
    name: 'Sandwich Regular',
    description: 'Regular chicken sandwich',
    category: 'sandwich',
    icon: 'sandwich',
    isDefault: true
  },
  {
    key: 'sandwich_spicy',
    name: 'Sandwich Spicy',
    description: 'Spicy chicken sandwich',
    category: 'sandwich',
    icon: 'flame',
    isDefault: true
  },
  {
    key: 'nuggets_8',
    name: 'Nuggets 8-count',
    description: '8-piece chicken nuggets',
    category: 'nuggets',
    icon: 'circle',
    isDefault: true
  },
  {
    key: 'nuggets_12',
    name: 'Nuggets 12-count',
    description: '12-piece chicken nuggets',
    category: 'nuggets',
    icon: 'circle',
    isDefault: true
  },
  {
    key: 'strips_4',
    name: 'Strips 4-count',
    description: '4-piece chicken strips',
    category: 'strips',
    icon: 'minus',
    isDefault: true
  },
  {
    key: 'grilled_sandwich',
    name: 'Grilled Sandwich',
    description: 'Grilled chicken sandwich',
    category: 'grilled',
    icon: 'flame',
    isDefault: true
  },
  {
    key: 'grilled_nuggets_8',
    name: 'Grilled Nuggets 8-count',
    description: '8-piece grilled nuggets',
    category: 'grilled',
    icon: 'circle',
    isDefault: true
  },
  {
    key: 'grilled_nuggets_12',
    name: 'Grilled Nuggets 12-count',
    description: '12-piece grilled nuggets',
    category: 'grilled',
    icon: 'circle',
    isDefault: true
  },
  {
    key: 'fries_small',
    name: 'Fries Small',
    description: 'Small waffle fries',
    category: 'fries',
    icon: 'utensils',
    isDefault: true
  },
  {
    key: 'fries_medium',
    name: 'Fries Medium',
    description: 'Medium waffle fries',
    category: 'fries',
    icon: 'utensils',
    isDefault: true
  },
  {
    key: 'fries_large',
    name: 'Fries Large',
    description: 'Large waffle fries',
    category: 'fries',
    icon: 'utensils',
    isDefault: true
  }
];

// Initialize default food items for a store
export const initializeDefaultItems = async (storeId, userId) => {
  try {
    const existingItems = await FoodItem.find({ store: storeId, isDefault: true });
    
    // Only create default items that don't already exist
    const existingKeys = existingItems.map(item => item.key);
    const itemsToCreate = defaultFoodItems.filter(item => !existingKeys.includes(item.key));
    
    if (itemsToCreate.length > 0) {
      const items = itemsToCreate.map(item => ({
        ...item,
        store: storeId,
        createdBy: userId
      }));
      
      await FoodItem.insertMany(items);
      logger.info(`Initialized ${itemsToCreate.length} default food items for store ${storeId}`);
    }
    
    return true;
  } catch (error) {
    logger.error('Error initializing default food items:', error);
    throw error;
  }
};

// Get all food items for a store
export const getFoodItems = async (req, res) => {
  try {
    const storeId = req.user.store._id;
    
    // Initialize default items if they don't exist
    await initializeDefaultItems(storeId, req.user._id);
    
    const items = await FoodItem.find({
      store: storeId,
      isActive: true
    }).sort({ category: 1, name: 1 });

    res.json(items);
  } catch (error) {
    logger.error('Error getting food items:', error);
    res.status(500).json({ message: 'Error getting food items' });
  }
};

// Create a new custom food item
export const createFoodItem = async (req, res) => {
  try {
    const { key, name, description, category, icon } = req.body;
    const storeId = req.user.store._id;

    // Check if key already exists for this store
    const existingItem = await FoodItem.findOne({ key, store: storeId });
    if (existingItem) {
      return res.status(400).json({ message: 'A food item with this key already exists' });
    }

    const foodItem = await FoodItem.create({
      key,
      name,
      description,
      category,
      icon,
      store: storeId,
      createdBy: req.user._id,
      isDefault: false
    });

    res.status(201).json(foodItem);
  } catch (error) {
    logger.error('Error creating food item:', error);
    if (error.code === 11000) {
      res.status(400).json({ message: 'A food item with this key already exists' });
    } else {
      res.status(500).json({ message: 'Error creating food item' });
    }
  }
};

// Update a food item
export const updateFoodItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, category, icon } = req.body;
    const storeId = req.user.store._id;

    const foodItem = await FoodItem.findOne({ _id: id, store: storeId });
    if (!foodItem) {
      return res.status(404).json({ message: 'Food item not found' });
    }

    // Don't allow updating default items' key or core properties
    if (foodItem.isDefault) {
      return res.status(400).json({ message: 'Cannot modify default food items' });
    }

    foodItem.name = name;
    foodItem.description = description;
    foodItem.category = category;
    foodItem.icon = icon;

    await foodItem.save();
    res.json(foodItem);
  } catch (error) {
    logger.error('Error updating food item:', error);
    res.status(500).json({ message: 'Error updating food item' });
  }
};

// Delete a food item (soft delete)
export const deleteFoodItem = async (req, res) => {
  try {
    const { id } = req.params;
    const storeId = req.user.store._id;

    const foodItem = await FoodItem.findOne({ _id: id, store: storeId });
    if (!foodItem) {
      return res.status(404).json({ message: 'Food item not found' });
    }

    // Don't allow deleting default items
    if (foodItem.isDefault) {
      return res.status(400).json({ message: 'Cannot delete default food items' });
    }

    foodItem.isActive = false;
    await foodItem.save();

    res.json({ message: 'Food item deleted successfully' });
  } catch (error) {
    logger.error('Error deleting food item:', error);
    res.status(500).json({ message: 'Error deleting food item' });
  }
};

// Get food item categories
export const getFoodItemCategories = async (req, res) => {
  try {
    const categories = [
      { value: 'sandwich', label: 'Sandwiches', icon: 'sandwich' },
      { value: 'nuggets', label: 'Nuggets', icon: 'circle' },
      { value: 'strips', label: 'Strips', icon: 'minus' },
      { value: 'fries', label: 'Fries', icon: 'utensils' },
      { value: 'grilled', label: 'Grilled Items', icon: 'flame' },
      { value: 'sides', label: 'Sides', icon: 'plus' },
      { value: 'beverages', label: 'Beverages', icon: 'coffee' },
      { value: 'other', label: 'Other', icon: 'more-horizontal' }
    ];

    res.json(categories);
  } catch (error) {
    logger.error('Error getting food item categories:', error);
    res.status(500).json({ message: 'Error getting food item categories' });
  }
};
