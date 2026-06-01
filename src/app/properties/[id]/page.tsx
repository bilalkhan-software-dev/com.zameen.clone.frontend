"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  Container,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Grid,
  Chip,
  Stack,
} from "@mui/material";
import api from "@/lib/axios";
import { PropertyResponse } from "@/lib/types";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Image from "next/image";

export default function PropertyDetail() {
  const { id } = useParams();
  const [property, setProperty] = useState<PropertyResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const res = await api.get(`/api/Property/${id}`);
        setProperty(res.data.data);
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to load property");
      } finally {
        setLoading(false);
      }
    };
    fetchProperty();
  }, [id]);

  if (loading)
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!property) return <Typography>Property not found</Typography>;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Navbar />
      <Container maxWidth="md" sx={{ flex: 1, py: 4 }}>
        <Typography variant="h4" gutterBottom>
          {property.title}
        </Typography>
        <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
          <Chip label={property.propertyType} color="primary" />
          <Chip label={property.status} color="secondary" />
        </Stack>
        <Typography variant="h5" color="primary" gutterBottom>
          PKR {property.price.toLocaleString()}
        </Typography>
        <Typography variant="body1">
          {property.description}
        </Typography>
        <Grid container spacing={2}>
          <Grid size={{ xs: 4 }}>
            <strong>City:</strong> {property.city}
          </Grid>
          <Grid size={{ xs: 6 }}>
            <strong>Address:</strong> {property.address}
          </Grid>
          <Grid size={{ xs: 4 }}>
            <strong>Bedrooms:</strong> {property.bedrooms}
          </Grid>
          <Grid size={{ xs: 4 }}>
            <strong>Bathrooms:</strong> {property.bathrooms}
          </Grid>
          <Grid size={{ xs: 4 }}>
            <strong>Area:</strong> {property.areaSize} {property.areaUnit}
          </Grid>
          <Grid size={{ xs: 12 }}>
            <strong>Agent:</strong> {property.agentName}
          </Grid>
        </Grid>
        {property.propertyPics?.length > 0 && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6">Images</Typography>
            <Grid container spacing={2}>
              {property.propertyPics.map((url, idx) => (
                <Grid size={{ xs: 6, sm: 4 }} key={idx}>
                  <Image
                    src={url}
                    alt={`${property.title} ${idx + 1}`}
                    style={{ width: "100%", borderRadius: 8 }}
                  />
                </Grid>
              ))}
            </Grid>
          </Box>
        )}
      </Container>
      <Footer />
    </Box>
  );
}
