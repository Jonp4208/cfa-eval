import Documentation from '../models/Documentation.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import Disciplinary from '../models/Disciplinary.js';
import { handleAsync } from '../utils/errorHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { sendEmail } from '../utils/email.js';
import logger from '../utils/logger.js';
import { deleteFileFromS3 } from '../config/s3.js';

// Get all documentation and disciplinary records combined
export const getAllCombinedRecords = handleAsync(async (req, res) => {
  // Build query based on user position and store
  const { store, position, _id } = req.user;
  let query = { store };

  // Check if user has restricted access (Team Member or Trainer)
  const hasRestrictedAccess = ['Team Member', 'Trainer'].includes(position);

  // If user has restricted access, only show their own records
  if (hasRestrictedAccess) {
    query.employee = _id;
  }

  console.log('Documentation getAllCombinedRecords - User details:', {
    id: _id,
    name: req.user.name,
    position,
    hasRestrictedAccess,
    store
  });

  // Get documentation records
  const documentationRecords = await Documentation.find(query)
    .populate('employee', 'name position department')
    .populate('supervisor', 'name')
    .populate('createdBy', 'name')
    .sort('-createdAt');

  // Get disciplinary records
  const disciplinaryRecords = await Disciplinary.find(query)
    .populate('employee', 'name position department')
    .populate('supervisor', 'name')
    .populate('createdBy', 'name')
    .sort('-createdAt');

  console.log('Combined records count:', {
    documentation: documentationRecords.length,
    disciplinary: disciplinaryRecords.length,
    total: documentationRecords.length + disciplinaryRecords.length
  });

  // Return both sets of records
  res.json({
    documentation: documentationRecords,
    disciplinary: disciplinaryRecords
  });
});

// Get all documentation records
export const getAllDocuments = handleAsync(async (req, res) => {
  // First, update any documents that need status correction
  await Documentation.updateMany(
    {
      $or: [
        { status: 'Open' },
        { status: { $exists: false } }
      ]
    },
    {
      $set: {
        status: 'Documented',
      }
    }
  );

  // Build query based on user position and store
  const { store, position, _id } = req.user;
  let query = { store };

  // Check if user has restricted access (Team Member or Trainer)
  const hasRestrictedAccess = ['Team Member', 'Trainer'].includes(position);

  // If user has restricted access, only show their own documents
  if (hasRestrictedAccess) {
    query.employee = _id;
  }

  // Only log minimal information at debug level
  logger.debug(`Documentation: Fetching documents for store ${store._id}`);

  // Get documents based on the query
  const documents = await Documentation.find(query)
    .populate('employee', 'name position department')
    .populate('supervisor', 'name')
    .populate('createdBy', 'name')
    .sort('-createdAt');

  // Log only the count, not the details
  logger.debug(`Documentation: Found ${documents.length} documents`);

  res.json(documents);
});

// Get a single document by ID
export const getDocumentById = handleAsync(async (req, res) => {
  const { position, _id } = req.user;

  const document = await Documentation.findById(req.params.id)
    .populate('employee', 'name position department startDate')
    .populate('supervisor', 'name')
    .populate('createdBy', 'name')
    .populate('followUps.by', 'name');

  if (!document) {
    return res.status(404).json({ message: 'Document not found' });
  }

  // Check if user has restricted access (Team Member or Trainer)
  const hasRestrictedAccess = ['Team Member', 'Trainer'].includes(position);

  // If user has restricted access, verify they own the document
  if (hasRestrictedAccess && document.employee._id.toString() !== _id.toString()) {
    return res.status(403).json({ message: 'Not authorized to view this document' });
  }

  res.json(document);
});

