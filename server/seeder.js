const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Restaurant = require('./models/Restaurant');
const Food = require('./models/Food');
const restaurants = require('./data/restaurants');

// Load env vars
dotenv.config();

// Connect to DB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Import Data
const importData = async () => {
  try {
    // Delete existing data
    await Restaurant.deleteMany();
    await Food.deleteMany();

    // Create restaurants first
    const createdRestaurants = await Restaurant.insertMany(
      restaurants.map(restaurant => ({
        ...restaurant,
        cuisine: restaurant.cuisine, // Use cuisine as-is (already an array)
        openingHours: {
          monday: { open: '09:00', close: '22:00' },
          tuesday: { open: '09:00', close: '22:00' },
          wednesday: { open: '09:00', close: '22:00' },
          thursday: { open: '09:00', close: '22:00' },
          friday: { open: '09:00', close: '23:00' },
          saturday: { open: '10:00', close: '23:00' },
          sunday: { open: '10:00', close: '22:00' }
        },
        menu: [] // Will be populated after creating food items
      }))
    );

    // Create food items and link them to restaurants
    for (let i = 0; i < createdRestaurants.length; i++) {
      const restaurant = createdRestaurants[i];
      const menuItems = restaurants[i].menu.map(item => ({
        ...item,
        restaurant: restaurant._id,
        cuisine: restaurant.cuisine[0], // Add cuisine from restaurant
        isSpicy: item.category.toLowerCase().includes('spicy') || 
                item.name.toLowerCase().includes('spicy') ||
                item.description.toLowerCase().includes('spicy'),
        spiceLevel: item.category.toLowerCase().includes('spicy') ? 3 : 
                   item.name.toLowerCase().includes('spicy') ? 2 : 0,
        preparationTime: 15, // Default preparation time
        ingredients: [], // Empty ingredients array
        nutritionalInfo: {
          calories: Math.floor(Math.random() * 500) + 200, // Random calories between 200-700
          protein: Math.floor(Math.random() * 30) + 10, // Random protein between 10-40g
          carbs: Math.floor(Math.random() * 50) + 20, // Random carbs between 20-70g
          fat: Math.floor(Math.random() * 20) + 5 // Random fat between 5-25g
        },
        rating: restaurant.rating - (Math.random() * 0.5), // Slightly lower than restaurant rating
        reviews: [] // Empty reviews array
      }));
      
      const createdFoodItems = await Food.insertMany(menuItems);
      
      // Update restaurant with food item IDs
      await Restaurant.findByIdAndUpdate(restaurant._id, {
        menu: createdFoodItems.map(item => item._id)
      });
    }

    console.log('Data Imported!');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

// Delete Data
const destroyData = async () => {
  try {
    await Restaurant.deleteMany();
    await Food.deleteMany();
    console.log('Data Destroyed!');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

if (process.argv[2] === '-d') {
  destroyData();
} else {
  importData();
} 