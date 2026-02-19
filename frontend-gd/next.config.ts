import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Use standalone for Docker; Vercel uses default output (standalone breaks Vercel)
  ...(process.env.VERCEL ? {} : { output: 'standalone' }),
};

export default nextConfig;
