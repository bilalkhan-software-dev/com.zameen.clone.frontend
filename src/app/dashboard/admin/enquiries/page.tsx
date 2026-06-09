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
  Tooltip, // <-- import Tooltip
} from "@mui/material";
import api from "@/lib/axios";
import { EnquiryResponse, PagedResult } from "@/lib/types";

export default function AdminAllEnquiriesPage() {
  const [enquiries, setEnquiries] =
    useState<PagedResult<EnquiryResponse> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError("");
      try {
        const res = await api.get("/api/admin/enquiries", {
          params: { page, size: pageSize, sortBy: "CreatedAt", isNewest: true },
        });
        setEnquiries(res.data.data);
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to load enquiries");
      } finally {
        setLoading(false);
      }
    })();
  }, [page]);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
        All Enquiries (Admin)
      </Typography>

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
        <Alert severity="info">No enquiries found.</Alert>
      ) : (
        <Paper sx={{ borderRadius: 3, overflowX: "auto" }}>
          {" "}
          {/* enable horizontal scroll */}
          <Table sx={{ minWidth: 900 }}>
            {" "}
            {/* set min width to force scroll on small screens */}
            <TableHead>
              <TableRow>
                <TableCell>Property</TableCell>
                <TableCell>From</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Phone</TableCell>
                <TableCell>Message</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>City</TableCell>
                <TableCell>Salary</TableCell>
                <TableCell>CNIC</TableCell>
                <TableCell>Date</TableCell>
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
                      href={`/properties/${enq.propertyId}`}
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
                  <TableCell>{enq.monthlySalary || "-"}</TableCell>
                  <TableCell>{enq.cnic || "-"}</TableCell>
                  <TableCell>
                    {new Date(enq.createdAt).toLocaleString()}
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
    </Container>
  );
}
