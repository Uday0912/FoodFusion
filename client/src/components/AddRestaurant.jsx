import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../utils/axios';
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Paper
} from '@mui/material';

const AddRestaurant = () => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    cuisine: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
    },
    phone: '',
    email: '',
    openingHours: {
      monday: { open: '', close: '' },
      tuesday: { open: '', close: '' },
      wednesday: { open: '', close: '' },
      thursday: { open: '', close: '' },
      friday: { open: '', close: '' },
      saturday: { open: '', close: '' },
      sunday: { open: '', close: '' },
    },
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('address.')) {
      const addressField = name.split('.')[1];
      setFormData(prevData => ({
        ...prevData,
        address: {
          ...prevData.address,
          [addressField]: value
        }
      }));
    } else if (name.startsWith('openingHours.')) {
      const [day, timeType] = name.split('.')[1].split('-');
      setFormData(prevData => ({
        ...prevData,
        openingHours: {
          ...prevData.openingHours,
          [day]: {
            ...prevData.openingHours[day],
            [timeType]: value
          }
        }
      }));
    } else {
      setFormData(prevData => ({
        ...prevData,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const restaurantData = {
        ...formData,
        cuisine: formData.cuisine.split(',').map(c => c.trim()), // Convert comma-separated string to array
      };
      await axios.post('/api/restaurants', restaurantData);
      setSuccess('Restaurant added successfully!');
      setFormData({
        name: '',
        description: '',
        cuisine: '',
        address: {
          street: '',
          city: '',
          state: '',
          zipCode: '',
        },
        phone: '',
        email: '',
        openingHours: {
          monday: { open: '', close: '' },
          tuesday: { open: '', close: '' },
          wednesday: { open: '', close: '' },
          thursday: { open: '', close: '' },
          friday: { open: '', close: '' },
          saturday: { open: '', close: '' },
          sunday: { open: '', close: '' },
        },
      });
      // Optionally navigate or show a success message
      setTimeout(() => {
        navigate('/restaurants'); // Redirect to restaurants list
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add restaurant.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Add New Restaurant
        </Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
          <TextField
            name="name"
            label="Restaurant Name"
            value={formData.name}
            onChange={handleChange}
            fullWidth
            required
            margin="normal"
          />
          <TextField
            name="description"
            label="Description"
            value={formData.description}
            onChange={handleChange}
            fullWidth
            required
            margin="normal"
            multiline
            rows={3}
          />
          <TextField
            name="cuisine"
            label="Cuisine (comma-separated)"
            value={formData.cuisine}
            onChange={handleChange}
            fullWidth
            required
            margin="normal"
            helperText="e.g., Italian, Mexican, Indian"
          />
          <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>Address</Typography>
          <TextField
            name="address.street"
            label="Street"
            value={formData.address.street}
            onChange={handleChange}
            fullWidth
            required
            margin="normal"
          />
          <TextField
            name="address.city"
            label="City"
            value={formData.address.city}
            onChange={handleChange}
            fullWidth
            required
            margin="normal"
          />
          <TextField
            name="address.state"
            label="State"
            value={formData.address.state}
            onChange={handleChange}
            fullWidth
            required
            margin="normal"
          />
          <TextField
            name="address.zipCode"
            label="Zip Code"
            value={formData.address.zipCode}
            onChange={handleChange}
            fullWidth
            required
            margin="normal"
          />
          <TextField
            name="phone"
            label="Phone"
            value={formData.phone}
            onChange={handleChange}
            fullWidth
            required
            margin="normal"
          />
          <TextField
            name="email"
            label="Email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            fullWidth
            required
            margin="normal"
          />

          <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>Opening Hours</Typography>
          {Object.keys(formData.openingHours).map(day => (
            <Box key={day} sx={{ display: 'flex', gap: 2, alignItems: 'center', mt: 1 }}>
              <Typography sx={{ width: 100, textTransform: 'capitalize' }}>{day}</Typography>
              <TextField
                name={`openingHours.${day}-open`}
                label="Open"
                type="time"
                value={formData.openingHours[day].open}
                onChange={handleChange}
                size="small"
                InputLabelProps={{
                  shrink: true,
                }}
              />
              <TextField
                name={`openingHours.${day}-close`}
                label="Close"
                type="time"
                value={formData.openingHours[day].close}
                onChange={handleChange}
                size="small"
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Box>
          ))}

          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mt: 4 }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Add Restaurant'}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default AddRestaurant; 