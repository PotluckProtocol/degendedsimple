import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Don't fail build on lint errors (warnings are ok)
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Don't fail build on type errors (warnings are ok)
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
