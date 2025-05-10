import express from 'express';
import { auth } from '../middleware/auth.js';
import { isJonathonPope } from '../middleware/roles.js';
import {
  getAllStores,
  addStore,
  updateStoreStatus,
  getStoreUsers,
  addStoreUser,
  updateUserEmail,
  resetUserPassword
} from '../controllers/admin.js';

const router = express.Router();

// All routes require authentication and Jonathon Pope's access
router.use(auth);
router.use(isJonathonPope);

// Get all stores
router.get('/stores', getAllStores);

// Add a new store
router.post('/stores', addStore);

// Update store status
router.put('/stores/status', updateStoreStatus);

// Get store users and admins
router.get('/stores/:storeId/users', getStoreUsers);

// Add a user to a store
router.post('/stores/:storeId/users', addStoreUser);

// Update user email
router.put('/stores/:storeId/users/:userId/email', updateUserEmail);

// Reset user password
router.post('/stores/:storeId/users/:userId/reset-password', resetUserPassword);

export default router;
