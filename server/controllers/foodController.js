const Food = require('../models/Food');

// @desc    Update food item by ID
// @route   PUT /api/food/:id
// @access  Private (Admin only or Restaurant owner)
exports.updateFoodItem = async (req, res) => {
  try {
    const food = await Food.findById(req.params.id);

    if (!food) {
      return res.status(404).json({ message: 'Food item not found' });
    }

    // Only allow updates to certain fields
    const allowedUpdates = ['name', 'description', 'price', 'category', 'isAvailable', 'isVegetarian', 'isSpicy', 'spiceLevel', 'preparationTime', 'image', 'ingredients', 'nutritionalInfo'];
    const updates = Object.keys(req.body);
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update));

    if (!isValidOperation) {
      return res.status(400).json({ message: 'Invalid updates!' });
    }

    updates.forEach((update) => (food[update] = req.body[update]));
    await food.save();

    res.json(food);
  } catch (error) {
    console.error('Error updating food item:', error);
    res.status(500).json({ message: 'Error updating food item', error: error.message });
  }
}; 