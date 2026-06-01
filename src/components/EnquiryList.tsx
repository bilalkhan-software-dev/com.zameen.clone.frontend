"use client";

import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Button,
  Pagination,
  Alert,
  CircularProgress,
  IconButton,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { useEnquiry } from "@/hooks/useEnquiry";
import { EnquiryResponse, PagedResult } from "@/lib/types";

interface Props {
  propertyId: number;
  isOwnerOrAdmin: boolean; // whether to show delete button
}

export default function EnquiryList({ propertyId, isOwnerOrAdmin }: Props) {
  const { getEnquiriesForProperty, deleteEnquiry, loading, error } =
    useEnquiry();
  const [data, setData] = useState<PagedResult<EnquiryResponse> | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const fetchEnquiries = async () => {
    const result = await getEnquiriesForProperty(propertyId, page, pageSize);
    setData(result);
  };

  useEffect(() => {
    fetchEnquiries();
  }, [page]);

  const handleDelete = async (id: number) => {
    if (!window.confirm("Delete this enquiry?")) return;
    const success = await deleteEnquiry(id);
    if (success) fetchEnquiries();
  };

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h6" gutterBottom>
        Enquiries ({data?.totalCount ?? 0})
      </Typography>

      {error && <Alert severity="error">{error}</Alert>}

      {loading && !data ? (
        <Box display="flex" justifyContent="center" py={4}>
          <CircularProgress />
        </Box>
      ) : data && data.items.length > 0 ? (
        <>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>From</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Phone</TableCell>
                <TableCell>Message</TableCell>
                <TableCell>Date</TableCell>
                {isOwnerOrAdmin && <TableCell>Actions</TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {data.items.map((enq) => (
                <TableRow key={enq.id}>
                  <TableCell>{enq.senderName}</TableCell>
                  <TableCell>{enq.senderEmail}</TableCell>
                  <TableCell>{enq.phone || "-"}</TableCell>
                  <TableCell
                    sx={{
                      maxWidth: 200,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {enq.message}
                  </TableCell>
                  <TableCell>
                    {new Date(enq.createdAt).toLocaleDateString()}
                  </TableCell>
                  {isOwnerOrAdmin && (
                    <TableCell>
                      <IconButton
                        color="error"
                        onClick={() => handleDelete(enq.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Box display="flex" justifyContent="center" mt={2}>
            <Pagination
              count={Math.ceil(data.totalCount / pageSize)}
              page={page}
              onChange={(_, p) => setPage(p)}
            />
          </Box>
        </>
      ) : (
        <Typography>No enquiries yet.</Typography>
      )}
    </Box>
  );
}
