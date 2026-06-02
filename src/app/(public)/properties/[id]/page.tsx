// app/(public)/property/[id]/page.tsx
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
} from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import api from "@/lib/axios";
import { PropertyResponse } from "@/lib/types";
import { useAuth } from "@/context/AuthContext";
import Image from "next/image";
import EnquiryForm from "@/components/EnquiryFom";

export default function PropertyDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [property, setProperty] = useState<PropertyResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [activeImageIndex, setActiveImageIndex] = useState(0);

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

  const pics = property?.propertyPics?.length
    ? property.propertyPics
    : ["/placeholder-property.jpg"];

  const goToPrev = () => {
    setActiveImageIndex((prev) => (prev === 0 ? pics.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setActiveImageIndex((prev) => (prev === pics.length - 1 ? 0 : prev + 1));
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

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Title & Status Chips */}
      <Typography variant="h3" sx={{ fontWeight: 700, mb: 2 }}>
        {property.title}
      </Typography>
      <Stack direction="row" spacing={1} sx={{ mb: 3 }}>
        <Chip label={property.propertyType} color="primary" />
        <Chip label={property.status} color="secondary" />
      </Stack>

      {/* Hero Image Slider */}
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
        <Image
          src={pics[activeImageIndex]}
          alt={`${property.title} - ${activeImageIndex + 1}`}
          fill
          style={{ objectFit: "cover" }}
          priority
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
                  transition: "background-color 0.2s",
                }}
              />
            ))}
          </Box>
        )}
      </Box>

      {/* Price and Quick Facts */}
      <Paper elevation={2} sx={{ p: 4, mb: 4 }}>
        <Typography
          variant="h4"
          sx={{ color: "primary.main", fontWeight: 700, mb: 2 }}
        >
          PKR {property.price.toLocaleString()}
        </Typography>
        <Grid container spacing={3} sx={{ mt: 1 }}>
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
              {property.areaSize} {property.areaUnit}
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
          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography variant="subtitle2" sx={{ color: "text.secondary" }}>
              Agent
            </Typography>
            <Typography sx={{ fontWeight: 600 }}>
              {property.agentName}
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Description */}
      <Paper elevation={2} sx={{ p: 4, mb: 4 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
          Description
        </Typography>
        <Typography variant="body1" sx={{ color: "text.secondary" }}>
          {property.description}
        </Typography>
      </Paper>

      {/* Enquiry Section */}
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
          to send an enquiry about this property.
        </Alert>
      )}
    </Container>
  );
}
