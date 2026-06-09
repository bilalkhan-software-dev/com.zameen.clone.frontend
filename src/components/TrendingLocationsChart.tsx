"use client";

import { useEffect, useState } from "react";
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
} from "chart.js";
import { Box, CircularProgress, Typography, Paper, Alert } from "@mui/material";
import api from "@/lib/axios";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
);

interface TrendingData {
  location: string;
  date: string;
  searchCount: number;
}

export default function TrendingLocationsChart({
  city = "Lahore",
  days = 30,
}: {
  city?: string;
  days?: number;
}) {
  const [data, setData] = useState<TrendingData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get("/api/searchlog/trending/locations/by-city", {
          params: { city, days },
        });
        console.log("Trending location by city",res.data?.data);

        // Handle both possible response shapes:
        // - Direct array (res.data is the array)
        // - Wrapped in ApiResponse (res.data.data is the array)
        const payload = Array.isArray(res.data)
          ? res.data
          : (res.data?.data ?? []);

        setData(payload);
      } catch (err) {
        setError("Failed to load trending data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [city, days]);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ my: 2 }}>
        {error}
      </Alert>
    );
  }

  if (!data.length) {
    return (
      <Paper
        variant="outlined"
        sx={{ p: 3, borderRadius: 3, textAlign: "center" }}
      >
        <Typography color="text.secondary">
          No trending data for {city} in the last {days} days.
        </Typography>
      </Paper>
    );
  }

  // Extract unique locations and sorted dates
  const locations = [...new Set(data.map((d) => d.location))];
  const dates = [...new Set(data.map((d) => d.date.split("T")[0]))].sort(); // use date part only

  const datasets = locations.map((location, idx) => {
    const locationData = data.filter((d) => d.location === location);
    const counts = dates.map((date) => {
      const point = locationData.find((d) => d.date.startsWith(date));
      return point ? point.searchCount : 0;
    });
    return {
      label: location,
      data: counts,
      borderColor: `hsl(${(idx * 360) / locations.length}, 70%, 50%)`,
      backgroundColor: "transparent",
      tension: 0.3,
      fill: false,
      pointRadius: 3,
      pointHoverRadius: 6,
    };
  });

  const chartData = {
    labels: dates.map((d) =>
      new Date(d).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
    ),
    datasets,
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "top" as const },
      title: {
        display: true,
        text: `Trending Locations in ${city} (last ${days} days)`,
        font: { size: 14 },
      },
      tooltip: {
        callbacks: {
          label: (ctx: any) => `${ctx.dataset.label}: ${ctx.raw} searches`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: { display: true, text: "Search Count" },
        ticks: { precision: 0 },
      },
    },
  };

  return (
    <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
        🔍 Trending Locations in {city}
      </Typography>
      <Box sx={{ height: 400 }}>
        <Line data={chartData} options={options} />
      </Box>
    </Paper>
  );
}
