import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ['archives.mfu.ac.th'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'archives.mfu.ac.th',
        pathname: '/wp-content/uploads/**',
      },
    ],
  },
};

export default nextConfig;
