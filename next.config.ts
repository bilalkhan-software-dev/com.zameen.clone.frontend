import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/dkkgqafqw/image/upload/**",
      },
    ],
  },
  reactCompiler: true,
};

export default nextConfig;
