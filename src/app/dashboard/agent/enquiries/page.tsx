"use client";

import { useEffect, useState } from "react";
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
  Pagination,
  CircularProgress,
  Alert,
  Snackbar,
} from "@mui/material";
import Link from "next/link";
import api from "@/lib/axios";
import { PropertyResponse, PagedResult } from "@/lib/types";

export default function AgentEnquiriesPage() {
  const [properties, setProperties] =
    useState<PagedResult<PropertyResponse> | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({
    open: false,
    message: "",
    severity: "success",
  });

  useEffect(() => {
    (async () => {
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
    })();
  }, [page]);

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" gutterBottom>
        Enquiries
      </Typography>
      <Typography variant="subtitle1" gutterBottom>
        Select a property to view its enquiries.
      </Typography>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress />
        </Box>
      ) : !properties || properties.items.length === 0 ? (
        <Alert severity="info">No properties found.</Alert>
      ) : (
        <Paper>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Title</TableCell>
                <TableCell>City</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {properties.items.map((property) => (
                <TableRow key={property.id}>
                  <TableCell>{property.title}</TableCell>
                  <TableCell>{property.city}</TableCell>
                  <TableCell align="center">
                    <Link
                      href={`/dashboard/agent/enquiries/${property.id}`}
                      passHref
                    >
                      <Button size="small" variant="outlined">
                        View Enquiries
                      </Button>
                    </Link>
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
            />
          </Box>
        </Paper>
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity={snackbar.severity} variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}
