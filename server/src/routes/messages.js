import express from 'express';
import { auth } from '../middleware/auth.js';
import { isJonathonPope } from '../middleware/roles.js';
import {
  createMessage,
  getAllMessages,
  getMessageById,
  updateMessageStatus,
  getMessageStats,
  getUserMessages,
  getUserMessageById
} from '../controllers/messages.js';

const router = express.Router();

// Apply authentication to all routes
router.use(auth);

// User routes - any authenticated user can create and view their own messages
router.post('/', createMessage);
router.get('/my-messages', getUserMessages);
router.get('/my-messages/:id', getUserMessageById);

// Admin routes - only Jonathon Pope can access these
router.get('/', isJonathonPope, getAllMessages);
router.get('/stats', isJonathonPope, getMessageStats);
router.get('/:id', isJonathonPope, getMessageById);
router.put('/:id/status', isJonathonPope, updateMessageStatus);

export default router;
