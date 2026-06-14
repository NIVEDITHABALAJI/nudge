const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  workspace: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Workspace',
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true,
    trim: true
  },
  reactions: [
    {
      emoji: String,
      users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model('Message', messageSchema);