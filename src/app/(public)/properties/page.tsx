"use client";

import { useState } from "react";
import {
  Box,
  Container,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Grid,
  Pagination,
  CircularProgress,
  Alert,
  Slider,
  Paper,
  InputAdornment,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import TuneIcon from "@mui/icons-material/Tune";
import { useProperties } from "@/hooks/useProperties";
import { PropertyFilterParams } from "@/lib/types";
import PropertyCard from "@/components/PropertyCard";

export default function PropertiesPage() {
  const [filters, setFilters] = useState<PropertyFilterParams>({
    Page: 1,
    PageSize: 9,
    SortBy: "CreatedAt",
    IsDescending: true,
  });

  const { data, loading, error } = useProperties(filters);

  const handleChange = (key: keyof PropertyFilterParams, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value, Page: 1 }));
  };

  const handleSearch = () => {
    setFilters((prev) => ({ ...prev, Page: 1 }));
  };

  const formatPrice = (value: number) => {
    if (value >= 10000000) return `${(value / 10000000).toFixed(1)}Cr`;
    if (value >= 100000) return `${(value / 100000).toFixed(1)}L`;
    return value.toLocaleString();
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Properties for Sale & Rent
        </Typography>

        {/* Filter Panel */}
        <Paper elevation={2} sx={{ p: 3, borderRadius: 3, mb: 4 }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
            <TuneIcon sx={{ mr: 1, verticalAlign: "middle" }} />
            Filters
          </Typography>
          <Grid container spacing={3}>
            {/* City */}
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <TextField
                fullWidth
                label="City"
                value={filters.City || ""}
                onChange={(e) => handleChange("City", e.target.value)}
                size="small"
              />
            </Grid>
            {/* Property Type */}
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Type</InputLabel>
                <Select
                  value={filters.PropertyType || ""}
                  label="Type"
                  onChange={(e) =>
                    handleChange("PropertyType", e.target.value || undefined)
                  }
                >
                  <MenuItem value="">All Types</MenuItem>
                  <MenuItem value="HOUSE">House</MenuItem>
                  <MenuItem value="FLAT">Flat</MenuItem>
                  <MenuItem value="COMMERCIAL">Commercial</MenuItem>
                  <MenuItem value="SHOP">Shop</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            {/* Status */}
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Status</InputLabel>
                <Select
                  value={filters.Status || ""}
                  label="Status"
                  onChange={(e) =>
                    handleChange("Status", e.target.value || undefined)
                  }
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="APPROVED">For Sale</MenuItem>
                  <MenuItem value="RENTED">For Rent</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            {/* Search Term */}
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <TextField
                fullWidth
                label="Keyword"
                value={filters.SearchTerm || ""}
                onChange={(e) => handleChange("SearchTerm", e.target.value)}
                size="small"
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon color="action" />
                      </InputAdornment>
                    ),
                  },
                }}
              />
            </Grid>

            {/* Price Range */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="subtitle2" gutterBottom>
                Price Range (PKR)
              </Typography>
              <Slider
                value={[filters.MinPrice || 0, filters.MaxPrice || 500000000]}
                onChange={(_, newVal) => {
                  const [min, max] = newVal as number[];
                  handleChange("MinPrice", min === 0 ? undefined : min);
                  handleChange("MaxPrice", max === 500000000 ? undefined : max);
                }}
                min={0}
                max={500000000}
                step={1000000}
                valueLabelDisplay="auto"
                valueLabelFormat={formatPrice}
              />
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="caption">0</Typography>
                <Typography variant="caption">50Cr</Typography>
              </Box>
            </Grid>

            {/* Bedrooms */}
            <Grid size={{ xs: 12, md: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                Bedrooms
              </Typography>
              <Slider
                value={[filters.MinBedrooms || 0, filters.MaxBedrooms || 10]}
                onChange={(_, newVal) => {
                  const [min, max] = newVal as number[];
                  handleChange("MinBedrooms", min === 0 ? undefined : min);
                  handleChange("MaxBedrooms", max === 10 ? undefined : max);
                }}
                min={0}
                max={10}
                step={1}
                valueLabelDisplay="auto"
              />
            </Grid>

            {/* Area Size */}
            <Grid size={{ xs: 12, md: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                Area Size (Sq. Ft.)
              </Typography>
              <Slider
                value={[filters.MinAreaSize || 0, filters.MaxAreaSize || 10000]}
                onChange={(_, newVal) => {
                  const [min, max] = newVal as number[];
                  handleChange("MinAreaSize", min === 0 ? undefined : min);
                  handleChange("MaxAreaSize", max === 10000 ? undefined : max);
                }}
                min={0}
                max={10000}
                step={100}
                valueLabelDisplay="auto"
              />
            </Grid>

            {/* Sort */}
            <Grid size={{ xs: 12, md: 4 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Sort By</InputLabel>
                <Select
                  value={filters.SortBy || "CreatedAt"}
                  label="Sort By"
                  onChange={(e) => handleChange("SortBy", e.target.value)}
                >
                  <MenuItem value="CreatedAt">Newest</MenuItem>
                  <MenuItem value="Price">Price</MenuItem>
                  <MenuItem value="AreaSize">Area</MenuItem>
                  <MenuItem value="Bedrooms">Bedrooms</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid
              size={{ xs: 12, md: 4 }}
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Button
                fullWidth
                variant="outlined"
                onClick={() =>
                  handleChange("IsDescending", !filters.IsDescending)
                }
              >
                {filters.IsDescending ? "↓ Descending" : "↑ Ascending"}
              </Button>
            </Grid>
            <Grid
              size={{ xs: 12, md: 4 }}
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Button fullWidth variant="contained" onClick={handleSearch}>
                Apply Filters
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {/* Property Grid */}
        {loading && (
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
            <CircularProgress size={60} />
          </Box>
        )}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        {data && data.items.length === 0 && !loading && (
          <Typography align="center" color="text.secondary" sx={{ py: 8 }}>
            No properties found. Try adjusting your filters.
          </Typography>
        )}
        <Grid container spacing={4}>
          {data?.items.map((property) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={property.id}>
              <PropertyCard property={property} />
            </Grid>
          ))}
        </Grid>
        {data && data.totalCount > 0 && (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 6, mb: 4 }}>
            <Pagination
              count={Math.ceil(data.totalCount / data.pageSize)}
              page={data.page}
              onChange={(_, page) => handleChange("Page", page)}
              color="primary"
              size="large"
            />
          </Box>
        )}
      </Container>
    </Box>
  );
}
