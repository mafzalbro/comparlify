import type { NextConfig } from "next";

// cp -r .next/static .next/standalone/.next/
// cp -r public .next/standalone/

const nextConfig: NextConfig = {
  /* config options here */
  outputFileTracingRoot: process.cwd(),
  output: "standalone",
  serverExternalPackages: ["@prisma/client", "prisma"],
  typescript: {
    ignoreBuildErrors: true,
  },
  // eslint: {
  //   ignoreDuringBuilds: true,
  // },
  images: {
    dangerouslyAllowSVG: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "placehold.co",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "upload.wikimedia.org",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "assets.findstack.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "encrypted-tbn0.gstatic.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "picsum.photos",
        port: "",
        pathname: "/**",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=0, s-maxage=0, must-revalidate",
          },
        ],
      },
      {
        // This will apply to all routes in the app
        source: "/:all*(svg|jpg|jpeg|png|gif|ico|woff2)",
        headers: [
          {
            key: "Cache-Control",
            // One year caching for static assets
            value: "public, max-age=31536000, must-revalidate",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
