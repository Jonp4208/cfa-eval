import Message from '../models/Message.js';
import User from '../models/User.js';
import Store from '../models/Store.js';
import { sendEmail } from '../utils/email.js';

// Create a new message
export const createMessage = async (req, res) => {
  try {
    const { subject, message, category, contactEmail, contactPhone, priority } = req.body;
    const userId = req.user._id;
    const storeId = req.user.store._id;

    // Validate required fields
    if (!subject || !message || !category || !contactEmail) {
      return res.status(400).json({
        message: 'Subject, message, category, and contact email are required'
      });
    }

    // Get user and store details for the email notification
    const user = await User.findById(userId);
    const store = await Store.findById(storeId);

    // Create the message
    const newMessage = new Message({
      userId,
      storeId,
      subject,
      message,
      category,
      contactEmail,
      contactPhone,
      priority: priority || 'medium'
    });

    await newMessage.save();

    // Send email notification to admin (Jonathon Pope)
    try {
      await sendEmail({
        to: 'jonp4208@gmail.com',
        subject: `New Support Message: ${subject}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #dc2626;">New Support Message Received</h2>
            
            <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #374151;">Message Details</h3>
              <p><strong>Subject:</strong> ${subject}</p>
              <p><strong>Category:</strong> ${category}</p>
              <p><strong>Priority:</strong> ${priority || 'medium'}</p>
              <p><strong>From:</strong> ${user.name} (${contactEmail})</p>
              <p><strong>Store:</strong> ${store.name} (#${store.storeNumber})</p>
              ${contactPhone ? `<p><strong>Phone:</strong> ${contactPhone}</p>` : ''}
            </div>
            
            <div style="background: #ffffff; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
              <h4 style="margin-top: 0; color: #374151;">Message:</h4>
              <p style="white-space: pre-wrap; line-height: 1.6;">${message}</p>
            </div>
            
            <div style="margin-top: 20px; padding: 15px; background: #fef3c7; border-radius: 8px;">
              <p style="margin: 0; color: #92400e;">
                <strong>Action Required:</strong> Please log into the admin dashboard to respond to this message.
              </p>
            </div>
          </div>
        `
      });
    } catch (emailError) {
      console.error('Failed to send email notification:', emailError);
      // Don't fail the request if email fails
    }

    res.status(201).json({
      message: 'Message sent successfully',
      data: newMessage
    });
  } catch (error) {
    console.error('Error creating message:', error);
    res.status(500).json({
      message: 'Failed to send message',
      error: error.message
    });
  }
};

// Get all messages (admin only)
export const getAllMessages = async (req, res) => {
  try {
    const { status, category, priority, page = 1, limit = 20 } = req.query;
    
    // Build filter object
    const filter = {};
    if (status) filter.status = status;
    if (category) filter.category = category;
    if (priority) filter.priority = priority;

    const skip = (page - 1) * limit;

    const messages = await Message.find(filter)
      .populate('userId', 'name email position departments')
      .populate('storeId', 'name storeNumber storeAddress')
      .populate('respondedBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Transform the data to include userDetails and storeDetails
    const transformedMessages = messages.map(message => {
      const messageObj = message.toObject();
      return {
        ...messageObj,
        userDetails: messageObj.userId,
        storeDetails: messageObj.storeId
      };
    });

    const total = await Message.countDocuments(filter);

    res.json({
      messages: transformedMessages,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({
      message: 'Failed to fetch messages',
      error: error.message
    });
  }
};

// Get message by ID (admin only)
export const getMessageById = async (req, res) => {
  try {
    const { id } = req.params;

    const message = await Message.findById(id)
      .populate('userId', 'name email position departments')
      .populate('storeId', 'name storeNumber storeAddress')
      .populate('respondedBy', 'name email');

    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    // Mark as read if not already read
    if (!message.readAt) {
      message.readAt = new Date();
      await message.save();
    }

    // Transform the data to include userDetails and storeDetails
    const messageObj = message.toObject();
    const transformedMessage = {
      ...messageObj,
      userDetails: messageObj.userId,
      storeDetails: messageObj.storeId
    };

    res.json({ message: transformedMessage });
  } catch (error) {
    console.error('Error fetching message:', error);
    res.status(500).json({
      message: 'Failed to fetch message',
      error: error.message
    });
  }
};

// Update message status (admin only)
export const updateMessageStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminResponse } = req.body;
    const adminId = req.user._id;

    const message = await Message.findById(id);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    // Update message
    message.status = status;
    if (adminResponse) {
      message.adminResponse = adminResponse;
      message.respondedBy = adminId;
      message.respondedAt = new Date();
    }
    if (status === 'resolved' || status === 'closed') {
      message.resolvedAt = new Date();
    }

    await message.save();

    // If there's a response, send email to the user
    if (adminResponse) {
      try {
        const user = await User.findById(message.userId);
        await sendEmail({
          to: message.contactEmail,
          subject: `Response to your message: ${message.subject}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #dc2626;">Response to Your Support Message</h2>
              
              <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="margin-top: 0; color: #374151;">Your Original Message</h3>
                <p><strong>Subject:</strong> ${message.subject}</p>
                <p style="white-space: pre-wrap; line-height: 1.6;">${message.message}</p>
              </div>
              
              <div style="background: #ffffff; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
                <h4 style="margin-top: 0; color: #374151;">Our Response:</h4>
                <p style="white-space: pre-wrap; line-height: 1.6;">${adminResponse}</p>
              </div>
              
              <div style="margin-top: 20px; padding: 15px; background: #f0f9ff; border-radius: 8px;">
                <p style="margin: 0; color: #1e40af;">
                  If you have any additional questions, please don't hesitate to contact us through the app.
                </p>
              </div>
            </div>
          `
        });
      } catch (emailError) {
        console.error('Failed to send response email:', emailError);
      }
    }

    res.json({
      message: 'Message updated successfully',
      data: message
    });
  } catch (error) {
    console.error('Error updating message:', error);
    res.status(500).json({
      message: 'Failed to update message',
      error: error.message
    });
  }
};

