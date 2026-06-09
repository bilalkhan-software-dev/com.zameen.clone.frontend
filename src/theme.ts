import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: "#28B16E",       // Zameen green
      light: "#4ECB8C",
      dark: "#1E8A54",
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#28B16E",       // same green for consistency
      light: "#4ECB8C",
      dark: "#1E8A54",
    },
    error: {
      main: "#ef4444",
    },
    background: {
      default: "#ffffff",
      paper: "#f8fafc",
    },
    text: {
      primary: "#111827",
      secondary: "#4B5563",
    },
  },
  typography: {
    fontFamily: `'Plus Jakarta Sans', 'Inter', 'Roboto', 'Helvetica', 'Arial', sans-serif`,
    h1: { fontWeight: 700, fontSize: "2.5rem" },
    h2: { fontWeight: 700, fontSize: "2rem" },
    h3: { fontWeight: 600, fontSize: "1.75rem" },
    h4: { fontWeight: 600, fontSize: "1.5rem" },
    h5: { fontWeight: 600, fontSize: "1.25rem" },
    h6: { fontWeight: 600, fontSize: "1.1rem" },
    subtitle1: { fontWeight: 500 },
    body1: { fontSize: "1rem", lineHeight: 1.7 },
    body2: { fontSize: "0.875rem", lineHeight: 1.6 },
  },
  shape: {
    borderRadius: 6,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 600,
          padding: "10px 20px",
          borderRadius: 12,
          transition: "all 0.2s ease-in-out",
          "&:hover": {
            transform: "scale(1.03)",
          },
          "&:active": {
            transform: "scale(0.98)",
          },
        },
        contained: {
          background: "linear-gradient(135deg, #28B16E 0%, #1E8A54 100%)",
          color: "#ffffff",
          "&:hover": {
            background: "linear-gradient(135deg, #1E8A54 0%, #16623A 100%)",
          },
        },
        outlined: {
          borderColor: "#28B16E",
          color: "#28B16E",
          "&:hover": {
            borderColor: "#1E8A54",
            backgroundColor: "rgba(40,177,110,0.04)",
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
          transition: "transform 0.25s ease, box-shadow 0.25s ease",
          "&:hover": {
            transform: "translateY(-6px)",
            boxShadow: "0 12px 28px rgba(0,0,0,0.12)",
          },
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: "outlined",
        size: "small",
      },
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: 10,
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 500,
          borderRadius: 8,
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          backgroundColor: "#f1f5f9",
        },
      },
    },
  },
});

export default theme;