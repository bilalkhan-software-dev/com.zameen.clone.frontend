import api from "@/lib/axios";
import { useState, useEffect } from "react";
import {
  PropertyFilterParams,
  PropertyResponse,
  PagedResult,
} from "@/lib/types";

export const useProperties = (
  initialFilters: PropertyFilterParams = { Page: 1, PageSize: 10 },
) => {
  const [filters, setFilters] = useState<PropertyFilterParams>(initialFilters);
  const [data, setData] = useState<PagedResult<PropertyResponse> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const refetch = () => setRefreshKey((prev) => prev + 1);

  const fetchProperties = async () => {
    setLoading(true);
    setError(null);
    try {
      // filters object already has all params (City, PropertyType, etc.)
      const res = await api.get("/api/Property", { params: filters });
      setData(res.data.data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load properties");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, [filters, refreshKey]);

  return { data, loading, error, filters, setFilters, refetch };
};
