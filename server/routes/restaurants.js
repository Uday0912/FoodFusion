const express = require('express');
const router = express.Router();
const Restaurant = require('../models/Restaurant');
const Food = require('../models/Food');
const auth = require('../middleware/auth');
const restaurants = require('../data/restaurants');
const restaurantController = require('../controllers/restaurantController');
const path = require('path');
const multer = require('multer');

// Configure multer for restaurant image upload
const restaurantImageStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/restaurants'); // Save images to uploads/restaurants directory
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'restaurant-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const uploadRestaurantImages = multer({
  storage: restaurantImageStorage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit per image
  },
  fileFilter: function (req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
      return cb(new Error('Only image files (jpg, jpeg, png, gif) are allowed!'), false);
    }
    cb(null, true);
  }
});

// Initialize restaurants in the database
const initializeRestaurants = async () => {
  console.log('Attempting to initialize restaurants...');
  try {
    const count = await Restaurant.countDocuments();
    console.log(`Current restaurant count: ${count}`);
    if (count === 0) {
      console.log('No restaurants found, proceeding with initialization...');
      for (const restaurantData of restaurants) {
        // Create restaurant first to get its _id
        const restaurant = new Restaurant({
          name: restaurantData.name,
          description: restaurantData.description,
          cuisine: restaurantData.cuisine,
          rating: restaurantData.rating,
          images: restaurantData.images,
          email: restaurantData.email,
          phone: restaurantData.phone,
          address: restaurantData.address,
          isActive: true, // Set isActive to true for all initial restaurants
          // Menu will be added after food items are created
        });

        await restaurant.save();

        // Now create food items, associating them with the restaurant's _id
        const foodItems = await Promise.all(
          restaurantData.menu.map(async (menuItem) => {
            const food = new Food({
              name: menuItem.name,
              description: menuItem.description,
              price: menuItem.price,
              image: menuItem.image,
              category: menuItem.category,
              restaurant: restaurant._id, // Assign the restaurant ID
              cuisine: restaurantData.cuisine // Assign restaurant's cuisine
            });
            return await food.save();
          })
        );

        // Update the restaurant with references to food items
        restaurant.menu = foodItems.map(food => food._id);
        await restaurant.save();
      }
      console.log('Sample restaurants and food items added to the database');
    }
  } catch (error) {
    console.error('Error initializing restaurants:', error);
  }
};

// Call initializeRestaurants when the server starts
initializeRestaurants();

// Get featured restaurants
router.get('/featured', async (req, res) => {
  try {
    const restaurants = await Restaurant.find({ isActive: true })
      .sort({ rating: -1 })
      .limit(6)
      .populate({
        path: 'menu',
        select: 'name price image description category',
        options: { lean: true }
      })
      .populate({
        path: 'images',
        select: 'url',
        options: { lean: true }
      })
      .lean();
    
    if (!restaurants) {
      return res.status(404).json({ message: 'No featured restaurants found' });
    }

    res.json(restaurants);
  } catch (error) {
    console.error('Error fetching featured restaurants:', error);
    res.status(500).json({ 
      message: 'Error fetching featured restaurants',
      error: error.message 
    });
  }
});

// Get all restaurants with filtering and sorting
router.get('/', restaurantController.getRestaurants);

// Get restaurant by ID
router.get('/:id', restaurantController.getRestaurantById);

// Add a review to a restaurant
router.post('/:id/reviews', auth, async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const restaurant = await Restaurant.findById(req.params.id);
    
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    restaurant.reviews.push({
      user: req.user._id,
      rating,
      comment,
      date: new Date()
    });

    // Update average rating
    const totalRating = restaurant.reviews.reduce((sum, review) => sum + review.rating, 0);
    restaurant.rating = totalRating / restaurant.reviews.length;

    await restaurant.save();
    res.json(restaurant);
  } catch (error) {
    console.error('Error adding review:', error);
    res.status(500).json({ message: 'Error adding review' });
  }
});

// Search restaurants by location
router.get('/search/location', async (req, res) => {
  try {
    const { latitude, longitude, radius } = req.query;
    const restaurants = await Restaurant.find({
      'address.coordinates': {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [longitude, latitude]
          },
          $maxDistance: radius || 5000 // Default 5km radius
        }
      }
    });

    res.json(restaurants);
  } catch (error) {
    res.status(500).json({ message: 'Error searching restaurants', error: error.message });
  }
});

// Get restaurant menu
router.get('/:id/menu', async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id)
      .populate('menu');

    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    res.json(restaurant.menu);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching menu', error: error.message });
  }
});

// Add food item to restaurant menu
router.post('/:id/menu', auth, async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);

    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    const food = new Food({
      ...req.body,
      restaurant: restaurant._id
    });

    await food.save();
    restaurant.menu.push(food._id);
    await restaurant.save();

    res.status(201).json(food);
  } catch (error) {
    res.status(500).json({ message: 'Error adding food item', error: error.message });
  }
});

// Upload restaurant images
router.post('/:id/images', auth, uploadRestaurantImages.array('images', 5), restaurantController.uploadRestaurantImages);

// @route   POST /api/restaurants
// @desc    Create a new restaurant
// @access  Private (Admin/Restaurant Owner)
router.post('/', auth, restaurantController.createRestaurant);

module.exports = router; 