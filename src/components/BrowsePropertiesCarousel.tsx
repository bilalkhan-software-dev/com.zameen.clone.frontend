"use client";

import { useRef } from "react";
import { Box, Typography, IconButton, Paper, Stack } from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import HomeIcon from "@mui/icons-material/Home";
import CropSquareIcon from "@mui/icons-material/CropSquare";
import BusinessIcon from "@mui/icons-material/Business";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";

interface BrowseItem {
  label: string;
  type: string;
  detail?: string;
  query: Record<string, string>;
}

const categories = [
  {
    title: "Homes",
    icon: <HomeIcon />,
    items: [
      {
        label: "On Instalments",
        type: "Houses",
        detail: "",
        query: { q: "instalment", type: "HOUSE" },
      },
      {
        label: "1 Bedroom",
        type: "Flats",
        detail: "1 Bed",
        query: { beds: "1", type: "FLAT" },
      },
      {
        label: "2 Bedroom",
        type: "Flats",
        detail: "2 Beds",
        query: { beds: "2", type: "FLAT" },
      },
      {
        label: "3 Bedroom",
        type: "Flats",
        detail: "3 Beds",
        query: { beds: "3", type: "FLAT" },
      },
      {
        label: "5 Marla",
        type: "Houses",
        detail: "5 Marla",
        query: { minArea: "1361.25", maxArea: "1361.25", type: "HOUSE" },
      },
      {
        label: "10 Marla",
        type: "Houses",
        detail: "10 Marla",
        query: { minArea: "2722.5", maxArea: "2722.5", type: "HOUSE" },
      },
      {
        label: "New",
        type: "Houses",
        detail: "",
        query: { q: "new", type: "HOUSE" },
      },
      {
        label: "Low Price",
        type: "All Homes",
        detail: "",
        query: { maxPrice: "2500000", type: "HOUSE" },
      },
      {
        label: "Studio",
        type: "Studio",
        detail: "",
        query: { type: "STUDIO" },
      },
    ],
  },
  {
    title: "Plots",
    icon: <CropSquareIcon />,
    items: [
      {
        label: "5 Marla",
        type: "Residential Plots",
        detail: "5 Marla",
        query: { minArea: "1361.25", maxArea: "1361.25", type: "PLOT" },
      },
      {
        label: "10 Marla",
        type: "Residential Plots",
        detail: "10 Marla",
        query: { minArea: "2722.5", maxArea: "2722.5", type: "PLOT" },
      },
      {
        label: "1 Kanal",
        type: "Plots",
        detail: "1 Kanal",
        query: { minArea: "5445", maxArea: "5445", type: "PLOT" },
      },
      {
        label: "With Possession",
        type: "Residential Plots",
        detail: "",
        query: { q: "possession", type: "PLOT" },
      },
      {
        label: "Corner",
        type: "Residential Plots",
        detail: "",
        query: { q: "corner", type: "PLOT" },
      },
      {
        label: "Park Facing",
        type: "Residential Plots",
        detail: "",
        query: { q: "park facing", type: "PLOT" },
      },
    ],
  },
  {
    title: "Commercial",
    icon: <BusinessIcon />,
    items: [
      {
        label: "Small Office",
        type: "Offices",
        detail: "<500 sq ft",
        query: { maxArea: "500", type: "COMMERCIAL" },
      },
      {
        label: "New Office",
        type: "Offices",
        detail: "",
        query: { q: "new", type: "COMMERCIAL" },
      },
      {
        label: "Small Shop",
        type: "Shops",
        detail: "<200 sq ft",
        query: { maxArea: "200", type: "SHOP" },
      },
      {
        label: "Running Shop",
        type: "Shops",
        detail: "",
        query: { q: "running", type: "SHOP" },
      },
      {
        label: "Warehouse",
        type: "Commercial",
        detail: "",
        query: { q: "warehouse", type: "COMMERCIAL" },
      },
      {
        label: "Factory",
        type: "Factory",
        detail: "",
        query: { type: "FACTORY" },
      },
    ],
  },
];

