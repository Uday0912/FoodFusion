import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Container, Typography, CircularProgress, Alert, Box, Divider } from '@mui/material';

const OrderDetails = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await axios.get(`/api/orders/${orderId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        setOrder(response.data);
      } catch (err) {
        setError('Failed to fetch order details');
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [orderId]);

  if (loading) return <Box sx={{ textAlign: 'center', mt: 4 }}><CircularProgress /></Box>;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!order) return null;

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>Order Details</Typography>
      <Divider sx={{ mb: 2 }} />
      <Typography variant="body1"><b>Order ID:</b> {order._id}</Typography>
      <Typography variant="body1"><b>Status:</b> {order.status}</Typography>
      <Typography variant="body1"><b>Total:</b> ₹{order.totalAmount}</Typography>
      <Typography variant="body1"><b>Payment Method:</b> {order.paymentMethod}</Typography>
      <Typography variant="body1"><b>Created At:</b> {new Date(order.createdAt).toLocaleString()}</Typography>
      <Typography variant="body1" sx={{ mt: 2 }}><b>Delivery Address:</b></Typography>
      <Typography variant="body2" sx={{ ml: 2 }}>
        {order.deliveryAddress && typeof order.deliveryAddress === 'object'
          ? `${order.deliveryAddress.street}, ${order.deliveryAddress.city}, ${order.deliveryAddress.state} ${order.deliveryAddress.zipCode}`
          : order.deliveryAddress || 'No address available'}
      </Typography>
      <Typography variant="body1" sx={{ mt: 2 }}><b>Items:</b></Typography>
      <Box sx={{ ml: 2 }}>
        {order.items.map((item, idx) => (
          <Typography key={idx} variant="body2">
            • {item.quantity}x {item.name} - ₹{item.price.toFixed(2)}
          </Typography>
        ))}
      </Box>
    </Container>
  );
};

export default OrderDetails; 