// Create a new document
export const createDocument = handleAsync(async (req, res) => {
  const {
    employeeId,
    date,
    type,
    category,
    severity,
    description,
    witnesses,
    actionTaken,
    followUpDate,
    followUpActions,
    previousIncidents,
    documentationAttached
  } = req.body;

  // Get employee's supervisor
  const employee = await User.findById(employeeId).populate('store', 'name storeNumber');
  if (!employee) {
    return res.status(404).json({ message: 'Employee not found' });
  }

  // Set default status based on category
  let status = 'Documented';
  if (category === 'Disciplinary') {
    status = 'Pending Acknowledgment';
  }

  const document = await Documentation.create({
    employee: employeeId,
    date,
    type,
    category,
    severity,
    description,
    witnesses,
    actionTaken,
    followUpDate,
    followUpActions,
    previousIncidents,
    documentationAttached,
    supervisor: employee.supervisor || req.user._id,
    createdBy: req.user._id,
    store: req.user.store,
    status
  });

  await document.populate([
    { path: 'employee', select: 'name position department email' },
    { path: 'supervisor', select: 'name' },
    { path: 'createdBy', select: 'name' }
  ]);

  // Create notification for the employee
  await Notification.create({
    user: employee._id,
    store: req.user.store._id,
    type: 'documentation',
    priority: category === 'Disciplinary' ? 'high' : 'medium',
    title: `New ${category} Documentation`,
    message: `A new ${type.toLowerCase()} documentation has been created.`,
    relatedId: document._id,
    relatedModel: 'Documentation'
  });

  // Send email to employee for any documentation
  if (document.employee.email) {
    try {
      // Different email templates based on category
      if (category === 'Disciplinary') {
        await sendEmail({
          to: document.employee.email,
          subject: 'Important: New Disciplinary Documentation',
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>New Disciplinary Documentation</title>
            </head>
            <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333; background-color: #f9f9f9;">
              <table cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
                <!-- Header with Logo -->
                <tr>
                  <td style="background: linear-gradient(135deg, #E51636 0%, #DD0031 100%); padding: 30px; text-align: center;">
                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="font-size: 24px; font-weight: bold; color: white;">
                          Chick-fil-A
                        </td>
                      </tr>
                      <tr>
                        <td style="padding-top: 20px;">
                          <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 600;">Disciplinary Documentation</h1>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Main Content -->
                <tr>
                  <td style="padding: 30px 40px;">
                    <p style="font-size: 16px; line-height: 1.5; margin-bottom: 25px;">
                      Dear ${document.employee.name},
                    </p>
                    <p style="font-size: 16px; line-height: 1.5; margin-bottom: 25px;">
                      This email is to inform you that a new disciplinary documentation has been created regarding your employment. Please review the details below:
                    </p>

                    <!-- Document Details Card -->
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 25px; border-collapse: separate; border-radius: 8px; overflow: hidden; border: 1px solid #e0e0e0;">
                      <tr>
                        <td style="background-color: #f5f5f5; padding: 15px; border-bottom: 1px solid #e0e0e0;">
                          <h2 style="margin: 0; font-size: 18px; color: #E51636;">Document Details</h2>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 20px;">
                          <table width="100%" cellpadding="0" cellspacing="0" border="0">
                            <tr>
                              <td width="40%" style="padding: 8px 0; font-weight: 600; color: #555;">Date:</td>
                              <td width="60%" style="padding: 8px 0;">${new Date(date).toLocaleDateString()}</td>
                            </tr>
                            <tr>
                              <td width="40%" style="padding: 8px 0; font-weight: 600; color: #555;">Document Type:</td>
                              <td width="60%" style="padding: 8px 0;">${type}</td>
                            </tr>
                            <tr>
                              <td width="40%" style="padding: 8px 0; font-weight: 600; color: #555;">Severity:</td>
                              <td width="60%" style="padding: 8px 0;">${severity}</td>
                            </tr>
                            <tr>
                              <td width="40%" style="padding: 8px 0; font-weight: 600; color: #555;">Created By:</td>
                              <td width="60%" style="padding: 8px 0;">${document.createdBy.name}</td>
                            </tr>
                            <tr>
                              <td width="40%" style="padding: 8px 0; font-weight: 600; color: #555;">Supervisor:</td>
                              <td width="60%" style="padding: 8px 0;">${document.supervisor.name}</td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>

                    <!-- Description Card -->
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 25px; border-collapse: separate; border-radius: 8px; overflow: hidden; border: 1px solid #e0e0e0;">
                      <tr>
                        <td style="background-color: #f5f5f5; padding: 15px; border-bottom: 1px solid #e0e0e0;">
                          <h2 style="margin: 0; font-size: 18px; color: #E51636;">Description</h2>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 20px;">
                          <p style="margin: 0; line-height: 1.6;">${description}</p>
                        </td>
                      </tr>
                    </table>

                    <!-- Action Taken Card -->
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 25px; border-collapse: separate; border-radius: 8px; overflow: hidden; border: 1px solid #e0e0e0;">
                      <tr>
                        <td style="background-color: #f5f5f5; padding: 15px; border-bottom: 1px solid #e0e0e0;">
                          <h2 style="margin: 0; font-size: 18px; color: #E51636;">Action Taken</h2>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 20px;">
                          <p style="margin: 0; line-height: 1.6;">${actionTaken}</p>
                        </td>
                      </tr>
                    </table>

                    ${followUpDate ? `
                    <!-- Follow-up Card -->
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 25px; border-collapse: separate; border-radius: 8px; overflow: hidden; border: 1px solid #e0e0e0;">
                      <tr>
                        <td style="background-color: #f5f5f5; padding: 15px; border-bottom: 1px solid #e0e0e0;">
                          <h2 style="margin: 0; font-size: 18px; color: #E51636;">Follow-up Information</h2>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 20px;">
                          <table width="100%" cellpadding="0" cellspacing="0" border="0">
                            <tr>
                              <td width="40%" style="padding: 8px 0; font-weight: 600; color: #555;">Follow-up Date:</td>
                              <td width="60%" style="padding: 8px 0;">${new Date(followUpDate).toLocaleDateString()}</td>
                            </tr>
                            ${followUpActions ? `
                            <tr>
                              <td width="40%" style="padding: 8px 0; font-weight: 600; color: #555;">Follow-up Actions:</td>
                              <td width="60%" style="padding: 8px 0;">${followUpActions}</td>
                            </tr>
                            ` : ''}
                          </table>
                        </td>
                      </tr>
                    </table>
                    ` : ''}

                    <p style="font-size: 16px; line-height: 1.5; margin-bottom: 25px;">
                      <strong>Important:</strong> Please log in to the LD Growth platform to acknowledge this document and provide any comments or additional information.
                    </p>

                    <!-- CTA Button -->
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 30px;">
                      <tr>
                        <td align="center">
                          <a href="https://cfa-eval-7eb74e14c3a4.herokuapp.com/" style="display: inline-block; padding: 12px 30px; background-color: #E51636; color: white; text-decoration: none; font-weight: 600; border-radius: 4px; font-size: 16px;">View Document</a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="background-color: #f5f5f5; padding: 20px 40px; text-align: center; border-top: 1px solid #e0e0e0;">
                    <p style="margin: 0; font-size: 14px; color: #777; line-height: 1.5;">
                      This is an automated message from the LD Growth platform.<br>
                      Please do not reply to this email.
                    </p>
                    <p style="margin: 15px 0 0; font-size: 14px; color: #777;">
                      &copy; ${new Date().getFullYear()} Chick-fil-A. All rights reserved.
                    </p>
                  </td>
                </tr>
              </table>
            </body>
            </html>
          `
        });
        console.log('Disciplinary document email sent to employee:', document.employee.email);
      } else if (category === 'Administrative') {
        // Administrative document email template
        await sendEmail({
          to: document.employee.email,
          subject: `Administrative Documentation: ${type}`,
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Administrative Documentation</title>
            </head>
            <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333; background-color: #f9f9f9;">
              <table cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
                <!-- Header with Logo -->
                <tr>
                  <td style="background: linear-gradient(135deg, #E51636 0%, #DD0031 100%); padding: 30px; text-align: center;">
                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="font-size: 24px; font-weight: bold; color: white;">
                          Chick-fil-A
                        </td>
                      </tr>
                      <tr>
                        <td style="padding-top: 20px;">
                          <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 600;">Administrative Documentation</h1>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Main Content -->
                <tr>
                  <td style="padding: 30px 40px;">
                    <p style="font-size: 16px; line-height: 1.5; margin-bottom: 25px;">
                      Dear ${document.employee.name},
                    </p>
                    <p style="font-size: 16px; line-height: 1.5; margin-bottom: 25px;">
                      This email is to inform you that a new administrative document (${type}) has been added to your employee record. Please review the details below:
                    </p>

                    <!-- Document Details Card -->
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 25px; border-collapse: separate; border-radius: 8px; overflow: hidden; border: 1px solid #e0e0e0;">
                      <tr>
                        <td style="background-color: #f5f5f5; padding: 15px; border-bottom: 1px solid #e0e0e0;">
                          <h2 style="margin: 0; font-size: 18px; color: #E51636;">Document Details</h2>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 20px;">
                          <table width="100%" cellpadding="0" cellspacing="0" border="0">
                            <tr>
                              <td width="40%" style="padding: 8px 0; font-weight: 600; color: #555;">Date:</td>
                              <td width="60%" style="padding: 8px 0;">${new Date(date).toLocaleDateString()}</td>
                            </tr>
                            <tr>
                              <td width="40%" style="padding: 8px 0; font-weight: 600; color: #555;">Document Type:</td>
                              <td width="60%" style="padding: 8px 0;">${type}</td>
                            </tr>
                            <tr>
                              <td width="40%" style="padding: 8px 0; font-weight: 600; color: #555;">Created By:</td>
                              <td width="60%" style="padding: 8px 0;">${document.createdBy.name}</td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>

                    ${description ? `
                    <!-- Description Card -->
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 25px; border-collapse: separate; border-radius: 8px; overflow: hidden; border: 1px solid #e0e0e0;">
                      <tr>
                        <td style="background-color: #f5f5f5; padding: 15px; border-bottom: 1px solid #e0e0e0;">
                          <h2 style="margin: 0; font-size: 18px; color: #E51636;">Description</h2>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 20px;">
                          <p style="margin: 0; line-height: 1.6;">${description}</p>
                        </td>
                      </tr>
                    </table>
                    ` : ''}

                    ${followUpDate ? `
                    <!-- Follow-up Card -->
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 25px; border-collapse: separate; border-radius: 8px; overflow: hidden; border: 1px solid #e0e0e0;">
                      <tr>
                        <td style="background-color: #f5f5f5; padding: 15px; border-bottom: 1px solid #e0e0e0;">
                          <h2 style="margin: 0; font-size: 18px; color: #E51636;">Follow-up Information</h2>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 20px;">
                          <table width="100%" cellpadding="0" cellspacing="0" border="0">
                            <tr>
                              <td width="40%" style="padding: 8px 0; font-weight: 600; color: #555;">Follow-up Date:</td>
                              <td width="60%" style="padding: 8px 0;">${new Date(followUpDate).toLocaleDateString()}</td>
                            </tr>
                            ${followUpActions ? `
                            <tr>
                              <td width="40%" style="padding: 8px 0; font-weight: 600; color: #555;">Follow-up Actions:</td>
                              <td width="60%" style="padding: 8px 0;">${followUpActions}</td>
                            </tr>
                            ` : ''}
                          </table>
                        </td>
                      </tr>
                    </table>
                    ` : ''}

                    <p style="font-size: 16px; line-height: 1.5; margin-bottom: 25px;">
                      This document has been added to your employee record. You can view the complete details by logging into the LD Growth platform.
                    </p>

                    <!-- CTA Button -->
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 30px;">
                      <tr>
                        <td align="center">
                          <a href="https://cfa-eval-7eb74e14c3a4.herokuapp.com/" style="display: inline-block; padding: 12px 30px; background-color: #E51636; color: white; text-decoration: none; font-weight: 600; border-radius: 4px; font-size: 16px;">View Document</a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="background-color: #f5f5f5; padding: 20px 40px; text-align: center; border-top: 1px solid #e0e0e0;">
                    <p style="margin: 0; font-size: 14px; color: #777; line-height: 1.5;">
                      This is an automated message from the LD Growth platform.<br>
                      Please do not reply to this email.
                    </p>
                    <p style="margin: 15px 0 0; font-size: 14px; color: #777;">
                      &copy; ${new Date().getFullYear()} Chick-fil-A. All rights reserved.
                    </p>
                  </td>
                </tr>
              </table>
            </body>
            </html>
          `
        });
        console.log('Administrative document email sent to employee:', document.employee.email);
      }
    } catch (emailError) {
      console.error(`Failed to send ${category.toLowerCase()} document email:`, emailError);
      // Don't throw the error, just log it - we don't want to fail the document creation
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
      type: 'documentation',
      title: `New ${category} Documentation Created`,
      message: `${req.user.name} created a new ${type.toLowerCase()} documentation for ${employee.name}.`,
      relatedId: document._id,
      relatedModel: 'Documentation'
    })
  ));

  res.status(201).json(document);
});

