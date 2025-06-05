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
  deleteDocumentAttachment,
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

// Debug middleware for route matching - only log at debug level
router.use((req, res, next) => {
  // Skip detailed logging for the dashboard page
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
router.delete('/:id/document/:attachmentId', deleteDocumentAttachment);
router.post('/:id/send-email', sendDocumentEmail);
router.post('/:id/notify-unacknowledged', sendUnacknowledgedNotification);
router.post('/:id/follow-up/:followUpId/complete', completeFollowUp);

// Refresh document URLs
router.post('/:id/refresh-urls', async (req, res) => {
  try {
    const { generateSignedUrl } = await import('../config/s3.js');
    const Documentation = (await import('../models/Documentation.js')).default;

    const document = await Documentation.findById(req.params.id);
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    // Refresh URLs for all documents with S3 keys
    for (const doc of document.documents) {
      if (doc.s3Key) {
        try {
          const freshUrl = await generateSignedUrl(doc.s3Key, 3600);
          doc.url = freshUrl;
        } catch (error) {
          console.error(`Failed to refresh URL for document ${doc._id}:`, error);
        }
      }
    }

    await document.save();
    res.json({ message: 'URLs refreshed successfully', document });
  } catch (error) {
    console.error('Error refreshing URLs:', error);
    res.status(500).json({ message: 'Failed to refresh URLs' });
  }
});

// Individual document routes
router.route('/:id')
  .get(getDocumentById)
  .put(updateDocument)
  .delete(deleteDocument);

export default router;
