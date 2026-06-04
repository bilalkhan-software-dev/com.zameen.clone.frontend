"use client";

import { useState } from "react";
import {
  TextField,
  Button,
  Container,
  Typography,
  Box,
  Divider,
  Alert,
  CircularProgress,
  IconButton,
  InputAdornment,
  Snackbar,
  FormControl,
  InputLabel,
  OutlinedInput,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const { login, loginWithGoogle } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login({ email, password });
      setOpenSnackbar(true);
      setTimeout(() => {
        router.push("/");
      }, 1500);
    } catch (err: any) {
      console.log("Login Page ", err);
      const msg =
        err.response?.data?.message ||
        "Login failed. Please check your credentials.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError("");
    setGoogleLoading(true);
    try {
      await loginWithGoogle();
      setOpenSnackbar(true);
      setTimeout(() => {
        router.push("/");
      }, 1500);
    } catch (err: any) {
      const msg = err.response?.data?.message || "Google login failed.";
      setError(msg);
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleTogglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  return (
    <Container maxWidth="xs" sx={{ mt: 8 }}>
      <Typography variant="h4" align="center" gutterBottom>
        Welcome Back
      </Typography>
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{ display: "flex", flexDirection: "column", gap: 2 }}
      >
        <TextField
          label="Email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <FormControl variant="outlined" required fullWidth>
          <InputLabel htmlFor="password-input">Password</InputLabel>
          <OutlinedInput
            id="password-input"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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
            label="Password"
          />
        </FormControl>
        {error && <Alert severity="error">{error}</Alert>}
        <Button
          variant="contained"
          type="submit"
          disabled={loading || googleLoading}
          startIcon={loading ? <CircularProgress size={20} /> : null}
        >
          {loading ? "Logging in..." : "Login"}
        </Button>
        <Divider>or</Divider>
        <Button
          variant="outlined"
          onClick={handleGoogleLogin}
          disabled={loading || googleLoading}
          startIcon={googleLoading ? <CircularProgress size={20} /> : null}
          fullWidth
        >
          {googleLoading ? "Redirecting..." : "Login with Google"}
        </Button>
        <Button onClick={() => router.push("/signup")}>
          Don&apos;t have an account? Sign Up
        </Button>
      </Box>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity="success"
          variant="filled"
          sx={{ width: "100%" }}
        >
          Login successful! Redirecting...
        </Alert>
      </Snackbar>
    </Container>
  );
}
