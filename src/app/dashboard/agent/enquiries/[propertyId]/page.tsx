// ----------------------------------------------------------------------
// AgentPropertyEnquiriesPage (enquiry details for one property)
// ----------------------------------------------------------------------
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
  Button,
  Chip,
  Stack,
} from "@mui/material";
import { useParams, useRouter } from "next/navigation";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import api from "@/lib/axios";
import { EnquiryResponse, PagedResult } from "@/lib/types";

export default function AgentPropertyEnquiriesPage() {
  const { propertyId } = useParams();
  const router = useRouter();
  const [enquiries, setEnquiries] = useState<PagedResult<EnquiryResponse> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError("");
      try {
        const res = await api.get(`/api/Enquiry/property/${propertyId}`, {
          params: { page, size: pageSize },
        });
        setEnquiries(res.data.data);
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to load enquiries");
      } finally {
        setLoading(false);
      }
    })();
  }, [page, propertyId]);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => router.push("/dashboard/agent/enquiries")}
        sx={{ mb: 2 }}
      >
        Back to Properties
      </Button>

      <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
        Enquiries for Property #{propertyId}
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
        <Alert severity="info">No enquiries found for this property.</Alert>
      ) : (
        <Paper sx={{ borderRadius: 3, overflow: "hidden" }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>From</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Phone</TableCell>
                <TableCell>Message</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>City</TableCell>
                <TableCell>Salary</TableCell>
                <TableCell>CNIC</TableCell>
                <TableCell>Keep Informed</TableCell>
                <TableCell>Date</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {enquiries.items.map((enq) => (
                <TableRow key={enq.id} hover>
                  <TableCell>{enq.senderName}</TableCell>
                  <TableCell>{enq.senderEmail}</TableCell>
                  <TableCell>{enq.phone || "-"}</TableCell>
                  <TableCell
                    sx={{
                      maxWidth: 250,
                      whiteSpace: "normal",
                      wordBreak: "break-word",
                    }}
                  >
                    {enq.message}
                  </TableCell>
                  <TableCell>
                    {(enq as any).role || (enq as any).enquiryType || "-"}
                  </TableCell>
                  <TableCell>{(enq as any).city || "-"}</TableCell>
                  <TableCell>{(enq as any).monthlySalary || "-"}</TableCell>
                  <TableCell>{(enq as any).cnic || "-"}</TableCell>
                  <TableCell>
                    {(enq as any).keepInformed ? "Yes" : "No"}
                  </TableCell>
                  <TableCell>
                    {new Date(enq.createdAt).toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              p: 2,
            }}
          >
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