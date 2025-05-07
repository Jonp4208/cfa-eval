import express from 'express';
import mongoose from 'mongoose';
import { auth } from '../middleware/auth.js';
import WeeklySetup from '../models/weeklySetup.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(auth);

// Update employee break status
router.post('/update-status', auth, async (req, res) => {
  try {
    const { setupId, employeeId, status, duration } = req.body;
    
    // Validate required fields
    if (!setupId || !employeeId || !status) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    // Validate status
    if (!['active', 'completed', 'none'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }
    
    // Find the setup
    const setup = await WeeklySetup.findById(setupId);
    if (!setup) {
      return res.status(404).json({ message: 'Setup not found' });
    }
    
    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0];
    
    // Find the employee in the uploadedSchedules array
    const employeeIndex = setup.uploadedSchedules.findIndex(emp => emp.id === employeeId);
    
    if (employeeIndex === -1) {
      return res.status(404).json({ message: 'Employee not found in setup' });
    }
    
    // Get the employee
    const employee = setup.uploadedSchedules[employeeIndex];
    
    // Create breaks array if it doesn't exist
    if (!employee.breaks) {
      employee.breaks = [];
    }
    
    // Handle different status updates
    if (status === 'active') {
      // Starting a break
      const newBreak = {
        startTime: new Date().toISOString(),
        duration: duration || 30,
        status: 'active',
        breakDate: today
      };
      
      // Add the new break to the employee's breaks array
      employee.breaks.push(newBreak);
      
      // Update hadBreak and breakDate
      employee.hadBreak = true;
      employee.breakDate = today;
      
      console.log(`Started break for employee ${employee.name} (${employee.id})`);
    } 
    else if (status === 'completed') {
      // Find the active break
      const activeBreakIndex = employee.breaks.findIndex(b => b.status === 'active');
      
      if (activeBreakIndex !== -1) {
        // Update the break status to completed and add end time
        employee.breaks[activeBreakIndex].status = 'completed';
        employee.breaks[activeBreakIndex].endTime = new Date().toISOString();
        
        console.log(`Completed break for employee ${employee.name} (${employee.id})`);
      } else {
        console.log(`No active break found for employee ${employee.name} (${employee.id})`);
      }
      
      // Ensure hadBreak and breakDate are set
      employee.hadBreak = true;
      employee.breakDate = today;
    }
    
    // Mark the array as modified to ensure MongoDB updates it
    setup.markModified('uploadedSchedules');
    
    // Save the updated setup
    await setup.save();
    
    // Return the updated employee
    res.status(200).json({ 
      message: 'Break status updated successfully',
      employee: setup.uploadedSchedules[employeeIndex]
    });
  } catch (error) {
    console.error('Error updating break status:', error);
    res.status(500).json({ message: 'Error updating break status', error: error.message });
  }
});

export default router;
