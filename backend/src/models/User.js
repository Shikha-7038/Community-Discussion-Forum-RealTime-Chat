const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    select: false
  },
  avatar: {
    type: String,
    default: 'https://ui-avatars.com/api/?background=random&color=fff'
  },
  isOnline: {
    type: Boolean,
    default: false
  },
  lastSeen: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

userSchema.pre('save', function() {
  const user = this;
  if (!user.isModified('password')) {
    return;
  }
  const salt = bcrypt.genSaltSync(10);
  user.password = bcrypt.hashSync(user.password, salt);
});

userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);