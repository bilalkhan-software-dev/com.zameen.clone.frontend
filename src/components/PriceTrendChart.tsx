"use client";

import { useState, useEffect } from "react";
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
import { Box, Button, Typography, Paper, CircularProgress, Stack } from "@mui/material";
import api from "@/lib/axios";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

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
  location,
  propertyType,
  sizeRange,
}: {
  location: string;
  propertyType: string;
  sizeRange: string;
}) {
  const [range, setRange] = useState<"6m" | "1y" | "max">("1y");
  const [data, setData] = useState<PriceTrendResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTrends();
  }, [location, propertyType, sizeRange, range]);

  const fetchTrends = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/api/PriceTrend", {
        params: { location, propertyType, sizeRange, range },
      });
      setData(res.data);
    } catch (err) {
      setError("Failed to load price trends.");
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    if (price >= 10_000_000) return `PKR ${(price / 10_000_000).toFixed(2)}Cr`;
    if (price >= 100_000) return `PKR ${(price / 100_000).toFixed(1)}L`;
    return `PKR ${price.toLocaleString()}`;
  };

  const chartData = {
    labels: data?.history.map(p => new Date(p.date).toLocaleDateString("en-US", { month: "short", year: "2-digit" })) || [],
    datasets: [
      {
        label: "Average Price (PKR)",
        data: data?.history.map(p => p.price) || [],
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
      tooltip: { callbacks: { label: (ctx: any) => `PKR ${ctx.raw.toLocaleString()}` } },
    },
    scales: {
      y: { ticks: { callback: (val: number) => (val >= 1e7 ? `${(val / 1e7).toFixed(1)}Cr` : `${(val / 1e5).toFixed(1)}L`) } },
    },
  };

  if (loading) return <CircularProgress />;
  if (error) return <Typography color="error">{error}</Typography>;
  if (!data) return null;

  return (
    <Paper variant="outlined" sx={{ p: 3, borderRadius: 3, mt: 4 }}>
      <Typography variant="h6"  sx={{fontWeight:"bold"}}>
        Price Trends – {location} {sizeRange} {propertyType}
      </Typography>

      {/* Summary Stats */}
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3, mb: 3 }}>
        <Box>
          <Typography variant="body2" color="text.secondary">Current Price</Typography>
          <Typography variant="h6"  sx={{fontWeight:"bold"}}>{formatPrice(data.currentPrice)}</Typography>
        </Box>
        <Box>
          <Typography variant="body2" color="text.secondary">Price Change</Typography>
          <Typography variant="h6" sx={{fontWeight:"bold", color:data.priceChange >= 0 ? "success.main" : "error.main"}}} >
            {data.priceChange >= 0 ? "+" : ""}{formatPrice(data.priceChange)} ({data.percentChange.toFixed(2)}%)
          </Typography>
        </Box>
        {data.twelveMonthsAgo && (
          <Box>
            <Typography variant="body2" color="text.secondary">12 months ago</Typography>
            <Typography variant="body2">{formatPrice(data.twelveMonthsAgo)}</Typography>
          </Box>
        )}
      </Box>

      {/* Range Toggles */}
      <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
        <Button variant={range === "6m" ? "contained" : "outlined"} onClick={() => setRange("6m")}>6 Months</Button>
        <Button variant={range === "1y" ? "contained" : "outlined"} onClick={() => setRange("1y")}>1 Year</Button>
        <Button variant={range === "max" ? "contained" : "outlined"} onClick={() => setRange("max")}>Max</Button>
      </Stack>

      {/* Chart */}
      <Box sx={{ height: 300 }}>
        <Line data={chartData} options={options} />
      </Box>

      {/* Optional metric toggles (Price, Price/sq.ft., Index) – can add later */}
      <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 2 }}>
        <Typography variant="caption" color="text.secondary">Price (PKR)</Typography>
        {/* You can add additional toggle buttons for Price/sq.ft. and Index */}
      </Box>
    </Paper>
  );
}