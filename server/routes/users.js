const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Restaurant = require('../models/Restaurant');
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/avatars');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'avatar-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
  }
});

// Get user profile
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-password')
      .populate('favorites')
      .populate('orderHistory');

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user profile', error: error.message });
  }
});

// Update user profile
router.put('/profile', auth, async (req, res) => {
  try {
    console.log('Profile update request body:', req.body);
    console.log('User object before update:', req.user);
    const updates = Object.keys(req.body);
    const allowedUpdates = ['name', 'email', 'phone', 'address'];
    const isValidOperation = updates.every(update => allowedUpdates.includes(update));

    if (!isValidOperation) {
      return res.status(400).json({ message: 'Invalid updates' });
    }

    updates.forEach(update => req.user[update] = req.body[update]);
    await req.user.save();

    res.json({
      message: 'Profile updated successfully',
      user: req.user
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating profile', error: error.message });
  }
});

// Add restaurant to favorites
router.post('/favorites/:restaurantId', auth, async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.restaurantId);
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    // Check if already in favorites
    if (req.user.favorites.includes(restaurant._id)) {
      return res.status(400).json({ message: 'Restaurant already in favorites' });
    }

    req.user.favorites.push(restaurant._id);
    await req.user.save();

    res.json({
      message: 'Restaurant added to favorites',
      favorites: req.user.favorites
    });
  } catch (error) {
    res.status(500).json({ message: 'Error adding to favorites', error: error.message });
  }
});

// Remove restaurant from favorites
router.delete('/favorites/:restaurantId', auth, async (req, res) => {
  try {
    const restaurantId = req.params.restaurantId;
    
    // Check if restaurant is in favorites
    if (!req.user.favorites.includes(restaurantId)) {
      return res.status(400).json({ message: 'Restaurant not in favorites' });
    }

    req.user.favorites = req.user.favorites.filter(
      id => id.toString() !== restaurantId
    );
    await req.user.save();

    res.json({
      message: 'Restaurant removed from favorites',
      favorites: req.user.favorites
    });
  } catch (error) {
    res.status(500).json({ message: 'Error removing from favorites', error: error.message });
  }
});

// Get user's favorite restaurants
router.get('/favorites', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('favorites');

    res.json(user.favorites);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching favorites', error: error.message });
  }
});

// Check if restaurant is in favorites
router.get('/favorites/:restaurantId', auth, async (req, res) => {
  try {
    const restaurantId = req.params.restaurantId;
    const isFavorite = req.user.favorites.includes(restaurantId);
    
    res.json({ isFavorite });
  } catch (error) {
    res.status(500).json({ message: 'Error checking favorite status', error: error.message });
  }
});

// Get user's order history
router.get('/orders', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('orderHistory');

    res.json(user.orderHistory);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching order history', error: error.message });
  }
});

// Upload avatar
router.post('/avatar', auth, upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Update user's avatar field with the file path
    req.user.avatar = `/uploads/avatars/${req.file.filename}`;
    await req.user.save();

    res.json({
      message: 'Avatar uploaded successfully',
      user: req.user
    });
  } catch (error) {
    res.status(500).json({ message: 'Error uploading avatar', error: error.message });
  }
});

module.exports = router; 