// app/dashboard/layout.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Box, Drawer, useTheme, alpha } from "@mui/material";
import { useAuth } from "@/context/AuthContext";
import DashboardSidebar from "./components/DashboardSidebar";
import DashboardHeader from "./components/DashboardHeader";

const DRAWER_WIDTH = 260;
const MINI_DRAWER_WIDTH = 64;

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const theme = useTheme();
  const router = useRouter();
  const { user, loading } = useAuth();
  const [open, setOpen] = useState(true); // desktop sidebar expanded
  const [mobileOpen, setMobileOpen] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, user, router]);

  // While loading, show nothing (or a spinner)
  if (loading || !user) return null;

  const currentWidth = open ? DRAWER_WIDTH : MINI_DRAWER_WIDTH;

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": {
            width: DRAWER_WIDTH,
            boxSizing: "border-box",
            backgroundColor: alpha(theme.palette.background.paper, 0.95),
            backdropFilter: "blur(12px)",
          },
        }}
      >
        <DashboardSidebar
          variant="temporary"
          open={true}
          onClose={() => setMobileOpen(false)}
          userRoles={user.roles || []}
        />
      </Drawer>

      {/* Desktop Sidebar */}
      <Box
        component="nav"
        sx={{
          width: { md: currentWidth },
          flexShrink: 0,
          transition: "width 0.3s ease",
          display: { xs: "none", md: "block" },
          position: "sticky",
          top: 0,
          height: "100vh",
          overflowY: "auto",
          borderRight: `1px solid ${theme.palette.divider}`,
        }}
      >
        <DashboardSidebar
          variant="permanent"
          open={open}
          onClose={() => setOpen(false)}
          userRoles={user.roles || []}
        />
      </Box>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          minWidth: 0,
          display: "flex",
          flexDirection: "column",
          height: "100vh",
        }}
      >
        <DashboardHeader
          onMenuClick={() => setMobileOpen(true)}
          onToggleSidebar={() => setOpen(!open)}
          open={open}
          user={user}
        />
        <Box sx={{ flexGrow: 1, overflowY: "auto", p: { xs: 2, md: 4 } }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
}
