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
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import AddIcon from "@mui/icons-material/Add";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/axios";
import { PropertyResponse, PagedResult } from "@/lib/types";

export default function AgentPropertiesPage() {
  const router = useRouter();
  const [properties, setProperties] =
    useState<PagedResult<PropertyResponse> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // Delete confirmation
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedPropertyId, setSelectedPropertyId] = useState<number | null>(
    null,
  );

  const fetchProperties = useCallback(async () => {
    setLoading(true);
    setError("");
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
      setError(err.response?.data?.message || "Failed to load properties");
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
      setDeleteDialogOpen(false);
      setSelectedPropertyId(null);
      fetchProperties(); // refresh
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to delete property");
    }
  };

  const toggleActive = async (id: number, currentActive: boolean) => {
    try {
      await api.put(`/api/Property/${id}/toggle-active`);
      fetchProperties(); // refresh list
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to toggle status");
    }
  };

  return (
    <Container maxWidth="lg">
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Typography variant="h4">My Properties</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => router.push("/dashboard/agent/properties/new")}
        >
          Add New Property
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box display="flex" justifyContent="center" py={4}>
          <CircularProgress />
        </Box>
      ) : !properties || properties.items.length === 0 ? (
        <Alert severity="info">
          No properties found. Click &quot;Add New Property&quot; to create one.
        </Alert>
      ) : (
        <Paper>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Title</TableCell>
                <TableCell>City</TableCell>
                <TableCell>Price</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Active</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {properties.items.map((property) => (
                <TableRow key={property.id}>
                  <TableCell>{property.title}</TableCell>
                  <TableCell>{property.city}</TableCell>
                  <TableCell>PKR {property.price.toLocaleString()}</TableCell>
                  <TableCell>
                    <Chip
                      label={property.status}
                      size="small"
                      color={
                        property.status === "APPROVED" ? "success" : "warning"
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={property.isActive ? "Active" : "Inactive"}
                      size="small"
                      color={property.isActive ? "primary" : "default"}
                      onClick={() =>
                        toggleActive(property.id, property.isActive)
                      }
                      clickable
                    />
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      component={Link}
                      href={`/property/${property.id}`}
                      target="_blank"
                      size="small"
                    >
                      <VisibilityIcon />
                    </IconButton>
                    <IconButton
                      onClick={() =>
                        router.push(
                          `/dashboard/agent/properties/${property.id}/edit`,
                        )
                      }
                      size="small"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      onClick={() => handleDeleteClick(property.id)}
                      size="small"
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Box display="flex" justifyContent="center" p={2}>
            <Pagination
              count={Math.ceil(properties.totalCount / pageSize)}
              page={page}
              onChange={(_, newPage) => setPage(newPage)}
            />
          </Box>
        </Paper>
      )}

      {/* Delete Confirmation Dialog */}
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
    </Container>
  );
}
