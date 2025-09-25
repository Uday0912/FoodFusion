import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Container,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
  Rating,
  Chip,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Pagination,
  CircularProgress,
  Alert,
  IconButton,
  Snackbar
} from '@mui/material';
import {
  Search as SearchIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const RestaurantList = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [cuisine, setCuisine] = useState('');
  const [sortBy, setSortBy] = useState('rating');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [favorites, setFavorites] = useState(new Set());
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const search = params.get('search');
    const cuisineParam = params.get('cuisine');
    if (search) {
      setSearchQuery(search);
    }
    if (cuisineParam) {
      setCuisine(cuisineParam);
    }
    fetchRestaurants();
    if (user) {
      fetchFavorites();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search, cuisine, sortBy, page, user]);

  const fetchRestaurants = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams({
        search: searchQuery,
        cuisine,
        sortBy,
        page,
        limit: 9 // Show 9 restaurants per page
      });
      const response = await axios.get(`/api/restaurants?${params}`);
      if (response.data && Array.isArray(response.data.restaurants)) {
        setRestaurants(response.data.restaurants);
        setTotalPages(response.data.totalPages || 1);
      } else {
        setRestaurants([]);
        setTotalPages(1);
      }
    } catch (error) {
      console.error('Error fetching restaurants:', error);
      setError('Failed to fetch restaurants. Please try again later.');
      setRestaurants([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchFavorites = async () => {
    try {
      const response = await axios.get('/api/users/favorites', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      const favoriteIds = new Set(response.data.map(restaurant => restaurant._id));
      setFavorites(favoriteIds);
    } catch (error) {
      console.error('Error fetching favorites:', error);
    }
  };

  const toggleFavorite = async (restaurantId, event) => {
    event.stopPropagation(); // Prevent card click when clicking favorite button
    
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      };

      if (favorites.has(restaurantId)) {
        await axios.delete(`/api/users/favorites/${restaurantId}`, config);
        setFavorites(prev => {
          const newFavorites = new Set(prev);
          newFavorites.delete(restaurantId);
          return newFavorites;
        });
        setSnackbar({ open: true, message: 'Removed from favorites', severity: 'info' });
      } else {
        await axios.post(`/api/users/favorites/${restaurantId}`, {}, config);
        setFavorites(prev => new Set([...prev, restaurantId]));
        setSnackbar({ open: true, message: 'Added to favorites', severity: 'success' });
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      setSnackbar({ open: true, message: 'Failed to update favorites', severity: 'error' });
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/restaurants?search=${encodeURIComponent(searchQuery)}`);
  };

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const cuisines = [
    'All',
    'Italian',
    'Indian',
    'Chinese',
    'Mexican',
    'Japanese',
    'Thai',
    'American',
    'Mediterranean',
    'Korean',
    'Vietnamese'
  ];

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 4 }}>
        Discover Restaurants
      </Typography>

      {/* Filters */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <form onSubmit={handleSearch}>
            <TextField
              fullWidth
              placeholder="Search restaurants by name or cuisine..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                )
              }}
            />
          </form>
        </Grid>
        <Grid item xs={12} md={3}>
          <FormControl fullWidth>
            <InputLabel>Cuisine</InputLabel>
            <Select
              value={cuisine}
              label="Cuisine"
              onChange={(e) => setCuisine(e.target.value)}
            >
              {cuisines.map((c) => (
                <MenuItem key={c} value={c === 'All' ? '' : c}>
                  {c}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={3}>
          <FormControl fullWidth>
            <InputLabel>Sort By</InputLabel>
            <Select
              value={sortBy}
              label="Sort By"
              onChange={(e) => setSortBy(e.target.value)}
            >
              <MenuItem value="rating">Rating</MenuItem>
              <MenuItem value="price">Price</MenuItem>
              <MenuItem value="name">Name</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      {/* Error Message */}
      {error && (
        <Alert severity="error" sx={{ mb: 4 }}>
          {error}
        </Alert>
      )}

      {/* Restaurant List */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : restaurants.length === 0 ? (
        <Alert severity="info" sx={{ my: 4 }}>
          No restaurants found. Try adjusting your search criteria.
        </Alert>
      ) : (
        <>
          <Grid container spacing={4}>
            {restaurants.map((restaurant) => (
              <Grid item key={restaurant._id} xs={12} sm={6} md={4}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    cursor: 'pointer',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 3
                    }
                  }}
                  onClick={() => navigate(`/restaurants/${restaurant._id}`)}
                >
                  <Box sx={{ position: 'relative' }}>
                    <CardMedia
                      component="img"
                      height="200"
                      image={restaurant.images?.[0]?.url || '/images/restaurant-placeholder.svg'}
                      alt={restaurant.name}
                      sx={{ 
                        objectFit: 'cover',
                        backgroundColor: '#f5f5f5',
                        minHeight: '200px'
                      }}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/images/restaurant-placeholder.svg';
                      }}
                    />
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
                      onClick={(e) => toggleFavorite(restaurant._id, e)}
                    >
                      {favorites.has(restaurant._id) ? (
                        <FavoriteIcon color="error" />
                      ) : (
                        <FavoriteBorderIcon />
                      )}
                    </IconButton>
                  </Box>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography gutterBottom variant="h6" component="h3">
                      {restaurant.name}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Rating
                        value={restaurant.rating || 0}
                        precision={0.5}
                        readOnly
                        size="small"
                      />
                      <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                        ({restaurant.reviews?.length || 0} reviews)
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      {restaurant.description?.substring(0, 100)}...
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      {restaurant.address ? `${restaurant.address.street}, ${restaurant.address.city}, ${restaurant.address.state} ${restaurant.address.zipCode}` : 'No address available'}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      {restaurant.cuisine.map((c) => (
                        <Chip
                          key={c}
                          label={c}
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/restaurants?cuisine=${c}`);
                          }}
                          sx={{
                            backgroundColor: 'primary.light',
                            color: 'white',
                            '&:hover': {
                              backgroundColor: 'primary.main'
                            }
                          }}
                        />
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={handlePageChange}
                color="primary"
              />
            </Box>
          )}
        </>
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        sx={{
          '& .MuiSnackbarContent-root': {
            background: snackbar.severity === 'success' ? 'linear-gradient(90deg, #43e97b 0%, #38f9d7 100%)' : snackbar.severity === 'info' ? 'linear-gradient(90deg, #2193b0 0%, #6dd5ed 100%)' : 'linear-gradient(90deg, #ff5858 0%, #f09819 100%)',
            color: 'white',
            fontWeight: 600,
            fontSize: '1.1rem',
            boxShadow: '0 4px 20px rgba(34,197,94,0.15)',
            borderRadius: 2,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }
        }}
        message={<span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><CheckCircleIcon sx={{ mr: 1 }} />{snackbar.message}</span>}
      />
    </Container>
  );
};

export default RestaurantList; 