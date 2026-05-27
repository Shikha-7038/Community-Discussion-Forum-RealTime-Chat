import io from 'socket.io-client';

let socket = null;

export const initializeSocket = (token) => {
  if (!token) {
    console.error('No token provided for socket connection');
    return null;
  }

  socket = io('/', {
    auth: { token },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });

  socket.on('connect', () => {
    console.log('Socket.IO connected successfully');
  });

  socket.on('connect_error', (error) => {
    console.error('Socket.IO connection error:', error);
  });

  socket.on('disconnect', (reason) => {
    console.log('Socket.IO disconnected:', reason);
  });

  return socket;
};

export const getSocket = () => {
  if (!socket) {
    console.warn('Socket not initialized. Call initializeSocket first.');
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

// Helper functions for socket events
export const joinChatRoom = (room) => {
  if (socket) socket.emit('joinRoom', room);
};

export const leaveChatRoom = (room) => {
  if (socket) socket.emit('leaveRoom', room);
};

export const sendChatMessage = (room, content) => {
  if (socket) socket.emit('sendMessage', { room, content });
};

export const sendTyping = (room, isTyping) => {
  if (socket) socket.emit('typing', { room, isTyping });
};

export const joinDiscussionRoom = (discussionId) => {
  if (socket) socket.emit('joinDiscussion', discussionId);
};

export const leaveDiscussionRoom = (discussionId) => {
  if (socket) socket.emit('leaveDiscussion', discussionId);
};