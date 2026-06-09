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
  TextField,
  InputAdornment,
  Tooltip,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import HomeIcon from "@mui/icons-material/HomeRounded";
import ApartmentIcon from "@mui/icons-material/Apartment";
import PeopleIcon from "@mui/icons-material/People";
import LoginIcon from "@mui/icons-material/Login";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import DashboardIcon from "@mui/icons-material/Dashboard";
import SearchIcon from "@mui/icons-material/Search";
import SettingsIcon from "@mui/icons-material/Settings";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import SquareFootIcon from "@mui/icons-material/SquareFoot";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useSettings, areaUnits } from "@/context/SettingsContext";

const Navbar = () => {
  const { user, logout } = useAuth();
  const { currency, setCurrency, areaUnit, setAreaUnit } = useSettings();
  const router = useRouter();
  const pathname = usePathname();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [mobileMenuAnchor, setMobileMenuAnchor] = useState<null | HTMLElement>(
    null,
  );
  const [settingsAnchor, setSettingsAnchor] = useState<null | HTMLElement>(
    null,
  );
  const [propertyIdInput, setPropertyIdInput] = useState("");

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) =>
    setAnchorEl(event.currentTarget);
  const handleMobileMenuOpen = (event: React.MouseEvent<HTMLElement>) =>
    setMobileMenuAnchor(event.currentTarget);
  const handleSettingsClick = (event: React.MouseEvent<HTMLElement>) =>
    setSettingsAnchor(event.currentTarget);
  const handleMenuClose = () => {
    setAnchorEl(null);
    setMobileMenuAnchor(null);
    setSettingsAnchor(null);
  };

  const handleLogout = () => {
    handleMenuClose();
    logout();
  };

  const handlePropertyIdSubmit = () => {
    const id = parseInt(propertyIdInput, 10);
    if (!isNaN(id) && id > 0) {
      router.push(`/properties/${id}`);
      setPropertyIdInput("");
    }
  };

  const handlePropertyIdKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handlePropertyIdSubmit();
    }
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
      elevation={1}
      sx={{
        bgcolor: "#ffffff",
        color: "#111827",
        borderBottom: "1px solid #e5e7eb",
        zIndex: 1100,
      }}
    >
      <Container maxWidth="xl">
        <Toolbar disableGutters sx={{ minHeight: 64, px: 2, gap: 1 }}>
          {/* Logo */}
          <Box
            component={Link}
            href="/"
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              textDecoration: "none",
              color: "inherit",
              flexShrink: 0,
            }}
          >
            <Typography
              variant="h6"
              sx={{
                fontWeight: 900,
                letterSpacing: "-0.5px",
                color: "#111827",
              }}
            >
              Property
              <Box component="span" sx={{ color: "#28B16E" }}>
                Hub
              </Box>
            </Typography>
          </Box>

          {/* Desktop nav links */}
          <Box sx={{ display: { xs: "none", md: "flex" }, ml: 4, gap: 0.5 }}>
            {navItems.map((item) => (
              <Button
                key={item.href}
                component={Link}
                href={item.href}
                startIcon={item.icon}
                sx={{
                  color: "#4B5563",
                  textTransform: "none",
                  fontWeight: 600,
                  borderRadius: 2,
                  px: 2,
                  "&:hover": {
                    bgcolor: "rgba(40,177,110,0.08)",
                    color: "#28B16E",
                  },
                  ...(pathname === item.href && {
                    bgcolor: "#28B16E",
                    color: "#fff",
                    "&:hover": { bgcolor: "#1E8A54" },
                  }),
                }}
              >
                {item.label}
              </Button>
            ))}
          </Box>

          {/* Right section */}
          <Box
            sx={{ ml: "auto", display: "flex", alignItems: "center", gap: 1 }}
          >
            {/* Property ID quick search */}
            <TextField
              size="small"
              placeholder="Property ID"
              value={propertyIdInput}
              onChange={(e) => {
                const val = e.target.value;
                if (/^\d*$/.test(val)) {
                  setPropertyIdInput(val);
                }
              }}
              onKeyDown={handlePropertyIdKeyDown}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: "grey.500", fontSize: 20 }} />
                    </InputAdornment>
                  ),
                  sx: {
                    bgcolor: "#f3f4f6",
                    borderRadius: 2,
                    "& input": { py: 0.5 },
                    width: 140,
                  },
                },
              }}
              sx={{ display: { xs: "none", sm: "flex" } }}
            />
            <IconButton
              onClick={handlePropertyIdSubmit}
              sx={{ display: { xs: "none", sm: "flex" }, color: "#4B5563" }}
            >
              <SearchIcon />
            </IconButton>
            {/* Settings button */}
            <Tooltip title="Settings">
              <IconButton
                onClick={handleSettingsClick}
                sx={{ color: "#4B5563" }}
              >
                <SettingsIcon />
              </IconButton>
            </Tooltip>
            {/* Settings menu */}
            <Menu
              anchorEl={settingsAnchor}
              open={Boolean(settingsAnchor)}
              onClose={handleMenuClose}
              slotProps={{ paper: { sx: { borderRadius: 3, mt: 1.5 } } }}
            >
              <MenuItem disabled>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  Settings
                </Typography>
              </MenuItem>

              {/* Currency toggle */}
              <MenuItem
                onClick={() => {
                  setCurrency(currency === "PKR" ? "USD" : "PKR");
                  handleMenuClose();
                }}
              >
                <AttachMoneyIcon sx={{ mr: 1 }} />
                Currency: {currency}
              </MenuItem>

              {/* Area unit – list of all units */}
              <MenuItem disabled sx={{ opacity: "1 !important" }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  Area Unit
                </Typography>
              </MenuItem>
              {areaUnits.map((unit) => (
                <MenuItem
                  key={unit.value}
                  onClick={() => {
                    setAreaUnit(unit);
                    handleMenuClose();
                  }}
                  sx={{
                    pl: 4,
                    ...(areaUnit.value === unit.value && {
                      bgcolor: "rgba(40,177,110,0.08)",
                      color: "#28B16E",
                    }),
                  }}
                >
                  <SquareFootIcon sx={{ mr: 1, fontSize: 18 }} />
                  {unit.label}
                  {areaUnit.value === unit.value && " ✓"}
                </MenuItem>
              ))}
            </Menu>
            {/* Auth */}
            <Box sx={{ display: { xs: "none", md: "flex" }, gap: 1 }}>
              {!user ? (
                <>
                  <Button
                    component={Link}
                    href="/login"
                    sx={{
                      color: "#4B5563",
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
                      borderRadius: 2,
                      fontWeight: 700,
                      bgcolor: "#28B16E",
                      "&:hover": { bgcolor: "#1E8A54" },
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
                    sx={{ color: "#4B5563", textTransform: "none" }}
                  >
                    {isAdmin ? "Admin" : isAgent ? "Agent" : "Profile"}
                  </Button>
                  <IconButton onClick={handleProfileMenuOpen} size="small">
                    <Avatar
                      sx={{
                        width: 42,
                        height: 42,
                        bgcolor: "#28B16E",
                        border: "2px solid #28B16E",
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
                      paper: { sx: { mt: 1.5, borderRadius: 3, boxShadow: 4 } },
                    }}
                  >
                    <MenuItem
                      onClick={() => {
                        handleMenuClose();
                        router.push("/profile");
                      }}
                    >
                      <PeopleIcon sx={{ mr: 1 }} /> Profile
                    </MenuItem>
                    <MenuItem
                      onClick={() => {
                        handleMenuClose();
                        router.push(dashboardLink);
                      }}
                    >
                      <DashboardIcon sx={{ mr: 1 }} />
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
            {/* Mobile menu button */}
            <Box sx={{ display: { xs: "flex", md: "none" } }}>
              <IconButton
                onClick={handleMobileMenuOpen}
                sx={{ color: "#4B5563" }}
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
                {/* Mobile property ID search */}
                <Box sx={{ px: 2, py: 1 }}>
                  <TextField
                    size="small"
                    placeholder="Property ID"
                    value={propertyIdInput}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (/^\d*$/.test(val)) {
                        setPropertyIdInput(val);
                      }
                    }}
                    onKeyDown={handlePropertyIdKeyDown}
                    slotProps={{
                      input: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <SearchIcon fontSize="small" />
                          </InputAdornment>
                        ),
                      },
                    }}
                    fullWidth
                  />
                  <Button
                    variant="contained"
                    size="small"
                    onClick={handlePropertyIdSubmit}
                    sx={{ mt: 0.5 }}
                    fullWidth
                  >
                    Go
                  </Button>
                </Box>
                <Divider />
                {/* Settings in mobile menu */}
                <MenuItem disabled>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    Settings
                  </Typography>
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    setCurrency(currency === "PKR" ? "USD" : "PKR");
                    handleMenuClose();
                  }}
                >
                  <AttachMoneyIcon sx={{ mr: 1 }} /> Currency: {currency}
                </MenuItem>
                <MenuItem disabled sx={{ opacity: "1 !important" }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    Area Unit
                  </Typography>
                </MenuItem>
                {areaUnits.map((unit) => (
                  <MenuItem
                    key={unit.value}
                    onClick={() => {
                      setAreaUnit(unit);
                      handleMenuClose();
                    }}
                    sx={{
                      pl: 4,
                      ...(areaUnit.value === unit.value && {
                        bgcolor: "rgba(40,177,110,0.08)",
                        color: "#28B16E",
                      }),
                    }}
                  >
                    <SquareFootIcon sx={{ mr: 1, fontSize: 18 }} />
                    {unit.label}
                    {areaUnit.value === unit.value && " ✓"}
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
                      <Typography color="error">Logout</Typography>
                    </MenuItem>
                  </>
                )}
              </Menu>
            </Box>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navbar;
