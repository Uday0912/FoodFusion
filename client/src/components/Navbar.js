import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Badge,
  Box,
} from '@mui/material';
import {
  ShoppingCart as CartIcon,
  Person as PersonIcon,
  Receipt as OrderIcon,
  Logout as LogoutIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { cart } = useCart();

  return (
    <AppBar position="static" sx={{ background: 'linear-gradient(to right, #ff6b6b, #4ecdc4)' }}>
      <Toolbar sx={{ fontFamily: 'Poppins, sans-serif' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1, gap: 1 }}>
          <Box sx={{
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '4px 8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minWidth: '40px',
            height: '30px',
          }}>
            <Typography
              variant="h6"
              sx={{
                color: '#ff6b6b',
                fontWeight: 900,
                fontSize: '1.2rem',
                lineHeight: 1,
                fontFamily: 'Poppins, sans-serif',
              }}
            >
              FF
            </Typography>
          </Box>
          <Typography
            variant="h6"
            component={RouterLink}
            to="/"
            sx={{
              textDecoration: 'none',
              color: 'white',
              fontWeight: 700,
              letterSpacing: 1,
              fontFamily: 'Poppins, sans-serif',
            }}
          >
            Food Fusion
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
          {user ? (
            <>
              <Button
                component={RouterLink}
                to="/cart"
                color="inherit"
                startIcon={
                  <Badge badgeContent={cart.length} color="error">
                    <CartIcon sx={{ color: 'white' }} />
                  </Badge>
                }
                sx={{ color: 'white', textTransform: 'none', fontWeight: 500, fontFamily: 'Poppins, sans-serif' }}
              >
                Cart
              </Button>
              <Button
                component={RouterLink}
                to="/orders"
                color="inherit"
                startIcon={<OrderIcon sx={{ color: 'white' }} />}
                sx={{ color: 'white', textTransform: 'none', fontWeight: 500, fontFamily: 'Poppins, sans-serif' }}
              >
                Orders
              </Button>
              <Button
                component={RouterLink}
                to="/profile"
                color="inherit"
                startIcon={<PersonIcon sx={{ color: 'white' }} />}
                sx={{ color: 'white', textTransform: 'none', fontWeight: 500, fontFamily: 'Poppins, sans-serif' }}
              >
                Profile
              </Button>
              <Button
                color="inherit"
                startIcon={<LogoutIcon sx={{ color: 'white' }} />}
                onClick={logout}
                sx={{ color: 'white', textTransform: 'none', fontWeight: 500, fontFamily: 'Poppins, sans-serif' }}
              >
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button
                component={RouterLink}
                to="/login"
                color="inherit"
                sx={{ color: 'white', textTransform: 'none', fontWeight: 500, fontFamily: 'Poppins, sans-serif' }}
              >
                Login
              </Button>
              <Button
                component={RouterLink}
                to="/register"
                color="inherit"
                sx={{ color: 'white', textTransform: 'none', fontWeight: 500, fontFamily: 'Poppins, sans-serif' }}
              >
                Register
              </Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
