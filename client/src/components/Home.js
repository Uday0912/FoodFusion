import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  Box,
  Rating,
  Chip,
  TextField,
  InputAdornment,
  CircularProgress,
  Alert,
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Home = () => {
  const [featuredRestaurants, setFeaturedRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchFeaturedRestaurants();
  }, []);

  const fetchFeaturedRestaurants = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await axios.get('/api/restaurants/featured');
      if (response.data && Array.isArray(response.data)) {
        setFeaturedRestaurants(response.data);
      } else {
        setError('Invalid response format from server');
      }
    } catch (error) {
      console.error('Error fetching featured restaurants:', error);
      setError('Failed to load featured restaurants');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/restaurants?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg">
      {/* Hero Section */}
      <Box sx={{ 
        my: { xs: 4, md: 8 }, 
        textAlign: 'center',
        px: { xs: 2, md: 0 }
      }}>
        <Typography
          variant="h2"
          component="h1"
          gutterBottom
          sx={{
            fontWeight: 'bold',
            background: 'linear-gradient(to right, #ff6b6b, #4ecdc4)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontSize: { xs: '2rem', sm: '2.5rem', md: '2.8rem' }
          }}
        >
          Delicious Food Delivered To Your Doorstep
        </Typography>
        <Typography 
          variant="h5" 
          color="text.secondary" 
          paragraph
          sx={{
            fontSize: { xs: '1.1rem', sm: '1.25rem', md: '1.5rem' }
          }}
        >
          Order from your favorite restaurants with just a few clicks
        </Typography>

        <Box 
          component="form" 
          onSubmit={handleSearch} 
          sx={{ 
            maxWidth: 600, 
            mx: 'auto', 
            mt: { xs: 3, md: 4 },
            px: { xs: 2, md: 0 }
          }}
        >
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search for restaurants or cuisines..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <Button 
                    type="submit" 
                    variant="contained" 
                    color="primary"
                    sx={{
                      display: { xs: 'none', sm: 'block' }
                    }}
                  >
                    Search
                  </Button>
                </InputAdornment>
              ),
            }}
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            sx={{
              mt: 2,
              display: { xs: 'block', sm: 'none' }
            }}
          >
            Search
          </Button>
        </Box>
      </Box>

      {/* Featured Restaurants Section */}
      <Box sx={{ 
        mb: { xs: 4, md: 8 },
        px: { xs: 2, md: 0 }
      }}>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between', 
          alignItems: { xs: 'flex-start', sm: 'center' }, 
          mb: 4,
          gap: { xs: 2, sm: 0 }
        }}>
          <Typography 
            variant="h4" 
            component="h2" 
            sx={{ 
              fontWeight: 'bold',
              fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' }
            }}
          >
            Featured Restaurants
          </Typography>
          <Button
            variant="outlined" 
            onClick={() => navigate('/restaurants')}
            sx={{ 
              borderColor: 'primary.main',
              color: 'primary.main',
              '&:hover': {
                borderColor: 'primary.dark',
                backgroundColor: 'rgba(255,107,107,0.04)',
              }
            }}
          >
            View All
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 4 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={{ xs: 2, md: 4 }}>
          {featuredRestaurants.map((restaurant) => (
            <Grid item xs={12} sm={6} md={4} key={restaurant._id}>
              <Card 
                sx={{ 
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  cursor: 'pointer',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    transition: 'transform 0.2s ease-in-out',
                  },
                }}
                onClick={() => navigate(`/restaurants/${restaurant._id}`)}
              >
                <CardMedia
                  component="img"
                  height="200"
                  image={restaurant.images[0]?.url || 'http://localhost:5001/images/food-placeholder.svg'}
                  alt={restaurant.name}
                  sx={{
                    objectFit: 'cover',
                    backgroundColor: '#f5f5f5',
                    minHeight: { xs: '160px', sm: '200px' }
                  }}
                />
                <CardContent>
                  <Typography 
                    variant="h6" 
                    component="h3" 
                    gutterBottom
                    sx={{
                      fontSize: { xs: '1.1rem', sm: '1.25rem' }
                    }}
                  >
                    {restaurant.name}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Rating 
                      value={restaurant.rating} 
                      precision={0.5} 
                      readOnly 
                      size="small"
                    />
                    <Typography 
                      variant="body2" 
                      color="text.secondary" 
                      sx={{ ml: 1 }}
                    >
                      ({restaurant.reviews?.length || 0})
                    </Typography>
                  </Box>
                  <Typography 
                    variant="body2" 
                    color="text.secondary"
                    sx={{
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}
                  >
                    {restaurant.description}
                  </Typography>
                  <Box sx={{ 
                    display: 'flex', 
                    gap: 1, 
                    flexWrap: 'wrap',
                    mt: 2
                  }}>
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
      </Box>

      {/* Footer */}
      <Box
        component="footer"
        sx={{
          background: 'linear-gradient(to right, #ff6b6b, #4ecdc4)',
          color: 'white',
          py: { xs: 3, md: 4 },
          mt: { xs: 4, md: 8 },
          textAlign: 'center',
          borderRadius: '16px 16px 0 0'
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={{ xs: 3, md: 4 }}>
            <Grid item xs={12} md={4}>
              <Typography 
                variant="h6" 
                gutterBottom
                sx={{
                  fontSize: { xs: '1.1rem', sm: '1.25rem' }
                }}
              >
                Food Fusion
              </Typography>
              <Typography 
                variant="body2"
                sx={{
                  fontSize: { xs: '0.8rem', sm: '0.9rem' }
                }}
              >
                Your ultimate food delivery partner. Delivering delicious meals right to your doorstep.
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography 
                variant="h6" 
                gutterBottom
                sx={{
                  fontSize: { xs: '1.1rem', sm: '1.25rem' }
                }}
              >
                Quick Links
              </Typography>
              <Typography 
                variant="body2" 
                component="div"
                sx={{
                  fontSize: { xs: '0.8rem', sm: '0.9rem' }
                }}
              >
                <ul style={{ listStyle: 'none', padding: 0 }}>
                  <li style={{ marginBottom: '4px' }}><a href="/restaurants" style={{ color: 'white', textDecoration: 'none' }}>Restaurants</a></li>
                  <li style={{ marginBottom: '4px' }}><a href="/orders" style={{ color: 'white', textDecoration: 'none' }}>My Orders</a></li>
                  <li style={{ marginBottom: '4px' }}><a href="/profile" style={{ color: 'white', textDecoration: 'none' }}>Profile</a></li>
                  <li style={{ marginBottom: '4px' }}><a href="/cart" style={{ color: 'white', textDecoration: 'none' }}>Cart</a></li>
                </ul>
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography 
                variant="h6" 
                gutterBottom
                sx={{
                  fontSize: { xs: '1.1rem', sm: '1.25rem' }
                }}
              >
                Contact Us
              </Typography>
              <Typography 
                variant="body2"
                sx={{
                  fontSize: { xs: '0.8rem', sm: '0.9rem' }
                }}
              >
                Email: UDAY_PARSHA@foodfusion.com<br/>
                Phone: 6281607674<br/>
                Address: 123 Food Street, Madhurawada, Visakhapatnam, Andhra Pradesh, India
              </Typography>
            </Grid>
          </Grid>
          <Box sx={{ 
            borderTop: '1px solid rgba(255,255,255,0.2)', 
            pt: 2, 
            mt: 3 
          }}>
            <Typography 
              variant="body2"
              sx={{
                fontSize: { xs: '0.75rem', sm: '0.8rem' }
              }}
            >
              &copy; {new Date().getFullYear()} Food Fusion. All rights reserved.
            </Typography>
          </Box>
        </Container>
      </Box>
    </Container>
  );
};

export default Home; 