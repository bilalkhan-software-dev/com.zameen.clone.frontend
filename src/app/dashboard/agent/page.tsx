"use client";

import { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Box,
  Grid,
  Paper,
  Card,
  CardContent,
  Button,
  Divider,
  CircularProgress,
  Alert,
} from "@mui/material";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/axios";
import HomeWorkIcon from "@mui/icons-material/HomeWork";
import EmailIcon from "@mui/icons-material/Email";
import VisibilityIcon from "@mui/icons-material/Visibility";
import AddIcon from "@mui/icons-material/Add";
import Link from "next/link";

// Simple stat card
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

export default function AgentDashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const [stats, setStats] = useState<{
    totalProperties?: number;
    activeProperties?: number;
    pendingProperties?: number;
    totalEnquiries?: number;
    recentEnquiries?: number;
  } | null>(null);
  const [recentProperties, setRecentProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !user.roles?.includes("Agent")) return;

    const fetchAgentData = async () => {
      try {
        // Fetch agent's properties (first page, small size for recent overview)
        const propertiesRes = await api.get("/api/Property/my-properties", {
          params: { page: 1, size: 5, sortBy: "CreatedAt", isDescending: true },
        });
        const properties = propertiesRes.data.data;
        setRecentProperties(properties.items);

        // Fetch stats (you could have a dedicated stats endpoint, but we approximate)
        const allPropertiesRes = await api.get("/api/Property/my-properties", {
          params: { page: 1, size: 1 }, // just to get total count
        });
        const totalProperties = allPropertiesRes.data.data.totalCount;

        // Count active and pending (simplified – you'd need an API for this, but we mock)
        const activeRes = await api.get("/api/Property/my-properties", {
          params: { page: 1, size: 1, status: "APPROVED" },
        });
        const pendingRes = await api.get("/api/Property/my-properties", {
          params: { page: 1, size: 1, status: "PENDING" },
        });

        setStats({
          totalProperties,
          activeProperties: activeRes.data.data.totalCount,
          pendingProperties: pendingRes.data.data.totalCount,
          totalEnquiries: 0, // You'll need an enquiry endpoint that returns count per agent
          recentEnquiries: 0,
        });
      } catch (err) {
        console.error("Failed to load agent dashboard", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAgentData();
  }, [user]);

  if (authLoading || loading) {
    return (
      <Box sx={{ mt: 8, display: "flex", justifyContent: "center" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!user || !user.roles?.includes("Agent")) {
    return <Alert severity="error">Access denied. You are not an agent.</Alert>;
  }

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" gutterBottom>
        Agent Dashboard
      </Typography>

      {/* Stats Overview */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Total Properties"
            value={stats?.totalProperties ?? "-"}
            icon={<HomeWorkIcon fontSize="large" />}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Active Listings"
            value={stats?.activeProperties ?? "-"}
            icon={<VisibilityIcon fontSize="large" />}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Pending Approval"
            value={stats?.pendingProperties ?? "-"}
            icon={<HomeWorkIcon fontSize="large" />}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Total Enquiries"
            value={stats?.totalEnquiries ?? "-"}
            icon={<EmailIcon fontSize="large" />}
          />
        </Grid>
      </Grid>

      {/* Quick Actions & Recent Properties */}
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Quick Actions
            </Typography>
            <Button
              component={Link}
              href="/dashboard/agent/properties"
              variant="contained"
              fullWidth
              startIcon={<HomeWorkIcon />}
              sx={{ mb: 2 }}
            >
              Manage Properties
            </Button>
            <Button
              component={Link}
              href="/dashboard/agent/properties/new"
              variant="outlined"
              fullWidth
              startIcon={<AddIcon />}
              sx={{ mb: 2 }}
            >
              Add New Property
            </Button>
            <Button
              component={Link}
              href="/dashboard/agent/enquiries"
              variant="outlined"
              fullWidth
              startIcon={<EmailIcon />}
            >
              View Enquiries
            </Button>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 8 }}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Recent Properties
            </Typography>
            {recentProperties.length === 0 ? (
              <Typography color="text.secondary">
                No properties yet. Start by adding your first listing.
              </Typography>
            ) : (
              recentProperties.map((property) => (
                <Card key={property.id} sx={{ mb: 2 }}>
                  <CardContent
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Box>
                      <Typography variant="subtitle1">
                        {property.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {property.city} – PKR {property.price.toLocaleString()}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Status: {property.status} | {property.bedrooms} bed(s) |{" "}
                        {property.areaSize} {property.areaUnit}
                      </Typography>
                    </Box>
                    <Button
                      component={Link}
                      href={`/property/${property.id}`}
                      size="small"
                      variant="outlined"
                    >
                      View
                    </Button>
                  </CardContent>
                </Card>
              ))
            )}
            <Divider sx={{ my: 2 }} />
            <Button
              component={Link}
              href="/dashboard/agent/properties"
              fullWidth
            >
              View All Properties
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}
