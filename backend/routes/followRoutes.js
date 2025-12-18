// backend/routes/followRoutes.js

const express = require('express');
const router = express.Router();
const {
  followUser,
  unfollowUser,
  getFollowing,
  getFollowers,
  getFeed,
  checkFollowStatus
} = require('../controllers/followController');
const { protect } = require('../middleware/authMiddleware');

// All routes require authentication
router.use(protect);

// Follow/Unfollow routes
router.post('/:userId', followUser);
router.delete('/:userId', unfollowUser);

// Get following/followers
router.get('/following', getFollowing);
router.get('/followers', getFollowers);

// Get personalized feed
router.get('/feed', getFeed);

// Check follow status
router.get('/check/:userId', checkFollowStatus);

module.exports = router;