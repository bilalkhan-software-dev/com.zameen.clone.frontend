"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Container,
  Typography,
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Pagination,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import api from "@/lib/axios";
import { AgentResponse, PagedResult } from "@/lib/types";

const AGENT_STATUSES = ["PENDING", "APPROVED", "REJECTED", "BANNED"];

export default function AdminAgentsPage() {
  const [agents, setAgents] = useState<PagedResult<AgentResponse> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [statusTarget, setStatusTarget] = useState<{
    agentId: string;
    currentStatus: string;
  } | null>(null);
  const [selectedStatus, setSelectedStatus] = useState("");

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

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await api.delete(`/api/Agent/${deleteTarget}`);
      setDeleteTarget(null);
      fetchAgents();
    } catch (err: any) {
      setError(err.response?.data?.message || "Deletion failed");
    }
  };

  const handleOpenStatusDialog = (agent: AgentResponse) => {
    setStatusTarget({ agentId: agent.id, currentStatus: agent.accountStatus });
    setSelectedStatus(agent.accountStatus);
  };

  const handleStatusChange = async () => {
    if (!statusTarget) return;
    try {
      await api.put(
        `/api/Agent/${statusTarget.agentId}/status`,
        selectedStatus,
        {
          headers: { "Content-Type": "application/json" },
        },
      );
      setStatusTarget(null);
      fetchAgents();
    } catch (err: any) {
      setError(err.response?.data?.message || "Status change failed");
    }
  };

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" gutterBottom>
        Agent Management
      </Typography>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress />
        </Box>
      ) : !agents || agents.items.length === 0 ? (
        <Alert severity="info">No agents found.</Alert>
      ) : (
        <Paper>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Agency Name</TableCell>
                <TableCell>Bio</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Created</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {agents.items.map((agent) => (
                <TableRow key={agent.id}>
                  <TableCell>{agent.agencyName}</TableCell>
                  <TableCell>{agent.bio || "-"}</TableCell>
                  <TableCell>
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
                  </TableCell>
                  <TableCell>
                    {new Date(agent.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell align="center">
                    {/* Always visible "Change Status" button */}
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => handleOpenStatusDialog(agent)}
                    >
                      Change Status
                    </Button>
                    <IconButton
                      color="error"
                      onClick={() => setDeleteTarget(agent.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Box sx={{ display: "flex", justifyContent: "center", p: 2 }}>
            <Pagination
              count={Math.ceil(agents.totalCount / pageSize)}
              page={page}
              onChange={(_, newPage) => setPage(newPage)}
            />
          </Box>
        </Paper>
      )}

      <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)}>
        <DialogTitle>Delete Agent?</DialogTitle>
        <DialogContent>
          <DialogContentText>Are you sure?</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteTarget(null)}>Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={!!statusTarget} onClose={() => setStatusTarget(null)}>
        <DialogTitle>Change Agent Status</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Current: <strong>{statusTarget?.currentStatus}</strong>
          </DialogContentText>
          <FormControl fullWidth size="small">
            <InputLabel>New Status</InputLabel>
            <Select
              value={selectedStatus}
              label="New Status"
              onChange={(e: SelectChangeEvent) =>
                setSelectedStatus(e.target.value)
              }
            >
              {AGENT_STATUSES.map((status) => (
                <MenuItem key={status} value={status}>
                  {status}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStatusTarget(null)}>Cancel</Button>
          <Button
            onClick={handleStatusChange}
            variant="contained"
            disabled={selectedStatus === statusTarget?.currentStatus}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
