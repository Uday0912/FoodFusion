import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import FastfoodIcon from '@mui/icons-material/Fastfood';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(formData.email, formData.password);
      navigate('/');
    } catch (err) {
      setError('Login failed. Please try again later.');
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Paper elevation={6} sx={{
        p: 4,
        borderRadius: 3,
        boxShadow: 6,
        textAlign: 'center',
        minHeight: '400px',
        backgroundImage: 'url(https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=800&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'local',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <FastfoodIcon sx={{ fontSize: 48, color: 'white', mb: 1 }} />
        <Typography variant="h5" gutterBottom sx={{ color: 'white', textAlign: 'center', fontWeight: 600 }}>
          Login
        </Typography>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            margin="normal"
            required
            sx={{ backgroundColor: 'rgba(255,255,255,0.85)', borderRadius: 1 }}
            InputProps={{
              style: { color: '#333' },
            }}
          />
          <TextField
            fullWidth
            label="Password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            margin="normal"
            required
            sx={{ backgroundColor: 'rgba(255,255,255,0.85)', borderRadius: 1 }}
            InputProps={{
              style: { color: '#333' },
            }}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            sx={{ mt: 3, borderRadius: 1 }}
          >
            Login
          </Button>
        </form>
        <Box sx={{
          mt: 2,
          textAlign: 'center',
          position: 'relative',
          zIndex: 1,
        }}>
          <Typography variant="body2" align="center" sx={{ mt: 2, color: 'white' }}>
            Don't have an account? <RouterLink to="/register" style={{ color: 'white', textDecoration: 'none' }}>Register</RouterLink>
          </Typography>
          <RouterLink
            to="/forgot-password"
            variant="body2"
            style={{ color: 'white', textDecoration: 'none', display: 'inline-block', marginTop: 8 }}
          >
            Forgot Password
          </RouterLink>
        </Box>
      </Paper>
    </Container>
  );
};

export default Login; 