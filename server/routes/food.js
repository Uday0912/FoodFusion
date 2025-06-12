const express = require('express');
const router = express.Router();
const Food = require('../models/Food');
const auth = require('../middleware/auth');
const foodController = require('../controllers/foodController');
const Restaurant = require('../models/Restaurant');

// Get all food items with filters
router.get('/', async (req, res) => {
  try {
    const { cuisine, category, isVeg, isSpicy, search, minPrice, maxPrice } = req.query;
    const query = {};

    if (cuisine) query.cuisine = cuisine;
    if (category) query.category = category;
    if (isVeg) query.isVeg = isVeg === 'true';
    if (isSpicy) query.isSpicy = isSpicy === 'true';
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }
    if (search) {
      query.$text = { $search: search };
    }

    const foods = await Food.find(query)
      .populate('restaurant', 'name address')
      .sort({ rating: -1 });

    res.json(foods);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching food items', error: error.message });
  }
});

// Get food item by ID
router.get('/:id', async (req, res) => {
  try {
    const food = await Food.findById(req.params.id)
      .populate('restaurant')
      .populate('reviews.user', 'name');

    if (!food) {
      return res.status(404).json({ message: 'Food item not found' });
    }

    res.json(food);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching food item', error: error.message });
  }
});

// Add food review
router.post('/:id/reviews', auth, async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const food = await Food.findById(req.params.id);

    if (!food) {
      return res.status(404).json({ message: 'Food item not found' });
    }

    // Check if user has already reviewed
    const existingReview = food.reviews.find(
      review => review.user.toString() === req.user._id.toString()
    );

    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this food item' });
    }

    food.reviews.push({
      user: req.user._id,
      rating,
      comment
    });

    // Update average rating
    const totalRating = food.reviews.reduce((sum, review) => sum + review.rating, 0);
    food.rating = totalRating / food.reviews.length;

    await food.save();
    res.json(food);
  } catch (error) {
    res.status(500).json({ message: 'Error adding review', error: error.message });
  }
});

// Search food by image
router.post('/search/image', async (req, res) => {
  try {
    // This is a placeholder for image search functionality
    // You would need to implement image recognition/classification here
    // For now, we'll return a message
    res.json({ message: 'Image search functionality to be implemented' });
  } catch (error) {
    res.status(500).json({ message: 'Error searching food by image', error: error.message });
  }
});

// Get food items by category
router.get('/category/:category', async (req, res) => {
  try {
    const foods = await Food.find({ category: req.params.category })
      .populate('restaurant', 'name address')
      .sort({ rating: -1 });

    res.json(foods);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching food items by category', error: error.message });
  }
});

// Get food items by cuisine
router.get('/cuisine/:cuisine', async (req, res) => {
  try {
    const foods = await Food.find({ cuisine: req.params.cuisine })
      .populate('restaurant', 'name address')
      .sort({ rating: -1 });

    res.json(foods);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching food items by cuisine', error: error.message });
  }
});

// Update food item by ID
router.put('/:id', auth, foodController.updateFoodItem);

// Delete food item by ID
router.delete('/:id', auth, async (req, res) => {
  try {
    const food = await Food.findById(req.params.id);

    if (!food) {
      return res.status(404).json({ message: 'Food item not found' });
    }

    // Check if user is admin or restaurant owner
    const restaurant = await Restaurant.findById(food.restaurant);
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    if (req.user.role !== 'admin' && restaurant.owner.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized to delete this food item' });
    }

    // Remove food item from restaurant's menu
    await Restaurant.findByIdAndUpdate(food.restaurant, {
      $pull: { menu: food._id }
    });

    // Delete the food item
    await food.deleteOne();

    res.json({ message: 'Food item deleted successfully' });
  } catch (error) {
    console.error('Error deleting food item:', error);
    res.status(500).json({ message: 'Error deleting food item', error: error.message });
  }
});

module.exports = router; 