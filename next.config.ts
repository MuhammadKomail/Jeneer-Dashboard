import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  basePath: "/admin", // Add the /admin basePath
  /* Add other config options here if needed */
  images: {
    domains: ["as2.ftcdn.net", "ajeek-dev.s3.me-central-1.amazonaws.com", "www.gmtaps.com", "4kwallpapers.com"],
  },
  webpack: (config, { dev, isServer }) => {
    // Optimize webpack cache to reduce serialization warnings
    if (!dev && !isServer) {
      config.cache = {
        type: 'filesystem',
        maxMemoryGenerations: 1,
      };
    }
    return config;
  },
};

export default nextConfig;
