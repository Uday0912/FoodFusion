import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Avatar,
  Button,
  TextField,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Rating
} from '@mui/material';
import {
  Edit as EditIcon,
  LocationOn as LocationIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  PhotoCamera as PhotoIcon,
  Favorite as FavoriteIcon,
} from '@mui/icons-material';
import axios from '../utils/axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Snackbar from '@mui/material/Snackbar';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [validationErrors, setValidationErrors] = useState({});
  const [editMode, setEditMode] = useState(false);
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [favoriteRestaurants, setFavoriteRestaurants] = useState([]);
  const [avatarDialog, setAvatarDialog] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState('');

  useEffect(() => {
    if (user && !editMode) {
      setProfileData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
      });
      fetchUserData();
    }
  }, [user, editMode]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const [ordersResponse, favoritesResponse] = await Promise.all([
        axios.get('/api/orders'),
        axios.get('/api/users/favorites')
      ]);
      setRecentOrders(ordersResponse.data.slice(0, 3));
      setFavoriteRestaurants(favoritesResponse.data);
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
    setValidationErrors({});
  };

  const handleSaveProfile = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    setValidationErrors({});

    try {
      console.log('Sending profile data:', profileData);
      const response = await axios.put('/api/users/profile', profileData);
      updateProfile(response.data);
      setSuccess('Profile updated successfully!');
      setEditMode(false);
      setTimeout(() => {
        // Optionally refresh the page or navigate away if needed
        // window.location.reload();
      }, 2000);
    } catch (err) {
      console.error('Profile update error:', err);
      if (err.response && err.response.data && err.response.data.errors) {
        setValidationErrors(err.response.data.errors);
        setError(err.response.data.message || 'Validation error');
      } else {
        setError(err.response?.data?.message || 'Failed to update profile');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
      setAvatarDialog(true);
    }
  };

  const handleAvatarUpload = async () => {
    if (!avatarFile) return;

    try {
      setLoading(true);
      setError('');
      setSuccess('');
      setValidationErrors({});

      const formData = new FormData();
      formData.append('avatar', avatarFile);

      const response = await axios.post('/api/users/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      updateProfile(response.data);
      setProfileData(prev => ({
        ...prev,
        avatar: response.data.avatar
      }));
      setAvatarDialog(false);
      setSuccess('Profile picture updated successfully!');
    } catch (error) {
      console.error('Profile picture upload error:', error);
      if (error.response && error.response.data && error.response.data.errors) {
        setValidationErrors(error.response.data.errors);
        setError(error.response.data.message || 'Validation error');
      } else {
        setError(error.response?.data?.message || 'Failed to upload profile picture');
      }
    } finally {
      setLoading(false);
    }
  };

  const formatAddress = (address) => {
    if (!address) return 'No address available';
    return address;
  };

  const handleAddToFavorites = async (restaurantId) => {
    try {
      await axios.post(`/api/users/favorites/${restaurantId}`);
      setSnackbarMsg('Added to favorites!');
      setSnackbarOpen(true);
      fetchUserData();
    } catch (error) {
      setSnackbarMsg(error.response?.data?.message || 'Failed to add to favorites');
      setSnackbarOpen(true);
    }
  };

  if (!user) {
    return (
      <Container sx={{ py: 4 }}>
        <Typography variant="h5" color="text.secondary" align="center">
          Please log in to view your profile.
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>Profile</Typography>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
          {Object.keys(validationErrors).length > 0 && (
            <Box component="ul" sx={{ mt: 1, ml: 2, listStyleType: 'disc' }}>
              {Object.entries(validationErrors).map(([field, msg]) => (
                <li key={field}>{field}: {msg}</li>
              ))}
            </Box>
          )}
        </Alert>
      )}
      {success && (<Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>)}
      {loading && (<Box sx={{ display: 'flex', justifyContent: 'center' }}><CircularProgress /></Box>)}

      <Grid container spacing={4}>
        {/* Profile Section */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Box sx={{ position: 'relative', display: 'inline-block' }}>
              <Avatar
                src={user?.avatar}
                sx={{ width: 120, height: 120, mb: 2, bgcolor: 'primary.main' }}
              >
                {user?.name?.charAt(0)}
              </Avatar>
              <input
                accept="image/*"
                style={{ display: 'none' }}
                id="avatar-upload"
                type="file"
                onChange={handleAvatarChange}
              />
              <label htmlFor="avatar-upload">
                <IconButton
                  component="span"
                  sx={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    backgroundColor: 'primary.main',
                    color: 'white',
                    '&:hover': {
                      backgroundColor: 'primary.dark',
                    },
                  }}
                >
                  <PhotoIcon />
                </IconButton>
              </label>
            </Box>

            <Typography variant="h5" gutterBottom>
              {user?.name}
            </Typography>
            <Typography variant="body1" color="text.secondary" gutterBottom>
              {user?.email}
            </Typography>

            {!editMode ? (
              <Button
                startIcon={<EditIcon />}
                onClick={() => setEditMode(true)}
                sx={{ mt: 2 }}
              >
                Edit Profile
              </Button>
            ) : (
              <Box sx={{ mt: 2 }}>
                <Button
                  startIcon={<SaveIcon />}
                  onClick={handleSaveProfile}
                  sx={{ mr: 1 }}
                  disabled={loading}
                  variant="contained"
                  color="primary"
                >
                  Save
                </Button>
                <Button
                  startIcon={<CancelIcon />}
                  onClick={() => {
                    setEditMode(false);
                    setProfileData({
                      name: user.name || '',
                      email: user.email || '',
                      phone: user.phone || '',
                      address: user.address || '',
                    });
                    setError('');
                    setValidationErrors({});
                  }}
                  color="error"
                  disabled={loading}
                  variant="outlined"
                >
                  Cancel
                </Button>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Profile Details */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Profile Information
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Name"
                  name="name"
                  value={profileData.name}
                  onChange={handleProfileInputChange}
                  disabled={!editMode}
                  error={!!validationErrors.name}
                  helperText={validationErrors.name}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  value={profileData.email}
                  disabled
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Phone"
                  name="phone"
                  value={profileData.phone}
                  onChange={handleProfileInputChange}
                  disabled={!editMode}
                  error={!!validationErrors.phone}
                  helperText={validationErrors.phone}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Address"
                  name="address"
                  value={profileData.address}
                  onChange={handleProfileInputChange}
                  disabled={!editMode}
                  multiline
                  rows={2}
                  error={!!validationErrors.address}
                  helperText={validationErrors.address}
                />
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Recent Orders */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Recent Orders
            </Typography>
            {loading ? (
              <CircularProgress />
            ) : recentOrders.length > 0 ? (
              <List>
                {recentOrders.map((order) => (
                  <ListItem key={order._id} divider>
                    <ListItemIcon>
                      <LocationIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary={`Order #${order._id.slice(-6)} - ${order.restaurant ? order.restaurant.name : 'N/A'}`}
                      secondary={`Total: ₹${order.totalAmount.toFixed(2)} | Status: ${order.status}`}
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography>No recent orders found</Typography>
            )}
          </Paper>
        </Grid>

        {/* Favorite Restaurants */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Favorite Restaurants
            </Typography>
            {loading ? (
              <CircularProgress />
            ) : favoriteRestaurants.length > 0 ? (
              <Grid container spacing={2}>
                {favoriteRestaurants.map((restaurant) => (
                  <Grid item xs={12} sm={6} md={4} key={restaurant._id}>
                    <Card>
                      <CardMedia
                        component="img"
                        height="140"
                        image={restaurant.image || 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80'}
                        alt={restaurant.name}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80';
                        }}
                      />
                      <CardContent>
                        <Typography variant="h6">{restaurant.name}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {restaurant.cuisine}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                          <Rating value={restaurant.rating} readOnly size="small" />
                          <Typography variant="body2" sx={{ ml: 1 }}>
                            ({restaurant.rating})
                          </Typography>
                        </Box>
                        <Button
                          variant="outlined"
                          color="primary"
                          startIcon={<FavoriteIcon />}
                          sx={{ mt: 1 }}
                          onClick={() => handleAddToFavorites(restaurant._id)}
                        >
                          Add to Favorites
                        </Button>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Typography>No favorite restaurants</Typography>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Avatar Upload Dialog */}
      <Dialog
        open={avatarDialog}
        onClose={() => setAvatarDialog(false)}
      >
        <DialogTitle>Change Profile Picture</DialogTitle>
        <DialogContent>
          {avatarPreview && (
            <Box sx={{ textAlign: 'center', my: 2 }}>
              <img
                src={avatarPreview}
                alt="Preview"
                style={{ maxWidth: '100%', maxHeight: '200px' }}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAvatarDialog(false)}>Cancel</Button>
          <Button onClick={handleAvatarUpload} disabled={loading}>
            Upload
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={2000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMsg}
      />
    </Container>
  );
};

export default Profile; 