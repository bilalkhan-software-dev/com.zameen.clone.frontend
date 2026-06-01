'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Box, Typography, CircularProgress, Alert, Button } from '@mui/material';
import Link from 'next/link';

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const accessToken = searchParams.get('accessToken');
    const refreshToken = searchParams.get('refreshToken');
    const expiresAt = searchParams.get('expiresAt');
    const errorParam = searchParams.get('error');

    if (errorParam) {
      setError(decodeURIComponent(errorParam));
      setLoading(false);
      return;
    }

    if (accessToken && refreshToken) {
      // Store tokens
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      if (expiresAt) localStorage.setItem('expiresAt', expiresAt);

      // Redirect to dashboard (or home) – the AuthContext will automatically load the user profile
      router.replace('/dashboard');
    } else {
      setError('No tokens received. Please try again.');
      setLoading(false);
    }
  }, [searchParams, router]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
        <Typography variant="h6" ml={2}>Completing sign in...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box textAlign="center" mt={8}>
        <Alert severity="error" sx={{ maxWidth: 500, mx: 'auto' }}>
          {error}
        </Alert>
        <Button component={Link} href="/login" variant="contained" sx={{ mt: 2 }}>
          Back to Login
        </Button>
      </Box>
    );
  }

  return null;
}