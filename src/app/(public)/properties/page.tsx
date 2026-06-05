"use client";

import { useState, useEffect, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
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
  Paper,
  Skeleton,
  Autocomplete,
  Chip,
  Collapse,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Slider,
  RadioGroup,
  Radio,
  FormControlLabel,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import TuneIcon from "@mui/icons-material/Tune";
import { useProperties } from "@/hooks/useProperties";
import { PropertyFilterParams } from "@/lib/types";
import PropertyCard from "@/components/PropertyCard";
import api from "@/lib/axios";

// ----------------------------------------------------------------------
// Constants & Helpers
// ----------------------------------------------------------------------
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
const bedOptions = ["All", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10+"];
const bathOptions = ["All", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10+"];
const MAX_PRICE = 500_000_000;
const areaUnits = [
  { value: "SQUARE_FEET", label: "Sq. Ft.", factor: 1 },
  { value: "SQUARE_YARDS", label: "Sq. Yd.", factor: 9 },
  { value: "SQUARE_METERS", label: "Sq. M.", factor: 10.764 },
  { value: "MARLA", label: "Marla", factor: 272.25 },
  { value: "KANAL", label: "Kanal", factor: 5445 },
];
const areaPresetsSqFt = [0, 500, 1000, 2000, 5000, 10000];

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debounced;
}

const PropertyCardSkeleton = () => (
  <Paper sx={{ borderRadius: 2, overflow: "hidden" }}>
    <Skeleton variant="rectangular" height={200} />
    <Box sx={{ p: 2 }}>
      <Skeleton variant="text" width="80%" />
      <Skeleton variant="text" width="50%" />
      <Skeleton variant="text" width="60%" />
      <Skeleton variant="rectangular" height={36} sx={{ mt: 1 }} />
    </Box>
  </Paper>
);

// Helper to highlight text
const highlightText = (text: string, query: string) => {
  if (!query) return text;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return text;
  const before = text.slice(0, idx);
  const match = text.slice(idx, idx + query.length);
  const after = text.slice(idx + query.length);
  return (
    <span>
      {before}
      <strong style={{ backgroundColor: "#ffeb3b", fontWeight: "bold" }}>
        {match}
      </strong>
      {after}
    </span>
  );
};

// Convert URLSearchParams to initial filter state
function getInitialFiltersFromUrl(searchParams: URLSearchParams) {
  return {
    city: searchParams.get("city") || "Gujranwala",
    location: searchParams.get("location") || null,
    propertyType:
      (searchParams.get("type") as "HOUSE" | "FLAT" | "COMMERCIAL" | "SHOP") ||
      "HOUSE",
    propertyPurpose: (searchParams.get("purpose") === "BUY"
      ? "BUY"
      : searchParams.get("purpose") === "RENT"
        ? "RENT"
        : "BUY") as "BUY" | "RENT",
    priceMin: parseInt(searchParams.get("minPrice") || "0"),
    priceMax: parseInt(searchParams.get("maxPrice") || MAX_PRICE.toString()),
    areaMin: parseInt(searchParams.get("minArea") || "0"),
    areaMax: parseInt(searchParams.get("maxArea") || "10000"),
    areaUnit: searchParams.get("areaUnit") || "SQUARE_FEET",
    beds: searchParams.get("beds") || "All",
    baths: searchParams.get("baths") || "All",
    keyword: searchParams.get("q") || "",
    sortBy: "CreatedAt",
    isDescending: true,
  };
}

export default function PropertiesPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // UI state
  const [currencyUI, setCurrencyUI] = useState<"PKR" | "USD">("PKR");
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const [currencyModalOpen, setCurrencyModalOpen] = useState(false);
  const [areaUnitModalOpen, setAreaUnitModalOpen] = useState(false);
  const [selectedAreaUnit, setSelectedAreaUnit] = useState(areaUnits[0]);

  // Filter state (initialised from URL)
  const [localCity, setLocalCity] = useState<string>("Gujranwala");
  const [localLocation, setLocalLocation] = useState<string | null>(null);
  const [localPropertyType, setLocalPropertyType] = useState<string>("HOUSE");
  const [localPropertyPurpose, setLocalPropertyPurpose] = useState<
    "BUY" | "RENT"
  >("BUY");
  const [localPriceMin, setLocalPriceMin] = useState<number>(0);
  const [localPriceMax, setLocalPriceMax] = useState<number>(MAX_PRICE);
  const [localAreaMin, setLocalAreaMin] = useState<number>(0);
  const [localAreaMax, setLocalAreaMax] = useState<number>(10000);
  const [localAreaUnit, setLocalAreaUnit] = useState<string>("SQUARE_FEET");
  const [localBeds, setLocalBeds] = useState<string>("All");
  const [localBaths, setLocalBaths] = useState<string>("All");
  const [localSearchTerm, setLocalSearchTerm] = useState<string>("");
  const [localSortBy, setLocalSortBy] = useState<string>("CreatedAt");
  const [localIsDescending, setLocalIsDescending] = useState<boolean>(true);

  // Client-side type filter (chips)
  const [clientTypeFilter, setClientTypeFilter] = useState<string | null>(
    "HOUSE",
  );

  // Location suggestions
  const [locationInput, setLocationInput] = useState("");
  const [locationOptions, setLocationOptions] = useState<string[]>([]);
  const debouncedLocation = useDebounce(locationInput, 300);

  // Fetch location suggestions
  useEffect(() => {
    if (!localCity || !debouncedLocation) {
      setLocationOptions([]);
      return;
    }
    const fetchLocations = async () => {
      try {
        const res = await api.get("/api/Property/locations", {
          params: {
            city: localCity,
            searchTerm: debouncedLocation,
            page: 1,
            size: 10,
          },
        });
        setLocationOptions(res.data?.data?.items || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchLocations();
  }, [localCity, debouncedLocation]);

  // Read URL params once on mount
  useEffect(() => {
    const initial = getInitialFiltersFromUrl(searchParams);
    setLocalCity(initial.city);
    setLocalLocation(initial.location);
    setLocalPropertyType(initial.propertyType);
    setLocalPropertyPurpose(initial.propertyPurpose);
    setLocalPriceMin(initial.priceMin);
    setLocalPriceMax(initial.priceMax);
    setLocalAreaMin(initial.areaMin);
    setLocalAreaMax(initial.areaMax);
    setLocalAreaUnit(initial.areaUnit);
    setLocalBeds(initial.beds);
    setLocalBaths(initial.baths);
    setLocalSearchTerm(initial.keyword);
    const unit = areaUnits.find((u) => u.value === initial.areaUnit);
    if (unit) setSelectedAreaUnit(unit);
  }, [searchParams]);

  // Build API filters from local state
  const buildApiFilters = useMemo(() => {
    const unit =
      areaUnits.find((u) => u.value === localAreaUnit) || areaUnits[0];
    const minAreaSqFt = localAreaMin * unit.factor;
    const maxAreaSqFt = localAreaMax * unit.factor;
    return {
      Page: 1,
      PageSize: 9,
      City: localCity === "Gujranwala" ? undefined : localCity,
      Location: localLocation || undefined,
      PropertyType:
        localPropertyType === "HOUSE" ? undefined : localPropertyType,
      PropertyPurpose: localPropertyPurpose,
      MinPrice: localPriceMin === 0 ? undefined : localPriceMin,
      MaxPrice: localPriceMax === MAX_PRICE ? undefined : localPriceMax,
      MinAreaSize: localAreaMin === 0 ? undefined : minAreaSqFt,
      MaxAreaSize: localAreaMax === 10000 ? undefined : maxAreaSqFt,
      SearchTerm: localSearchTerm || undefined,
      MinBedrooms:
        localBeds === "All"
          ? undefined
          : localBeds === "10+"
            ? 10
            : parseInt(localBeds, 10),
      MaxBedrooms:
        localBeds === "All"
          ? undefined
          : localBeds === "10+"
            ? undefined
            : parseInt(localBeds, 10),
      MinBathrooms: localBaths === "All" ? undefined : parseInt(localBaths, 10),
      MaxBathrooms: localBaths === "All" ? undefined : parseInt(localBaths, 10),
      SortBy: localSortBy,
      IsDescending: localIsDescending,
    };
  }, [
    localCity,
    localLocation,
    localPropertyType,
    localPropertyPurpose,
    localPriceMin,
    localPriceMax,
    localAreaMin,
    localAreaMax,
    localAreaUnit,
    localBeds,
    localBaths,
    localSearchTerm,
    localSortBy,
    localIsDescending,
  ]);

  const { data, loading, error, setFilters, refetch } = useProperties({
    Page: 1,
    PageSize: 9,
    SortBy: "CreatedAt",
    IsDescending: true,
  });

  // Apply URL filters on mount
  useEffect(() => {
    setFilters(buildApiFilters);
    refetch();
  }, []); // runs once

  const formatPrice = (price: number) => {
    const converted = currencyUI === "USD" ? price * 0.0036 : price;
    const symbol = currencyUI === "USD" ? "$" : "PKR";
    if (converted >= 10_000_000)
      return `${symbol} ${(converted / 10_000_000).toFixed(1)}Cr`;
    if (converted >= 100_000)
      return `${symbol} ${(converted / 100_000).toFixed(1)}L`;
    return `${symbol} ${converted.toLocaleString()}`;
  };

  const displayItems = useMemo(() => {
    if (!data?.items) return [];
    if (!clientTypeFilter) return data.items;
    return data.items.filter((p) => p.propertyType === clientTypeFilter);
  }, [data, clientTypeFilter]);

  const logSearch = async () => {
    const locationToLog = localLocation || localCity;
    if (!locationToLog) return;
    try {
      await api.post("/api/SearchLog", {
        location: locationToLog,
        city: localCity || undefined,
        propertyType: localPropertyType,
        propertyPurpose: localPropertyPurpose,
      });
    } catch (err) {
      console.debug("Failed to log search", err);
    }
  };

  const handleApplyFilters = () => {
    // Log search before applying
    logSearch();

    // Update hook filters
    setFilters(buildApiFilters);
    refetch();

    // Update URL for shareability
    const params = new URLSearchParams();
    if (localCity && localCity !== "Gujranwala") params.set("city", localCity);
    if (localLocation) params.set("location", localLocation);
    if (localPropertyType && localPropertyType !== "HOUSE")
      params.set("type", localPropertyType);
    if (localPropertyPurpose) params.set("purpose", localPropertyPurpose);
    if (localPriceMin > 0) params.set("minPrice", localPriceMin.toString());
    if (localPriceMax < MAX_PRICE)
      params.set("maxPrice", localPriceMax.toString());
    if (localAreaMin > 0) params.set("minArea", localAreaMin.toString());
    if (localAreaMax < 10000) params.set("maxArea", localAreaMax.toString());
    if (localAreaUnit !== "SQUARE_FEET") params.set("areaUnit", localAreaUnit);
    if (localBeds !== "All") params.set("beds", localBeds);
    if (localBaths !== "All") params.set("baths", localBaths);
    if (localSearchTerm) params.set("q", localSearchTerm);
    router.push(`/properties?${params.toString()}`);
  };

  const handleReset = () => {
    router.push("/properties");
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      {/* Hero Section */}
      <Box
        sx={{
          position: "relative",
          pt: 28,
          pb: { xs: 5, md: 6 },
          backgroundImage: "url('/real-estate-bg.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.55)",
          },
        }}
      >
        <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
          <Typography
            variant="h3"
            sx={{
              fontWeight: 700,
              fontSize: { xs: "2rem", md: "2.8rem" },
              textAlign: "center",
              color: "white",
              mb: 1,
            }}
          >
            Search properties for sale in Pakistan
          </Typography>

          <Paper elevation={3} sx={{ p: 2, borderRadius: 3, mt: 4 }}>
            {/* Buy/Rent Toggle */}
            <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
              <Stack direction="row" spacing={2}>
                <Button
                  variant={
                    localPropertyPurpose === "BUY" ? "contained" : "outlined"
                  }
                  onClick={() => setLocalPropertyPurpose("BUY")}
                  sx={{ textTransform: "none", px: 4 }}
                >
                  Buy
                </Button>
                <Button
                  variant={
                    localPropertyPurpose === "RENT" ? "contained" : "outlined"
                  }
                  onClick={() => setLocalPropertyPurpose("RENT")}
                  sx={{ textTransform: "none", px: 4 }}
                >
                  Rent
                </Button>
              </Stack>
            </Box>

            <Grid container spacing={2}>
              {/* City Autocomplete */}
              <Grid size={{ xs: 12, sm: 6, md: 2.5 }}>
                <Autocomplete
                  freeSolo
                  options={CITIES}
                  value={localCity}
                  onInputChange={(_, v) => setLocalCity(v || "Gujranwala")}
                  renderInput={(p) => (
                    <TextField {...p} label="City" size="small" />
                  )}
                />
              </Grid>

              {/* Location Autocomplete – SINGLE selection with highlighting */}
              <Grid size={{ xs: 12, sm: 6, md: 3.5 }}>
                <Autocomplete
                  freeSolo
                  options={locationOptions}
                  value={localLocation || ""}
                  onInputChange={(_, newInputValue) =>
                    setLocationInput(newInputValue)
                  }
                  onChange={(_, newValue) => setLocalLocation(newValue)}
                  renderOption={(props, option) => (
                    <li {...props} key={option}>
                      {highlightText(option, locationInput)}
                    </li>
                  )}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Location"
                      size="small"
                      placeholder="Location"
                    />
                  )}
                />
              </Grid>

              {/* Property Type */}
              <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Property Type</InputLabel>
                  <Select
                    value={localPropertyType}
                    label="Property Type"
                    onChange={(e) => setLocalPropertyType(e.target.value)}
                  >
                    <MenuItem value="HOUSE">House</MenuItem>
                    <MenuItem value="FLAT">Flat</MenuItem>
                    <MenuItem value="PLOT">Plot</MenuItem>
                    <MenuItem value="COMMERCIAL">Commercial</MenuItem>
                    <MenuItem value="SHOP">Shop</MenuItem>
                    <MenuItem value="FACTORY">Factory</MenuItem>
                    <MenuItem value="STUDIO">Studio</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {/* Find Button */}
              <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                <Button
                  fullWidth
                  variant="contained"
                  onClick={handleApplyFilters}
                  sx={{
                    bgcolor: "#f59e0b",
                    "&:hover": { bgcolor: "#d97706" },
                    textTransform: "none",
                    fontWeight: 600,
                    py: 0.75,
                  }}
                  startIcon={<SearchIcon />}
                >
                  Find
                </Button>
              </Grid>

              {/* More/Less Options */}
              <Grid size={{ xs: 12, md: 2 }} sx={{ textAlign: "right" }}>
                <Button
                  size="small"
                  variant="text"
                  startIcon={<TuneIcon fontSize="small" />}
                  onClick={() => setShowMoreOptions(!showMoreOptions)}
                  sx={{ textTransform: "none", color: "#f59e0b" }}
                >
                  {showMoreOptions ? "Less Options" : "More Options"}
                </Button>
              </Grid>
            </Grid>

            <Collapse in={showMoreOptions}>
              <Box
                sx={{
                  mt: 2,
                  pt: 2,
                  borderTop: "1px solid",
                  borderColor: "divider",
                }}
              >
                <Grid container spacing={3}>
                  {/* Price Range */}
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Price Range ({currencyUI})
                    </Typography>
                    <Slider
                      value={[localPriceMin, localPriceMax]}
                      onChange={(_, v) => {
                        const [a, b] = v as number[];
                        setLocalPriceMin(a);
                        setLocalPriceMax(b);
                      }}
                      min={0}
                      max={MAX_PRICE}
                      step={1_000_000}
                      valueLabelDisplay="auto"
                      valueLabelFormat={(v) => `${(v / 1e7).toFixed(1)}Cr`}
                    />
                    <Box sx={{ display: "flex", gap: 2, mt: 1 }}>
                      <TextField
                        label="Min"
                        size="small"
                        type="number"
                        value={localPriceMin}
                        onChange={(e) =>
                          setLocalPriceMin(Number(e.target.value))
                        }
                        fullWidth
                      />
                      <TextField
                        label="Max"
                        size="small"
                        type="number"
                        value={localPriceMax}
                        onChange={(e) =>
                          setLocalPriceMax(Number(e.target.value))
                        }
                        fullWidth
                      />
                      <Button
                        size="small"
                        variant="text"
                        onClick={() => setCurrencyModalOpen(true)}
                      >
                        Change
                      </Button>
                    </Box>
                  </Grid>

                  {/* Area Range */}
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Area ({selectedAreaUnit.label})
                    </Typography>
                    <Box sx={{ display: "flex", gap: 2, mb: 1 }}>
                      <Autocomplete
                        freeSolo
                        options={areaPresetsSqFt.map(String)}
                        value={
                          localAreaMin === 0 ? "" : localAreaMin.toString()
                        }
                        onInputChange={(_, v) => {
                          let n = parseFloat(v);
                          if (isNaN(n)) n = 0;
                          if (n < 0) n = 0;
                          setLocalAreaMin(n);
                        }}
                        renderInput={(p) => (
                          <TextField
                            {...p}
                            label="Min"
                            size="small"
                            type="number"
                          />
                        )}
                        fullWidth
                      />
                      <Autocomplete
                        freeSolo
                        options={areaPresetsSqFt
                          .filter((v) => v > 0)
                          .map(String)}
                        value={
                          localAreaMax === 10000 ? "" : localAreaMax.toString()
                        }
                        onInputChange={(_, v) => {
                          let n = parseFloat(v);
                          if (isNaN(n)) n = 10000;
                          if (n < 0) n = 0;
                          setLocalAreaMax(n);
                        }}
                        renderInput={(p) => (
                          <TextField
                            {...p}
                            label="Max"
                            size="small"
                            type="number"
                          />
                        )}
                        fullWidth
                      />
                    </Box>
                  </Grid>

                  {/* Beds & Baths */}
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Beds</InputLabel>
                      <Select
                        value={localBeds}
                        label="Beds"
                        onChange={(e) => setLocalBeds(e.target.value)}
                      >
                        {bedOptions.map((o) => (
                          <MenuItem key={o} value={o}>
                            {o}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Bathrooms</InputLabel>
                      <Select
                        value={localBaths}
                        label="Bathrooms"
                        onChange={(e) => setLocalBaths(e.target.value)}
                      >
                        {bathOptions.map((o) => (
                          <MenuItem key={o} value={o}>
                            {o}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  {/* Keyword */}
                  <Grid size={{ xs: 12 }}>
                    <TextField
                      fullWidth
                      label="Keyword"
                      size="small"
                      value={localSearchTerm}
                      onChange={(e) => setLocalSearchTerm(e.target.value)}
                    />
                  </Grid>

                  {/* Sort By & Order */}
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Sort By</InputLabel>
                      <Select
                        value={localSortBy}
                        label="Sort By"
                        onChange={(e) => setLocalSortBy(e.target.value)}
                      >
                        <MenuItem value="CreatedAt">Newest</MenuItem>
                        <MenuItem value="Price">Price</MenuItem>
                        <MenuItem value="AreaSize">Area</MenuItem>
                        <MenuItem value="Bedrooms">Bedrooms</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Order</InputLabel>
                      <Select
                        value={localIsDescending ? "desc" : "asc"}
                        label="Order"
                        onChange={(e) =>
                          setLocalIsDescending(e.target.value === "desc")
                        }
                      >
                        <MenuItem value="desc">Descending</MenuItem>
                        <MenuItem value="asc">Ascending</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid size={{ xs: 12 }} sx={{ textAlign: "right" }}>
                    <Button size="small" variant="text" onClick={handleReset}>
                      Reset All Filters
                    </Button>
                  </Grid>
                </Grid>
              </Box>
            </Collapse>

            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-end",
                gap: 1,
                mt: 1,
              }}
            >
              <Button
                size="small"
                variant="text"
                onClick={() => setCurrencyModalOpen(true)}
              >
                Change Currency
              </Button>
              <Button
                size="small"
                variant="text"
                onClick={() => setAreaUnitModalOpen(true)}
              >
                Change Area Unit
              </Button>
              <Button size="small" variant="text" onClick={handleReset}>
                Reset Search
              </Button>
            </Box>
          </Paper>
        </Container>
      </Box>

      {/* Results Summary & Type Chips */}
      <Container maxWidth="lg" sx={{ mt: 3, mb: 1 }}>
        {data && !loading && (
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 1,
            }}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 500 }}>
              {displayItems.length} properties found
            </Typography>
            <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
              <Chip
                label="All"
                size="small"
                variant={clientTypeFilter === null ? "filled" : "outlined"}
                color={clientTypeFilter === null ? "primary" : "default"}
                onClick={() => setClientTypeFilter(null)}
                clickable
              />
              <Chip
                label="House"
                size="small"
                variant={clientTypeFilter === "HOUSE" ? "filled" : "outlined"}
                color={clientTypeFilter === "HOUSE" ? "primary" : "default"}
                onClick={() => setClientTypeFilter("HOUSE")}
                clickable
              />
              <Chip
                label="Flat"
                size="small"
                variant={clientTypeFilter === "FLAT" ? "filled" : "outlined"}
                color={clientTypeFilter === "FLAT" ? "primary" : "default"}
                onClick={() => setClientTypeFilter("FLAT")}
                clickable
              />
              <Chip
                label="Commercial"
                size="small"
                variant={
                  clientTypeFilter === "COMMERCIAL" ? "filled" : "outlined"
                }
                color={
                  clientTypeFilter === "COMMERCIAL" ? "primary" : "default"
                }
                onClick={() => setClientTypeFilter("COMMERCIAL")}
                clickable
              />
              <Chip
                label="Shop"
                size="small"
                variant={clientTypeFilter === "SHOP" ? "filled" : "outlined"}
                color={clientTypeFilter === "SHOP" ? "primary" : "default"}
                onClick={() => setClientTypeFilter("SHOP")}
                clickable
              />
            </Stack>
          </Box>
        )}
      </Container>

      {/* Property Grid */}
      <Container maxWidth="lg" sx={{ mb: 5 }}>
        {loading ? (
          <Grid container spacing={3}>
            {Array.from(new Array(6)).map((_, i) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={i}>
                <PropertyCardSkeleton />
              </Grid>
            ))}
          </Grid>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : displayItems.length === 0 ? (
          <Typography
            sx={{ textAlign: "center", py: 6, color: "text.secondary" }}
          >
            No properties found. Try adjusting your filters.
          </Typography>
        ) : (
          <>
            <Grid container spacing={3}>
              {displayItems.map((property) => (
                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={property.id}>
                  <PropertyCard property={property} formatPrice={formatPrice} />
                </Grid>
              ))}
            </Grid>
            {data && data.totalCount > 0 && (
              <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
                <Pagination
                  count={Math.ceil(data.totalCount / (data.pageSize || 9))}
                  page={data.page || 1}
                  onChange={(_, page) => {
                    setFilters((prev) => ({ ...prev, Page: page }));
                    refetch();
                  }}
                  color="primary"
                  size="medium"
                />
              </Box>
            )}
          </>
        )}
      </Container>

      {/* Modals */}
      <Dialog
        open={currencyModalOpen}
        onClose={() => setCurrencyModalOpen(false)}
      >
        <DialogTitle>Select Currency</DialogTitle>
        <DialogContent>
          <FormControl fullWidth size="small" sx={{ mt: 1 }}>
            <InputLabel>Currency</InputLabel>
            <Select
              value={currencyUI}
              label="Currency"
              onChange={(e) => {
                setCurrencyUI(e.target.value as "PKR" | "USD");
                setCurrencyModalOpen(false);
              }}
            >
              <MenuItem value="PKR">PKR (Rs.)</MenuItem>
              <MenuItem value="USD">USD ($)</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCurrencyModalOpen(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={areaUnitModalOpen}
        onClose={() => setAreaUnitModalOpen(false)}
      >
        <DialogTitle>Select Area Unit</DialogTitle>
        <DialogContent>
          <RadioGroup
            value={selectedAreaUnit.value}
            onChange={(e) => {
              const u = areaUnits.find((u) => u.value === e.target.value);
              if (u) {
                setSelectedAreaUnit(u);
                setLocalAreaUnit(u.value);
              }
              setAreaUnitModalOpen(false);
            }}
          >
            {areaUnits.map((u) => (
              <FormControlLabel
                key={u.value}
                value={u.value}
                control={<Radio />}
                label={u.label}
              />
            ))}
          </RadioGroup>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAreaUnitModalOpen(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
