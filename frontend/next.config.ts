import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Increase timeout for large file uploads
  experimental: {
    proxyTimeout: 120000, // 2 minutes
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://127.0.0.1:8000/api/:path*", // Proxy to Backend
      },
      {
        source: "/docs", // Swagger UI
        destination: "http://127.0.0.1:8000/docs",
      },
      {
        source: "/openapi.json", // OpenAPI Spec
        destination: "http://127.0.0.1:8000/openapi.json",
      }
    ];
  },
};

export default nextConfig;
