"use client";

import React, { createContext, useState, useEffect, useContext } from "react";
import api from "@/lib/axios";
import { LoginRequest, RegisterRequest, UserProfile } from "@/lib/types";

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => void;
  loginWithGoogle: () => void;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch agent ID if the user is an agent
  const attachAgentId = async (profile: UserProfile) => {
    if (profile.roles.includes("Agent")) {
      try {
        const res = await api.get("/api/Agent/me");
        const agentId = res.data.data.id;
        return { ...profile, agentId };
      } catch (err) {
        console.error("Failed to fetch agent profile", err);
      }
    }
    return profile;
  };

  const refreshProfile = async () => {
    try {
      const res = await api.get("/api/User/profile");
      const profile = res.data.data as UserProfile;
      const enrichedProfile = await attachAgentId(profile);
      setUser(enrichedProfile);
    } catch {
      setUser(null);
      localStorage.clear();
    }
  };

  // Try to load user profile from stored token
  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        setLoading(false);
        return;
      }
      await refreshProfile();
      setLoading(false);
    };
    loadUser();
  }, []);

  const login = async (credentials: LoginRequest) => {
    const res = await api.post("/api/Auth/login", credentials);
    const { accessToken, refreshToken } = res.data.data;
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);
    await refreshProfile();
  };

  const register = async (data: RegisterRequest) => {
    const res = await api.post("/api/Auth/register", data);
    const { accessToken, refreshToken } = res.data.data;
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);
    await refreshProfile();
  };

  const logout = () => {
    const refreshToken = localStorage.getItem("refreshToken");
    if (refreshToken) {
      api.post("/api/Auth/logout", { refreshToken }).catch(() => {});
    }
    localStorage.clear();
    setUser(null);
    window.location.href = "/login";
  };

  const loginWithGoogle = () => {
    window.location.href = `${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5118"}/api/Auth/google-login`;
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, logout, loginWithGoogle }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
