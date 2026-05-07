import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  transpilePackages: ['react-map-gl', 'mapbox-gl'],
};

export default nextConfig;
