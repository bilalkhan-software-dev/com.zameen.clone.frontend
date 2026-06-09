"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
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
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Skeleton,
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
// Constants
// ----------------------------------------------------------------------
const CITIES = [
  "Abbottabad",
  "Bahawalpur",
  "Islamabad",
  "Karachi",
  "Lahore",
  "Rawalpindi",
  "Faisalabad",
  "Gujranwala",
  "Peshawar",
  "Multan",
  "Sialkot",
  "Sukkur",
  "Sargodha",
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
const propertyTypeOptions = [
  "HOUSE",
  "FLAT",
  "PLOT",
  "COMMERCIAL",
  "SHOP",
  "FACTORY",
  "STUDIO",
];

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debounced;
}

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

interface FullProperty {
  id: number;
  title: string;
  price: number;
  image?: string;
  location?: string;
  city?: string;
  beds?: number;
  baths?: number;
  area?: number;
  areaUnit?: string;
  purpose?: string;
}

interface TrendingLocation {
  location: string;
  searchCount: number;
}

export default function HomePage() {
  const router = useRouter();
  const pathname = usePathname(); // key fix: re‑load data on route change

  // UI state
  const [currencyUI, setCurrencyUI] = useState<"PKR" | "USD">("PKR");
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const [currencyModalOpen, setCurrencyModalOpen] = useState(false);
  const [areaUnitModalOpen, setAreaUnitModalOpen] = useState(false);
  const [selectedAreaUnit, setSelectedAreaUnit] = useState(areaUnits[0]);

  // Filter state
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

  // Data states
  const [recentSearches, setRecentSearches] = useState<SavedSearch[]>([]);
  const [viewedProperties, setViewedProperties] = useState<ViewedProperty[]>(
    [],
  );
  const [enrichedViewed, setEnrichedViewed] = useState<FullProperty[]>([]);
  const [enrichingViewed, setEnrichingViewed] = useState(false);
  const [popularLocations, setPopularLocations] = useState<TrendingLocation[]>(
    [],
  );
  const [loadingPopular, setLoadingPopular] = useState(false);
  const [locationOptions, setLocationOptions] = useState<string[]>([]);
  const [locationInput, setLocationInput] = useState("");
  const debouncedLocation = useDebounce(locationInput, 300);

  // ------------------------------------------------------------------
  // Load data from localStorage on mount AND whenever pathname changes
  // ------------------------------------------------------------------
  const loadLocalData = useCallback(() => {
    try {
      const storedSearches = localStorage.getItem(STORAGE_KEYS.RECENT_SEARCHES);
      if (storedSearches)
        setRecentSearches(JSON.parse(storedSearches).slice(0, 10));
    } catch (e) {
      console.error(e);
    }
    try {
      const storedViewed = localStorage.getItem(STORAGE_KEYS.VIEWED_PROPERTIES);
      if (storedViewed)
        setViewedProperties(JSON.parse(storedViewed).slice(0, 12));
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => {
    loadLocalData();
  }, [pathname, loadLocalData]); // runs on every route change

  // Listen for custom event from PropertyCard to refresh immediately
  useEffect(() => {
    const handler = () => loadLocalData();
    window.addEventListener("viewed-property-updated", handler);
    return () => window.removeEventListener("viewed-property-updated", handler);
  }, [loadLocalData]);

  // Location suggestions
  useEffect(() => {
    if (!localCity || !debouncedLocation) {
      if (locationOptions.length !== 0) setLocationOptions([]);
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

  // Fetch popular locations once
  useEffect(() => {
    const fetchPopular = async () => {
      setLoadingPopular(true);
      try {
        const res = await api.get("/api/Property/trending/locations", {
          params: { top: 30 },
        });
        const locations = res.data?.data || res.data;
        if (Array.isArray(locations)) setPopularLocations(locations);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingPopular(false);
      }
    };
    fetchPopular();
  }, []);

  // Fetch full property details for recently viewed
  useEffect(() => {
    if (!viewedProperties.length) {
      setEnrichedViewed([]);
      return;
    }
    const fetchDetails = async () => {
      setEnrichingViewed(true);
      try {
        const details = await Promise.all(
          viewedProperties.map(async (vp) => {
            try {
              const res = await api.get(`/api/Property/${vp.id}`);
              const d = res.data?.data || res.data;
              return {
                id: d.id || vp.id,
                title: d.title || vp.title,
                price: d.price || vp.price,
                image: d.images?.[0]?.url || d.image || vp.image || undefined,
                location: d.location,
                city: d.city,
                beds: d.beds,
                baths: d.baths,
                area: d.area,
                areaUnit: d.areaUnit,
                purpose: d.purpose,
              };
            } catch {
              return {
                id: vp.id,
                title: vp.title,
                price: vp.price,
                image: vp.image,
              };
            }
          }),
        );
        setEnrichedViewed(details);
      } catch (err) {
        console.error("Enrich failed", err);
        setEnrichedViewed(
          viewedProperties.map((vp) => ({
            id: vp.id,
            title: vp.title,
            price: vp.price,
            image: vp.image,
          })),
        );
      } finally {
        setEnrichingViewed(false);
      }
    };
    fetchDetails();
  }, [viewedProperties]);

  // Build query string
  const buildQueryString = useCallback(() => {
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
  }, [
    localCity,
    localLocation,
    localPropertyType,
    localPropertyPurpose,
    localPriceMin,
    localPriceMax,
    localAreaMin,
    localAreaMax,
    selectedAreaUnit,
    localBeds,
    localBaths,
    localSearchTerm,
  ]);

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
        propertyType: localPropertyType,
        propertyPurpose: localPropertyPurpose,
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
    display += localPropertyPurpose === "BUY" ? " for sale" : " for rent";
    logSearch();
    saveSearchAndNavigate(
      queryString,
      display,
      localCity || undefined,
      localLocation || undefined,
    );
  };

  const handleLocationClick = (location: string) => {
    router.push(
      `/properties?location=${encodeURIComponent(location)}&purpose=BUY`,
    );
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

  const highlightText = (text: string, query: string) => {
    if (!query) return text;
    const idx = text.toLowerCase().indexOf(query.toLowerCase());
    if (idx === -1) return text;
    return (
      <span>
        {text.slice(0, idx)}
        <strong style={{ backgroundColor: "#ffeb3b" }}>
          {text.slice(idx, idx + query.length)}
        </strong>
        {text.slice(idx + query.length)}
      </span>
    );
  };

  const formatPrice = (price: number) => {
    if (price >= 1e7) return `${(price / 1e7).toFixed(1)} Crore`;
    if (price >= 1e5) return `${(price / 1e5).toFixed(1)} Lakh`;
    return price.toLocaleString();
  };

  return (
    <Box sx={{ minHeight: "100vh" }}>
      {/* Hero Section */}
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
          <Paper
            elevation={6}
            sx={{
              p: 2,
              borderRadius: 4,
              mt: 4,
              background: "rgba(255,255,255,0.95)",
              backdropFilter: "blur(4px)",
              border: "1px solid rgba(255,255,255,0.3)",
            }}
          >
            {/* Buy/Rent toggle */}
            <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
              <Stack direction="row" spacing={2}>
                <Button
                  variant={
                    localPropertyPurpose === "BUY" ? "contained" : "outlined"
                  }
                  onClick={() => setLocalPropertyPurpose("BUY")}
                  sx={{
                    textTransform: "none",
                    px: 4,
                    fontWeight: 600,
                    borderRadius: 2,
                  }}
                >
                  Buy
                </Button>
                <Button
                  variant={
                    localPropertyPurpose === "RENT" ? "contained" : "outlined"
                  }
                  onClick={() => setLocalPropertyPurpose("RENT")}
                  sx={{
                    textTransform: "none",
                    px: 4,
                    fontWeight: 600,
                    borderRadius: 2,
                  }}
                >
                  Rent
                </Button>
              </Stack>
            </Box>

            <Grid container spacing={2}>
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
              <Grid size={{ xs: 12, sm: 6, md: 3.5 }}>
                <Autocomplete
                  freeSolo
                  options={locationOptions}
                  value={localLocation || ""}
                  onInputChange={(_, v) => setLocationInput(v)}
                  onChange={(_, v) => setLocalLocation(v)}
                  renderOption={(props, opt) => (
                    <li {...props} key={opt}>
                      {highlightText(opt, locationInput)}
                    </li>
                  )}
                  renderInput={(p) => (
                    <TextField
                      {...p}
                      label="Location"
                      size="small"
                      placeholder="Location"
                    />
                  )}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Property Type</InputLabel>
                  <Select
                    value={localPropertyType || "HOUSE"}
                    label="Property Type"
                    onChange={(e) => setLocalPropertyType(e.target.value)}
                  >
                    {propertyTypeOptions.map((type) => (
                      <MenuItem key={type} value={type}>
                        {type.charAt(0) + type.slice(1).toLowerCase()}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
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
                    borderRadius: 2,
                  }}
                  startIcon={<SearchIcon />}
                >
                  Find
                </Button>
              </Grid>
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
                  <Grid size={{ xs: 12, sm: 4 }}>
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
                  <Grid size={{ xs: 12, sm: 4 }}>
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
                  <Grid size={{ xs: 4 }}>
                    <TextField
                      fullWidth
                      label="Keyword"
                      size="small"
                      value={localSearchTerm}
                      onChange={(e) => setLocalSearchTerm(e.target.value)}
                    />
                  </Grid>
                  {/* <Grid size={{ xs: 12 }} sx={{ textAlign: "right" }}>
                    <Button size="small" variant="text" onClick={handleReset}>
                      Reset All Filters
                    </Button>
                  </Grid> */}
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

      <Container maxWidth="lg" sx={{ mt: 5, mb: 8 }}>
        {/* Browse Properties Carousel (hidden scrollbar) */}
        <Box sx={{ mb: 5 }}>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
            Browse Properties
          </Typography>
          <Box
            sx={{
              "& *::-webkit-scrollbar": { display: "none" },
              "& *": { scrollbarWidth: "none", msOverflowStyle: "none" },
            }}
          >
            <BrowsePropertiesCarousel />
          </Box>
        </Box>

        {/* Recent Searches – Beautiful Cards */}
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
            <Grid container spacing={2}>
              {recentSearches.map((search, idx) => (
                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={idx}>
                  <Card
                    sx={{
                      borderRadius: 3,
                      transition: "box-shadow 0.2s, transform 0.2s",
                      "&:hover": {
                        boxShadow: 6,
                        transform: "translateY(-2px)",
                      },
                      height: "100%",
                    }}
                  >
                    <CardActionArea
                      onClick={() => router.push(`/properties?${search.query}`)}
                      sx={{
                        p: 2,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "flex-start",
                        gap: 1,
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
                        <Typography variant="subtitle1" fontWeight={600}>
                          {search.displayText}
                        </Typography>
                      </Box>
                      <Stack
                        direction="row"
                        spacing={1}
                        sx={{ mt: 0.5, flexWrap: "wrap", rowGap: 0.5 }}
                      >
                        {search.city && (
                          <Chip
                            size="small"
                            icon={<LocationOnIcon />}
                            label={search.city}
                            variant="outlined"
                            color="primary"
                          />
                        )}
                        {search.priceMin !== undefined &&
                          search.priceMax !== undefined && (
                            <Chip
                              size="small"
                              icon={<AttachMoneyIcon />}
                              label={`PKR ${(search.priceMin / 1e6).toFixed(1)}M - ${(search.priceMax / 1e6).toFixed(1)}M`}
                              variant="outlined"
                              color="secondary"
                            />
                          )}
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ ml: "auto" }}
                        >
                          {new Date(search.timestamp).toLocaleDateString()}
                        </Typography>
                      </Stack>
                    </CardActionArea>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        {/* Recently Viewed – full property cards */}
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
            {enrichingViewed ? (
              <Grid container spacing={3}>
                {[1, 2, 3, 4].map((i) => (
                  <Grid size={{ xs: 6, sm: 4, md: 3 }} key={i}>
                    <Skeleton
                      variant="rectangular"
                      height={180}
                      sx={{ borderRadius: 2 }}
                    />
                    <Skeleton variant="text" sx={{ mt: 1 }} />
                    <Skeleton variant="text" width="60%" />
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Grid container spacing={3}>
                {enrichedViewed.map((prop) => (
                  <Grid size={{ xs: 6, sm: 4, md: 3 }} key={prop.id}>
                    <Card
                      sx={{
                        height: "100%",
                        borderRadius: 3,
                        transition: "box-shadow 0.2s, transform 0.2s",
                        "&:hover": {
                          boxShadow: 6,
                          transform: "translateY(-2px)",
                        },
                        cursor: "pointer",
                      }}
                      onClick={() => router.push(`/properties/${prop.id}`)}
                    >
                      <Box
                        sx={{
                          position: "relative",
                          width: "100%",
                          height: 160,
                        }}
                      >
                        <CardMedia
                          component="img"
                          height="160"
                          image={prop.image || "/placeholder-property.jpg"}
                          alt={prop.title}
                          sx={{ objectFit: "cover" }}
                        />
                        {prop.purpose && (
                          <Chip
                            label={prop.purpose === "RENT" ? "Rent" : "Sale"}
                            size="small"
                            color={
                              prop.purpose === "RENT" ? "secondary" : "primary"
                            }
                            sx={{
                              position: "absolute",
                              top: 8,
                              left: 8,
                              fontWeight: 600,
                            }}
                          />
                        )}
                      </Box>
                      <CardContent sx={{ pb: "12px !important" }}>
                        <Typography
                          variant="subtitle2"
                          noWrap
                          gutterBottom
                          sx={{fontWeight:600}}
                        >
                          {prop.title}
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          noWrap
                        >
                          {prop.location || prop.city}
                          {prop.location && prop.city ? `, ${prop.city}` : ""}
                        </Typography>
                        <Stack
                          direction="row"
                          spacing={1}
                          sx={{ mt: 0.5, flexWrap: "wrap", rowGap: 0.5 }}
                        >
                          {prop.beds != null && (
                            <Chip
                              label={`${prop.beds} Beds`}
                              size="small"
                              variant="outlined"
                              sx={{ fontSize: "0.7rem" }}
                            />
                          )}
                          {prop.baths != null && (
                            <Chip
                              label={`${prop.baths} Baths`}
                              size="small"
                              variant="outlined"
                              sx={{ fontSize: "0.7rem" }}
                            />
                          )}
                          {prop.area && (
                            <Chip
                              label={`${prop.area} ${prop.areaUnit || "sq ft"}`}
                              size="small"
                              variant="outlined"
                              sx={{ fontSize: "0.7rem" }}
                            />
                          )}
                        </Stack>
                        <Typography
                          variant="subtitle1"
                          color="#f59e0b"
                           sx={{fontWeight:700,mt:1}}
                        >
                          PKR {formatPrice(prop.price)}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>
        )}

        {/* Popular Locations – Direct Cards */}
        <Box sx={{ mb: 5 }}>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
            <TrendingUpIcon sx={{ mr: 1, verticalAlign: "middle" }} /> Popular
            Locations
          </Typography>
          {loadingPopular ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <Skeleton
                variant="rectangular"
                width="100%"
                height={200}
                sx={{ borderRadius: 2 }}
              />
            </Box>
          ) : popularLocations.length === 0 ? (
            <Typography
              color="text.secondary"
              sx={{ textAlign: "center", py: 4 }}
            >
              No trending data yet.
            </Typography>
          ) : (
            <Grid container spacing={2}>
              {popularLocations.map((loc, idx) => (
                <Grid size={{ xs: 6, sm: 4, md: 3 }} key={idx}>
                  <Card
                    sx={{
                      borderRadius: 3,
                      transition: "box-shadow 0.2s, transform 0.2s",
                      "&:hover": {
                        boxShadow: 6,
                        transform: "translateY(-2px)",
                      },
                      cursor: "pointer",
                      height: "100%",
                    }}
                    onClick={() => handleLocationClick(loc.location)}
                  >
                    <CardContent sx={{ textAlign: "center", p: 2 }}>
                      <LocationOnIcon
                        color="primary"
                        sx={{ fontSize: 32, mb: 1 }}
                      />
                      <Typography variant="subtitle1"   sx={{fontWeight:600}} noWrap>
                        {loc.location}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {loc.searchCount.toLocaleString()} searches
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
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
              const u = areaUnits.find((u) => u.value === e.target.value);
              if (u) setSelectedAreaUnit(u);
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
