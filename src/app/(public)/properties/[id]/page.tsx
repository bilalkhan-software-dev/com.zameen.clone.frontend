"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  Container,
  Typography,
  Box,
  Grid,
  CircularProgress,
  Alert,
  Chip,
  Stack,
  Paper,
  IconButton,
  Avatar,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
} from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import SchoolIcon from "@mui/icons-material/School";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import PhoneIcon from "@mui/icons-material/Phone";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import EmailIcon from "@mui/icons-material/Email";
import CloseIcon from "@mui/icons-material/Close";
import { APIProvider, Map, AdvancedMarker } from "@vis.gl/react-google-maps";
import api from "@/lib/axios";
import { PropertyResponse } from "@/lib/types";
import { useAuth } from "@/context/AuthContext";
import EnquiryForm from "@/components/EnquiryFom";
import PriceTrendChart from "@/components/PriceTrendChart";

// ----------------------------------------------------------------------
// Amenities grouping (same as AddPropertyPage)
// ----------------------------------------------------------------------
const amenitiesCategories = [
  {
    name: "Main Features",
    keys: [
      "builtInYear",
      "parkingSpaces",
      "lobbyInBuilding",
      "doubleGlazedWindows",
      "centralAirConditioning",
      "centralHeating",
      "flooring",
      "electricityBackup",
      "wasteDisposal",
      "floor",
      "floorsInBuilding",
      "elevators",
      "serviceElevatorsInBuilding",
      "otherMainFeatures",
      "furnished",
    ],
  },
  {
    name: "Rooms",
    keys: ["rooms", "servantQuarters", "otherRooms"],
  },
  {
    name: "Business and Communication",
    keys: [
      "broadbandInternetAccess",
      "satelliteOrCableTVReady",
      "businessCenterOrMediaRoom",
      "conferenceRoom",
      "intercom",
      "atmMachines",
      "otherBusinessFacilities",
    ],
  },
  {
    name: "Community Features",
    keys: [
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
    ],
  },
  {
    name: "Healthcare Recreational",
    keys: ["lawnOrGarden", "otherHealthcareRecreation"],
  },
  {
    name: "Nearby Locations",
    keys: [
      "nearbySchools",
      "nearbyHospitals",
      "nearbyShoppingMalls",
      "nearbyRestaurants",
      "nearbyPublicTransport",
      "otherNearbyPlaces",
      "distanceFromAirportKm",
    ],
  },
  {
    name: "Other Facilities",
    keys: [
      "maintenanceStaff",
      "securityStaff",
      "facilitiesForDisabled",
      "petsAllowed",
      "otherFacilities",
    ],
  },
];

const getDisplayValue = (value: any): string | null => {
  if (typeof value === "boolean") return value ? "Yes" : null;
  if (value === "" || value === null || value === undefined) return null;
  return String(value);
};

const getLabel = (key: string) =>
  key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase());

