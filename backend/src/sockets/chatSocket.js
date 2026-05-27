const Message = require('../models/Message');
const User = require('../models/User');

// Available chat rooms
const CHAT_ROOMS = ['general', 'technology', 'random', 'help'];

module.exports = (io) => {
  // Middleware for socket authentication
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication error'));
      }

      const jwt = require('jsonwebtoken');
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      const user = await User.findById(decoded.id);
      if (!user) {
        return next(new Error('User not found'));
      }

      socket.user = user;
      next();
    } catch (err) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', async (socket) => {
    console.log(`User connected: ${socket.user?.name || 'Unknown'}`);

    // Update user online status
    if (socket.user) {
      await User.findByIdAndUpdate(socket.user._id, { isOnline: true, lastSeen: Date.now() });
    }

    // Join user to their personal room
    if (socket.user) {
      socket.join(`user-${socket.user._id}`);
    }

    // Join default rooms
    socket.join('general');
    socket.emit('roomsJoined', CHAT_ROOMS);

    // Handle joining a chat room
    socket.on('joinRoom', (room) => {
      if (CHAT_ROOMS.includes(room)) {
        socket.join(room);
        socket.emit('roomJoined', room);
      }
    });

    // Handle leaving a chat room
    socket.on('leaveRoom', (room) => {
      if (CHAT_ROOMS.includes(room)) {
        socket.leave(room);
        socket.emit('roomLeft', room);
      }
    });

    // Handle sending a message
    socket.on('sendMessage', async (data) => {
      try {
        const { room, content, messageType = 'text' } = data;
        
        if (!CHAT_ROOMS.includes(room)) {
          return socket.emit('error', 'Invalid room');
        }

        if (!content || content.trim().length === 0) {
          return socket.emit('error', 'Message cannot be empty');
        }

        if (!socket.user) {
          return socket.emit('error', 'User not authenticated');
        }

        // Save message to database
        const message = await Message.create({
          sender: socket.user._id,
          room,
          content: content.trim(),
          messageType
        });

        // Populate sender info
        const populatedMessage = await Message.findById(message._id)
          .populate('sender', 'name email avatar');

        // Emit message to room
        io.to(room).emit('newMessage', {
          ...populatedMessage.toObject(),
          room
        });
        
      } catch (error) {
        console.error('Message error:', error);
        socket.emit('error', 'Failed to send message');
      }
    });

    // Handle typing indicator
    socket.on('typing', (data) => {
      const { room, isTyping } = data;
      if (socket.user) {
        socket.to(room).emit('userTyping', {
          userId: socket.user._id,
          name: socket.user.name,
          isTyping
        });
      }
    });

    // Handle discussion room joining
    socket.on('joinDiscussion', (discussionId) => {
      const roomName = `discussion-${discussionId}`;
      socket.join(roomName);
    });

    socket.on('leaveDiscussion', (discussionId) => {
      const roomName = `discussion-${discussionId}`;
      socket.leave(roomName);
    });

    // Handle disconnection
    socket.on('disconnect', async () => {
      console.log(`User disconnected: ${socket.user?.name || 'Unknown'}`);
      
      if (socket.user) {
        await User.findByIdAndUpdate(socket.user._id, { 
          isOnline: false, 
          lastSeen: Date.now() 
        });
      }
    });
  });
};