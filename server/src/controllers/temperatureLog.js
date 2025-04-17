import TemperatureLog from '../models/TemperatureLog.js'
import FoodSafetyConfig from '../models/FoodSafetyConfig.js'
import { startOfDay, endOfDay, subDays } from 'date-fns'

// Get temperature logs for a specific date range
export const getTemperatureLogs = async (req, res) => {
  try {
    const { startDate, endDate, location, type } = req.query
    
    // Build query
    const query = { store: req.user.store }
    
    // Add date range if provided
    if (startDate && endDate) {
      query.timestamp = {
        $gte: startOfDay(new Date(startDate)),
        $lte: endOfDay(new Date(endDate))
      }
    } else {
      // Default to today if no date range provided
      const today = new Date()
      query.timestamp = {
        $gte: startOfDay(today),
        $lte: endOfDay(today)
      }
    }
    
    // Add location filter if provided
    if (location) {
      query.location = location
    }
    
    // Add type filter if provided
    if (type) {
      query.type = type
    }
    
    // Get logs
    const logs = await TemperatureLog.find(query)
      .sort({ timestamp: -1 })
      .populate('recordedBy', 'name')
    
    // Group logs by location
    const groupedLogs = logs.reduce((acc, log) => {
      if (!acc[log.location]) {
        acc[log.location] = []
      }
      acc[log.location].push({
        id: log._id,
        value: log.value,
        timestamp: log.timestamp,
        status: log.status,
        recordedBy: log.recordedBy.name,
        notes: log.notes,
        type: log.type
      })
      return acc
    }, {})
    
    res.json({
      logs,
      groupedLogs
    })
  } catch (error) {
    console.error('Error getting temperature logs:', error)
    res.status(500).json({ message: 'Error getting temperature logs' })
  }
}

// Record a new temperature log
export const recordTemperature = async (req, res) => {
  try {
    const { location, value, notes, type } = req.body
    
    if (!location || value === undefined) {
      return res.status(400).json({ message: 'Location and value are required' })
    }
    
    // Get temperature ranges from config
    const config = await FoodSafetyConfig.findOne({ store: req.user.store })
    if (!config) {
      return res.status(404).json({ message: 'Food safety configuration not found' })
    }
    
    const range = config.temperatureRanges[location]
    if (!range) {
      return res.status(400).json({ message: 'Invalid location' })
    }
    
    // Determine status based on temperature range
    let status = 'pass'
    if (value < range.min || value > range.max) {
      status = 'fail'
    } else if (value <= range.min + range.warning || value >= range.max - range.warning) {
      status = 'warning'
    }
    
    // Create temperature log
    const temperatureLog = await TemperatureLog.create({
      store: req.user.store,
      location,
      value,
      status,
      recordedBy: req.user._id,
      notes,
      type: type || (range.type || 'equipment')
    })
    
    res.status(201).json(temperatureLog)
  } catch (error) {
    console.error('Error recording temperature:', error)
    res.status(500).json({ message: 'Error recording temperature' })
  }
}

// Record multiple temperature logs at once
export const recordMultipleTemperatures = async (req, res) => {
  try {
    const { temperatures } = req.body
    
    if (!temperatures || !Array.isArray(temperatures) || temperatures.length === 0) {
      return res.status(400).json({ message: 'Temperatures array is required' })
    }
    
    // Get temperature ranges from config
    const config = await FoodSafetyConfig.findOne({ store: req.user.store })
    if (!config) {
      return res.status(404).json({ message: 'Food safety configuration not found' })
    }
    
    // Process each temperature
    const logs = []
    for (const temp of temperatures) {
      const { location, value } = temp
      if (!location || value === undefined) continue
      
      const range = config.temperatureRanges[location]
      if (!range) continue
      
      // Determine status based on temperature range
      let status = 'pass'
      if (value < range.min || value > range.max) {
        status = 'fail'
      } else if (value <= range.min + range.warning || value >= range.max - range.warning) {
        status = 'warning'
      }
      
      // Create temperature log
      const log = await TemperatureLog.create({
        store: req.user.store,
        location,
        value,
        status,
        recordedBy: req.user._id,
        notes: temp.notes || '',
        type: temp.type || (range.type || 'equipment')
      })
      
      logs.push(log)
    }
    
    res.status(201).json({ logs })
  } catch (error) {
    console.error('Error recording temperatures:', error)
    res.status(500).json({ message: 'Error recording temperatures' })
  }
}

// Get today's latest temperature for each location
export const getLatestTemperatures = async (req, res) => {
  try {
    const today = new Date()
    
    // Get all logs from today
    const logs = await TemperatureLog.find({
      store: req.user.store,
      timestamp: {
        $gte: startOfDay(today),
        $lte: endOfDay(today)
      }
    }).sort({ timestamp: -1 })
    
    // Get the latest log for each location
    const latestLogs = {}
    logs.forEach(log => {
      if (!latestLogs[log.location] || new Date(log.timestamp) > new Date(latestLogs[log.location].timestamp)) {
        latestLogs[log.location] = {
          value: log.value,
          timestamp: log.timestamp,
          status: log.status
        }
      }
    })
    
    res.json(latestLogs)
  } catch (error) {
    console.error('Error getting latest temperatures:', error)
    res.status(500).json({ message: 'Error getting latest temperatures' })
  }
} 