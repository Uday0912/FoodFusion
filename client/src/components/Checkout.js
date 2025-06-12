import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Divider,
  CircularProgress,
  Alert,
} from '@mui/material';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const Checkout = () => {
  const { cart, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const handlePlaceOrder = async () => {
    if (!user) {
      setError('Please login to place an order.');
      return;
    }

    if (cart.length === 0) {
      setError('Your cart is empty.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Prepare items for the backend (assuming backend expects an array of objects with _id, quantity, price)
      const orderItems = cart.map(item => ({
        _id: item._id,
        name: item.name, // Include name if backend needs it for history
        quantity: item.quantity,
        price: item.price,
        // Add other fields if your backend requires them (e.g., restaurant ID per item)
      }));

      const orderData = {
        items: orderItems,
        total: calculateTotal(),
        // Add other order details if needed (e.g., shipping address, payment method)
      };

      const response = await axios.post('/api/orders', orderData);

      setSuccess('Order placed successfully!');
      clearCart(); // Clear cart on successful order

      // Redirect to orders page or show confirmation
      navigate('/orders', { state: { newOrder: response.data, orderSuccess: true, message: 'Your order has been placed successfully! You can track your order status here.' } });

    } catch (err) {
      console.error('Error placing order:', err);
      setError(err.response?.data?.message || 'Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0 && !success) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ mt: 8, textAlign: 'center' }}>
          <Typography variant="h5" gutterBottom>
            Your cart is empty.
          </Typography>
          <Button variant="contained" onClick={() => navigate('/restaurants')} sx={{ mt: 2 }}>
            Browse Restaurants
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Checkout
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Order Summary
            </Typography>
            <Divider sx={{ my: 2 }} />
            <Grid container spacing={2}>
              {cart.map((item) => (
                <Grid item xs={12} key={item._id}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body1">{item.name} x {item.quantity}</Typography>
                    <Typography variant="body1">₹{(item.price * item.quantity).toFixed(2)}</Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="h6">Total</Typography>
              <Typography variant="h6">₹{calculateTotal().toFixed(2)}</Typography>
            </Box>
          </CardContent>
        </Card>

        {/* Add Delivery Address and Payment Method sections here if needed */}
        {/* For now, we'll keep it simple and just use the cart and total */}

        <Button
          variant="contained"
          fullWidth
          size="large"
          onClick={handlePlaceOrder}
          sx={{ mt: 3 }}
          disabled={loading || cart.length === 0}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : 'Place Order'}
        </Button>
      </Box>
    </Container>
  );
};

export default Checkout; 