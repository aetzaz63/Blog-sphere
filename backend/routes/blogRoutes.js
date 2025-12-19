// backend/routes/blogRoutes.js

const express = require('express');
const router = express.Router();
const {
  getAllBlogs,
  getBlogById,
  createBlog,
  updateBlog,
  deleteBlog,
  addRating,
  addComment,
  updateComment,
  deleteComment
} = require('../controllers/blogController');
const { protect } = require('../middleware/authMiddleware');

// Public routes
router.get('/', getAllBlogs);
router.get('/:id', getBlogById);
router.post('/:id/rating', addRating);

// Protected routes (require authentication)
router.post('/', protect, createBlog);
router.put('/:id', protect, updateBlog);
router.delete('/:id', protect, deleteBlog);

// Comment routes
router.post('/:id/comments', protect, addComment);
router.put('/:id/comments/:commentId', protect, updateComment);
router.delete('/:id/comments/:commentId', protect, deleteComment);

module.exports = router;