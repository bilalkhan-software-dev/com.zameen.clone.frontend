'use client';

import { useParams } from 'next/navigation';
import { Container, Typography, Card, CardContent, CircularProgress } from '@mui/material';
import { useAgentDetail } from '@/hooks/useAgentDetail';

export default function AgentDetailPage() {
  const { id } = useParams();
  const { agent, loading } = useAgentDetail(id as string);

  if (loading) return <CircularProgress />;
  if (!agent) return <Typography>Agent not found</Typography>;

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>Agent Details</Typography>
      <Card>
        <CardContent>
          <Typography variant="h6">{agent.agencyName}</Typography>
          <Typography>Bio: {agent.bio || 'N/A'}</Typography>
          <Typography>Status: {agent.accountStatus}</Typography>
          <Typography>Joined: {new Date(agent.createdAt).toLocaleDateString()}</Typography>
        </CardContent>
      </Card>
    </Container>
  );
}