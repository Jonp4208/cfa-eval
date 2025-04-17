import ShiftSetup from '../models/ShiftSetup.js';
import { nanoid } from 'nanoid';

// Get all time blocks for a day
export const getTimeBlocks = async (req, res) => {
  try {
    const { setupId, dayIndex } = req.query;
    
    if (!setupId || dayIndex === undefined) {
      return res.status(400).json({ message: 'Missing required parameters' });
    }
    
    const shiftSetup = await ShiftSetup.findById(setupId);
    
    if (!shiftSetup) {
      return res.status(404).json({ message: 'Shift setup not found' });
    }
    
    if (!shiftSetup.days[dayIndex]) {
      return res.status(404).json({ message: 'Day not found' });
    }
    
    res.status(200).json(shiftSetup.days[dayIndex].timeBlocks || []);
  } catch (error) {
    console.error('Error getting time blocks:', error);
    res.status(500).json({ message: 'Error getting time blocks' });
  }
};

// Create a new time block
export const createTimeBlock = async (req, res) => {
  try {
    const { setupId, dayIndex, startTime, endTime } = req.body;
    
    if (!setupId || dayIndex === undefined || !startTime || !endTime) {
      return res.status(400).json({ message: 'Missing required parameters' });
    }
    
    const shiftSetup = await ShiftSetup.findById(setupId);
    
    if (!shiftSetup) {
      return res.status(404).json({ message: 'Shift setup not found' });
    }
    
    // Check if the setup is published and not a template
    if (shiftSetup.status === 'published' && !shiftSetup.isTemplate) {
      return res.status(400).json({ 
        message: 'Cannot modify a published setup. Please create a new version or unpublish first.' 
      });
    }
    
    if (!shiftSetup.days[dayIndex]) {
      return res.status(404).json({ message: 'Day not found' });
    }
    
    // Initialize timeBlocks array if it doesn't exist
    if (!shiftSetup.days[dayIndex].timeBlocks) {
      shiftSetup.days[dayIndex].timeBlocks = [];
    }
    
    // Create a new time block
    const newTimeBlock = {
      id: `block-${nanoid(8)}`,
      startTime,
      endTime,
      positions: []
    };
    
    // Add the time block to the day
    shiftSetup.days[dayIndex].timeBlocks.push(newTimeBlock);
    
    // Mark the array as modified
    shiftSetup.markModified('days');
    
    // Save the updated shift setup
    await shiftSetup.save();
    
    res.status(201).json(newTimeBlock);
  } catch (error) {
    console.error('Error creating time block:', error);
    res.status(500).json({ message: 'Error creating time block' });
  }
};

// Update a time block
export const updateTimeBlock = async (req, res) => {
  try {
    const { setupId, dayIndex, blockId } = req.params;
    const { startTime, endTime } = req.body;
    
    if (!setupId || dayIndex === undefined || !blockId) {
      return res.status(400).json({ message: 'Missing required parameters' });
    }
    
    const shiftSetup = await ShiftSetup.findById(setupId);
    
    if (!shiftSetup) {
      return res.status(404).json({ message: 'Shift setup not found' });
    }
    
    // Check if the setup is published and not a template
    if (shiftSetup.status === 'published' && !shiftSetup.isTemplate) {
      return res.status(400).json({ 
        message: 'Cannot modify a published setup. Please create a new version or unpublish first.' 
      });
    }
    
    if (!shiftSetup.days[dayIndex] || !shiftSetup.days[dayIndex].timeBlocks) {
      return res.status(404).json({ message: 'Day or time blocks not found' });
    }
    
    const timeBlockIndex = shiftSetup.days[dayIndex].timeBlocks.findIndex(block => block.id === blockId);
    
    if (timeBlockIndex === -1) {
      return res.status(404).json({ message: 'Time block not found' });
    }
    
    // Update the time block
    const timeBlock = shiftSetup.days[dayIndex].timeBlocks[timeBlockIndex];
    
    if (startTime) timeBlock.startTime = startTime;
    if (endTime) timeBlock.endTime = endTime;
    
    // Mark the array as modified
    shiftSetup.markModified('days');
    
    // Save the updated shift setup
    await shiftSetup.save();
    
    res.status(200).json(timeBlock);
  } catch (error) {
    console.error('Error updating time block:', error);
    res.status(500).json({ message: 'Error updating time block' });
  }
};

// Delete a time block
export const deleteTimeBlock = async (req, res) => {
  try {
    const { setupId, dayIndex, blockId } = req.params;
    
    if (!setupId || dayIndex === undefined || !blockId) {
      return res.status(400).json({ message: 'Missing required parameters' });
    }
    
    const shiftSetup = await ShiftSetup.findById(setupId);
    
    if (!shiftSetup) {
      return res.status(404).json({ message: 'Shift setup not found' });
    }
    
    // Check if the setup is published and not a template
    if (shiftSetup.status === 'published' && !shiftSetup.isTemplate) {
      return res.status(400).json({ 
        message: 'Cannot modify a published setup. Please create a new version or unpublish first.' 
      });
    }
    
    if (!shiftSetup.days[dayIndex] || !shiftSetup.days[dayIndex].timeBlocks) {
      return res.status(404).json({ message: 'Day or time blocks not found' });
    }
    
    // Count time blocks before deletion
    const timeBlockCountBefore = shiftSetup.days[dayIndex].timeBlocks.length;
    
    // Remove the time block
    shiftSetup.days[dayIndex].timeBlocks = shiftSetup.days[dayIndex].timeBlocks.filter(block => block.id !== blockId);
    
    // Count time blocks after deletion
    const timeBlockCountAfter = shiftSetup.days[dayIndex].timeBlocks.length;
    
    if (timeBlockCountBefore === timeBlockCountAfter) {
      return res.status(404).json({ message: 'Time block not found or could not be deleted' });
    }
    
    // Mark the array as modified
    shiftSetup.markModified('days');
    
    // Save the updated shift setup
    await shiftSetup.save();
    
    res.status(200).json({ 
      message: 'Time block deleted successfully',
      timeBlockCountBefore,
      timeBlockCountAfter
    });
  } catch (error) {
    console.error('Error deleting time block:', error);
    res.status(500).json({ message: 'Error deleting time block' });
  }
};
