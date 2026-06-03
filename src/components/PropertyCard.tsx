import { useState } from "react";
import {
  Card,
  CardMedia,
  CardContent,
  Typography,
  Button,
  Box,
  Chip,
  Stack,
  IconButton,
  Avatar,
} from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { PropertyResponse } from "@/lib/types";
import Link from "next/link";

const formatPrice = (price: number) =>
  new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    maximumFractionDigits: 0,
  }).format(price);

export default function PropertyCard({
  property,
}: {
  property: PropertyResponse;
}) {
  const pics = property.propertyPics?.length
    ? property.propertyPics
    : ["/placeholder-property.jpg"];
  const [currentIndex, setCurrentIndex] = useState(0);

  const goToPrev = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? pics.length - 1 : prev - 1));
  };

  const goToNext = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === pics.length - 1 ? 0 : prev + 1));
  };

  return (
    <Link
      href={`/property/${property.id}`}
      style={{ textDecoration: "none", height: "100%" }}
    >
      <Card
        sx={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          borderRadius: 3,
          boxShadow: 3,
          position: "relative",
          overflow: "visible",
          cursor: "pointer",
          transition: "transform 0.2s, box-shadow 0.2s",
          "&:hover": {
            transform: "translateY(-4px)",
            boxShadow: 6,
          },
        }}
      >
        {/* Image Slider Container */}
        <Box sx={{ position: "relative", height: 200, overflow: "hidden" }}>
          <CardMedia
            component="img"
            height="200"
            image={pics[currentIndex]}
            alt={`${property.title} - image ${currentIndex + 1}`}
            sx={{ objectFit: "cover", transition: "opacity 0.3s ease" }}
          />

          {/* Left/Right Arrows (visible on hover) */}
          {pics.length > 1 && (
            <>
              <IconButton
                onClick={goToPrev}
                size="small"
                sx={{
                  position: "absolute",
                  left: 8,
                  top: "50%",
                  transform: "translateY(-50%)",
                  bgcolor: "rgba(255,255,255,0.8)",
                  opacity: 0,
                  transition: "opacity 0.2s",
                  "&:hover": { bgcolor: "white" },
                  ".MuiCard-root:hover &": { opacity: 1 },
                }}
              >
                <ChevronLeftIcon fontSize="small" />
              </IconButton>
              <IconButton
                onClick={goToNext}
                size="small"
                sx={{
                  position: "absolute",
                  right: 8,
                  top: "50%",
                  transform: "translateY(-50%)",
                  bgcolor: "rgba(255,255,255,0.8)",
                  opacity: 0,
                  transition: "opacity 0.2s",
                  "&:hover": { bgcolor: "white" },
                  ".MuiCard-root:hover &": { opacity: 1 },
                }}
              >
                <ChevronRightIcon fontSize="small" />
              </IconButton>
            </>
          )}

          {/* Dot Indicators */}
          {pics.length > 1 && (
            <Box
              sx={{
                position: "absolute",
                bottom: 8,
                left: "50%",
                transform: "translateX(-50%)",
                display: "flex",
                gap: 0.5,
              }}
            >
              {pics.map((_, idx) => (
                <Box
                  key={idx}
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    backgroundColor:
                      idx === currentIndex ? "white" : "rgba(255,255,255,0.5)",
                    transition: "background-color 0.2s",
                  }}
                />
              ))}
            </Box>
          )}
        </Box>

        <CardContent sx={{ flexGrow: 1 }}>
          <Typography variant="h6" component="div" gutterBottom noWrap>
            {property.title}
          </Typography>
          <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
            <Chip label={property.propertyType} size="small" color="primary" />
          </Stack>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {property.city} – {property.address}
          </Typography>
          <Typography variant="h6" color="primary" sx={{ mb: 1 }}>
            {formatPrice(property.price)}
          </Typography>
          <Stack direction="row" spacing={2}>
            <Typography variant="body2">
              <strong>{property.bedrooms}</strong> Beds
            </Typography>
            <Typography variant="body2">
              <strong>{property.bathrooms}</strong> Baths
            </Typography>
            <Typography variant="body2">
              <strong>{property.areaSize}</strong> {property.areaUnit}
            </Typography>
          </Stack>

          {/* Agent Info */}
          <Box
            sx={{
              mt: 2,
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            <Avatar
              src={property.agent?.profilePic || undefined}
              alt={property.agent?.agencyName || "Agent"}
              sx={{ width: 28, height: 28 }}
            >
              {property.agent?.agencyName?.[0]?.toUpperCase() || "A"}
            </Avatar>
            <Typography variant="caption" color="text.secondary">
              {property.agent?.agencyName || "Unknown Agent"}
            </Typography>
          </Box>
        </CardContent>

        {/* View Details Button (kept for convenience) */}
        <Box sx={{ px: 2, pb: 2 }}>
          <Button
            variant="contained"
            fullWidth
            component="span" // prevent nested <a> inside <a>; Link wrapping handles navigation
            onClick={(e) => e.stopPropagation()} // stop Link navigation on button click
            sx={{ pointerEvents: "none" }} // let the Link handle the click
          >
            View Details
          </Button>
        </Box>
      </Card>
    </Link>
  );
}
