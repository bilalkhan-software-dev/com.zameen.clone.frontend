import { useState, useCallback } from "react";
import api from "@/lib/axios";
import {
  CreateEnquiryRequest,
  EnquiryResponse,
  PagedResult,
} from "@/lib/types";

export const useEnquiry = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Public: send an enquiry
  const sendEnquiry = async (
    data: CreateEnquiryRequest,
  ): Promise<EnquiryResponse | null> => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      const res = await api.post("/enquiry", data);
      setSuccess(true);
      return res.data.data as EnquiryResponse;
    } catch (err: any) {
      const msg = err.response?.data?.message || "Failed to send enquiry";
      setError(msg);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Agent/Admin: fetch enquiries for a property with pagination
  const getEnquiriesForProperty = async (
    propertyId: number,
    page = 1,
    size = 10,
  ): Promise<PagedResult<EnquiryResponse> | null> => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/enquiry/property/${propertyId}`, {
        params: { page, size },
      });
      return res.data.data as PagedResult<EnquiryResponse>;
    } catch (err: any) {
      const msg = err.response?.data?.message || "Failed to load enquiries";
      setError(msg);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Admin/Agent: delete an enquiry
  const deleteEnquiry = async (id: number): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      await api.delete(`/enquiry/${id}`);
      return true;
    } catch (err: any) {
      const msg = err.response?.data?.message || "Failed to delete enquiry";
      setError(msg);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const resetStatus = useCallback(() => {
    setError(null);
    setSuccess(false);
  }, []);

  return {
    sendEnquiry,
    getEnquiriesForProperty,
    deleteEnquiry,
    loading,
    error,
    success,
    resetStatus,
  };
};
