import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Typography,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import axios from '../utils/axios';

const Payment = ({ order, onPaymentComplete }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('card');

  const handlePayment = async () => {
    try {
      setLoading(true);
      setError('');

      // Create payment
      await axios.post('/api/payments', {
        orderId: order._id,
        paymentMethod
      });

      // Simulate payment processing
      setTimeout(() => {
        onPaymentComplete();
        navigate('/orders', {
          state: {
            newOrder: order,
            message: 'Payment successful! Your order has been placed.'
          }
        });
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Payment failed');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box p={3}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Typography variant="h6" gutterBottom>
        Payment Details
      </Typography>

      <Typography variant="body1" gutterBottom>
        Total Amount: ₹{order.totalAmount.toFixed(2)}
      </Typography>

      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>Payment Method</InputLabel>
        <Select
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.target.value)}
          label="Payment Method"
        >
          <MenuItem value="card">Credit/Debit Card</MenuItem>
          <MenuItem value="upi">UPI</MenuItem>
          <MenuItem value="cash">Cash on Delivery</MenuItem>
        </Select>
      </FormControl>

      <Button
        variant="contained"
        color="primary"
        fullWidth
        onClick={handlePayment}
        disabled={loading}
      >
        {paymentMethod === 'cash' ? 'Place Order' : 'Pay Now'}
      </Button>
    </Box>
  );
};

export default Payment; 