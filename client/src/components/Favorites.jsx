import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Box,
  Rating,
  Chip,
  IconButton,
  CircularProgress,
  Alert
} from '@mui/material';
import { Favorite as FavoriteIcon } from '@mui/icons-material';
import axios from 'axios';

const Favorites = () => {
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/users/favorites', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setFavorites(response.data);
      setError('');
    } catch (err) {
      setError('Failed to fetch favorites');
      console.error('Error fetching favorites:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavorite = async (restaurantId) => {
    try {
      await axios.delete(`/api/restaurants/${restaurantId}/favorite`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setFavorites(favorites.filter(fav => fav._id !== restaurantId));
    } catch (err) {
      setError('Failed to remove from favorites');
      console.error('Error removing favorite:', err);
    }
  };

  const handleRestaurantClick = (restaurantId) => {
    navigate(`/restaurants/${restaurantId}`);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Favorite Restaurants
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {favorites.length === 0 ? (
        <Typography variant="body1" color="text.secondary" align="center">
          You haven't added any restaurants to your favorites yet.
        </Typography>
      ) : (
        <Grid container spacing={3}>
          {favorites.map((restaurant) => (
            <Grid item xs={12} sm={6} md={4} key={restaurant._id}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative'
                }}
              >
                <IconButton
                  sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.9)'
                    }
                  }}
                  onClick={() => handleRemoveFavorite(restaurant._id)}
                >
                  <FavoriteIcon color="error" />
                </IconButton>

                <CardMedia
                  component="img"
                  height="200"
                  image={restaurant.image || '/images/restaurant-placeholder.svg'}
                  alt={restaurant.name}
                  sx={{ cursor: 'pointer' }}
                  onClick={() => handleRestaurantClick(restaurant._id)}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/images/restaurant-placeholder.svg';
                  }}
                />
                <CardContent>
                  <Typography
                    variant="h6"
                    component="h2"
                    gutterBottom
                    sx={{ cursor: 'pointer' }}
                    onClick={() => handleRestaurantClick(restaurant._id)}
                  >
                    {restaurant.name}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Rating value={restaurant.rating} precision={0.5} readOnly />
                    <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                      ({restaurant.rating})
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {restaurant.cuisine}
                  </Typography>
                  <Box sx={{ mt: 1 }}>
                    {restaurant.tags.map((tag) => (
                      <Chip
                        key={tag}
                        label={tag}
                        size="small"
                        sx={{ mr: 0.5, mb: 0.5 }}
                      />
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default Favorites; 