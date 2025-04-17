import { DefaultPositions } from '../models/index.js';
import { handleError, ErrorCategory } from '../utils/errorHandler.js';

// Get all default positions for a store
export const getDefaultPositions = async (req, res) => {
  try {
    console.log('getDefaultPositions - Request received');
    console.log('getDefaultPositions - User:', req.user);
    console.log('getDefaultPositions - Store:', req.user?.store);

    const defaultPositions = await DefaultPositions.find({ store: req.user.store._id });
    console.log('getDefaultPositions - Found positions:', defaultPositions);

    res.status(200).json(defaultPositions);
  } catch (error) {
    console.error('getDefaultPositions - Error:', error);
    handleError(error, ErrorCategory.DATABASE, {
      operation: 'getDefaultPositions',
      user: req.user?._id,
      store: req.user?.store
    });
    res.status(500).json({ message: 'Error retrieving default positions' });
  }
};

// Get default positions for a specific day and shift
export const getDefaultPositionsByDayAndShift = async (req, res) => {
  try {
    const { day, shift } = req.params;

    const defaultPositions = await DefaultPositions.findOne({
      store: req.user.store._id,
      day: parseInt(day),
      shift
    });

    if (!defaultPositions) {
      return res.status(404).json({ message: 'Default positions not found for this day and shift' });
    }

    res.status(200).json(defaultPositions);
  } catch (error) {
    handleError(error, ErrorCategory.DATABASE, {
      operation: 'getDefaultPositionsByDayAndShift',
      user: req.user?._id,
      store: req.user?.store
    });
    res.status(500).json({ message: 'Error retrieving default positions' });
  }
};

// Create or update default positions
export const createOrUpdateDefaultPositions = async (req, res) => {
  try {
    const { name, day, shift, positions } = req.body;

    if (!name || day === undefined || !shift || !positions) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Check if default positions already exist for this day and shift
    let defaultPositions = await DefaultPositions.findOne({
      store: req.user.store._id,
      name,
      day,
      shift
    });

    if (defaultPositions) {
      // Update existing default positions
      defaultPositions.positions = positions;
      defaultPositions.updatedAt = Date.now();

      const updatedDefaultPositions = await defaultPositions.save();
      res.status(200).json(updatedDefaultPositions);
    } else {
      // Create new default positions
      const newDefaultPositions = new DefaultPositions({
        store: req.user.store._id,
        name,
        day,
        shift,
        positions,
        createdBy: req.user._id
      });

      const savedDefaultPositions = await newDefaultPositions.save();
      res.status(201).json(savedDefaultPositions);
    }
  } catch (error) {
    handleError(error, ErrorCategory.DATABASE, {
      operation: 'createOrUpdateDefaultPositions',
      user: req.user?._id,
      store: req.user?.store
    });
    res.status(500).json({ message: 'Error creating/updating default positions' });
  }
};

// Delete default positions
export const deleteDefaultPositions = async (req, res) => {
  try {
    const { id } = req.params;

    const defaultPositions = await DefaultPositions.findById(id);

    if (!defaultPositions) {
      return res.status(404).json({ message: 'Default positions not found' });
    }

    // Check if user has permission to delete these default positions
    if (defaultPositions.store.toString() !== req.user.store._id.toString()) {
      return res.status(403).json({ message: 'You do not have permission to delete these default positions' });
    }

    await DefaultPositions.findByIdAndDelete(id);
    res.status(200).json({ message: 'Default positions deleted successfully' });
  } catch (error) {
    handleError(error, ErrorCategory.DATABASE, {
      operation: 'deleteDefaultPositions',
      user: req.user?._id,
      store: req.user?.store
    });
    res.status(500).json({ message: 'Error deleting default positions' });
  }
};
