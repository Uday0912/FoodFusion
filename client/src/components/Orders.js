import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from '../utils/axios'; // Ensure using the custom axios instance
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Chip,
  Alert,
  CircularProgress,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Rating,
  LinearProgress,
  Tooltip
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import StarIcon from '@mui/icons-material/Star';
import ReplayIcon from '@mui/icons-material/Replay';
import { useAuth } from '../context/AuthContext';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [orderSuccessDialogOpen, setOrderSuccessDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState(null);
  const [ratingDialogOpen, setRatingDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [rating, setRating] = useState(0);
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Ref to ensure order success message is only displayed once per navigation
  const hasDisplayedOrderSuccess = useRef(false);

  // ***** ADDED LOGS HERE *****
  console.log('Orders component rendered. Current location.state:', location.state);
  console.log('Current orderSuccessDialogOpen state:', orderSuccessDialogOpen);
  console.log('Current successMessage state:', successMessage);

  // Using useCallback to memoize fetchOrders
  const fetchOrders = useCallback(async () => {
    try {
      const response = await axios.get('/api/orders');
      return response.data;
    } catch (err) {
      console.error('Error fetching orders:', err);
      throw err;
    }
  }, []);

  // Effect for handling initial order loading
  useEffect(() => {
    const loadOrders = async () => {
      setLoading(true);
      setError(null);
      try {
        let fetchedOrders = await fetchOrders();
        setOrders(fetchedOrders);
      } catch (err) {
        console.error('Failed to load orders:', err);
        setError(err.response?.data?.message || 'Failed to fetch orders. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    loadOrders();
  }, [fetchOrders]);

  // Effect for handling order success message from location.state (single shot)
  useEffect(() => {
    console.log('useEffect for orderSuccess triggered. location.state?.newOrder:', location.state?.newOrder);

    // Only proceed if newOrder exists and we haven't displayed it yet
    if (location.state?.newOrder && !hasDisplayedOrderSuccess.current) {
      const message = location.state.message || 'Order placed successfully!';
      setSuccessMessage(message);
      setOrderSuccessDialogOpen(true);
      hasDisplayedOrderSuccess.current = true; // Mark as displayed

      console.log('Success message set and dialog opened. successMessage:', message, 'orderSuccessDialogOpen:', true);

      // Auto-close dialog and clear message after 5 seconds
      const timer = setTimeout(() => {
        setOrderSuccessDialogOpen(false);
        setSuccessMessage(null);
        hasDisplayedOrderSuccess.current = false; // Reset for next time
        console.log('Dialog auto-closed after 5s. orderSuccessDialogOpen:', false);
      }, 5000);

      // Clear location state immediately *after* capturing its value for the dialog
      // This ensures location.state doesn't re-trigger this effect on subsequent renders
      navigate(location.pathname, { replace: true });

      // Cleanup function to clear timeout if component unmounts or effect re-runs before timer completes
      return () => clearTimeout(timer);
    }
  }, [location.state, navigate]);

  const handleOrderSuccessDialogClose = () => {
    setOrderSuccessDialogOpen(false);
    setSuccessMessage(null);
    hasDisplayedOrderSuccess.current = false; // Reset if manually closed
    console.log('Dialog manually closed. orderSuccessDialogOpen:', false);
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'preparing': return 'info';
      case 'ready': return 'success';
      case 'delivered': return 'success';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'paid': return 'success';
      case 'failed': return 'error';
      default: return 'default';
    }
  };

  const handleDeleteClick = (order) => {
    setOrderToDelete(order);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await axios.delete(`/api/orders/${orderToDelete._id}`);
      setOrders(orders.filter(order => order._id !== orderToDelete._id));
      setSuccessMessage('Order deleted successfully!');
      setOrderSuccessDialogOpen(true);
      // Also close the dialog automatically after a few seconds
      setTimeout(() => {
        setOrderSuccessDialogOpen(false);
        setSuccessMessage(null);
      }, 5000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete order');
    } finally {
      setDeleteDialogOpen(false);
      setOrderToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setOrderToDelete(null);
  };

  const handleRateOrder = async () => {
    try {
      await axios.post(`/api/orders/${selectedOrder._id}/rate`, { rating });
      setOrders(orders.map(order => 
        order._id === selectedOrder._id 
          ? { ...order, rating } 
          : order
      ));
      setSuccessMessage('Rating submitted successfully!');
      setOrderSuccessDialogOpen(true);
      setRatingDialogOpen(false);
      setRating(0);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit rating');
    }
  };

  const handleReorder = (order) => {
    // Add items to cart
    const items = order.items.map(item => ({
      _id: item._id,
      name: item.name,
      quantity: item.quantity,
      price: item.price
    }));
    
    // Navigate to cart with items
    navigate('/cart', { 
      state: { 
        reorderItems: items,
        restaurantId: order.restaurant._id
      }
    });
  };

  const getEstimatedDeliveryTime = (order) => {
    const orderTime = new Date(order.createdAt);
    const estimatedTime = new Date(orderTime.getTime() + 30 * 60000); // 30 minutes from order time
    return estimatedTime.toLocaleTimeString();
  };

  const getOrderProgress = (status) => {
    switch (status.toLowerCase()) {
      case 'preparing': return 33;
      case 'ready': return 66;
      case 'delivered': return 100;
      default: return 0;
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        My Orders
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {orders.length === 0 ? (
        <Box textAlign="center" py={4}>
          <Typography variant="h6" color="textSecondary" gutterBottom>
            No orders found
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate('/restaurants')}
          >
            Browse Restaurants
          </Button>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {orders.map((order) => (
            <Grid item xs={12} key={order._id}>
              <Card>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="h6">
                      Order #{order._id.slice(-6)}
                    </Typography>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Chip
                        label={order.status}
                        color={getStatusColor(order.status)}
                      />
                      <Chip
                        label={order.paymentStatus}
                        color={getPaymentStatusColor(order.paymentStatus)}
                      />
                      {order.status === 'delivered' && !order.rating && (
                        <Tooltip title="Rate Order">
                          <IconButton
                            color="primary"
                            onClick={() => {
                              setSelectedOrder(order);
                              setRatingDialogOpen(true);
                            }}
                          >
                            <StarIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                      <Tooltip title="Reorder">
                        <IconButton
                          color="primary"
                          onClick={() => handleReorder(order)}
                        >
                          <ReplayIcon />
                        </IconButton>
                      </Tooltip>
                      <IconButton
                        color="error"
                        onClick={() => handleDeleteClick(order)}
                        size="small"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </Box>

                  <Typography variant="subtitle1" gutterBottom>
                    {order.restaurant ? order.restaurant.name : 'N/A'}
                  </Typography>

                  <Box mb={2}>
                    <Typography variant="body2" color="textSecondary">
                      Estimated Delivery: {getEstimatedDeliveryTime(order)}
                    </Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={getOrderProgress(order.status)} 
                      sx={{ mt: 1 }}
                    />
                  </Box>

                  <Accordion>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography>Order Details</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Box width="100%">
                        <Typography variant="body2" color="textSecondary" gutterBottom>
                          Items:
                        </Typography>
                        {order.items.map((item, index) => (
                          <Typography key={index} variant="body2">
                            • {item.quantity}x {item.name} - ₹{item.price.toFixed(2)}
                          </Typography>
                        ))}
                        <Box mt={2}>
                          <Typography variant="body2" color="textSecondary">
                            Delivery Address: {`${order.deliveryAddress.street}, ${order.deliveryAddress.city}, ${order.deliveryAddress.state} - ${order.deliveryAddress.zipCode}`}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            Payment Method: {order.paymentMethod}
                          </Typography>
                          {order.rating && (
                            <Box display="flex" alignItems="center" mt={1}>
                              <Typography variant="body2" color="textSecondary" mr={1}>
                                Your Rating:
                              </Typography>
                              <Rating value={order.rating} readOnly size="small" />
                            </Box>
                          )}
                        </Box>
                      </Box>
                    </AccordionDetails>
                  </Accordion>

                  <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
                    <Typography variant="body2" color="textSecondary">
                      Total: ₹{order.totalAmount.toFixed(2)}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {new Date(order.createdAt).toLocaleString()}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Success Dialog */}
      <Dialog open={orderSuccessDialogOpen} onClose={handleOrderSuccessDialogClose}>
        <DialogTitle>Success</DialogTitle>
        <DialogContent>
          <Typography>{successMessage}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleOrderSuccessDialogClose}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this order?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error">Delete</Button>
        </DialogActions>
      </Dialog>

      {/* Rating Dialog */}
      <Dialog open={ratingDialogOpen} onClose={() => setRatingDialogOpen(false)}>
        <DialogTitle>Rate Your Order</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" alignItems="center" py={2}>
            <Rating
              value={rating}
              onChange={(event, newValue) => setRating(newValue)}
              size="large"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRatingDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleRateOrder} color="primary">Submit</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Orders;