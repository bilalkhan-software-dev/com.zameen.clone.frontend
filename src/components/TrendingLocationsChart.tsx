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
import { Box, CircularProgress, Typography, Paper } from "@mui/material";
import api from "@/lib/axios";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface TrendingData {
  location: string;
  date: string;
  searchCount: number;
}

export default function TrendingLocationsChart({ city = "Lahore", days = 30 }) {
  const [data, setData] = useState<TrendingData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get("/api/searchlog/trending/locations/by-city", {
          params: { city, days },
        });
        console.log("Trend Searching Locat",res);
        setData(res.data?.data || []);
      } catch (err) {
        setError("Failed to load trending data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [city, days]);

  if (loading) return <CircularProgress />;
  if (error) return <Typography color="error">{error}</Typography>;
  if (!data.length) return <Typography>No data for this city.</Typography>;

  // Group data by location
  const locations = [...new Set(data.map(d => d.location))];
  const dates = [...new Set(data.map(d => d.date))].sort();

  const datasets = locations.map((location, idx) => {
    const locationData = data.filter(d => d.location === location);
    const counts = dates.map(date => {
      const point = locationData.find(d => d.date === date);
      return point ? point.searchCount : 0;
    });
    return {
      label: location,
      data: counts,
      borderColor: `hsl(${idx * 360 / locations.length}, 70%, 50%)`,
      backgroundColor: "transparent",
      tension: 0.3,
      fill: false,
    };
  });

  const chartData = {
    labels: dates.map(d => new Date(d).toLocaleDateString()),
    datasets,
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: "top" as const },
      title: { display: true, text: `Trending Locations in ${city} (last ${days} days)` },
      tooltip: { callbacks: { label: (ctx: any) => `${ctx.dataset.label}: ${ctx.raw} searches` } },
    },
    scales: { y: { beginAtZero: true, title: { display: true, text: "Search Count" } } },
  };

  return (
    <Paper elevation={2} sx={{ p: 3, borderRadius: 3 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>🔍 Trending Locations in {city}</Typography>
      <Box sx={{ height: 400 }}>
        <Line data={chartData} options={options} />
      </Box>
    </Paper>
  );
}