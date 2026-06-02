"use client";

import { useState } from "react";
import {
  TextField,
  Button,
  Box,
  CircularProgress,
  Snackbar,
  Alert,
} from "@mui/material";
import api from "@/lib/axios";
import { CreateEnquiryRequest } from "@/lib/types";

interface Props {
  propertyId: number;
}

export default function EnquiryForm({ propertyId }: Props) {
  const [form, setForm] = useState<Omit<CreateEnquiryRequest, "propertyId">>({
    senderName: "",
    senderEmail: "",
    phone: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({ open: false, message: "", severity: "success" });

  const handleChange =
    (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
    };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/api/Enquiry", { ...form, propertyId });
      setSnackbar({
        open: true,
        message: "Enquiry sent successfully!",
        severity: "success",
      });
      setForm({ senderName: "", senderEmail: "", phone: "", message: "" });
    } catch (err: any) {
      setSnackbar({
        open: true,
        message: err.response?.data?.message || "Failed to send enquiry",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{ display: "flex", flexDirection: "column", gap: 2 }}
    >
      <TextField
        label="Your Name"
        required
        value={form.senderName}
        onChange={handleChange("senderName")}
      />
      <TextField
        label="Email"
        type="email"
        required
        value={form.senderEmail}
        onChange={handleChange("senderEmail")}
      />
      <TextField
        label="Phone (optional)"
        value={form.phone}
        onChange={handleChange("phone")}
      />
      <TextField
        label="Message"
        required
        multiline
        rows={4}
        value={form.message}
        onChange={handleChange("message")}
      />
      <Button
        type="submit"
        variant="contained"
        disabled={loading}
        startIcon={loading ? <CircularProgress size={20} /> : null}
      >
        {loading ? "Sending..." : "Send Enquiry"}
      </Button>

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
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
