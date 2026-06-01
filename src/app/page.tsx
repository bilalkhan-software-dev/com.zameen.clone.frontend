"use client";

import { useState } from "react";
import {
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
  Box,
  CircularProgress,
  Alert,
  Slider,
} from "@mui/material";
import { useProperties } from "@/hooks/useProperties";
import { PropertyFilterParams } from "@/lib/types";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PropertyCard from "@/components/PropertyCard";

export default function Home() {
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
    // Triggered automatically via useEffect on filter change; we can force re-fetch by setting same object
    setFilters((prev) => ({ ...prev, Page: 1 }));
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Box sx={{ flex: 1, pb: 6 }}>
        {/* Search Section */}
        <Box sx={{ backgroundColor: "#f0f2f5", py: 4 }}>
          <Container maxWidth="lg">
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
              Find Your Property
            </Typography>
            <Grid container spacing={2} sx={{ alignItems: "center" }}>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <TextField
                  fullWidth
                  label="City"
                  value={filters.City || ""}
                  onChange={(e) => handleChange("City", e.target.value)}
                  size="small"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Type</InputLabel>
                  <Select
                    value={filters.PropertyType || ""}
                    onChange={(e) =>
                      handleChange("PropertyType", e.target.value || undefined)
                    }
                    label="Type"
                  >
                    <MenuItem value="">All</MenuItem>
                    <MenuItem value="HOUSE">House</MenuItem>
                    <MenuItem value="FLAT">Flat</MenuItem>
                    <MenuItem value="COMMERCIAL">Commercial</MenuItem>
                    <MenuItem value="SHOP">Shop</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={filters.Status || ""}
                    onChange={(e) =>
                      handleChange("Status", e.target.value || undefined)
                    }
                    label="Status"
                  >
                    <MenuItem value="">All</MenuItem>
                    <MenuItem value="APPROVED">Approved</MenuItem>
                    <MenuItem value="PENDING">Pending</MenuItem>
                    <MenuItem value="SOLD">Sold</MenuItem>
                    <MenuItem value="RENTED">Rented</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <TextField
                  fullWidth
                  label="Search term"
                  value={filters.SearchTerm || ""}
                  onChange={(e) => handleChange("SearchTerm", e.target.value)}
                  size="small"
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant="body2" gutterBottom>
                  Price Range (PKR)
                </Typography>
                <Slider
                  value={[filters.MinPrice || 0, filters.MaxPrice || 500000000]}
                  onChange={(_, newVal) => {
                    const [min, max] = newVal as number[];
                    handleChange("MinPrice", min === 0 ? undefined : min);
                    handleChange(
                      "MaxPrice",
                      max === 500000000 ? undefined : max,
                    );
                  }}
                  min={0}
                  max={500000000}
                  step={1000000}
                  valueLabelDisplay="auto"
                  valueLabelFormat={(v) => `${(v / 1000000).toFixed(1)}M`}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 3 }}>
                <Typography variant="body2" gutterBottom>
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
              <Grid size={{ xs: 12, md: 3 }}>
                <Typography variant="body2" gutterBottom>
                  Area Size (sq ft)
                </Typography>
                <Slider
                  value={[
                    filters.MinAreaSize || 0,
                    filters.MaxAreaSize || 10000,
                  ]}
                  onChange={(_, newVal) => {
                    const [min, max] = newVal as number[];
                    handleChange("MinAreaSize", min === 0 ? undefined : min);
                    handleChange(
                      "MaxAreaSize",
                      max === 10000 ? undefined : max,
                    );
                  }}
                  min={0}
                  max={10000}
                  step={100}
                  valueLabelDisplay="auto"
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Sort By</InputLabel>
                  <Select
                    value={filters.SortBy || "CreatedAt"}
                    onChange={(e) => handleChange("SortBy", e.target.value)}
                    label="Sort By"
                  >
                    <MenuItem value="CreatedAt">Newest</MenuItem>
                    <MenuItem value="Price">Price</MenuItem>
                    <MenuItem value="AreaSize">Area</MenuItem>
                    <MenuItem value="Bedrooms">Bedrooms</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() =>
                    handleChange("IsDescending", !filters.IsDescending)
                  }
                >
                  {filters.IsDescending ? "Descending" : "Ascending"}
                </Button>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Button variant="contained" onClick={handleSearch}>
                  Search
                </Button>
              </Grid>
            </Grid>
          </Container>
        </Box>

        {/* Property Listings */}
        <Container maxWidth="lg" sx={{ mt: 4 }}>
          {loading && (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress />
            </Box>
          )}
          {error && <Alert severity="error">{error}</Alert>}
          {data && data.items.length === 0 && !loading && (
            <Typography
              color="text.secondary"
              sx={{ py: 4, alignItems: "center" }}
            >
              No properties found.
            </Typography>
          )}
          <Grid container spacing={3}>
            {data?.items.map((property) => (
              <Grid sx={{ xs: 12, sm: 6, md: 4 }} key={property.id}>
                <PropertyCard property={property} />
              </Grid>
            ))}
          </Grid>
          {data && data.totalCount > 0 && (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
              <Pagination
                count={Math.ceil(data.totalCount / data.pageSize)}
                page={data.page}
                onChange={(_, page) => handleChange("Page", page)}
                color="primary"
              />
            </Box>
          )}
        </Container>
      </Box>
    </Box>
  );
}