// Get user's own messages
export const getUserMessages = async (req, res) => {
  try {
    const userId = req.user._id;
    const { status, category, priority, page = 1, limit = 20 } = req.query;

    // Build filter object - always filter by userId
    const filter = { userId };
    if (status) filter.status = status;
    if (category) filter.category = category;
    if (priority) filter.priority = priority;

    const skip = (page - 1) * limit;

    const messages = await Message.find(filter)
      .populate('userId', 'name email position departments')
      .populate('storeId', 'name storeNumber storeAddress')
      .populate('respondedBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Transform the data to include userDetails and storeDetails
    const transformedMessages = messages.map(message => {
      const messageObj = message.toObject();
      return {
        ...messageObj,
        userDetails: messageObj.userId,
        storeDetails: messageObj.storeId
      };
    });

    const total = await Message.countDocuments(filter);

    res.json({
      messages: transformedMessages,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching user messages:', error);
    res.status(500).json({
      message: 'Failed to fetch messages',
      error: error.message
    });
  }
};

// Get user's message by ID
export const getUserMessageById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const message = await Message.findOne({ _id: id, userId })
      .populate('userId', 'name email position departments')
      .populate('storeId', 'name storeNumber storeAddress')
      .populate('respondedBy', 'name email');

    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    // Transform the data to include userDetails and storeDetails
    const messageObj = message.toObject();
    const transformedMessage = {
      ...messageObj,
      userDetails: messageObj.userId,
      storeDetails: messageObj.storeId
    };

    res.json({ message: transformedMessage });
  } catch (error) {
    console.error('Error fetching user message:', error);
    res.status(500).json({
      message: 'Failed to fetch message',
      error: error.message
    });
  }
};

// Get message statistics (admin only)
export const getMessageStats = async (req, res) => {
  try {
    const stats = await Message.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          new: { $sum: { $cond: [{ $eq: ['$status', 'new'] }, 1, 0] } },
          inProgress: { $sum: { $cond: [{ $eq: ['$status', 'in_progress'] }, 1, 0] } },
          resolved: { $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] } },
          closed: { $sum: { $cond: [{ $eq: ['$status', 'closed'] }, 1, 0] } },
          urgent: { $sum: { $cond: [{ $eq: ['$priority', 'urgent'] }, 1, 0] } },
          high: { $sum: { $cond: [{ $eq: ['$priority', 'high'] }, 1, 0] } }
        }
      }
    ]);

    const categoryStats = await Message.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    res.json({
      overview: stats[0] || {
        total: 0,
        new: 0,
        inProgress: 0,
        resolved: 0,
        closed: 0,
        urgent: 0,
        high: 0
      },
      byCategory: categoryStats
    });
  } catch (error) {
    console.error('Error fetching message stats:', error);
    res.status(500).json({
      message: 'Failed to fetch message statistics',
      error: error.message
    });
  }
};
