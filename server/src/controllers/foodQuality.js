import FoodQualityStandard from '../models/FoodQualityStandard.js';
import FoodQualityEvaluation from '../models/FoodQualityEvaluation.js';
import FoodQualityConfig from '../models/FoodQualityConfig.js';
import FoodItem from '../models/FoodItem.js';
import { initializeDefaultItems } from './foodItems.js';
import logger from '../utils/logger.js';

// Helper function to calculate item status based on criteria and value
const calculateItemStatus = (value, validation, type) => {
  if (!validation) return 'pass';

  switch (type) {
    case 'temperature':
      if (validation.minTemp !== undefined && value < validation.minTemp) return 'fail';
      if (validation.maxTemp !== undefined && value > validation.maxTemp) return 'fail';
      return 'pass';
    
    case 'weight':
      if (validation.minWeight !== undefined && value < validation.minWeight) return 'fail';
      if (validation.maxWeight !== undefined && value > validation.maxWeight) return 'warning';
      return 'pass';
    
    case 'count':
      if (validation.minCount !== undefined && value < validation.minCount) return 'fail';
      if (validation.maxCount !== undefined && value > validation.maxCount) return 'fail';
      return 'pass';
    
    case 'measurement':
      if (validation.minMeasurement !== undefined && value < validation.minMeasurement) return 'fail';
      if (validation.maxMeasurement !== undefined && value > validation.maxMeasurement) return 'fail';
      return 'pass';
    
    case 'yes_no':
      return value === validation.requiredValue ? 'pass' : 'fail';
    
    case 'taste':
      if (validation.minTasteRating !== undefined && value < validation.minTasteRating) return 'fail';
      if (validation.maxTasteRating !== undefined && value > validation.maxTasteRating) return 'fail';
      return value >= 7 ? 'pass' : value >= 5 ? 'warning' : 'fail';
    
    case 'visual':
      return value === 'pass' ? 'pass' : value === 'warning' ? 'warning' : 'fail';
    
    default:
      return 'pass';
  }
};

// Get food quality configuration
export const getFoodQualityConfig = async (req, res) => {
  try {
    const store = req.user.store._id;

    // Initialize default food items if they don't exist
    await initializeDefaultItems(store, req.user._id);

    // Get all active food items for this store
    const foodItems = await FoodItem.find({ store, isActive: true }).sort({ category: 1, name: 1 });

    let config = await FoodQualityConfig.findOne({ store });

    // If no config exists, create one with defaults
    if (!config) {
      config = await FoodQualityConfig.create({ store });
    }

    // Build standards object from food items and existing config
    const standards = {};
    for (const item of foodItems) {
      standards[item.key] = config.standards[item.key] || {
        name: item.name,
        criteria: []
      };
    }

    res.json({
      standards,
      qualityPhotos: config.qualityPhotos || {},
      foodItems: foodItems.map(item => ({
        key: item.key,
        name: item.name,
        description: item.description,
        category: item.category,
        icon: item.icon,
        isDefault: item.isDefault
      }))
    });
  } catch (error) {
    logger.error('Error getting food quality config:', error);
    res.status(500).json({ error: 'Failed to get food quality configuration' });
  }
};

// Update food quality configuration
export const updateFoodQualityConfig = async (req, res) => {
  try {
    const { standards, qualityPhotos } = req.body;
    const store = req.user.store._id;

    // Find existing config or create new one
    let config = await FoodQualityConfig.findOne({ store });
    if (!config) {
      config = new FoodQualityConfig({ store });
    }

    // Update configuration
    if (standards) config.standards = standards;
    if (qualityPhotos) config.qualityPhotos = qualityPhotos;
    
    await config.save();

    res.json({ success: true });
  } catch (error) {
    logger.error('Error updating food quality config:', error);
    res.status(500).json({ error: 'Failed to update food quality configuration' });
  }
};

// Get all food quality standards for a store
export const getFoodQualityStandards = async (req, res) => {
  try {
    const standards = await FoodQualityStandard.find({
      store: req.user.store._id,
      isActive: true
    }).sort({ productType: 1 });

    res.json(standards);
  } catch (error) {
    logger.error('Error getting food quality standards:', error);
    res.status(500).json({ message: 'Error getting food quality standards' });
  }
};

// Create or update a food quality standard
export const createOrUpdateStandard = async (req, res) => {
  try {
    const { productType, name, criteria } = req.body;
    const store = req.user.store._id;

    // Check if standard already exists
    let standard = await FoodQualityStandard.findOne({ store, productType });

    if (standard) {
      // Update existing standard
      standard.name = name;
      standard.criteria = criteria;
      await standard.save();
    } else {
      // Create new standard
      standard = await FoodQualityStandard.create({
        productType,
        name,
        criteria,
        store
      });
    }

    res.json(standard);
  } catch (error) {
    logger.error('Error creating/updating food quality standard:', error);
    res.status(500).json({ message: 'Error creating/updating food quality standard' });
  }
};

