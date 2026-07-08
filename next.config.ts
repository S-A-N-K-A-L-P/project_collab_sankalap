import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  // Tell Turbopack to treat MUI as a package with individual module exports
  // rather than going through the barrel file. This fixes the
  // "Module not found: Can't resolve '@mui/icons-material/XxxRounded'" errors
  // that occur when Next.js 16 uses Turbopack for production builds.
  experimental: {
    optimizePackageImports: [
      "@mui/icons-material",
      "@mui/material",
      "@mui/material/styles",
    ],
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "**.githubusercontent.com",
      },
    ],
  },
};

export default nextConfig;
