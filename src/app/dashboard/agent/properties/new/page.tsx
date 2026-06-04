"use client";

import { useState } from "react";
import {
  Container,
  Typography,
  Box,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Snackbar,
  Alert,
  CircularProgress,
  IconButton,
  ImageList,
  ImageListItem,
  LinearProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Checkbox,
  FormControlLabel,
  InputAdornment,
  Divider,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import DeleteIcon from "@mui/icons-material/Delete";
import { useRouter } from "next/navigation";
import api from "@/lib/axios";
import { CreatePropertyRequest } from "@/lib/types";
import Image from "next/image";

const propertyTypeOptions = ["HOUSE", "FLAT", "COMMERCIAL", "SHOP"];
const propertyPurposeOptions = ["BUY", "RENT"];
const areaUnitOptions = ["MARLA", "KANAL", "SQUARE_FEET"];

const CLOUDINARY_CLOUD_NAME = "dkkgqafqw";
const CLOUDINARY_UPLOAD_PRESET = "your-social";

const MAX_FILES = 5;
const MAX_FILE_SIZE_MB = 2;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

// Conversion factors to square feet
const areaUnitToSqFt: Record<string, number> = {
  MARLA: 272.25,
  KANAL: 272.25 * 20, // 1 Kanal = 20 Marla = 5445 sq ft
  SQUARE_FEET: 1,
};

// Initial amenities structure
const initialAmenities: Record<string, any> = {
  // Main Features
  builtInYear: "",
  parkingSpaces: "",
  lobbyInBuilding: false,
  doubleGlazedWindows: false,
  centralAirConditioning: false,
  centralHeating: false,
  flooring: "",
  electricityBackup: false,
  wasteDisposal: false,
  floor: "",
  floorsInBuilding: "",
  elevators: "",
  serviceElevatorsInBuilding: false,
  otherMainFeatures: false,
  furnished: false,
  // Rooms
  rooms: "",
  servantQuarters: "",
  otherRooms: false,
  // Business and Communication
  broadbandInternetAccess: false,
  satelliteOrCableTVReady: false,
  businessCenterOrMediaRoom: false,
  conferenceRoom: false,
  intercom: false,
  atmMachines: false,
  otherBusinessFacilities: false,
  // Community Features
  communityLawnOrGarden: false,
  communitySwimmingPool: false,
  communityGym: false,
  firstAidOrMedicalCentre: false,
  dayCareCentre: false,
  kidsPlayArea: false,
  barbequeArea: false,
  mosque: false,
  communityCentre: false,
  otherCommunityFacilities: false,
  // Healthcare Recreational
  lawnOrGarden: false,
  otherHealthcareRecreation: false,
  // Nearby Locations
  nearbySchools: false,
  nearbyHospitals: false,
  nearbyShoppingMalls: false,
  nearbyRestaurants: false,
  distanceFromAirportKm: "",
  nearbyPublicTransport: false,
  otherNearbyPlaces: false,
  // Other Facilities
  maintenanceStaff: false,
  securityStaff: false,
  facilitiesForDisabled: false,
  petsAllowed: false,
  otherFacilities: false,
};

export default function AddPropertyPage() {
  const router = useRouter();

  const [form, setForm] = useState<Partial<CreatePropertyRequest>>({
    title: "",
    description: "",
    price: 0,
    city: "",
    address: "",
    propertyPics: [],
    bedrooms: 0,
    bathrooms: 0,
    propertyType: "HOUSE",
    propertyPurpose: "BUY",
    location: "",
    latitude: 0,
    longitude: 0,
    amenities: { ...initialAmenities },
  });

  const [areaSizeRaw, setAreaSizeRaw] = useState<number>(0);
  const [areaUnit, setAreaUnit] = useState<string>("MARLA");

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({ open: false, message: "", severity: "success" });

  const handleCloseSnackbar = () =>
    setSnackbar((prev) => ({ ...prev, open: false }));

  const handleChange = (field: keyof CreatePropertyRequest, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleAmenityChange = (key: string, value: any) => {
    setForm((prev) => ({
      ...prev,
      amenities: { ...prev.amenities, [key]: value },
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    if (uploadedUrls.length >= MAX_FILES) {
      setSnackbar({
        open: true,
        message: `You can only upload a maximum of ${MAX_FILES} images.`,
        severity: "error",
      });
      e.target.value = "";
      return;
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      setSnackbar({
        open: true,
        message: `File "${file.name}" exceeds ${MAX_FILE_SIZE_MB}MB.`,
        severity: "error",
      });
      e.target.value = "";
      return;
    }
    setSelectedFile(file);
  };

  const uploadFileToCloudinary = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      { method: "POST", body: formData },
    );
    if (!res.ok) throw new Error("Upload failed");
    const data = await res.json();
    return data.secure_url;
  };

  const uploadCurrentFile = async () => {
    if (!selectedFile) return;
    setUploading(true);
    setUploadProgress(0);
    try {
      setUploadProgress(30);
      const url = await uploadFileToCloudinary(selectedFile);
      setUploadProgress(100);
      setUploadedUrls((prev) => [...prev, url]);
      setSelectedFile(null);
      const input = document.querySelector(
        'input[type="file"]',
      ) as HTMLInputElement;
      if (input) input.value = "";
    } catch (err) {
      setSnackbar({
        open: true,
        message: "Image upload failed.",
        severity: "error",
      });
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const removeImage = (index: number) => {
    setUploadedUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Convert area to square feet
    const convertedAreaSqFt = areaSizeRaw * areaUnitToSqFt[areaUnit];

    const payload: CreatePropertyRequest = {
      title: form.title!,
      description: form.description!,
      price: form.price!,
      city: form.city!,
      address: form.address!,
      location: form.location!,
      latitude: form.latitude!,
      longitude: form.longitude!,
      bedrooms: form.bedrooms!,
      bathrooms: form.bathrooms!,
      areaSize: convertedAreaSqFt, // calculated from areaSizeRaw and areaUnit
      propertyType: form.propertyType!,
      propertyPurpose: form.propertyPurpose!,
      propertyPics: uploadedUrls,
      amenities: form.amenities!,
    };

    try {
      await api.post("/api/Property", payload);
      setSnackbar({
        open: true,
        message: "Property created successfully!",
        severity: "success",
      });
      setTimeout(() => {
        router.push("/dashboard/agent/properties");
      }, 1500);
    } catch (err: any) {
      const msg = err.response?.data?.message || "Failed to create property";
      setSnackbar({ open: true, message: msg, severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  // Helper to render amenities sections
  const renderAmenities = () => (
    <Box sx={{ mt: 3 }}>
      <Typography variant="h6" gutterBottom>
        Amenities
      </Typography>
      {/* Main Features */}
      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="subtitle1">Main Features</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Built in year"
                type="number"
                fullWidth
                value={form.amenities?.builtInYear || ""}
                onChange={(e) =>
                  handleAmenityChange("builtInYear", e.target.value)
                }
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Parking Spaces"
                type="number"
                fullWidth
                value={form.amenities?.parkingSpaces || ""}
                onChange={(e) =>
                  handleAmenityChange("parkingSpaces", e.target.value)
                }
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={!!form.amenities?.lobbyInBuilding}
                    onChange={(e) =>
                      handleAmenityChange("lobbyInBuilding", e.target.checked)
                    }
                  />
                }
                label="Lobby in Building"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={!!form.amenities?.doubleGlazedWindows}
                    onChange={(e) =>
                      handleAmenityChange(
                        "doubleGlazedWindows",
                        e.target.checked,
                      )
                    }
                  />
                }
                label="Double Glazed Windows"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={!!form.amenities?.centralAirConditioning}
                    onChange={(e) =>
                      handleAmenityChange(
                        "centralAirConditioning",
                        e.target.checked,
                      )
                    }
                  />
                }
                label="Central Air Conditioning"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={!!form.amenities?.centralHeating}
                    onChange={(e) =>
                      handleAmenityChange("centralHeating", e.target.checked)
                    }
                  />
                }
                label="Central Heating"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Flooring (type)"
                fullWidth
                value={form.amenities?.flooring || ""}
                onChange={(e) =>
                  handleAmenityChange("flooring", e.target.value)
                }
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={!!form.amenities?.electricityBackup}
                    onChange={(e) =>
                      handleAmenityChange("electricityBackup", e.target.checked)
                    }
                  />
                }
                label="Electricity Backup"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={!!form.amenities?.wasteDisposal}
                    onChange={(e) =>
                      handleAmenityChange("wasteDisposal", e.target.checked)
                    }
                  />
                }
                label="Waste Disposal"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Floor (e.g., 2)"
                type="number"
                fullWidth
                value={form.amenities?.floor || ""}
                onChange={(e) => handleAmenityChange("floor", e.target.value)}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Floors in Building"
                type="number"
                fullWidth
                value={form.amenities?.floorsInBuilding || ""}
                onChange={(e) =>
                  handleAmenityChange("floorsInBuilding", e.target.value)
                }
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Elevators"
                type="number"
                fullWidth
                value={form.amenities?.elevators || ""}
                onChange={(e) =>
                  handleAmenityChange("elevators", e.target.value)
                }
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={!!form.amenities?.serviceElevatorsInBuilding}
                    onChange={(e) =>
                      handleAmenityChange(
                        "serviceElevatorsInBuilding",
                        e.target.checked,
                      )
                    }
                  />
                }
                label="Service Elevators in Building"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={!!form.amenities?.otherMainFeatures}
                    onChange={(e) =>
                      handleAmenityChange("otherMainFeatures", e.target.checked)
                    }
                  />
                }
                label="Other Main Features"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={!!form.amenities?.furnished}
                    onChange={(e) =>
                      handleAmenityChange("furnished", e.target.checked)
                    }
                  />
                }
                label="Furnished"
              />
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* Rooms */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="subtitle1">Rooms</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Rooms (total)"
                type="number"
                fullWidth
                value={form.amenities?.rooms || ""}
                onChange={(e) => handleAmenityChange("rooms", e.target.value)}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Servant Quarters"
                type="number"
                fullWidth
                value={form.amenities?.servantQuarters || ""}
                onChange={(e) =>
                  handleAmenityChange("servantQuarters", e.target.value)
                }
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={!!form.amenities?.otherRooms}
                    onChange={(e) =>
                      handleAmenityChange("otherRooms", e.target.checked)
                    }
                  />
                }
                label="Other Rooms"
              />
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* Business and Communication */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="subtitle1">
            Business and Communication
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={!!form.amenities?.broadbandInternetAccess}
                    onChange={(e) =>
                      handleAmenityChange(
                        "broadbandInternetAccess",
                        e.target.checked,
                      )
                    }
                  />
                }
                label="Broadband Internet Access"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={!!form.amenities?.satelliteOrCableTVReady}
                    onChange={(e) =>
                      handleAmenityChange(
                        "satelliteOrCableTVReady",
                        e.target.checked,
                      )
                    }
                  />
                }
                label="Satellite or Cable TV Ready"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={!!form.amenities?.businessCenterOrMediaRoom}
                    onChange={(e) =>
                      handleAmenityChange(
                        "businessCenterOrMediaRoom",
                        e.target.checked,
                      )
                    }
                  />
                }
                label="Business Center or Media Room"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={!!form.amenities?.conferenceRoom}
                    onChange={(e) =>
                      handleAmenityChange("conferenceRoom", e.target.checked)
                    }
                  />
                }
                label="Conference Room"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={!!form.amenities?.intercom}
                    onChange={(e) =>
                      handleAmenityChange("intercom", e.target.checked)
                    }
                  />
                }
                label="Intercom"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={!!form.amenities?.atmMachines}
                    onChange={(e) =>
                      handleAmenityChange("atmMachines", e.target.checked)
                    }
                  />
                }
                label="ATM Machines"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={!!form.amenities?.otherBusinessFacilities}
                    onChange={(e) =>
                      handleAmenityChange(
                        "otherBusinessFacilities",
                        e.target.checked,
                      )
                    }
                  />
                }
                label="Other Business Facilities"
              />
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* Community Features */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="subtitle1">Community Features</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2}>
            {[
              "communityLawnOrGarden",
              "communitySwimmingPool",
              "communityGym",
              "firstAidOrMedicalCentre",
              "dayCareCentre",
              "kidsPlayArea",
              "barbequeArea",
              "mosque",
              "communityCentre",
              "otherCommunityFacilities",
            ].map((key) => (
              <Grid size={{ xs: 12, sm: 6 }} key={key}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={!!form.amenities?.[key]}
                      onChange={(e) =>
                        handleAmenityChange(key, e.target.checked)
                      }
                    />
                  }
                  label={key
                    .replace(/([A-Z])/g, " $1")
                    .replace(/^./, (str) => str.toUpperCase())}
                />
              </Grid>
            ))}
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* Healthcare Recreational */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="subtitle1">Healthcare & Recreational</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={!!form.amenities?.lawnOrGarden}
                    onChange={(e) =>
                      handleAmenityChange("lawnOrGarden", e.target.checked)
                    }
                  />
                }
                label="Lawn or Garden"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={!!form.amenities?.otherHealthcareRecreation}
                    onChange={(e) =>
                      handleAmenityChange(
                        "otherHealthcareRecreation",
                        e.target.checked,
                      )
                    }
                  />
                }
                label="Other Healthcare/Recreation"
              />
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* Nearby Locations */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="subtitle1">
            Nearby Locations & Facilities
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2}>
            {[
              "nearbySchools",
              "nearbyHospitals",
              "nearbyShoppingMalls",
              "nearbyRestaurants",
              "nearbyPublicTransport",
              "otherNearbyPlaces",
            ].map((key) => (
              <Grid size={{ xs: 12, sm: 6 }} key={key}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={!!form.amenities?.[key]}
                      onChange={(e) =>
                        handleAmenityChange(key, e.target.checked)
                      }
                    />
                  }
                  label={key
                    .replace(/([A-Z])/g, " $1")
                    .replace(/^./, (str) => str.toUpperCase())}
                />
              </Grid>
            ))}
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Distance From Airport (kms)"
                type="number"
                fullWidth
                value={form.amenities?.distanceFromAirportKm || ""}
                onChange={(e) =>
                  handleAmenityChange("distanceFromAirportKm", e.target.value)
                }
              />
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* Other Facilities */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="subtitle1">Other Facilities</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2}>
            {[
              "maintenanceStaff",
              "securityStaff",
              "facilitiesForDisabled",
              "petsAllowed",
              "otherFacilities",
            ].map((key) => (
              <Grid size={{ xs: 12, sm: 6 }} key={key}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={!!form.amenities?.[key]}
                      onChange={(e) =>
                        handleAmenityChange(key, e.target.checked)
                      }
                    />
                  }
                  label={key
                    .replace(/([A-Z])/g, " $1")
                    .replace(/^./, (str) => str.toUpperCase())}
                />
              </Grid>
            ))}
          </Grid>
        </AccordionDetails>
      </Accordion>
    </Box>
  );

  return (
    <Container maxWidth="md">
      <Typography variant="h4" gutterBottom>
        Add New Property
      </Typography>
      <Box component="form" onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          {/* Existing fields ... (keep all previous text fields) */}
          <Grid size={{ xs: 12 }}>
            <TextField
              label="Title"
              required
              fullWidth
              value={form.title}
              onChange={(e) => handleChange("title", e.target.value)}
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <TextField
              label="Description"
              required
              fullWidth
              multiline
              rows={4}
              value={form.description}
              onChange={(e) => handleChange("description", e.target.value)}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Price (PKR)"
              type="number"
              required
              fullWidth
              value={form.price || ""}
              onChange={(e) => handleChange("price", Number(e.target.value))}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="City"
              required
              fullWidth
              value={form.city}
              onChange={(e) => handleChange("city", e.target.value)}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Address"
              required
              fullWidth
              value={form.address}
              onChange={(e) => handleChange("address", e.target.value)}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Location (e.g., DHA Phase 7 Block U)"
              fullWidth
              value={form.location || ""}
              onChange={(e) => handleChange("location", e.target.value)}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Bedrooms"
              type="number"
              fullWidth
              value={form.bedrooms ?? ""}
              onChange={(e) => handleChange("bedrooms", Number(e.target.value))}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Bathrooms"
              type="number"
              fullWidth
              value={form.bathrooms ?? ""}
              onChange={(e) =>
                handleChange("bathrooms", Number(e.target.value))
              }
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Area Size"
              type="number"
              required
              fullWidth
              value={areaSizeRaw || ""}
              onChange={(e) => setAreaSizeRaw(Number(e.target.value))}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormControl fullWidth>
              <InputLabel>Area Unit</InputLabel>
              <Select
                value={areaUnit}
                label="Area Unit"
                onChange={(e) => setAreaUnit(e.target.value)}
              >
                {areaUnitOptions.map((unit) => (
                  <MenuItem key={unit} value={unit}>
                    {unit}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormControl fullWidth>
              <InputLabel>Property Type</InputLabel>
              <Select
                value={form.propertyType}
                label="Property Type"
                onChange={(e) => handleChange("propertyType", e.target.value)}
              >
                {propertyTypeOptions.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormControl fullWidth>
              <InputLabel>Property Purpose</InputLabel>
              <Select
                value={form.propertyPurpose}
                label="Property Purpose"
                onChange={(e) =>
                  handleChange("propertyPurpose", e.target.value)
                }
              >
                {propertyPurposeOptions.map((purpose) => (
                  <MenuItem key={purpose} value={purpose}>
                    {purpose}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Latitude & Longitude */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Latitude"
              type="number"
              required
              fullWidth
              value={form.latitude ?? ""}
              onChange={(e) =>
                handleChange("latitude", parseFloat(e.target.value))
              }
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Longitude"
              type="number"
              required
              fullWidth
              value={form.longitude ?? ""}
              onChange={(e) =>
                handleChange("longitude", parseFloat(e.target.value))
              }
            />
          </Grid>

          {/* Image upload section (unchanged) */}
          <Grid size={{ xs: 12 }}>
            <Typography variant="subtitle1" gutterBottom>
              Property Images ({uploadedUrls.length}/{MAX_FILES})
            </Typography>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                flexWrap: "wrap",
              }}
            >
              <Button variant="outlined" component="label" disabled={uploading}>
                Select Image
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handleFileChange}
                  disabled={uploading}
                />
              </Button>
              {selectedFile && !uploading && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Typography variant="body2">{selectedFile.name}</Typography>
                  <Button
                    size="small"
                    variant="contained"
                    onClick={uploadCurrentFile}
                  >
                    Upload
                  </Button>
                  <Button size="small" onClick={() => setSelectedFile(null)}>
                    Cancel
                  </Button>
                </Box>
              )}
              {uploading && (
                <Box sx={{ width: "200px" }}>
                  <LinearProgress
                    variant="determinate"
                    value={uploadProgress}
                  />
                  <Typography variant="caption">Uploading...</Typography>
                </Box>
              )}
            </Box>
            {uploadedUrls.length > 0 && (
              <ImageList sx={{ mt: 2 }} cols={3} rowHeight={164}>
                {uploadedUrls.map((url, index) => (
                  <ImageListItem key={index}>
                    <Image
                      src={url}
                      alt={`Upload ${index + 1}`}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                    <IconButton
                      sx={{
                        position: "absolute",
                        top: 2,
                        right: 2,
                        backgroundColor: "rgba(255,255,255,0.8)",
                      }}
                      size="small"
                      onClick={() => removeImage(index)}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </ImageListItem>
                ))}
              </ImageList>
            )}
          </Grid>

          {/* Amenities Section */}
          <Grid size={{ xs: 12 }}>{renderAmenities()}</Grid>
        </Grid>

        <Box sx={{ mt: 4, display: "flex", gap: 2 }}>
          <Button
            variant="contained"
            type="submit"
            disabled={loading || uploading}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            {loading ? "Creating..." : "Create Property"}
          </Button>
          <Button variant="outlined" onClick={() => router.back()}>
            Cancel
          </Button>
        </Box>
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}
