const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/authController');
const { registerValidation, loginValidation, validate } = require('../utils/validators');

// Public routes
router.post('/register', registerValidation, validate, register);
router.post('/login', loginValidation, validate, login);

module.exports = router;