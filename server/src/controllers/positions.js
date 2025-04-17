import ShiftSetup from '../models/ShiftSetup.js';
import { nanoid } from 'nanoid';

// Get all positions for a time block
export const getPositions = async (req, res) => {
  try {
    const { setupId, dayIndex, blockId } = req.query;
    
    if (!setupId || dayIndex === undefined || !blockId) {
      return res.status(400).json({ message: 'Missing required parameters' });
    }
    
    const shiftSetup = await ShiftSetup.findById(setupId);
    
    if (!shiftSetup) {
      return res.status(404).json({ message: 'Shift setup not found' });
    }
    
    if (!shiftSetup.days[dayIndex] || !shiftSetup.days[dayIndex].timeBlocks) {
      return res.status(404).json({ message: 'Day or time blocks not found' });
    }
    
    const timeBlock = shiftSetup.days[dayIndex].timeBlocks.find(block => block.id === blockId);
    
    if (!timeBlock) {
      return res.status(404).json({ message: 'Time block not found' });
    }
    
    res.status(200).json(timeBlock.positions || []);
  } catch (error) {
    console.error('Error getting positions:', error);
    res.status(500).json({ message: 'Error getting positions' });
  }
};

// Create a new position
export const createPosition = async (req, res) => {
  try {
    const { setupId, dayIndex, blockId, name, department } = req.body;
    
    if (!setupId || dayIndex === undefined || !blockId || !name || !department) {
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
    
    // Create a new position
    const newPosition = {
      id: `pos-${nanoid(8)}`,
      name,
      department,
      status: 'unassigned',
      assignedEmployee: null
    };
    
    // Add the position to the time block
    shiftSetup.days[dayIndex].timeBlocks[timeBlockIndex].positions.push(newPosition);
    
    // Mark the array as modified
    shiftSetup.markModified('days');
    
    // Save the updated shift setup
    await shiftSetup.save();
    
    res.status(201).json(newPosition);
  } catch (error) {
    console.error('Error creating position:', error);
    res.status(500).json({ message: 'Error creating position' });
  }
};

// Update a position
export const updatePosition = async (req, res) => {
  try {
    const { setupId, dayIndex, blockId, positionId } = req.params;
    const { name, department, status, assignedEmployee } = req.body;
    
    if (!setupId || dayIndex === undefined || !blockId || !positionId) {
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
    
    const positionIndex = shiftSetup.days[dayIndex].timeBlocks[timeBlockIndex].positions.findIndex(
      pos => pos.id === positionId
    );
    
    if (positionIndex === -1) {
      return res.status(404).json({ message: 'Position not found' });
    }
    
    // Update the position
    const position = shiftSetup.days[dayIndex].timeBlocks[timeBlockIndex].positions[positionIndex];
    
    if (name) position.name = name;
    if (department) position.department = department;
    if (status) position.status = status;
    if (assignedEmployee !== undefined) position.assignedEmployee = assignedEmployee;
    
    // Mark the array as modified
    shiftSetup.markModified('days');
    
    // Save the updated shift setup
    await shiftSetup.save();
    
    res.status(200).json(position);
  } catch (error) {
    console.error('Error updating position:', error);
    res.status(500).json({ message: 'Error updating position' });
  }
};

// Delete a position
export const deletePosition = async (req, res) => {
  try {
    const { setupId, dayIndex, blockId, positionId } = req.params;
    
    if (!setupId || dayIndex === undefined || !blockId || !positionId) {
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
    
    // Count positions before deletion
    const positionCountBefore = shiftSetup.days[dayIndex].timeBlocks[timeBlockIndex].positions.length;
    
    // Remove the position
    shiftSetup.days[dayIndex].timeBlocks[timeBlockIndex].positions = 
      shiftSetup.days[dayIndex].timeBlocks[timeBlockIndex].positions.filter(pos => pos.id !== positionId);
    
    // Count positions after deletion
    const positionCountAfter = shiftSetup.days[dayIndex].timeBlocks[timeBlockIndex].positions.length;
    
    if (positionCountBefore === positionCountAfter) {
      return res.status(404).json({ message: 'Position not found or could not be deleted' });
    }
    
    // Mark the array as modified
    shiftSetup.markModified('days');
    
    // Save the updated shift setup
    await shiftSetup.save();
    
    res.status(200).json({ 
      message: 'Position deleted successfully',
      positionCountBefore,
      positionCountAfter
    });
  } catch (error) {
    console.error('Error deleting position:', error);
    res.status(500).json({ message: 'Error deleting position' });
  }
};