// Submit a food quality evaluation
export const submitEvaluation = async (req, res) => {
  try {
    const { productType, items, notes, photos } = req.body;

    // Get the standard for this product type
    const config = await FoodQualityConfig.findOne({ store: req.user.store._id });
    if (!config || !config.standards[productType]) {
      return res.status(404).json({ message: 'Food quality standard not found for this product type' });
    }

    const standard = config.standards[productType];

    // Calculate scores and determine status
    let totalScore = 0;
    let totalWeight = 0;
    const itemEvaluations = [];

    for (const item of items) {
      const criteria = standard.criteria.find(c => c.id === item.criteriaId);
      if (!criteria) continue;

      const weight = 1; // All criteria have equal weight for now
      totalWeight += weight;

      const status = calculateItemStatus(item.value, criteria.validation, criteria.type);
      
      const score = status === 'pass' ? 100 : status === 'warning' ? 70 : 0;
      totalScore += score * weight;

      itemEvaluations.push({
        criteriaId: item.criteriaId,
        value: item.value,
        status,
        notes: item.notes,
        photo: item.photo
      });
    }

    const finalScore = totalWeight > 0 ? Math.round(totalScore / totalWeight) : 0;
    const overallStatus = finalScore >= 80 ? 'pass' : finalScore >= 60 ? 'warning' : 'fail';

    // Create evaluation record
    const evaluation = await FoodQualityEvaluation.create({
      productType,
      evaluatedBy: req.user._id,
      store: req.user.store._id,
      items: itemEvaluations,
      overallScore: finalScore,
      overallStatus,
      notes,
      photos: photos || []
    });

    res.json(evaluation);
  } catch (error) {
    logger.error('Error submitting food quality evaluation:', error);
    res.status(500).json({ message: 'Error submitting food quality evaluation' });
  }
};

// Get food quality evaluations
export const getEvaluations = async (req, res) => {
  try {
    const { productType, startDate, endDate, limit = 50 } = req.query;
    
    const query = { store: req.user.store._id };
    
    if (productType && productType !== 'all') {
      query.productType = productType;
    }
    
    if (startDate || endDate) {
      query.evaluatedAt = {};
      if (startDate) query.evaluatedAt.$gte = new Date(startDate);
      if (endDate) query.evaluatedAt.$lte = new Date(endDate);
    }

    const evaluations = await FoodQualityEvaluation.find(query)
      .populate('evaluatedBy', 'name')
      .sort({ evaluatedAt: -1 })
      .limit(parseInt(limit));

    res.json(evaluations);
  } catch (error) {
    logger.error('Error getting food quality evaluations:', error);
    res.status(500).json({ message: 'Error getting food quality evaluations' });
  }
};

// Get evaluation analytics
export const getEvaluationAnalytics = async (req, res) => {
  try {
    const { productType, days = 30 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const query = {
      store: req.user.store._id,
      evaluatedAt: { $gte: startDate }
    };

    if (productType && productType !== 'all') {
      query.productType = productType;
    }

    const evaluations = await FoodQualityEvaluation.find(query);

    // Calculate analytics
    const analytics = {
      totalEvaluations: evaluations.length,
      averageScore: evaluations.length > 0 ?
        evaluations.reduce((sum, evaluation) => sum + evaluation.overallScore, 0) / evaluations.length : 0,
      passRate: evaluations.length > 0 ?
        (evaluations.filter(evaluation => evaluation.overallStatus === 'pass').length / evaluations.length) * 100 : 0,
      failRate: evaluations.length > 0 ?
        (evaluations.filter(evaluation => evaluation.overallStatus === 'fail').length / evaluations.length) * 100 : 0,
      warningRate: evaluations.length > 0 ?
        (evaluations.filter(evaluation => evaluation.overallStatus === 'warning').length / evaluations.length) * 100 : 0,
      byProductType: {},
      dailyTrends: []
    };

    // Group by product type
    const productTypes = [...new Set(evaluations.map(evaluation => evaluation.productType))];
    for (const type of productTypes) {
      const typeEvaluations = evaluations.filter(evaluation => evaluation.productType === type);
      analytics.byProductType[type] = {
        count: typeEvaluations.length,
        averageScore: typeEvaluations.reduce((sum, evaluation) => sum + evaluation.overallScore, 0) / typeEvaluations.length,
        passRate: (typeEvaluations.filter(evaluation => evaluation.overallStatus === 'pass').length / typeEvaluations.length) * 100
      };
    }

    res.json(analytics);
  } catch (error) {
    logger.error('Error getting evaluation analytics:', error);
    res.status(500).json({ message: 'Error getting evaluation analytics' });
  }
};
