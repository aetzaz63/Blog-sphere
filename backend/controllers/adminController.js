// backend/controllers/adminController.js

const User = require('../models/User');
const Blog = require('../models/Blog');

// @desc    Get all users with stats
// @route   GET /api/admin/users?page=1&limit=20&status=all
// @access  Private/Admin
const getAllUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const status = req.query.status; // 'active', 'disabled', 'all'
    const skip = (page - 1) * limit;

    // Build filter
    const filter = {};
    if (status === 'active') filter.isActive = true;
    else if (status === 'disabled') filter.isActive = false;

    const total = await User.countDocuments(filter);

    const users = await User.find(filter)
      .select('-password')
      .sort('-createdAt')
      .skip(skip)
      .limit(limit);

    // Get blog counts for each user
    const usersWithStats = await Promise.all(
      users.map(async (user) => {
        const blogCount = await Blog.countDocuments({ authorId: user._id });
        return {
          ...user.toObject(),
          blogCount
        };
      })
    );

    res.status(200).json({
      success: true,
      count: usersWithStats.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: usersWithStats
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user by ID with full details
// @route   GET /api/admin/users/:id
// @access  Private/Admin
const getUserDetails = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get user's blogs
    const blogs = await Blog.find({ authorId: user._id })
      .select('title category createdAt disabled')
      .sort('-createdAt');

    // Get followers count
    const Follow = require('../models/Follow');
    const followersCount = await Follow.countDocuments({ following: user._id });
    const followingCount = await Follow.countDocuments({ follower: user._id });

    res.status(200).json({
      success: true,
      data: {
        user: user.toObject(),
        stats: {
          totalBlogs: blogs.length,
          followersCount,
          followingCount
        },
        recentBlogs: blogs.slice(0, 5)
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle user active status (Enable/Disable)
// @route   PUT /api/admin/users/:id/toggle-status
// @access  Private/Admin
const toggleUserStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent admin from disabling themselves
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot disable your own account'
      });
    }

    // Toggle status
    user.isActive = !user.isActive;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User ${user.isActive ? 'enabled' : 'disabled'} successfully`,
      data: {
        userId: user._id,
        username: user.username,
        isActive: user.isActive
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all blogs for admin with pagination and filters
// @route   GET /api/admin/blogs?page=1&limit=10&status=all&category=Technology
// @access  Private/Admin
const getAllBlogsAdmin = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status; // 'enabled', 'disabled', 'all'
    const category = req.query.category;
    const searchTerm = req.query.search;
    const skip = (page - 1) * limit;

    // Build filter
    const filter = {};
    
    if (status === 'enabled') filter.disabled = false;
    else if (status === 'disabled') filter.disabled = true;
    
    if (category && category !== 'All') filter.category = category;
    
    if (searchTerm) {
      filter.$or = [
        { title: { $regex: searchTerm, $options: 'i' } },
        { content: { $regex: searchTerm, $options: 'i' } },
        { author: { $regex: searchTerm, $options: 'i' } }
      ];
    }

    const total = await Blog.countDocuments(filter);

    const blogs = await Blog.find(filter)
      .populate('authorId', 'username email')
      .sort('-createdAt')
      .skip(skip)
      .limit(limit);

    // Calculate average ratings
    const blogsWithStats = blogs.map(blog => {
      const avgRating = blog.ratings.length > 0
        ? (blog.ratings.reduce((sum, r) => sum + r, 0) / blog.ratings.length).toFixed(1)
        : 0;
      
      return {
        id: blog._id,
        title: blog.title,
        author: blog.author,
        authorEmail: blog.authorEmail,
        category: blog.category,
        createdAt: blog.createdAt,
        disabled: blog.disabled,
        averageRating: avgRating,
        ratingsCount: blog.ratings.length,
        commentsCount: blog.comments.length
      };
    });

    res.status(200).json({
      success: true,
      count: blogsWithStats.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: blogsWithStats
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single blog details (admin view)
// @route   GET /api/admin/blogs/:id
// @access  Private/Admin
const getBlogDetailsAdmin = async (req, res, next) => {
  try {
    const blog = await Blog.findById(req.params.id)
      .populate('authorId', 'username email isActive');

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }

    const avgRating = blog.ratings.length > 0
      ? (blog.ratings.reduce((sum, r) => sum + r, 0) / blog.ratings.length).toFixed(1)
      : 0;

    res.status(200).json({
      success: true,
      data: {
        ...blog.toObject(),
        averageRating: avgRating,
        ratingsCount: blog.ratings.length,
        commentsCount: blog.comments.length
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle blog status (Enable/Disable)
// @route   PUT /api/admin/blogs/:id/toggle-status
// @access  Private/Admin
const toggleBlogStatus = async (req, res, next) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }

    // Toggle disabled status
    blog.disabled = !blog.disabled;
    await blog.save();

    // Create notification for blog author
    const Notification = require('../models/Notification');
    const author = await User.findById(blog.authorId);
    
    if (author) {
      await Notification.create({
        recipient: author._id,
        recipientEmail: author.email,
        sender: req.user._id,
        senderName: 'Admin',
        senderEmail: req.user.email,
        type: 'comment', // Using existing enum, could add 'admin_action' later
        message: `Your blog "${blog.title}" has been ${blog.disabled ? 'disabled' : 'enabled'} by admin`,
        blogId: blog._id,
        blogTitle: blog.title
      });
    }

    res.status(200).json({
      success: true,
      message: `Blog ${blog.disabled ? 'disabled' : 'enabled'} successfully`,
      data: {
        blogId: blog._id,
        title: blog.title,
        disabled: blog.disabled
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get admin dashboard statistics
// @route   GET /api/admin/stats
// @access  Private/Admin
const getAdminStats = async (req, res, next) => {
  try {
    // User stats
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const disabledUsers = totalUsers - activeUsers;

    // Blog stats
    const totalBlogs = await Blog.countDocuments();
    const enabledBlogs = await Blog.countDocuments({ disabled: false });
    const disabledBlogs = totalBlogs - enabledBlogs;

    // Recent activity
    const recentUsers = await User.find()
      .select('username email createdAt')
      .sort('-createdAt')
      .limit(5);

    const recentBlogs = await Blog.find()
      .select('title author createdAt')
      .sort('-createdAt')
      .limit(5);

    // Get total ratings and comments
    const allBlogs = await Blog.find().select('ratings comments');
    const totalRatings = allBlogs.reduce((sum, blog) => sum + blog.ratings.length, 0);
    const totalComments = allBlogs.reduce((sum, blog) => sum + blog.comments.length, 0);

    res.status(200).json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          active: activeUsers,
          disabled: disabledUsers
        },
        blogs: {
          total: totalBlogs,
          enabled: enabledBlogs,
          disabled: disabledBlogs
        },
        engagement: {
          totalRatings,
          totalComments
        },
        recentActivity: {
          users: recentUsers,
          blogs: recentBlogs
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllUsers,
  getUserDetails,
  toggleUserStatus,
  getAllBlogsAdmin,
  getBlogDetailsAdmin,
  toggleBlogStatus,
  getAdminStats
};