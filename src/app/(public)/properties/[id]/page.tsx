"use client";

import { useEffect, useState, useRef, useLayoutEffect } from "react";
import { useParams, useRouter } from "next/navigation";
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
  Tabs,
  Tab,
  Breadcrumbs,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  useTheme,
  useMediaQuery,
  Skeleton,
  Snackbar,
  TextField,
  RadioGroup,
  FormControlLabel,
  Radio,
  Checkbox,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import SchoolIcon from "@mui/icons-material/School";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import PhoneIcon from "@mui/icons-material/Phone";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import EmailIcon from "@mui/icons-material/Email";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import HomeIcon from "@mui/icons-material/Home";
import MeetingRoomIcon from "@mui/icons-material/MeetingRoom";
import BusinessIcon from "@mui/icons-material/Business";
import PeopleIcon from "@mui/icons-material/People";
import MedicalServicesIcon from "@mui/icons-material/MedicalServices";
import LocationCityIcon from "@mui/icons-material/LocationCity";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import {
  APIProvider,
  Map,
  AdvancedMarker,
  Pin,
} from "@vis.gl/react-google-maps";
import api from "@/lib/axios";
import { PropertyResponse } from "@/lib/types";
import { useAuth } from "@/context/AuthContext";
import PriceTrendChart from "@/components/PriceTrendChart";
import PropertyCard from "@/components/PropertyCard";
import TrendingLocationsChart from "@/components/TrendingLocationsChart";
import HomeFinanceCalculator from "@/components/HomeFinanceCalculator";
import LoanApplicationModal from "@/components/LoanApplicationModal";
import { useSettings } from "@/context/SettingsContext";

// ----------------------------------------------------------------------
// Styled Tabs – pill shape, white text, black background, full width
// ----------------------------------------------------------------------
const StyledTabs = styled(Tabs)(({ theme }) => ({
  minHeight: 48,
  "& .MuiTabs-flexContainer": {
    gap: theme.spacing(1),
    justifyContent: "center",
  },
  "& .MuiTab-root": {
    borderRadius: 24,
    padding: theme.spacing(0.75, 2),
    minWidth: "auto",
    minHeight: 36,
    textTransform: "none",
    fontWeight: 500,
    fontSize: "0.9rem",
    color: "#fff",
    transition: "background 0.2s, color 0.2s",
    "&.Mui-selected": {
      backgroundColor: "rgba(255,255,255,0.25)",
      color: "#fff",
    },
    "&:hover": {
      backgroundColor: "rgba(255,255,255,0.15)",
    },
  },
}));

const StickyTabsWrapper = styled(Box)(({ theme }) => ({
  position: "sticky",
  top: 64, // adjust to your main AppBar height
  zIndex: 1200,
  width: "100%", // full viewport width
  backgroundColor: "#000",
  boxShadow: theme.shadows[2],
  padding: theme.spacing(1, 0), // no horizontal padding – inner Container manages it
  marginBottom: theme.spacing(3),
}));

