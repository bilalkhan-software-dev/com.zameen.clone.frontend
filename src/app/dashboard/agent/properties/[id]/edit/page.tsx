// app/dashboard/agent/properties/[id]/edit/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
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
  CircularProgress,
  Alert,
  Snackbar,
  Switch,
  FormControlLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Checkbox,
  Paper,
  Tooltip,
  IconButton,
  ImageList,
  ImageListItem,
  LinearProgress,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import DeleteIcon from "@mui/icons-material/Delete";
import InfoIcon from "@mui/icons-material/Info";
import api from "@/lib/axios";
import { PropertyResponse, UpdatePropertyRequest } from "@/lib/types";
import Image from "next/image";

// Constants (same as AddPropertyPage)
const propertyTypeOptions = [
  "HOUSE",
  "FLAT",
  "PLOT",
  "COMMERCIAL",
  "SHOP",
  "STUDIO",
  "FACTORY",
];
const propertyPurposeOptions = ["BUY", "RENT"];
const areaUnitOptions = ["MARLA", "KANAL", "SQUARE_FEET"];

const CLOUDINARY_CLOUD_NAME = "dkkgqafqw";
const CLOUDINARY_UPLOAD_PRESET = "your-social";

const MAX_FILES = 5;
const MAX_FILE_SIZE_MB = 2;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

const areaUnitToSqFt: Record<string, number> = {
  MARLA: 272.25,
  KANAL: 272.25 * 20,
  SQUARE_FEET: 1,
};

// Helper to convert sqft to a given unit
const sqftToUnit = (sqft: number, unit: string): number => {
  const factor = areaUnitToSqFt[unit];
  return factor ? sqft / factor : sqft;
};

// Initial amenities structure (same as add page)
const getEmptyAmenities = () => ({
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
  rooms: "",
  servantQuarters: "",
  otherRooms: false,
  broadbandInternetAccess: false,
  satelliteOrCableTVReady: false,
  businessCenterOrMediaRoom: false,
  conferenceRoom: false,
  intercom: false,
  atmMachines: false,
  otherBusinessFacilities: false,
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
  lawnOrGarden: false,
  otherHealthcareRecreation: false,
  nearbySchools: false,
  nearbyHospitals: false,
  nearbyShoppingMalls: false,
  nearbyRestaurants: false,
  distanceFromAirportKm: "",
  nearbyPublicTransport: false,
  otherNearbyPlaces: false,
  maintenanceStaff: false,
  securityStaff: false,
  facilitiesForDisabled: false,
  petsAllowed: false,
  otherFacilities: false,
});

