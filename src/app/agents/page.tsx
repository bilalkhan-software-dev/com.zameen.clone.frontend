"use client";

import { useState } from "react";
import {
  Container,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Button,
  Chip,
  Pagination,
  Box,
  Alert,
} from "@mui/material";
import { useAgents } from "@/hooks/useAgents";
import api from "@/lib/axios";
import { useAuth } from "@/context/AuthContext";

export default function AgentsPage() {
  const { user } = useAuth();
  const { data, loading, params, setParams, refetch } = useAgents({
    page: 1,
    size: 10,
  });
  const [actionError, setActionError] = useState("");

  if (!user || user.roles?.includes("Admin")) {
    // simplistic role check – in real app use role claim
  }

  const handleApprove = async (agentId: string) => {
    try {
      await api.put(`/agent/${agentId}/approve`);
      refetch();
    } catch (err: any) {
      setActionError(err.response?.data?.message || "Failed to approve");
    }
  };

  const handleReject = async (agentId: string) => {
    try {
      await api.put(`/agent/${agentId}/reject`);
      refetch();
    } catch (err: any) {
      setActionError(err.response?.data?.message || "Failed to reject");
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Agents Management
      </Typography>
      {actionError && <Alert severity="error">{actionError}</Alert>}
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Bio</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data?.items.map((agent) => (
            <TableRow key={agent.id}>
              <TableCell>{agent.agencyName}</TableCell>
              <TableCell>{agent.bio}</TableCell>
              <TableCell>
                <Chip
                  label={agent.accountStatus}
                  color={
                    agent.accountStatus === "APPROVED" ? "success" : "warning"
                  }
                />
              </TableCell>
              <TableCell>
                <Button
                  size="small"
                  onClick={() => handleApprove(agent.id)}
                  disabled={agent.accountStatus !== "PENDING"}
                >
                  Approve
                </Button>
                <Button
                  size="small"
                  onClick={() => handleReject(agent.id)}
                  color="error"
                  disabled={agent.accountStatus !== "PENDING"}
                >
                  Reject
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {data && (
        <Box display="flex" justifyContent="center" mt={3}>
          <Pagination
            count={Math.ceil(data.totalCount / data.pageSize)}
            page={data.page}
            onChange={(_, page) => setParams({ ...params, page })}
          />
        </Box>
      )}
    </Container>
  );
}
