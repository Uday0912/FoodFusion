import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Button,
  IconButton,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel
} from '@mui/material';
import {
  Add as AddIcon,
  Remove as RemoveIcon,
  Delete as DeleteIcon,
  CreditCard as CreditCardIcon,
  AccountBalance as BankIcon,
  LocalAtm as CashIcon
} from '@mui/icons-material';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import axios from '../utils/axios';
import Snackbar from '@mui/material/Snackbar';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const Cart = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { 
    cart, 
    removeFromCart, 
    updateQuantity, 
    getCartTotal, 
    clearCart 
  } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [paymentDialog, setPaymentDialog] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('success');
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const handleQuantityChange = (itemId, change) => {
    const currentQuantity = cart.find(item => item._id === itemId)?.quantity || 0;
    updateQuantity(itemId, currentQuantity + change);
  };

  const handleCheckout = async () => {
    try {
      setLoading(true);
      setError(null);

      // Validate cart
      if (!cart.length) {
        throw new Error('Your cart is empty');
      }

      // Validate user address
      if (!user.address) {
        setError('Please update your delivery address in your profile before placing an order.');
        setMessageType('error');
        return;
      }

      // Get restaurant ID from the first item in cart
      const restaurantId = cart[0]?.restaurantId || cart[0]?.restaurant;
      if (!restaurantId) {
        throw new Error('No restaurant information found in cart');
      }

      // Format order data
      const orderData = {
        restaurantId: restaurantId,
        items: cart.map(item => ({
          _id: item._id,
          name: item.name,
          quantity: item.quantity || 1,
          price: item.price
        })),
        totalAmount: getCartTotal() + 5, // Including delivery fee
        deliveryAddress: {
          street: user.address,
          city: 'Default City',
          state: 'Default State',
          zipCode: '12345'
        },
        paymentMethod: paymentMethod,
        paymentStatus: 'paid',
        status: 'preparing'
      };

      console.log('Sending order data:', orderData); // Debug log

      const response = await axios.post('/api/orders', orderData);
      
      if (response.data) {
        // Clear cart after successful order
        clearCart();
        setPaymentDialog(false);
        setMessage('Order placed successfully! Redirecting to orders...');
        setMessageType('success');
        setSnackbarOpen(true);
        // Wait for 2 seconds to show the success message
        setTimeout(() => {
          navigate('/orders', {
            state: {
              newOrder: response.data,
              message: 'Order placed successfully! You can track your order status here.'
            }
          });
        }, 2000);
        return;
      }
    } catch (error) {
      console.error('Order error:', error);
      setError(error.response?.data?.message || error.message || 'Error placing order');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {cart.length === 0 ? (
        <Container sx={{ py: 4 }}>
          <Alert severity="info">
            Your cart is empty. <Button onClick={() => navigate('/restaurants')}>Browse Restaurants</Button>
          </Alert>
        </Container>
      ) : (
        <Container maxWidth="md" sx={{ py: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Your Cart
          </Typography>

          {cart.map((item, index) => (
            <Card key={`${item._id}-${index}`} sx={{ mb: 2 }}>
              <CardContent>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} sm={3}>
                    <img
                      src={item.image || 'https://source.unsplash.com/200x200/?food'}
                      alt={item.name}
                      style={{
                        width: '100%',
                        height: '100px',
                        objectFit: 'cover',
                        borderRadius: '8px'
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Typography variant="h6">{item.name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      ₹{((item.price || 0) * (item.quantity || 1)).toFixed(2)} total
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <IconButton
                        size="small"
                        onClick={() => handleQuantityChange(item._id, -1)}
                      >
                        <RemoveIcon />
                      </IconButton>
                      <Typography>{item.quantity || 1}</Typography>
                      <IconButton
                        size="small"
                        onClick={() => handleQuantityChange(item._id, 1)}
                      >
                        <AddIcon />
                      </IconButton>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={2}>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <IconButton
                        color="error"
                        onClick={() => removeFromCart(item._id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          ))}

          <Card sx={{ mt: 4 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Order Summary
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography>Subtotal</Typography>
                <Typography>₹{getCartTotal().toFixed(2)}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography>Delivery Fee</Typography>
                <Typography>₹50.00</Typography>
              </Box>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6">Total</Typography>
                <Typography variant="h6">₹{(getCartTotal() + 50).toFixed(2)}</Typography>
              </Box>
              <Button
                fullWidth
                variant="contained"
                color="primary"
                onClick={() => setPaymentDialog(true)}
                disabled={loading}
              >
                {loading ? 'Processing...' : 'Place Order'}
              </Button>
            </CardContent>
          </Card>

          <Dialog
            open={paymentDialog}
            onClose={() => setPaymentDialog(false)}
            maxWidth="sm"
            fullWidth
            PaperProps={{
              sx: {
                borderRadius: 3,
                boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
              }
            }}
          >
            <DialogTitle sx={{ 
              textAlign: 'center', 
              pb: 1,
              background: 'linear-gradient(45deg, #FF6B6B 30%, #4ECDC4 90%)',
              color: 'white',
              fontWeight: 'bold'
            }}>
              Place Your Order
            </DialogTitle>
            <DialogContent sx={{ p: 4 }}>
              <Box sx={{ textAlign: 'center', mb: 4 }}>
                <img 
                  src="https://cdn-icons-png.flaticon.com/512/1903/1903605.png" 
                  alt="Delivery" 
                  style={{ width: '120px', height: '120px', marginBottom: '16px' }}
                />
              </Box>

              <FormControl component="fieldset" sx={{ width: '100%', mb: 4 }}>
                <FormLabel component="legend" sx={{ mb: 2, fontWeight: 'bold' }}>
                  Select Payment Method
                </FormLabel>
                <RadioGroup
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                >
                  <Card sx={{ mb: 2, p: 2, cursor: 'pointer' }} onClick={() => setPaymentMethod('cash')}>
                    <FormControlLabel
                      value="cash"
                      control={<Radio />}
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <CashIcon color="primary" />
                          <Box>
                            <Typography variant="subtitle1">Cash on Delivery</Typography>
                            <Typography variant="body2" color="text.secondary">
                              Pay when your food arrives
                            </Typography>
                          </Box>
                        </Box>
                      }
                      sx={{ width: '100%', m: 0 }}
                    />
                  </Card>

                  <Card sx={{ mb: 2, p: 2, cursor: 'pointer' }} onClick={() => setPaymentMethod('card')}>
                    <FormControlLabel
                      value="card"
                      control={<Radio />}
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <CreditCardIcon color="primary" />
                          <Box>
                            <Typography variant="subtitle1">Credit/Debit Card</Typography>
                            <Typography variant="body2" color="text.secondary">
                              Pay securely with your card
                            </Typography>
                          </Box>
                        </Box>
                      }
                      sx={{ width: '100%', m: 0 }}
                    />
                  </Card>

                  <Card sx={{ mb: 2, p: 2, cursor: 'pointer' }} onClick={() => setPaymentMethod('upi')}>
                    <FormControlLabel
                      value="upi"
                      control={<Radio />}
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <BankIcon color="primary" />
                          <Box>
                            <Typography variant="subtitle1">UPI Payment</Typography>
                            <Typography variant="body2" color="text.secondary">
                              Pay using UPI apps
                            </Typography>
                          </Box>
                        </Box>
                      }
                      sx={{ width: '100%', m: 0 }}
                    />
                  </Card>
                </RadioGroup>
              </FormControl>

              <Box sx={{ mb: 4 }}>
                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                  Order Summary
                </Typography>
                <Box sx={{ 
                  backgroundColor: 'background.default', 
                  p: 2, 
                  borderRadius: 2,
                  mb: 2 
                }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Subtotal</Typography>
                    <Typography variant="body2">₹{getCartTotal().toFixed(2)}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Delivery Fee</Typography>
                    <Typography variant="body2">₹50.00</Typography>
                  </Box>
                  <Divider sx={{ my: 1 }} />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>Total</Typography>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                      ₹{(getCartTotal() + 50).toFixed(2)}
                    </Typography>
                  </Box>
                </Box>
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                  Delivery Address
                </Typography>
                <Box sx={{ 
                  backgroundColor: 'background.default', 
                  p: 2, 
                  borderRadius: 2 
                }}>
                  <Typography variant="body2">
                    {user?.address || 'Default Address'}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ 
                backgroundColor: 'primary.light', 
                p: 2, 
                borderRadius: 2,
                color: 'white',
                mb: 3
              }}>
                <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <span role="img" aria-label="info">ℹ️</span>
                  Estimated delivery time: 30-45 minutes
                </Typography>
              </Box>

              {error && (
                <Alert severity={messageType} sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}
            </DialogContent>
            <DialogActions sx={{ p: 3, pt: 0 }}>
              <Button 
                onClick={() => setPaymentDialog(false)}
                sx={{ 
                  color: 'text.secondary',
                  '&:hover': {
                    backgroundColor: 'background.default'
                  }
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCheckout}
                variant="contained"
                color="primary"
                disabled={loading}
                sx={{ 
                  px: 4,
                  py: 1,
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  }
                }}
              >
                {loading ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CircularProgress size={20} color="inherit" />
                    Processing...
                  </Box>
                ) : (
                  'Confirm Order'
                )}
              </Button>
            </DialogActions>
          </Dialog>
        </Container>
      )}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={2000}
        onClose={() => setSnackbarOpen(false)}
        message={message}
        action={
          <IconButton size="small" color="inherit" onClick={() => setSnackbarOpen(false)}>
            <CheckCircleIcon />
          </IconButton>
        }
      />
    </>
  );
};

export default Cart; 