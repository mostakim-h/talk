const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
  roomId: {
    type: String,
    required: true,
  },
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  content: {
    message: {
      type: String,
      trim: true,
    },
    media: {
      fileExtension: {
        type: String,
        default: null,
      },
      file: {
        type: String,
        default: null,
      },
    },
  },
  reactions: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    reactionType: {
      type: String,
      enum: ['like', 'dislike', 'love', 'laugh', 'sad', 'angry'],
      default: 'like',
    },
  }],
  deletionStatus: {
    type: String,
    enum: ['none', 'sender', 'receiver', 'both'],
    default: 'none',
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      delete ret.__v;
      return ret;
    }
  }
})

chatSchema.index({ roomId: 1, createdAt: 1 });

module.exports = mongoose.model('chats', chatSchema);