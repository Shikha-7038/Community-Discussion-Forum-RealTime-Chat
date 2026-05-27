const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  room: {
    type: String,
    required: true,
    enum: ['general', 'technology', 'random', 'help']
  },
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: [500, 'Message cannot exceed 500 characters']
  },
  messageType: {
    type: String,
    enum: ['text', 'image', 'code'],
    default: 'text'
  },
  readBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for efficient queries
messageSchema.index({ room: 1, createdAt: -1 });

module.exports = mongoose.model('Message', messageSchema);