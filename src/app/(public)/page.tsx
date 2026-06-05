"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
  Paper,
  Autocomplete,
  Chip,
  Collapse,
  Stack,
  Slider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  RadioGroup,
  Radio,
  FormControlLabel,
  Link,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import TuneIcon from "@mui/icons-material/Tune";
import DeleteIcon from "@mui/icons-material/Delete";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import HistoryIcon from "@mui/icons-material/History";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import api from "@/lib/axios";
import BrowsePropertiesCarousel from "@/components/BrowsePropertiesCarousel";

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

// Local storage keys
const STORAGE_KEYS = {
  RECENT_SEARCHES: "zameen_recent_searches",
  VIEWED_PROPERTIES: "zameen_viewed_properties",
};

interface SavedSearch {
  query: string;
  timestamp: number;
  displayText: string;
  city?: string;
  location?: string;
  priceMin?: number;
  priceMax?: number;
}

interface ViewedProperty {
  id: number;
  title: string;
  price: number;
  image?: string;
  timestamp: number;
}

interface TrendingLocation {
  location: string;
  count: number;
}

export default function HomePage() {
  const router = useRouter();

  // UI state
  const [currencyUI, setCurrencyUI] = useState<"PKR" | "USD">("PKR");
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const [currencyModalOpen, setCurrencyModalOpen] = useState(false);
  const [areaUnitModalOpen, setAreaUnitModalOpen] = useState(false);
  const [selectedAreaUnit, setSelectedAreaUnit] = useState(areaUnits[0]);

  // Local filter state
  const [localCity, setLocalCity] = useState<string | null>("Gujranwala");
  const [localLocation, setLocalLocation] = useState<string | null>(null);
  const [localPropertyType, setLocalPropertyType] = useState<string | null>(
    "HOUSE",
  );
  const [localPropertyPurpose, setLocalPropertyPurpose] = useState<
    "BUY" | "RENT" | null
  >("BUY");
  const [localPriceMin, setLocalPriceMin] = useState<number>(0);
  const [localPriceMax, setLocalPriceMax] = useState<number>(MAX_PRICE);
  const [localAreaMin, setLocalAreaMin] = useState<number>(0);
  const [localAreaMax, setLocalAreaMax] = useState<number>(10000);
  const [localBeds, setLocalBeds] = useState<string>("All");
  const [localBaths, setLocalBaths] = useState<string>("All");
  const [localSearchTerm, setLocalSearchTerm] = useState<string>("");

  // Additional data
  const [recentSearches, setRecentSearches] = useState<SavedSearch[]>([]);
  const [viewedProperties, setViewedProperties] = useState<ViewedProperty[]>(
    [],
  );
  const [popularLocations, setPopularLocations] = useState<TrendingLocation[]>(
    [],
  );
  const [loadingPopular, setLoadingPopular] = useState(false);

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
        // Response structure: { data: { data: { items: [...] } } }
        setLocationOptions(res.data?.data?.items || []);
      } catch (err) {
        console.error("Location suggestions failed", err);
      }
    };
    fetchLocations();
  }, [localCity, debouncedLocation]);

  // Load recent searches and viewed properties from localStorage
  useEffect(() => {
    const storedSearches = localStorage.getItem(STORAGE_KEYS.RECENT_SEARCHES);
    if (storedSearches) {
      try {
        setRecentSearches(JSON.parse(storedSearches).slice(0, 10));
      } catch (e) {}
    }
    const storedViewed = localStorage.getItem(STORAGE_KEYS.VIEWED_PROPERTIES);
    if (storedViewed) {
      try {
        setViewedProperties(JSON.parse(storedViewed).slice(0, 12));
      } catch (e) {}
    }
  }, []);

  // Fetch popular locations from backend
  useEffect(() => {
    const fetchPopularLocations = async () => {
      setLoadingPopular(true);
      try {
        const res = await api.get("/api/Property/trending/locations", {
          params: { top: 30 },
        });
        const locations = res.data?.data || res.data;
        if (Array.isArray(locations)) {
          setPopularLocations(locations);
        }
      } catch (err) {
        console.error("Failed to fetch popular locations", err);
      } finally {
        setLoadingPopular(false);
      }
    };
    fetchPopularLocations();
  }, []);

  // Build query string from current filter state
  const buildQueryString = () => {
    const params = new URLSearchParams();
    if (localCity) params.set("city", localCity);
    if (localLocation) params.set("location", localLocation);
    if (localPropertyType && localPropertyType !== "HOUSE")
      params.set("type", localPropertyType);
    if (localPropertyPurpose) params.set("purpose", localPropertyPurpose);
    if (localPriceMin > 0) params.set("minPrice", localPriceMin.toString());
    if (localPriceMax < MAX_PRICE)
      params.set("maxPrice", localPriceMax.toString());
    if (localAreaMin > 0) params.set("minArea", localAreaMin.toString());
    if (localAreaMax < 10000) params.set("maxArea", localAreaMax.toString());
    if (selectedAreaUnit.value !== "SQUARE_FEET")
      params.set("areaUnit", selectedAreaUnit.value);
    if (localBeds !== "All") params.set("beds", localBeds);
    if (localBaths !== "All") params.set("baths", localBaths);
    if (localSearchTerm) params.set("q", localSearchTerm);
    return params.toString();
  };

  // Save current search to localStorage and navigate
  const saveSearchAndNavigate = (
    queryString: string,
    displayText: string,
    city?: string,
    location?: string,
  ) => {
    const newSearch: SavedSearch = {
      query: queryString,
      timestamp: Date.now(),
      displayText,
      city,
      location,
      priceMin: localPriceMin === 0 ? undefined : localPriceMin,
      priceMax: localPriceMax === MAX_PRICE ? undefined : localPriceMax,
    };
    const updated = [
      newSearch,
      ...recentSearches.filter((s) => s.query !== queryString),
    ].slice(0, 10);
    setRecentSearches(updated);
    localStorage.setItem(STORAGE_KEYS.RECENT_SEARCHES, JSON.stringify(updated));
    router.push(`/properties?${queryString}`);
  };

   const logSearch = async () => {
    const locationToLog = localLocation || localCity;
    if (!locationToLog) return;
    try {
      await api.post("/api/SearchLog", {
        location: locationToLog,
        city: localCity || undefined,
        propertyType: localPropertyType,      // e.g., "HOUSE"
        propertyPurpose: localPropertyPurpose, // e.g., "BUY"
      });
    } catch (err) {
      console.debug("Failed to log search", err);
    }
  };

  const handleFind = () => {
    const queryString = buildQueryString();
    let display = "";
    if (localLocation) display += localLocation;
    else if (localCity) display += localCity;
    if (localPropertyType && localPropertyType !== "HOUSE")
      display += ` ${localPropertyType.toLowerCase()}`;
    if (localPropertyPurpose === "BUY") display += " for sale";
    else display += " for rent";

    logSearch();
    
    saveSearchAndNavigate(
      queryString,
      display,
      localCity || undefined,
      localLocation || undefined,
    );
  };

  const handleBrowseType = (type: string) => {
    const params = new URLSearchParams();
    params.set("type", type);
    params.set("purpose", "BUY");
    router.push(`/properties?${params.toString()}`);
  };

  const handleLocationClick = (location: string) => {
    const params = new URLSearchParams();
    params.set("location", location);
    params.set("purpose", "BUY");
    router.push(`/properties?${params.toString()}`);
  };

  const handleClearRecent = () => {
    setRecentSearches([]);
    localStorage.removeItem(STORAGE_KEYS.RECENT_SEARCHES);
  };

  const handleClearViewed = () => {
    setViewedProperties([]);
    localStorage.removeItem(STORAGE_KEYS.VIEWED_PROPERTIES);
  };

  const handleReset = () => {
    setLocalCity("Gujranwala");
    setLocalLocation(null);
    setLocalPropertyType("HOUSE");
    setLocalPropertyPurpose("BUY");
    setLocalPriceMin(0);
    setLocalPriceMax(MAX_PRICE);
    setLocalAreaMin(0);
    setLocalAreaMax(10000);
    setLocalBeds("All");
    setLocalBaths("All");
    setLocalSearchTerm("");
    setSelectedAreaUnit(areaUnits[0]);
  };

  // Group popular locations by category and city (simple heuristic)
  const groupedPopular = () => {
    const groups: {
      [category: string]: {
        [city: string]: { location: string; count: number }[];
      };
    } = {};
    for (const loc of popularLocations) {
      let category = "Other";
      if (loc.location.toLowerCase().includes("plot")) category = "Plots";
      else if (loc.location.toLowerCase().includes("flat")) category = "Flats";
      else if (loc.location.toLowerCase().includes("house"))
        category = "Houses";
      else continue;
      let city = "Lahore";
      if (loc.location.toLowerCase().includes("karachi")) city = "Karachi";
      else if (loc.location.toLowerCase().includes("islamabad"))
        city = "Islamabad";
      else if (loc.location.toLowerCase().includes("rawalpindi"))
        city = "Rawalpindi";
      if (!groups[category]) groups[category] = {};
      if (!groups[category][city]) groups[category][city] = [];
      groups[category][city].push({ location: loc.location, count: loc.count });
    }
    return groups;
  };

  // Helper to highlight search term in option text
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

  return (
    <Box sx={{ minHeight: "100vh" }}>
      {/* Hero Section with Background Image */}
      <Box
        sx={{
          pt: 28,
          pb: 6,
          backgroundImage: "url('/real-estate-bg.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          position: "relative",
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
                  value={localCity || ""}
                  onInputChange={(_, v) => setLocalCity(v || null)}
                  renderInput={(p) => (
                    <TextField {...p} label="City" size="small" />
                  )}
                />
              </Grid>

              {/* Location Autocomplete – SINGLE selection with highlight */}
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
                    value={localPropertyType || "HOUSE"}
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
                  onClick={handleFind}
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
                  <Grid size={{ xs: 12 }}>
                    <TextField
                      fullWidth
                      label="Keyword"
                      size="small"
                      value={localSearchTerm}
                      onChange={(e) => setLocalSearchTerm(e.target.value)}
                    />
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

      {/* Main content below hero */}
      <Container maxWidth="lg" sx={{ mt: 5, mb: 8 }}>
        {/* Browse Properties Carousel */}
        <Box sx={{ mb: 5 }}>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
            Browse Properties
          </Typography>
          <BrowsePropertiesCarousel />
        </Box>

        {/* Recent Searches */}
        {recentSearches.length > 0 && (
          <Box sx={{ mb: 5 }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 2,
              }}
            >
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                <HistoryIcon sx={{ mr: 1, verticalAlign: "middle" }} /> Recent
                Searches
              </Typography>
              <Button
                size="small"
                startIcon={<DeleteIcon />}
                onClick={handleClearRecent}
                sx={{ textTransform: "none" }}
              >
                Clear
              </Button>
            </Box>
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
              <Grid container spacing={2}>
                {recentSearches.map((search, idx) => (
                  <Grid size={{ xs: 12, md: 6 }} key={idx}>
                    <Link
                      href={`/properties?${search.query}`}
                      underline="hover"
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                        textDecoration: "none",
                        color: "inherit",
                        cursor: "pointer",
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          flexWrap: "wrap",
                        }}
                      >
                        <SearchIcon fontSize="small" color="action" />
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {search.displayText}
                        </Typography>
                        {search.city && (
                          <Chip
                            size="small"
                            icon={<LocationOnIcon />}
                            label={search.city}
                            variant="outlined"
                          />
                        )}
                        {search.priceMin !== undefined &&
                          search.priceMax !== undefined && (
                            <Chip
                              size="small"
                              icon={<AttachMoneyIcon />}
                              label={`PKR ${search.priceMin / 1e6}M - ${search.priceMax / 1e6}M`}
                              variant="outlined"
                            />
                          )}
                      </Box>
                    </Link>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          </Box>
        )}

        {/* Recently Viewed Properties */}
        {viewedProperties.length > 0 && (
          <Box sx={{ mb: 5 }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 2,
              }}
            >
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                <HistoryIcon sx={{ mr: 1, verticalAlign: "middle" }} /> Recently
                Viewed
              </Typography>
              <Button
                size="small"
                startIcon={<DeleteIcon />}
                onClick={handleClearViewed}
                sx={{ textTransform: "none" }}
              >
                Clear
              </Button>
            </Box>
            <Grid container spacing={2}>
              {viewedProperties.map((prop) => (
                <Grid size={{ xs: 6, sm: 4, md: 3 }} key={prop.id}>
                  <Paper
                    variant="outlined"
                    sx={{ p: 1.5, borderRadius: 2, cursor: "pointer" }}
                    onClick={() => router.push(`/properties/${prop.id}`)}
                  >
                    <Typography variant="subtitle2" noWrap>
                      {prop.title}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      PKR {(prop.price / 100000).toFixed(1)}L
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        {/* Popular Locations */}
        <Box sx={{ mb: 5 }}>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
            <TrendingUpIcon sx={{ mr: 1, verticalAlign: "middle" }} /> Popular
            Locations
          </Typography>
          {loadingPopular ? (
            <Typography>Loading popular locations...</Typography>
          ) : popularLocations.length === 0 ? (
            <Typography color="text.secondary">
              No trending data yet.
            </Typography>
          ) : (
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
              {Object.entries(groupedPopular()).map(([category, cities]) => (
                <Box key={category} sx={{ mb: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                    Most Popular Locations for {category}
                  </Typography>
                  <Grid container spacing={2}>
                    {Object.entries(cities).map(([city, locations]) => (
                      <Grid size={{ xs: 12, md: 4 }} key={city}>
                        <Typography
                          variant="subtitle1"
                          sx={{ fontWeight: 600, mb: 0.5 }}
                        >
                          {city}
                        </Typography>
                        <List dense disablePadding>
                          {locations.slice(0, 8).map((loc, idx) => (
                            <ListItem
                              key={idx}
                              disablePadding
                              sx={{ py: 0.25 }}
                            >
                              <ListItemIcon sx={{ minWidth: 28 }}>
                                <LocationOnIcon
                                  fontSize="small"
                                  color="action"
                                />
                              </ListItemIcon>
                              <ListItemText
                                primary={
                                  <Link
                                    href="#"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      handleLocationClick(loc.location);
                                    }}
                                    sx={{
                                      textDecoration: "none",
                                      "&:hover": {
                                        textDecoration: "underline",
                                      },
                                      cursor: "pointer",
                                    }}
                                  >
                                    {loc.location}
                                  </Link>
                                }
                                secondary={`(${loc.count.toLocaleString()})`}
                                secondaryTypographyProps={{ component: "span" }}
                              />
                            </ListItem>
                          ))}
                        </List>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              ))}
            </Paper>
          )}
        </Box>
      </Container>

      {/* Currency Modal */}
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

      {/* Area Unit Modal */}
      <Dialog
        open={areaUnitModalOpen}
        onClose={() => setAreaUnitModalOpen(false)}
      >
        <DialogTitle>Select Area Unit</DialogTitle>
        <DialogContent>
          <RadioGroup
            value={selectedAreaUnit.value}
            onChange={(e) => {
              const unit = areaUnits.find((u) => u.value === e.target.value);
              if (unit) setSelectedAreaUnit(unit);
              setAreaUnitModalOpen(false);
            }}
          >
            {areaUnits.map((unit) => (
              <FormControlLabel
                key={unit.value}
                value={unit.value}
                control={<Radio />}
                label={unit.label}
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
