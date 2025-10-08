// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  compiler: {
    styledComponents: true,
  },
  // Evita el warning de “workspace root” sin usar require()
  outputFileTracingRoot: process.cwd(),
};

export default nextConfig;
