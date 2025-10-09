// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  compiler: {
    styledComponents: true,
  },
  images: {
    // Marvel CDN
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'i.annihil.us',
        pathname: '/u/prod/marvel/**',
      },
    ],
    // ajusta a tu layout: cards ~180px, detail ~320px
    deviceSizes: [320, 420, 768, 1024, 1200],
    imageSizes: [164, 180, 200, 250, 300],
    formats: ['image/avif', 'image/webp'],
  },
  outputFileTracingRoot: process.cwd(),
};

export default nextConfig;
