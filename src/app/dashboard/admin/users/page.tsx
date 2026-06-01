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
import { PagedResult } from "@/lib/types";

interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  accountStatus: string;
  roles: string[];
}

const ACCOUNT_STATUSES = ["PENDING", "APPROVED", "REJECTED", "BANNED"];

export default function AdminUsersPage() {
  const [users, setUsers] = useState<PagedResult<UserProfile> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [statusTarget, setStatusTarget] = useState<{
    userId: string;
    currentStatus: string;
  } | null>(null);
  const [selectedStatus, setSelectedStatus] = useState("");

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/api/Admin/users", {
        params: { page, size: pageSize },
      });
      setUsers(res.data.data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await api.delete(`/api/Admin/users/${deleteTarget}`);
      setDeleteTarget(null);
      fetchUsers();
    } catch (err: any) {
      setError(err.response?.data?.message || "Deletion failed");
    }
  };

  const handleOpenStatusDialog = (user: UserProfile) => {
    setStatusTarget({ userId: user.id, currentStatus: user.accountStatus });
    setSelectedStatus(user.accountStatus);
  };

  const handleStatusChange = async () => {
    if (!statusTarget) return;
    try {
      await api.put("/api/Admin/users/status", {
        userId: statusTarget.userId,
        newStatus: selectedStatus,
      });
      setStatusTarget(null);
      fetchUsers();
    } catch (err: any) {
      setError(err.response?.data?.message || "Status change failed");
    }
  };

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" gutterBottom>
        User Management
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
      ) : !users || users.items?.length === 0 ? (
        <Alert severity="info">No users found.</Alert>
      ) : (
        <Paper>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Roles</TableCell>
                <TableCell>Account Status</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.items.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.fullName}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.roles?.join(", ") || "User"}</TableCell>
                  <TableCell>
                    <Chip
                      label={user.accountStatus}
                      color={
                        user.accountStatus === "APPROVED"
                          ? "success"
                          : user.accountStatus === "REJECTED"
                            ? "error"
                            : "warning"
                      }
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="center">
                    {/* Always visible "Change Status" button */}
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => handleOpenStatusDialog(user)}
                    >
                      Change Status
                    </Button>
                    <IconButton
                      color="error"
                      onClick={() => setDeleteTarget(user.id)}
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
              count={Math.ceil(users.totalCount / pageSize)}
              page={page}
              onChange={(_, newPage) => setPage(newPage)}
            />
          </Box>
        </Paper>
      )}

      {/* Delete Dialog */}
      <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)}>
        <DialogTitle>Delete User?</DialogTitle>
        <DialogContent>
          <DialogContentText>Permanently delete this user?</DialogContentText>
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
        <DialogTitle>Change Account Status</DialogTitle>
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
              {ACCOUNT_STATUSES.map((status) => (
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
