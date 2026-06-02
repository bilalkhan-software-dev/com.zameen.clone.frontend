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
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { useRouter } from "next/navigation";
import api from "@/lib/axios";
import { CreatePropertyRequest } from "@/lib/types";

const propertyTypeOptions = ["HOUSE", "FLAT", "COMMERCIAL", "SHOP"];
const areaUnitOptions = ["MARLA", "KANAL", "SQUARE_FEET"];

const CLOUDINARY_CLOUD_NAME = "dkkgqafqw";
const CLOUDINARY_UPLOAD_PRESET = "your-social";

const MAX_FILES = 5;
const MAX_FILE_SIZE_MB = 2;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

export default function AddPropertyPage() {
  const router = useRouter();

  const [form, setForm] = useState<CreatePropertyRequest>({
    title: "",
    description: "",
    price: 0,
    city: "",
    address: "",
    propertyPics: [],
    bedrooms: 0,
    bathrooms: 0,
    areaSize: 0,
    areaUnit: "MARLA",
    propertyType: "HOUSE",
  });

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

  // Validate and set the single selected file
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];

    // Check total uploaded count
    if (uploadedUrls.length >= MAX_FILES) {
      setSnackbar({
        open: true,
        message: `You can only upload a maximum of ${MAX_FILES} images.`,
        severity: "error",
      });
      e.target.value = "";
      return;
    }

    // Check file size
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

  // Upload the single selected file to Cloudinary
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

  // Upload the currently selected file, then add its URL to the list
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
      // Clear the file input
      const input = document.querySelector(
        'input[type="file"]',
      ) as HTMLInputElement;
      if (input) input.value = "";
    } catch (err: any) {
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

  // Remove an uploaded image by index
  const removeImage = (index: number) => {
    setUploadedUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload: CreatePropertyRequest = {
      ...form,
      propertyPics: uploadedUrls,
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

  return (
    <Container maxWidth="md">
      <Typography variant="h4" gutterBottom>
        Add New Property
      </Typography>

      <Box component="form" onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          {/* All the text fields (title, description, price, etc.) remain exactly the same */}
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
              label="Bedrooms"
              type="number"
              required
              fullWidth
              value={form.bedrooms || ""}
              onChange={(e) => handleChange("bedrooms", Number(e.target.value))}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Bathrooms"
              type="number"
              required
              fullWidth
              value={form.bathrooms || ""}
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
              value={form.areaSize || ""}
              onChange={(e) => handleChange("areaSize", Number(e.target.value))}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormControl fullWidth>
              <InputLabel>Area Unit</InputLabel>
              <Select
                value={form.areaUnit}
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

          {/* ── Image Upload Section ────────────────── */}
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
                  <Button
                    size="small"
                    onClick={() => {
                      setSelectedFile(null);
                    }}
                  >
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

            {/* Preview of uploaded images */}
            {uploadedUrls.length > 0 && (
              <ImageList sx={{ mt: 2 }} cols={3} rowHeight={164}>
                {uploadedUrls.map((url, index) => (
                  <ImageListItem key={index}>
                    <img
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
