import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";

const nextConfig: NextConfig = {
  output: "export",
  // Use default ".next" for dev to avoid race conditions with temp files in "build"
  // and keep "build" for production exports (e.g., Azure Static Web Apps)
  distDir: isDev ? ".next" : "build",
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
