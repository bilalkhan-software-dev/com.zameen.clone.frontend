"use client";

import { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Box,
  Button,
  TextField,
  Avatar,
  CircularProgress,
  Alert,
  Snackbar,
  LinearProgress,
} from "@mui/material";
import api from "@/lib/axios";

// Cloudinary credentials (same as used for property images)
const CLOUDINARY_CLOUD_NAME = "dkkgqafqw";
const CLOUDINARY_UPLOAD_PRESET = "your-social";
const MAX_FILE_SIZE_MB = 2;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

interface AgentProfile {
  id: string;
  userId: string;
  agencyName: string;
  profilePic?: string | null;
  accountStatus?: string;
  bio?: string | null;
}

export default function AgentProfilePage() {
  const [profile, setProfile] = useState<AgentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form fields
  const [agencyName, setAgencyName] = useState("");
  const [bio, setBio] = useState("");
  const [profilePic, setProfilePic] = useState<string | null>(null);

  // Image upload
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Snackbar
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({ open: false, message: "", severity: "success" });

  const handleCloseSnackbar = () =>
    setSnackbar((prev) => ({ ...prev, open: false }));

  // Fetch agent profile
  useEffect(() => {
    (async () => {
      try {
        const res = await api.get("/api/Agent/me");
        const data = res.data.data;
        setProfile(data);
        setAgencyName(data.agencyName || "");
        setBio(data.bio || "");
        setProfilePic(data.profilePic || null);
      } catch (err: any) {
        setSnackbar({
          open: true,
          message: err.response?.data?.message || "Failed to load profile",
          severity: "error",
        });
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Handle file selection and validation
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];

    if (file.size > MAX_FILE_SIZE_BYTES) {
      setSnackbar({
        open: true,
        message: `File size must be less than ${MAX_FILE_SIZE_MB}MB.`,
        severity: "error",
      });
      e.target.value = "";
      return;
    }

    setSelectedFile(file);
  };

  // Upload selected file to Cloudinary and return the secure URL
  const uploadProfilePic = async (): Promise<string | null> => {
    if (!selectedFile) return profilePic; // no new file selected
    setUploading(true);
    setUploadProgress(0);
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

      // Simulate progress
      setUploadProgress(30);

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
        { method: "POST", body: formData },
      );
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      setUploadProgress(100);
      return data.secure_url;
    } catch (err: any) {
      setSnackbar({
        open: true,
        message: "Image upload failed.",
        severity: "error",
      });
      return null;
    } finally {
      setUploading(false);
    }
  };

  // Submit the form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    // 1. Upload image if a new file was selected
    let finalPicUrl = profilePic;
    if (selectedFile) {
      const uploadedUrl = await uploadProfilePic();
      if (uploadedUrl) {
        finalPicUrl = uploadedUrl;
        setProfilePic(uploadedUrl); // update preview
      } else {
        setSaving(false);
        return; // upload failed, error already shown
      }
    }

    // 2. Build the update payload (only changed fields if you want partial, but we send full)
    const payload = {
      agencyName,
      bio,
      profilePic: finalPicUrl,
    };

    try {
      await api.put("/api/Agent/me", payload);
      setSnackbar({
        open: true,
        message: "Profile updated successfully!",
        severity: "success",
      });
      setSelectedFile(null);
    } catch (err: any) {
      setSnackbar({
        open: true,
        message: err.response?.data?.message || "Failed to update profile",
        severity: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!profile) {
    return <Alert severity="warning">No agent profile found.</Alert>;
  }

  return (
    <Container maxWidth="sm">
      <Typography variant="h4" gutterBottom>
        Agent Profile
      </Typography>

      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{ display: "flex", flexDirection: "column", gap: 3 }}
      >
        {/* Avatar / Profile Picture */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 2,
          }}
        >
          <Avatar
            src={profilePic || undefined}
            alt={agencyName}
            sx={{
              width: 120,
              height: 120,
              border: "4px solid",
              borderColor: "primary.main",
            }}
          />
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <Button variant="outlined" component="label" disabled={uploading}>
              {profilePic ? "Change Photo" : "Upload Photo"}
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={handleFileChange}
              />
            </Button>
            {selectedFile && !uploading && (
              <Box
                sx={{ mt: 1, display: "flex", alignItems: "center", gap: 1 }}
              >
                <Typography variant="caption">{selectedFile.name}</Typography>
                <Button
                  size="small"
                  variant="text"
                  onClick={() => setSelectedFile(null)}
                >
                  Cancel
                </Button>
              </Box>
            )}
            {uploading && (
              <Box sx={{ width: "100%", mt: 1 }}>
                <LinearProgress variant="determinate" value={uploadProgress} />
                <Typography variant="caption">Uploading...</Typography>
              </Box>
            )}
          </Box>
        </Box>

        <TextField
          label="Agency Name"
          required
          fullWidth
          value={agencyName}
          onChange={(e) => setAgencyName(e.target.value)}
        />

        <TextField
          label="Bio"
          fullWidth
          multiline
          rows={3}
          value={bio}
          onChange={(e) => setBio(e.target.value)}
        />

        <Box sx={{ display: "flex", gap: 2 }}>
          <Button
            variant="contained"
            type="submit"
            disabled={saving || uploading}
            startIcon={saving ? <CircularProgress size={20} /> : null}
          >
            {saving ? "Saving..." : "Save Changes"}
          </Button>
          <Button variant="outlined" onClick={() => window.history.back()}>
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
