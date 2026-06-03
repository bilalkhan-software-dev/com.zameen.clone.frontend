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
} from "@mui/material";
import api from "@/lib/axios";
import { PropertyResponse, UpdatePropertyRequest } from "@/lib/types";

const propertyTypeOptions = ["HOUSE", "FLAT", "COMMERCIAL", "SHOP"];
const areaUnitOptions = ["MARLA", "KANAL", "SQUARE_FEET"];

export default function EditPropertyPage() {
  const { id } = useParams();
  const router = useRouter();

  const [original, setOriginal] = useState<PropertyResponse | null>(null);
  const [form, setForm] = useState<UpdatePropertyRequest>({});
  const [isActive, setIsActive] = useState<boolean>(true); // local state for toggle
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
        setForm({
          title: property.title,
          description: property.description,
          price: property.price,
          city: property.city,
          address: property.address,
          bedrooms: property.bedrooms,
          bathrooms: property.bathrooms,
          areaSize: property.areaSize,
          areaUnit: property.areaUnit,
          propertyType: property.propertyType,
        });
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

  // Build partial patch payload – only changed fields
  const buildPatchPayload = (): UpdatePropertyRequest => {
    if (!original) return {};
    const patch: UpdatePropertyRequest = {};
    const fields: (keyof UpdatePropertyRequest)[] = [
      "title",
      "description",
      "price",
      "city",
      "address",
      "bedrooms",
      "bathrooms",
      "areaSize",
      "areaUnit",
      "propertyType",
    ];

    for (const field of fields) {
      const newVal = form[field];
      const oldVal = original[field as keyof PropertyResponse];
      if (newVal !== oldVal) {
        (patch as any)[field] = newVal;
      }
    }
    return patch;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const patchData = buildPatchPayload();
      if (Object.keys(patchData).length > 0) {
        await api.patch(`/api/Property/${id}`, patchData);
      }
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
          {/* All existing fields remain the same as your previous version */}
          <Grid size={{ xs: 12 }}>
            <TextField
              label="Title"
              required
              fullWidth
              value={form.title || ""}
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
              value={form.description || ""}
              onChange={(e) => handleChange("description", e.target.value)}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Price (PKR)"
              type="number"
              required
              fullWidth
              value={form.price ?? ""}
              onChange={(e) => handleChange("price", Number(e.target.value))}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="City"
              required
              fullWidth
              value={form.city || ""}
              onChange={(e) => handleChange("city", e.target.value)}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Address"
              required
              fullWidth
              value={form.address || ""}
              onChange={(e) => handleChange("address", e.target.value)}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Bedrooms"
              type="number"
              // required
              fullWidth
              value={form.bedrooms ?? ""}
              onChange={(e) =>
                handleChange(
                  "bedrooms",
                  e.target.value === "" ? "" : Number(e.target.value),
                )
              }
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Bathrooms"
              type="number"
              // required
              fullWidth
              value={form.bathrooms ?? ""}
              onChange={(e) =>
                handleChange(
                  "bathrooms",
                  e.target.value === "" ? "" : Number(e.target.value),
                )
              }
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Area Size"
              type="number"
              required
              fullWidth
              value={form.areaSize ?? ""}
              onChange={(e) => handleChange("areaSize", Number(e.target.value))}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormControl fullWidth>
              <InputLabel>Area Unit</InputLabel>
              <Select
                value={form.areaUnit || "MARLA"}
                label="Area Unit"
                onChange={(e) => handleChange("areaUnit", e.target.value)}
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
        </Grid>

        <Box sx={{ mt: 4, display: "flex", gap: 2 }}>
          <Button
            variant="contained"
            type="submit"
            disabled={saving}
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
