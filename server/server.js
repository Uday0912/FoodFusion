// const express = require('express');
// const cors = require('cors');
// const mongoose = require('mongoose');
// const dotenv = require('dotenv');
// const restaurantRoutes = require('./routes/restaurants');
// const userRoutes = require('./routes/users');
// const orderRoutes = require('./routes/orders');
// const authRoutes = require('./routes/auth');
// const paymentRoutes = require('./routes/payments');
// const path = require('path');
// const cron = require('node-cron');
// const updateOrderStatuses = require('./utils/orderStatusUpdater');

// // Load env vars
// dotenv.config();

// const app = express();

// // Middleware
// app.use(express.json());

// // CORS configuration
// app.use(cors({
//   origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
//   credentials: true,
//   methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
//   allowedHeaders: ['Content-Type', 'Authorization']
// }));

// // Handle preflight requests for all routes
// app.options('*', cors());

// // Serve static files from the 'public' directory
// app.use(express.static(path.join(__dirname, 'public')));

// // Explicitly serve images from the public/images directory
// app.use('/images', express.static(path.join(__dirname, 'public', 'images')));

// // Serve static files from the 'uploads' directory
// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// // Routes
// app.use('/api/auth', authRoutes);
// app.use('/api/restaurants', restaurantRoutes);
// app.use('/api/users', userRoutes);
// app.use('/api/orders', orderRoutes);
// app.use('/api/payments', paymentRoutes);

// // Welcome route
// app.get('/', (req, res) => {
//   res.json({ message: 'Welcome to Food Fusion API' });
// });

// // 404 handler
// app.use((req, res) => {
//   res.status(404).json({ message: 'Route not found' });
// });

// // Error handler
// app.use((err, req, res, next) => {
//   console.error(err.stack);
//   res.status(500).json({ message: 'Something went wrong!' });
// });

// // Connect to MongoDB
// mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/food-delivery')
//   .then(() => {
//     console.log('MongoDB Connected:', process.env.MONGODB_URI || 'localhost');
//   })
//   .catch((err) => {
//     console.error('MongoDB connection error:', err);
//   });

// // Schedule the order status update job to run every minute
// cron.schedule('* * * * *', () => {
//   console.log('Running scheduled order status update...');
//   updateOrderStatuses();
//   });

// const PORT = process.env.PORT || 5001;
// app.listen(PORT, () => {
//   console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
// }); 



// const express = require('express');
// const cors = require('cors');
// const mongoose = require('mongoose');
// const dotenv = require('dotenv');
// const path = require('path');
// const cron = require('node-cron');
// const restaurantRoutes = require('./routes/restaurants');
// const userRoutes = require('./routes/users');
// const orderRoutes = require('./routes/orders');
// const authRoutes = require('./routes/auth');
// const paymentRoutes = require('./routes/payments');
// const updateOrderStatuses = require('./utils/orderStatusUpdater');

// // Load environment variables
// dotenv.config();

// const app = express();

// // Middleware
// app.use(express.json());

// // CORS configuration
// app.use(cors({
//   origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
//   credentials: true,
//   methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
//   allowedHeaders: ['Content-Type', 'Authorization']
// }));

// app.options('*', cors());

// // Serve static files from backend public directories
// app.use(express.static(path.join(__dirname, 'public')));
// app.use('/images', express.static(path.join(__dirname, 'public', 'images')));
// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// // Serve React frontend
// app.use(express.static(path.join(__dirname, '../client/build')));
// app.get('*', (req, res) => {
//   res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
// });

// // API Routes
// app.use('/api/auth', authRoutes);
// app.use('/api/restaurants', restaurantRoutes);
// app.use('/api/users', userRoutes);
// app.use('/api/orders', orderRoutes);
// app.use('/api/payments', paymentRoutes);

// // Welcome route for API (optional)
// app.get('/api', (req, res) => {
//   res.json({ message: 'Welcome to Food Fusion API' });
// });

// // 404 handler
// app.use((req, res) => {
//   res.status(404).json({ message: 'Route not found' });
// });

// // Error handler
// app.use((err, req, res, next) => {
//   console.error(err.stack);
//   res.status(500).json({ message: 'Something went wrong!' });
// });

// // Connect to MongoDB
// mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/food-delivery')
//   .then(() => console.log('MongoDB Connected:', process.env.MONGODB_URI || 'localhost'))
//   .catch(err => console.error('MongoDB connection error:', err));

// // Schedule order status updates
// cron.schedule('* * * * *', () => {
//   console.log('Running scheduled order status update...');
//   updateOrderStatuses();
// });

// // Start server
// const PORT = process.env.PORT || 5001;
// app.listen(PORT, () => {
//   console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
// });





const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const cron = require('node-cron');

const restaurantRoutes = require('./routes/restaurants');
const userRoutes = require('./routes/users');
const orderRoutes = require('./routes/orders');
const authRoutes = require('./routes/auth');
const paymentRoutes = require('./routes/payments');
const updateOrderStatuses = require('./utils/orderStatusUpdater');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(express.json());

// CORS configuration
const allowedOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  process.env.FRONTEND_URL
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.options('*', cors());

// Serve backend static files
app.use(express.static(path.join(__dirname, 'public')));
app.use('/images', express.static(path.join(__dirname, 'public', 'images')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/users', userRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);

// Serve React frontend in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
  });
}

// Welcome route
app.get('/api', (req, res) => {
  res.json({ message: 'Welcome to Food Fusion API' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB Connected'))
.catch(err => console.error('MongoDB connection error:', err));

// Schedule order status updates
cron.schedule('* * * * *', () => {
  console.log('Running scheduled order status update...');
  updateOrderStatuses();
});

// Start server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
