"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
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
  ToggleButtonGroup,
  ToggleButton,
  Slider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Autocomplete,
  Chip,
  Collapse,
  Stack,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import TuneIcon from "@mui/icons-material/Tune";
import StarIcon from "@mui/icons-material/Star";
import { useProperties } from "@/hooks/useProperties";
import { PropertyFilterParams } from "@/lib/types";
import PropertyCard from "@/components/PropertyCard";
import api from "@/lib/axios";

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

const areaUnits = [
  { value: "SQUARE_FEET", label: "Square Feet", factor: 1 },
  { value: "SQUARE_YARDS", label: "Square Yards", factor: 9 },
  { value: "SQUARE_METERS", label: "Square Meters", factor: 10.764 },
  { value: "MARLA", label: "Marla", factor: 272.25 },
  { value: "KANAL", label: "Kanal", factor: 5445 },
];

const bedOptions = ["All", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10+"];

const propertyTypeOptions = ["HOUSE", "FLAT", "COMMERCIAL", "SHOP"];

export default function Home() {
  const { data, loading, error, filters, setFilters, refetch } = useProperties({
    Page: 1,
    PageSize: 9,
    SortBy: "CreatedAt",
    IsDescending: true,
  });

  // ── Local UI states ──────────────────────────
  const [currencyUI, setCurrencyUI] = useState<"PKR" | "USD">("PKR");
  const [areaUnitUI, setAreaUnitUI] = useState("SQUARE_FEET");
  const [areaMinInput, setAreaMinInput] = useState<string>("");
  const [areaMaxInput, setAreaMaxInput] = useState<string>("");
  const [bedSelection, setBedSelection] = useState<string>("All");
  const [showMoreOptions, setShowMoreOptions] = useState(false);

  // Modals
  const [currencyModalOpen, setCurrencyModalOpen] = useState(false);
  const [areaUnitModalOpen, setAreaUnitModalOpen] = useState(false);

  // Price slider local state
  const [priceMin, setPriceMin] = useState<number | undefined>(undefined);
  const [priceMax, setPriceMax] = useState<number | undefined>(undefined);

  // Multi‑location state
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [locationOptions, setLocationOptions] = useState<string[]>([]);

  // Client‑side property type filter
  const [clientTypeFilter, setClientTypeFilter] = useState<string | null>(null);

  // Derived area factor
  const areaFactor = areaUnits.find((u) => u.value === areaUnitUI)?.factor || 1;

  // ── Handlers ─────────────────────────────────
  const handleChange = (key: keyof PropertyFilterParams, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value, Page: 1 }));
  };

  const handleSearch = () => refetch();

  const handleReset = () => {
    setFilters({
      Page: 1,
      PageSize: 9,
      SortBy: "CreatedAt",
      IsDescending: true,
    });
    setPriceMin(undefined);
    setPriceMax(undefined);
    setAreaMinInput("");
    setAreaMaxInput("");
    setAreaUnitUI("SQUARE_FEET");
    setCurrencyUI("PKR");
    setBedSelection("All");
    setSelectedLocations([]);
    setClientTypeFilter(null);
    refetch();
  };

  // Buy / Rent toggle
  const handleBuyRent = (_: React.MouseEvent, newStatus: string | null) => {
    setFilters((prev) => ({
      ...prev,
      Status:
        newStatus === "BUY"
          ? "APPROVED"
          : newStatus === "RENT"
            ? "RENTED"
            : undefined,
      Page: 1,
    }));
  };

  // Beds dropdown
  const handleBedChange = (event: SelectChangeEvent<string>) => {
    const value = event.target.value;
    setBedSelection(value);
    if (value === "All") {
      setFilters((prev) => ({
        ...prev,
        MinBedrooms: undefined,
        MaxBedrooms: undefined,
        Page: 1,
      }));
    } else if (value === "10+") {
      setFilters((prev) => ({
        ...prev,
        MinBedrooms: 10,
        MaxBedrooms: undefined,
        Page: 1,
      }));
    } else {
      const num = parseInt(value, 10);
      setFilters((prev) => ({
        ...prev,
        MinBedrooms: num,
        MaxBedrooms: num,
        Page: 1,
      }));
    }
  };

  // Area filter: convert UI units to sqft and store in filters
  const applyAreaFilter = (minStr: string, maxStr: string) => {
    const min = parseFloat(minStr) || undefined;
    const max = parseFloat(maxStr) || undefined;
    setFilters((prev) => ({
      ...prev,
      MinAreaSize: min !== undefined ? min * areaFactor : undefined,
      MaxAreaSize: max !== undefined ? max * areaFactor : undefined,
      Page: 1,
    }));
  };

  // Price filter
  const applyPriceFilter = (min?: number, max?: number) => {
    setFilters((prev) => ({
      ...prev,
      MinPrice: min !== undefined ? min : undefined,
      MaxPrice: max !== undefined ? max : undefined,
      Page: 1,
    }));
  };

  // Location filter (multi‑select)
  const updateLocationFilter = (locs: string[]) => {
    setSelectedLocations(locs);
    handleChange("Address", locs.join(", "));
  };

  // Fetch location suggestions when city changes
  useEffect(() => {
    if (!filters.City) {
      setLocationOptions([]);
      return;
    }
    const fetchLocations = async () => {
      try {
        const res = await api.get("/api/Property/locations", {
          params: { city: filters.City },
        });
        setLocationOptions(res.data);
      } catch (err) {
        console.error("Failed to fetch locations", err);
      }
    };
    fetchLocations();
  }, [filters.City]);

  // Currency display
  const formatPrice = (price: number) => {
    const rate = currencyUI === "USD" ? 0.0036 : 1;
    const symbol = currencyUI === "USD" ? "$" : "PKR";
    const converted = price * rate;
    if (converted >= 10000000)
      return `${symbol} ${(converted / 10000000).toFixed(1)}Cr`;
    if (converted >= 100000)
      return `${symbol} ${(converted / 100000).toFixed(1)}L`;
    return `${symbol} ${converted.toLocaleString()}`;
  };

  // Client‑side filtering
  const displayItems = useMemo(() => {
    if (!data?.items) return [];
    if (!clientTypeFilter) return data.items;
    return data.items.filter((p) => p.propertyType === clientTypeFilter);
  }, [data, clientTypeFilter]);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      {/* Hero Section */}
      <Box
        sx={{
          background: "linear-gradient(135deg, #1a3b5d 0%, #0f2640 100%)",
          color: "white",
          pt: { xs: 12, md: 14 },
          pb: { xs: 6, md: 8 },
          position: "relative",
          overflow: "hidden",
        }}
      >
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
              fontWeight: 800,
              fontSize: { xs: "2rem", md: "3rem" },
              textAlign: "center",
              mb: 2,
            }}
          >
            Find Your Dream Property
          </Typography>
          <Typography
            variant="h6"
            sx={{
              opacity: 0.9,
              maxWidth: 600,
              mx: "auto",
              mb: 4,
              textAlign: "center",
            }}
          >
            Search thousands of properties for sale and rent across Pakistan
          </Typography>

          {/* Main Search Bar */}
          <Paper
            elevation={6}
            sx={{ p: 2, borderRadius: 4, maxWidth: 900, mx: "auto" }}
          >
            <Box sx={{ mb: 2 }}>
              <ToggleButtonGroup
                value={
                  filters.Status === "APPROVED"
                    ? "BUY"
                    : filters.Status === "RENTED"
                      ? "RENT"
                      : null
                }
                exclusive
                onChange={handleBuyRent}
                size="small"
              >
                <ToggleButton value="BUY" sx={{ textTransform: "none", px: 3 }}>
                  Buy
                </ToggleButton>
                <ToggleButton
                  value="RENT"
                  sx={{ textTransform: "none", px: 3 }}
                >
                  Rent
                </ToggleButton>
              </ToggleButtonGroup>
            </Box>

            <Grid container spacing={2} alignItems="center">
              <Grid size={{ xs: 12, sm: 6, md: 2.5 }}>
                <Autocomplete
                  freeSolo
                  options={CITIES}
                  value={filters.City || ""}
                  onInputChange={(_, newValue) =>
                    handleChange("City", newValue)
                  }
                  renderInput={(params) => (
                    <TextField {...params} label="City" size="small" />
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Autocomplete
                  multiple
                  options={locationOptions}
                  value={selectedLocations}
                  onChange={(_, newValue) => updateLocationFilter(newValue)}
                  renderInput={(params) => (
                    <TextField {...params} label="Location" size="small" />
                  )}
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => (
                      <Chip
                        variant="outlined"
                        label={option}
                        size="small"
                        {...getTagProps({ index })}
                        key={index}
                      />
                    ))
                  }
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 2.5 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Type</InputLabel>
                  <Select
                    value={filters.PropertyType || ""}
                    label="Type"
                    onChange={(e) =>
                      handleChange("PropertyType", e.target.value || undefined)
                    }
                  >
                    <MenuItem value="">All</MenuItem>
                    <MenuItem value="HOUSE">House</MenuItem>
                    <MenuItem value="FLAT">Flat</MenuItem>
                    <MenuItem value="COMMERCIAL">Commercial</MenuItem>
                    <MenuItem value="SHOP">Shop</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  onClick={handleSearch}
                  sx={{
                    backgroundColor: "#f59e0b",
                    "&:hover": { backgroundColor: "#d97706" },
                    borderRadius: 2,
                    textTransform: "none",
                    fontWeight: 600,
                  }}
                >
                  Find
                </Button>
              </Grid>

              <Grid
                size={{ xs: 12, md: 2 }}
                sx={{ textAlign: { xs: "left", md: "right" } }}
              >
                <Button
                  size="small"
                  variant="text"
                  startIcon={<TuneIcon />}
                  onClick={() => setShowMoreOptions(!showMoreOptions)}
                  sx={{ textTransform: "none" }}
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
                <Grid container spacing={2}>
                  {/* Price Range */}
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Typography
                      variant="body2"
                      sx={{ mb: 0.5, fontWeight: 500 }}
                    >
                      Price Range ({currencyUI})
                    </Typography>
                    <Slider
                      value={[priceMin || 0, priceMax || 500000000]}
                      onChange={(_, newVal) => {
                        const [min, max] = newVal as number[];
                        setPriceMin(min);
                        setPriceMax(max);
                        applyPriceFilter(
                          min === 0 ? undefined : min,
                          max === 500000000 ? undefined : max,
                        );
                      }}
                      min={0}
                      max={500000000}
                      step={1000000}
                      valueLabelDisplay="auto"
                      valueLabelFormat={(v) => `${(v / 10000000).toFixed(1)}Cr`}
                    />
                    <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
                      <TextField
                        size="small"
                        label="Min"
                        type="number"
                        value={priceMin ?? ""}
                        onChange={(e) => {
                          const val = e.target.value
                            ? Number(e.target.value)
                            : undefined;
                          setPriceMin(val);
                          applyPriceFilter(val, priceMax);
                        }}
                      />
                      <TextField
                        size="small"
                        label="Max"
                        type="number"
                        value={priceMax ?? ""}
                        onChange={(e) => {
                          const val = e.target.value
                            ? Number(e.target.value)
                            : undefined;
                          setPriceMax(val);
                          applyPriceFilter(priceMin, val);
                        }}
                      />
                    </Box>
                  </Grid>

                  {/* Area Range */}
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Typography
                      variant="body2"
                      sx={{ mb: 0.5, fontWeight: 500 }}
                    >
                      Area (
                      {areaUnits.find((u) => u.value === areaUnitUI)?.label})
                    </Typography>
                    <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                      <TextField
                        size="small"
                        label="Min"
                        type="number"
                        placeholder="0"
                        value={areaMinInput}
                        onChange={(e) => {
                          setAreaMinInput(e.target.value);
                          applyAreaFilter(e.target.value, areaMaxInput);
                        }}
                      />
                      <TextField
                        size="small"
                        label="Max"
                        type="number"
                        placeholder="Any"
                        value={areaMaxInput}
                        onChange={(e) => {
                          setAreaMaxInput(e.target.value);
                          applyAreaFilter(areaMinInput, e.target.value);
                        }}
                      />
                      <Button
                        size="small"
                        variant="text"
                        onClick={() => setAreaUnitModalOpen(true)}
                        sx={{ minWidth: "auto", textTransform: "none" }}
                      >
                        Unit
                      </Button>
                    </Box>
                  </Grid>

                  {/* Beds & Search Term */}
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Beds</InputLabel>
                      <Select
                        value={bedSelection}
                        label="Beds"
                        onChange={handleBedChange}
                      >
                        {bedOptions.map((opt) => (
                          <MenuItem key={opt} value={opt}>
                            {opt}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="Keyword"
                      size="small"
                      value={filters.SearchTerm || ""}
                      onChange={(e) =>
                        handleChange("SearchTerm", e.target.value)
                      }
                      InputProps={{
                        startAdornment: (
                          <SearchIcon color="action" sx={{ mr: 0.5 }} />
                        ),
                      }}
                    />
                  </Grid>

                  {/* Action buttons */}
                  <Grid size={{ xs: 12 }}>
                    <Stack
                      direction="row"
                      spacing={1}
                      justifyContent="flex-end"
                    >
                      <Button
                        size="small"
                        sx={{ textTransform: "none" }}
                        onClick={() => setCurrencyModalOpen(true)}
                      >
                        Change Currency
                      </Button>
                      <Button
                        size="small"
                        sx={{ textTransform: "none" }}
                        onClick={() => setAreaUnitModalOpen(true)}
                      >
                        Change Area Unit
                      </Button>
                      <Button
                        size="small"
                        sx={{ textTransform: "none" }}
                        onClick={handleReset}
                      >
                        Reset
                      </Button>
                    </Stack>
                  </Grid>
                </Grid>
              </Box>
            </Collapse>
          </Paper>
        </Container>
      </Box>

      {/* Results summary & quick type filters */}
      <Container maxWidth="lg" sx={{ mt: 4, mb: 2 }}>
        {data && !loading && (
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 2,
            }}
          >
            <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
              {displayItems.length} properties found
            </Typography>
            <Stack direction="row" spacing={1}>
              <Chip
                label="All"
                variant={clientTypeFilter === null ? "filled" : "outlined"}
                color={clientTypeFilter === null ? "primary" : "default"}
                onClick={() => setClientTypeFilter(null)}
                clickable
              />
              {propertyTypeOptions.map((type) => (
                <Chip
                  key={type}
                  label={
                    type === "HOUSE"
                      ? "House"
                      : type === "FLAT"
                        ? "Flat"
                        : type === "COMMERCIAL"
                          ? "Commercial"
                          : "Shop"
                  }
                  variant={clientTypeFilter === type ? "filled" : "outlined"}
                  color={clientTypeFilter === type ? "primary" : "default"}
                  onClick={() =>
                    setClientTypeFilter(type === clientTypeFilter ? null : type)
                  }
                  clickable
                />
              ))}
            </Stack>
          </Box>
        )}
      </Container>

      {/* Property Listings */}
      <Container maxWidth="lg" sx={{ mb: 6 }}>
        {loading ? (
          <Grid container spacing={4}>
            {Array.from(new Array(6)).map((_, idx) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={idx}>
                <PropertyCardSkeleton />
              </Grid>
            ))}
          </Grid>
        ) : error ? (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        ) : displayItems.length === 0 ? (
          <Typography
            sx={{ textAlign: "center", color: "text.secondary", py: 8 }}
          >
            No properties found. Try adjusting your filters.
          </Typography>
        ) : (
          <>
            <Grid container spacing={4}>
              {displayItems.map((property) => (
                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={property.id}>
                  <PropertyCard property={property} formatPrice={formatPrice} />
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
          </>
        )}
      </Container>

      {/* Testimonials */}
      <Box sx={{ backgroundColor: "#f8fafc", py: 8 }}>
        <Container maxWidth="lg">
          <Typography
            variant="h4"
            sx={{ textAlign: "center", fontWeight: 700, mb: 1 }}
          >
            What Our Clients Say
          </Typography>
          <Typography
            variant="subtitle1"
            sx={{ textAlign: "center", color: "text.secondary", mb: 6 }}
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
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {testimonial.name}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "text.secondary" }}>
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
                    sx={{ fontStyle: "italic", mt: 1, color: "text.primary" }}
                  >
                    &ldquo;{testimonial.quote}&rdquo;
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Currency Modal */}
      <Dialog
        open={currencyModalOpen}
        onClose={() => setCurrencyModalOpen(false)}
      >
        <DialogTitle>Select Currency</DialogTitle>
        <DialogContent>
          <FormControl fullWidth size="small">
            <InputLabel>Currency</InputLabel>
            <Select
              value={currencyUI}
              label="Currency"
              onChange={(e) => {
                setCurrencyUI(e.target.value as any);
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
          <FormControl fullWidth size="small">
            <InputLabel>Area Unit</InputLabel>
            <Select
              value={areaUnitUI}
              label="Area Unit"
              onChange={(e) => {
                setAreaUnitUI(e.target.value);
                applyAreaFilter(areaMinInput, areaMaxInput);
                setAreaUnitModalOpen(false);
              }}
            >
              {areaUnits.map((unit) => (
                <MenuItem key={unit.value} value={unit.value}>
                  {unit.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAreaUnitModalOpen(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
