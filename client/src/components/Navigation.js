import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Badge,
  Box,
  Menu,
  MenuItem,
  Avatar,
  useMediaQuery,
  useTheme,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  Menu as MenuIcon,
  ShoppingCart as CartIcon,
  Person as PersonIcon,
  Home as HomeIcon,
  Restaurant as RestaurantIcon,
  Receipt as OrderIcon,
  Favorite as FavoriteIcon,
  ExitToApp as LogoutIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';

const Navigation = () => {
  const { user, logout } = useAuth();
  const { cart } = useCart();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleClose();
    navigate('/');
  };

  const handleMobileMenuToggle = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const menuItems = [
    { text: 'Home', icon: <HomeIcon />, path: '/' },
    { text: 'Restaurants', icon: <RestaurantIcon />, path: '/restaurants' },
    { text: 'Orders', icon: <OrderIcon />, path: '/orders' },
    { text: 'Favorites', icon: <FavoriteIcon />, path: '/favorites' },
  ];

  const renderMobileMenu = () => (
    <Drawer
      anchor="right"
      open={mobileMenuOpen}
      onClose={handleMobileMenuToggle}
      PaperProps={{
        sx: {
          width: 280,
          backgroundColor: 'background.paper',
        },
      }}
    >
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Menu
        </Typography>
        <List>
          {menuItems.map((item) => (
            <ListItem
              button
              key={item.text}
              onClick={() => {
                navigate(item.path);
                handleMobileMenuToggle();
              }}
              sx={{
                borderRadius: 1,
                mb: 0.5,
                '&:hover': {
                  backgroundColor: 'primary.light',
                  color: 'white',
                  '& .MuiListItemIcon-root': {
                    color: 'white',
                  },
                },
              }}
            >
              <ListItemIcon sx={{ color: 'primary.main' }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItem>
          ))}
          <Divider sx={{ my: 2 }} />
          {user ? (
            <>
              <ListItem
                button
                onClick={() => {
                  navigate('/profile');
                  handleMobileMenuToggle();
                }}
                sx={{
                  borderRadius: 1,
                  mb: 0.5,
                  '&:hover': {
                    backgroundColor: 'primary.light',
                    color: 'white',
                    '& .MuiListItemIcon-root': {
                      color: 'white',
                    },
                  },
                }}
              >
                <ListItemIcon sx={{ color: 'primary.main' }}>
                  <PersonIcon />
                </ListItemIcon>
                <ListItemText primary="Profile" />
              </ListItem>
              <ListItem
                button
                onClick={handleLogout}
                sx={{
                  borderRadius: 1,
                  '&:hover': {
                    backgroundColor: 'error.light',
                    color: 'white',
                    '& .MuiListItemIcon-root': {
                      color: 'white',
                    },
                  },
                }}
              >
                <ListItemIcon sx={{ color: 'error.main' }}>
                  <LogoutIcon />
                </ListItemIcon>
                <ListItemText primary="Logout" />
              </ListItem>
            </>
          ) : (
            <ListItem
              button
              onClick={() => {
                navigate('/login');
                handleMobileMenuToggle();
              }}
              sx={{
                borderRadius: 1,
                '&:hover': {
                  backgroundColor: 'primary.light',
                  color: 'white',
                  '& .MuiListItemIcon-root': {
                    color: 'white',
                  },
                },
              }}
            >
              <ListItemIcon sx={{ color: 'primary.main' }}>
                <PersonIcon />
              </ListItemIcon>
              <ListItemText primary="Login" />
            </ListItem>
          )}
        </List>
      </Box>
    </Drawer>
  );

  return (
    <AppBar position="sticky" sx={{ backgroundColor: 'background.paper', boxShadow: 1 }}>
      <Toolbar sx={{ px: { xs: 1, sm: 2 } }}>
        <Typography
          variant="h6"
          component="div"
          sx={{
            flexGrow: 1,
            color: 'primary.main',
            fontWeight: 'bold',
            cursor: 'pointer',
            fontSize: { xs: '1.1rem', sm: '1.25rem' }
          }}
          onClick={() => navigate('/')}
        >
          FoodHub
        </Typography>

        {isMobile ? (
          <>
            <IconButton
              color="primary"
              onClick={() => navigate('/cart')}
              sx={{ mr: 1 }}
            >
              <Badge badgeContent={cart.length} color="primary">
                <CartIcon />
              </Badge>
            </IconButton>
            <IconButton
              color="primary"
              onClick={handleMobileMenuToggle}
            >
              <MenuIcon />
            </IconButton>
            {renderMobileMenu()}
          </>
        ) : (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {menuItems.map((item) => (
              <Button
                key={item.text}
                color="primary"
                onClick={() => navigate(item.path)}
                startIcon={item.icon}
                sx={{
                  display: { xs: 'none', md: 'flex' },
                  '&:hover': {
                    backgroundColor: 'rgba(255,107,107,0.04)',
                  }
                }}
              >
                {item.text}
              </Button>
            ))}
            <IconButton
              color="primary"
              onClick={() => navigate('/cart')}
              sx={{ ml: 1 }}
            >
              <Badge badgeContent={cart.length} color="primary">
                <CartIcon />
              </Badge>
            </IconButton>
            {user ? (
              <>
                <IconButton
                  onClick={handleMenu}
                  color="primary"
                >
                  <Avatar
                    sx={{
                      width: 32,
                      height: 32,
                      bgcolor: 'primary.main',
                      fontSize: '0.875rem'
                    }}
                  >
                    {user.name?.charAt(0).toUpperCase()}
                  </Avatar>
                </IconButton>
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleClose}
                  PaperProps={{
                    sx: {
                      mt: 1.5,
                      minWidth: 180,
                      boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.1)',
                      borderRadius: 2
                    }
                  }}
                >
                  <MenuItem
                    onClick={() => {
                      navigate('/profile');
                      handleClose();
                    }}
                    sx={{
                      py: 1,
                      '&:hover': {
                        backgroundColor: 'rgba(255,107,107,0.04)',
                      }
                    }}
                  >
                    <ListItemIcon>
                      <PersonIcon fontSize="small" color="primary" />
                    </ListItemIcon>
                    Profile
                  </MenuItem>
                  <MenuItem
                    onClick={handleLogout}
                    sx={{
                      py: 1,
                      color: 'error.main',
                      '&:hover': {
                        backgroundColor: 'rgba(255,82,82,0.04)',
                      }
                    }}
                  >
                    <ListItemIcon>
                      <LogoutIcon fontSize="small" color="error" />
                    </ListItemIcon>
                    Logout
                  </MenuItem>
                </Menu>
              </>
            ) : (
              <Button
                color="primary"
                variant="contained"
                onClick={() => navigate('/login')}
                sx={{
                  ml: 1,
                  display: { xs: 'none', sm: 'block' }
                }}
              >
                Login
              </Button>
            )}
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navigation; 