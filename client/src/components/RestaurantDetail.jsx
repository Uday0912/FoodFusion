import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Rating,
  Chip,
  Button,
  Divider,
  CircularProgress,
  Alert,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField
} from '@mui/material';
import {
  Favorite,
  FavoriteBorder,
  Add as AddIcon,
  Remove as RemoveIcon,
  ShoppingCart as CartIcon
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const RestaurantDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cart, setCart] = useState({});
  const [reviewDialog, setReviewDialog] = useState(false);
  const [review, setReview] = useState({ rating: 0, comment: '' });

  useEffect(() => {
    fetchRestaurant();
  }, [id]);

  const fetchRestaurant = async () => {
    try {
      const response = await axios.get(`/api/restaurants/${id}`);
      setRestaurant(response.data);
    } catch (error) {
      setError('Error fetching restaurant details');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (foodId) => {
    setCart(prev => ({
      ...prev,
      [foodId]: (prev[foodId] || 0) + 1
    }));
  };

  const handleRemoveFromCart = (foodId) => {
    setCart(prev => {
      const newCart = { ...prev };
      if (newCart[foodId] > 1) {
        newCart[foodId]--;
      } else {
        delete newCart[foodId];
      }
      return newCart;
    });
  };

  const handleReviewSubmit = async () => {
    try {
      await axios.post(`/api/restaurants/${id}/reviews`, review);
      setReviewDialog(false);
      fetchRestaurant();
    } catch (error) {
      setError('Error submitting review');
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  if (!restaurant) {
    return (
      <Container sx={{ py: 4 }}>
        <Alert severity="info">Restaurant not found</Alert>
      </Container>
    );
  }

  return (
    <Container sx={{ py: 4 }}>
      {/* Restaurant Header */}
      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <CardMedia
            component="img"
            height="400"
            image={restaurant.images[0]?.url || '/placeholder.jpg'}
            alt={restaurant.name}
            sx={{ borderRadius: 2 }}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <Box sx={{ mb: 2 }}>
            <Typography variant="h4" component="h1" gutterBottom>
              {restaurant.name}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Rating value={restaurant.rating} precision={0.5} readOnly />
              <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                ({restaurant.reviews?.length || 0} reviews)
              </Typography>
            </Box>
            <Typography variant="body1" color="text.secondary" paragraph>
              {restaurant.description}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
              {restaurant.cuisine.map((c) => (
                <Chip key={c} label={c} color="primary" />
              ))}
            </Box>
            <Typography variant="subtitle1" gutterBottom>
              Address: {restaurant.address.street}, {restaurant.address.city}
            </Typography>
            <Typography variant="subtitle1" gutterBottom>
              Phone: {restaurant.phone}
            </Typography>
            {user && (
              <Button
                variant="outlined"
                color="primary"
                onClick={() => setReviewDialog(true)}
                sx={{ mt: 2 }}
              >
                Write a Review
              </Button>
            )}
          </Box>
        </Grid>
      </Grid>

      <Divider sx={{ my: 4 }} />

      {/* Menu Section */}
      <Typography variant="h5" component="h2" gutterBottom>
        Menu
      </Typography>
      <Grid container spacing={3}>
        {restaurant.menu.map((food) => (
          <Grid item key={food._id} xs={12} sm={6} md={4}>
            <Card>
              <CardMedia
                component="img"
                height="200"
                image={food.images[0]?.url || '/placeholder.jpg'}
                alt={food.name}
              />
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {food.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  {food.description}
                </Typography>
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  mt: 'auto'
                }}>
                  <Typography variant="h6" color="primary">
                    ₹{(food.price || 0).toFixed(2)}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <IconButton
                      size="small"
                      onClick={() => handleRemoveFromCart(food._id)}
                      disabled={!cart[food._id]}
                    >
                      <RemoveIcon />
                    </IconButton>
                    <Typography
                      variant="body1"
                      component="span"
                      sx={{ mx: 1 }}
                    >
                      {cart[food._id] || 0}
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={() => handleAddToCart(food._id)}
                    >
                      <AddIcon />
                    </IconButton>
                    <Button
                      variant="contained"
                      startIcon={<CartIcon />}
                      size="small"
                      onClick={() => {
                        // Ensure we have a complete menu item object
                        const menuItem = {
                          _id: food._id,
                          name: food.name,
                          price: food.price,
                          image: food.images[0]?.url,
                          description: food.description
                        };
                        handleAddToCart(menuItem._id);
                      }}
                    >
                      Add
                    </Button>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {food.isVeg && (
                    <Chip
                      label="Vegetarian"
                      color="success"
                      size="small"
                    />
                  )}
                  {food.isSpicy && (
                    <Chip
                      label={`Spicy Level: ${food.spiceLevel}`}
                      color="error"
                      size="small"
                    />
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Review Dialog */}
      <Dialog open={reviewDialog} onClose={() => setReviewDialog(false)}>
        <DialogTitle>Write a Review</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Rating
              value={review.rating}
              onChange={(event, newValue) => {
                setReview(prev => ({ ...prev, rating: newValue }));
              }}
            />
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Your Review"
              value={review.comment}
              onChange={(e) =>
                setReview(prev => ({ ...prev, comment: e.target.value }))
              }
              sx={{ mt: 2 }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReviewDialog(false)}>Cancel</Button>
          <Button
            onClick={handleReviewSubmit}
            variant="contained"
            disabled={!review.rating}
          >
            Submit
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default RestaurantDetail; 