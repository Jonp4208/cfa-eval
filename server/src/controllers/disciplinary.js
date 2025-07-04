import Disciplinary from '../models/Disciplinary.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import { handleAsync } from '../utils/errorHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { sendEmail } from '../utils/email.js';
import logger from '../utils/logger.js';
import { generateSignedUrl } from '../config/s3.js';

// Utility function to refresh expired document URLs
const refreshDocumentUrls = async (documents) => {
  if (!documents || documents.length === 0) return documents;

  for (const doc of documents) {
    if (doc.s3Key) {
      try {
        // Generate a fresh URL with 1 hour expiration
        const freshUrl = await generateSignedUrl(doc.s3Key, 3600);
        doc.url = freshUrl;
      } catch (error) {
        logger.error(`Failed to refresh URL for document ${doc._id}:`, error);
        // Keep the old URL if refresh fails
      }
    }
  }

  return documents;
};

// Get all disciplinary incidents
export const getAllIncidents = handleAsync(async (req, res) => {
  // First, update any incidents that need status correction
  await Disciplinary.updateMany(
    {
      $or: [
        { status: 'Open' },
        { status: { $exists: false } }
      ]
    },
    {
      $set: {
        status: 'Pending Acknowledgment',
      }
    }
  );

  // Build query based on user position and store
  const { store, position, _id } = req.user;
  let query = { store };

  // Check if user has restricted access (Team Member or Trainer)
  const hasRestrictedAccess = ['Team Member', 'Trainer'].includes(position);

  // If user has restricted access, only show their own incidents
  if (hasRestrictedAccess) {
    query.employee = _id;
  }

  // Only log minimal information at debug level
  logger.debug(`Disciplinary: Fetching incidents for store ${store._id}`);

  // Get incidents based on the query
  const incidents = await Disciplinary.find(query)
    .populate('employee', 'name position department')
    .populate('supervisor', 'name')
    .populate('createdBy', 'name')
    .sort('-createdAt');

  // Log only the count, not the details
  logger.debug(`Disciplinary: Found ${incidents.length} incidents`);

  res.json(incidents);
});

// Get a single incident by ID
export const getIncidentById = handleAsync(async (req, res) => {
  const { position, _id } = req.user;

  const incident = await Disciplinary.findById(req.params.id)
    .populate('employee', 'name position department startDate')
    .populate('supervisor', 'name')
    .populate('createdBy', 'name')
    .populate('followUps.by', 'name');

  if (!incident) {
    return res.status(404).json({ message: 'Incident not found' });
  }

  // Check if user has restricted access (Team Member or Trainer)
  const hasRestrictedAccess = ['Team Member', 'Trainer'].includes(position);

  // If user has restricted access, verify they own the incident
  if (hasRestrictedAccess && incident.employee._id.toString() !== _id.toString()) {
    return res.status(403).json({ message: 'Not authorized to view this incident' });
  }

  // Refresh document URLs if they have S3 keys
  if (incident.documents && incident.documents.length > 0) {
    await refreshDocumentUrls(incident.documents);
  }

  res.json(incident);
});

