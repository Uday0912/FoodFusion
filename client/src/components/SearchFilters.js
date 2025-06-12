import React from 'react';
import {
  Paper,
  Typography,
  Slider,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Box,
  TextField,
  InputAdornment,
  Divider,
  Button,
} from '@mui/material';
import { LocationOn, AttachMoney } from '@mui/icons-material';

const SearchFilters = ({ filters, onFilterChange }) => {
  const handlePriceChange = (event, newValue) => {
    onFilterChange({ ...filters, priceRange: newValue });
  };

  const handleDistanceChange = (event) => {
    onFilterChange({ ...filters, maxDistance: event.target.value });
  };

  const handleDietaryChange = (event) => {
    const { name, checked } = event.target;
    onFilterChange({
      ...filters,
      dietaryRestrictions: {
        ...filters.dietaryRestrictions,
        [name]: checked,
      },
    });
  };

  const handleApply = () => {
    // Implementation of handleApply function
  };

  return (
    <Paper elevation={2} sx={{ p: 2, mb: 2 }}>
      <Typography variant="h6" gutterBottom>
        Search Filters
      </Typography>

      <Box sx={{ mb: 3 }}>
        <Typography gutterBottom>Price Range</Typography>
        <Slider
          value={filters.priceRange}
          onChange={handlePriceChange}
          valueLabelDisplay="auto"
          min={0}
          max={1000}
          marks={[
            { value: 0, label: '₹0' },
            { value: 500, label: '₹500' },
            { value: 1000, label: '₹1000' },
          ]}
        />
      </Box>

      <Divider sx={{ my: 2 }} />

      <Box sx={{ mb: 3 }}>
        <Typography gutterBottom>Max Distance</Typography>
        <TextField
          type="number"
          value={filters.maxDistance}
          onChange={handleDistanceChange}
          InputProps={{
            endAdornment: <InputAdornment position="end">km</InputAdornment>,
            startAdornment: (
              <InputAdornment position="start">
                <LocationOn />
              </InputAdornment>
            ),
          }}
          fullWidth
        />
      </Box>

      <Divider sx={{ my: 2 }} />

      <Box>
        <Typography gutterBottom>Dietary Restrictions</Typography>
        <FormGroup>
          <FormControlLabel
            control={
              <Checkbox
                checked={filters.vegetarian}
                onChange={handleDietaryChange}
                name="vegetarian"
              />
            }
            label="Vegetarian"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={filters.vegan}
                onChange={handleDietaryChange}
                name="vegan"
              />
            }
            label="Vegan"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={filters.glutenFree}
                onChange={handleDietaryChange}
                name="glutenFree"
              />
            }
            label="Gluten Free"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={filters.halal}
                onChange={handleDietaryChange}
                name="halal"
              />
            }
            label="Halal"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={filters.spicy}
                onChange={handleDietaryChange}
                name="spicy"
              />
            }
            label="Spicy"
          />
        </FormGroup>
      </Box>

      <Button variant="contained" color="primary" onClick={handleApply}>
        Apply Filters
      </Button>
    </Paper>
  );
};

export default SearchFilters; 