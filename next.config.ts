import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  basePath: "/admin", // Add the /admin basePath
  /* Add other config options here if needed */
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "as2.ftcdn.net" },
      { protocol: "https", hostname: "ajeek-dev.s3.me-central-1.amazonaws.com" },
      { protocol: "https", hostname: "www.gmtaps.com" },
      { protocol: "https", hostname: "4kwallpapers.com" },
    ],
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
  async redirects() {
    return [
      {
        source: '/login',
        destination: '/admin/login',
        permanent: false,
        basePath: false,
      },
      {
        source: '/dashboard',
        destination: '/admin/dashboard',
        permanent: false,
        basePath: false,
      },
    ];
  },
};

export default nextConfig;
