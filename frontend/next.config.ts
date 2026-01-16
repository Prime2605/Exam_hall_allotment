import type { NextConfig } from "next";

<<<<<<< HEAD
const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5000";
=======
const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
>>>>>>> 2d8beaa9fd737bb6d330f13204e5079f2524bfcb

const nextConfig: NextConfig = {
  // Increase timeout for large file uploads
  experimental: {
    proxyTimeout: 120000, // 2 minutes
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${backendUrl}/api/:path*`, // Proxy to Backend
      },
      {
        source: "/docs", // Swagger UI
        destination: `${backendUrl}/docs`,
      },
      {
        source: "/openapi.json", // OpenAPI Spec
        destination: `${backendUrl}/openapi.json`,
      }
    ];
  },
};

export default nextConfig;
