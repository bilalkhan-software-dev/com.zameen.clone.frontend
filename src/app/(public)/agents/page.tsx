"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Box,
  Chip,
  Pagination,
  CircularProgress,
  Alert,
  Avatar,
} from "@mui/material";
import api from "@/lib/axios";
import { AgentResponse, PagedResult } from "@/lib/types";

export default function PublicAgentsPage() {
  const [agents, setAgents] = useState<PagedResult<AgentResponse> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 9;

  const fetchAgents = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/api/Agent", {
        params: { page, size: pageSize, sortBy: "CreatedAt", descending: true },
      });
      setAgents(res.data.data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load agents");
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchAgents();
  }, [fetchAgents]);

  return (
    <>
      {/* Hero Banner */}
      <Box
        sx={{
          background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
          color: "white",
          py: 18,
          textAlign: "center",
        }}
      >
        <Container maxWidth="md">
          <Typography variant="h3" sx={{ fontWeight: 800, mb: 1 }}>
            Our Agents
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.9 }}>
            Meet our trusted real‑estate professionals
          </Typography>
        </Container>
      </Box>

      {/* Agents Grid */}
      <Container maxWidth="lg" sx={{ py: 6 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
            <CircularProgress size={60} />
          </Box>
        ) : !agents || agents.items.length === 0 ? (
          <Typography align="center" sx={{ color: "text.secondary", py: 4 }}>
            No agents found.
          </Typography>
        ) : (
          <>
            <Grid container spacing={4}>
              {agents.items.map((agent) => (
                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={agent.id}>
                  <Card
                    sx={{
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      textAlign: "center",
                      borderRadius: 4,
                      boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
                      transition: "transform 0.2s, box-shadow 0.2s",
                      "&:hover": {
                        transform: "translateY(-6px)",
                        boxShadow: "0 12px 28px rgba(0,0,0,0.15)",
                      },
                    }}
                  >
                    <Box sx={{ pt: 4 }}>
                      <Avatar
                        src={
                          agent.profilePic ||
                          `https://ui-avatars.com/api/?name=${encodeURIComponent(agent.agencyName)}&background=random&size=256`
                        }
                        alt={agent.agencyName}
                        sx={{
                          width: 120,
                          height: 120,
                          mx: "auto",
                          border: "4px solid",
                          borderColor: "primary.main",
                        }}
                      />
                    </Box>
                    <CardContent sx={{ flexGrow: 1, px: 3, pb: 3 }}>
                      <Typography
                        variant="h6"
                        sx={{ fontWeight: 600, mb: 0.5 }}
                        noWrap
                      >
                        {agent.agencyName}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ color: "text.secondary", mb: 2, minHeight: 40 }}
                      >
                        {agent.bio || "Experienced real‑estate agent"}
                      </Typography>
                      <Chip
                        label={agent.accountStatus}
                        color={
                          agent.accountStatus === "APPROVED"
                            ? "success"
                            : agent.accountStatus === "REJECTED"
                              ? "error"
                              : "warning"
                        }
                        size="small"
                      />
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>

            <Box sx={{ display: "flex", justifyContent: "center", mt: 6 }}>
              <Pagination
                count={Math.ceil(agents.totalCount / pageSize)}
                page={page}
                onChange={(_, newPage) => setPage(newPage)}
                color="primary"
                size="large"
              />
            </Box>
          </>
        )}
      </Container>
    </>
  );
}
