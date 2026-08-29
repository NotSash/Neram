import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@neram/geo", "@neram/database"],
  experimental: {
    externalDir: true,
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "@neram/geo": path.resolve(__dirname, "../../packages/geo/src/index.ts"),
      "@neram/database": path.resolve(__dirname, "../../packages/database/src/types.ts"),
    };
    return config;
  },
};

export default nextConfig;
