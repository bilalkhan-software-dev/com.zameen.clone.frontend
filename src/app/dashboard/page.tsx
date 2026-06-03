"use client";

import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  CircularProgress,
} from "@mui/material";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import PeopleIcon from "@mui/icons-material/People";
import BusinessIcon from "@mui/icons-material/Business";
import HomeWorkIcon from "@mui/icons-material/HomeWork";
import EmailIcon from "@mui/icons-material/Email";

// Simple stat card component
const StatCard = ({
  title,
  value,
  icon,
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
}) => (
  <Paper
    elevation={3}
    sx={{ p: 3, display: "flex", alignItems: "center", gap: 2 }}
  >
    <Box sx={{ color: "primary.main" }}>{icon}</Box>
    <Box>
      <Typography variant="body2" color="text.secondary">
        {title}
      </Typography>
      <Typography variant="h5">{value}</Typography>
    </Box>
  </Paper>
);

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const [stats, setStats] = useState<{
    users?: number;
    agents?: number;
    properties?: number;
    enquiries?: number;
  } | null>(null);

  // Fetch admin/agent stats if needed
  useEffect(() => {
    if (!user) return;
    // Admin stats
    if (user.roles?.includes("Admin")) {
      
      // For demonstration, we set dummy values. In production, create an API like /api/admin/stats
      setStats({ users: 150, agents: 42, properties: 320, enquiries: 89 });
    }
    // Agent stats
    else if (user.roles?.includes("Agent")) {
      
      setStats({ properties: 12, enquiries: 34 });
    }
  }, [user]);

  if (loading || !user) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  const isAdmin = user.roles?.includes("Admin");
  const isAgent = user.roles?.includes("Agent");

  // Admin Overview
  if (isAdmin) {
    return (
      <Container maxWidth="lg">
        <Typography variant="h4" gutterBottom>
          Admin Dashboard
        </Typography>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard
              title="Total Users"
              value={stats?.users ?? "-"}
              icon={<PeopleIcon fontSize="large" />}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard
              title="Agents"
              value={stats?.agents ?? "-"}
              icon={<BusinessIcon fontSize="large" />}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard
              title="Properties"
              value={stats?.properties ?? "-"}
              icon={<HomeWorkIcon fontSize="large" />}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard
              title="Enquiries"
              value={stats?.enquiries ?? "-"}
              icon={<EmailIcon fontSize="large" />}
            />
          </Grid>
        </Grid>
      </Container>
    );
  }

  // Agent Overview
  if (isAgent) {
    return (
      <Container maxWidth="lg">
        <Typography variant="h4" gutterBottom>
          Agent Dashboard
        </Typography>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <StatCard
              title="My Properties"
              value={stats?.properties ?? "-"}
              icon={<HomeWorkIcon fontSize="large" />}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <StatCard
              title="New Enquiries"
              value={stats?.enquiries ?? "-"}
              icon={<EmailIcon fontSize="large" />}
            />
          </Grid>
        </Grid>
      </Container>
    );
  }

  // Default User Overview
  return (
    <Container maxWidth="sm">
      <Typography variant="h4" gutterBottom>
        Welcome, {user.fullName}
      </Typography>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="body1">
          <strong>Email:</strong> {user.email}
        </Typography>
        <Typography variant="body1">
          <strong>Username:</strong> {user.userName}
        </Typography>
        <Typography variant="body1">
          <strong>Phone:</strong> {user.phoneNumber || "N/A"}
        </Typography>
        <Typography variant="body1">
          <strong>Account Status:</strong> {user.accountStatus || "N/A"}
        </Typography>
        <Typography variant="body1">
          <strong>Roles:</strong> {user.roles?.join(", ") || "User"}
        </Typography>
      </Paper>
    </Container>
  );
}
