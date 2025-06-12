const Restaurant = require('../models/Restaurant');
const User = require('../models/User');

// @desc    Get all restaurants
// @route   GET /api/restaurants
// @access  Public
exports.getRestaurants = async (req, res) => {
  try {
    const { search, cuisine, minRating, sortBy, page = 1, limit = 10 } = req.query;
    let query = {};

    // Search by name or description
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Filter by cuisine
    if (cuisine) {
      query.cuisine = { $in: [cuisine] };
    }

    // Filter by minimum rating
    if (minRating) {
      query.rating = { $gte: parseFloat(minRating) };
    }

    // Sort options
    let sort = {};
    switch (sortBy) {
      case 'rating':
        sort = { rating: -1 };
        break;
      case 'price':
        sort = { name: 1 }; // Default to name sort for price
        break;
      case 'name':
        sort = { name: 1 };
        break;
      default:
        sort = { rating: -1 };
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Get total count for pagination
    const total = await Restaurant.countDocuments(query);
    
    // Get restaurants with pagination and populate menu
    const restaurants = await Restaurant.find(query)
      .populate('menu')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    // Ensure menu items are properly structured
    const processedRestaurants = restaurants.map(restaurant => ({
      ...restaurant,
      menu: Array.isArray(restaurant.menu) ? restaurant.menu : []
    }));

    res.json({
      restaurants: processedRestaurants,
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      totalRestaurants: total
    });
  } catch (error) {
    console.error('Error in getRestaurants:', error);
    res.status(500).json({ 
      message: 'Server error while fetching restaurants',
      error: error.message 
    });
  }
};

// @desc    Get restaurant by ID
// @route   GET /api/restaurants/:id
// @access  Public
exports.getRestaurantById = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id)
      .populate('menu');

    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }
    res.json(restaurant);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Add restaurant to favorites
// @route   POST /api/restaurants/:id/favorite
// @access  Private
exports.addToFavorites = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if restaurant is already in favorites
    if (user.favorites.includes(req.params.id)) {
      return res.status(400).json({ 
        message: 'Restaurant already in favorites',
        isFavorite: true
      });
    }

    user.favorites.push(req.params.id);
    await user.save();

    res.json({ 
      message: 'Restaurant added to favorites',
      isFavorite: true
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Remove restaurant from favorites
// @route   DELETE /api/restaurants/:id/favorite
// @access  Private
exports.removeFromFavorites = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.favorites = user.favorites.filter(
      (id) => id.toString() !== req.params.id
    );
    await user.save();

    res.json({ 
      message: 'Restaurant removed from favorites',
      isFavorite: false
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Check if restaurant is in favorites
// @route   GET /api/restaurants/:id/favorite
// @access  Private
exports.checkFavoriteStatus = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isFavorite = user.favorites.includes(req.params.id);
    res.json({ isFavorite });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get featured restaurants
// @route   GET /api/restaurants/featured
// @access  Public
exports.getFeaturedRestaurants = async (req, res) => {
  try {
    const restaurants = await Restaurant.find({ isActive: true })
      .sort({ rating: -1 })
      .limit(6)
      .populate({
        path: 'menu',
        select: 'name price image description category',
        options: { lean: true }
      })
      .lean();

    // Process restaurants to ensure proper image handling
    const processedRestaurants = restaurants.map(restaurant => ({
      ...restaurant,
      image: restaurant.images?.[0]?.url || '/images/restaurant-placeholder.svg',
      menu: Array.isArray(restaurant.menu) ? restaurant.menu : []
    }));

    if (!restaurants || restaurants.length === 0) {
      return res.status(404).json({ message: 'No featured restaurants found' });
    }

    res.json(processedRestaurants);
  } catch (error) {
    console.error('Error in getFeaturedRestaurants:', error);
    res.status(500).json({ 
      message: 'Error fetching featured restaurants',
      error: error.message 
    });
  }
};

// @desc    Add review to restaurant
// @route   POST /api/restaurants/:id/reviews
// @access  Private
exports.addReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const restaurant = await Restaurant.findById(req.params.id);

    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    const review = {
      user: req.user._id,
      name: req.user.name,
      rating: Number(rating),
      comment,
    };

    restaurant.reviews.push(review);

    // Calculate new average rating
    const totalRating = restaurant.reviews.reduce((acc, item) => item.rating + acc, 0);
    restaurant.rating = totalRating / restaurant.reviews.length;

    await restaurant.save();
    res.status(201).json(review);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Upload restaurant images
// @route   POST /api/restaurants/:id/images
// @access  Private (admin or restaurant owner)
exports.uploadRestaurantImages = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);

    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No images uploaded' });
    }

    const newImages = req.files.map(file => ({
      url: `/uploads/restaurants/${file.filename}`,
      // public_id: '' // In a real app, integrate with a cloud storage service like Cloudinary to get public_id
    }));

    // Add new images to the restaurant's images array
    restaurant.images = [...restaurant.images, ...newImages];
    await restaurant.save();

    res.status(200).json({
      message: 'Images uploaded successfully',
      images: restaurant.images
    });

  } catch (error) {
    console.error('Error uploading restaurant images:', error);
    res.status(500).json({ 
      message: 'Error uploading restaurant images',
      error: error.message 
    });
  }
}; 

// @desc    Create a new restaurant
// @route   POST /api/restaurants
// @access  Private (Admin/Restaurant Owner)
exports.createRestaurant = async (req, res) => {
  try {
    const { name, description, cuisine, address, phone, email, openingHours } = req.body;

    // Basic validation
    if (!name || !description || !cuisine || !address || !phone || !email) {
      return res.status(400).json({ message: 'Please enter all required fields.' });
    }

    const newRestaurant = new Restaurant({
      name,
      description,
      cuisine,
      address,
      phone,
      email,
      openingHours,
      isActive: true, // New restaurants are active by default
    });

    const savedRestaurant = await newRestaurant.save();
    res.status(201).json(savedRestaurant);

  } catch (error) {
    console.error('Error creating restaurant:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}; 