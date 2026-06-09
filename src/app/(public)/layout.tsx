"use client";
import { usePathname } from "next/navigation";
import Box from "@mui/material/Box";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isHome =
    pathname === "/" || pathname === "/agents" || pathname === "/properties";

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Navbar />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          // No vertical padding on the home page – the hero section handles it.
          // Other pages get comfortable spacing below the fixed navbar.
          pt: isHome ? 0 : 10,
          pb: isHome ? 0 : 3,
        }}
      >
        {children}
      </Box>
      <Footer />
    </Box>
  );
}
