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
} from "@mui/material";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const { register } = useAuth();
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    isAgency: false,
    agencyName: "",
    bio: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register({
        email: form.email,
        password: form.password,
        fullName: form.fullName,
        isAgency: form.isAgency,
        agencyName: form.isAgency ? form.agencyName : undefined,
        bio: form.isAgency ? form.bio : undefined,
      });
      router.push("/"); // Redirect to home after signup
    } catch (err: any) {
      const msg =
        err.response?.data?.message || "Registration failed. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
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
        <TextField
          label="Password"
          name="password"
          type="password"
          required
          value={form.password}
          onChange={handleChange}
          helperText="At least 6 characters"
        />
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
              required={form.isAgency}
              value={form.agencyName}
              onChange={handleChange}
            />
            <TextField
              label="Bio"
              name="bio"
              multiline
              rows={3}
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
    </Container>
  );
}
