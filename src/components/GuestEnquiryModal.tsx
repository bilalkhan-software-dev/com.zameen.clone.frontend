"use client";

import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Stack,
  Typography,
  Box,
  IconButton,
  Alert,
  CircularProgress,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import api from "@/lib/axios";

interface GuestEnquiryModalProps {
  open: boolean;
  onClose: () => void;
  propertyId: number;
  onSuccess: () => void;
}

export default function GuestEnquiryModal({
  open,
  onClose,
  propertyId,
  onSuccess,
}: GuestEnquiryModalProps) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
    role: "" as "Agent" | "Buyer" | "Tenant" | "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      await api.post("/api/enquiry", {
        propertyId,
        senderName: form.name,
        senderEmail: form.email,
        phone: form.phone,
        message: `Enquiry from ${form.role}. ${form.message}`,
        enquiryType: "General",
        role: form.role,
      });
      onSuccess();
      onClose();
      // Reset form
      setForm({ name: "", email: "", phone: "", message: "", role: "" });
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to send enquiry.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        Send Enquiry
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{ position: "absolute", right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Stack spacing={2}>
            <FormControl fullWidth required>
              <InputLabel>I am a</InputLabel>
              <Select
                value={form.role}
                label="I am a"
                onChange={(e) => handleChange("role", e.target.value)}
              >
                <MenuItem value="Agent">Agent</MenuItem>
                <MenuItem value="Buyer">Buyer</MenuItem>
                <MenuItem value="Tenant">Tenant</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Full Name"
              required
              fullWidth
              value={form.name}
              onChange={(e) => handleChange("name", e.target.value)}
            />
            <TextField
              label="Email"
              type="email"
              required
              fullWidth
              value={form.email}
              onChange={(e) => handleChange("email", e.target.value)}
            />
            <TextField
              label="Phone"
              required
              fullWidth
              value={form.phone}
              onChange={(e) => handleChange("phone", e.target.value)}
            />
            <TextField
              label="Message"
              multiline
              rows={3}
              fullWidth
              value={form.message}
              onChange={(e) => handleChange("message", e.target.value)}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={submitting}>
            {submitting ? <CircularProgress size={20} /> : "Send"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
