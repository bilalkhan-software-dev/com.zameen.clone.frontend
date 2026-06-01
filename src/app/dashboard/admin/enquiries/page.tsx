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
  Button,
  Pagination,
  CircularProgress,
  Alert,
} from "@mui/material";
import api from "@/lib/axios";
import { PropertyResponse, PagedResult } from "@/lib/types";
import Link from "next/link";

export default function AdminEnquiriesListPage() {
  const [properties, setProperties] =
    useState<PagedResult<PropertyResponse> | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const res = await api.get("/api/Property", {
          params: {
            Page: page,
            PageSize: pageSize,
            SortBy: "CreatedAt",
            IsDescending: true,
          },
        });
        setProperties(res.data.data);
      } catch (err: any) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProperties();
  }, [page]);

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" gutterBottom>
        Enquiries Management
      </Typography>
      <Typography variant="body1" gutterBottom>
        Select a property to view its enquiries.
      </Typography>

      {loading ? (
        <Box sx={{ py: 4, display: "flex", justifyContent: "center" }}>
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
                <TableCell>Agent</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {properties.items.map((property) => (
                <TableRow key={property.id}>
                  <TableCell>{property.title}</TableCell>
                  <TableCell>{property.agentName}</TableCell>
                  <TableCell align="center">
                    <Link
                      href={`/dashboard/admin/enquiries/${property.id}`}
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
    </Container>
  );
}
