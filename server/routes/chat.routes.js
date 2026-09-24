const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');
const ChatRoom = require('../models/ChatRoom');
const ChatMessage = require('../models/ChatMessage');
const logger = require('../utils/logger');

/**
 * Chat Routes - Real-time Chat Management
 */

// Get all chat rooms for user
router.get('/rooms', authenticateToken, async (req, res) => {
  try {
    const rooms = await ChatRoom.find({
      'members.userId': req.user._id,
      isActive: true
    })
      .select('name type avatar members lastMessageAt messageCount')
      .sort({ lastMessageAt: -1 })
      .limit(50);

    res.json({
      success: true,
      data: rooms,
      count: rooms.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Get rooms failed', { error: error.message });

    res.status(500).json({
      success: false,
      error: error.message,
      statusCode: 500,
      timestamp: new Date().toISOString()
    });
  }
});

// Create new chat room
router.post('/rooms', authenticateToken, async (req, res) => {
  try {
    const { name, type, description, members = [] } = req.body;

    if (!name || !type) {
      return res.status(400).json({
        success: false,
        error: 'Name and type are required',
        statusCode: 400,
        timestamp: new Date().toISOString()
      });
    }

    const room = new ChatRoom({
      name,
      type,
      description,
      createdBy: req.user._id,
      members: [
        { userId: req.user._id, role: 'admin' },
        ...members.map(m => ({ userId: m, role: 'member' }))
      ]
    });

    await room.save();

    logger.info('Chat room created', {
      userId: req.user._id,
      roomId: room._id,
      type
    });

    res.status(201).json({
      success: true,
      data: room,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Create room failed', { error: error.message });

    res.status(500).json({
      success: false,
      error: error.message,
      statusCode: 500,
      timestamp: new Date().toISOString()
    });
  }
});

// Get chat messages for room
router.get('/rooms/:roomId/messages', authenticateToken, async (req, res) => {
  try {
    const { roomId } = req.params;
    const { limit = 50, offset = 0 } = req.query;

    // Check if user is member of room
    const room = await ChatRoom.findById(roomId);
    if (!room || !room.members.some(m => m.userId.toString() === req.user._id.toString())) {
      return res.status(403).json({
        success: false,
        error: 'Access denied',
        statusCode: 403,
        timestamp: new Date().toISOString()
      });
    }

    const messages = await ChatMessage.find({ roomId })
      .select('senderId message messageType metadata edited editedAt timestamp readBy')
      .populate('senderId', 'firstName lastName avatar')
      .sort({ timestamp: -1 })
      .skip(parseInt(offset))
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: messages.reverse(), // Reverse to get chronological order
      count: messages.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Get messages failed', { error: error.message });

    res.status(500).json({
      success: false,
      error: error.message,
      statusCode: 500,
      timestamp: new Date().toISOString()
    });
  }
});

// Mark message as read
router.post('/messages/:messageId/read', authenticateToken, async (req, res) => {
  try {
    const { messageId } = req.params;

    const message = await ChatMessage.findByIdAndUpdate(
      messageId,
      {
        $addToSet: {
          readBy: {
            userId: req.user._id,
            readAt: new Date()
          }
        }
      },
      { new: true }
    );

    if (!message) {
      return res.status(404).json({
        success: false,
        error: 'Message not found',
        statusCode: 404,
        timestamp: new Date().toISOString()
      });
    }

    logger.info('Message marked as read', {
      userId: req.user._id,
      messageId
    });

    res.json({
      success: true,
      data: message,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Mark as read failed', { error: error.message });

    res.status(500).json({
      success: false,
      error: error.message,
      statusCode: 500,
      timestamp: new Date().toISOString()
    });
  }
});

// Mark all messages in room as read
router.post('/rooms/:roomId/mark-read', authenticateToken, async (req, res) => {
  try {
    const { roomId } = req.params;

    await ChatMessage.updateMany(
      { roomId },
      {
        $addToSet: {
          readBy: {
            userId: req.user._id,
            readAt: new Date()
          }
        }
      }
    );

    // Update room's lastReadAt for user
    await ChatRoom.updateOne(
      { _id: roomId, 'members.userId': req.user._id },
      {
        $set: { 'members.$.lastReadAt': new Date() }
      }
    );

    logger.info('Room marked as read', {
      userId: req.user._id,
      roomId
    });

    res.json({
      success: true,
      message: 'All messages marked as read',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Mark room as read failed', { error: error.message });

    res.status(500).json({
      success: false,
      error: error.message,
      statusCode: 500,
      timestamp: new Date().toISOString()
    });
  }
});

// Get unread count
router.get('/unread-count', authenticateToken, async (req, res) => {
  try {
    const rooms = await ChatRoom.find({
      'members.userId': req.user._id
    });

    let totalUnread = 0;
    const roomUnread = {};

    for (const room of rooms) {
      const member = room.members.find(m => m.userId.toString() === req.user._id.toString());
      const lastReadAt = member ? member.lastReadAt : new Date(0);

      const unreadCount = await ChatMessage.countDocuments({
        roomId: room._id,
        timestamp: { $gt: lastReadAt }
      });

      if (unreadCount > 0) {
        roomUnread[room._id] = unreadCount;
        totalUnread += unreadCount;
      }
    }

    res.json({
      success: true,
      data: {
        totalUnread,
        byRoom: roomUnread
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Get unread count failed', { error: error.message });

    res.status(500).json({
      success: false,
      error: error.message,
      statusCode: 500,
      timestamp: new Date().toISOString()
    });
  }
});

// Search messages
router.get('/search', authenticateToken, async (req, res) => {
  try {
    const { query, roomId, limit = 20 } = req.query;

    if (!query) {
      return res.status(400).json({
        success: false,
        error: 'Search query is required',
        statusCode: 400,
        timestamp: new Date().toISOString()
      });
    }

    let filter = {
      message: { $regex: query, $options: 'i' }
    };

    if (roomId) {
      // Verify user access to room
      const room = await ChatRoom.findById(roomId);
      if (!room || !room.members.some(m => m.userId.toString() === req.user._id.toString())) {
        return res.status(403).json({
          success: false,
          error: 'Access denied',
          statusCode: 403,
          timestamp: new Date().toISOString()
        });
      }
      filter.roomId = roomId;
    }

    const messages = await ChatMessage.find(filter)
      .select('senderId message roomId timestamp')
      .populate('senderId', 'firstName lastName avatar')
      .sort({ timestamp: -1 })
      .limit(parseInt(limit));

    logger.info('Search performed', {
      userId: req.user._id,
      query,
      resultCount: messages.length
    });

    res.json({
      success: true,
      data: messages,
      count: messages.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Search failed', { error: error.message });

    res.status(500).json({
      success: false,
      error: error.message,
      statusCode: 500,
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;
