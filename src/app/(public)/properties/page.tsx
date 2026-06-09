"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
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
  ToggleButtonGroup,
  ToggleButton,
  InputAdornment,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import TuneIcon from "@mui/icons-material/Tune";
import GridViewIcon from "@mui/icons-material/GridView";
import ViewListIcon from "@mui/icons-material/ViewList";
import ClearIcon from "@mui/icons-material/Clear";
import { useProperties } from "@/hooks/useProperties";
import PropertyCard from "@/components/PropertyCard";
import api from "@/lib/axios";

// ----------------------------------------------------------------------
// Constants
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

const PropertyCardSkeleton = () => (
  <Paper sx={{ borderRadius: 3, overflow: "hidden", boxShadow: 1 }}>
    <Skeleton variant="rectangular" height={200} />
    <Box sx={{ p: 2 }}>
      <Skeleton variant="text" width="80%" />
      <Skeleton variant="text" width="50%" />
      <Skeleton variant="text" width="60%" />
      <Skeleton variant="rectangular" height={36} sx={{ mt: 1 }} />
    </Box>
  </Paper>
);

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

interface InitialFilters {
  city: string;
  location: string | null;
  propertyType: string;
  propertyPurpose: "BUY" | "RENT";
  priceMin: number;
  priceMax: number;
  areaMin: number;
  areaMax: number;
  areaUnit: string;
  beds: string;
  baths: string;
  keyword: string;
  sortBy: string;
  isDescending: boolean;
  page: number;
}

function getInitialFiltersFromUrl(
  searchParams: URLSearchParams,
): InitialFilters {
  return {
    city: searchParams.get("city") || "Gujranwala",
    location: searchParams.get("location") || null,
    propertyType: searchParams.get("type") || "HOUSE",
    propertyPurpose: (searchParams.get("purpose") === "BUY"
      ? "BUY"
      : "RENT") as "BUY" | "RENT",
    priceMin: parseInt(searchParams.get("minPrice") || "0"),
    priceMax: parseInt(searchParams.get("maxPrice") || MAX_PRICE.toString()),
    areaMin: parseInt(searchParams.get("minArea") || "0"),
    areaMax: parseInt(searchParams.get("maxArea") || "10000"),
    areaUnit: searchParams.get("areaUnit") || "SQUARE_FEET",
    beds: searchParams.get("beds") || "All",
    baths: searchParams.get("baths") || "All",
    keyword: searchParams.get("q") || "",
    sortBy: searchParams.get("sortBy") || "CreatedAt",
    isDescending: searchParams.get("order") !== "asc",
    page: parseInt(searchParams.get("page") || "1"),
  };
}

export default function PropertiesPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [currencyUI, setCurrencyUI] = useState<"PKR" | "USD">("PKR");
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const [currencyModalOpen, setCurrencyModalOpen] = useState(false);
  const [areaUnitModalOpen, setAreaUnitModalOpen] = useState(false);
  const [selectedAreaUnit, setSelectedAreaUnit] = useState(areaUnits[0]);

  // Local filter state
  const [localCity, setLocalCity] = useState<string>("Gujranwala");
  const [localLocation, setLocalLocation] = useState<string | null>(null);
  const [localPropertyType, setLocalPropertyType] = useState<string>("");
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
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Location suggestions
  const [locationInput, setLocationInput] = useState("");
  const [locationOptions, setLocationOptions] = useState<string[]>([]);
  const debouncedLocation = useDebounce(locationInput, 300);
  const initialLoadDone = useRef(false);

  // Read URL params once on mount

