import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@neram/geo", "@neram/database"],
};

export default nextConfig;
