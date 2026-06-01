import { useState, useEffect } from "react";
import api from "@/lib/axios";
import { PagedResult, AgentResponse, AgentFilterParams } from "@/lib/types";

export const useAgents = (
  initialParams: AgentFilterParams = { page: 1, size: 10 },
) => {
  const [params, setParams] = useState<AgentFilterParams>(initialParams);
  const [data, setData] = useState<PagedResult<AgentResponse> | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchAgents = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/Agent", { params }); // query params map to PascalCase automatically
      setData(res.data.data);
    } catch (err) {
      console.error("Failed to fetch agents", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgents();
  }, [params]);

  return { data, loading, params, setParams, refetch: fetchAgents };
};
