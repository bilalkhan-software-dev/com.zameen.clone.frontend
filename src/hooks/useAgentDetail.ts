import { useState, useEffect } from "react";
import api from "@/lib/axios";
import { AgentResponse } from "@/lib/types";

export const useAgentDetail = (agentId: string) => {
  const [agent, setAgent] = useState<AgentResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get(`/api/Agent/${agentId}`);
        setAgent(res.data.data);
      } catch (err) {
        console.error("Failed to load agent", err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [agentId]);

  return { agent, loading };
};