// Update a document
export const updateDocument = handleAsync(async (req, res) => {
  const document = await Documentation.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  ).populate([
    { path: 'employee', select: 'firstName lastName position department' },
    { path: 'supervisor', select: 'firstName lastName' },
    { path: 'createdBy', select: 'firstName lastName' }
  ]);

  if (!document) {
    return res.status(404).json({ message: 'Document not found' });
  }

  res.json(document);
});

// Acknowledge document
export const acknowledgeDocument = handleAsync(async (req, res) => {
  const { comments, rating } = req.body;
  const { id } = req.params;

  const document = await Documentation.findOne({
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

  if (!document) {
    throw new ApiError(404, 'Document not found or already acknowledged');
  }

  console.log('Found document for acknowledgment:', {
    id: document._id,
    employee: document.employee?.name,
    store: document.store,
    hasStoreEmail: !!document.store?.storeEmail
  });

  document.acknowledgment = {
    acknowledged: true,
    date: new Date(),
    comments,
    rating
  };

  if (document.requiresFollowUp) {
    document.status = 'Pending Follow-up';
  } else {
    document.status = 'Resolved';
  }

  await document.save();

  // Create notification for the supervisor
  await Notification.create({
    user: document.supervisor,
    store: req.user.store._id,
    type: 'documentation',
    title: 'Document Acknowledged',
    message: `${req.user.name} has acknowledged the ${document.type.toLowerCase()} document.`,
    relatedId: document._id,
    relatedModel: 'Documentation'
  });

  // Send email to store if store email is configured
  if (document.store?.storeEmail) {
    try {
      console.log('Attempting to send email to store:', document.store.storeEmail);
      await sendEmail({
        to: document.store.storeEmail,
        subject: `Document Acknowledged - ${document.employee.name}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">
            <div style="background-color: #E4002B; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
              <h1 style="color: white; margin: 0;">Document Acknowledgment</h1>
            </div>

            <div style="background-color: #f8f8f8; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
              <h2 style="color: #333; margin-top: 0;">Document Details</h2>
              <p><strong>Employee:</strong> ${document.employee.name} (${document.employee.position})</p>
              <p><strong>Supervisor:</strong> ${document.supervisor.name}</p>
              <p><strong>Acknowledgment Date:</strong> ${new Date().toLocaleDateString()}</p>
              <p><strong>Type:</strong> ${document.type}</p>
              <p><strong>Category:</strong> ${document.category}</p>
            </div>

            <div style="margin-bottom: 30px;">
              <h2 style="color: #333;">Document Information</h2>
              <div style="background-color: #fff; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
                <h3 style="color: #333; margin-top: 0;">Description</h3>
                <p style="margin-bottom: 20px;">${document.description}</p>

                ${document.actionTaken ? `
                  <h3 style="color: #333;">Action Taken</h3>
                  <p style="margin-bottom: 20px;">${document.actionTaken}</p>
                ` : ''}

                ${document.acknowledgment.comments ? `
                  <h3 style="color: #333;">Employee Comments</h3>
                  <p style="margin-bottom: 20px;">${document.acknowledgment.comments}</p>
                ` : ''}

                ${document.acknowledgment.rating ? `
                  <h3 style="color: #333;">Fairness Rating</h3>
                  <p>${document.acknowledgment.rating} out of 5</p>
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

  res.json({ document });
});

// Add follow-up
export const addFollowUp = handleAsync(async (req, res) => {
  const { id } = req.params;
  const { date, note, status } = req.body;

  const document = await Documentation.findById(id);
  if (!document) {
    return res.status(404).json({ message: 'Document not found' });
  }

  document.followUps.push({
    date,
    note,
    status,
    by: req.user._id
  });

  if (document.category === 'Disciplinary') {
    document.status = 'Pending Acknowledgment';
  } else {
    document.status = 'Documented';
  }

  await document.save();

  // Create notification for employee
  await Notification.create({
    user: document.employee,
    store: req.user.store,
    type: 'documentation',
    title: 'Follow-up Added to Document',
    message: `A follow-up has been added to your ${document.type.toLowerCase()} document.`,
    relatedId: document._id,
    relatedModel: 'Documentation'
  });

  await document.populate([
    { path: 'employee', select: 'name position department' },
    { path: 'supervisor', select: 'name' },
    { path: 'createdBy', select: 'name' },
    { path: 'followUps.by', select: 'name' }
  ]);

  res.json(document);
});

// Complete follow-up
export const completeFollowUp = handleAsync(async (req, res) => {
  const { id, followUpId } = req.params;
  const { note } = req.body;

  const document = await Documentation.findById(id);
  if (!document) {
    return res.status(404).json({ message: 'Document not found' });
  }

  const followUp = document.followUps.id(followUpId);
  if (!followUp) {
    return res.status(404).json({ message: 'Follow-up not found' });
  }

  followUp.status = 'Completed';
  followUp.note = note;

  if (document.category === 'Disciplinary') {
    document.status = 'Pending Acknowledgment';
  } else {
    document.status = 'Documented';
  }

  await document.save();

  // Create notification for employee
  await Notification.create({
    user: document.employee,
    store: req.user.store,
    type: 'documentation',
    title: 'Follow-up Completed',
    message: `The follow-up for your ${document.type.toLowerCase()} document has been completed.`,
    relatedId: document._id,
    relatedModel: 'Documentation'
  });

  await document.populate([
    { path: 'employee', select: 'name position department' },
    { path: 'supervisor', select: 'name' },
    { path: 'createdBy', select: 'name' },
    { path: 'followUps.by', select: 'name' }
  ]);

  res.json(document);
});

// Add a document attachment
export const addDocumentAttachment = handleAsync(async (req, res) => {
  const { name, type, category, url } = req.body;

  const document = await Documentation.findById(req.params.id);
  if (!document) {
    return res.status(404).json({ message: 'Document not found' });
  }

  document.documents.push({
    name,
    type,
    category,
    url,
    uploadedBy: req.user._id
  });

  await document.save();
  await document.populate('documents.uploadedBy', 'name');

  res.json(document);
});

// Delete a document
export const deleteDocument = handleAsync(async (req, res) => {
  const document = await Documentation.findByIdAndDelete(req.params.id);

  if (!document) {
    return res.status(404).json({ message: 'Document not found' });
  }

  res.status(204).send();
});

// Delete a document attachment
export const deleteDocumentAttachment = handleAsync(async (req, res) => {
  const { id, attachmentId } = req.params;

  // Find the document
  const document = await Documentation.findById(id);
  if (!document) {
    return res.status(404).json({ message: 'Document not found' });
  }

  // Find the attachment
  const attachment = document.documents.id(attachmentId);
  if (!attachment) {
    return res.status(404).json({ message: 'Attachment not found' });
  }

  // Extract the S3 key from the URL
  // The key is the filename part after the last slash and before any query parameters
  let key = null;
  try {
    const url = new URL(attachment.url);
    const pathname = url.pathname;
    // The key is typically the last part of the path
    const matches = pathname.match(/\/([^\/]+)$/);
    if (matches && matches[1]) {
      key = decodeURIComponent(matches[1]);
    } else {
      // If we can't extract the key from the pathname, try to get it from the query parameters
      // AWS S3 signed URLs often have the key in the X-Amz-SignedHeaders parameter
      key = url.searchParams.get('X-Amz-SignedHeaders');
    }
  } catch (error) {
    logger.error('Error parsing attachment URL:', error);
    // If we can't parse the URL, try to extract the key from the raw URL string
    // The key is typically after the bucket name in the URL
    const urlParts = attachment.url.split('/');
    key = urlParts[urlParts.length - 1].split('?')[0]; // Get the last part before any query params
  }

  // Try to delete the file from S3 if we have a key
  if (key) {
    try {
      await deleteFileFromS3(key);
      logger.info(`Successfully deleted file from S3: ${key}`);
    } catch (error) {
      logger.error(`Error deleting file from S3: ${key}`, error);
      // Continue with removing the attachment from the document even if S3 deletion fails
    }
  } else {
    logger.warn(`Could not extract S3 key from URL: ${attachment.url}`);
  }

  // Remove the attachment from the document
  document.documents.pull(attachmentId);
  await document.save();

  res.json({ message: 'Document attachment deleted successfully' });
});

// Get all documents for a specific employee
export const getEmployeeDocuments = handleAsync(async (req, res) => {
  const { position, _id } = req.user;
  const employeeId = req.params.employeeId;

  // Check if user has restricted access (Team Member or Trainer)
  const hasRestrictedAccess = ['Team Member', 'Trainer'].includes(position);

  // If user has restricted access, they can only view their own documents
  if (hasRestrictedAccess && employeeId !== _id.toString()) {
    return res.status(403).json({ message: 'Not authorized to view these documents' });
  }

  console.log('Getting documents for employee:', employeeId);
  const documents = await Documentation.find({ employee: employeeId })
    .populate('employee', 'name position department')
    .populate('supervisor', 'name')
    .populate('createdBy', 'name')
    .sort('-createdAt');

  console.log('Found documents:', documents);
  res.json(documents);
});

// Get all documents
export const getAllDocumentRecords = async (req, res) => {
    try {
        const { store } = req.user;
        console.log('Getting all documents for store:', store);

        const documents = await Documentation.find({ store })
            .populate('employee', 'name')
            .populate('supervisor', 'name')
            .sort('-date');

        console.log('Found documents:', documents);

        res.json(documents);
    } catch (error) {
        console.error('Error getting documents:', error);
        res.status(500).json({
            message: 'Error getting documents',
            error: error.message
        });
    }
};

// Send email for document
export const sendDocumentEmail = handleAsync(async (req, res) => {
  const { id } = req.params;

  const document = await Documentation.findOne({ _id: id, store: req.user.store._id })
    .populate('employee', 'name position')
    .populate('supervisor', 'name')
    .populate('store', 'name storeEmail storeNumber');

  if (!document) {
    throw new ApiError(404, 'Document not found');
  }

  if (!document.store?.storeEmail) {
    throw new ApiError(400, 'Store email not configured');
  }

  await sendEmail({
    to: document.store.storeEmail,
    subject: `${document.category} Document - ${document.employee.name}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #E4002B; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
          <h1 style="color: white; margin: 0;">${document.category} Document</h1>
        </div>

        <div style="background-color: #f8f8f8; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
          <h2 style="color: #333; margin-top: 0;">Document Details</h2>
          <p><strong>Employee:</strong> ${document.employee.name} (${document.employee.position})</p>
          <p><strong>Supervisor:</strong> ${document.supervisor.name}</p>
          <p><strong>Date:</strong> ${new Date(document.date).toLocaleDateString()}</p>
          <p><strong>Type:</strong> ${document.type}</p>
          <p><strong>Category:</strong> ${document.category}</p>
          <p><strong>Status:</strong> ${document.status}</p>
        </div>

        <div style="margin-bottom: 30px;">
          <h2 style="color: #333;">Document Information</h2>
          <div style="background-color: #fff; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
            <h3 style="color: #333; margin-top: 0;">Description</h3>
            <p style="margin-bottom: 20px;">${document.description}</p>

            ${document.actionTaken ? `
              <h3 style="color: #333;">Action Taken</h3>
              <p style="margin-bottom: 20px;">${document.actionTaken}</p>
            ` : ''}

            ${document.witnesses ? `
              <h3 style="color: #333;">Witnesses</h3>
              <p style="margin-bottom: 20px;">${document.witnesses}</p>
            ` : ''}

            ${document.acknowledgment?.acknowledged ? `
              <h3 style="color: #333;">Acknowledgment</h3>
              <p><strong>Date:</strong> ${new Date(document.acknowledgment.date).toLocaleDateString()}</p>
              ${document.acknowledgment.comments ? `
                <p><strong>Employee Comments:</strong> ${document.acknowledgment.comments}</p>
              ` : ''}
              ${document.acknowledgment.rating ? `
                <p><strong>Fairness Rating:</strong> ${document.acknowledgment.rating} out of 5</p>
              ` : ''}
            ` : ''}
          </div>
        </div>

        ${document.followUps.length > 0 ? `
          <div style="margin-bottom: 30px;">
            <h2 style="color: #333;">Follow-up Actions</h2>
            <div style="background-color: #fff; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
              ${document.followUps.map(followUp => `
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

// Send notification for unacknowledged document
export const sendUnacknowledgedNotification = handleAsync(async (req, res) => {
  const { id } = req.params;

  console.log('Attempting to send unacknowledged notification for document:', id);

  const document = await Documentation.findOne({
    _id: id,
    status: 'Pending Acknowledgment',
    $or: [
      { 'acknowledgment.acknowledged': false },
      { 'acknowledgment.acknowledged': { $exists: false } }
    ]
  })
  .populate('employee', 'name email')
  .populate('supervisor', 'name');

  if (!document) {
    throw new ApiError(404, 'Document not found or already acknowledged');
  }

  // Create notification for the employee
  await Notification.create({
    user: document.employee._id,
    store: req.user.store._id,
    type: 'documentation',
    priority: 'high',
    title: 'Document Acknowledgement Required',
    message: `Please acknowledge the ${document.type.toLowerCase()} document.`,
    relatedId: document._id,
    relatedModel: 'Documentation'
  });

  // Send email to employee if email is available
  if (document.employee.email) {
    try {
      await sendEmail({
        to: document.employee.email,
        subject: 'Action Required: Document Acknowledgment',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">
            <div style="background-color: #E4002B; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
              <h1 style="color: white; margin: 0;">Document Acknowledgment Required</h1>
            </div>

            <div style="background-color: #f8f8f8; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
              <h2 style="color: #333; margin-top: 0;">Document Details</h2>
              <p><strong>Type:</strong> ${document.type}</p>
              <p><strong>Category:</strong> ${document.category}</p>
              <p><strong>Date:</strong> ${new Date(document.date).toLocaleDateString()}</p>
              <p><strong>Supervisor:</strong> ${document.supervisor.name}</p>
            </div>

            <div style="margin-bottom: 30px;">
              <p>Please log in to acknowledge this document. Your acknowledgment is required to complete this process.</p>
              <p style="margin: 30px 0;">
                <a href="https://cfa-eval-app.vercel.app/documentation/${document._id}"
                   style="display: inline-block; background-color: #E4002B; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 500;">
                  Acknowledge Document
                </a>
              </p>
              <p>If the button above doesn't work, copy and paste this link into your browser:</p>
              <p>https://cfa-eval-app.vercel.app/documentation/${document._id}</p>
            </div>

            <p style="color: #666; font-size: 14px;">
              This is an automated message. Please do not reply to this email.
            </p>
          </div>
        `
      });
      console.log('Acknowledgment reminder email sent to:', document.employee.email);
    } catch (emailError) {
      console.error('Failed to send acknowledgment reminder email:', emailError);
      // Don't throw the error, just log it - we don't want to fail the notification creation
    }
  }

  res.json({
    message: 'Notification sent successfully'
  });
});
