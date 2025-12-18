// backend/models/Follow.js

const mongoose = require('mongoose');

const followSchema = new mongoose.Schema({
  follower: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  followerEmail: {
    type: String,
    required: true
  },
  following: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  followingEmail: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Compound index to prevent duplicate follows
followSchema.index({ follower: 1, following: 1 }, { unique: true });

// Instance method to check if a user follows another
followSchema.statics.isFollowing = async function(followerId, followingId) {
  const follow = await this.findOne({
    follower: followerId,
    following: followingId
  });
  return !!follow;
};

module.exports = mongoose.model('Follow', followSchema);