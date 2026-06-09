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
  const [stats, setStats] = useState({
    totalProperties: 0,
    activeProperties: 0,
    pendingProperties: 0,
    totalEnquiries: 0,
  });
  const [recentProperties, setRecentProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user || !user.roles?.includes("Agent") || !user.agentId) return;

    const fetchDashboardData = async () => {
      try {
        // 1. Fetch recent 5 properties (already used)
        const recentRes = await api.get("/api/Property/my-properties", {
          params: { page: 1, size: 5, sortBy: "CreatedAt", isDescending: true },
        });
        const recentItems = recentRes.data.data.items;
        setRecentProperties(recentItems);

        // 2. Fetch total property count (use size=1 to get totalCount efficiently)
        const totalRes = await api.get("/api/Property/my-properties", {
          params: { page: 1, size: 1 },
        });
        const totalProperties = totalRes.data.data.totalCount;

        // 3. Fetch active and pending counts
        //    If your API supports filtering by status, use that; otherwise we'll filter client‑side (but that requires fetching all – not ideal).
        //    Since your backend likely doesn't have a status filter, we'll fetch all properties with a large page size just for counts.
        //    Alternatively, you can create a dedicated stats endpoint – here we'll approximate by fetching the first page with a large size (e.g., 1000) and counting.
        const allPropertiesRes = await api.get("/api/Property/my-properties", {
          params: { page: 1, size: 1000 }, // assume agent won't have more than 1000 properties
        });
        const allItems = allPropertiesRes.data.data.items;
        const activeCount = allItems.filter(
          (p: any) => p.status === "APPROVED",
        ).length;
        const pendingCount = allItems.filter(
          (p: any) => p.status === "PENDING",
        ).length;

        // 4. Fetch total enquiries count using agent ID from context
        let totalEnquiries = 0;
        if (user.agentId) {
          const enqRes = await api.get(`/api/Enquiry/agent/${user.agentId}`, {
            params: { page: 1, size: 1 },
          });
          totalEnquiries = enqRes.data.data.totalCount;
        }

        setStats({
          totalProperties,
          activeProperties: activeCount,
          pendingProperties: pendingCount,
          totalEnquiries,
        });
      } catch (err: any) {
        setError(
          err.response?.data?.message || "Failed to load dashboard data",
        );
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  if (authLoading || loading) {
    return (
      <Box sx={{ mt: 8, display: "flex", justifyContent: "center" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  if (!user || !user.roles?.includes("Agent")) {
    return <Alert severity="error">Access denied. You are not an agent.</Alert>;
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
        Agent Dashboard
      </Typography>

      {/* Stats Overview */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Total Properties"
            value={stats.totalProperties}
            icon={<HomeWorkIcon fontSize="large" />}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Active Listings"
            value={stats.activeProperties}
            icon={<VisibilityIcon fontSize="large" />}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Pending Approval"
            value={stats.pendingProperties}
            icon={<HomeWorkIcon fontSize="large" />}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Total Enquiries"
            value={stats.totalEnquiries}
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
