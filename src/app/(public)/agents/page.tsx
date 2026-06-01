"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Box,
  Chip,
  Pagination,
  CircularProgress,
  Alert,
} from "@mui/material";
import api from "@/lib/axios";
import { AgentResponse, PagedResult } from "@/lib/types";

export default function PublicAgentsPage() {
  const [agents, setAgents] = useState<PagedResult<AgentResponse> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 9; // 3x3 grid

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
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Typography
        variant="h4"
        gutterBottom
        align="center"
        sx={{ fontWeight: 700, mb: 4 }}
      >
        Our Agents
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress />
        </Box>
      ) : !agents || agents.items.length === 0 ? (
        <Typography align="center" color="text.secondary">
          No agents found.
        </Typography>
      ) : (
        <>
          <Grid container spacing={3}>
            {agents.items.map((agent) => (
              <Grid item xs={12} sm={6} md={4} key={agent.id}>
                <Card
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    borderRadius: 2,
                  }}
                >
                  <CardMedia
                    component="img"
                    height="200"
                    image={`https://ui-avatars.com/api/?name=${encodeURIComponent(agent.agencyName)}&background=random&size=256`}
                    alt={agent.agencyName}
                    sx={{ objectFit: "cover" }}
                  />
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" gutterBottom noWrap>
                      {agent.agencyName}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 1 }}
                    >
                      {agent.bio || "No bio available."}
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

          <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
            <Pagination
              count={Math.ceil(agents.totalCount / pageSize)}
              page={page}
              onChange={(_, newPage) => setPage(newPage)}
              color="primary"
            />
          </Box>
        </>
      )}
    </Container>
  );
}