const renderGroupedAmenities = (amenities: Record<string, any>) => {
  if (!amenities || Object.keys(amenities).length === 0) return null;

  return (
    <Grid container spacing={3}>
      {amenitiesCategories.map((category) => {
        const items = category.keys
          .map((key) => ({ key, value: getDisplayValue(amenities[key]) }))
          .filter((item) => item.value !== null);
        if (items.length === 0) return null;
        return (
          <Grid size={{ xs: 12, md: 6 }} key={category.name}>
            <Paper variant="outlined" sx={{ p: 2, height: "100%" }}>
              <Typography
                variant="subtitle1"
                sx={{ fontWeight: "bold", mb: 1.5 }}
              >
                {category.name}
              </Typography>
              <Grid container spacing={1}>
                {items.map(({ key, value }) => (
                  <Grid size={{ xs: 12, sm: 6 }} key={key}>
                    <Typography variant="body2">
                      <strong>{getLabel(key)}:</strong> {value}
                    </Typography>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          </Grid>
        );
      })}
    </Grid>
  );
};

// ----------------------------------------------------------------------
// Main Component
// ----------------------------------------------------------------------
export default function PropertyDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [property, setProperty] = useState<PropertyResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [nearbyModal, setNearbyModal] = useState<{
    open: boolean;
    type: string;
    url: string;
  }>({
    open: false,
    type: "",
    url: "",
  });

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get(`/api/Property/${id}`);
        setProperty(res.data.data);
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to load property");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  // Store viewed property in localStorage
  useEffect(() => {
    if (property) {
      const STORAGE_KEY = "zameen_viewed_properties";
      const stored = localStorage.getItem(STORAGE_KEY);
      let viewed = stored ? JSON.parse(stored) : [];
      viewed = viewed.filter((p: any) => p.id !== property.id);
      viewed.unshift({
        id: property.id,
        title: property.title,
        price: property.price,
        image: property.propertyPics?.[0] || "",
        timestamp: Date.now(),
      });
      viewed = viewed.slice(0, 20);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(viewed));
    }
  }, [property]);

  const pics = property?.propertyPics?.length
    ? property.propertyPics
    : ["/placeholder-property.jpg"];
  const goToPrev = () =>
    setActiveImageIndex((prev) => (prev === 0 ? pics.length - 1 : prev - 1));
  const goToNext = () =>
    setActiveImageIndex((prev) => (prev === pics.length - 1 ? 0 : prev + 1));

  const lat = property?.latitude;
  const lng = property?.longitude;
  const mapsUrl =
    lat && lng ? `https://www.google.com/maps/place/${lat},${lng}` : "#";
  const nearbyUrls = {
    schools:
      lat && lng
        ? `https://www.google.com/maps/embed/v1/search?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&q=schools+near+${lat},${lng}`
        : "",
    hospitals:
      lat && lng
        ? `https://www.google.com/maps/embed/v1/search?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&q=hospitals+near+${lat},${lng}`
        : "",
    restaurants:
      lat && lng
        ? `https://www.google.com/maps/embed/v1/search?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&q=restaurants+near+${lat},${lng}`
        : "",
  };

  const handleNearbyClick = (type: "schools" | "hospitals" | "restaurants") => {
    setNearbyModal({ open: true, type, url: nearbyUrls[type] });
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error || !property) {
    return (
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Alert severity="error">{error || "Property not found"}</Alert>
      </Container>
    );
  }

  const agent = property.agent;
  const sizeRange = property.areaSize
    ? property.areaSize >= 5400
      ? "1 kanal"
      : property.areaSize >= 2700
        ? "10 marla"
        : property.areaSize >= 1350
          ? "5 marla"
          : "<5 marla"
    : "Custom";

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Title & Status */}
      <Typography variant="h3" sx={{ fontWeight: 700, mb: 2 }}>
        {property.title}
      </Typography>
      <Stack direction="row" spacing={1} sx={{ mb: 3 }}>
        <Chip label={property.propertyType} color="primary" />
        <Chip label={property.status} color="secondary" />
      </Stack>

      {/* Image Slider */}
      <Box
        sx={{
          position: "relative",
          width: "100%",
          height: { xs: 300, md: 500 },
          borderRadius: 4,
          overflow: "hidden",
          mb: 4,
          boxShadow: 4,
        }}
      >
        <img
          src={pics[activeImageIndex]}
          alt={`${property.title} - ${activeImageIndex + 1}`}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
        {pics.length > 1 && (
          <>
            <IconButton
              onClick={goToPrev}
              sx={{
                position: "absolute",
                left: 16,
                top: "50%",
                transform: "translateY(-50%)",
                bgcolor: "rgba(255,255,255,0.8)",
                "&:hover": { bgcolor: "white" },
              }}
            >
              <ChevronLeftIcon fontSize="large" />
            </IconButton>
            <IconButton
              onClick={goToNext}
              sx={{
                position: "absolute",
                right: 16,
                top: "50%",
                transform: "translateY(-50%)",
                bgcolor: "rgba(255,255,255,0.8)",
                "&:hover": { bgcolor: "white" },
              }}
            >
              <ChevronRightIcon fontSize="large" />
            </IconButton>
          </>
        )}
        {pics.length > 1 && (
          <Box
            sx={{
              position: "absolute",
              bottom: 16,
              left: "50%",
              transform: "translateX(-50%)",
              display: "flex",
              gap: 1,
            }}
          >
            {pics.map((_, idx) => (
              <Box
                key={idx}
                onClick={() => setActiveImageIndex(idx)}
                sx={{
                  width: 12,
                  height: 12,
                  borderRadius: "50%",
                  backgroundColor:
                    idx === activeImageIndex
                      ? "white"
                      : "rgba(255,255,255,0.5)",
                  cursor: "pointer",
                }}
              />
            ))}
          </Box>
        )}
      </Box>

      {/* Price & Basic Facts */}
      <Paper elevation={2} sx={{ p: 4, mb: 4 }}>
        <Typography
          variant="h4"
          sx={{ color: "primary.main", fontWeight: 700, mb: 2 }}
        >
          PKR {property.price.toLocaleString()}
        </Typography>
        <Grid container spacing={3}>
          <Grid size={{ xs: 6, sm: 3 }}>
            <Typography variant="subtitle2" sx={{ color: "text.secondary" }}>
              Bedrooms
            </Typography>
            <Typography sx={{ fontWeight: 600 }}>
              {property.bedrooms}
            </Typography>
          </Grid>
          <Grid size={{ xs: 6, sm: 3 }}>
            <Typography variant="subtitle2" sx={{ color: "text.secondary" }}>
              Bathrooms
            </Typography>
            <Typography sx={{ fontWeight: 600 }}>
              {property.bathrooms}
            </Typography>
          </Grid>
          <Grid size={{ xs: 6, sm: 3 }}>
            <Typography variant="subtitle2" sx={{ color: "text.secondary" }}>
              Area
            </Typography>
            <Typography sx={{ fontWeight: 600 }}>
              {property.areaSize} {property.areaUnit || "sq.ft."}
            </Typography>
          </Grid>
          <Grid size={{ xs: 6, sm: 3 }}>
            <Typography variant="subtitle2" sx={{ color: "text.secondary" }}>
              City
            </Typography>
            <Typography sx={{ fontWeight: 600 }}>{property.city}</Typography>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography variant="subtitle2" sx={{ color: "text.secondary" }}>
              Address
            </Typography>
            <Typography sx={{ fontWeight: 600 }}>{property.address}</Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Amenities */}
      {property.amenities && Object.keys(property.amenities).length > 0 && (
        <Paper elevation={2} sx={{ p: 4, mb: 4 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
            Amenities
          </Typography>
          {renderGroupedAmenities(property.amenities)}
        </Paper>
      )}

      {/* Location & Map */}
      {lat && lng && (
        <Paper elevation={2} sx={{ p: 4, mb: 4 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
            Location
          </Typography>
          <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
            <Button
              variant="outlined"
              startIcon={<LocationOnIcon />}
              href={mapsUrl}
              target="_blank"
            >
              Property Location
            </Button>
            <Button
              variant="outlined"
              startIcon={<SchoolIcon />}
              onClick={() => handleNearbyClick("schools")}
            >
              Nearby Schools
            </Button>
            <Button
              variant="outlined"
              startIcon={<LocalHospitalIcon />}
              onClick={() => handleNearbyClick("hospitals")}
            >
              Nearby Hospitals
            </Button>
            <Button
              variant="outlined"
              startIcon={<RestaurantIcon />}
              onClick={() => handleNearbyClick("restaurants")}
            >
              Nearby Restaurants
            </Button>
          </Box>
          <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}>
            <Map
              style={{ width: "100%", height: "400px", borderRadius: "12px" }}
              defaultCenter={{ lat, lng }}
              defaultZoom={15}
              mapId="YOUR_MAP_ID" // Replace with your actual Map ID from Google Cloud Console
              gestureHandling="greedy"
              disableDefaultUI
            >
              <AdvancedMarker position={{ lat, lng }} />
            </Map>
          </APIProvider>
        </Paper>
      )}

      {/* Price Trend Chart */}
      {property.location && property.propertyType && (
        <PriceTrendChart
          location={property.location}
          propertyType={property.propertyType}
          sizeRange={sizeRange}
        />
      )}

      {/* Description */}
      <Paper elevation={2} sx={{ p: 4, mb: 4 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
          Description
        </Typography>
        <Typography variant="body1" sx={{ color: "text.secondary" }}>
          {property.description}
        </Typography>
      </Paper>

      {/* Agent Section */}
      {agent && (
        <Paper elevation={2} sx={{ p: 4, mb: 4 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 2,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Avatar
                src={agent.profilePic || undefined}
                alt={agent.agencyName}
                sx={{
                  width: 64,
                  height: 64,
                  border: "3px solid",
                  borderColor: "primary.main",
                }}
              />
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  {agent.agencyName}
                </Typography>
                {agent.bio && (
                  <Typography
                    variant="body2"
                    sx={{ color: "text.secondary", mt: 0.5 }}
                  >
                    {agent.bio}
                  </Typography>
                )}
                <Chip
                  label={
                    agent.accountStatus === "APPROVED"
                      ? "Verified Agent"
                      : agent.accountStatus
                  }
                  size="small"
                  color={
                    agent.accountStatus === "APPROVED" ? "success" : "default"
                  }
                  sx={{ mt: 1 }}
                />
              </Box>
            </Box>
            <Box sx={{ display: "flex", gap: 1 }}>
              {agent.contactNumber && (
                <>
                  <IconButton
                    component="a"
                    href={`tel:${agent.contactNumber}`}
                    target="_blank"
                    sx={{
                      bgcolor: "#25D366",
                      color: "white",
                      "&:hover": { bgcolor: "#128C7E" },
                    }}
                  >
                    <PhoneIcon />
                  </IconButton>
                  <IconButton
                    component="a"
                    href={`https://wa.me/${agent.contactNumber.replace(/^0/, "92")}`}
                    target="_blank"
                    sx={{
                      bgcolor: "#25D366",
                      color: "white",
                      "&:hover": { bgcolor: "#128C7E" },
                    }}
                  >
                    <WhatsAppIcon />
                  </IconButton>
                </>
              )}
              {agent.contactEmail && (
                <IconButton
                  component="a"
                  href={`mailto:${agent.contactEmail}?subject=Inquiry about ${property.title} (ID: ${property.id})&body=Hello, I am interested in your property: ${property.title}. Please contact me.`}
                  target="_blank"
                  sx={{
                    bgcolor: "#1976d2",
                    color: "white",
                    "&:hover": { bgcolor: "#1565c0" },
                  }}
                >
                  <EmailIcon />
                </IconButton>
              )}
            </Box>
          </Box>
        </Paper>
      )}

      {/* Enquiry Form */}
      {user ? (
        <Paper elevation={2} sx={{ p: 4 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
            Send an Enquiry
          </Typography>
          <EnquiryForm propertyId={Number(id)} />
        </Paper>
      ) : (
        <Alert severity="info" sx={{ mt: 4 }}>
          Please{" "}
          <Link href="/login" style={{ fontWeight: 600 }}>
            login
          </Link>{" "}
          to send an enquiry.
        </Alert>
      )}

      {/* Nearby Modal */}
      <Dialog
        open={nearbyModal.open}
        onClose={() => setNearbyModal({ open: false, type: "", url: "" })}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          Nearby{" "}
          {nearbyModal.type.charAt(0).toUpperCase() + nearbyModal.type.slice(1)}
          <IconButton
            aria-label="close"
            onClick={() => setNearbyModal({ open: false, type: "", url: "" })}
            sx={{ position: "absolute", right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {nearbyModal.url ? (
            <iframe
              src={nearbyModal.url}
              width="100%"
              height="500"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          ) : (
            <Typography>Map not available.</Typography>
          )}
        </DialogContent>
      </Dialog>
    </Container>
  );
}
