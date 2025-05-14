import express from 'express';
import { auth } from '../middleware/auth.js';
import {
  getSettings,
  updateSettings,
  resetSettings,
  getStoreInfo,
  updateStoreInfo,
  getWasteItemPrices,
  updateWasteItemPrices,
  getCustomWasteItems,
  addCustomWasteItem,
  updateCustomWasteItem,
  deleteCustomWasteItem
} from '../controllers/settings.js';

const router = express.Router();

// All routes require authentication
router.use(auth);

// Get store settings
router.get('/', getSettings);

// Update settings
router.patch('/', updateSettings);

// Reset settings
router.post('/reset', resetSettings);

// Store routes
router.get('/store', getStoreInfo);
router.patch('/store', updateStoreInfo);

// Waste item prices routes
router.get('/waste-item-prices', getWasteItemPrices);
router.patch('/waste-item-prices', updateWasteItemPrices);

// Custom waste items routes
router.get('/custom-waste-items', getCustomWasteItems);
router.post('/custom-waste-items', addCustomWasteItem);
router.patch('/custom-waste-items/:itemId', updateCustomWasteItem);
router.delete('/custom-waste-items/:itemId', deleteCustomWasteItem);

export default router;