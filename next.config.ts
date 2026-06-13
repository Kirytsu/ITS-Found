import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Locally-stored uploads (public/uploads/) gain nothing from the optimizer and the
    // optimizer pipeline was breaking every report image — serve them as-is, reliably.
    unoptimized: true,
    localPatterns: [
      { pathname: "/uploads/**" },
    ],
    remotePatterns: [],
  },
};

export default nextConfig;
