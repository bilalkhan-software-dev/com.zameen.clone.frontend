"use client";

import { useState, useEffect, useMemo } from "react";
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

const USD_RATE = 0.0036;
const MAX_PRICE = 500_000_000; // 50 Crore PKR

// Area units with conversion factors to square feet
const areaUnits = [
  { value: "SQUARE_FEET", label: "Sq. Ft.", factor: 1 },
  { value: "SQUARE_YARDS", label: "Sq. Yd.", factor: 9 },
  { value: "SQUARE_METERS", label: "Sq. M.", factor: 10.764 },
  { value: "MARLA", label: "Marla", factor: 272.25 },
  { value: "KANAL", label: "Kanal", factor: 5445 },
];

// Preset values in square feet (used for quick buttons)
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

export default function Home() {
  const { data, loading, error, setFilters, refetch } = useProperties({
    Page: 1,
    PageSize: 9,
    SortBy: "CreatedAt",
    IsDescending: true,
  });

  // UI state
  const [currencyUI, setCurrencyUI] = useState<"PKR" | "USD">("PKR");
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const [currencyModalOpen, setCurrencyModalOpen] = useState(false);
  const [areaUnitModalOpen, setAreaUnitModalOpen] = useState(false);
  const [selectedAreaUnit, setSelectedAreaUnit] = useState(areaUnits[0]); // default Sq. Ft.

  // Local filter state (only applied on Find)
  const [localCity, setLocalCity] = useState<string | null>("Gujranwala");
  const [localLocations, setLocalLocations] = useState<string[]>([]);
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
  const [localSearchTerm, setLocalSearchTerm] = useState<string>("");
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
        setLocationOptions(res.data.items || []);
      } catch (err) {
        console.error("Location suggestions failed", err);
      }
    };
    fetchLocations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localCity, debouncedLocation]);

  const logSearch = async () => {
    const locationToLog = localLocations[0] || (localCity ? localCity : null);
    if (!locationToLog) return;
    try {
      await api.post("/api/searchlog", {
        location: locationToLog,
        city: localCity || undefined,
        propertyType: localPropertyType || undefined,
        propertyPurpose: localPropertyPurpose || undefined,
      });
    } catch (err) {
      console.debug("Failed to log search", err);
    }
  };

  const handleSearch = () => {
    logSearch();
    const minAreaSqFt = localAreaMin * selectedAreaUnit.factor;
    const maxAreaSqFt = localAreaMax * selectedAreaUnit.factor;

    const newFilters: Partial<PropertyFilterParams> = {
      Page: 1,
      PageSize: 9,
      SortBy: "CreatedAt",
      IsDescending: true,
      City: localCity || undefined,
      Location: localLocations.length > 0 ? localLocations[0] : undefined,
      PropertyType:
        localPropertyType === "HOUSE"
          ? undefined
          : localPropertyType || undefined,
      PropertyPurpose: localPropertyPurpose || undefined,
      MinPrice: localPriceMin === 0 ? undefined : localPriceMin,
      MaxPrice: localPriceMax === MAX_PRICE ? undefined : localPriceMax,
      MinAreaSize: localAreaMin === 0 ? undefined : minAreaSqFt,
      MaxAreaSize: localAreaMax === 10000 ? undefined : maxAreaSqFt,
      SearchTerm: localSearchTerm || undefined,
    };
    if (localBeds === "All") {
      newFilters.MinBedrooms = undefined;
      newFilters.MaxBedrooms = undefined;
    } else if (localBeds === "10+") {
      newFilters.MinBedrooms = 10;
      newFilters.MaxBedrooms = undefined;
    } else {
      const num = parseInt(localBeds, 10);
      newFilters.MinBedrooms = num;
      newFilters.MaxBedrooms = num;
    }
    setFilters(newFilters);
    refetch();
  };

  const handleReset = () => {
    setLocalCity("Gujranwala");
    setLocalLocations([]);
    setLocalPropertyType("HOUSE");
    setLocalPropertyPurpose("BUY");
    setLocalPriceMin(0);
    setLocalPriceMax(MAX_PRICE);
    setLocalAreaMin(0);
    setLocalAreaMax(10000);
    setLocalBeds("All");
    setLocalSearchTerm("");
    setClientTypeFilter("HOUSE");
    setLocationInput("");
    setSelectedAreaUnit(areaUnits[0]);
    setFilters({
      Page: 1,
      PageSize: 9,
      SortBy: "CreatedAt",
      IsDescending: true,
      City: "Gujranwala",
      Location: undefined,
      PropertyType: undefined,
      PropertyPurpose: "BUY",
      MinPrice: undefined,
      MaxPrice: undefined,
      MinBedrooms: undefined,
      MaxBedrooms: undefined,
      MinAreaSize: undefined,
      MaxAreaSize: undefined,
      SearchTerm: "",
    });
    refetch();
  };

  const handleBuyRent = (value: string | null) => {
    if (value === "BUY") setLocalPropertyPurpose("BUY");
    else if (value === "RENT") setLocalPropertyPurpose("RENT");
    else setLocalPropertyPurpose(null);
  };

  const formatPrice = (price: number) => {
    const converted = currencyUI === "USD" ? price * USD_RATE : price;
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

  const buyRentValue =
    localPropertyPurpose === "BUY"
      ? "BUY"
      : localPropertyPurpose === "RENT"
        ? "RENT"
        : null;

  // Area preset handlers
  const setAreaMinPreset = (val: number) => setLocalAreaMin(val);
  const setAreaMaxPreset = (val: number) => setLocalAreaMax(val);

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
              <Box sx={{ display: "flex", gap: 2 }}>
                <Button
                  variant={buyRentValue === "BUY" ? "contained" : "outlined"}
                  onClick={() => handleBuyRent("BUY")}
                  sx={{
                    textTransform: "none",
                    borderRadius: 2,
                    px: 4,
                    py: 0.75,
                  }}
                >
                  Buy
                </Button>
                <Button
                  variant={buyRentValue === "RENT" ? "contained" : "outlined"}
                  onClick={() => handleBuyRent("RENT")}
                  sx={{
                    textTransform: "none",
                    borderRadius: 2,
                    px: 4,
                    py: 0.75,
                  }}
                >
                  Rent
                </Button>
              </Box>
            </Box>

            <Grid container spacing={2}>
              {/* City */}
              <Grid size={{ xs: 12, sm: 6, md: 2.5 }}>
                <Autocomplete
                  freeSolo
                  options={CITIES}
                  value={localCity || ""}
                  onInputChange={(_, newValue) =>
                    setLocalCity(newValue || null)
                  }
                  renderInput={(params) => (
                    <TextField {...params} label="City" size="small" />
                  )}
                />
              </Grid>

              {/* Location (multiple chips) */}
              <Grid size={{ xs: 12, sm: 6, md: 3.5 }}>
                <Autocomplete
                  multiple
                  freeSolo
                  options={locationOptions}
                  value={localLocations}
                  onInputChange={(_, newInputValue) =>
                    setLocationInput(newInputValue)
                  }
                  onChange={(_, newValue) => setLocalLocations(newValue)}
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
                    onChange={(e) =>
                      setLocalPropertyType(e.target.value as string)
                    }
                  >
                    <MenuItem value="HOUSE">House</MenuItem>
                    <MenuItem value="FLAT">Flat</MenuItem>
                    <MenuItem value="COMMERCIAL">Commercial</MenuItem>
                    <MenuItem value="SHOP">Shop</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {/* Find Button */}
              <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                <Button
                  fullWidth
                  variant="contained"
                  onClick={handleSearch}
                  sx={{
                    backgroundColor: "#f59e0b",
                    "&:hover": { backgroundColor: "#d97706" },
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
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>
                      Price Range ({currencyUI})
                    </Typography>
                    <Slider
                      value={[localPriceMin, localPriceMax]}
                      onChange={(_, newValue) => {
                        const [min, max] = newValue as number[];
                        setLocalPriceMin(min);
                        setLocalPriceMax(max);
                      }}
                      min={0}
                      max={MAX_PRICE}
                      step={1_000_000}
                      valueLabelDisplay="auto"
                      valueLabelFormat={(v) =>
                        `${(v / 10_000_000).toFixed(1)}Cr`
                      }
                    />
                    <Box sx={{ display: "flex", gap: 2, mt: 1 }}>
                      <TextField
                        label="Min Price"
                        size="small"
                        type="number"
                        value={localPriceMin}
                        onChange={(e) =>
                          setLocalPriceMin(Number(e.target.value))
                        }
                        fullWidth
                      />
                      <TextField
                        label="Max Price"
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
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>
                      Area ({selectedAreaUnit.label})
                    </Typography>
                    <Box sx={{ display: "flex", gap: 2, mb: 1 }}>
                      <Autocomplete
                        freeSolo
                        options={areaPresetsSqFt.map(String)}
                        value={
                          localAreaMin === 0 ? "" : localAreaMin.toString()
                        }
                        onInputChange={(_, newValue) => {
                          let num = parseFloat(newValue);
                          if (isNaN(num)) num = 0;
                          if (num < 0) num = 0;
                          setLocalAreaMin(num);
                        }}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Min Area"
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
                        onInputChange={(_, newValue) => {
                          let num = parseFloat(newValue);
                          if (isNaN(num)) num = 10000;
                          if (num < 0) num = 0;
                          setLocalAreaMax(num);
                        }}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Max Area"
                            size="small"
                            type="number"
                          />
                        )}
                        fullWidth
                      />
                    </Box>
                  </Grid>

                  {/* Beds Dropdown */}
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Beds</InputLabel>
                      <Select
                        value={localBeds}
                        label="Beds"
                        onChange={(e) => setLocalBeds(e.target.value)}
                      >
                        {bedOptions.map((opt) => (
                          <MenuItem key={opt} value={opt}>
                            {opt}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  {/* Keyword Search */}
                  <Grid size={{ xs: 12, sm: 6 }}>
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

            {/* Footer buttons */}
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

      {/* Results Summary */}
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
            {Array.from(new Array(6)).map((_, idx) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={idx}>
                <PropertyCardSkeleton />
              </Grid>
            ))}
          </Grid>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : displayItems.length === 0 ? (
          <Typography
            sx={{ textAlign: "center", color: "text.secondary", py: 6 }}
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
                  count={Math.ceil(data.totalCount / data.pageSize)}
                  page={data.page}
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
