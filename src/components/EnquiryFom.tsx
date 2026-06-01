"use client";

import { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
} from "@mui/material";
import { useEnquiry } from "@/hooks/useEnquiry";
import { CreateEnquiryRequest } from "@/lib/types";

interface Props {
  propertyId: number;
  onSuccess?: () => void; // optional callback after successful submission
}

export default function EnquiryForm({ propertyId, onSuccess }: Props) {
  const { sendEnquiry, loading, error, success, resetStatus } = useEnquiry();
  const [form, setForm] = useState<Omit<CreateEnquiryRequest, "propertyId">>({
    senderName: "",
    senderEmail: "",
    phone: "",
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    resetStatus();
    const result = await sendEnquiry({ ...form, propertyId });
    if (result) {
      setForm({ senderName: "", senderEmail: "", phone: "", message: "" });
      onSuccess?.();
    }
  };

  const handleChange =
    (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm({ ...form, [field]: e.target.value });
    };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}
    >
      <Typography variant="h6" gutterBottom>
        Send an Enquiry
      </Typography>

      <TextField
        label="Your Name"
        required
        fullWidth
        value={form.senderName}
        onChange={handleChange("senderName")}
      />
      <TextField
        label="Email"
        type="email"
        required
        fullWidth
        value={form.senderEmail}
        onChange={handleChange("senderEmail")}
      />
      <TextField
        label="Phone (optional)"
        fullWidth
        value={form.phone}
        onChange={handleChange("phone")}
      />
      <TextField
        label="Message"
        required
        fullWidth
        multiline
        rows={4}
        value={form.message}
        onChange={handleChange("message")}
      />

      {error && <Alert severity="error">{error}</Alert>}
      {success && <Alert severity="success">Your enquiry has been sent!</Alert>}

      <Button
        type="submit"
        variant="contained"
        size="large"
        disabled={loading}
        startIcon={
          loading ? <CircularProgress size={20} color="inherit" /> : null
        }
      >
        {loading ? "Sending..." : "Send Enquiry"}
      </Button>
    </Box>
  );
}
