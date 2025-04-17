import express from 'express';
import { auth } from '../middleware/auth.js';
import {
  getAllDocuments,
  getDocumentById,
  createDocument,
  updateDocument,
  deleteDocument,
  addFollowUp,
  addDocumentAttachment,
  getEmployeeDocuments,
  getAllDocumentRecords,
  acknowledgeDocument,
  completeFollowUp,
  sendDocumentEmail,
  sendUnacknowledgedNotification,
  getAllCombinedRecords
} from '../controllers/documentation.js';

const router = express.Router();

// All routes require authentication
router.use(auth);

// Debug middleware for route matching
router.use((req, res, next) => {
  console.log('Documentation Route Debug:', {
    url: req.url,
    method: req.method,
    params: req.params,
    path: req.path,
    baseUrl: req.baseUrl
  });
  next();
});

// Base routes
router.route('/')
  .get(getAllDocuments)
  .post(createDocument);

// Employee-specific route
router.get('/employee/:employeeId', getEmployeeDocuments);

// Get all documentation records
router.get('/all', getAllDocumentRecords);

// Get combined documentation and disciplinary records
router.get('/combined', getAllCombinedRecords);

// Specific action routes for documents
router.post('/:id/acknowledge', acknowledgeDocument);
router.post('/:id/follow-up', addFollowUp);
router.post('/:id/document', addDocumentAttachment);
router.post('/:id/send-email', sendDocumentEmail);
router.post('/:id/notify-unacknowledged', sendUnacknowledgedNotification);
router.post('/:id/follow-up/:followUpId/complete', completeFollowUp);

// Individual document routes
router.route('/:id')
  .get(getDocumentById)
  .put(updateDocument)
  .delete(deleteDocument);

export default router;
