"use client";

import { useState, MouseEvent } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Box,
  Typography,
  IconButton,
  Breadcrumbs,
  Avatar,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Tooltip,
  Divider,
  useTheme,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import MenuOpenIcon from "@mui/icons-material/MenuOpen";
import PersonIcon from "@mui/icons-material/Person";
import LogoutIcon from "@mui/icons-material/Logout";
import { useAuth } from "@/context/AuthContext";
import { UserProfile } from "@/lib/types";

type HeaderProps = {
  onMenuClick: () => void;
  onToggleSidebar: () => void;
  open: boolean;
  user: UserProfile;
};

const slugToLabel = (slug: string) =>
  slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

export default function DashboardHeader({
  onMenuClick,
  onToggleSidebar,
  open,
  user,
}: HeaderProps) {
  const theme = useTheme();
  const pathname = usePathname();
  const { logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const profileMenuOpen = Boolean(anchorEl);

  const handleProfileOpen = (event: MouseEvent<HTMLElement>) =>
    setAnchorEl(event.currentTarget);
  const handleProfileClose = () => setAnchorEl(null);

  const breadcrumbs = [
    { label: "Dashboard", href: "/dashboard" },
    ...pathname
      .replace(/^\/dashboard\/?/, "")
      .split("/")
      .filter(Boolean)
      .map((seg, idx, arr) => {
        const accumulated = `/dashboard/${arr.slice(0, idx + 1).join("/")}`;
        return { label: slugToLabel(seg), href: accumulated };
      }),
  ];

  return (
    <Box
      component="header"
      sx={{
        display: "flex",
        alignItems: "center",
        height: 70,
        px: 3,
        borderBottom: `1px solid ${theme.palette.divider}`,
        backgroundColor: "background.paper",
        boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
        flexShrink: 0,
        gap: 1,
        zIndex: theme.zIndex.appBar,
      }}
    >
      <IconButton
        onClick={onMenuClick}
        sx={{ display: { xs: "flex", md: "none" }, color: "text.primary" }}
      >
        <MenuIcon fontSize="medium" />
      </IconButton>
      <IconButton
        onClick={onToggleSidebar}
        sx={{ display: { xs: "none", md: "flex" }, color: "text.primary" }}
      >
        {open ? <ChevronLeftIcon /> : <MenuOpenIcon />}
      </IconButton>

      <Breadcrumbs sx={{ flexGrow: 1 }}>
        {breadcrumbs.map((crumb, index) => {
          const isLast = index === breadcrumbs.length - 1;
          return isLast ? (
            <Typography
              key={crumb.href}
              color="text.primary"
              sx={{ fontWeight: 700 }}
            >
              {crumb.label}
            </Typography>
          ) : (
            <Link
              key={crumb.href}
              href={crumb.href}
              style={{
                textDecoration: "none",
                color: theme.palette.text.secondary,
                fontWeight: 600,
              }}
            >
              {crumb.label}
            </Link>
          );
        })}
      </Breadcrumbs>

      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Tooltip title="Your account">
          <IconButton onClick={handleProfileOpen} sx={{ p: 0.5 }}>
            <Avatar
              alt={user.fullName}
              sx={{
                width: 38,
                height: 38,
                border: `2px solid ${theme.palette.primary.main}`,
              }}
            >
              {user.fullName?.charAt(0).toUpperCase() || "U"}
            </Avatar>
          </IconButton>
        </Tooltip>

        <Menu
          anchorEl={anchorEl}
          open={profileMenuOpen}
          onClose={handleProfileClose}
          transformOrigin={{ horizontal: "right", vertical: "top" }}
          anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
          slotProps={{
            paper: {
              sx: {
                mt: 1.5,
                minWidth: 230,
                borderRadius: 3,
                boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
              },
            },
          }}
        >
          <MenuItem
            component={Link}
            href="/dashboard/profile"
            onClick={handleProfileClose}
          >
            <ListItemIcon>
              <PersonIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>View Profile</ListItemText>
          </MenuItem>
          <Divider variant="middle" />
          <MenuItem
            onClick={() => {
              handleProfileClose();
              logout();
            }}
            sx={{
              color: "error.main",
              "&:hover": { backgroundColor: "error.light" },
            }}
          >
            <ListItemIcon>
              <LogoutIcon fontSize="small" color="error" />
            </ListItemIcon>
            <ListItemText>Logout</ListItemText>
          </MenuItem>
        </Menu>
      </Box>
    </Box>
  );
}
