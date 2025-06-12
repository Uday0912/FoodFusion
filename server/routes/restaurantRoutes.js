const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getRestaurants,
  getRestaurantById,
  addToFavorites,
  removeFromFavorites,
  getFeaturedRestaurants,
  addReview,
  checkFavoriteStatus
} = require('../controllers/restaurantController');

router.get('/', getRestaurants);
router.get('/featured', getFeaturedRestaurants);
router.get('/:id', getRestaurantById);
router.get('/:id/favorite', protect, checkFavoriteStatus);
router.post('/:id/favorite', protect, addToFavorites);
router.delete('/:id/favorite', protect, removeFromFavorites);
router.post('/:id/reviews', protect, addReview);

module.exports = router; 