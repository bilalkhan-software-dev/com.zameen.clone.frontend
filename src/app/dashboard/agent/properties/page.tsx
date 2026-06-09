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
  Snackbar,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import AddIcon from "@mui/icons-material/Add";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/axios";
import { PropertyResponse, PagedResult } from "@/lib/types";
import { useSettings } from "@/context/SettingsContext";

export default function AgentPropertiesPage() {
  const router = useRouter();
  const { formatPrice, formatArea } = useSettings();
  const [properties, setProperties] =
    useState<PagedResult<PropertyResponse> | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({ open: false, message: "", severity: "success" });

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedPropertyId, setSelectedPropertyId] = useState<number | null>(
    null,
  );

  const handleCloseSnackbar = () =>
    setSnackbar((prev) => ({ ...prev, open: false }));

  const fetchProperties = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/Property/my-properties", {
        params: {
          page,
          size: pageSize,
          SortBy: "CreatedAt",
          IsDescending: true,
        },
      });
      setProperties(res.data.data);
    } catch (err: any) {
      setSnackbar({
        open: true,
        message: err.response?.data?.message || "Failed to load properties",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  const handleDeleteClick = (propertyId: number) => {
    setSelectedPropertyId(propertyId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (selectedPropertyId === null) return;
    try {
      await api.delete(`/api/Property/${selectedPropertyId}`);
      setSnackbar({
        open: true,
        message: "Property deleted (soft delete).",
        severity: "success",
      });
      setDeleteDialogOpen(false);
      setSelectedPropertyId(null);
      fetchProperties();
    } catch (err: any) {
      setSnackbar({
        open: true,
        message: err.response?.data?.message || "Failed to delete",
        severity: "error",
      });
    }
  };

  const toggleActive = async (id: number, currentActive: boolean) => {
    try {
      await api.put(`/api/Property/${id}/toggle-active`);
      setSnackbar({
        open: true,
        message: `Property ${currentActive ? "deactivated" : "activated"}.`,
        severity: "success",
      });
      fetchProperties();
    } catch (err: any) {
      setSnackbar({
        open: true,
        message: err.response?.data?.message || "Toggle failed",
        severity: "error",
      });
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          My Properties
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => router.push("/dashboard/agent/properties/new")}
        >
          Add New Property
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress />
        </Box>
      ) : !properties || properties.items.length === 0 ? (
        <Alert severity="info">
          No properties found. Click &quot;Add New Property&quot; to create one.
        </Alert>
      ) : (
        <Paper sx={{ borderRadius: 3, overflowX: "auto" }}>
          <Table sx={{ minWidth: 900 }}>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Title</TableCell>
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
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {property.id}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {property.title}
                    </Typography>
                  </TableCell>
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
                        property.status === "APPROVED" ? "success" : "warning"
                      }
                    />
                  </TableCell>
                  <TableCell align="center" sx={{ whiteSpace: "nowrap" }}>
                    <IconButton
                      component={Link}
                      href={`/properties/${property.id}`}
                      target="_blank"
                      size="small"
                      title="View public page"
                      sx={{ p: 0.5, minWidth: "auto" }}
                    >
                      <VisibilityIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      onClick={() =>
                        router.push(
                          `/dashboard/agent/properties/${property.id}/edit`,
                        )
                      }
                      size="small"
                      title="Edit property"
                      sx={{ p: 0.5, minWidth: "auto" }}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      onClick={() => handleDeleteClick(property.id)}
                      size="small"
                      color="error"
                      title="Delete property"
                      sx={{ p: 0.5, minWidth: "auto" }}
                    >
                      <DeleteIcon fontSize="small" />
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

      {/* Delete confirmation dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Property?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This will soft‑delete the property (make it inactive). Are you sure?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={confirmDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for feedback */}
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
