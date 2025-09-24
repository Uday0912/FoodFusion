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
  Rating,
  List,
  ListItem,
  ListItemText
} from '@mui/material';
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

  const hasDisplayedOrderSuccess = useRef(false);

  const fetchOrders = useCallback(async () => {
    try {
      const response = await axios.get('/api/orders');
      return response.data;
    } catch (err) {
      throw err;
    }
  }, []);

  useEffect(() => {
    const loadOrders = async () => {
      setLoading(true);
      setError(null);
      try {
        const fetchedOrders = await fetchOrders();
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
      case 'pending':
        return 'warning';
      case 'preparing':
        return 'info';
      case 'ready':
        return 'success';
      case 'delivered':
        return 'success';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const handleDeleteOrder = async (orderId) => {
    try {
      await axios.delete(`/api/orders/${orderId}`);
      setOrders(orders.filter(order => order._id !== orderId));
      setDeleteDialogOpen(false);
      setOrderToDelete(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete order. Please try again later.');
    }
  };

  const handleRateOrder = async () => {
    if (!selectedOrder || rating === 0) return;

    try {
      await axios.post(`/api/orders/${selectedOrder._id}/rate`, { rating });
      setOrders(orders.map(order => 
        order._id === selectedOrder._id 
          ? { ...order, rating } 
          : order
      ));
      setRatingDialogOpen(false);
      setSelectedOrder(null);
      setRating(0);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to rate order. Please try again later.');
    }
  };

  const handleCancelOrder = async (orderId) => {
    try {
      await axios.post(`/api/orders/${orderId}/cancel`);
      setOrders(orders.map(order => 
        order._id === orderId 
          ? { ...order, status: 'cancelled' } 
          : order
      ));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to cancel order. Please try again later.');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        My Orders
      </Typography>

      {orders.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h6" color="text.secondary">
            No orders found
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {orders.map((order) => (
            <Grid item xs={12} key={order._id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Typography variant="h6">
                      Order #{order._id.slice(-6)}
                    </Typography>
                    <Chip 
                      label={order.status} 
                      color={getStatusColor(order.status)}
                      size="small"
                    />
                  </Box>

                  <Typography color="text.secondary" gutterBottom>
                    Placed on: {formatDate(order.createdAt)}
                  </Typography>

                  <List>
                    {order.items.map((item) => (
                      <ListItem key={item._id}>
                        <ListItemText
                          primary={item.name}
                          secondary={`Quantity: ${item.quantity}`}
                        />
                        <Typography variant="body2">
                          ${(item.price * item.quantity).toFixed(2)}
                        </Typography>
                      </ListItem>
                    ))}
                  </List>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                    <Typography variant="h6">
                      Total: ${order.total.toFixed(2)}
                    </Typography>
                    <Box>
                      {order.status === 'pending' && (
                        <Button
                          variant="outlined"
                          color="error"
                          size="small"
                          onClick={() => handleCancelOrder(order._id)}
                          sx={{ mr: 1 }}
                        >
                          Cancel Order
                        </Button>
                      )}
                      {order.status === 'delivered' && !order.rating && (
                        <Button
                          variant="outlined"
                          color="primary"
                          size="small"
                          onClick={() => {
                            setSelectedOrder(order);
                            setRatingDialogOpen(true);
                          }}
                        >
                          Rate Order
                        </Button>
                      )}
                    </Box>
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
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this order?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={() => handleDeleteOrder(orderToDelete?._id)} color="error">Delete</Button>
        </DialogActions>
      </Dialog>

      {/* Rating Dialog */}
      <Dialog open={ratingDialogOpen} onClose={() => setRatingDialogOpen(false)}>
        <DialogTitle>Rate Your Order</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
            <Rating
              value={rating}
              onChange={(event, newValue) => setRating(newValue)}
              size="large"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRatingDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleRateOrder} color="primary">
            Submit Rating
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Orders;