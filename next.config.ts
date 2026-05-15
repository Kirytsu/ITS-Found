import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Allow images from local uploads folder (served via public/uploads/)
    localPatterns: [
      { pathname: "/uploads/**" },
    ],
    // Also allow remote patterns if needed in future
    remotePatterns: [],
  },
};

export default nextConfig;