const CategoryCarousel = ({
  title,
  icon,
  items,
}: {
  title: string;
  icon: React.ReactNode;
  items: BrowseItem[];
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const amount = 300;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  const buildUrl = (item: BrowseItem) => {
    const params = new URLSearchParams();
    params.set("purpose", "BUY");
    Object.entries(item.query).forEach(([k, v]) => params.set(k, v));
    return `/properties?${params.toString()}`;
  };

  return (
    <Paper
      elevation={0}
      variant="outlined"
      sx={{ p: 2, borderRadius: 3, mb: 4 }}
    >
      <Stack direction="row" spacing={1} sx={{ mb: 2, alignItems: "center" }}>
        {icon}
        <Typography variant="h6" sx={{ fontWeight: "bold" }}>
          {title}
        </Typography>
      </Stack>
      <Box
        sx={{ display: "flex", justifyContent: "space-between", px: 2, mb: 1 }}
      >
        {/* Replaced "Popular" with an icon (you can also use an empty Box) */}
        <Box
          sx={{ width: "40%", display: "flex", alignItems: "center", gap: 0.5 }}
        >
          <TrendingUpIcon fontSize="small" />
          <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
            Trending
          </Typography>
        </Box>
        <Typography
          variant="subtitle2"
          sx={{ fontWeight: "bold", width: "30%" }}
        >
          Type
        </Typography>
        <Typography
          variant="subtitle2"
          sx={{ fontWeight: "bold", width: "30%" }}
        >
          Area/Other
        </Typography>
      </Box>
      <Box sx={{ position: "relative" }}>
        <IconButton
          onClick={() => scroll("left")}
          sx={{
            position: "absolute",
            left: 0,
            top: "50%",
            transform: "translateY(-50%)",
            zIndex: 2,
            bgcolor: "background.paper",
            boxShadow: 1,
          }}
        >
          <ChevronLeftIcon />
        </IconButton>
        <Box
          ref={scrollRef}
          sx={{
            display: "flex",
            overflowX: "auto",
            scrollBehavior: "smooth",
            gap: 2,
            px: 4,
            py: 1,
            "&::-webkit-scrollbar": { height: 6 },
            "&::-webkit-scrollbar-track": {
              bgcolor: "grey.200",
              borderRadius: 3,
            },
            "&::-webkit-scrollbar-thumb": {
              bgcolor: "grey.400",
              borderRadius: 3,
            },
          }}
        >
          {items.map((item, idx) => (
            <Box
              key={idx}
              component="a"
              href={buildUrl(item)}
              sx={{
                display: "flex",
                flexDirection: "column",
                minWidth: 180,
                p: 1.5,
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 2,
                textDecoration: "none",
                color: "text.primary",
                transition: "all 0.2s",
                "&:hover": {
                  bgcolor: "action.hover",
                  transform: "scale(1.02)",
                },
              }}
            >
              <Typography
                variant="body2"
                sx={{
                  fontWeight: "bold",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {item.label}
              </Typography>
              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                {item.type}
              </Typography>
              {item.detail && (
                <Typography variant="caption" sx={{ color: "primary.main" }}>
                  {item.detail}
                </Typography>
              )}
            </Box>
          ))}
        </Box>
        <IconButton
          onClick={() => scroll("right")}
          sx={{
            position: "absolute",
            right: 0,
            top: "50%",
            transform: "translateY(-50%)",
            zIndex: 2,
            bgcolor: "background.paper",
            boxShadow: 1,
          }}
        >
          <ChevronRightIcon />
        </IconButton>
      </Box>
    </Paper>
  );
};

export default function BrowseProperties() {
  return (
    <Box sx={{ mt: 2 }}>
      {categories.map((cat) => (
        <CategoryCarousel
          key={cat.title}
          title={cat.title}
          icon={cat.icon}
          items={cat.items}
        />
      ))}
    </Box>
  );
}
