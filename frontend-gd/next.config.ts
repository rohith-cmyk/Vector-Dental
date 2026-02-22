import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Use standalone for Docker; Vercel uses default output (standalone breaks Vercel)
  ...(process.env.VERCEL ? {} : { output: 'standalone' }),
  // Fix: Next.js infers project root as dental-referral; force frontend-gd so node_modules resolve correctly
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
