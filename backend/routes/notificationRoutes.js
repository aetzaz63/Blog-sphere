// backend/routes/notificationRoutes.js

const express = require('express');
const router = express.Router();
const {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllNotifications,
  getUnreadCount
} = require('../controllers/notificationController');
const { protect } = require('../middleware/authMiddleware');

// All routes require authentication
router.use(protect);

// Get notifications
router.get('/', getNotifications);

// Get unread count
router.get('/unread/count', getUnreadCount);

// Mark as read
router.put('/read-all', markAllAsRead);
router.put('/:id/read', markAsRead);

// Delete notifications
router.delete('/', deleteAllNotifications);
router.delete('/:id', deleteNotification);

module.exports = router;