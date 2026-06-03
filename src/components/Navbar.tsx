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
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import HomeIcon from "@mui/icons-material/HomeRounded";
import ApartmentIcon from "@mui/icons-material/Apartment";
import PeopleIcon from "@mui/icons-material/People";
import LoginIcon from "@mui/icons-material/Login";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import DashboardIcon from "@mui/icons-material/Dashboard";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

const Navbar = () => {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
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
    { label: "Agents", href: "/agents", icon: <PeopleIcon fontSize="small" /> },
  ];

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        top: 16,
        left: "50%",
        transform: "translateX(-50%)",
        width: "95%",
        maxWidth: "1400px",
        borderRadius: "24px",
        background: "rgba(255,255,255,0.85)",
        backdropFilter: "blur(20px)",
        border: "1px solid rgba(255,255,255,0.3)",
        boxShadow: "0 10px 40px rgba(0,0,0,0.08)",
        color: "text.primary",
        zIndex: 1100,
      }}
    >
      <Container maxWidth="xl">
        <Toolbar
          disableGutters
          sx={{
            justifyContent: "space-between",
            minHeight: 80,
            px: 2,
          }}
        >
          {/* Logo */}
          <Box
            component={Link}
            href="/"
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              textDecoration: "none",
            }}
          >
            {/* <HomeIcon sx={{ fontSize: 32, color: "primary.main" }} /> */}
            <Typography
              variant="h5"
              sx={{
                fontWeight: 900,
                letterSpacing: "-1px",
                color: "text.primary",
              }}
            >
              Property
              <Box component="span" sx={{ color: "primary.main" }}>
                Hub
              </Box>
            </Typography>
          </Box>

          {/* Centered Pill Navigation */}
          <Box
            sx={{
              display: { xs: "none", md: "flex" },
              alignItems: "center",
              gap: 1,
              p: 0.8,
              borderRadius: "999px",
              background:
                "linear-gradient(135deg, rgba(255,255,255,.9), rgba(255,255,255,.6))",
              border: "1px solid rgba(255,255,255,.3)",
              boxShadow: "0 8px 30px rgba(0,0,0,.06)",
            }}
          >
            {navItems.map((item) => (
              <Button
                key={item.href}
                component={Link}
                href={item.href}
                startIcon={item.icon}
                sx={{
                  px: 2.5,
                  py: 1,
                  borderRadius: "999px",
                  textTransform: "none",
                  fontWeight: 600,
                  bgcolor:
                    pathname === item.href ? "primary.main" : "transparent",
                  color: pathname === item.href ? "#fff" : "text.primary",
                  transition: "all .25s ease",
                  "&:hover": {
                    transform: "translateY(-2px)",
                    bgcolor:
                      pathname === item.href ? "primary.dark" : "action.hover",
                  },
                }}
              >
                {item.label}
              </Button>
            ))}
          </Box>

          {/* Auth / Profile Section */}
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
                  sx={{
                    borderRadius: "999px",
                    px: 2.5,
                    textTransform: "none",
                    fontWeight: 600,
                  }}
                >
                  Login
                </Button>
                <Button
                  component={Link}
                  href="/signup"
                  variant="contained"
                  sx={{
                    borderRadius: "999px",
                    px: 3,
                    fontWeight: 700,
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
                      width: 42,
                      height: 42,
                      bgcolor: "primary.main",
                      border: "3px solid",
                      borderColor: "primary.main",
                      boxShadow: "0 0 15px rgba(37,99,235,.25)",
                      cursor: "pointer",
                      transition: "all .25s ease",

                      "&:hover": {
                        transform: "scale(1.08)",
                      },
                    }}
                  >
                    {user.fullName?.[0]?.toUpperCase()}
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
                    <Typography color="error" sx={{ fontWeight: 500 }}>
                      Logout
                    </Typography>
                  </MenuItem>
                </Menu>
              </>
            )}
          </Box>

          {/* Mobile Menu */}
          <Box sx={{ display: { xs: "flex", md: "none" } }}>
            <IconButton
              onClick={handleMobileMenuOpen}
              sx={{
                display: { xs: "flex", md: "none" },
                bgcolor: "rgba(255,255,255,.8)",

                "&:hover": {
                  bgcolor: "rgba(255,255,255,1)",
                },
              }}
            >
              <MenuIcon />
            </IconButton>
            <Menu
              anchorEl={mobileMenuAnchor}
              open={Boolean(mobileMenuAnchor)}
              onClose={handleMenuClose}
              slotProps={{ paper: { sx: { borderRadius: 3, mt: 1 } } }}
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
                    <Typography color="error" sx={{ fontWeight: 500 }}>
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
