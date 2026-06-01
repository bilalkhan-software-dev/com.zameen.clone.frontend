"use client";

import { usePathname } from "next/navigation";
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Tooltip,
  alpha,
  useTheme,
} from "@mui/material";
import Link from "next/link";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PeopleIcon from "@mui/icons-material/People";
import BusinessIcon from "@mui/icons-material/Business";
import HomeWorkIcon from "@mui/icons-material/HomeWork";
import PersonIcon from "@mui/icons-material/Person";
import SettingsIcon from "@mui/icons-material/Settings";

type SidebarProps = {
  variant: "temporary" | "permanent";
  open?: boolean;
  onClose: () => void;
  userRoles: string[];
};

// Admin links
const adminLinks = [
  { title: "Overview", url: "/dashboard/admin", icon: <DashboardIcon /> },
  {
    title: "User Management",
    url: "/dashboard/admin/users",
    icon: <PeopleIcon />,
  },
  {
    title: "Agent Management",
    url: "/dashboard/admin/agents",
    icon: <BusinessIcon />,
  },
  {
    title: "Properties",
    url: "/dashboard/admin/properties",
    icon: <HomeWorkIcon />,
  },
];

// Agent links
const agentLinks = [
  { title: "Dashboard", url: "/dashboard/agent", icon: <DashboardIcon /> },
  {
    title: "My Properties",
    url: "/dashboard/agent/properties",
    icon: <HomeWorkIcon />,
  },
  {
    title: "Enquiries",
    url: "/dashboard/agent/enquiries",
    icon: <PeopleIcon />,
  },
  { title: "Profile", url: "/dashboard/agent/profile", icon: <PersonIcon /> },
];

// Default User links
const userLinks = [
  { title: "Overview", url: "/dashboard", icon: <DashboardIcon /> },
  { title: "My Profile", url: "/dashboard/profile", icon: <PersonIcon /> },
  { title: "Settings", url: "/dashboard/settings", icon: <SettingsIcon /> },
];

export default function DashboardSidebar({
  variant,
  open = true,
  onClose,
  userRoles,
}: SidebarProps) {
  const theme = useTheme();
  const pathname = usePathname();
  const collapsed = variant === "permanent" && !open;

  // Determine which links to show
  const isAdmin = userRoles.includes("Admin");
  const isAgent = userRoles.includes("Agent");
  const links = isAdmin ? adminLinks : isAgent ? agentLinks : userLinks;

  const isActive = (url: string) => {
    if (
      url === "/dashboard" ||
      url === "/dashboard/admin" ||
      url === "/dashboard/agent"
    ) {
      return pathname === url;
    }
    return pathname.startsWith(url);
  };

  return (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        backgroundColor: "background.paper",
      }}
    >
      {/* Logo / Brand */}
      <Box
        sx={{
          height: 70,
          display: "flex",
          alignItems: "center",
          px: collapsed ? 1 : 3,
          justifyContent: collapsed ? "center" : "flex-start",
        }}
      >
        {collapsed ? (
          <Typography
            sx={{ color: "primary.main", fontWeight: 700, fontSize: "1.75rem" }}
          >
            P
          </Typography>
        ) : (
          <Typography
            component={Link}
            href="/"
            sx={{
              textDecoration: "none",
              color: "primary.main",
              fontWeight: 800,
              fontSize: "1.5rem",
            }}
            onClick={onClose}
          >
            PropertyHub
          </Typography>
        )}
      </Box>
      <Divider />

      {/* Navigation Links */}
      <Box sx={{ flexGrow: 1, overflowY: "auto", py: 1, px: 0.5 }}>
        <List dense disablePadding>
          {links.map((link) => {
            const active = isActive(link.url);
            return (
              <ListItem key={link.url} disablePadding>
                <Tooltip
                  title={collapsed ? link.title : ""}
                  placement="right"
                  arrow
                >
                  <ListItemButton
                    component={Link}
                    href={link.url}
                    onClick={onClose}
                    sx={{
                      minHeight: 44,
                      mb: 0.5,
                      mx: collapsed ? 1 : 1,
                      justifyContent: collapsed ? "center" : "flex-start",
                      px: collapsed ? 0 : 2,
                      color: active ? "primary.main" : "text.secondary",
                      backgroundColor: active
                        ? alpha(theme.palette.primary.main, 0.08)
                        : "transparent",
                      "&:hover": {
                        backgroundColor: alpha(
                          theme.palette.primary.main,
                          0.06,
                        ),
                      },
                      ...(active && {
                        "&::before": {
                          content: '""',
                          position: "absolute",
                          left: 0,
                          top: "50%",
                          transform: "translateY(-50%)",
                          height: "60%",
                          width: 3,
                          borderRadius: "0 3px 3px 0",
                          backgroundColor: theme.palette.primary.main,
                        },
                      }),
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: collapsed ? 0 : 40,
                        justifyContent: "center",
                        color: "inherit",
                      }}
                    >
                      {link.icon}
                    </ListItemIcon>
                    {!collapsed && (
                      <ListItemText
                        primary={link.title}
                        slotProps={{
                          primary: {
                            sx: { fontWeight: 600, fontSize: "0.875rem" },
                          },
                        }}
                      />
                    )}
                  </ListItemButton>
                </Tooltip>
              </ListItem>
            );
          })}
        </List>
      </Box>
    </Box>
  );
}
