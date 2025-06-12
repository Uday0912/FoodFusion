import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Tabs,
  Tab,
  Card,
  CardContent,
  Grid,
  Button,
  Chip,
  LinearProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
} from '@mui/material';
import {
  Receipt,
  Replay,
  LocationOn,
  Delete,
} from '@mui/icons-material';
import axios from 'axios';
import { Link } from 'react-router-dom';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await axios.get('/api/orders', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setOrders(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setLoading(false);
    }
  };

  const handleReorder = async (orderId) => {
    try {
      await axios.post(`/api/orders/${orderId}/reorder`);
      // Redirect to cart or show success message
    } catch (error) {
      console.error('Error reordering:', error);
    }
  };

  const handleDeleteClick = (order) => {
    setOrderToDelete(order);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await axios.delete(`/api/orders/${orderToDelete._id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setOrders(orders.filter(order => order._id !== orderToDelete._id));
      setSuccessMessage('Order deleted successfully!');
      setSnackbarOpen(true);
    } catch (error) {
      setSuccessMessage(error.response?.data?.message || 'Failed to delete order');
    } finally {
      setDeleteDialogOpen(false);
      setOrderToDelete(null);
      setTimeout(() => {
        setSuccessMessage('');
        setSnackbarOpen(false);
      }, 4000);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setOrderToDelete(null);
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'warning',
      confirmed: 'info',
      preparing: 'info',
      ready: 'success',
      out_for_delivery: 'primary',
      delivered: 'success',
      cancelled: 'error',
    };
    return colors[status] || 'default';
  };

  const getStatusProgress = (status) => {
    const progress = {
      pending: 0,
      confirmed: 20,
      preparing: 40,
      ready: 60,
      out_for_delivery: 80,
      delivered: 100,
    };
    return progress[status] || 0;
  };

  const filteredOrders = orders.filter((order) => {
    if (activeTab === 0) return true; // All orders
    if (activeTab === 1) return order.status === 'delivered';
    if (activeTab === 2) return order.status !== 'delivered' && order.status !== 'cancelled';
    return false;
  });

  if (loading) {
    return <LinearProgress />;
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Order History
        </Typography>

        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs
            value={activeTab}
            onChange={(e, newValue) => setActiveTab(newValue)}
            aria-label="order history tabs"
          >
            <Tab label="All Orders" />
            <Tab label="Completed" />
            <Tab label="Active" />
          </Tabs>
        </Box>

        <Snackbar
          open={snackbarOpen && !!successMessage}
          autoHideDuration={4000}
          onClose={() => setSnackbarOpen(false)}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
          sx={{
            '& .MuiSnackbarContent-root': {
              background: 'linear-gradient(90deg, #43e97b 0%, #38f9d7 100%)',
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
          message={<span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><CheckCircleIcon sx={{ mr: 1 }} />{successMessage}</span>}
        />

        <Grid container spacing={3}>
          {filteredOrders.map((order) => (
            <Grid item xs={12} key={order._id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="h6">
                      Order ID: #{order._id.slice(-6)}
                    </Typography>
                    <Chip
                      label={order.status}
                      color={getStatusColor(order.status)}
                      size="small"
                    />
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      {new Date(order.createdAt).toLocaleString()}
                    </Typography>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <LinearProgress
                      variant="determinate"
                      value={getStatusProgress(order.status)}
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                  </Box>

                  <Grid container spacing={2} sx={{ mb: 2 }}>
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <LocationOn color="action" />
                        <Typography variant="body2">
                          {order.deliveryAddress && typeof order.deliveryAddress === 'object'
                            ? `${order.deliveryAddress.street}, ${order.deliveryAddress.city}, ${order.deliveryAddress.state} ${order.deliveryAddress.zipCode}`
                            : order.deliveryAddress || 'No address available'}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Receipt color="action" />
                        <Typography variant="body2">
                          Total: ₹{order.totalAmount}
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>

                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                    {order.status === 'delivered' && (
                      <Button
                        variant="outlined"
                        startIcon={<Replay />}
                        onClick={() => handleReorder(order._id)}
                      >
                        Reorder
                      </Button>
                    )}
                    <Button
                      variant="contained"
                      color="primary"
                      component={Link}
                      to={`/orders/${order._id}`}
                    >
                      View Details
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      startIcon={<Delete />}
                      onClick={() => handleDeleteClick(order)}
                    >
                      Delete
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {filteredOrders.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h6" color="text.secondary">
              No orders found
            </Typography>
          </Box>
        )}

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
      </Paper>
    </Container>
  );
};

export default OrderHistory; 