// ----------------------------------------------------------------------
// Amenities grouping (unchanged)
// ----------------------------------------------------------------------
const amenitiesCategories = [
  {
    name: "Main Features",
    icon: <HomeIcon fontSize="small" />,
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
    icon: <MeetingRoomIcon fontSize="small" />,
    keys: ["rooms", "servantQuarters", "otherRooms"],
  },
  {
    name: "Business and Communication",
    icon: <BusinessIcon fontSize="small" />,
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
    icon: <PeopleIcon fontSize="small" />,
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
    icon: <MedicalServicesIcon fontSize="small" />,
    keys: ["lawnOrGarden", "otherHealthcareRecreation"],
  },
  {
    name: "Nearby Locations",
    icon: <LocationCityIcon fontSize="small" />,
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
    icon: <MoreHorizIcon fontSize="small" />,
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
              <Stack
                direction="row"
                spacing={1}
                sx={{ mb: 1.5, alignItems: "center" }}
              >
                {category.icon}
                <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                  {category.name}
                </Typography>
              </Stack>
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
// Property Carousel (unchanged)
// ----------------------------------------------------------------------
const PropertyCarousel = ({
  properties,
  title,
}: {
  properties: PropertyResponse[];
  title: string;
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = isMobile ? 300 : 400;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  if (properties.length === 0) return null;

  return (
    <Box sx={{ mb: 5 }}>
      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
        {title}
      </Typography>
      <Box sx={{ position: "relative" }}>
        <IconButton
          onClick={() => scroll("left")}
          sx={{
            position: "absolute",
            left: -20,
            top: "50%",
            transform: "translateY(-50%)",
            zIndex: 2,
            bgcolor: "background.paper",
            boxShadow: 1,
            display: { xs: "none", sm: "flex" },
          }}
        >
          <ChevronLeftIcon />
        </IconButton>
        <Box
          ref={scrollRef}
          sx={{
            display: "flex",
            overflowX: "auto",
            gap: 2,
            scrollBehavior: "smooth",
            pb: 1,
            px: { xs: 1, sm: 0 },
            "&::-webkit-scrollbar": { height: 6 },
            "&::-webkit-scrollbar-track": {
              bgcolor: "grey.200",
              borderRadius: 3,
            },
            "&::-webkit-scrollbar-thumb": {
              bgcolor: "grey.400",
              borderRadius: 3,
            },
          }}
        >
          {properties.map((property) => (
            <Box
              key={property.id}
              sx={{ minWidth: { xs: "85%", sm: 300, md: 280 }, flexShrink: 0 }}
            >
              <PropertyCard property={property} />
            </Box>
          ))}
        </Box>
        <IconButton
          onClick={() => scroll("right")}
          sx={{
            position: "absolute",
            right: -20,
            top: "50%",
            transform: "translateY(-50%)",
            zIndex: 2,
            bgcolor: "background.paper",
            boxShadow: 1,
            display: { xs: "none", sm: "flex" },
          }}
        >
          <ChevronRightIcon />
        </IconButton>
      </Box>
    </Box>
  );
};

// ----------------------------------------------------------------------
// Safety Tips – complete text
// ----------------------------------------------------------------------
const SafetyTips = () => (
  <Accordion defaultExpanded sx={{ mt: 4 }}>
    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
      <Typography variant="h6" sx={{ fontWeight: 600 }}>
        Safety Tips for Property Transactions
      </Typography>
    </AccordionSummary>
    <AccordionDetails>
      <Typography
        component="div"
        variant="body2"
        sx={{ color: "text.secondary" }}
      >
        <ul>
          <li>
            Always meet in a safe, public location—preferably during daylight
            hours. Locations such as cafes, commercial plazas, outside bank
            branches or in an office of a real estate agency are ideal.
          </li>
          <li>
            Do not make any payment before proper verification of the property,
            completion of all legal formalities, and due diligence with the
            respective authorities.
          </li>
          <li>
            Inspect the property thoroughly and ensure all details match what’s
            listed in the advertisement.
          </li>
          <li>
            Be cautious of offers that seem too good to be true. Unrealistically
            low prices may be a sign of a scam.
          </li>
          <li>
            Verify property ownership documents, including title deeds,
            registry, and CNIC of the seller/agent.
          </li>
          <li>
            Check for encumbrances or disputes by consulting with a legal
            advisor or relevant land authority.
          </li>
          <li>
            Never go alone when visiting a property. Take a trusted person along
            for added security.
          </li>
          <li>
            Avoid sharing sensitive personal or financial information unless the
            other party is verified and trustworthy.
          </li>
        </ul>
        <Typography variant="caption" display="block" sx={{ mt: 2 }}>
          Zameen.com does not take any responsibility for the ads posted by
          users. All users are solely responsible for the accuracy,
          authenticity, and legality of their listings. Always conduct due
          diligence and seek professional legal or real estate advice before
          finalizing any deal.
        </Typography>
      </Typography>
    </AccordionDetails>
  </Accordion>
);

// ----------------------------------------------------------------------
// Image Slider (unchanged)
// ----------------------------------------------------------------------
const ImageSlider = ({ images }: { images: string[] }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [nextIndex, setNextIndex] = useState<number | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const goToPrev = () => {
    if (isTransitioning) return;
    const newIndex = activeIndex === 0 ? images.length - 1 : activeIndex - 1;
    setNextIndex(newIndex);
    setIsTransitioning(true);
    setTimeout(() => {
      setActiveIndex(newIndex);
      setNextIndex(null);
      setIsTransitioning(false);
    }, 300);
  };

  const goToNext = () => {
    if (isTransitioning) return;
    const newIndex = activeIndex === images.length - 1 ? 0 : activeIndex + 1;
    setNextIndex(newIndex);
    setIsTransitioning(true);
    setTimeout(() => {
      setActiveIndex(newIndex);
      setNextIndex(null);
      setIsTransitioning(false);
    }, 300);
  };

  const currentImage = images[activeIndex];
  const nextImage = nextIndex !== null ? images[nextIndex] : null;

  return (
    <Box
      sx={{
        position: "relative",
        width: "100%",
        height: "100%",
        overflow: "hidden",
      }}
    >
      <Box sx={{ position: "relative", width: "100%", height: "100%" }}>
        <img
          src={currentImage}
          alt="Property"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            opacity: isTransitioning && nextImage ? 0 : 1,
            transition: "opacity 0.3s ease",
          }}
        />
        {nextImage && (
          <img
            src={nextImage}
            alt="Property"
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              opacity: isTransitioning ? 1 : 0,
              transition: "opacity 0.3s ease",
            }}
          />
        )}
      </Box>
      {images.length > 1 && (
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
      {images.length > 1 && (
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
          {images.map((_, idx) => (
            <Box
              key={idx}
              onClick={() => {
                if (idx === activeIndex || isTransitioning) return;
                setNextIndex(idx);
                setIsTransitioning(true);
                setTimeout(() => {
                  setActiveIndex(idx);
                  setNextIndex(null);
                  setIsTransitioning(false);
                }, 300);
              }}
              sx={{
                width: 12,
                height: 12,
                borderRadius: "50%",
                backgroundColor:
                  idx === activeIndex ? "white" : "rgba(255,255,255,0.5)",
                cursor: "pointer",
                transition: "background-color 0.2s",
              }}
            />
          ))}
        </Box>
      )}
    </Box>
  );
};

// ----------------------------------------------------------------------
// Location Map Section (unchanged)
// ----------------------------------------------------------------------
const LocationMapSection = ({
  lat,
  lng,
  propertyName,
}: {
  lat: number;
  lng: number;
  propertyName: string;
}) => {
  const center = { lat, lng };
  const mapsUrl = `https://www.google.com/maps/place/${lat},${lng}`;
  const nearbyUrls = {
    schools: `https://www.google.com/maps/search/schools+near+${lat},${lng}`,
    restaurants: `https://www.google.com/maps/search/restaurants+near+${lat},${lng}`,
    hospitals: `https://www.google.com/maps/search/hospitals+near+${lat},${lng}`,
    parks: `https://www.google.com/maps/search/parks+near+${lat},${lng}`,
  };

  return (
    <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
        Location
      </Typography>
      <Box sx={{ height: 400, borderRadius: 2, overflow: "hidden", mb: 2 }}>
        <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}>
          <Map
            mapId={process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID}
            defaultCenter={center}
            defaultZoom={15}
            gestureHandling="greedy"
            style={{ width: "100%", height: "100%" }}
          >
            <AdvancedMarker position={center}>
              <Pin
                background={"#f59e0b"}
                borderColor={"#d97706"}
                glyphColor={"white"}
              />
            </AdvancedMarker>
          </Map>
        </APIProvider>
      </Box>
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Stack
          direction="row"
          sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}
        >
          <Button
            variant="outlined"
            startIcon={<LocationOnIcon />}
            href={mapsUrl}
            target="_blank"
          >
            View on Map
          </Button>
          <Button
            variant="outlined"
            startIcon={<SchoolIcon />}
            href={nearbyUrls.schools}
            target="_blank"
          >
            Schools
          </Button>
          <Button
            variant="outlined"
            startIcon={<RestaurantIcon />}
            href={nearbyUrls.restaurants}
            target="_blank"
          >
            Restaurants
          </Button>
          <Button
            variant="outlined"
            startIcon={<LocalHospitalIcon />}
            href={nearbyUrls.hospitals}
            target="_blank"
          >
            Hospitals
          </Button>
          <Button
            variant="outlined"
            startIcon={<LocationCityIcon />}
            href={nearbyUrls.parks}
            target="_blank"
          >
            Parks
          </Button>
        </Stack>
      </Box>
    </Paper>
  );
};

