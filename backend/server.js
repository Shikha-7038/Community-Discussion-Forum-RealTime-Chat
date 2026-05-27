const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const socketIO = require('socket.io');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.set('io', io);

// Socket.IO
// io.on('connection', (socket) => {
//   console.log('✅ Client connected:', socket.id);
  
//   socket.on('joinRoom', (room) => {
//     socket.join(room);
//     console.log(`📢 ${socket.id} joined room: ${room}`);
//   });
  
//   socket.on('sendMessage', (data) => {
//     io.to(data.room).emit('newMessage', data);
//   });
  
//   socket.on('disconnect', () => {
//     console.log('❌ Client disconnected:', socket.id);
//   });
// });
io.on('connection', (socket) => {
  console.log('✅ Client connected:', socket.id);
  
  // Add this test event
  socket.on('test', (data) => {
    console.log('🧪 Test message from client:', data);
    socket.emit('test', { response: 'Server received your message!' });
  });
  
  socket.on('joinRoom', (room) => {
    socket.join(room);
    console.log(`📢 ${socket.id} joined room: ${room}`);
    
    // Send confirmation back
    socket.emit('roomJoined', { room, status: 'success' });
  });
  
  socket.on('sendMessage', (data) => {
    console.log(`💬 Message in ${data.room}: ${data.content}`);
    io.to(data.room).emit('newMessage', {
      ...data,
      _id: Date.now(),
      createdAt: new Date(),
      sender: { name: socket.user?.name || 'User', _id: socket.id }
    });
  });
  
  socket.on('disconnect', () => {
    console.log('❌ Client disconnected:', socket.id);
  });
});

app.use('/api/auth', require('./src/routes/auth'));
app.use('/api/discussions', require('./src/routes/discussions'));
app.use('/api/comments', require('./src/routes/comments'));

app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend is running!', timestamp: new Date() });
});

const MONGODB_URI = process.env.MONGODB_URI;
console.log('📡 Connecting to MongoDB...');

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB connected successfully');
    console.log('📊 Database name:', mongoose.connection.name);
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
    console.error('💡 Please check your MONGODB_URI in .env file');
  });

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`\n🚀 Server running on port ${PORT}`);
  console.log(`📍 http://localhost:${PORT}`);
  console.log(`🧪 Test: http://localhost:${PORT}/api/test\n`);
});