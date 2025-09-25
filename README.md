# FoodFusion - Modern Food Delivery Platform

A feature-rich food delivery application built with the MERN stack, offering a seamless experience for ordering food from your favorite restaurants. Experience the future of food delivery with our modern, user-friendly platform.

## Features

### User Features
- User Authentication (Login/Signup)
- User Profile Management
- Order History Tracking
- Favorites System
- Reviews and Ratings System

### Restaurant Features
- Restaurant Listings with Detailed Information
- Restaurant Search and Filtering
  - Text-based search
  - Cuisine-based filtering
  - Rating-based filtering
  - Price range filtering
- Restaurant Details Page
  - Menu items with images
  - Restaurant information
  - Reviews and ratings

### Food Features
- Food Categories (Veg/Non-veg, Cuisines)
- Food Item Details
  - Images
  - Descriptions
  - Pricing
  - Customization options
- Dietary Preferences Filtering

### Order Features
- Shopping Cart System
- Checkout Process
- Order Tracking
- Order History
- Order Details View

### Admin Features
- Restaurant Management
  - Add/Edit/Delete Restaurants
  - Manage Menu Items
  - Upload Restaurant Images
- User Management
- Order Management

### UI/UX Features
- Responsive Design
- Modern Material UI Components
- Interactive Search Interface
- Real-time Updates
- Loading States and Error Handling
- User-friendly Navigation

## Tech Stack

- Frontend: React.js, HTML, CSS, JavaScript
- Backend: Node.js, Express.js
- Database: MongoDB
- Image Storage: Cloudinary

## Project Structure

```
food-delivery/
├── client/                 # React frontend
│   ├── public/
│   └── src/
│       ├── components/
│       ├── pages/
│       ├── context/
│       ├── utils/
│       └── assets/
└── server/                 # Node.js backend
    ├── controllers/
    ├── models/
    ├── routes/
    ├── middleware/
    └── config/
```

## Setup Instructions

1. Clone the repository
2. Install dependencies:
   ```bash
   # Install backend dependencies
   cd server
   npm install

   # Install frontend dependencies
   cd ../client
   npm install
   ```

3. Create a .env file in the server directory with the following variables:
   ```
   MONGODB_URI=your_mongodb_uri
   JWT_SECRET=your_jwt_secret
   CLOUDINARY_CLOUD_NAME=your_cloudinary_name
   CLOUDINARY_API_KEY=your_cloudinary_key
   CLOUDINARY_API_SECRET=your_cloudinary_secret
   ```

4. Start the development servers:
   ```bash
   # Start backend server
   cd server
   npm run dev

   # Start frontend server
   cd ../client
   npm start
   ```

## Features Implementation

### Authentication
- User registration and login
- JWT-based authentication
- Password hashing

### Food Search
- Text-based search
- Location-based filtering
- Category-based filtering (Veg/Non-veg)
- Cuisine-based filtering

### Restaurant Features
- Restaurant listings
- Restaurant details
- Menu items
- Ratings and reviews

### Image Search
- Upload food images
- Image-based restaurant/food search

### User Features
- User profile
- Order history
- Favorites
- Reviews and ratings # trigger redeploy 
