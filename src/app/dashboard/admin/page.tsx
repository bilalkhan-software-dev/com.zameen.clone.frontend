// app/dashboard/admin/page.tsx
"use client";

import { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Grid,
  Paper,
  Box,
  Button,
  CircularProgress,
  Alert,
} from "@mui/material";
import PeopleIcon from "@mui/icons-material/People";
import BusinessIcon from "@mui/icons-material/Business";
import HomeWorkIcon from "@mui/icons-material/HomeWork";
import EmailIcon from "@mui/icons-material/Email";
import { useRouter } from "next/navigation";
import api from "@/lib/axios";
import { useAuth } from "@/context/AuthContext";

// Reusable stat card
const StatCard = ({
  title,
  value,
  icon,
  loading,
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  loading?: boolean;
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
      {loading ? (
        <CircularProgress size={24} />
      ) : (
        <Typography variant="h5">{value}</Typography>
      )}
    </Box>
  </Paper>
);

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<{
    users: number;
    agents: number;
    properties: number;
    enquiries: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !user.roles?.includes("Admin")) return;

    const fetchStats = async () => {
      try {
        // Fetch counts from various endpoints
        const [usersRes, agentsRes, propertiesRes, enquiriesRes] =
          await Promise.allSettled([
            api.get("/api/admin/Admin/users?page=1&size=1"), // we only need totalCount
            api.get("/api/Agent?page=1&size=1"),
            api.get("/api/Property?Page=1&PageSize=1"),
            api.get("/api/Enquiry?page=1&size=1"), // if you have a global enquiry endpoint
          ]);

        const getTotalCount = (result: PromiseSettledResult<any>) =>
          result.status === "fulfilled"
            ? (result.value.data.data.totalCount ?? 0)
            : 0;

        setStats({
          users: getTotalCount(usersRes),
          agents: getTotalCount(agentsRes),
          properties: getTotalCount(propertiesRes),
          enquiries: getTotalCount(enquiriesRes),
        });
      } catch (err) {
        console.error("Failed to fetch admin stats", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user]);

  if (!user || !user.roles?.includes("Admin")) {
    return (
      <Alert severity="error">
        Access denied. You are not an administrator.
      </Alert>
    );
  }

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" gutterBottom>
        Admin Dashboard
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
         <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Total Users"
            value={stats?.users ?? "-"}
            icon={<PeopleIcon fontSize="large" />}
            loading={loading}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Agents"
            value={stats?.agents ?? "-"}
            icon={<BusinessIcon fontSize="large" />}
            loading={loading}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Properties"
            value={stats?.properties ?? "-"}
            icon={<HomeWorkIcon fontSize="large" />}
            loading={loading}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Enquiries"
            value={stats?.enquiries ?? "-"}
            icon={<EmailIcon fontSize="large" />}
            loading={loading}
          />
        </Grid>
      </Grid>

      <Typography variant="h5" gutterBottom>
        Quick Actions
      </Typography>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Button
            variant="contained"
            fullWidth
            startIcon={<PeopleIcon />}
            onClick={() => router.push("/dashboard/admin/users")}
          >
            Manage Users
          </Button>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Button
            variant="contained"
            fullWidth
            startIcon={<BusinessIcon />}
            onClick={() => router.push("/dashboard/admin/agents")}
          >
            Manage Agents
          </Button>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Button
            variant="contained"
            fullWidth
            startIcon={<HomeWorkIcon />}
            onClick={() => router.push("/dashboard/admin/properties")}
          >
            Manage Properties
          </Button>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Button
            variant="contained"
            fullWidth
            startIcon={<EmailIcon />}
            onClick={() => router.push("/dashboard/admin/enquiries")}
          >
            View Enquiries
          </Button>
        </Grid>
      </Grid>
    </Container>
  );
}