// ----------------------------------------------------------------------
// Main Component
// ----------------------------------------------------------------------
export default function PropertyDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { formatPrice, formatArea } = useSettings();

  const [property, setProperty] = useState<PropertyResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tabValue, setTabValue] = useState(0);
  const [expandedDesc, setExpandedDesc] = useState(false);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const descRef = useRef<HTMLDivElement>(null);
  const [similarByLocation, setSimilarByLocation] = useState<
    PropertyResponse[]
  >([]);
  const [similarByAgent, setSimilarByAgent] = useState<PropertyResponse[]>([]);
  const [loadingSimilar, setLoadingSimilar] = useState(false);
  const [loanModalOpen, setLoanModalOpen] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({ open: false, message: "", severity: "success" });

  const overviewRef = useRef<HTMLDivElement>(null);
  const locationRef = useRef<HTMLDivElement>(null);
  const financeRef = useRef<HTMLDivElement>(null);
  const priceIndexRef = useRef<HTMLDivElement>(null);
  const trendsRef = useRef<HTMLDivElement>(null);

  // Fetch property
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

  // Reset description state when property changes
  useEffect(() => {
    setExpandedDesc(false);
    setIsOverflowing(false);
  }, [property]);

  // Detect overflow for description
  useLayoutEffect(() => {
    if (descRef.current) {
      const element = descRef.current;
      if (element.scrollHeight > element.clientHeight) {
        setIsOverflowing(true);
      } else {
        setIsOverflowing(false);
      }
    }
  }, [property, expandedDesc]);

  // Store viewed property
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

  // Fetch similar properties
  useEffect(() => {
    if (!property) return;
    const fetchSimilar = async () => {
      setLoadingSimilar(true);
      try {
        const [locRes, agentRes] = await Promise.all([
          api.get(`/api/Property/${id}/similar/location`, {
            params: { page: 1, pageSize: 8 },
          }),
          api.get(`/api/Property/${id}/similar/agent`, {
            params: { page: 1, pageSize: 8 },
          }),
        ]);
        setSimilarByLocation(locRes.data?.data?.items || []);
        setSimilarByAgent(agentRes.data?.data?.items || []);
      } catch (err) {
        console.error("Failed to fetch similar properties", err);
      } finally {
        setLoadingSimilar(false);
      }
    };
    fetchSimilar();
  }, [property, id]);

  // Intersection Observer for scroll spy
  useEffect(() => {
    const sections = [
      { ref: overviewRef, index: 0 },
      { ref: locationRef, index: 1 },
      { ref: financeRef, index: 2 },
      { ref: priceIndexRef, index: 3 },
      { ref: trendsRef, index: 4 },
    ];
    const observer = new IntersectionObserver(
      (entries) => {
        const visibleSection = entries.find((entry) => entry.isIntersecting);
        if (visibleSection) {
          const section = sections.find(
            (s) => s.ref.current === visibleSection.target,
          );
          if (section && section.index !== tabValue) {
            setTabValue(section.index);
            const hash = [
              "#overview",
              "#location",
              "#finance",
              "#price-index",
              "#trends",
            ][section.index];
            window.history.replaceState(null, "", hash);
          }
        }
      },
      { threshold: 0.3, rootMargin: "-100px 0px 0px 0px" },
    );
    sections.forEach((s) => {
      if (s.ref.current) observer.observe(s.ref.current);
    });
    return () => observer.disconnect();
  }, [tabValue]);

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    const refs = [
      overviewRef,
      locationRef,
      financeRef,
      priceIndexRef,
      trendsRef,
    ];
    const target = refs[newValue]?.current;
    if (target) target.scrollIntoView({ behavior: "smooth" });
  };

  const pics = property?.propertyPics?.length
    ? property.propertyPics
    : ["/placeholder-property.jpg"];
  const lat = property?.latitude;
  const lng = property?.longitude;

  const mapAreaToSizeRange = (areaSqFt: number) => {
    if (areaSqFt <= 500) return "0-500 sqft";
    if (areaSqFt <= 1000) return "500-1000 sqft";
    if (areaSqFt <= 2000) return "1000-2000 sqft";
    if (areaSqFt <= 5000) return "2000-5000 sqft";
    return "5000+ sqft";
  };

  const sizeRange = property?.areaSize
    ? mapAreaToSizeRange(property.areaSize)
    : "Custom";

  // const formatPrice = (price: number) => {
  //   if (price >= 10_000_000) return `PKR ${(price / 10_000_000).toFixed(2)}Cr`;
  //   if (price >= 100_000) return `PKR ${(price / 100_000).toFixed(1)}L`;
  //   return `PKR ${price.toLocaleString()}`;
  // };

  // Render functions
  const renderDetails = () => (
    <Grid container spacing={2} sx={{ mb: 3 }}>
      <Grid size={{ xs: 6, sm: 4 }}>
        <Typography variant="body2" color="text.secondary">
          Type
        </Typography>
        <Typography sx={{ fontWeight: 500 }}>
          {property?.propertyType}
        </Typography>
      </Grid>
      <Grid size={{ xs: 6, sm: 4 }}>
        <Typography variant="body2" color="text.secondary">
          Price
        </Typography>
        <Typography sx={{ fontWeight: 500 }}>
          {formatPrice(property?.price || 0)}
        </Typography>
      </Grid>
      <Grid size={{ xs: 6, sm: 4 }}>
        <Typography variant="body2" color="text.secondary">
          Bathrooms
        </Typography>
        <Typography sx={{ fontWeight: 500 }}>{property?.bathrooms}</Typography>
      </Grid>
      <Grid size={{ xs: 6, sm: 4 }}>
        <Typography variant="body2" color="text.secondary">
          Area
        </Typography>
        <Typography sx={{ fontWeight: 500 }}>
          {formatArea(property?.areaSize || 0)}
        </Typography>
      </Grid>
      <Grid size={{ xs: 6, sm: 4 }}>
        <Typography variant="body2" color="text.secondary">
          Purpose
        </Typography>
        <Typography sx={{ fontWeight: 500 }}>
          {property?.propertyPurpose === "BUY" ? "For Sale" : "For Rent"}
        </Typography>
      </Grid>
      <Grid size={{ xs: 6, sm: 4 }}>
        <Typography variant="body2" color="text.secondary">
          Bedrooms
        </Typography>
        <Typography sx={{ fontWeight: 500 }}>{property?.bedrooms}</Typography>
      </Grid>
      <Grid size={{ xs: 6, sm: 4 }}>
        <Typography variant="body2" color="text.secondary">
          Added
        </Typography>
        <Typography sx={{ fontWeight: 500 }}>
          {property?.createdAt
            ? new Date(property.createdAt).toLocaleDateString()
            : "N/A"}
        </Typography>
      </Grid>
      <Grid size={{ xs: 12, sm: 8 }}>
        <Typography variant="body2" color="text.secondary">
          Location
        </Typography>
        <Typography sx={{ fontWeight: 500 }}>
          {property?.city} – {property?.address}
        </Typography>
      </Grid>
    </Grid>
  );

  const renderDescription = () => (
    <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
        Description
      </Typography>
      <Box
        ref={descRef}
        sx={{
          overflow: "hidden",
          display: "-webkit-box",
          WebkitLineClamp: expandedDesc ? "unset" : 4,
          WebkitBoxOrient: "vertical",
        }}
      >
        <Typography variant="body1" sx={{ color: "text.secondary" }}>
          {property?.description}
        </Typography>
      </Box>
      {isOverflowing && (
        <Button
          size="small"
          onClick={() => setExpandedDesc(!expandedDesc)}
          sx={{ mt: 1 }}
        >
          {expandedDesc ? "Read Less" : "Read More"}
        </Button>
      )}
    </Paper>
  );

  const renderAmenitiesSection = () => (
    <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
        Amenities
      </Typography>
      {renderGroupedAmenities(property?.amenities || {})}
    </Paper>
  );

  const renderLocationMap = () =>
    lat && lng ? (
      <LocationMapSection
        lat={lat}
        lng={lng}
        propertyName={property?.title || "Property"}
      />
    ) : (
      <Paper elevation={2} sx={{ p: 3, mb: 4, textAlign: "center" }}>
        <Typography variant="body2" color="text.secondary">
          Location coordinates not available.
        </Typography>
      </Paper>
    );

  const renderHomeFinance = () =>
    property?.propertyPurpose === "BUY" ? (
      <HomeFinanceCalculator
        propertyPrice={property?.price || 0}
        propertyId={property?.id}
        onApplyLoan={() => setLoanModalOpen(true)}
      />
    ) : (
      <Paper elevation={2} sx={{ p: 3, mb: 4, textAlign: "center" }}>
        <Typography variant="body1">
          Mortgage calculator is available only for properties listed for sale.
        </Typography>
      </Paper>
    );

  const renderPriceTrend = () =>
    property?.city &&
    property?.location &&
    property?.propertyPurpose &&
    property?.propertyType && (
      <PriceTrendChart
        city={property.city}
        location={property.location}
        propertyType={property.propertyType}
        propertyPurpose={property.propertyPurpose}
        sizeRange={sizeRange}
      />
    );

  const renderTrends = () => (
    <TrendingLocationsChart city={property?.city || "Lahore"} days={30} />
  );

  // ------------------------------------------------------------------
  // Unified enquiry form (replaces both EnquiryForm and guest modal)
  // ------------------------------------------------------------------
  const [enquiryForm, setEnquiryForm] = useState({
    name: "",
    email: "",
    phone: "+92",
    message: "I would like to inquire about this property. Please contact me.",
    userType: "Buyer/Tenant",
  });
  const [enquirySubmitting, setEnquirySubmitting] = useState(false);

  const handleEnquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEnquirySubmitting(true);
    try {
      await api.post("/api/enquiry", {
        propertyId: property?.id,
        senderName: enquiryForm.name,
        senderEmail: enquiryForm.email,
        phone: enquiryForm.phone,
        message: enquiryForm.message,
        enquiryType: enquiryForm.userType === "Agent" ? "Agent" : "General",
        role: enquiryForm.userType,
      });
      setSnackbar({
        open: true,
        message: "Enquiry sent!",
        severity: "success",
      });
      
      setEnquiryForm({
        name: "",
        email: "",
        phone: "+92",
        message: "",
        userType: "Buyer/Tenant",
      });
    } catch (err) {
      console.log("Price Trend",err);
      setSnackbar({
        open: true,
        message: "Failed to send enquiry.",
        severity: "error",
      });
    } finally {
      setEnquirySubmitting(false);
    }
  };

  // Sidebar agent – contains agent info + enquiry form
  const renderAgentSidebar = () => {
    const agent = property?.agent;
    return (
      <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {/* Agent info */}
          {agent && (
            <>
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
                      color="text.secondary"
                      sx={{ mt: 0.5 }}
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
              {/* {agent.contactNumber && (
                <Typography variant="body2">
                  <strong>Phone:</strong> {agent.contactNumber}
                </Typography>
              )}
              {agent.contactEmail && (
                <Typography variant="body2">
                  <strong>Email:</strong> {agent.contactEmail}
                </Typography>
              )} */}
            </>
          )}

          {/* WhatsApp & Call buttons */}
          {agent?.contactNumber && (
            <Box sx={{ display: "flex", gap: 1 }}>
              <Button
                variant="contained"
                startIcon={<WhatsAppIcon />}
                href={`https://wa.me/${agent.contactNumber.replace(/^0/, "92")}`}
                target="_blank"
                sx={{
                  bgcolor: "#25D366",
                  "&:hover": { bgcolor: "#128C7E" },
                  textTransform: "none",
                }}
              >
                WhatsApp
              </Button>
              <Button
                variant="contained"
                startIcon={<PhoneIcon />}
                href={`tel:${agent.contactNumber}`}
                target="_blank"
                sx={{
                  bgcolor: "#4caf50",
                  "&:hover": { bgcolor: "#388e3c" },
                  textTransform: "none",
                }}
              >
                Call
              </Button>
            </Box>
          )}

          {/* Enquiry form – always visible, no login required */}
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mt: 1 }}>
            Send an enquiry
          </Typography>
          <form onSubmit={handleEnquirySubmit}>
            <Stack spacing={2}>
              <TextField
                label="Name"
                required
                fullWidth
                value={enquiryForm.name}
                onChange={(e) =>
                  setEnquiryForm((prev) => ({ ...prev, name: e.target.value }))
                }
              />
              <TextField
                label="Email"
                type="email"
                required
                fullWidth
                value={enquiryForm.email}
                onChange={(e) =>
                  setEnquiryForm((prev) => ({ ...prev, email: e.target.value }))
                }
              />
              <TextField
                label="Phone"
                required
                fullWidth
                value={enquiryForm.phone}
                onChange={(e) =>
                  setEnquiryForm((prev) => ({ ...prev, phone: e.target.value }))
                }
              />
              <TextField
                label="Message"
                multiline
                rows={3}
                fullWidth
                value={enquiryForm.message}
                onChange={(e) =>
                  setEnquiryForm((prev) => ({
                    ...prev,
                    message: e.target.value,
                  }))
                }
              />

              <Typography variant="body2" sx={{ mt: 1 }}>
                I am a:
              </Typography>
              <RadioGroup
                row
                value={enquiryForm.userType}
                onChange={(e) =>
                  setEnquiryForm((prev) => ({
                    ...prev,
                    userType: e.target.value,
                  }))
                }
              >
                <FormControlLabel
                  value="Buyer/Tenant"
                  control={<Radio />}
                  label="Buyer/Tenant"
                />
                <FormControlLabel
                  value="Agent"
                  control={<Radio />}
                  label="Agent"
                />
                <FormControlLabel
                  value="Other"
                  control={<Radio />}
                  label="Other"
                />
              </RadioGroup>

              <Button
                type="submit"
                variant="contained"
                fullWidth
                disabled={enquirySubmitting}
                startIcon={<EmailIcon />}
              >
                {enquirySubmitting ? "Sending…" : "Send enquiry"}
              </Button>
            </Stack>
          </form>
        </Box>
      </Paper>
    );
  };

  const renderPopularSearches = () => (
    <Box sx={{ mt: 5, pt: 2, borderTop: "1px solid", borderColor: "divider" }}>
      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
        Popular searches
      </Typography>
      <Stack direction="row" spacing={2} sx={{ flexWrap: "wrap", gap: 1 }}>
        {[
          "Furnished Flats For Sale in Bahria Town Islamabad",
          "Low Price Flats For Sale in Bahria Town Islamabad",
          "Luxury Flats For Sale in Bahria Town Islamabad",
        ].map((text) => (
          <Chip
            key={text}
            label={text}
            clickable
            component="a"
            href={`/properties?q=${encodeURIComponent(text)}`}
            variant="outlined"
          />
        ))}
      </Stack>
    </Box>
  );

  if (loading)
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress size={60} />
      </Box>
    );
  if (error || !property)
    return (
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Alert severity="error">{error || "Property not found"}</Alert>
      </Container>
    );

  return (
    <Box sx={{ minHeight: "100vh" }}>
      {/* Breadcrumb + back button */}
      <Container maxWidth="lg" sx={{ mt: 10, mb: 2 }}>
        <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />}>
          <Link
            href="/"
            style={{
              textDecoration: "none",
              color: theme.palette.text.primary,
            }}
          >
            Zameen
          </Link>
          <Link
            href={`/properties?city=${property.city}`}
            style={{
              textDecoration: "none",
              color: theme.palette.text.primary,
            }}
          >
            {property.city} {property.propertyType?.toLowerCase()}s
          </Link>
          <Typography color="text.primary">
            {property.title.substring(0, 50)}...
          </Typography>
        </Breadcrumbs>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => router.back()}
          sx={{ mt: 1 }}
        >
          Back to Search
        </Button>
      </Container>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
        <Typography variant="h3" sx={{ fontWeight: 700, mb: 2 }}>
          {property.title}
        </Typography>

        <Grid container spacing={4}>
          <Grid size={{ xs: 12, md: 8 }}>
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
              <ImageSlider images={pics} />
              <Box
                sx={{
                  position: "absolute",
                  bottom: 16,
                  left: 16,
                  display: "flex",
                  gap: 1,
                }}
              >
                <Chip
                  icon={<CameraAltIcon />}
                  label={`${pics.length}`}
                  size="small"
                  sx={{ bgcolor: "rgba(0,0,0,0.7)", color: "white" }}
                />
                <Chip
                  icon={<LocationOnIcon />}
                  label="Map"
                  size="small"
                  sx={{
                    bgcolor: "rgba(0,0,0,0.7)",
                    color: "white",
                    cursor: "pointer",
                  }}
                  onClick={() =>
                    document
                      .getElementById("location")
                      ?.scrollIntoView({ behavior: "smooth" })
                  }
                />
              </Box>
            </Box>

            {/* Full‑width sticky rounded pill tabs */}
            <StickyTabsWrapper>
              <Container maxWidth="lg" sx={{ p: 0 }}>
                <StyledTabs
                  value={tabValue}
                  onChange={handleTabChange}
                  variant="scrollable"
                  scrollButtons="auto"
                  sx={{ "& .MuiTabs-indicator": { display: "none" } }}
                >
                  <Tab label="Overview" />
                  <Tab label="Location & Nearby" />
                  <Tab label="Price Index" />
                  <Tab label="Trends" />
                </StyledTabs>
              </Container>
            </StickyTabsWrapper>

            <div ref={overviewRef} id="overview">
              <Typography variant="h4" sx={{ fontWeight: 600, mb: 3 }}>
                Overview
              </Typography>
              {renderDetails()}
              {renderDescription()}
              {renderAmenitiesSection()}
            </div>
            <div ref={locationRef} id="location">
              {renderLocationMap()}
            </div>
            <div ref={financeRef} id="finance">
              {renderHomeFinance()}
            </div>
            <div ref={priceIndexRef} id="price-index">
              {renderPriceTrend()}
            </div>
            <div ref={trendsRef} id="trends">
              {renderTrends()}
            </div>

            {/* Similar properties */}
            {!loadingSimilar && similarByLocation.length > 0 && (
              <PropertyCarousel
                properties={similarByLocation}
                title={`Similar ${property.propertyType}s around ${property.location || property.city}`}
              />
            )}
            {!loadingSimilar && similarByAgent.length > 0 && (
              <PropertyCarousel
                properties={similarByAgent}
                title={`Similar ${property.propertyType}s by ${property.agent?.agencyName || "this agent"}`}
              />
            )}
            {loadingSimilar && (
              <Box sx={{ display: "flex", gap: 2, overflowX: "auto", mb: 4 }}>
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton
                    key={i}
                    variant="rectangular"
                    width={280}
                    height={300}
                    sx={{ borderRadius: 2, flexShrink: 0 }}
                  />
                ))}
              </Box>
            )}
            <SafetyTips />
            {renderPopularSearches()}
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>{renderAgentSidebar()}</Grid>
        </Grid>
      </Container>

      {/* Loan Application Modal */}
      <LoanApplicationModal
        open={loanModalOpen}
        onClose={() => setLoanModalOpen(false)}
        propertyId={property.id}
        propertyPrice={property.price}
        onSuccess={() =>
          setSnackbar({
            open: true,
            message: "Loan application submitted!",
            severity: "success",
          })
        }
      />

      {/* Global snackbar */}
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
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
