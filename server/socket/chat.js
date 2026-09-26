const Message = require('../models/Message');
const User = require('../models/User');

module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Join room (conversation)
    socket.on('join-room', async (conversationId, userId) => {
      socket.join(conversationId);
      console.log(`User ${userId} joined room ${conversationId}`);

      // Emit typing indicator
      io.to(conversationId).emit('user-joined', { userId, timestamp: Date.now() });
    });

    // Send message
    socket.on('send-message', async (data) => {
      try {
        const { conversationId, userId, content, timestamp } = data;

        // Save message to database
        const message = new Message({
          conversationId,
          senderId: userId,
          content,
          timestamp: new Date(timestamp),
          status: 'delivered'
        });

        await message.save();
        await message.populate('senderId', 'firstName lastName profileImage');

        // Broadcast to room
        io.to(conversationId).emit('message-received', {
          _id: message._id,
          senderId: message.senderId,
          content: message.content,
          timestamp: message.timestamp,
          status: 'delivered'
        });
      } catch (error) {
        console.error('Message send error:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Typing indicator
    socket.on('typing', (data) => {
      const { conversationId, userId } = data;
      socket.to(conversationId).emit('user-typing', { userId });
    });

    socket.on('stop-typing', (data) => {
      const { conversationId, userId } = data;
      socket.to(conversationId).emit('user-stop-typing', { userId });
    });

    // Mark message as read
    socket.on('message-read', async (data) => {
      try {
        const { messageId, conversationId } = data;
        await Message.findByIdAndUpdate(messageId, { status: 'read' });
        io.to(conversationId).emit('message-marked-read', { messageId });
      } catch (error) {
        console.error('Read error:', error);
      }
    });

    // Disconnect
    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });
};
