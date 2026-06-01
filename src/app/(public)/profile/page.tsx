'use client';

import { Container, Typography, Paper, Box, CircularProgress, Alert } from '@mui/material';
import { useAuth } from '@/context/AuthContext';

export default function ProfilePage() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <Box sx={{display:"flex",justifyContent: "center",mt:8}}>
        <CircularProgress />
      </Box>
    );
  }

  if (!user) {
    return (
      <Container maxWidth="sm" sx={{ mt: 8 }}>
        <Alert severity="warning">You must be logged in to view your profile.</Alert>
      </Container>
    );
  }

  const accountStatus = user.accountStatus || 'N/A';

  return (
    <Container maxWidth="sm" sx={{ mt: 8, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        My Profile
      </Typography>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Typography variant="h6">{user.fullName}</Typography>
          <Typography variant="body1"><strong>Email:</strong> {user.email}</Typography>
          <Typography variant="body1"><strong>Username:</strong> {user.userName}</Typography>
          <Typography variant="body1"><strong>Account Status:</strong> {accountStatus}</Typography>
          {user.phoneNumber && (
            <Typography variant="body1"><strong>Phone:</strong> {user.phoneNumber}</Typography>
          )}
          <Typography variant="body1"><strong>Roles:</strong> {user.roles?.join(', ') || 'User'}</Typography>
        </Box>
      </Paper>
    </Container>
  );
}