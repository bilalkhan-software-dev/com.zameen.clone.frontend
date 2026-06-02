// components/Navbar.tsx
"use client";

import { useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Box,
  Menu,
  MenuItem,
  Divider,
  Avatar,
  Container,
  useScrollTrigger,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import HomeIcon from "@mui/icons-material/Home";
import ApartmentIcon from "@mui/icons-material/Apartment";
import PeopleIcon from "@mui/icons-material/People";
import LoginIcon from "@mui/icons-material/Login";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import DashboardIcon from "@mui/icons-material/Dashboard";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

const Navbar = () => {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [mobileMenuAnchor, setMobileMenuAnchor] = useState<null | HTMLElement>(
    null,
  );

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) =>
    setAnchorEl(event.currentTarget);
  const handleMobileMenuOpen = (event: React.MouseEvent<HTMLElement>) =>
    setMobileMenuAnchor(event.currentTarget);
  const handleMenuClose = () => {
    setAnchorEl(null);
    setMobileMenuAnchor(null);
  };

  const handleLogout = () => {
    handleMenuClose();
    logout();
  };

  const isAdmin = user?.roles?.includes("Admin");
  const isAgent = user?.roles?.includes("Agent");

  const dashboardLink = isAdmin
    ? "/dashboard/admin"
    : isAgent
      ? "/dashboard/agent"
      : "/profile";

  const navItems = [
    { label: "Home", href: "/", icon: <HomeIcon fontSize="small" /> },
    {
      label: "Properties",
      href: "/properties",
      icon: <ApartmentIcon fontSize="small" />,
    },
     {
    label: "Agents",               // ← now always visible
    href: "/agents",
    icon: <PeopleIcon fontSize="small" />,
  },
  ];
  if (isAdmin) {
    navItems.push({
      label: "Agents",
      href: "/agents",
      icon: <PeopleIcon fontSize="small" />,
    });
  }

  // Scroll-triggered background for the whole navbar (optional)
  const trigger = useScrollTrigger({
    disableHysteresis: true,
    threshold: 20,
  });

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        backgroundColor: trigger ? "rgba(255,255,255,0.75)" : "transparent",
        backdropFilter: trigger ? "blur(12px)" : "none",
        boxShadow: "none",
        transition: "all 0.3s ease",
        py: 0.5,
      }}
    >
      <Container maxWidth="xl">
        <Toolbar disableGutters sx={{ justifyContent: "space-between" }}>
          {/* Logo */}
          <Typography
            variant="h5"
            component={Link}
            href="/"
            sx={{
              textDecoration: "none",
              color: "primary.main",
              fontWeight: 800,
              letterSpacing: "-0.5px",
            }}
          >
            PropertyHub
          </Typography>

          {/* Desktop: Centered Pill Container */}
          <Box
            sx={{
              display: { xs: "none", md: "flex" },
              alignItems: "center",
              gap: 0.5,
              flex: 1,
              justifyContent: "center",
            }}
          >
            {/* The Pill */}
            <Box
              sx={{
                position: "relative",
                display: "flex",
                alignItems: "center",
                gap: 1,
                px: 2,
                py: 1,
                borderRadius: "50px",
                backgroundColor: "rgba(255, 255, 255, 0.65)",
                backdropFilter: "blur(8px)",
                border: "2px solid transparent",
                transition: "border-color 0.3s ease, box-shadow 0.3s ease",
                "&:hover": {
                  borderColor: "primary.main",
                  boxShadow: "0 0 15px rgba(59,130,246,0.3)",
                },
              }}
            >
              {navItems.map((item) => (
                <Button
                  key={item.href}
                  component={Link}
                  href={item.href}
                  startIcon={item.icon}
                  sx={{
                    borderRadius: "50px",
                    px: 2.5,
                    py: 1,
                    fontWeight: 500,
                    color: "text.primary",
                    textTransform: "none",
                    transition: "all 0.2s ease",
                    "&:hover": {
                      backgroundColor: "action.hover",
                      transform: "translateY(-1px)",
                    },
                  }}
                >
                  {item.label}
                </Button>
              ))}

              {/* Animated SVG Border (inspired by the snippet) */}
              <Box
                component="svg"
                sx={{
                  position: "absolute",
                  top: -2,
                  left: -2,
                  width: "calc(100% + 4px)",
                  height: "calc(100% + 4px)",
                  pointerEvents: "none",
                  "& rect": {
                    fill: "none",
                    stroke: "primary.main",
                    strokeWidth: 2,
                    strokeDasharray: "0 0 10 40 10 40",
                    transition: "stroke-dasharray 0.5s ease",
                  },
                  ".MuiBox-root:hover & rect": {
                    strokeDasharray: "0",
                  },
                }}
                overflow="visible"
              >
                <rect rx="50" ry="50" width="100%" height="100%" />
              </Box>
            </Box>
          </Box>

          {/* Desktop Auth / Profile Section */}
          <Box
            sx={{
              display: { xs: "none", md: "flex" },
              alignItems: "center",
              gap: 1,
            }}
          >
            {!user ? (
              <>
                <Button
                  component={Link}
                  href="/login"
                  startIcon={<LoginIcon />}
                  sx={{
                    borderRadius: "50px",
                    px: 2.5,
                    py: 1,
                    fontWeight: 500,
                    color: "text.primary",
                    textTransform: "none",
                    "&:hover": { backgroundColor: "action.hover" },
                  }}
                >
                  Login
                </Button>
                <Button
                  component={Link}
                  href="/signup"
                  startIcon={<PersonAddIcon />}
                  variant="contained"
                  sx={{
                    borderRadius: "50px",
                    px: 3,
                    py: 1,
                    fontWeight: 600,
                  }}
                >
                  Sign Up
                </Button>
              </>
            ) : (
              <>
                <Button
                  component={Link}
                  href={dashboardLink}
                  startIcon={<DashboardIcon />}
                  sx={{
                    borderRadius: "50px",
                    px: 2.5,
                    py: 1,
                    fontWeight: 500,
                    color: "text.primary",
                    textTransform: "none",
                    "&:hover": { backgroundColor: "action.hover" },
                  }}
                >
                  {isAdmin ? "Admin" : isAgent ? "Agent" : "Profile"}
                </Button>
                <IconButton onClick={handleProfileMenuOpen} size="small">
                  <Avatar
                    sx={{
                      width: 36,
                      height: 36,
                      bgcolor: "secondary.main",
                      border: "2px solid",
                      borderColor: "primary.main",
                      transition: "transform 0.2s",
                      "&:hover": { transform: "scale(1.1)" },
                    }}
                  >
                    {user.fullName?.[0]?.toUpperCase() || "U"}
                  </Avatar>
                </IconButton>
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleMenuClose}
                  transformOrigin={{ horizontal: "right", vertical: "top" }}
                  anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
                  slotProps={{
                    paper: {
                      sx: {
                        mt: 1.5,
                        borderRadius: 3,
                        boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
                      },
                    },
                  }}
                >
                  <MenuItem
                    onClick={() => {
                      handleMenuClose();
                      router.push("/profile");
                    }}
                  >
                    <PeopleIcon sx={{ mr: 1 }} fontSize="small" /> Profile
                  </MenuItem>
                  <MenuItem
                    onClick={() => {
                      handleMenuClose();
                      router.push(dashboardLink);
                    }}
                  >
                    <DashboardIcon sx={{ mr: 1 }} fontSize="small" />
                    {isAdmin
                      ? "Admin Dashboard"
                      : isAgent
                        ? "Agent Dashboard"
                        : "Dashboard"}
                  </MenuItem>
                  <Divider />
                  <MenuItem onClick={handleLogout}>
                    <Typography color="error" fontWeight={500}>
                      Logout
                    </Typography>
                  </MenuItem>
                </Menu>
              </>
            )}
          </Box>

          {/* Mobile Menu */}
          <Box sx={{ display: { xs: "flex", md: "none" } }}>
            <IconButton onClick={handleMobileMenuOpen} color="inherit">
              <MenuIcon />
            </IconButton>
            <Menu
              anchorEl={mobileMenuAnchor}
              open={Boolean(mobileMenuAnchor)}
              onClose={handleMenuClose}
              PaperProps={{ sx: { borderRadius: 3, mt: 1 } }}
            >
              {navItems.map((item) => (
                <MenuItem
                  key={item.href}
                  component={Link}
                  href={item.href}
                  onClick={handleMenuClose}
                >
                  {item.icon}
                  <Typography sx={{ ml: 1 }}>{item.label}</Typography>
                </MenuItem>
              ))}
              <Divider />
              {!user ? (
                <>
                  <MenuItem
                    component={Link}
                    href="/login"
                    onClick={handleMenuClose}
                  >
                    <LoginIcon fontSize="small" />
                    <Typography sx={{ ml: 1 }}>Login</Typography>
                  </MenuItem>
                  <MenuItem
                    component={Link}
                    href="/signup"
                    onClick={handleMenuClose}
                  >
                    <PersonAddIcon fontSize="small" />
                    <Typography sx={{ ml: 1 }}>Sign Up</Typography>
                  </MenuItem>
                </>
              ) : (
                <>
                  <MenuItem
                    component={Link}
                    href="/profile"
                    onClick={handleMenuClose}
                  >
                    <PeopleIcon fontSize="small" />
                    <Typography sx={{ ml: 1 }}>Profile</Typography>
                  </MenuItem>
                  <MenuItem
                    component={Link}
                    href={dashboardLink}
                    onClick={handleMenuClose}
                  >
                    <DashboardIcon fontSize="small" />
                    <Typography sx={{ ml: 1 }}>
                      {isAdmin
                        ? "Admin Dashboard"
                        : isAgent
                          ? "Agent Dashboard"
                          : "Dashboard"}
                    </Typography>
                  </MenuItem>
                  <MenuItem onClick={handleLogout}>
                    <Typography color="error" fontWeight={500}>
                      Logout
                    </Typography>
                  </MenuItem>
                </>
              )}
            </Menu>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navbar;
