const express = require('express');
const router = express.Router();
const {getProfile, updateProfile, changePassword, getAllUsers, getUserById, updateUserRole, deleteUser} = require('../controllers/userController.js');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const { updateProfileValidation, changePasswordValidation, validate } = require('../utils/validators');

// Protected routes (authentication required)
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfileValidation, validate, updateProfile);
router.put('/change-password', protect, changePasswordValidation, validate, changePassword);

// Admin only routes (authentication + admin role required)
router.get('/', protect, authorize('admin'), getAllUsers);
router.get('/:id', protect, authorize('admin'), getUserById);
router.put('/:id/role', protect, authorize('admin'), updateUserRole);
router.delete('/:id', protect, authorize('admin'), deleteUser);

module.exports = router;