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

interface LoanApplicationModalProps {
  open: boolean;
  onClose: () => void;
  propertyId: number;
  propertyPrice: number;
   onSuccess: () => void;
}

const CITIES = [
  "Islamabad",
  "Karachi",
  "Lahore",
  "Rawalpindi",
  "Faisalabad",
  "Gujranwala",
  "Peshawar",
  "Multan",
  "Sialkot",
  "Quetta",
  "Hyderabad",
  "Sukkur",
  "Bahawalpur",
  "Sargodha",
  "Gujrat",
  // add more as needed
];

const SALARY_RANGES = [
  "PKR 75,000 - 100,000",
  "PKR 100,000 - 200,000",
  "PKR Above 200,000",
];

export default function LoanApplicationModal({
  open,
  onClose,
  propertyId,
  propertyPrice,
  onSuccess,
}: LoanApplicationModalProps) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "+92",
    message: "",
    cnic: "",
    city: "",
    salary: "",
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
        message: `Home loan application for property ID ${propertyId}. Price: PKR ${propertyPrice.toLocaleString()}. CNIC: ${form.cnic}. Monthly Salary: ${form.salary}. City: ${form.city}. Additional message: ${form.message}`,
        enquiryType: "Loan",
        cnic: form.cnic,
        city: form.city,
        monthlySalary: form.salary,
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error(err);
      setError(
        err.response?.data?.message ||
          "Failed to submit application. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        Apply for Home Loan
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
            <Box sx={{ display: "flex", justifyContent: "center", mb: 1 }}>
              <img
                src="/vercel.svg"
                alt="HBFC"
                style={{ height: 40 }}
              />
            </Box>

            <TextField
              label="Name"
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
              placeholder="+92 300 1234567"
            />
            <TextField
              label="Message"
              multiline
              rows={3}
              fullWidth
              value={form.message}
              onChange={(e) => handleChange("message", e.target.value)}
              placeholder="Any additional details"
            />
            <TextField
              label="CNIC"
              fullWidth
              value={form.cnic}
              onChange={(e) => handleChange("cnic", e.target.value)}
              placeholder="12345-6789012-3"
            />
            <FormControl fullWidth>
              <InputLabel>Select City</InputLabel>
              <Select
                value={form.city}
                label="Select City"
                onChange={(e) => handleChange("city", e.target.value)}
              >
                {CITIES.map((city) => (
                  <MenuItem key={city} value={city}>
                    {city}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Monthly Salary</InputLabel>
              <Select
                value={form.salary}
                label="Monthly Salary"
                onChange={(e) => handleChange("salary", e.target.value)}
              >
                {SALARY_RANGES.map((range) => (
                  <MenuItem key={range} value={range}>
                    {range}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={submitting}>
            {submitting ? <CircularProgress size={20} /> : "Apply"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
