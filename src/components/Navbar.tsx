// components/Navbar.tsx (updated)
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
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
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

  // Determine the dashboard link based on role
  const dashboardLink = isAdmin
    ? "/dashboard/admin"
    : isAgent
      ? "/dashboard/agent"
      : "/profile"; // normal user goes to profile

  return (
    <AppBar position="sticky" color="primary">
      <Toolbar>
        <Typography
          variant="h6"
          component={Link}
          href="/"
          sx={{ textDecoration: "none", color: "inherit", fontWeight: 700 }}
        >
          PropertyHub
        </Typography>

        <Box
          sx={{
            flexGrow: 1,
            display: { xs: "none", md: "flex" },
            gap: 2,
            ml: 4,
          }}
        >
          <Button component={Link} href="/" color="inherit">
            Home
          </Button>
          <Button component={Link} href="/properties" color="inherit">
            Properties
          </Button>
          {isAdmin && (
            <Button component={Link} href="/agents" color="inherit">
              Agents
            </Button>
          )}
        </Box>

        <Box
          sx={{
            display: { xs: "none", md: "flex" },
            alignItems: "center",
            gap: 1,
          }}
        >
          {!user ? (
            <>
              <Button component={Link} href="/login" color="inherit">
                Login
              </Button>
              <Button
                component={Link}
                href="/signup"
                variant="outlined"
                color="secondary"
              >
                Sign Up
              </Button>
            </>
          ) : (
            <>
              {/* Role-based Dashboard button */}
              <Button component={Link} href={dashboardLink} color="inherit">
                {isAdmin
                  ? "Admin Dashboard"
                  : isAgent
                    ? "Agent Dashboard"
                    : "Profile"}
              </Button>
              <IconButton onClick={handleProfileMenuOpen} size="small">
                <Avatar
                  sx={{ width: 32, height: 32, bgcolor: "secondary.main" }}
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
              >
                <MenuItem
                  onClick={() => {
                    handleMenuClose();
                    router.push("/profile");
                  }}
                >
                  Profile
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    handleMenuClose();
                    router.push(dashboardLink);
                  }}
                >
                  {isAdmin
                    ? "Admin Dashboard"
                    : isAgent
                      ? "Agent Dashboard"
                      : "Dashboard"}
                </MenuItem>
                <Divider />
                <MenuItem onClick={handleLogout}>Logout</MenuItem>
              </Menu>
            </>
          )}
        </Box>

        {/* Mobile menu – similar logic */}
        <Box sx={{ display: { xs: "flex", md: "none" }, ml: "auto" }}>
          <IconButton color="inherit" onClick={handleMobileMenuOpen}>
            <MenuIcon />
          </IconButton>
          <Menu
            anchorEl={mobileMenuAnchor}
            open={Boolean(mobileMenuAnchor)}
            onClose={handleMenuClose}
          >
            <MenuItem component={Link} href="/" onClick={handleMenuClose}>
              Home
            </MenuItem>
            <MenuItem
              component={Link}
              href="/properties"
              onClick={handleMenuClose}
            >
              Properties
            </MenuItem>
            {isAdmin && (
              <MenuItem
                component={Link}
                href="/agents"
                onClick={handleMenuClose}
              >
                Agents
              </MenuItem>
            )}
            <Divider />
            {!user ? (
              <>
                <MenuItem
                  component={Link}
                  href="/login"
                  onClick={handleMenuClose}
                >
                  Login
                </MenuItem>
                <MenuItem
                  component={Link}
                  href="/signup"
                  onClick={handleMenuClose}
                >
                  Sign Up
                </MenuItem>
              </>
            ) : (
              <>
                <MenuItem
                  component={Link}
                  href="/profile"
                  onClick={handleMenuClose}
                >
                  Profile
                </MenuItem>
                <MenuItem
                  component={Link}
                  href={dashboardLink}
                  onClick={handleMenuClose}
                >
                  {isAdmin
                    ? "Admin Dashboard"
                    : isAgent
                      ? "Agent Dashboard"
                      : "Dashboard"}
                </MenuItem>
                <MenuItem onClick={handleLogout}>Logout</MenuItem>
              </>
            )}
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
