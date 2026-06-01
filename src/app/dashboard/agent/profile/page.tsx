"use client";

import {
  Container,
  Typography,
  Paper,
  Box,
  CircularProgress,
  Alert,
  Divider,
} from "@mui/material";
import { useAuth } from "@/context/AuthContext";

export default function DashboardProfilePage() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!user) {
    return <Alert severity="warning">You must be logged in.</Alert>;
  }

  return (
    <Container maxWidth="sm">
      <Typography variant="h4" gutterBottom>
        My Profile
      </Typography>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <Typography variant="h6">{user.fullName}</Typography>
          <Divider />
          <Typography>
            <strong>Email:</strong> {user.email}
          </Typography>
          <Typography>
            <strong>Username:</strong> {user.userName}
          </Typography>
          <Typography>
            <strong>Phone:</strong> {user.phoneNumber || "N/A"}
          </Typography>
          <Typography>
            <strong>Account Status:</strong> {user.accountStatus || "N/A"}
          </Typography>
          <Typography>
            <strong>Roles:</strong> {user.roles?.join(", ") || "User"}
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
}
