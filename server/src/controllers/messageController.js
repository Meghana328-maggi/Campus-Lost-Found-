const Message = require('../models/Message');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { sendSuccess, sendError } = require('../utils/apiResponse');
const { processUploadedFiles } = require('../utils/uploadService');
const { NOTIFICATION_TYPES } = require('../config/constants');

// Helper to generate consistent conversation ID
const getConversationId = (user1, user2) => {
  const ids = [user1.toString(), user2.toString()].sort();
  return `${ids[0]}_${ids[1]}`;
};

// @desc    Get user conversations
// @route   GET /api/messages/conversations
// @access  Private
const getConversations = async (req, res, next) => {
  try {
    const currentUserId = req.user._id;

    // Find distinct conversation partners
    const messages = await Message.find({
      $or: [{ sender: currentUserId }, { receiver: currentUserId }],
    })
      .sort({ createdAt: -1 })
      .populate('sender', 'name profileImage college')
      .populate('receiver', 'name profileImage college')
      .populate('itemId', 'title images');

    const conversationsMap = new Map();

    for (const msg of messages) {
      const convId = msg.conversationId;
      if (!conversationsMap.has(convId)) {
        const otherUser =
          msg.sender._id.toString() === currentUserId.toString() ? msg.receiver : msg.sender;

        // Count unread
        const unreadCount = await Message.countDocuments({
          conversationId: convId,
          receiver: currentUserId,
          isRead: false,
        });

        conversationsMap.set(convId, {
          conversationId: convId,
          otherUser,
          lastMessage: {
            text: msg.message,
            createdAt: msg.createdAt,
            sender: msg.sender._id,
            isRead: msg.isRead,
          },
          item: msg.itemId,
          unreadCount,
        });
      }
    }

    return sendSuccess(res, 200, 'Conversations retrieved', {
      conversations: Array.from(conversationsMap.values()),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get messages for a conversation
// @route   GET /api/messages/:conversationId
// @access  Private
const getConversationMessages = async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    const currentUserId = req.user._id;

    // Verify user is participant in this conversation
    if (!conversationId.includes(currentUserId.toString())) {
      return sendError(res, 403, 'Unauthorized to view this conversation.');
    }

    const messages = await Message.find({ conversationId })
      .populate('sender', 'name profileImage')
      .populate('receiver', 'name profileImage')
      .populate('itemId', 'title images')
      .sort({ createdAt: 1 });

    // Mark messages sent to current user as read
    await Message.updateMany(
      {
        conversationId,
        receiver: currentUserId,
        isRead: false,
      },
      {
        isRead: true,
        readAt: new Date(),
      }
    );

    return sendSuccess(res, 200, 'Messages retrieved', { messages });
  } catch (error) {
    next(error);
  }
};

// @desc    Send a message
// @route   POST /api/messages
// @access  Private
const sendMessage = async (req, res, next) => {
  try {
    const { receiverId, message, itemId } = req.body;
    const senderId = req.user._id;

    if (!receiverId || (!message && (!req.files || req.files.length === 0))) {
      return sendError(res, 400, 'Please provide recipient and message content.');
    }

    if (senderId.toString() === receiverId.toString()) {
      return sendError(res, 400, 'You cannot message yourself.');
    }

    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return sendError(res, 404, 'Recipient user not found.');
    }

    // Attachments
    let attachments = [];
    if (req.files && req.files.length > 0) {
      attachments = await processUploadedFiles(req.files, req);
    }

    const conversationId = getConversationId(senderId, receiverId);

    const newMessage = await Message.create({
      sender: senderId,
      receiver: receiverId,
      conversationId,
      itemId: itemId || null,
      message: message ? message.trim() : 'Sent an attachment',
      attachments,
      isRead: false,
    });

    const populatedMsg = await Message.findById(newMessage._id)
      .populate('sender', 'name profileImage')
      .populate('receiver', 'name profileImage')
      .populate('itemId', 'title images');

    // Emit Socket.IO message event
    const io = req.app.get('io');
    if (io) {
      io.to(receiverId.toString()).emit('new_message', populatedMsg);
      io.to(senderId.toString()).emit('message_sent', populatedMsg);
    }

    // Create notification if receiver is not actively online in conversation
    await Notification.create({
      userId: receiverId,
      type: NOTIFICATION_TYPES.MESSAGE,
      title: `New message from ${req.user.name}`,
      message: newMessage.message.slice(0, 100),
      link: `/messages/${conversationId}`,
    });

    return sendSuccess(res, 201, 'Message sent successfully', { message: populatedMsg });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getConversations,
  getConversationMessages,
  sendMessage,
  getConversationId,
};
