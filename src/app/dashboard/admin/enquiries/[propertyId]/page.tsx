'use client';

import { useEffect, useState } from 'react';
import {
  Container, Typography, Box, Paper, Table, TableBody, TableCell,
  TableHead, TableRow, IconButton, Pagination, CircularProgress, Alert,
  Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { useParams } from 'next/navigation';
import api from '@/lib/axios';
import { EnquiryResponse, PagedResult } from '@/lib/types';

export default function PropertyEnquiriesPage() {
  const { propertyId } = useParams();
  const [enquiries, setEnquiries] = useState<PagedResult<EnquiryResponse> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);

  const fetchEnquiries = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get(`/api/Enquiry/property/${propertyId}`, {
        params: { page, size: pageSize },
      });
      setEnquiries(res.data.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load enquiries');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnquiries();
  }, [page, propertyId]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await api.delete(`/api/Enquiry/${deleteTarget}`);
      setDeleteTarget(null);
      fetchEnquiries();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Deletion failed');
    }
  };

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" gutterBottom>Enquiries for Property #{propertyId}</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {loading ? (
        <Box display="flex" justifyContent="center" py={4}><CircularProgress /></Box>
      ) : !enquiries || enquiries.items.length === 0 ? (
        <Alert severity="info">No enquiries found for this property.</Alert>
      ) : (
        <Paper>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>From</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Phone</TableCell>
                <TableCell>Message</TableCell>
                <TableCell>Date</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {enquiries.items.map((enq) => (
                <TableRow key={enq.id}>
                  <TableCell>{enq.senderName}</TableCell>
                  <TableCell>{enq.senderEmail}</TableCell>
                  <TableCell>{enq.phone || '-'}</TableCell>
                  <TableCell sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {enq.message}
                  </TableCell>
                  <TableCell>{new Date(enq.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell align="center">
                    <IconButton color="error" onClick={() => setDeleteTarget(enq.id)}>
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Box display="flex" justifyContent="center" p={2}>
            <Pagination
              count={Math.ceil(enquiries.totalCount / pageSize)}
              page={page}
              onChange={(_, newPage) => setPage(newPage)}
            />
          </Box>
        </Paper>
      )}

      <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)}>
        <DialogTitle>Delete Enquiry?</DialogTitle>
        <DialogContent>
          <DialogContentText>Are you sure you want to delete this enquiry?</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteTarget(null)}>Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained">Delete</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}