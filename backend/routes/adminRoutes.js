// backend/routes/adminRoutes.js 

const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  getUserDetails,
  toggleUserStatus,
  getAllBlogsAdmin,
  getBlogDetailsAdmin,
  toggleBlogStatus,
  getAdminStats
} = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

// Apply authentication and admin authorization to all routes
router.use(protect);
router.use(authorize('admin'));

// Dashboard stats
router.get('/stats', getAdminStats);

// User management routes
router.get('/users', getAllUsers);
router.get('/users/:id', getUserDetails);
router.put('/users/:id/toggle-status', toggleUserStatus);

// Blog management routes
router.get('/blogs', getAllBlogsAdmin);
router.get('/blogs/:id', getBlogDetailsAdmin);
router.put('/blogs/:id/toggle-status', toggleBlogStatus);

module.exports = router;