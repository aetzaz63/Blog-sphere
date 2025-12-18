// backend/controllers/blogController.js

const Blog = require('../models/Blog');

// @desc    Get all blogs
// @route   GET /api/blogs
// @access  Public
const getAllBlogs = async (req, res, next) => {
  try {
    const blogs = await Blog.find({ disabled: false }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: blogs.length,
      data: blogs
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single blog
// @route   GET /api/blogs/:id
// @access  Public
const getBlogById = async (req, res, next) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }

    res.status(200).json({
      success: true,
      data: blog
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create blog
// @route   POST /api/blogs
// @access  Private
const createBlog = async (req, res, next) => {
  try {
    const { title, content, category, image } = req.body;

    const blog = await Blog.create({
      title,
      content,
      author: req.user.username,
      authorEmail: req.user.email,
      authorId: req.user._id,
      category,
      image,
      ratings: [],
      comments: []
    });

    res.status(201).json({
      success: true,
      message: 'Blog created successfully',
      data: blog
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update blog
// @route   PUT /api/blogs/:id
// @access  Private (Owner only)
const updateBlog = async (req, res, next) => {
  try {
    let blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }

    // Check ownership
    if (blog.authorEmail !== req.user.email) {
      return res.status(403).json({
        success: false,
        message: 'You can only update your own blogs'
      });
    }

    const { title, content, category, image } = req.body;

    blog = await Blog.findByIdAndUpdate(
      req.params.id,
      { title, content, category, image },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Blog updated successfully',
      data: blog
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete blog
// @route   DELETE /api/blogs/:id
// @access  Private (Owner only)
const deleteBlog = async (req, res, next) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }

    // Check ownership
    if (blog.authorEmail !== req.user.email) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own blogs'
      });
    }

    await blog.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Blog deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add rating to blog
// @route   POST /api/blogs/:id/rating
// @access  Public
const addRating = async (req, res, next) => {
  try {
    const { rating } = req.body;

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
    }

    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }

    blog.ratings.push(rating);
    await blog.save();

    res.status(200).json({
      success: true,
      message: 'Rating added successfully',
      data: blog
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add comment to blog
// @route   POST /api/blogs/:id/comments
// @access  Private
const addComment = async (req, res, next) => {
  try {
    const { text } = req.body;

    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }

    blog.comments.push({
      author: req.user.username,
      authorEmail: req.user.email,
      text
    });

    await blog.save();

    res.status(200).json({
      success: true,
      message: 'Comment added successfully',
      data: blog
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update comment
// @route   PUT /api/blogs/:id/comments/:commentId
// @access  Private (Comment owner only)
const updateComment = async (req, res, next) => {
  try {
    const { text } = req.body;
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }

    const comment = blog.comments.id(req.params.commentId);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    // Check ownership
    if (comment.authorEmail !== req.user.email) {
      return res.status(403).json({
        success: false,
        message: 'You can only update your own comments'
      });
    }

    comment.text = text;
    comment.edited = true;
    await blog.save();

    res.status(200).json({
      success: true,
      message: 'Comment updated successfully',
      data: blog
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete comment
// @route   DELETE /api/blogs/:id/comments/:commentId
// @access  Private (Comment owner or blog owner)
const deleteComment = async (req, res, next) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }

    const comment = blog.comments.id(req.params.commentId);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    // Check if user is comment owner or blog owner
    if (comment.authorEmail !== req.user.email && blog.authorEmail !== req.user.email) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own comments or comments on your blogs'
      });
    }

    comment.deleteOne();
    await blog.save();

    res.status(200).json({
      success: true,
      message: 'Comment deleted successfully',
      data: blog
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllBlogs,
  getBlogById,
  createBlog,
  updateBlog,
  deleteBlog,
  addRating,
  addComment,
  updateComment,
  deleteComment
};