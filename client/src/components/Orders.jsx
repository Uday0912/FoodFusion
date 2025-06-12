import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from '../utils/axios';
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
  Tooltip,
  TextField
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import StarIcon from '@mui/icons-material/Star';
import ReplayIcon from '@mui/icons-material/Replay';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import { useAuth } from '../context/AuthContext';
import Profile from './components/Profile';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [orderSuccessDialogOpen, setOrderSuccessDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState(null);
  const [ratingDialog, setRatingDialog] = useState({
    open: false,
    orderId: null,
    rating: 0
  });
  const [selectedOrder, setSelectedOrder] = useState(null);
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Ref to ensure order success message is only displayed once per navigation
  const hasDisplayedOrderSuccess = useRef(false);

  const fetchOrders = useCallback(async () => {
    try {
      const response = await axios.get('/api/orders');
      return response.data;
    } catch (err) {
      console.error('Error fetching orders:', err);
      throw err;
    }
  }, []);

  useEffect(() => {
    const loadOrders = async () => {
      setLoading(true);
      setError(null);
      try {
        let fetchedOrders = await fetchOrders();
        setOrders(fetchedOrders);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch orders. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    loadOrders();
  }, [fetchOrders]);

  useEffect(() => {
    if (location.state?.newOrder && !hasDisplayedOrderSuccess.current) {
      const message = location.state.message || 'Order placed successfully!';
      setSuccessMessage(message);
      setOrderSuccessDialogOpen(true);
      hasDisplayedOrderSuccess.current = true;

      const timer = setTimeout(() => {
        setOrderSuccessDialogOpen(false);
        setSuccessMessage(null);
        hasDisplayedOrderSuccess.current = false;
      }, 5000);

      navigate(location.pathname, { replace: true });
      return () => clearTimeout(timer);
    }
  }, [location.state, navigate]);

  const handleOrderSuccessDialogClose = () => {
    setOrderSuccessDialogOpen(false);
    setSuccessMessage(null);
    hasDisplayedOrderSuccess.current = false;
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'Pending': return 'warning';
      case 'Preparing': return 'info';
      case 'Ready': return 'success';
      case 'Out_for_delivery': return 'primary';
      case 'Delivered': return 'success';
      case 'Cancelled': return 'error';
      default: return 'default';
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'Paid': return 'success';
      case 'Failed': return 'error';
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
      setTimeout(() => {
        setOrderSuccessDialogOpen(false);
        setSuccessMessage(null);
      }, 5000);
    } catch (err) {
      console.error('Error deleting order:', err);
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
      await axios.post(`/api/orders/${ratingDialog.orderId}/rate`, {
        rating: ratingDialog.rating
      });
      
      setOrders(orders.map(order => 
        order._id === ratingDialog.orderId 
          ? { ...order, rating: ratingDialog.rating }
          : order
      ));
      
      setRatingDialog({ open: false, orderId: null, rating: 0 });
      setSuccessMessage('Rating submitted successfully!');
      setOrderSuccessDialogOpen(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit rating');
    }
  };

  const handleReorder = (order) => {
    const items = order.items.map(item => ({
      _id: item._id,
      name: item.name,
      quantity: item.quantity,
      price: item.price
    }));
    
    navigate('/cart', { 
      state: { 
        reorderItems: items,
        restaurantId: order.restaurant._id
      }
    });
  };

  const getEstimatedDeliveryTime = (order) => {
    const orderTime = new Date(order.createdAt);
    let estimatedMinutes = 30; // Default 30 minutes

    // Adjust estimated time based on order status
    switch (order.status.toLowerCase()) {
      case 'pending':
        estimatedMinutes = 30;
        break;
      case 'Preparing':
        estimatedMinutes = 20;
        break;
      case 'Ready':
        estimatedMinutes = 15;
        break;
      case 'Out_for_delivery':
        estimatedMinutes = 10;
        break;
      case 'Delivered':
        return 'Delivered';
      case 'Cancelled':
        return 'Cancelled';
      default:
        estimatedMinutes = 30;
    }

    const estimatedTime = new Date(orderTime.getTime() + estimatedMinutes * 60000);
    return `Expected by ${estimatedTime.toLocaleTimeString()}`;
  };

  const getOrderProgress = (status) => {
    switch (status.toLowerCase()) {
      case 'Pending': return 10;
      case 'Preparing': return 30;
      case 'Ready': return 60;
      case 'Out_for_delivery': return 80;
      case 'Delivered': return 100;
      case 'Cancelled': return 0;
      default: return 0;
    }
  };

  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case 'Pending':
        return '⏳';
      case 'Preparing':
        return '👨‍🍳';
      case 'Ready':
        return '✅';
      case 'Out_for_delivery':
        return '🛵';
      case 'Delivered':
        return '🎉';
      case 'Cancelled':
        return '❌';
      default:
        return '📦';
    }
  };

  // Add polling for order status updates
  useEffect(() => {
    const pollOrders = async () => {
      try {
        const response = await axios.get('/api/orders');
        const updatedOrders = response.data.map(order => ({
          ...order,
          status: order.status || 'Pending' // Ensure status is never undefined
        }));
        setOrders(updatedOrders);
      } catch (err) {
        console.error('Error polling orders:', err);
      }
    };

    // Initial fetch
    pollOrders();

    // Poll every 30 seconds
    const interval = setInterval(pollOrders, 30000);

    return () => clearInterval(interval);
  }, []);

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
                        icon={<span>{getStatusIcon(order.status)}</span>}
                        label={order.status || 'Pending'}
                        color={getStatusColor(order.status)}
                        sx={{ fontWeight: 'bold' }}
                      />
                      <Chip
                        label={order.paymentStatus || 'Pending'}
                        color={getPaymentStatusColor(order.paymentStatus)}
                      />
                      {order.status === 'Delivered' && !order.rating && (
                        <Tooltip title="Rate Order">
                          <IconButton
                            color="primary"
                            onClick={() => {
                              setSelectedOrder(order);
                              setRatingDialog({
                                open: true,
                                orderId: order._id,
                                rating: order.rating || 0
                              });
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
                      <Tooltip title="Delete Order">
                        <IconButton
                          color="error"
                          onClick={() => handleDeleteClick(order)}
                          size="small"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>

                  <Typography variant="subtitle1" gutterBottom>
                    {order.restaurant ? order.restaurant.name : 'N/A'}
                  </Typography>

                  <Box mb={2}>
                    <Typography variant="body2" color="textSecondary">
                      {getEstimatedDeliveryTime(order)}
                    </Typography>
                    <Box sx={{ mt: 1, mb: 1 }}>
                      <LinearProgress 
                        variant="determinate" 
                        value={getOrderProgress(order.status)} 
                        sx={{ 
                          height: 8,
                          borderRadius: 4,
                          backgroundColor: '#e0e0e0',
                          '& .MuiLinearProgress-bar': {
                            borderRadius: 4,
                            backgroundColor: getStatusColor(order.status) === 'error' ? '#f44336' : (order.status === 'delivered' ? '#4caf50' : '#ff9800')
                          }
                        }}
                      />
                    </Box>
                    <Typography variant="caption" color="textSecondary">
                      {order.status === 'delivered' ? 'Order completed' : 'Order in progress'}
                    </Typography>
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
                          <Typography variant="body2" color="textSecondary">
                            Order Status: {order.status}
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

                  <Box mt={2} display="flex" justifyContent="space-between" alignItems="center">
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
      <Dialog
        open={ratingDialog.open}
        onClose={() => setRatingDialog({ open: false, orderId: null, rating: 0 })}
      >
        <DialogTitle>Rate Your Order</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" alignItems="center" mt={2}>
            <Rating
              value={ratingDialog.rating}
              onChange={(event, newValue) => {
                setRatingDialog(prev => ({ ...prev, rating: newValue }));
              }}
              size="large"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRatingDialog({ open: false, orderId: null, rating: 0 })}>
            Cancel
          </Button>
          <Button
            onClick={handleRateOrder}
            variant="contained"
            disabled={ratingDialog.rating === 0}
          >
            Submit Rating
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Orders; 