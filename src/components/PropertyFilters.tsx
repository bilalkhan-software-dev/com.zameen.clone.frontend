"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Grid,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Slider,
  Typography,
  Paper,
  InputAdornment,
  Autocomplete,
  Chip,
  Collapse,
  Stack,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import TuneIcon from "@mui/icons-material/Tune";
import api from "@/lib/axios";

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
  { value: "SQUARE_FEET", label: "Sq. Ft.", factor: 1 },
  { value: "MARLA", label: "Marla", factor: 272.25 },
  { value: "KANAL", label: "Kanal", factor: 5445 },
];

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
const PROPERTY_TYPES = ["HOUSE", "FLAT", "COMMERCIAL", "SHOP"];

const MAX_PRICE = 500_000_000; // 50 Crore

export interface FilterState {
  city: string | null;
  locations: string[];
  propertyType: string | null;
  propertyPurpose: "BUY" | "RENT" | null;
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
}

interface PropertyFiltersProps {
  initialFilters?: Partial<FilterState>;
  onFilterChange: (filters: FilterState) => void;
  showResultsSummary?: boolean;
  totalCount?: number;
}

export default function PropertyFilters({
  initialFilters,
  onFilterChange,
  showResultsSummary = false,
  totalCount = 0,
}: PropertyFiltersProps) {
  const [localCity, setLocalCity] = useState<string | null>(
    initialFilters?.city || "Gujranwala",
  );
  const [localLocations, setLocalLocations] = useState<string[]>(
    initialFilters?.locations || [],
  );
  const [localPropertyType, setLocalPropertyType] = useState<string | null>(
    initialFilters?.propertyType || "HOUSE",
  );
  const [localPropertyPurpose, setLocalPropertyPurpose] = useState<
    "BUY" | "RENT" | null
  >(initialFilters?.propertyPurpose || "BUY");
  const [localPriceMin, setLocalPriceMin] = useState<number>(
    initialFilters?.priceMin ?? 0,
  );
  const [localPriceMax, setLocalPriceMax] = useState<number>(
    initialFilters?.priceMax ?? MAX_PRICE,
  );
  const [localAreaMin, setLocalAreaMin] = useState<number>(
    initialFilters?.areaMin ?? 0,
  );
  const [localAreaMax, setLocalAreaMax] = useState<number>(
    initialFilters?.areaMax ?? 10000,
  );
  const [localAreaUnit, setLocalAreaUnit] = useState<string>(
    initialFilters?.areaUnit || "SQUARE_FEET",
  );
  const [localBeds, setLocalBeds] = useState<string>(
    initialFilters?.beds || "All",
  );
  const [localBaths, setLocalBaths] = useState<string>(
    initialFilters?.baths || "All",
  );
  const [localKeyword, setLocalKeyword] = useState<string>(
    initialFilters?.keyword || "",
  );
  const [localSortBy, setLocalSortBy] = useState<string>(
    initialFilters?.sortBy || "CreatedAt",
  );
  const [localIsDescending, setLocalIsDescending] = useState<boolean>(
    initialFilters?.isDescending ?? true,
  );
  const [showMoreOptions, setShowMoreOptions] = useState(false);

  // Location suggestions
  const [locationInput, setLocationInput] = useState("");
  const [locationOptions, setLocationOptions] = useState<string[]>([]);

  // Fetch location suggestions
  useEffect(() => {
    if (!localCity || !locationInput) {
      setLocationOptions([]);
      return;
    }
    const fetchLocations = async () => {
      try {
        const res = await api.get("/api/Property/locations", {
          params: {
            city: localCity,
            searchTerm: locationInput,
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
  }, [localCity, locationInput]);

  // Emit filter changes to parent whenever any local state changes
  useEffect(() => {
    onFilterChange({
      city: localCity,
      locations: localLocations,
      propertyType: localPropertyType,
      propertyPurpose: localPropertyPurpose,
      priceMin: localPriceMin,
      priceMax: localPriceMax,
      areaMin: localAreaMin,
      areaMax: localAreaMax,
      areaUnit: localAreaUnit,
      beds: localBeds,
      baths: localBaths,
      keyword: localKeyword,
      sortBy: localSortBy,
      isDescending: localIsDescending,
    });
  }, [
    localCity,
    localLocations,
    localPropertyType,
    localPropertyPurpose,
    localPriceMin,
    localPriceMax,
    localAreaMin,
    localAreaMax,
    localAreaUnit,
    localBeds,
    localBaths,
    localKeyword,
    localSortBy,
    localIsDescending,
    onFilterChange,
  ]);

  const formatPrice = (value: number) => {
    if (value >= 10_000_000) return `${(value / 10_000_000).toFixed(1)}Cr`;
    if (value >= 100_000) return `${(value / 100_000).toFixed(1)}L`;
    return value.toLocaleString();
  };

  // Area conversion helpers
  const areaFactor =
    AREA_UNITS.find((u) => u.value === localAreaUnit)?.factor || 1;
  const areaSuffix =
    AREA_UNITS.find((u) => u.value === localAreaUnit)?.label || "Sq. Ft.";
  const displayAreaMin = localAreaMin;
  const displayAreaMax = localAreaMax;
  const setAreaMinValue = (val: number) => setLocalAreaMin(val);
  const setAreaMaxValue = (val: number) => setLocalAreaMax(val);

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: 4,
        background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
        border: "1px solid",
        borderColor: "divider",
      }}
    >
      {showResultsSummary && totalCount > 0 && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle1" fontWeight={500}>
            {totalCount} properties found
          </Typography>
        </Box>
      )}

      {/* Buy/Rent Toggle */}
      <Box sx={{ display: "flex", justifyContent: "center", mb: 3 }}>
        <Stack direction="row" spacing={2}>
          <Button
            variant={localPropertyPurpose === "BUY" ? "contained" : "outlined"}
            onClick={() => setLocalPropertyPurpose("BUY")}
            sx={{ textTransform: "none", px: 4 }}
          >
            Buy
          </Button>
          <Button
            variant={localPropertyPurpose === "RENT" ? "contained" : "outlined"}
            onClick={() => setLocalPropertyPurpose("RENT")}
            sx={{ textTransform: "none", px: 4 }}
          >
            Rent
          </Button>
        </Stack>
      </Box>

      {/* First Row: City, Location, Type, Sort (basic) */}
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid size={{ xs: 12, sm: 6, md: 2.5 }}>
          <Autocomplete
            freeSolo
            options={CITIES}
            value={localCity || ""}
            onInputChange={(_, newValue) => setLocalCity(newValue || null)}
            renderInput={(params) => (
              <TextField {...params} label="City" size="small" />
            )}
          />
        </Grid>
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
        <Grid size={{ xs: 12, sm: 6, md: 2 }}>
          <FormControl fullWidth size="small">
            <InputLabel>Property Type</InputLabel>
            <Select
              value={localPropertyType || "HOUSE"}
              label="Property Type"
              onChange={(e) => setLocalPropertyType(e.target.value as string)}
            >
              <MenuItem value="HOUSE">House</MenuItem>
              <MenuItem value="FLAT">Flat</MenuItem>
              <MenuItem value="COMMERCIAL">Commercial</MenuItem>
              <MenuItem value="SHOP">Shop</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 2.5 }}>
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
        <Grid size={{ xs: 12, md: 1.5 }}>
          <Button
            fullWidth
            variant="text"
            onClick={() => setLocalIsDescending(!localIsDescending)}
            sx={{ height: 40 }}
          >
            {localIsDescending ? "↓ Desc" : "↑ Asc"}
          </Button>
        </Grid>
        <Grid size={{ xs: 12, md: 1 }}>
          <Button
            fullWidth
            variant="outlined"
            size="small"
            sx={{ borderRadius: 2 }}
          >
            Apply
          </Button>
        </Grid>
      </Grid>

      {/* More Options Toggle */}
      <Box sx={{ textAlign: "right", mb: 1 }}>
        <Button
          size="small"
          variant="text"
          startIcon={<TuneIcon fontSize="small" />}
          onClick={() => setShowMoreOptions(!showMoreOptions)}
          sx={{ textTransform: "none", color: "#f59e0b" }}
        >
          {showMoreOptions ? "Less Options" : "More Options"}
        </Button>
      </Box>

      <Collapse in={showMoreOptions}>
        <Grid container spacing={3} sx={{ mt: 1 }}>
          {/* Price Slider */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="subtitle2" gutterBottom>
              Price Range (PKR)
            </Typography>
            <Slider
              value={[localPriceMin, localPriceMax]}
              onChange={(_, newVal) => {
                const [min, max] = newVal as number[];
                setLocalPriceMin(min);
                setLocalPriceMax(max);
              }}
              min={0}
              max={MAX_PRICE}
              step={1_000_000}
              valueLabelDisplay="auto"
              valueLabelFormat={formatPrice}
            />
            <Box sx={{ display: "flex", gap: 2, mt: 1 }}>
              <TextField
                label="Min Price"
                size="small"
                type="number"
                value={localPriceMin}
                onChange={(e) => setLocalPriceMin(Number(e.target.value))}
                fullWidth
              />
              <TextField
                label="Max Price"
                size="small"
                type="number"
                value={localPriceMax}
                onChange={(e) => setLocalPriceMax(Number(e.target.value))}
                fullWidth
              />
            </Box>
          </Grid>

          {/* Area Range */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="subtitle2" gutterBottom>
              Area ({areaSuffix})
            </Typography>
            <Box sx={{ display: "flex", gap: 2 }}>
              <TextField
                label="Min"
                size="small"
                type="number"
                value={displayAreaMin === 0 ? "" : displayAreaMin}
                onChange={(e) =>
                  setAreaMinValue(e.target.value ? Number(e.target.value) : 0)
                }
                fullWidth
              />
              <TextField
                label="Max"
                size="small"
                type="number"
                value={displayAreaMax === 10000 ? "" : displayAreaMax}
                onChange={(e) =>
                  setAreaMaxValue(
                    e.target.value ? Number(e.target.value) : 10000,
                  )
                }
                fullWidth
              />
              <FormControl size="small" sx={{ minWidth: 100 }}>
                <InputLabel>Unit</InputLabel>
                <Select
                  value={localAreaUnit}
                  label="Unit"
                  onChange={(e) => setLocalAreaUnit(e.target.value)}
                >
                  {AREA_UNITS.map((unit) => (
                    <MenuItem key={unit.value} value={unit.value}>
                      {unit.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </Grid>

          {/* Bedrooms & Bathrooms */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Bedrooms</InputLabel>
              <Select
                value={localBeds}
                label="Bedrooms"
                onChange={(e) => setLocalBeds(e.target.value)}
              >
                {BED_OPTIONS.map((opt) => (
                  <MenuItem key={opt} value={opt}>
                    {opt}
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
                {BATH_OPTIONS.map((opt) => (
                  <MenuItem key={opt} value={opt}>
                    {opt}
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
              value={localKeyword}
              onChange={(e) => setLocalKeyword(e.target.value)}
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
        </Grid>
      </Collapse>
    </Paper>
  );
}
