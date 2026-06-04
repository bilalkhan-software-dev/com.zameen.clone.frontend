"use client";

import { useState } from "react";
import {
  TextField,
  Button,
  Container,
  Typography,
  Box,
  Checkbox,
  FormControlLabel,
  Alert,
  CircularProgress,
  Snackbar,
  IconButton,
  InputAdornment,
  FormControl,
  InputLabel,
  OutlinedInput,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

// Pakistani phone number validation regex
const PAKISTAN_PHONE_REGEX =
  /^(?:(?:\+92|0)(?:\d{10}|\d{3}-\d{7})|(?:03\d{9})|(?:03\d{2}-\d{7}))$/;

export default function SignupPage() {
  const { register } = useAuth();
  const router = useRouter();

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    isAgency: false,
    agencyName: "",
    contactNumber: "",
    bio: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const validatePakistaniNumber = (number: string) => {
    if (!number) return false;
    return PAKISTAN_PHONE_REGEX.test(number);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validation for agent fields if isAgency is true
    if (form.isAgency) {
      if (!form.agencyName.trim()) {
        setError("Agency Name is required for agent registration.");
        return;
      }
      if (!form.contactNumber.trim()) {
        setError("Contact Number is required for agent registration.");
        return;
      }
      if (!validatePakistaniNumber(form.contactNumber)) {
        setError(
          "Invalid Pakistani phone number. Use formats like 03XXXXXXXXX, +923XXXXXXXXX, 03xx-xxxxxxx, or +92-3xx-xxxxxxx.",
        );
        return;
      }
      if (!form.bio.trim()) {
        setError("Bio is required for agent registration.");
        return;
      }
    }

    setLoading(true);
    try {
      await register({
        email: form.email,
        password: form.password,
        fullName: form.fullName,
        isAgency: form.isAgency,
        agencyName: form.isAgency ? form.agencyName : undefined,
        contactNumber: form.contactNumber ? form.contactNumber : undefined,
        bio: form.isAgency ? form.bio : undefined,
      });
      setOpenSnackbar(true);
      // Redirect after 2 seconds
      setTimeout(() => {
        router.push("/");
      }, 2000);
    } catch (err: any) {
      const msg =
        err.response?.data?.message || "Registration failed. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  const handleTogglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <Container maxWidth="xs" sx={{ mt: 8 }}>
      <Typography variant="h4" align="center" gutterBottom>
        Create Account
      </Typography>
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{ display: "flex", flexDirection: "column", gap: 2 }}
      >
        <TextField
          label="Full Name"
          name="fullName"
          required
          value={form.fullName}
          onChange={handleChange}
        />
        <TextField
          label="Email"
          name="email"
          type="email"
          required
          value={form.email}
          onChange={handleChange}
        />
        <FormControl variant="outlined">
          <InputLabel htmlFor="password">Password</InputLabel>
          <OutlinedInput
            id="password"
            label="Password"
            name="password"
            type={showPassword ? "text" : "password"}
            required
            value={form.password}
            onChange={handleChange}
            endAdornment={
              <InputAdornment position="end">
                <IconButton
                  aria-label="toggle password visibility"
                  onClick={handleTogglePasswordVisibility}
                  edge="end"
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            }
          />
        </FormControl>
        <FormControlLabel
          control={
            <Checkbox
              name="isAgency"
              checked={form.isAgency}
              onChange={handleChange}
            />
          }
          label="Register as an agent/agency"
        />
        {form.isAgency && (
          <>
            <TextField
              label="Agency Name"
              name="agencyName"
              required
              value={form.agencyName}
              onChange={handleChange}
            />
            <TextField
              label="Contact Number"
              name="contactNumber"
              required
              value={form.contactNumber}
              onChange={handleChange}
              helperText="e.g., 03XXXXXXXXX, +923XXXXXXXXX, 03xx-xxxxxxx"
            />
            <TextField
              label="Bio"
              name="bio"
              multiline
              rows={3}
              required
              value={form.bio}
              onChange={handleChange}
            />
          </>
        )}
        {error && <Alert severity="error">{error}</Alert>}
        <Button
          variant="contained"
          type="submit"
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : null}
        >
          {loading ? "Signing up..." : "Sign Up"}
        </Button>
        <Button onClick={() => router.push("/login")}>
          Already have an account? Login
        </Button>
      </Box>

      {/* Success Snackbar */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity="success"
          variant="filled"
          sx={{ width: "100%" }}
        >
          Registration successful! Redirecting...
        </Alert>
      </Snackbar>
    </Container>
  );
}
