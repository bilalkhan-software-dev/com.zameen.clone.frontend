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
  Alert,
  CircularProgress,
} from "@mui/material";
import { useRouter } from "next/navigation";
import api from "@/lib/axios";
import { CreatePropertyRequest } from "@/lib/types";

const propertyTypeOptions = ["HOUSE", "FLAT", "COMMERCIAL", "SHOP"];
const areaUnitOptions = ["MARLA", "KANAL", "SQUARE_FEET"];

export default function AddPropertyPage() {
  const router = useRouter();
  const [form, setForm] = useState<CreatePropertyRequest>({
    Title: "",
    Description: "",
    Price: 0,
    City: "",
    Address: "",
    PropertyPics: [],
    Bedrooms: 0,
    Bathrooms: 0,
    AreaSize: 0,
    AreaUnit: "MARLA",
    PropertyType: "HOUSE",
  });
  const [imageUrls, setImageUrls] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (field: keyof CreatePropertyRequest, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Parse image URLs from comma‑separated string
    const picsArray = imageUrls
      .split(",")
      .map((url) => url.trim())
      .filter(Boolean);

    const payload: CreatePropertyRequest = {
      ...form,
      PropertyPics: picsArray,
    };

    try {
      await api.post("/api/Property", payload);
      router.push("/dashboard/agent/properties"); // go back to list
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to create property");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md">
      <Typography variant="h4" gutterBottom>
        Add New Property
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12 }}>
            <TextField
              label="Title"
              required
              fullWidth
              value={form.Title}
              onChange={(e) => handleChange("Title", e.target.value)}
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <TextField
              label="Description"
              required
              fullWidth
              multiline
              rows={4}
              value={form.Description}
              onChange={(e) => handleChange("Description", e.target.value)}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Price (PKR)"
              type="number"
              required
              fullWidth
              value={form.Price || ""}
              onChange={(e) => handleChange("Price", Number(e.target.value))}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="City"
              required
              fullWidth
              value={form.City}
              onChange={(e) => handleChange("City", e.target.value)}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Address"
              required
              fullWidth
              value={form.Address}
              onChange={(e) => handleChange("Address", e.target.value)}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Bedrooms"
              type="number"
              required
              fullWidth
              value={form.Bedrooms || ""}
              onChange={(e) => handleChange("Bedrooms", Number(e.target.value))}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Bathrooms"
              type="number"
              required
              fullWidth
              value={form.Bathrooms || ""}
              onChange={(e) =>
                handleChange("Bathrooms", Number(e.target.value))
              }
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Area Size"
              type="number"
              required
              fullWidth
              value={form.AreaSize || ""}
              onChange={(e) => handleChange("AreaSize", Number(e.target.value))}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormControl fullWidth>
              <InputLabel>Area Unit</InputLabel>
              <Select
                value={form.AreaUnit}
                label="Area Unit"
                onChange={(e) => handleChange("AreaUnit", e.target.value)}
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
                value={form.PropertyType}
                label="Property Type"
                onChange={(e) => handleChange("PropertyType", e.target.value)}
              >
                {propertyTypeOptions.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12 }}>
            <TextField
              label="Property Pictures (URLs comma separated)"
              fullWidth
              value={imageUrls}
              onChange={(e) => setImageUrls(e.target.value)}
              helperText="e.g., https://example.com/photo1.jpg, https://example.com/photo2.jpg"
            />
          </Grid>
        </Grid>

        <Box sx={{ mt: 4, display: "flex", gap: 2 }}>
          <Button
            variant="contained"
            type="submit"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            {loading ? "Creating..." : "Create Property"}
          </Button>
          <Button variant="outlined" onClick={() => router.back()}>
            Cancel
          </Button>
        </Box>
      </Box>
    </Container>
  );
}
