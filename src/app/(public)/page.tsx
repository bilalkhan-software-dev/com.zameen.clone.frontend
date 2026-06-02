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
import StarIcon from "@mui/icons-material/Star";
import { useProperties } from "@/hooks/useProperties";
import { PropertyFilterParams } from "@/lib/types";
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
    setFilters((prev) => ({ ...prev, Page: 1 }));
  };

  // Format price slider values
  const formatPrice = (value: number) => {
    if (value >= 10000000) return `${(value / 10000000).toFixed(1)}Cr`;
    if (value >= 100000) return `${(value / 100000).toFixed(1)}L`;
    return value.toLocaleString();
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      {/* Hero Section */}
      <Box
        sx={{
          background: "linear-gradient(135deg, #1a3b5d 0%, #0f2640 100%)",
          color: "white",
          py: { xs: 8, md: 12 },
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Decorative overlay pattern (optional) */}
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: "url('/real-estate.jpg')",
            backgroundSize: "cover",
            opacity: 0.1,
          }}
        />
        <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
          <Typography
            variant="h2"
            sx={{
              mb: 2,
              display: "flex",
              justifyContent: "center",
              allignItems: "center",
              fontWeight: 800,
              fontSize: { xs: "2.5rem", md: "3.5rem" },
            }}
          >
            Find Your Dream Property
          </Typography>
          <Typography
            variant="h6"
            align="center"
            sx={{ mb: 6, opacity: 0.9, maxWidth: 600, mx: "auto" }}
          >
            Search thousands of properties for sale and rent across Pakistan
          </Typography>

          {/* Main search bar */}
          <Paper
            elevation={6}
            sx={{
              p: 2,
              borderRadius: 4,
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              alignItems: "center",
              gap: 2,
              maxWidth: 900,
              mx: "auto",
            }}
          >
            <TextField
              fullWidth
              placeholder="Search by city, location or keyword..."
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
              sx={{ flex: 2 }}
            />
            <FormControl size="small" sx={{ flex: 1, minWidth: 150 }}>
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
            <FormControl size="small" sx={{ flex: 1, minWidth: 150 }}>
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
            <Button
              variant="contained"
              size="large"
              onClick={handleSearch}
              sx={{
                px: 4,
                py: 1.5,
                backgroundColor: "#f59e0b",
                "&:hover": { backgroundColor: "#d97706" },
                borderRadius: 2,
              }}
            >
              Search
            </Button>
          </Paper>
        </Container>
      </Box>

      {/* Advanced Filters (collapsible or always visible) */}
      <Container maxWidth="lg" sx={{ mt: -4, position: "relative", zIndex: 2 }}>
        <Paper
          elevation={2}
          sx={{
            p: 3,
            borderRadius: 3,
            backgroundColor: "white",
          }}
        >
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
            <TuneIcon sx={{ mr: 1, verticalAlign: "middle" }} />
            Advanced Filters
          </Typography>
          <Grid container spacing={3}>
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

            {/* Sort Order */}
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
                size="medium"
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
              <Button
                fullWidth
                variant="contained"
                size="medium"
                onClick={handleSearch}
              >
                Apply Filters
              </Button>
            </Grid>
          </Grid>
        </Paper>
      </Container>

      {/* Property Listings */}
      <Container maxWidth="lg" sx={{ mt: 6, mb: 6 }}>
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
          <Typography
            color="text.secondary"
            sx={{ allignItems: "center", py: 8 }}
          >
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
          <Box sx={{ display: "flex", justifyContent: "center", mt: 6 }}>
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
            {/* Testimonials Section */}
      <Box sx={{ backgroundColor: "#f8fafc", py: 8 }}>
        <Container maxWidth="lg">
          <Typography variant="h4" align="center" fontWeight={700} gutterBottom>
            What Our Clients Say
          </Typography>
          <Typography
            variant="subtitle1"
            align="center"
            color="text.secondary"
            sx={{ mb: 6 }}
          >
            Trusted by thousands of homeowners and agents across Pakistan
          </Typography>

          <Grid container spacing={4}>
            {[
              {
                name: "Ayesha Khan",
                role: "Homeowner",
                quote:
                  "PropertyHub made finding our dream home so easy. The filters are spot‑on, and the agents were incredibly helpful throughout the process.",
                avatar: "https://i.pravatar.cc/150?img=47",
                stars: 5,
              },
              {
                name: "Ali Raza",
                role: "Investor",
                quote:
                  "I've invested in multiple properties through this platform. The detailed listings and honest agent profiles give me confidence in every deal.",
                avatar: "https://i.pravatar.cc/150?img=12",
                stars: 4,
              },
              {
                name: "Sara Ahmed",
                role: "Tenant",
                quote:
                  "Renting my apartment was a breeze. I submitted an enquiry and got a call within an hour. Highly recommended!",
                avatar: "https://i.pravatar.cc/150?img=23",
                stars: 5,
              },
            ].map((testimonial, index) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={index}>
                <Paper
                  elevation={3}
                  sx={{
                    p: 4,
                    borderRadius: 3,
                    textAlign: "center",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 2,
                  }}
                >
                  <Box
                    component="img"
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    sx={{
                      width: 80,
                      height: 80,
                      borderRadius: "50%",
                      objectFit: "cover",
                      border: "3px solid #f59e0b",
                    }}
                  />
                  <Typography variant="h6" fontWeight={600}>
                    {testimonial.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {testimonial.role}
                  </Typography>
                  <Box sx={{ display: "flex", gap: 0.5 }}>
                    {Array.from({ length: 5 }, (_, i) => (
                      <StarIcon
                        key={i}
                        sx={{
                          color: i < testimonial.stars ? "#f59e0b" : "#ddd",
                        }}
                      />
                    ))}
                  </Box>
                  <Typography
                    variant="body1"
                    color="text.primary"
                    sx={{ fontStyle: "italic", mt: 1 }}
                  >
                    &ldquo;{testimonial.quote}&rdquo;
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
    </Box>
  );
}
