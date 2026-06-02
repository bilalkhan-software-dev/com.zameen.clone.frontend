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
  Snackbar,
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
  const pageSize = 10;
  const [page, setPage] = useState(1);

  // Filter state
  const [statusFilter, setStatusFilter] = useState<string>("");

  // Feedback snackbar
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({ open: false, message: "", severity: "success" });

  // Dialogs
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [statusTarget, setStatusTarget] = useState<{
    agentId: string;
    currentStatus: string;
  } | null>(null);
  const [selectedStatus, setSelectedStatus] = useState("");

  const handleCloseSnackbar = () =>
    setSnackbar((prev) => ({ ...prev, open: false }));

  const fetchAgents = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = {
        page,
        size: pageSize,
        sortBy: "CreatedAt",
        descending: true,
      };
      if (statusFilter) params.status = statusFilter;

      const res = await api.get("/api/Agent", { params });
      setAgents(res.data.data);
    } catch (err: any) {
      setSnackbar({
        open: true,
        message: err.response?.data?.message || "Failed to load agents",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => {
    fetchAgents();
  }, [fetchAgents]);

  const handleStatusFilterChange = (event: SelectChangeEvent<string>) => {
    setStatusFilter(event.target.value);
    setPage(1); // reset to first page on filter change
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await api.delete(`/api/Agent/${deleteTarget}`);
      setSnackbar({
        open: true,
        message: "Agent deleted successfully.",
        severity: "success",
      });
      setDeleteTarget(null);
      fetchAgents();
    } catch (err: any) {
      setSnackbar({
        open: true,
        message: err.response?.data?.message || "Deletion failed",
        severity: "error",
      });
    }
  };

  const handleOpenStatusDialog = (agent: AgentResponse) => {
    setStatusTarget({
      agentId: agent.id,
      currentStatus: agent.accountStatus || "PENDING",
    });
    setSelectedStatus(agent.accountStatus || "PENDING");
  };

  const handleStatusChange = async () => {
    if (!statusTarget) return;
    try {
      await api.put(
        `/api/admin/agents/${statusTarget.agentId}/status`,
        selectedStatus,
        { headers: { "Content-Type": "application/json" } },
      );
      setSnackbar({
        open: true,
        message: "Agent status updated.",
        severity: "success",
      });
      setStatusTarget(null);
      fetchAgents();
    } catch (err: any) {
      setSnackbar({
        open: true,
        message: err.response?.data?.message || "Status change failed",
        severity: "error",
      });
    }
  };

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" gutterBottom>
        Agent Management
      </Typography>

      {/* Status Filter */}
      <Box sx={{ mb: 3 }}>
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Filter by Status</InputLabel>
          <Select
            value={statusFilter}
            label="Filter by Status"
            onChange={handleStatusFilterChange}
          >
            <MenuItem value="">All</MenuItem>
            {AGENT_STATUSES.map((status) => (
              <MenuItem key={status} value={status}>
                {status}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

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
                      label={agent.accountStatus || "PENDING"}
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

      {/* Delete Confirmation Dialog */}
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

      {/* Status Change Dialog */}
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

      {/* Global Snackbar for feedback */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}
