import {
  TextField,
  Slider,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Box,
} from '@mui/material';
import { PropertyFilterParams } from '@/lib/types';

interface Props {
  filters: PropertyFilterParams;
  onFilterChange: (newFilters: PropertyFilterParams) => void;
}

const PropertyTypeMap: Record<number, string> = {
  0: 'House',
  1: 'Apartment',
  2: 'Plot',
  3: 'Commercial',
};

const StatusMap: Record<number, string> = {
  0: 'For Sale',
  1: 'For Rent',
};

export default function FilterSidebar({ filters, onFilterChange }: Props) {
  const updateFilter = (key: keyof PropertyFilterParams, value: any) => {
    onFilterChange({ ...filters, [key]: value, page: 1 });
  };

  return (
    <Box sx={{ p: 2, width: 280 }}>
      <Typography variant="h6" gutterBottom>Filters</Typography>
      <TextField
        label="Search"
        fullWidth
        margin="normal"
        value={filters.searchTerm || ''}
        onChange={(e) => updateFilter('searchTerm', e.target.value)}
      />
      <TextField
        label="City"
        fullWidth
        margin="normal"
        value={filters.city || ''}
        onChange={(e) => updateFilter('city', e.target.value)}
      />
      <FormControl fullWidth margin="normal">
        <InputLabel>Property Type</InputLabel>
        <Select
          value={filters.propertyType ?? ''}
          onChange={(e) => {
            const value = e.target.value as string;
            updateFilter('propertyType', value === '' ? undefined : Number(value));
          }}
        >
          <MenuItem value="">All</MenuItem>
          {Object.entries(PropertyTypeMap).map(([key, label]) => (
            <MenuItem key={key} value={key}>{label}</MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormControl fullWidth margin="normal">
        <InputLabel>Status</InputLabel>
        <Select
          value={filters.status ?? ''}
          onChange={(e) => {
            const value = e.target.value as string;
            updateFilter('status', value === '' ? undefined : Number(value));
          }}
        >
          <MenuItem value="">All</MenuItem>
          {Object.entries(StatusMap).map(([key, label]) => (
            <MenuItem key={key} value={key}>{label}</MenuItem>
          ))}
        </Select>
      </FormControl>
      <Typography gutterBottom>Price Range</Typography>
      <Slider
        value={[filters.minPrice || 0, filters.maxPrice || 10000000]}
        min={0}
        max={10000000}
        step={1000}
        onChange={(_, newVal) => {
          updateFilter('minPrice', (newVal as number[])[0]);
          updateFilter('maxPrice', (newVal as number[])[1]);
        }}
        valueLabelDisplay="auto"
      />
      <Typography gutterBottom>Bedrooms</Typography>
      <Slider
        value={[filters.minBedrooms || 0, filters.maxBedrooms || 10]}
        min={0}
        max={10}
        onChange={(_, newVal) => {
          updateFilter('minBedrooms', (newVal as number[])[0]);
          updateFilter('maxBedrooms', (newVal as number[])[1]);
        }}
      />
      <Button variant="contained" fullWidth sx={{ mt: 2 }} onClick={() => onFilterChange({ ...filters, page: 1 })}>
        Apply Filters
      </Button>
    </Box>
  );
}