"use client";

import { useState, useEffect, useCallback } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import {
  Box,
  Button,
  Typography,
  Paper,
  CircularProgress,
  Stack,
  Alert,
} from "@mui/material";
import api from "@/lib/axios";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
);

interface TrendPoint {
  date: string;
  price: number;
}

interface PriceTrendResponse {
  currentPrice: number;
  priceChange: number;
  percentChange: number;
  sixMonthsAgo: number | null;
  twelveMonthsAgo: number | null;
  twentyFourMonthsAgo: number | null;
  history: TrendPoint[];
}

export default function PriceTrendChart({
  city,
  location,
  propertyType,
  propertyPurpose,
  sizeRange,
}: {
  city: string;
  location: string;
  propertyType: string;
  propertyPurpose: string;
  sizeRange: string;
}) {
  const [range, setRange] = useState<"6m" | "1y" | "max">("1y");
  const [data, setData] = useState<PriceTrendResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTrends = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/api/PriceTrend", {
        params: {
          city,
          location,
          propertyType,
          propertyPurpose,
          sizeRange,
          range,
        },
      });
      console.log("PT", res);
      console.log("PT", res.data?.data);
      // API returns { data: PriceTrendResponse } or wraps it; handle both
      const trendData = res.data?.data || res.data;
      setData(trendData);
    } catch (err: any) {
      console.error("Failed to fetch price trends:", err);
      setError(err.response?.data?.message || "Failed to load price trends.");
    } finally {
      setLoading(false);
    }
  }, [city, location, propertyType, sizeRange, range]);

  useEffect(() => {
    fetchTrends();
  }, [fetchTrends]);

  const formatPrice = (price: number) => {
    if (price >= 1e7) return `PKR ${(price / 1e7).toFixed(2)}Cr`;
    if (price >= 1e5) return `PKR ${(price / 1e5).toFixed(1)}L`;
    return `PKR ${price.toLocaleString()}`;
  };

  // Loading state
  if (loading) {
    return (
      <Paper
        variant="outlined"
        sx={{ p: 3, borderRadius: 3, mt: 4, textAlign: "center" }}
      >
        <CircularProgress size={32} />
      </Paper>
    );
  }

  // Error state
  if (error) {
    return (
      <Paper variant="outlined" sx={{ p: 3, borderRadius: 3, mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Paper>
    );
  }

  // Empty / no data state
  if (!data || !data.history || data.history.length === 0) {
    return (
      <Paper variant="outlined" sx={{ p: 3, borderRadius: 3, mt: 4 }}>
        <Typography variant="h6" sx={{ fontWeight: "bold" }}>
          Price Trends – {location} {sizeRange} {propertyType}
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 2 }}>
          No trend data available for this property type and location.
        </Typography>
      </Paper>
    );
  }

  // Chart data
  const chartData = {
    labels: data.history.map((p) =>
      new Date(p.date).toLocaleDateString("en-US", {
        month: "short",
        year: "2-digit",
      }),
    ),
    datasets: [
      {
        label: "Average Price (PKR)",
        data: data.history.map((p) => p.price),
        borderColor: "#f59e0b",
        backgroundColor: "rgba(245, 158, 11, 0.1)",
        fill: true,
        tension: 0.3,
        pointRadius: 2,
        pointHoverRadius: 5,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: { position: "top" as const },
      tooltip: {
        callbacks: {
          label: (ctx: any) => `PKR ${ctx.raw.toLocaleString()}`,
        },
      },
    },
    scales: {
      y: {
        ticks: {
          callback: (val: number) =>
            val >= 1e7
              ? `${(val / 1e7).toFixed(1)}Cr`
              : `${(val / 1e5).toFixed(1)}L`,
        },
      },
    },
  };

  return (
    <Paper variant="outlined" sx={{ p: 3, borderRadius: 3, mt: 4 }}>
      <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>
        Price Trends – {location} {sizeRange} {propertyType}
      </Typography>

      {/* Summary statistics */}
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3, mb: 3 }}>
        <Box>
          <Typography variant="body2" color="text.secondary">
            Current Price
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: "bold" }}>
            {formatPrice(data.currentPrice)}
          </Typography>
        </Box>
        <Box>
          <Typography variant="body2" color="text.secondary">
            Price Change
          </Typography>
          <Typography
            variant="h6"
            sx={{
              fontWeight: "bold",
              color: data.priceChange >= 0 ? "success.main" : "error.main",
            }}
          >
            {data.priceChange >= 0 ? "+" : ""}
            {formatPrice(data.priceChange)} ({data.percentChange.toFixed(2)}%)
          </Typography>
        </Box>
        {data.twelveMonthsAgo != null && (
          <Box>
            <Typography variant="body2" color="text.secondary">
              12 months ago
            </Typography>
            <Typography variant="body2">
              {formatPrice(data.twelveMonthsAgo)}
            </Typography>
          </Box>
        )}
      </Box>

      {/* Range selector */}
      <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
        <Button
          variant={range === "6m" ? "contained" : "outlined"}
          onClick={() => setRange("6m")}
          size="small"
        >
          6 Months
        </Button>
        <Button
          variant={range === "1y" ? "contained" : "outlined"}
          onClick={() => setRange("1y")}
          size="small"
        >
          1 Year
        </Button>
        <Button
          variant={range === "max" ? "contained" : "outlined"}
          onClick={() => setRange("max")}
          size="small"
        >
          Max
        </Button>
      </Stack>

      {/* Chart */}
      <Box sx={{ height: 300 }}>
        <Line data={chartData} options={options} />
      </Box>
    </Paper>
  );
}