// Create a new incident
export const createIncident = handleAsync(async (req, res) => {
  const {
    employeeId,
    date,
    type,
    severity,
    description,
    witnesses,
    actionTaken,
    followUpDate,
    followUpActions,
    previousIncidents,
    documentationAttached,
    notifyEmployee = true // Default to true if not provided
  } = req.body;

  // Get employee's supervisor
  const employee = await User.findById(employeeId).populate('store', 'name storeNumber');
  if (!employee) {
    return res.status(404).json({ message: 'Employee not found' });
  }

  const incident = await Disciplinary.create({
    employee: employeeId,
    date,
    type,
    severity,
    description,
    witnesses,
    actionTaken,
    followUpDate,
    followUpActions,
    previousIncidents,
    documentationAttached,
    notifyEmployee, // Add the notifyEmployee flag
    supervisor: employee.supervisor || req.user._id,
    createdBy: req.user._id,
    store: req.user.store,
    status: 'Pending Acknowledgment'
  });

  await incident.populate([
    { path: 'employee', select: 'name position department email' },
    { path: 'supervisor', select: 'name' },
    { path: 'createdBy', select: 'name' }
  ]);

  // Create notification for the employee only if notifyEmployee is true
  if (notifyEmployee) {
    await Notification.create({
      user: employee._id,
      store: req.user.store._id,
      type: 'disciplinary',
      priority: 'high',
      title: 'New Disciplinary Incident',
      message: `A ${severity.toLowerCase()} disciplinary incident has been created regarding ${type.toLowerCase()}.`,
      relatedId: incident._id,
      relatedModel: 'Disciplinary'
    });

    // Send email to employee if notifyEmployee is true
    if (incident.employee.email) {
      try {
        await sendEmail({
          to: incident.employee.email,
          subject: 'New Disciplinary Incident Created',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">
              <div style="background-color: #E4002B; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
                <h1 style="color: white; margin: 0;">New Disciplinary Incident</h1>
              </div>

              <div style="background-color: #f8f8f8; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
                <h2 style="color: #333; margin-top: 0;">Incident Details</h2>
                <p><strong>Date:</strong> ${new Date(date).toLocaleDateString()}</p>
                <p><strong>Type:</strong> ${type}</p>
                <p><strong>Severity:</strong> ${severity}</p>
                <p><strong>Created By:</strong> ${incident.createdBy.name}</p>
                <p><strong>Supervisor:</strong> ${incident.supervisor.name}</p>
              </div>

              <div style="margin-bottom: 30px;">
                <h2 style="color: #333;">Description</h2>
                <div style="background-color: #fff; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
                  <p style="margin: 0;">${description}</p>
                </div>
              </div>

              <div style="margin-bottom: 30px;">
                <h2 style="color: #333;">Action Taken</h2>
                <div style="background-color: #fff; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
                  <p style="margin: 0;">${actionTaken}</p>
                </div>
              </div>

              ${followUpDate ? `
                <div style="margin-bottom: 30px;">
                  <h2 style="color: #333;">Follow-up Information</h2>
                  <div style="background-color: #fff; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
                    <p><strong>Follow-up Date:</strong> ${new Date(followUpDate).toLocaleDateString()}</p>
                    ${followUpActions ? `<p><strong>Follow-up Actions:</strong> ${followUpActions}</p>` : ''}
                  </div>
                </div>
              ` : ''}

              <p style="margin-top: 30px;">
                Please log in to the LD Growth platform to acknowledge this incident and provide any comments.
              </p>
              <p>Best regards,<br>LD Growth Team</p>
            </div>
          `
        });
        console.log('Disciplinary incident email sent to employee:', incident.employee.email);
      } catch (emailError) {
        console.error('Failed to send disciplinary incident email:', emailError);
        // Don't throw the error, just log it - we don't want to fail the incident creation
      }
    }
  }

  // Get all managers in the store
  const managers = await User.find({
    store: req.user.store._id,
    role: { $in: ['admin', 'evaluator'] },
    _id: { $ne: req.user._id } // Exclude the creator
  });

  // Create notifications for all managers
  await Promise.all(managers.map(manager =>
    Notification.create({
      user: manager._id,
      store: req.user.store._id,
      type: 'disciplinary',
      title: 'New Disciplinary Incident Created',
      message: `${req.user.name} created a ${severity.toLowerCase()} disciplinary incident for ${employee.name} regarding ${type.toLowerCase()}.`,
      relatedId: incident._id,
      relatedModel: 'Disciplinary'
    })
  ));

  res.status(201).json(incident);
});

// Update an incident
export const updateIncident = handleAsync(async (req, res) => {
  const incident = await Disciplinary.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  ).populate([
    { path: 'employee', select: 'firstName lastName position department' },
    { path: 'supervisor', select: 'firstName lastName' },
    { path: 'createdBy', select: 'firstName lastName' }
  ]);

  if (!incident) {
    return res.status(404).json({ message: 'Incident not found' });
  }

  res.json(incident);
});

// Acknowledge incident
export const acknowledgeIncident = handleAsync(async (req, res) => {
  const { comments, rating } = req.body;
  const { id } = req.params;

  const incident = await Disciplinary.findOne({
    _id: id,
    employee: req.user._id,
    'acknowledgment.acknowledged': { $ne: true }
  })
  .populate('employee', 'name position')
  .populate('supervisor', 'name')
  .populate({
    path: 'store',
    select: 'name storeEmail storeNumber'
  });

  if (!incident) {
    throw new ApiError(404, 'Incident not found or already acknowledged');
  }

  console.log('Found incident for acknowledgment:', {
    id: incident._id,
    employee: incident.employee?.name,
    store: incident.store,
    hasStoreEmail: !!incident.store?.storeEmail
  });

  incident.acknowledgment = {
    acknowledged: true,
    date: new Date(),
    comments,
    rating
  };

  if (incident.requiresFollowUp) {
    incident.status = 'Pending Follow-up';
  } else {
    incident.status = 'Resolved';
  }

  await incident.save();

  // Create notification for the supervisor
  await Notification.create({
    user: incident.supervisor,
    store: req.user.store._id,
    type: 'disciplinary',
    title: 'Disciplinary Incident Acknowledged',
    message: `${req.user.name} has acknowledged the ${incident.severity.toLowerCase()} disciplinary incident.`,
    relatedId: incident._id,
    relatedModel: 'Disciplinary'
  });

  // Send email to store if store email is configured
  if (incident.store?.storeEmail) {
    try {
      console.log('Attempting to send email to store:', incident.store.storeEmail);
      await sendEmail({
        to: incident.store.storeEmail,
        subject: `Disciplinary Incident Acknowledged - ${incident.employee.name}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">
            <div style="background-color: #E4002B; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
              <h1 style="color: white; margin: 0;">Disciplinary Incident Acknowledgment</h1>
            </div>

            <div style="background-color: #f8f8f8; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
              <h2 style="color: #333; margin-top: 0;">Incident Details</h2>
              <p><strong>Employee:</strong> ${incident.employee.name} (${incident.employee.position})</p>
              <p><strong>Supervisor:</strong> ${incident.supervisor.name}</p>
              <p><strong>Acknowledgment Date:</strong> ${new Date().toLocaleDateString()}</p>
              <p><strong>Type:</strong> ${incident.type}</p>
              <p><strong>Severity:</strong> ${incident.severity}</p>
            </div>

            <div style="margin-bottom: 30px;">
              <h2 style="color: #333;">Incident Information</h2>
              <div style="background-color: #fff; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
                <h3 style="color: #333; margin-top: 0;">Description</h3>
                <p style="margin-bottom: 20px;">${incident.description}</p>

                <h3 style="color: #333;">Action Taken</h3>
                <p style="margin-bottom: 20px;">${incident.actionTaken}</p>

                ${incident.acknowledgment.comments ? `
                  <h3 style="color: #333;">Employee Comments</h3>
                  <p style="margin-bottom: 20px;">${incident.acknowledgment.comments}</p>
                ` : ''}

                ${incident.acknowledgment.rating ? `
                  <h3 style="color: #333;">Fairness Rating</h3>
                  <p>${incident.acknowledgment.rating} out of 5</p>
                ` : ''}
              </div>
            </div>

            <p style="margin-top: 30px;">
              For more details, please log in to the LD Growth platform.
            </p>
            <p>Best regards,<br>LD Growth Team</p>
          </div>
        `
      });
      console.log('Email sent successfully');
    } catch (emailError) {
      console.error('Failed to send store notification email:', emailError);
      // Continue execution - don't fail the acknowledgment
    }
  } else {
    console.log('No store email configured, skipping email notification');
  }

  res.json({ incident });
});

// Add follow-up
export const addFollowUp = handleAsync(async (req, res) => {
  const { id } = req.params;
  const { date, note, status } = req.body;

  const incident = await Disciplinary.findById(id);
  if (!incident) {
    return res.status(404).json({ message: 'Incident not found' });
  }

  incident.followUps.push({
    date,
    note,
    status,
    by: req.user._id
  });

  incident.status = 'Pending Acknowledgment';
  await incident.save();

  // Create notification for employee
  await Notification.create({
    user: incident.employee,
    store: req.user.store,
    type: 'disciplinary',
    title: 'Follow-up Added to Disciplinary Incident',
    message: `A follow-up has been added to your disciplinary incident. Please review and acknowledge.`,
    relatedId: incident._id,
    relatedModel: 'Disciplinary'
  });

  await incident.populate([
    { path: 'employee', select: 'name position department' },
    { path: 'supervisor', select: 'name' },
    { path: 'createdBy', select: 'name' },
    { path: 'followUps.by', select: 'name' }
  ]);

  res.json(incident);
});

// Complete follow-up
export const completeFollowUp = handleAsync(async (req, res) => {
  const { id, followUpId } = req.params;
  const { note } = req.body;

  const incident = await Disciplinary.findById(id);
  if (!incident) {
    return res.status(404).json({ message: 'Incident not found' });
  }

  const followUp = incident.followUps.id(followUpId);
  if (!followUp) {
    return res.status(404).json({ message: 'Follow-up not found' });
  }

  followUp.status = 'Completed';
  followUp.note = note;
  incident.status = 'Pending Acknowledgment';

  await incident.save();

  // Create notification for employee
  await Notification.create({
    user: incident.employee,
    store: req.user.store,
    type: 'disciplinary',
    title: 'Follow-up Completed',
    message: `The follow-up for your disciplinary incident has been completed. Please review and acknowledge.`,
    relatedId: incident._id,
    relatedModel: 'Disciplinary'
  });

  await incident.populate([
    { path: 'employee', select: 'name position department' },
    { path: 'supervisor', select: 'name' },
    { path: 'createdBy', select: 'name' },
    { path: 'followUps.by', select: 'name' }
  ]);

  res.json(incident);
});

// Add a document to an incident
export const addDocument = handleAsync(async (req, res) => {
  const { name, type, url, s3Key } = req.body;

  const incident = await Disciplinary.findById(req.params.id);
  if (!incident) {
    return res.status(404).json({ message: 'Incident not found' });
  }

  const documentData = {
    name,
    type,
    url,
    uploadedBy: req.user._id
  };

  // Add S3 key if provided
  if (s3Key) {
    documentData.s3Key = s3Key;
  }

  incident.documents.push(documentData);

  await incident.save();
  await incident.populate('documents.uploadedBy', 'firstName lastName');

  res.json(incident);
});

// Delete an incident
export const deleteIncident = handleAsync(async (req, res) => {
  const incident = await Disciplinary.findByIdAndDelete(req.params.id);

  if (!incident) {
    return res.status(404).json({ message: 'Incident not found' });
  }

  res.status(204).send();
});

// Get all disciplinary incidents for a specific employee
export const getEmployeeIncidents = handleAsync(async (req, res) => {
  const { position, _id } = req.user;
  const employeeId = req.params.employeeId;

  // Check if user has restricted access (Team Member or Trainer)
  const hasRestrictedAccess = ['Team Member', 'Trainer'].includes(position);
  
  // Check if user is leadership (can see all documents)
  const isLeadership = ['Leader', 'Director'].includes(position);

  // If user has restricted access, they can only view their own incidents
  if (hasRestrictedAccess && employeeId !== _id.toString()) {
    return res.status(403).json({ message: 'Not authorized to view these incidents' });
  }

  // Build the query
  let query = { employee: employeeId };
  
  // If viewing your own record and you're not leadership, or if you're not leadership viewing someone else's record,
  // filter out incidents marked as not to be shown to employees
  if (!isLeadership && (employeeId === _id.toString() || !isLeadership)) {
    query.notifyEmployee = { $ne: false };
  }

  console.log('Getting incidents for employee:', employeeId, 'Query:', JSON.stringify(query));
  const incidents = await Disciplinary.find(query)
    .populate('employee', 'name position department')
    .populate('supervisor', 'name')
    .populate('createdBy', 'name')
    .sort('-createdAt');

  console.log('Found incidents:', incidents.length);
  res.json(incidents);
});

// Get all disciplinary incidents
export const getAllDisciplinaryIncidents = async (req, res) => {
    try {
        const { store } = req.user;
        console.log('Getting all disciplinary incidents for store:', store);

        const incidents = await Disciplinary.find({ store })
            .populate('employee', 'name')
            .populate('supervisor', 'name')
            .sort('-date');

        console.log('Found incidents:', incidents);

        res.json(incidents);
    } catch (error) {
        console.error('Error getting disciplinary incidents:', error);
        res.status(500).json({
            message: 'Error getting disciplinary incidents',
            error: error.message
        });
    }
};

// Update existing incidents with proper status
export const updateExistingIncidents = handleAsync(async (req, res) => {
  const { store } = req.user;

  // Update all incidents that have 'Open' status or no status
  const result = await Disciplinary.updateMany(
    {
      $or: [
        { status: 'Open' },
        { status: { $exists: false } }
      ]
    },
    {
      $set: {
        status: 'Pending Acknowledgment',
      }
    }
  );

  res.json({
    message: 'Updated existing incidents',
    modifiedCount: result.modifiedCount
  });
});

// Send email for disciplinary incident
export const sendDisciplinaryEmail = handleAsync(async (req, res) => {
  const { id } = req.params;

  const incident = await Disciplinary.findOne({ _id: id, store: req.user.store._id })
    .populate('employee', 'name position')
    .populate('supervisor', 'name')
    .populate('store', 'name storeEmail storeNumber');

  if (!incident) {
    throw new ApiError(404, 'Incident not found');
  }

  if (!incident.store?.storeEmail) {
    throw new ApiError(400, 'Store email not configured');
  }

  await sendEmail({
    to: incident.store.storeEmail,
    subject: `Disciplinary Incident Report - ${incident.employee.name}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #E4002B; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
          <h1 style="color: white; margin: 0;">Disciplinary Incident Report</h1>
        </div>

        <div style="background-color: #f8f8f8; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
          <h2 style="color: #333; margin-top: 0;">Incident Details</h2>
          <p><strong>Employee:</strong> ${incident.employee.name} (${incident.employee.position})</p>
          <p><strong>Supervisor:</strong> ${incident.supervisor.name}</p>
          <p><strong>Date:</strong> ${new Date(incident.date).toLocaleDateString()}</p>
          <p><strong>Type:</strong> ${incident.type}</p>
          <p><strong>Severity:</strong> ${incident.severity}</p>
          <p><strong>Status:</strong> ${incident.status}</p>
        </div>

        <div style="margin-bottom: 30px;">
          <h2 style="color: #333;">Incident Information</h2>
          <div style="background-color: #fff; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
            <h3 style="color: #333; margin-top: 0;">Description</h3>
            <p style="margin-bottom: 20px;">${incident.description}</p>

            <h3 style="color: #333;">Action Taken</h3>
            <p style="margin-bottom: 20px;">${incident.actionTaken}</p>

            ${incident.witnesses ? `
              <h3 style="color: #333;">Witnesses</h3>
              <p style="margin-bottom: 20px;">${incident.witnesses}</p>
            ` : ''}

            ${incident.acknowledgment?.acknowledged ? `
              <h3 style="color: #333;">Acknowledgment</h3>
              <p><strong>Date:</strong> ${new Date(incident.acknowledgment.date).toLocaleDateString()}</p>
              ${incident.acknowledgment.comments ? `
                <p><strong>Employee Comments:</strong> ${incident.acknowledgment.comments}</p>
              ` : ''}
              ${incident.acknowledgment.rating ? `
                <p><strong>Fairness Rating:</strong> ${incident.acknowledgment.rating} out of 5</p>
              ` : ''}
            ` : ''}
          </div>
        </div>

        ${incident.followUps.length > 0 ? `
          <div style="margin-bottom: 30px;">
            <h2 style="color: #333;">Follow-up Actions</h2>
            <div style="background-color: #fff; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
              ${incident.followUps.map(followUp => `
                <div style="margin-bottom: 15px; padding-bottom: 15px; border-bottom: 1px solid #eee;">
                  <p><strong>Date:</strong> ${new Date(followUp.date).toLocaleDateString()}</p>
                  <p><strong>By:</strong> ${followUp.by.name}</p>
                  <p><strong>Status:</strong> ${followUp.status}</p>
                  <p><strong>Note:</strong> ${followUp.note}</p>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}

        <p style="margin-top: 30px;">
          For more details, please log in to the LD Growth platform.
        </p>
        <p>Best regards,<br>LD Growth Team</p>
      </div>
    `
  });

  res.json({ message: 'Email sent successfully' });
});

// Send notification for unacknowledged disciplinary incident
export const sendUnacknowledgedNotification = handleAsync(async (req, res) => {
  const { id } = req.params;

  console.log('Attempting to send unacknowledged notification for incident:', id);

  const incident = await Disciplinary.findOne({
    _id: id,
    status: 'Pending Acknowledgment',
    $or: [
      { 'acknowledgment.acknowledged': false },
      { 'acknowledgment.acknowledged': { $exists: false } }
    ]
  })
  .populate('employee', 'name email')
  .populate('supervisor', 'name');

  if (!incident) {
    throw new ApiError(404, 'Incident not found or already acknowledged');
  }

  // Create notification for the employee
  await Notification.create({
    user: incident.employee._id,
    store: req.user.store._id,
    type: 'disciplinary',
    priority: 'high',
    title: 'Disciplinary Acknowledgement Required',
    message: `Please acknowledge the ${incident.severity.toLowerCase()} disciplinary incident regarding ${incident.type.toLowerCase()}.`,
    relatedId: incident._id,
    relatedModel: 'Disciplinary'
  });

  // Send email to employee if email is available
  if (incident.employee.email) {
    try {
      await sendEmail({
        to: incident.employee.email,
        subject: 'Action Required: Disciplinary Acknowledgment',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">
            <div style="background-color: #E4002B; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
              <h1 style="color: white; margin: 0;">Disciplinary Acknowledgment Required</h1>
            </div>

            <div style="background-color: #f8f8f8; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
              <h2 style="color: #333; margin-top: 0;">Incident Details</h2>
              <p><strong>Type:</strong> ${incident.type}</p>
              <p><strong>Severity:</strong> ${incident.severity}</p>
              <p><strong>Date:</strong> ${new Date(incident.date).toLocaleDateString()}</p>
              <p><strong>Supervisor:</strong> ${incident.supervisor.name}</p>
            </div>

            <div style="margin-bottom: 30px;">
              <p>Please log in to acknowledge this disciplinary incident. Your acknowledgment is required to complete this process.</p>
              <p style="margin: 30px 0;">
                <a href="https://cfa-eval-app.vercel.app/disciplinary/${incident._id}"
                   style="display: inline-block; background-color: #E4002B; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 500;">
                  Acknowledge Incident
                </a>
              </p>
              <p>If the button above doesn't work, copy and paste this link into your browser:</p>
              <p>https://cfa-eval-app.vercel.app/disciplinary/${incident._id}</p>
            </div>

            <p style="color: #666; font-size: 14px;">
              This is an automated message. Please do not reply to this email.
            </p>
          </div>
        `
      });
      console.log('Acknowledgment reminder email sent to:', incident.employee.email);
    } catch (emailError) {
      console.error('Failed to send acknowledgment reminder email:', emailError);
      // Don't throw the error, just log it - we don't want to fail the notification creation
    }
  }

  res.json({
    message: 'Notification sent successfully'
  });
});