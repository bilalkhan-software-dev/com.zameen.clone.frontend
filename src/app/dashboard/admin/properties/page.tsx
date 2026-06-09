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
import { PropertyResponse, PagedResult } from "@/lib/types";
import { useSettings } from "@/context/SettingsContext";

const PROPERTY_STATUSES = ["PENDING", "APPROVED", "REJECTED", "SOLD", "RENTED"];

export default function AdminPropertiesPage() {
  const { formatPrice, formatArea } = useSettings();
  const [properties, setProperties] =
    useState<PagedResult<PropertyResponse> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [statusFilter, setStatusFilter] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);
  const [statusTarget, setStatusTarget] = useState<{
    id: number;
    currentStatus: string;
  } | null>(null);
  const [selectedStatus, setSelectedStatus] = useState("");

  const fetchProperties = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/api/admin/properties", {
        params: { page, size: pageSize, sortBy: "CreatedAt", isNewest: true },
      });
      let pagedData = res.data.data;
      if (statusFilter) {
        pagedData = {
          ...pagedData,
          items: pagedData.items.filter(
            (p: PropertyResponse) => p.status === statusFilter,
          ),
          totalCount: pagedData.items.filter(
            (p: PropertyResponse) => p.status === statusFilter,
          ).length,
        };
      }
      setProperties(pagedData);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load properties");
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  const handleStatusFilter = (event: SelectChangeEvent<string>) => {
    setStatusFilter(event.target.value);
    setPage(1);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await api.delete(`/api/Property/${deleteTarget}`);
      setDeleteTarget(null);
      fetchProperties();
    } catch (err: any) {
      setError(err.response?.data?.message || "Deletion failed");
    }
  };

  const handleOpenStatusDialog = (property: PropertyResponse) => {
    setStatusTarget({ id: property.id, currentStatus: property.status });
    setSelectedStatus(property.status);
  };

  const handleStatusChange = async () => {
    if (!statusTarget) return;
    try {
      await api.patch(
        `/api/admin/properties/${statusTarget.id}/status`,
        selectedStatus,
        {
          headers: { "Content-Type": "application/json" },
        },
      );
      setStatusTarget(null);
      fetchProperties();
    } catch (err: any) {
      setError(err.response?.data?.message || "Status change failed");
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
        Property Management
      </Typography>

      <Box sx={{ mb: 2, display: "flex", gap: 2, flexWrap: "wrap" }}>
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Status Filter</InputLabel>
          <Select
            value={statusFilter}
            label="Status Filter"
            onChange={handleStatusFilter}
          >
            <MenuItem value="">All</MenuItem>
            {PROPERTY_STATUSES.map((s) => (
              <MenuItem key={s} value={s}>
                {s}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress />
        </Box>
      ) : !properties || properties.items.length === 0 ? (
        <Alert severity="info">No properties found.</Alert>
      ) : (
        <Paper sx={{ borderRadius: 3, overflow: "hidden" }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Title</TableCell>
                <TableCell>Agent</TableCell>
                <TableCell>City</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Area</TableCell>
                <TableCell>Price</TableCell>
                <TableCell>Purpose</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {properties.items.map((property) => (
                <TableRow key={property.id} hover>
                  <TableCell>
                    <Typography variant="body2" fontWeight={600}>
                      {property.title}
                    </Typography>
                  </TableCell>
                  <TableCell>{property.agentName || "-"}</TableCell>
                  <TableCell>{property.city}</TableCell>
                  <TableCell>
                    <Chip
                      label={property.propertyType?.toLowerCase()}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    {property.areaSize ? formatArea(property.areaSize) : "-"}
                  </TableCell>
                  <TableCell>{formatPrice(property.price)}</TableCell>
                  <TableCell>
                    <Chip
                      label={
                        property.propertyPurpose === "BUY" ? "Sale" : "Rent"
                      }
                      size="small"
                      color={
                        property.propertyPurpose === "BUY"
                          ? "primary"
                          : "secondary"
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={property.status}
                      size="small"
                      color={
                        property.status === "APPROVED"
                          ? "success"
                          : property.status === "PENDING"
                            ? "warning"
                            : "default"
                      }
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => handleOpenStatusDialog(property)}
                      sx={{ mr: 1 }}
                    >
                      Change Status
                    </Button>
                    <IconButton
                      color="error"
                      onClick={() => setDeleteTarget(property.id)}
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
              count={Math.ceil(properties.totalCount / pageSize)}
              page={page}
              onChange={(_, newPage) => setPage(newPage)}
              color="primary"
            />
          </Box>
        </Paper>
      )}

      {/* Delete dialog */}
      <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)}>
        <DialogTitle>Delete Property?</DialogTitle>
        <DialogContent>
          <DialogContentText>Soft‑delete this property?</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteTarget(null)}>Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Status change dialog */}
      <Dialog open={!!statusTarget} onClose={() => setStatusTarget(null)}>
        <DialogTitle>Change Property Status</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Current: <strong>{statusTarget?.currentStatus}</strong>
          </DialogContentText>
          <FormControl fullWidth size="small">
            <InputLabel>New Status</InputLabel>
            <Select
              value={selectedStatus}
              label="New Status"
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              {PROPERTY_STATUSES.map((status) => (
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
