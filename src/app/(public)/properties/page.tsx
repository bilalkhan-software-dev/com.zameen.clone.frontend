"use client";

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
  { value: "MARLA", label: "Marla" },
  { value: "KANAL", label: "Kanal" },
  { value: "SQUARE_FEET", label: "Sq. Ft." },
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
    if (value >= 10000000) return `${(value / 10000000).toFixed(1)}Cr`;
    if (value >= 100000) return `${(value / 100000).toFixed(1)}L`;
    return value.toLocaleString();
  };

  const areaUnit = filters.AreaUnit || "SQUARE_FEET";
  const areaMax =
    areaUnit === "KANAL" ? 50 : areaUnit === "MARLA" ? 500 : 10000;
  const areaStep = areaUnit === "KANAL" ? 1 : areaUnit === "MARLA" ? 5 : 100;

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
        <Typography
          variant="h4"
          sx={{ fontWeight: 800, mb: 1, color: "text.primary" }}
        >
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
                  <MenuItem value="HOUSE">House</MenuItem>
                  <MenuItem value="FLAT">Flat</MenuItem>
                  <MenuItem value="COMMERCIAL">Commercial</MenuItem>
                  <MenuItem value="SHOP">Shop</MenuItem>
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
                  value={filters.AreaUnit || ""}
                  label="Area Unit"
                  onChange={(e) =>
                    handleChange("AreaUnit", e.target.value || undefined)
                  }
                >
                  <MenuItem value="">All</MenuItem>
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
                  boxShadow: 2,
                  height: 40,
                }}
              >
                Search
              </Button>
            </Grid>
          </Grid>

          {/* Advanced filters row */}
          <Grid container spacing={2} sx={{ mt: 2 }}>
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
            {/* Dynamic Area Size Slider */}
            <Grid size={{ xs: 12, md: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                {filters.AreaUnit === "KANAL"
                  ? "Area (Kanal)"
                  : filters.AreaUnit === "MARLA"
                    ? "Area (Marla)"
                    : "Area (Sq. Ft.)"}
              </Typography>
              <Slider
                value={[
                  filters.MinAreaSize ?? 0,
                  filters.MaxAreaSize ?? areaMax,
                ]}
                onChange={(_, newVal) => {
                  const [min, max] = newVal as number[];
                  handleChange("MinAreaSize", min === 0 ? undefined : min);
                  handleChange(
                    "MaxAreaSize",
                    max === areaMax ? undefined : max,
                  );
                }}
                min={0}
                max={areaMax}
                step={areaStep}
                valueLabelDisplay="auto"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
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
              size={{ xs: 12, sm: 4 }}
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Button
                fullWidth
                variant="text"
                onClick={() =>
                  handleChange("IsDescending", !filters.IsDescending)
                }
                sx={{ fontWeight: 500, textTransform: "none" }}
              >
                {filters.IsDescending ? "↓ Descending" : "↑ Ascending"}
              </Button>
            </Grid>
            <Grid
              size={{ xs: 12, sm: 4 }}
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Button
                fullWidth
                variant="outlined"
                size="small"
                onClick={handleSearch}
                sx={{ borderRadius: 2 }}
              >
                Apply Filters
              </Button>
            </Grid>
          </Grid>
        </Paper>

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
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        ) : data && data.items.length === 0 ? (
          <Typography
            sx={{ textAlign: "center", color: "text.secondary", py: 8 }}
          >
            No properties found. Try adjusting your filters.
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
