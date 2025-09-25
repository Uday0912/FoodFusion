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
  TextField,
  Paper,
  IconButton,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Input,
  MobileStepper,
  useTheme,
  DialogContentText
} from '@mui/material';
import {
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  ShoppingCart as CartIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  CloudUpload as CloudUploadIcon,
  KeyboardArrowLeft,
  KeyboardArrowRight,
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const RestaurantDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [review, setReview] = useState({ rating: 0, comment: '' });
  const [quantities, setQuantities] = useState({});
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });
  const [imageUploadDialogOpen, setImageUploadDialogOpen] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [activeStep, setActiveStep] = useState(0);
  const theme = useTheme();
  const [editFoodDialogOpen, setEditFoodDialogOpen] = useState(false);
  const [currentFoodItem, setCurrentFoodItem] = useState(null);
  const [foodForm, setFoodForm] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    image: '',
  });
  const [foodFormError, setFoodFormError] = useState(null);
  const [foodFormLoading, setFoodFormLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [foodToDelete, setFoodToDelete] = useState(null);
  const [favSnackbar, setFavSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    fetchRestaurant();
    if (user) {
      checkFavoriteStatus();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, user]);

  const fetchRestaurant = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/restaurants/${id}`);
      
      // Ensure we have valid menu items
      const restaurantData = response.data;
      if (!restaurantData.menu || !Array.isArray(restaurantData.menu)) {
        console.error('Invalid menu data:', restaurantData.menu);
        setError('Invalid menu data received from server');
        return;
      }

      // Filter out any invalid menu items
      const validMenu = restaurantData.menu.filter(item => 
        item && 
        typeof item === 'object' && 
        item._id && 
        item.name && 
        typeof item.price === 'number'
      );

      // Update restaurant data with valid menu items
      const validRestaurantData = {
        ...restaurantData,
        menu: validMenu,
        images: restaurantData.images && restaurantData.images.length > 0 ? restaurantData.images : [{ url: '/images/restaurant-placeholder.svg' }] // Ensure images array always has a fallback
      };

      setRestaurant(validRestaurantData);

      // Initialize quantities for valid menu items
      const initialQuantities = {};
      validMenu.forEach(item => {
        initialQuantities[item._id] = 1;
      });
      setQuantities(initialQuantities);
    } catch (error) {
      console.error('Error fetching restaurant:', error);
      setError('Failed to fetch restaurant details. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const checkFavoriteStatus = async () => {
    try {
      const response = await axios.get(`/api/users/favorites/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setIsFavorite(response.data.isFavorite);
    } catch (error) {
      console.error('Error checking favorite status:', error);
      // Don't show error to user for this background check
    }
  };

  const toggleFavorite = async () => {
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

      if (isFavorite) {
        await axios.delete(`/api/users/favorites/${id}`, config);
        setIsFavorite(false);
        setFavSnackbar({ open: true, message: 'Removed from favorites', severity: 'info' });
      } else {
        await axios.post(`/api/users/favorites/${id}`, {}, config);
        setIsFavorite(true);
        setFavSnackbar({ open: true, message: 'Added to favorites', severity: 'success' });
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          'Error updating favorites. Please try again.';
      setFavSnackbar({ open: true, message: errorMessage, severity: 'error' });
    }
  };

  const handleAddToCart = (item) => {
    // Validate that we have a proper menu item object
    if (!item || typeof item !== 'object') {
      console.error('Invalid menu item:', item);
      setSnackbar({
        open: true,
        message: 'Error adding item to cart'
      });
      return;
    }

    // Ensure we have all required fields
    if (!item._id || !item.name || typeof item.price !== 'number') {
      console.error('Menu item missing required fields:', item);
      setSnackbar({
        open: true,
        message: 'Error: Invalid menu item data'
      });
      return;
    }

    // Create a properly structured cart item
    const cartItem = {
      _id: item._id,
      name: item.name,
      price: item.price,
      image: item.image || 'https://source.unsplash.com/400x200/?food',
      restaurantId: restaurant._id,
      quantity: quantities[item._id] || 1
    };

    console.log('Adding to cart:', cartItem); // Debug log

    try {
      addToCart(cartItem);
      setSnackbar({
        open: true,
        message: `${item.name} added to cart!`
      });
    } catch (error) {
      console.error('Error adding to cart:', error);
      setSnackbar({
        open: true,
        message: 'Error adding item to cart'
      });
    }
  };

  const handleQuantityChange = (itemId, change) => {
    setQuantities(prev => ({
      ...prev,
      [itemId]: Math.max(1, (prev[itemId] || 1) + change)
    }));
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }

    // Basic validation for review input
    if (!review.rating || review.comment.trim() === '') {
      setSnackbar({
        open: true,
        message: 'Please provide both a rating and a comment.'
      });
      return;
    }

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      };
      await axios.post(`/api/restaurants/${id}/reviews`, review, config);
      fetchRestaurant(); // Re-fetch restaurant data to show the new review
      setReview({ rating: 0, comment: '' }); // Clear the review form
      setSnackbar({
        open: true,
        message: 'Review submitted successfully!'
      });
    } catch (error) {
      console.error('Error submitting review:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Failed to submit review. Please try again.'
      });
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setSelectedImages(files);
    const previews = files.map(file => URL.createObjectURL(file));
    setImagePreviews(previews);
  };

  const handleImageUpload = async () => {
    if (selectedImages.length === 0) {
      setUploadError('Please select at least one image to upload.');
      return;
    }

    try {
      setUploadLoading(true);
      setUploadError(null);

      const formData = new FormData();
      selectedImages.forEach((image) => {
        formData.append('images', image);
      });

      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      };

      const response = await axios.post(`/api/restaurants/${id}/images`, formData, config);
      console.log('Image upload response:', response.data);

      // Update restaurant state with new images (assuming backend returns updated restaurant or new image URLs)
      setRestaurant(prev => ({ 
        ...prev,
        images: response.data.images || prev.images // Assuming backend returns updated images array
      }));

      setSnackbar({ open: true, message: 'Images uploaded successfully!' });
      setImageUploadDialogOpen(false);
      setSelectedImages([]);
      setImagePreviews([]);
    } catch (error) {
      console.error('Error uploading images:', error);
      setUploadError(error.response?.data?.message || 'Failed to upload images.');
    } finally {
      setUploadLoading(false);
    }
  };

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleEditFoodClick = (item) => {
    setCurrentFoodItem(item);
    setFoodForm({
      name: item.name,
      description: item.description,
      price: item.price,
      category: item.category,
      image: item.image,
    });
    setEditFoodDialogOpen(true);
  };

  const handleFoodFormChange = (e) => {
    const { name, value } = e.target;
    setFoodForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveFoodItem = async () => {
    if (!currentFoodItem) return;

    try {
      setFoodFormLoading(true);
      setFoodFormError(null);

      const config = {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      };

      const response = await axios.put(`/api/food/${currentFoodItem._id}`, foodForm, config);
      console.log('Food item updated:', response.data);

      // Update the restaurant's menu with the updated food item
      setRestaurant(prev => ({
        ...prev,
        menu: prev.menu.map(item => 
          item._id === response.data._id ? response.data : item
        )
      }));

      setSnackbar({ open: true, message: 'Menu item updated successfully!' });
      setEditFoodDialogOpen(false);
    } catch (error) {
      console.error('Error updating food item:', error);
      setFoodFormError(error.response?.data?.message || 'Failed to update menu item.');
    } finally {
      setFoodFormLoading(false);
    }
  };

  const handleDeleteFoodClick = (item) => {
    setFoodToDelete(item);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      };

      await axios.delete(`/api/food/${foodToDelete._id}`, config);

      // Update restaurant state by removing the deleted food item
      setRestaurant(prev => ({
        ...prev,
        menu: prev.menu.filter(item => item._id !== foodToDelete._id)
      }));

      setSnackbar({ 
        open: true, 
        message: 'Menu item deleted successfully!',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error deleting food item:', error);
      setSnackbar({ 
        open: true, 
        message: error.response?.data?.message || 'Failed to delete menu item',
        severity: 'error'
      });
    } finally {
      setDeleteDialogOpen(false);
      setFoodToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setFoodToDelete(null);
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
        <Alert severity="info">Restaurant not found.</Alert>
      </Container>
    );
  }

  const maxSteps = restaurant.images.length;

  return (
    <Container sx={{ py: 4 }}>
      {/* Restaurant Header */}
      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <Box sx={{ position: 'relative', width: '100%', height: 400, borderRadius: 2, overflow: 'hidden' }}>
          <CardMedia
            component="img"
            height="400"
              image={restaurant.images[activeStep]?.url || '/images/restaurant-placeholder.svg'}
            alt={restaurant.name}
            sx={{ 
              borderRadius: 2,
              objectFit: 'cover',
              boxShadow: 3,
              backgroundColor: '#f5f5f5',
              minHeight: '400px'
            }}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = '/images/restaurant-placeholder.svg';
            }}
          />
            {maxSteps > 1 && (
              <MobileStepper
                steps={maxSteps}
                position="static"
                activeStep={activeStep}
                nextButton={
                  <Button
                    size="small"
                    onClick={handleNext}
                    disabled={activeStep === maxSteps - 1}
                  >
                    Next
                    {theme.direction === 'rtl' ? (<KeyboardArrowLeft />) : (<KeyboardArrowRight />)}
                  </Button>
                }
                backButton={
                  <Button size="small" onClick={handleBack} disabled={activeStep === 0}>
                    {theme.direction === 'rtl' ? (<KeyboardArrowRight />) : (<KeyboardArrowLeft />)}
                    Back
                  </Button>
                }
                sx={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  backgroundColor: 'rgba(255, 255, 255, 0.7)',
                  borderBottomLeftRadius: 8,
                  borderBottomRightRadius: 8,
                }}
              />
            )}
          </Box>
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
            <Typography variant="body1" color="text.secondary" paragraph>
              Address: {(() => {
                if (!restaurant.address) return 'No address available';
                const { street, city, state, zipCode } = restaurant.address;
                const parts = [street, city, state, zipCode].filter(Boolean);
                return parts.length > 0 ? parts.join(', ') : 'No address available';
              })()}
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              Phone: {restaurant.phone || 'No phone available'}
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              Email: {restaurant.email || 'No email available'}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
              {restaurant.cuisine.map((c) => (
                <Chip
                  key={c}
                  label={c}
                  onClick={() => navigate(`/restaurants?cuisine=${c}`)}
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
            <Button
              variant="outlined"
              startIcon={isFavorite ? <FavoriteIcon /> : <FavoriteBorderIcon />}
              onClick={toggleFavorite}
              sx={{ mr: 2 }}
            >
              {isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
            </Button>
            {user?.role === 'admin' && (
              <Button
                variant="contained"
                startIcon={<CloudUploadIcon />}
                onClick={() => setImageUploadDialogOpen(true)}
              >
                Upload Images
              </Button>
            )}
          </Box>
        </Grid>
      </Grid>

      <Divider sx={{ my: 4 }} />

      {/* Menu Section */}
      <Typography variant="h5" gutterBottom>
        Menu
      </Typography>
      <Grid container spacing={3} sx={{ mt: 2 }}>
        {restaurant.menu?.map((item) => (
          <Grid item xs={12} sm={6} md={4} key={item._id}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  transition: 'transform 0.2s ease-in-out',
                },
              }}
            >
              <CardMedia
                component="img"
                height="200"
                image={item.image || '/images/food-placeholder.svg'}
                alt={item.name}
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
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h6" gutterBottom>
                  {item.name || 'Unnamed Item'}
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  {item.description || 'No description available'}
                </Typography>
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  mt: 'auto'
                }}>
                  <Typography variant="h6" color="primary">
                    ₹{(item.price || 0).toFixed(2)}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <IconButton 
                      size="small"
                      onClick={() => handleQuantityChange(item._id, -1)}
                    >
                      <RemoveIcon />
                    </IconButton>
                    <Typography>{quantities[item._id] || 1}</Typography>
                    <IconButton 
                      size="small"
                      onClick={() => handleQuantityChange(item._id, 1)}
                    >
                      <AddIcon />
                    </IconButton>
                    {user?.role === 'admin' && (
                      <>
                        <IconButton
                          color="info"
                          size="small"
                          onClick={() => handleEditFoodClick(item)}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          color="error"
                          size="small"
                          onClick={() => handleDeleteFoodClick(item)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </>
                    )}
                    <Button
                      variant="contained"
                      startIcon={<CartIcon />}
                      size="small"
                      onClick={() => handleAddToCart(item)}
                    >
                      Add
                    </Button>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Divider sx={{ my: 4 }} />

      {/* Reviews Section */}
      <Typography variant="h5" gutterBottom>
        Reviews
      </Typography>
      {user && (
        <Paper sx={{ p: 3, mb: 4 }}>
          <form onSubmit={handleReviewSubmit}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Rating
              </Typography>
              <Rating
                value={review.rating}
                onChange={(e, newValue) => {
                  setReview({ ...review, rating: newValue });
                }}
              />
            </Box>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Your Review"
              value={review.comment}
              onChange={(e) => setReview({ ...review, comment: e.target.value })}
              sx={{ mb: 2 }}
            />
            <Button type="submit" variant="contained">
              Submit Review
            </Button>
          </form>
        </Paper>
      )}
      <Grid container spacing={2}>
        {restaurant.reviews?.map((review) => (
          <Grid item xs={12} key={review._id}>
            <Paper sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="subtitle1">
                  {review.user.name}
                </Typography>
                <Rating value={review.rating} readOnly size="small" />
              </Box>
              <Typography variant="body2" color="text.secondary">
                {new Date(review.date).toLocaleDateString()}
              </Typography>
              <Typography variant="body1" sx={{ mt: 1 }}>
                {review.comment}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity || 'success'} 
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Image Upload Dialog */}
      <Dialog open={imageUploadDialogOpen} onClose={() => setImageUploadDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Upload Restaurant Images</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            You can upload up to 5 images (JPG, JPEG, PNG, GIF), max 10MB each.
          </Typography>
          <Input
            type="file"
            inputProps={{ multiple: true, accept: "image/*" }}
            onChange={handleImageChange}
            fullWidth
            sx={{ mb: 2 }}
          />
          {uploadError && <Alert severity="error" sx={{ mb: 2 }}>{uploadError}</Alert>}
          <Grid container spacing={2}>
            {imagePreviews.map((preview, index) => (
              <Grid item xs={6} sm={4} md={3} key={index}>
                <img src={preview} alt={`Preview ${index}`} style={{ width: '100%', height: '100px', objectFit: 'cover', borderRadius: '8px' }} />
              </Grid>
            ))}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setImageUploadDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleImageUpload}
            variant="contained"
            startIcon={uploadLoading ? <CircularProgress size={20} /> : <CloudUploadIcon />}
            disabled={uploadLoading || selectedImages.length === 0}
          >
            {uploadLoading ? 'Uploading...' : 'Upload'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Food Item Dialog */}
      <Dialog open={editFoodDialogOpen} onClose={() => setEditFoodDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Menu Item</DialogTitle>
        <DialogContent>
          {foodFormError && <Alert severity="error" sx={{ mb: 2 }}>{foodFormError}</Alert>}
          <TextField
            name="name"
            label="Name"
            value={foodForm.name}
            onChange={handleFoodFormChange}
            fullWidth
            margin="normal"
          />
          <TextField
            name="description"
            label="Description"
            value={foodForm.description}
            onChange={handleFoodFormChange}
            fullWidth
            multiline
            rows={3}
            margin="normal"
          />
          <TextField
            name="price"
            label="Price"
            type="number"
            value={foodForm.price}
            onChange={handleFoodFormChange}
            fullWidth
            margin="normal"
          />
          <TextField
            name="category"
            label="Category"
            value={foodForm.category}
            onChange={handleFoodFormChange}
            fullWidth
            margin="normal"
          />
          <TextField
            name="image"
            label="Image URL"
            value={foodForm.image}
            onChange={handleFoodFormChange}
            fullWidth
            margin="normal"
          />
          {foodForm.image && (
            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <img src={foodForm.image} alt="Food Preview" style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '8px' }} />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditFoodDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleSaveFoodItem}
            variant="contained"
            startIcon={foodFormLoading ? <CircularProgress size={20} /> : null}
            disabled={foodFormLoading}
          >
            {foodFormLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
      >
        <DialogTitle>Delete Menu Item</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete "{foodToDelete?.name}"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={favSnackbar.open}
        autoHideDuration={3000}
        onClose={() => setFavSnackbar({ ...favSnackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        sx={{
          '& .MuiSnackbarContent-root': {
            background: favSnackbar.severity === 'success' ? 'linear-gradient(90deg, #43e97b 0%, #38f9d7 100%)' : favSnackbar.severity === 'info' ? 'linear-gradient(90deg, #2193b0 0%, #6dd5ed 100%)' : 'linear-gradient(90deg, #ff5858 0%, #f09819 100%)',
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
        message={<span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><CheckCircleIcon sx={{ mr: 1 }} />{favSnackbar.message}</span>}
      />
    </Container>
  );
};

export default RestaurantDetail; 