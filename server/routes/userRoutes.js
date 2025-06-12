const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getDashboardData, updateProfile } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

// @desc    Register a new user
// @route   POST /api/users
// @access  Public
router.post('/', registerUser);

// @desc    Authenticate user & get token
// @route   POST /api/users/login
// @access  Public
router.post('/login', loginUser);

// @desc    Get user profile (using getDashboardData for now)
// @route   GET /api/users/profile
// @access  Private
router.get('/profile', protect, getDashboardData);

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
router.put('/profile', protect, updateProfile);

// Assuming you might have other user-related routes here (e.g., favorites, orders)
// router.get('/favorites', protect, getUserFavorites);
// router.get('/orders', protect, getUserOrders);

module.exports = router; 