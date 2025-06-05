import express from 'express';
import { auth } from '../middleware/auth.js';
import {
  getAllIncidents,
  getIncidentById,
  createIncident,
  updateIncident,
  deleteIncident,
  addFollowUp,
  addDocument,
  getEmployeeIncidents,
  getAllDisciplinaryIncidents,
  updateExistingIncidents,
  acknowledgeIncident,
  completeFollowUp,
  sendDisciplinaryEmail,
  sendUnacknowledgedNotification
} from '../controllers/disciplinary.js';

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
  .get(getAllIncidents)
  .post(createIncident);

// Employee-specific route
router.get('/employee/:employeeId', getEmployeeIncidents);

// Get all disciplinary incidents
router.get('/all', getAllDisciplinaryIncidents);

// Update existing incidents with store field
router.post('/update-store', updateExistingIncidents);

// Specific action routes for incidents
router.post('/:id/acknowledge', acknowledgeIncident);
router.post('/:id/follow-up', addFollowUp);
router.post('/:id/document', addDocument);
router.post('/:id/send-email', sendDisciplinaryEmail);
router.post('/:id/notify-unacknowledged', sendUnacknowledgedNotification);
router.post('/:id/follow-up/:followUpId/complete', completeFollowUp);

// Refresh document URLs
router.post('/:id/refresh-urls', async (req, res) => {
  try {
    const { generateSignedUrl } = await import('../config/s3.js');
    const Disciplinary = (await import('../models/Disciplinary.js')).default;

    const incident = await Disciplinary.findById(req.params.id);
    if (!incident) {
      return res.status(404).json({ message: 'Incident not found' });
    }

    // Refresh URLs for all documents with S3 keys
    for (const doc of incident.documents) {
      if (doc.s3Key) {
        try {
          const freshUrl = await generateSignedUrl(doc.s3Key, 3600);
          doc.url = freshUrl;
        } catch (error) {
          console.error(`Failed to refresh URL for document ${doc._id}:`, error);
        }
      }
    }

    await incident.save();
    res.json({ message: 'URLs refreshed successfully', incident });
  } catch (error) {
    console.error('Error refreshing URLs:', error);
    res.status(500).json({ message: 'Failed to refresh URLs' });
  }
});

// Individual incident routes - MUST come last
router.route('/:id')
  .get(getIncidentById)
  .put(updateIncident)
  .delete(deleteIncident);

export default router;