"use client";

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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Tooltip,
  Snackbar,
  Alert,
} from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import PhoneIcon from "@mui/icons-material/Phone";
import EmailIcon from "@mui/icons-material/Email";
import CloseIcon from "@mui/icons-material/Close";
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

  // Email dialog state
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [emailForm, setEmailForm] = useState({ name: "", email: "" });
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({ open: false, message: "", severity: "success" });

  const handleCloseSnackbar = () =>
    setSnackbar((prev) => ({ ...prev, open: false }));

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

  // Store viewed property in localStorage
  const handleCardClick = () => {
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
  };

  // Handle email dialog open
  const handleEmailClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setEmailForm({ name: "", email: "" });
    setEmailDialogOpen(true);
  };

  // Handle call – direct tel: link
  const handleCallClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (property.agent?.contactNumber) {
      window.location.href = `tel:${property.agent.contactNumber}`;
    } else {
      setSnackbar({
        open: true,
        message: "Agent contact number not available",
        severity: "error",
      });
    }
  };

  // Submit email – build mailto: URL and redirect (no API call)
  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!property.agent?.contactEmail) {
      setSnackbar({
        open: true,
        message: "Agent email address not available",
        severity: "error",
      });
      setEmailDialogOpen(false);
      return;
    }
    const subject = `Property Inquiry: ${property.title} (ID: ${property.id})`;
    const message = `Hi, I am interested in your property: ${property.title} (ID: ${property.id}). Please contact me at your earliest convenience.\n\nRegards,\n${emailForm.name}`;
    const body = `${message}\n\n---\nFrom: ${emailForm.name}\nEmail: ${emailForm.email}`;
    const mailtoLink = `mailto:${property.agent.contactEmail}?subject=${encodeURIComponent(
      subject,
    )}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoLink;
    setEmailDialogOpen(false);
  };

  const handleEmailFormChange = (field: string, value: string) => {
    setEmailForm((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <>
      <Link
        href={`/properties/${property.id}`}
        onClick={handleCardClick}
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
          {/* Image slider */}
          <Box sx={{ position: "relative", height: 200, overflow: "hidden" }}>
            <CardMedia
              component="img"
              height="200"
              image={pics[currentIndex]}
              alt={`${property.title} - image ${currentIndex + 1}`}
              sx={{ objectFit: "cover", transition: "opacity 0.3s ease" }}
            />
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
                        idx === currentIndex
                          ? "white"
                          : "rgba(255,255,255,0.5)",
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
              <Chip
                label={property.propertyType}
                size="small"
                color="primary"
              />
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
                <strong>{property.areaSize}</strong>{" "}
                {property.areaUnit || "sq.ft."}
              </Typography>
            </Stack>

            {/* Agent Info with Call & Email */}
            <Box
              sx={{
                mt: 2,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
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
              <Box sx={{ display: "flex", gap: 1 }}>
                {property.agent?.contactNumber && (
                  <Tooltip title="Call Agent">
                    <IconButton
                      size="small"
                      onClick={handleCallClick}
                      sx={{ color: "#4caf50" }}
                    >
                      <PhoneIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                )}
                {property.agent?.contactEmail && (
                  <Tooltip title="Email Agent">
                    <IconButton
                      size="small"
                      onClick={handleEmailClick}
                      sx={{ color: "#1976d2" }}
                    >
                      <EmailIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                )}
              </Box>
            </Box>
          </CardContent>

          <Box sx={{ px: 2, pb: 2 }}>
            <Button
              variant="contained"
              fullWidth
              component="span"
              onClick={(e) => e.stopPropagation()}
              sx={{ pointerEvents: "none" }}
            >
              View Details
            </Button>
          </Box>
        </Card>
      </Link>

      {/* Email Dialog – responsive, wider, only name & email */}
      <Dialog
        open={emailDialogOpen}
        onClose={() => setEmailDialogOpen(false)}
        onClick={(e) => e.stopPropagation()}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Send Email to Agent
          <IconButton
            aria-label="close"
            onClick={() => setEmailDialogOpen(false)}
            sx={{ position: "absolute", right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <form onSubmit={handleEmailSubmit}>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <TextField
                label="Your Name"
                required
                fullWidth
                value={emailForm.name}
                onChange={(e) => handleEmailFormChange("name", e.target.value)}
              />
              <TextField
                label="Your Email"
                type="email"
                required
                fullWidth
                value={emailForm.email}
                onChange={(e) => handleEmailFormChange("email", e.target.value)}
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEmailDialogOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained">
              Send Email
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Snackbar for errors */}
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
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}
