"use client";

import { useState, useMemo } from "react";
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
  Alert,
  Slider,
  Paper,
  InputAdornment,
  Skeleton,
  Chip,
  Stack,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { useProperties } from "@/hooks/useProperties";
import { PropertyFilterParams } from "@/lib/types";
import PropertyCard from "@/components/PropertyCard";

const PropertyCardSkeleton = () => (
  <Paper sx={{ borderRadius: 3, overflow: "hidden" }}>
    <Skeleton variant="rectangular" height={200} />
    <Box sx={{ p: 2 }}>
      <Skeleton variant="text" width="80%" />
      <Skeleton variant="text" width="50%" />
      <Skeleton variant="text" width="60%" />
      <Skeleton variant="rectangular" height={36} sx={{ mt: 2 }} />
    </Box>
  </Paper>
);

const CITIES = [
  "Islamabad",
  "Karachi",
  "Lahore",
  "Rawalpindi",
  "Faisalabad",
  "Gujranwala",
  "Peshawar",
  "Multan",
  "Sialkot",
  "Quetta",
];

const AREA_UNITS = [
  { value: "SQUARE_FEET", label: "Sq. Ft." },
  { value: "MARLA", label: "Marla" },
  { value: "KANAL", label: "Kanal" },
];

const PROPERTY_TYPES = ["HOUSE", "FLAT", "COMMERCIAL", "SHOP"];
const BED_OPTIONS = ["All", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10+"];
const BATH_OPTIONS = [
  "All",
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10+",
];

export default function PropertiesPage() {
  const { data, loading, error, filters, setFilters, refetch } = useProperties({
    Page: 1,
    PageSize: 9,
    SortBy: "CreatedAt",
    IsDescending: true,
  });

  const handleChange = (key: keyof PropertyFilterParams, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value, Page: 1 }));
  };

  const handleSearch = () => refetch();

  const formatPrice = (value: number) => {
    if (value >= 10_000_000) return `${(value / 10_000_000).toFixed(1)}Cr`;
    if (value >= 100_000) return `${(value / 100_000).toFixed(1)}L`;
    return value.toLocaleString();
  };

  // Area dynamic conversion
  const areaUnit = filters.AreaUnit || "SQUARE_FEET";
  const areaFactor =
    areaUnit === "KANAL" ? 5445 : areaUnit === "MARLA" ? 272.25 : 1;
  const areaSuffix =
    areaUnit === "KANAL" ? "Kanal" : areaUnit === "MARLA" ? "Marla" : "Sq. Ft.";

  // Local state for area min/max (stored as selected unit values, not sqft)
  // We'll use the filters' MinAreaSize/MaxAreaSize but convert to selected unit for display
  const displayAreaMin = filters.MinAreaSize
    ? filters.MinAreaSize / areaFactor
    : 0;
  const displayAreaMax = filters.MaxAreaSize
    ? filters.MaxAreaSize / areaFactor
    : 500; // sensible max

  const handleAreaMinChange = (val: string) => {
    const num = parseFloat(val);
    const sqft = isNaN(num) ? undefined : num * areaFactor;
    handleChange("MinAreaSize", sqft);
  };
  const handleAreaMaxChange = (val: string) => {
    const num = parseFloat(val);
    const sqft = isNaN(num) ? undefined : num * areaFactor;
    handleChange("MaxAreaSize", sqft);
  };

  // Bedroom/bathroom helpers
  const getBedValue = () => {
    if (filters.MinBedrooms === undefined && filters.MaxBedrooms === undefined)
      return "All";
    if (filters.MinBedrooms === 10 && filters.MaxBedrooms === undefined)
      return "10+";
    if (filters.MinBedrooms === filters.MaxBedrooms)
      return filters.MinBedrooms?.toString() || "All";
    return "All";
  };
  const setBedValue = (val: string) => {
    if (val === "All") {
      handleChange("MinBedrooms", undefined);
      handleChange("MaxBedrooms", undefined);
    } else if (val === "10+") {
      handleChange("MinBedrooms", 10);
      handleChange("MaxBedrooms", undefined);
    } else {
      const num = parseInt(val, 10);
      handleChange("MinBedrooms", num);
      handleChange("MaxBedrooms", num);
    }
  };

  const getBathValue = () => {
    if (
      filters.MinBathrooms === undefined &&
      filters.MaxBathrooms === undefined
    )
      return "All";
    if (filters.MinBathrooms === filters.MaxBathrooms)
      return filters.MinBathrooms?.toString() || "All";
    return "All";
  };
  const setBathValue = (val: string) => {
    if (val === "All") {
      handleChange("MinBathrooms", undefined);
      handleChange("MaxBathrooms", undefined);
    } else {
      const num = parseInt(val, 10);
      handleChange("MinBathrooms", num);
      handleChange("MaxBathrooms", num);
    }
  };

  // Property type counts from current data
  const propertyTypeCounts = useMemo(() => {
    if (!data?.items) return {};
    const counts: Record<string, number> = {};
    data.items.forEach((property) => {
      const type = property.propertyType;
      counts[type] = (counts[type] || 0) + 1;
    });
    return counts;
  }, [data]);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        backgroundColor: "#fafbfc",
      }}
    >
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
          Properties for Sale & Rent
        </Typography>
        <Typography variant="body2" sx={{ color: "text.secondary", mb: 4 }}>
          Explore the latest listings across Pakistan
        </Typography>

        {/* Filter Panel */}
        <Paper
          elevation={0}
          sx={{
            p: 3,
            borderRadius: 4,
            mb: 4,
            background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          <Grid container spacing={2} sx={{ alignItems: "center" }}>
            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
              <FormControl fullWidth size="small">
                <InputLabel>City</InputLabel>
                <Select
                  value={filters.City || ""}
                  label="City"
                  onChange={(e) =>
                    handleChange("City", e.target.value || undefined)
                  }
                >
                  <MenuItem value="">All Cities</MenuItem>
                  {CITIES.map((city) => (
                    <MenuItem key={city} value={city}>
                      {city}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
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
                  {PROPERTY_TYPES.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type === "HOUSE"
                        ? "House"
                        : type === "FLAT"
                          ? "Flat"
                          : type === "COMMERCIAL"
                            ? "Commercial"
                            : "Shop"}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
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
            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Area Unit</InputLabel>
                <Select
                  value={areaUnit}
                  label="Area Unit"
                  onChange={(e) => handleChange("AreaUnit", e.target.value)}
                >
                  {AREA_UNITS.map((unit) => (
                    <MenuItem key={unit.value} value={unit.value}>
                      {unit.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
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
            <Grid size={{ xs: 12, md: 2 }}>
              <Button
                fullWidth
                variant="contained"
                size="medium"
                onClick={handleSearch}
                sx={{
                  borderRadius: 2,
                  textTransform: "none",
                  fontWeight: 600,
                  height: 40,
                }}
              >
                Search
              </Button>
            </Grid>
          </Grid>

          {/* Advanced filters row */}
          <Grid container spacing={2} sx={{ mt: 2 }}>
            {/* Price slider – only slider */}
            <Grid size={{ xs: 12, md: 4 }}>
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

            {/* Bedrooms dropdown */}
            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Bedrooms</InputLabel>
                <Select
                  value={getBedValue()}
                  label="Bedrooms"
                  onChange={(e) => setBedValue(e.target.value)}
                >
                  {BED_OPTIONS.map((opt) => (
                    <MenuItem key={opt} value={opt}>
                      {opt}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Bathrooms dropdown */}
            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Bathrooms</InputLabel>
                <Select
                  value={getBathValue()}
                  label="Bathrooms"
                  onChange={(e) => setBathValue(e.target.value)}
                >
                  {BATH_OPTIONS.map((opt) => (
                    <MenuItem key={opt} value={opt}>
                      {opt}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Area inputs (min/max) */}
            <Grid size={{ xs: 12, md: 4 }}>
              <Typography variant="subtitle2" gutterBottom>
                Area ({areaSuffix})
              </Typography>
              <Box sx={{ display: "flex", gap: 2 }}>
                <TextField
                  size="small"
                  label="Min"
                  type="number"
                  value={displayAreaMin === 0 ? "" : displayAreaMin}
                  onChange={(e) => handleAreaMinChange(e.target.value)}
                  fullWidth
                />
                <TextField
                  size="small"
                  label="Max"
                  type="number"
                  value={displayAreaMax === 500 ? "" : displayAreaMax}
                  onChange={(e) => handleAreaMaxChange(e.target.value)}
                  fullWidth
                />
              </Box>
            </Grid>

            {/* Sort and Order */}
            <Grid size={{ xs: 12, sm: 6, md: 1 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Sort</InputLabel>
                <Select
                  value={filters.SortBy || "CreatedAt"}
                  label="Sort"
                  onChange={(e) => handleChange("SortBy", e.target.value)}
                >
                  <MenuItem value="CreatedAt">Newest</MenuItem>
                  <MenuItem value="Price">Price</MenuItem>
                  <MenuItem value="AreaSize">Area</MenuItem>
                  <MenuItem value="Bedrooms">Beds</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 1 }}>
              <Button
                fullWidth
                variant="text"
                onClick={() =>
                  handleChange("IsDescending", !filters.IsDescending)
                }
              >
                {filters.IsDescending ? "↓ Desc" : "↑ Asc"}
              </Button>
            </Grid>
            <Grid size={{ xs: 12, md: 1 }}>
              <Button
                fullWidth
                variant="outlined"
                size="small"
                onClick={handleSearch}
                sx={{ borderRadius: 2 }}
              >
                Apply
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {/* Results summary & type chips */}
        {!loading && !error && data && (
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 2,
              mb: 3,
            }}
          >
            <Typography variant="subtitle1" fontWeight={500}>
              {data.totalCount} properties found
            </Typography>
            <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
              <Chip
                label="All"
                size="small"
                variant={!filters.PropertyType ? "filled" : "outlined"}
                color={!filters.PropertyType ? "primary" : "default"}
                onClick={() => handleChange("PropertyType", undefined)}
                clickable
              />
              {PROPERTY_TYPES.map((type) => {
                const count = propertyTypeCounts[type] || 0;
                const label =
                  type === "HOUSE"
                    ? "House"
                    : type === "FLAT"
                      ? "Flat"
                      : type === "COMMERCIAL"
                        ? "Commercial"
                        : "Shop";
                return (
                  <Chip
                    key={type}
                    label={`${label} (${count})`}
                    size="small"
                    variant={
                      filters.PropertyType === type ? "filled" : "outlined"
                    }
                    color={
                      filters.PropertyType === type ? "primary" : "default"
                    }
                    onClick={() => handleChange("PropertyType", type)}
                    clickable
                  />
                );
              })}
            </Stack>
          </Box>
        )}

        {/* Property Grid */}
        {loading ? (
          <Grid container spacing={4}>
            {Array.from(new Array(9)).map((_, idx) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={idx}>
                <PropertyCardSkeleton />
              </Grid>
            ))}
          </Grid>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : data?.items.length === 0 ? (
          <Typography
            sx={{ textAlign: "center", color: "text.secondary", py: 8 }}
          >
            No properties found. Adjust your filters.
          </Typography>
        ) : (
          <>
            <Grid container spacing={4}>
              {data?.items.map((property) => (
                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={property.id}>
                  <PropertyCard property={property} />
                </Grid>
              ))}
            </Grid>
            {data && data.totalCount > 0 && (
              <Box
                sx={{ display: "flex", justifyContent: "center", mt: 6, mb: 4 }}
              >
                <Pagination
                  count={Math.ceil(data.totalCount / data.pageSize)}
                  page={data.page}
                  onChange={(_, page) => handleChange("Page", page)}
                  color="primary"
                  size="large"
                />
              </Box>
            )}
          </>
        )}
      </Container>
    </Box>
  );
}
