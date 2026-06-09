"use client";

import { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Pagination,
  CircularProgress,
  Alert,
  Chip,
  Tooltip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Snackbar,
  TextField,
  InputAdornment,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/axios";
import { EnquiryResponse, PagedResult } from "@/lib/types";

export default function AgentEnquiriesPage() {
  const { user } = useAuth();
  const agentId = user?.agentId;
  const router = useRouter();

  const [enquiries, setEnquiries] =
    useState<PagedResult<EnquiryResponse> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({ open: false, message: "", severity: "success" });

  // Property ID search state
  const [propertyIdInput, setPropertyIdInput] = useState("");

  const fetchEnquiries = async () => {
    if (!agentId) return;
    setLoading(true);
    setError("");
    try {
      const res = await api.get(`/api/Enquiry/agent/${agentId}`, {
        params: { page, size: pageSize },
      });
      setEnquiries(res.data.data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load enquiries");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnquiries();
  }, [agentId, page]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await api.delete(`/api/Enquiry/${deleteTarget}`);
      setSnackbar({
        open: true,
        message: "Enquiry deleted.",
        severity: "success",
      });
      setDeleteTarget(null);
      fetchEnquiries();
    } catch (err: any) {
      setSnackbar({
        open: true,
        message: err.response?.data?.message || "Delete failed",
        severity: "error",
      });
    }
  };

  // Navigate to property enquiries page
  const handlePropertyIdSubmit = () => {
    const id = parseInt(propertyIdInput, 10);
    if (!isNaN(id) && id > 0) {
      router.push(`/dashboard/agent/enquiries/${id}`);
      setPropertyIdInput("");
    }
  };

  const handlePropertyIdKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handlePropertyIdSubmit();
    }
  };

  if (!agentId) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="warning">
          Agent profile not available. Please log in again.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
        My Enquiries
      </Typography>

      {/* Property ID quick search */}
      <Box sx={{ display: "flex", gap: 1, mb: 3, alignItems: "center" }}>
        <TextField
          size="small"
          placeholder="Enter property ID"
          value={propertyIdInput}
          onChange={(e) => {
            const val = e.target.value;
            if (/^\d*$/.test(val)) setPropertyIdInput(val);
          }}
          onKeyDown={handlePropertyIdKeyDown}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            },
          }}
          sx={{ width: 200 }}
        />
        <Button
          variant="contained"
          onClick={handlePropertyIdSubmit}
          sx={{ textTransform: "none" }}
        >
          Go
        </Button>
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
      ) : !enquiries || enquiries.items.length === 0 ? (
        <Alert severity="info">No enquiries yet.</Alert>
      ) : (
        <Paper sx={{ borderRadius: 3, overflowX: "auto" }}>
          <Table sx={{ minWidth: 800 }}>
            <TableHead>
              <TableRow>
                <TableCell>Property</TableCell>
                <TableCell>From</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Phone</TableCell>
                <TableCell>Message</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>City</TableCell>
                <TableCell>Date</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {enquiries.items.map((enq) => (
                <TableRow key={enq.id} hover>
                  <TableCell>
                    <Chip
                      label={`#${enq.propertyId}`}
                      size="small"
                      component="a"
                      href={`/dashboard/agent/enquiries/${enq.propertyId}`}
                      clickable
                    />
                  </TableCell>
                  <TableCell>{enq.senderName}</TableCell>
                  <TableCell>{enq.senderEmail}</TableCell>
                  <TableCell>{enq.phone || "-"}</TableCell>
                  <TableCell>
                    <Tooltip title={enq.message || ""} arrow>
                      <Typography
                        variant="body2"
                        sx={{
                          maxWidth: 200,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          cursor: "default",
                        }}
                      >
                        {enq.message}
                      </Typography>
                    </Tooltip>
                  </TableCell>
                  <TableCell>
                    <Chip label={enq.enquiryType} size="small" />
                  </TableCell>
                  <TableCell>{enq.city || "-"}</TableCell>
                  <TableCell>
                    {new Date(enq.createdAt).toLocaleString()}
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      color="error"
                      onClick={() => setDeleteTarget(enq.id)}
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
              count={Math.ceil(enquiries.totalCount / pageSize)}
              page={page}
              onChange={(_, newPage) => setPage(newPage)}
              color="primary"
            />
          </Box>
        </Paper>
      )}

      {/* Delete confirmation dialog */}
      <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)}>
        <DialogTitle>Delete Enquiry?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this enquiry?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteTarget(null)}>Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
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
