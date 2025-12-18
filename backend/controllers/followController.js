// backend/controllers/followController.js

const Follow = require('../models/Follow');
const User = require('../models/User');
const Notification = require('../models/Notification');

// @desc    Follow a user
// @route   POST /api/follow/:userId
// @access  Private
const followUser = async (req, res, next) => {
  try {
    const userToFollow = await User.findById(req.params.userId);

    if (!userToFollow) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Can't follow yourself
    if (req.user._id.toString() === req.params.userId) {
      return res.status(400).json({
        success: false,
        message: 'You cannot follow yourself'
      });
    }

    // Check if already following
    const existingFollow = await Follow.findOne({
      follower: req.user._id,
      following: req.params.userId
    });

    if (existingFollow) {
      return res.status(400).json({
        success: false,
        message: 'You are already following this user'
      });
    }

    // Create follow relationship
    const follow = await Follow.create({
      follower: req.user._id,
      followerEmail: req.user.email,
      following: userToFollow._id,
      followingEmail: userToFollow.email
    });

    // Create notification
    await Notification.create({
      recipient: userToFollow._id,
      recipientEmail: userToFollow.email,
      sender: req.user._id,
      senderName: req.user.username,
      senderEmail: req.user.email,
      type: 'follow',
      message: `${req.user.username} started following you`
    });

    res.status(201).json({
      success: true,
      message: `You are now following ${userToFollow.username}`,
      data: follow
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Unfollow a user
// @route   DELETE /api/follow/:userId
// @access  Private
const unfollowUser = async (req, res, next) => {
  try {
    const follow = await Follow.findOneAndDelete({
      follower: req.user._id,
      following: req.params.userId
    });

    if (!follow) {
      return res.status(404).json({
        success: false,
        message: 'You are not following this user'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Successfully unfollowed user'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get users that current user is following
// @route   GET /api/follow/following
// @access  Private
const getFollowing = async (req, res, next) => {
  try {
    const following = await Follow.find({ follower: req.user._id })
      .populate('following', 'username email')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: following.length,
      data: following
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get users following the current user
// @route   GET /api/follow/followers
// @access  Private
const getFollowers = async (req, res, next) => {
  try {
    const followers = await Follow.find({ following: req.user._id })
      .populate('follower', 'username email')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: followers.length,
      data: followers
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get feed (posts from followed users)
// @route   GET /api/follow/feed?page=1&limit=10
// @access  Private
const getFeed = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Get list of users the current user is following
    const following = await Follow.find({ follower: req.user._id })
      .select('following');
    
    const followingIds = following.map(f => f.following);

    // Get blogs from followed users
    const Blog = require('../models/Blog');
    const total = await Blog.countDocuments({
      authorId: { $in: followingIds },
      disabled: false
    });

    const feedPosts = await Blog.find({
      authorId: { $in: followingIds },
      disabled: false
    })
      .sort('-createdAt')
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      count: feedPosts.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: feedPosts
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Check if current user follows another user
// @route   GET /api/follow/check/:userId
// @access  Private
const checkFollowStatus = async (req, res, next) => {
  try {
    const isFollowing = await Follow.isFollowing(req.user._id, req.params.userId);

    res.status(200).json({
      success: true,
      isFollowing
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  followUser,
  unfollowUser,
  getFollowing,
  getFollowers,
  getFeed,
  checkFollowStatus
};