export default function EditPropertyPage() {
  const { id } = useParams();
  const router = useRouter();

  const [original, setOriginal] = useState<PropertyResponse | null>(null);
  const [form, setForm] = useState<UpdatePropertyRequest>({});
  const [amenities, setAmenities] =
    useState<Record<string, any>>(getEmptyAmenities());
  const [propertyPics, setPropertyPics] = useState<string[]>([]);
  const [isActive, setIsActive] = useState<boolean>(true);

  // UI state for area unit conversion
  const [areaUnit, setAreaUnit] = useState<string>("MARLA");
  const [displayAreaSize, setDisplayAreaSize] = useState<number>(0);

  // Image upload state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({ open: false, message: "", severity: "success" });

  // Fetch existing property
  useEffect(() => {
    (async () => {
      try {
        const res = await api.get(`/api/Property/${id}`);
        const property: PropertyResponse = res.data.data;
        setOriginal(property);
        setIsActive(property.isActive);
        setPropertyPics(property.propertyPics || []);

        // Set basic fields
        setForm({
          title: property.title,
          description: property.description,
          price: property.price,
          city: property.city,
          address: property.address,
          location: property.location,
          bedrooms: property.bedrooms,
          bathrooms: property.bathrooms,
          propertyType: property.propertyType,
          propertyPurpose: property.propertyPurpose,
          latitude: property.latitude,
          longitude: property.longitude,
        });

        // Set amenities
        if (property.amenities && typeof property.amenities === "object") {
          setAmenities({ ...getEmptyAmenities(), ...property.amenities });
        }

        // Area unit conversion: default to MARLA? We'll compute display value based on chosen unit.
        // We'll store original areaSize in sqft, then let user select unit.
        const sqft = property.areaSize;
        const defaultUnit = "MARLA";
        setAreaUnit(defaultUnit);
        setDisplayAreaSize(sqftToUnit(sqft, defaultUnit));
      } catch (err: any) {
        setSnackbar({
          open: true,
          message: err.response?.data?.message || "Failed to load property",
          severity: "error",
        });
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const handleChange = (field: keyof UpdatePropertyRequest, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleNumericChange = (
    field: keyof UpdatePropertyRequest,
    value: string,
  ) => {
    const num = value === "" ? undefined : Number(value);
    if (num === undefined || !isNaN(num)) {
      handleChange(field, num);
    }
  };

  const handleAmenityChange = (key: string, value: any) => {
    setAmenities((prev) => ({ ...prev, [key]: value }));
  };

  // Image upload functions (same as add page)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    if (propertyPics.length >= MAX_FILES) {
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
      setPropertyPics((prev) => [...prev, url]);
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
    setPropertyPics((prev) => prev.filter((_, i) => i !== index));
  };

  // Toggle active/inactive
  const handleToggleActive = async () => {
    try {
      await api.put(`/api/Property/${id}/toggle-active`);
      setIsActive(!isActive);
      setSnackbar({
        open: true,
        message: `Property ${!isActive ? "activated" : "deactivated"}.`,
        severity: "success",
      });
    } catch (err: any) {
      setSnackbar({
        open: true,
        message: err.response?.data?.message || "Toggle failed",
        severity: "error",
      });
    }
  };

  // Build patch payload (include all fields, not just changed – simpler for MVP)
  const buildPatchPayload = (): UpdatePropertyRequest => {
    // Convert area to sqft
    const areaSizeSqFt = displayAreaSize * areaUnitToSqFt[areaUnit];
    return {
      title: form.title,
      description: form.description,
      price: form.price,
      city: form.city,
      address: form.address,
      location: form.location,
      bedrooms: form.bedrooms,
      bathrooms: form.bathrooms,
      areaSize: areaSizeSqFt,
      propertyType: form.propertyType,
      propertyPurpose: form.propertyPurpose,
      latitude: form.latitude,
      longitude: form.longitude,
      amenities: amenities,
      propertyPics: propertyPics,
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const patchData = buildPatchPayload();
      await api.patch(`/api/Property/${id}`, patchData);
      setSnackbar({
        open: true,
        message: "Property updated successfully!",
        severity: "success",
      });
      setTimeout(() => router.push("/dashboard/agent/properties"), 1500);
    } catch (err: any) {
      setSnackbar({
        open: true,
        message: err.response?.data?.message || "Failed to update property",
        severity: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  // Amenities render function (identical to add page – reusing same structure)
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
                value={amenities.builtInYear || ""}
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
                value={amenities.parkingSpaces || ""}
                onChange={(e) =>
                  handleAmenityChange("parkingSpaces", e.target.value)
                }
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={!!amenities.lobbyInBuilding}
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
                    checked={!!amenities.doubleGlazedWindows}
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
                    checked={!!amenities.centralAirConditioning}
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
                    checked={!!amenities.centralHeating}
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
                value={amenities.flooring || ""}
                onChange={(e) =>
                  handleAmenityChange("flooring", e.target.value)
                }
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={!!amenities.electricityBackup}
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
                    checked={!!amenities.wasteDisposal}
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
                value={amenities.floor || ""}
                onChange={(e) => handleAmenityChange("floor", e.target.value)}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Floors in Building"
                type="number"
                fullWidth
                value={amenities.floorsInBuilding || ""}
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
                value={amenities.elevators || ""}
                onChange={(e) =>
                  handleAmenityChange("elevators", e.target.value)
                }
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={!!amenities.serviceElevatorsInBuilding}
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
                    checked={!!amenities.otherMainFeatures}
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
                    checked={!!amenities.furnished}
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
                value={amenities.rooms || ""}
                onChange={(e) => handleAmenityChange("rooms", e.target.value)}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Servant Quarters"
                type="number"
                fullWidth
                value={amenities.servantQuarters || ""}
                onChange={(e) =>
                  handleAmenityChange("servantQuarters", e.target.value)
                }
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={!!amenities.otherRooms}
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
            {[
              {
                key: "broadbandInternetAccess",
                label: "Broadband Internet Access",
              },
              {
                key: "satelliteOrCableTVReady",
                label: "Satellite or Cable TV Ready",
              },
              {
                key: "businessCenterOrMediaRoom",
                label: "Business Center or Media Room",
              },
              { key: "conferenceRoom", label: "Conference Room" },
              { key: "intercom", label: "Intercom" },
              { key: "atmMachines", label: "ATM Machines" },
              {
                key: "otherBusinessFacilities",
                label: "Other Business Facilities",
              },
            ].map(({ key, label }) => (
              <Grid size={{ xs: 12, sm: 6 }} key={key}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={!!amenities[key]}
                      onChange={(e) =>
                        handleAmenityChange(key, e.target.checked)
                      }
                    />
                  }
                  label={label}
                />
              </Grid>
            ))}
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
                      checked={!!amenities[key]}
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
                    checked={!!amenities.lawnOrGarden}
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
                    checked={!!amenities.otherHealthcareRecreation}
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
                      checked={!!amenities[key]}
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
                value={amenities.distanceFromAirportKm || ""}
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
                      checked={!!amenities[key]}
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

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (!original) {
    return (
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Alert severity="error">Property not found.</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Typography variant="h4" gutterBottom>
        Edit Property
      </Typography>

      {/* Latitude/Longitude Instructions */}
      <Paper
        elevation={0}
        variant="outlined"
        sx={{
          p: 2,
          mb: 3,
          bgcolor: "#f5f5f5",
          display: "flex",
          alignItems: "flex-start",
          gap: 1,
        }}
      >
        <Tooltip title="These coordinates are used to place the property on the map and find nearby amenities.">
          <InfoIcon color="info" sx={{ mt: 0.5 }} />
        </Tooltip>
        <Box>
          <Typography variant="subtitle2" gutterBottom>
            How to get Latitude & Longitude?
          </Typography>
          <Typography variant="body2" color="text.secondary">
            1. Open{" "}
            <a
              href="https://www.google.com/maps"
              target="_blank"
              rel="noopener noreferrer"
            >
              Google Maps
            </a>{" "}
            and search for your property address.
            <br />
            2. Right‑click on the exact location → select{" "}
            <strong>"What's here?"</strong>
            <br />
            3. The coordinates appear at the bottom (e.g.,{" "}
            <code>31.4221, 74.3426</code>).
            <br />
            4. Paste the first number as <strong>Latitude</strong> and the
            second as <strong>Longitude</strong>.
          </Typography>
        </Box>
      </Paper>

      {/* Toggle Active Switch */}
      <Box sx={{ mb: 3 }}>
        <FormControlLabel
          control={
            <Switch
              checked={isActive}
              onChange={handleToggleActive}
              color="primary"
            />
          }
          label={isActive ? "Active" : "Inactive"}
        />
      </Box>

      <Box component="form" onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          {/* Title */}
          <Grid size={{ xs: 12 }}>
            <TextField
              label="Title"
              required
              fullWidth
              value={form.title || ""}
              onChange={(e) => handleChange("title", e.target.value)}
            />
          </Grid>
          {/* Description */}
          <Grid size={{ xs: 12 }}>
            <TextField
              label="Description"
              required
              fullWidth
              multiline
              rows={4}
              value={form.description || ""}
              onChange={(e) => handleChange("description", e.target.value)}
            />
          </Grid>
          {/* Price */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Price (PKR)"
              type="number"
              required
              fullWidth
              value={form.price ?? ""}
              onChange={(e) => handleNumericChange("price", e.target.value)}
            />
          </Grid>
          {/* City */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="City"
              required
              fullWidth
              value={form.city || ""}
              onChange={(e) => handleChange("city", e.target.value)}
            />
          </Grid>
          {/* Address */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Address"
              required
              fullWidth
              value={form.address || ""}
              onChange={(e) => handleChange("address", e.target.value)}
            />
          </Grid>
          {/* Location (Society/Area) */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Location (e.g., DHA Phase 7 Block U)"
              fullWidth
              value={form.location || ""}
              onChange={(e) => handleChange("location", e.target.value)}
            />
          </Grid>
          {/* Bedrooms */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Bedrooms"
              type="number"
              fullWidth
              value={form.bedrooms ?? ""}
              onChange={(e) => handleNumericChange("bedrooms", e.target.value)}
            />
          </Grid>
          {/* Bathrooms */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Bathrooms"
              type="number"
              fullWidth
              value={form.bathrooms ?? ""}
              onChange={(e) => handleNumericChange("bathrooms", e.target.value)}
            />
          </Grid>
          {/* Area Size + Unit */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Area Size"
              type="number"
              required
              fullWidth
              value={displayAreaSize === 0 ? "" : displayAreaSize}
              onChange={(e) => {
                const val =
                  e.target.value === "" ? 0 : parseFloat(e.target.value);
                if (!isNaN(val)) setDisplayAreaSize(val);
              }}
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
          {/* Property Type */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormControl fullWidth>
              <InputLabel>Property Type</InputLabel>
              <Select
                value={form.propertyType || "HOUSE"}
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
          {/* Property Purpose */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormControl fullWidth>
              <InputLabel>Property Purpose</InputLabel>
              <Select
                value={form.propertyPurpose || "BUY"}
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
              onChange={(e) => handleNumericChange("latitude", e.target.value)}
              helperText="e.g., 31.4221"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Longitude"
              type="number"
              required
              fullWidth
              value={form.longitude ?? ""}
              onChange={(e) => handleNumericChange("longitude", e.target.value)}
              helperText="e.g., 74.3426"
            />
          </Grid>

          {/* Image Management */}
          <Grid size={{ xs: 12 }}>
            <Typography variant="subtitle1" gutterBottom>
              Property Images ({propertyPics.length}/{MAX_FILES})
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
                Add New Image
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
            {propertyPics.length > 0 && (
              <ImageList sx={{ mt: 2 }} cols={3} rowHeight={164}>
                {propertyPics.map((url, index) => (
                  <ImageListItem key={index}>
                    <Image
                      src={url}
                      alt={`Property ${index + 1}`}
                      fill
                      style={{ objectFit: "cover" }}
                    />
                    <IconButton
                      sx={{
                        position: "absolute",
                        top: 2,
                        right: 2,
                        bgcolor: "rgba(255,255,255,0.8)",
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
          {renderAmenities()}
        </Grid>

        <Box sx={{ mt: 4, display: "flex", gap: 2 }}>
          <Button
            variant="contained"
            type="submit"
            disabled={saving || uploading}
            startIcon={saving ? <CircularProgress size={20} /> : null}
          >
            {saving ? "Saving..." : "Save Changes"}
          </Button>
          <Button variant="outlined" onClick={() => router.back()}>
            Cancel
          </Button>
        </Box>
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
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
