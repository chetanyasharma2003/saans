const socketIO = require('socket.io');
const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');
const ChatMessage = require('../models/ChatMessage');
const User = require('../models/User');

/**
 * Socket.io Service for Real-time Communication
 * Handles chat, notifications, and live updates
 */

class SocketService {
  constructor() {
    this.io = null;
    this.connectedUsers = new Map(); // userId -> socket id
    this.userRooms = new Map(); // userId -> set of room ids
    this.typingUsers = new Map(); // roomId -> set of userId
  }

  // Initialize Socket.io
  initialize(server) {
    this.io = socketIO(server, {
      cors: {
        origin: process.env.FRONTEND_URL || ['http://localhost:5173', 'http://localhost:3000'],
        methods: ['GET', 'POST'],
        credentials: true
      }
    });

    this.setupMiddleware();
    this.setupEventHandlers();

    logger.info('Socket.io initialized');
    return this.io;
  }

  // Setup authentication middleware
  setupMiddleware() {
    this.io.use((socket, next) => {
      try {
        const token = socket.handshake.auth.token;

        if (!token) {
          return next(new Error('Authentication failed: No token provided'));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        socket.user = decoded;
        socket.userId = decoded._id;

        logger.info('Socket authenticated', { userId: socket.userId });
        next();
      } catch (error) {
        logger.error('Socket authentication failed', { error: error.message });
        next(new Error('Authentication failed: Invalid token'));
      }
    });
  }

  // Setup event handlers
  setupEventHandlers() {
    this.io.on('connection', (socket) => {
      logger.info('User connected', {
        userId: socket.userId,
        socketId: socket.id
      });

      // Track connected user
      this.connectedUsers.set(socket.userId, socket.id);
      this.userRooms.set(socket.userId, new Set());

      // User online notification
      this.io.emit('user:online', {
        userId: socket.userId,
        timestamp: new Date().toISOString()
      });

      // ============ CHAT EVENTS ============

      socket.on('chat:join-room', (data) => this.handleJoinRoom(socket, data));
      socket.on('chat:leave-room', (data) => this.handleLeaveRoom(socket, data));
      socket.on('chat:message', (data) => this.handleChatMessage(socket, data));
      socket.on('chat:typing', (data) => this.handleTyping(socket, data));
      socket.on('chat:stop-typing', (data) => this.handleStopTyping(socket, data));
      socket.on('chat:delete-message', (data) => this.handleDeleteMessage(socket, data));
      socket.on('chat:edit-message', (data) => this.handleEditMessage(socket, data));

      // ============ NOTIFICATION EVENTS ============

      socket.on('notification:read', (data) => this.handleMarkNotificationRead(socket, data));
      socket.on('notification:clear', () => this.handleClearNotifications(socket));

      // ============ PRESENCE EVENTS ============

      socket.on('presence:update', (data) => this.handlePresenceUpdate(socket, data));
      socket.on('presence:get-online-users', () => this.handleGetOnlineUsers(socket));

      // ============ THERAPIST EVENTS ============

      socket.on('therapist:set-available', (data) => this.handleTherapistAvailable(socket, data));
      socket.on('therapist:set-unavailable', () => this.handleTherapistUnavailable(socket));

      // ============ DISCONNECT ============

      socket.on('disconnect', () => this.handleDisconnect(socket));
    });
  }

  // ============ CHAT HANDLERS ============

  async handleJoinRoom(socket, data) {
    try {
      const { roomId, roomType } = data; // roomType: 'private', 'therapist', 'group'

      if (!roomId) {
        return socket.emit('error', { message: 'Room ID is required' });
      }

      socket.join(roomId);

      const rooms = this.userRooms.get(socket.userId) || new Set();
      rooms.add(roomId);
      this.userRooms.set(socket.userId, rooms);

      logger.info('User joined room', {
        userId: socket.userId,
        roomId,
        roomType
      });

      // Notify others
      this.io.to(roomId).emit('room:user-joined', {
        userId: socket.userId,
        roomId,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Join room error', { error: error.message });
      socket.emit('error', { message: 'Failed to join room' });
    }
  }

  async handleLeaveRoom(socket, data) {
    try {
      const { roomId } = data;

      if (!roomId) return;

      socket.leave(roomId);

      const rooms = this.userRooms.get(socket.userId);
      if (rooms) {
        rooms.delete(roomId);
      }

      logger.info('User left room', {
        userId: socket.userId,
        roomId
      });

      // Notify others
      this.io.to(roomId).emit('room:user-left', {
        userId: socket.userId,
        roomId,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Leave room error', { error: error.message });
    }
  }

  async handleChatMessage(socket, data) {
    try {
      const { roomId, message, messageType = 'text', metadata = {} } = data;

      if (!roomId || !message) {
        return socket.emit('error', { message: 'Room ID and message are required' });
      }

      // Save to database
      const chatMessage = new ChatMessage({
        roomId,
        senderId: socket.userId,
        message,
        messageType,
        metadata,
        timestamp: new Date()
      });

      await chatMessage.save();

      logger.info('Message saved', {
        userId: socket.userId,
        roomId,
        messageType
      });

      // Broadcast to room
      this.io.to(roomId).emit('chat:message', {
        id: chatMessage._id,
        roomId,
        senderId: socket.userId,
        message,
        messageType,
        metadata,
        timestamp: chatMessage.timestamp
      });
    } catch (error) {
      logger.error('Chat message error', { error: error.message });
      socket.emit('error', { message: 'Failed to send message' });
    }
  }

  handleTyping(socket, data) {
    try {
      const { roomId } = data;

      if (!roomId) return;

      const typingSet = this.typingUsers.get(roomId) || new Set();
      typingSet.add(socket.userId);
      this.typingUsers.set(roomId, typingSet);

      socket.to(roomId).emit('chat:user-typing', {
        userId: socket.userId,
        roomId
      });
    } catch (error) {
      logger.error('Typing event error', { error: error.message });
    }
  }

  handleStopTyping(socket, data) {
    try {
      const { roomId } = data;

      if (!roomId) return;

      const typingSet = this.typingUsers.get(roomId);
      if (typingSet) {
        typingSet.delete(socket.userId);
      }

      socket.to(roomId).emit('chat:user-stopped-typing', {
        userId: socket.userId,
        roomId
      });
    } catch (error) {
      logger.error('Stop typing event error', { error: error.message });
    }
  }

  async handleDeleteMessage(socket, data) {
    try {
      const { messageId, roomId } = data;

      const message = await ChatMessage.findById(messageId);

      if (!message) {
        return socket.emit('error', { message: 'Message not found' });
      }

      if (message.senderId.toString() !== socket.userId && !this.isAdmin(socket.user)) {
        return socket.emit('error', { message: 'Unauthorized' });
      }

      await ChatMessage.findByIdAndDelete(messageId);

      logger.info('Message deleted', {
        userId: socket.userId,
        messageId
      });

      this.io.to(roomId).emit('chat:message-deleted', {
        messageId,
        roomId
      });
    } catch (error) {
      logger.error('Delete message error', { error: error.message });
      socket.emit('error', { message: 'Failed to delete message' });
    }
  }

  async handleEditMessage(socket, data) {
    try {
      const { messageId, roomId, newMessage } = data;

      const message = await ChatMessage.findById(messageId);

      if (!message) {
        return socket.emit('error', { message: 'Message not found' });
      }

      if (message.senderId.toString() !== socket.userId) {
        return socket.emit('error', { message: 'Unauthorized' });
      }

      message.message = newMessage;
      message.edited = true;
      message.editedAt = new Date();
      await message.save();

      logger.info('Message edited', {
        userId: socket.userId,
        messageId
      });

      this.io.to(roomId).emit('chat:message-edited', {
        messageId,
        roomId,
        newMessage,
        editedAt: message.editedAt
      });
    } catch (error) {
      logger.error('Edit message error', { error: error.message });
      socket.emit('error', { message: 'Failed to edit message' });
    }
  }

  // ============ NOTIFICATION HANDLERS ============

  handleMarkNotificationRead(socket, data) {
    try {
      const { notificationId } = data;

      // Mark as read in database
      // This would be implemented with a Notification model

      socket.emit('notification:marked-read', { notificationId });
    } catch (error) {
      logger.error('Mark notification read error', { error: error.message });
    }
  }

  handleClearNotifications(socket) {
    try {
      // Clear user's notifications in database

      socket.emit('notification:cleared');
    } catch (error) {
      logger.error('Clear notifications error', { error: error.message });
    }
  }

  // ============ PRESENCE HANDLERS ============

  handlePresenceUpdate(socket, data) {
    try {
      const { status } = data; // online, away, busy, offline

      this.io.emit('presence:user-status', {
        userId: socket.userId,
        status,
        timestamp: new Date().toISOString()
      });

      logger.info('Presence updated', { userId: socket.userId, status });
    } catch (error) {
      logger.error('Presence update error', { error: error.message });
    }
  }

  handleGetOnlineUsers(socket) {
    try {
      const onlineUsers = Array.from(this.connectedUsers.keys());

      socket.emit('presence:online-users', {
        onlineUsers,
        count: onlineUsers.length
      });
    } catch (error) {
      logger.error('Get online users error', { error: error.message });
    }
  }

  // ============ THERAPIST HANDLERS ============

  handleTherapistAvailable(socket, data) {
    try {
      const { specialty, languages } = data;

      this.io.emit('therapist:available', {
        userId: socket.userId,
        specialty,
        languages,
        timestamp: new Date().toISOString()
      });

      logger.info('Therapist marked available', {
        userId: socket.userId,
        specialty
      });
    } catch (error) {
      logger.error('Therapist available error', { error: error.message });
    }
  }

  handleTherapistUnavailable(socket) {
    try {
      this.io.emit('therapist:unavailable', {
        userId: socket.userId,
        timestamp: new Date().toISOString()
      });

      logger.info('Therapist marked unavailable', { userId: socket.userId });
    } catch (error) {
      logger.error('Therapist unavailable error', { error: error.message });
    }
  }

  // ============ DISCONNECT ============

  handleDisconnect(socket) {
    try {
      this.connectedUsers.delete(socket.userId);
      this.userRooms.delete(socket.userId);
      this.typingUsers.forEach(set => set.delete(socket.userId));

      logger.info('User disconnected', {
        userId: socket.userId,
        socketId: socket.id
      });

      this.io.emit('user:offline', {
        userId: socket.userId,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Disconnect error', { error: error.message });
    }
  }

  // ============ UTILITY METHODS ============

  isAdmin(user) {
    return user.role === 'admin';
  }

  // Send notification to specific user
  async sendNotification(userId, notification) {
    try {
      const socketId = this.connectedUsers.get(userId);

      if (socketId) {
        this.io.to(socketId).emit('notification', {
          ...notification,
          timestamp: new Date().toISOString()
        });
      }

      logger.info('Notification sent', { userId });
    } catch (error) {
      logger.error('Send notification error', { error: error.message });
    }
  }

  // Send notification to room
  async sendRoomNotification(roomId, notification) {
    try {
      this.io.to(roomId).emit('notification', {
        ...notification,
        timestamp: new Date().toISOString()
      });

      logger.info('Room notification sent', { roomId });
    } catch (error) {
      logger.error('Send room notification error', { error: error.message });
    }
  }

  // Broadcast to all connected users
  broadcast(event, data) {
    try {
      this.io.emit(event, {
        ...data,
        timestamp: new Date().toISOString()
      });

      logger.info('Broadcast sent', { event });
    } catch (error) {
      logger.error('Broadcast error', { error: error.message });
    }
  }

  // Get connected user count
  getConnectedUserCount() {
    return this.connectedUsers.size;
  }

  // Check if user is online
  isUserOnline(userId) {
    return this.connectedUsers.has(userId);
  }
}

module.exports = new SocketService();