useEffect(() => {
  const initial = getInitialFiltersFromUrl(searchParams);

  // Update all local state (so the UI reflects the URL)
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
  setLocalSortBy(initial.sortBy);
  setLocalIsDescending(initial.isDescending);
  setCurrentPage(initial.page);

  const unit = areaUnits.find((u) => u.value === initial.areaUnit) || areaUnits[0];
  setSelectedAreaUnit(unit);

  // Build the API filters using the initial values (not state)
  const apiFilters = {
    Page: initial.page,
    PageSize: 9,
    City: initial.city === "Gujranwala" ? undefined : initial.city,
    Location: initial.location || undefined,
    PropertyType: initial.propertyType || undefined,
    PropertyPurpose: initial.propertyPurpose,
    MinPrice: initial.priceMin === 0 ? undefined : initial.priceMin,
    MaxPrice: initial.priceMax === MAX_PRICE ? undefined : initial.priceMax,
    MinAreaSize: initial.areaMin === 0 ? undefined : initial.areaMin * unit.factor,
    MaxAreaSize: initial.areaMax === 10000 ? undefined : initial.areaMax * unit.factor,
    SearchTerm: initial.keyword || undefined,
    MinBedrooms: initial.beds === "All" ? undefined : initial.beds === "10+" ? 10 : parseInt(initial.beds, 10),
    MaxBedrooms: initial.beds === "All" ? undefined : initial.beds === "10+" ? undefined : parseInt(initial.beds, 10),
    MinBathrooms: initial.baths === "All" ? undefined : parseInt(initial.baths, 10),
    MaxBathrooms: initial.baths === "All" ? undefined : parseInt(initial.baths, 10),
    SortBy: initial.sortBy,
    IsDescending: initial.isDescending,
  };

  // Trigger the initial fetch with the correct filters
  setFilters(apiFilters);
  refetch();

  initialLoadDone.current = true;
}, []); // runs only once on mount

  // Fetch location suggestions – stable effect
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
        const items = res.data?.data?.items || [];
        setLocationOptions(items);
      } catch (err) {
        console.error(err);
      }
    };
    fetchLocations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localCity, debouncedLocation]);

  // Build API filters (memoized)
  const buildApiFilters = useMemo(() => {
    const unit =
      areaUnits.find((u) => u.value === localAreaUnit) || areaUnits[0];
    const minAreaSqFt = localAreaMin * unit.factor;
    const maxAreaSqFt = localAreaMax * unit.factor;
    return {
      Page: currentPage,
      PageSize: 9,
      City: localCity === "Gujranwala" ? undefined : localCity,
      Location: localLocation || undefined,
      PropertyType: localPropertyType || undefined,
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
    currentPage,
  ]);

  const { data, loading, error, setFilters, refetch } = useProperties({
    Page: 1,
    PageSize: 9,
    SortBy: "CreatedAt",
    IsDescending: true,
  });



  const formatPrice = (price: number) => {
    const converted = currencyUI === "USD" ? price * 0.0036 : price;
    const symbol = currencyUI === "USD" ? "$" : "PKR";
    if (converted >= 10_000_000)
      return `${symbol} ${(converted / 10_000_000).toFixed(1)}Cr`;
    if (converted >= 100_000)
      return `${symbol} ${(converted / 100_000).toFixed(1)}L`;
    return `${symbol} ${converted.toLocaleString()}`;
  };

  const displayItems = data?.items || [];

  const logSearch = useCallback(async () => {
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
  }, [localLocation, localCity, localPropertyType, localPropertyPurpose]);

  const handleApplyFilters = useCallback(() => {
    logSearch();
    setCurrentPage(1);
    setTimeout(() => {
      setFilters(buildApiFilters);
      refetch();
    }, 0);
    const params = new URLSearchParams();
    if (localCity && localCity !== "Gujranwala") params.set("city", localCity);
    if (localLocation) params.set("location", localLocation);
    if (localPropertyType) params.set("type", localPropertyType);
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
    if (localSortBy !== "CreatedAt") params.set("sortBy", localSortBy);
    if (!localIsDescending) params.set("order", "asc");
    params.set("page", "1");
    router.push(`/properties?${params.toString()}`);
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
    logSearch,
    buildApiFilters,
    setFilters,
    refetch,
    router,
  ]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    const params = new URLSearchParams(window.location.search);
    params.set("page", page.toString());
    router.push(`/properties?${params.toString()}`);
  };

  const handleReset = useCallback(() => {
    router.push("/properties");
    setCurrentPage(1);
    setLocalCity("Gujranwala");
    setLocalLocation(null);
    setLocalPropertyType("");
    setLocalPropertyPurpose("BUY");
    setLocalPriceMin(0);
    setLocalPriceMax(MAX_PRICE);
    setLocalAreaMin(0);
    setLocalAreaMax(10000);
    setLocalAreaUnit("SQUARE_FEET");
    setLocalBeds("All");
    setLocalBaths("All");
    setLocalSearchTerm("");
    setLocalSortBy("CreatedAt");
    setLocalIsDescending(true);
    setSelectedAreaUnit(areaUnits[0]);
    setTimeout(() => {
      setFilters(buildApiFilters);
      refetch();
    }, 0);
  }, [router, buildApiFilters, setFilters, refetch]);

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f5f7fb" }}>
      {/* Hero Section */}
      <Box
        sx={{
          position: "relative",
          pt: { xs: 8, md: 12 },
          pb: { xs: 6, md: 8 },
          backgroundImage: "linear-gradient(135deg, #1a2a3a 0%, #0f1a24 100%)",
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: "url('/real-estate-bg.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            opacity: 0.15,
          },
        }}
      >
        <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
          <Typography
            variant="h3"
            sx={{
              fontWeight: 700,
              fontSize: { xs: "1.8rem", md: "2.8rem" },
              textAlign: "center",
              color: "white",
              mb: 1,
            }}
          >
            Search properties for sale in Pakistan
          </Typography>

          <Paper
            elevation={0}
            sx={{
              p: { xs: 2, md: 3 },
              borderRadius: 4,
              mt: 4,
              background: "rgba(255,255,255,0.95)",
              backdropFilter: "blur(2px)",
              border: "1px solid rgba(255,255,255,0.2)",
            }}
          >
            <Box sx={{ display: "flex", justifyContent: "center", mb: 3 }}>
              <Stack direction="row" spacing={2}>
                <Button
                  variant={
                    localPropertyPurpose === "BUY" ? "contained" : "outlined"
                  }
                  onClick={() => setLocalPropertyPurpose("BUY")}
                  sx={{ textTransform: "none", px: 4, fontWeight: 600 }}
                >
                  Buy
                </Button>
                <Button
                  variant={
                    localPropertyPurpose === "RENT" ? "contained" : "outlined"
                  }
                  onClick={() => setLocalPropertyPurpose("RENT")}
                  sx={{ textTransform: "none", px: 4, fontWeight: 600 }}
                >
                  Rent
                </Button>
              </Stack>
            </Box>

            <Grid container spacing={2} sx={{ alignItems: "center" }}>
              <Grid size={{ xs: 12, sm: 6, md: 2.5 }}>
                <Autocomplete
                  freeSolo
                  options={CITIES}
                  value={localCity}
                  onInputChange={(_, v) => setLocalCity(v || "Gujranwala")}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="City"
                      size="medium"
                      variant="outlined"
                    />
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
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Location"
                      size="medium"
                      placeholder="Area / Society"
                    />
                  )}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                <FormControl fullWidth size="medium">
                  <InputLabel>Property Type</InputLabel>
                  <Select
                    value={localPropertyType}
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
                  onClick={handleApplyFilters}
                  sx={{
                    bgcolor: "#f59e0b",
                    "&:hover": { bgcolor: "#d97706" },
                    textTransform: "none",
                    fontWeight: 600,
                    py: 1.2,
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
                  startIcon={<TuneIcon />}
                  onClick={() => setShowMoreOptions(!showMoreOptions)}
                  sx={{
                    textTransform: "none",
                    color: "#f59e0b",
                    fontWeight: 500,
                  }}
                >
                  {showMoreOptions ? "Less Options" : "More Options"}
                </Button>
              </Grid>
            </Grid>

            <Collapse in={showMoreOptions}>
              <Box
                sx={{
                  mt: 3,
                  pt: 2,
                  borderTop: "1px solid",
                  borderColor: "divider",
                }}
              >
                <Grid container spacing={3}>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 500 }}>
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
                        slotProps={{
                          input: {
                            startAdornment: (
                              <InputAdornment position="start">
                                PKR
                              </InputAdornment>
                            ),
                          },
                        }}
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
                        slotProps={{
                          input: {
                            startAdornment: (
                              <InputAdornment position="start">
                                PKR
                              </InputAdornment>
                            ),
                          },
                        }}
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
                    <Typography variant="subtitle2" sx={{ fontWeight: 500 }}>
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
                        renderInput={(params) => (
                          <TextField
                            {...params}
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
                        renderInput={(params) => (
                          <TextField
                            {...params}
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
                      slotProps={{
                        input: {
                          startAdornment: (
                            <InputAdornment position="start">
                              <SearchIcon fontSize="small" />
                            </InputAdornment>
                          ),
                        },
                      }}
                    />
                  </Grid>
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
              <Button
                size="small"
                variant="text"
                onClick={handleReset}
                startIcon={<ClearIcon fontSize="small" />}
              >
                Reset
              </Button>
            </Box>
          </Paper>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 6 }}>
        {data && !loading && (
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
            <Typography
              variant="subtitle1"
              sx={{ fontWeight: 500, color: "text.secondary" }}
            >
              {displayItems.length} properties found
            </Typography>
            <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Sort by</InputLabel>
                <Select
                  value={localSortBy}
                  label="Sort by"
                  onChange={(e) => setLocalSortBy(e.target.value)}
                >
                  <MenuItem value="CreatedAt">Newest</MenuItem>
                  <MenuItem value="Price">Price</MenuItem>
                  <MenuItem value="AreaSize">Area</MenuItem>
                  <MenuItem value="Bedrooms">Bedrooms</MenuItem>
                </Select>
              </FormControl>
              <Button
                size="small"
                variant="text"
                onClick={() => setLocalIsDescending(!localIsDescending)}
                startIcon={localIsDescending ? <span>↓</span> : <span>↑</span>}
              >
                {localIsDescending ? "Descending" : "Ascending"}
              </Button>
              <ToggleButtonGroup
                value={viewMode}
                exclusive
                onChange={(_, m) => m && setViewMode(m)}
                size="small"
              >
                <ToggleButton value="grid">
                  <GridViewIcon />
                </ToggleButton>
                <ToggleButton value="list">
                  <ViewListIcon />
                </ToggleButton>
              </ToggleButtonGroup>
            </Stack>
          </Box>
        )}

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
          <Paper sx={{ p: 8, textAlign: "center", borderRadius: 3 }}>
            <Typography variant="h6" color="text.secondary">
              No properties found.
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Try adjusting your filters or reset search.
            </Typography>
          </Paper>
        ) : (
          <>
            <Grid container spacing={viewMode === "grid" ? 3 : 2}>
              {displayItems.map((property) => (
                <Grid
                  key={property.id}
                  size={{
                    xs: 12,
                    sm: viewMode === "grid" ? 6 : 12,
                    md: viewMode === "grid" ? 4 : 12,
                  }}
                >
                  <PropertyCard property={property} formatPrice={formatPrice} />
                </Grid>
              ))}
            </Grid>
            {data && data.totalCount > 0 && (
              <Box sx={{ display: "flex", justifyContent: "center", mt: 5 }}>
                <Pagination
                  count={Math.ceil(data.totalCount / (data.pageSize || 9))}
                  page={currentPage}
                  onChange={(_, page) => handlePageChange(page)}
                  color="primary"
                  size="large"
                  sx={{ "& .MuiPaginationItem-root": { borderRadius: 2 } }}
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
