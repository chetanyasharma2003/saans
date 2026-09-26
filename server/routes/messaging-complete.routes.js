const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const Message = require('../models/Message');
const Conversation = require('../models/Conversation');

// Create or get conversation
router.post('/conversations', authenticateToken, async (req, res, next) => {
  try {
    const { recipientId } = req.body;

    if (!recipientId) {
      return res.status(400).json({ success: false, error: 'Recipient ID required' });
    }

    let conversation = await Conversation.findOne({
      participants: { $all: [req.userId, recipientId] }
    });

    if (!conversation) {
      conversation = new Conversation({
        participants: [req.userId, recipientId],
        lastMessage: null,
        lastMessageTime: new Date()
      });
      await conversation.save();
    }

    await conversation.populate('participants', 'firstName lastName profileImage');

    res.json({ success: true, data: conversation });
  } catch (error) {
    next(error);
  }
});

// Get conversations
router.get('/conversations', authenticateToken, async (req, res, next) => {
  try {
    const conversations = await Conversation.find({
      participants: req.userId
    })
      .populate('participants', 'firstName lastName profileImage')
      .sort({ lastMessageTime: -1 });

    res.json({
      success: true,
      data: conversations,
      count: conversations.length
    });
  } catch (error) {
    next(error);
  }
});

// Get messages in conversation
router.get('/conversations/:conversationId/messages', authenticateToken, async (req, res, next) => {
  try {
    const { limit = 50, offset = 0 } = req.query;

    const messages = await Message.find({
      conversationId: req.params.conversationId
    })
      .populate('senderId', 'firstName lastName profileImage')
      .sort({ timestamp: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(offset));

    const total = await Message.countDocuments({
      conversationId: req.params.conversationId
    });

    res.json({
      success: true,
      data: messages.reverse(),
      total,
      hasMore: offset + messages.length < total
    });
  } catch (error) {
    next(error);
  }
});

// Send message (REST fallback)
router.post('/messages', authenticateToken, async (req, res, next) => {
  try {
    const { conversationId, content } = req.body;

    if (!conversationId || !content) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    const message = new Message({
      conversationId,
      senderId: req.userId,
      content,
      timestamp: new Date(),
      status: 'delivered'
    });

    await message.save();
    await message.populate('senderId', 'firstName lastName profileImage');

    // Update conversation
    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessage: content,
      lastMessageTime: new Date()
    });

    res.status(201).json({ success: true, data: message });
  } catch (error) {
    next(error);
  }
});

// Mark messages as read
router.put('/conversations/:conversationId/read', authenticateToken, async (req, res, next) => {
  try {
    const result = await Message.updateMany(
      {
        conversationId: req.params.conversationId,
        senderId: { $ne: req.userId },
        status: { $ne: 'read' }
      },
      { status: 'read' }
    );

    res.json({
      success: true,
      message: `Marked ${result.modifiedCount} messages as read`
    });
  } catch (error) {
    next(error);
  }
});

// Delete message
router.delete('/messages/:messageId', authenticateToken, async (req, res, next) => {
  try {
    const message = await Message.findOneAndUpdate(
      { _id: req.params.messageId, senderId: req.userId },
      { content: '[Deleted]', isDeleted: true },
      { new: true }
    );

    if (!message) {
      return res.status(404).json({ success: false, error: 'Message not found' });
    }

    res.json({ success: true, message: 'Message deleted' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
