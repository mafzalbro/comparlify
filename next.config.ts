import type { NextConfig } from "next";

// cp -r .next/static .next/standalone/.next/
// cp -r public .next/standalone/
// rm -r ..\standalone\
// cp -r .\.next\standalone\ ..\..\Desktop\

const nextConfig: NextConfig = {
  /* config options here */
  outputFileTracingRoot: process.cwd(),
  output: "standalone",
  transpilePackages: ["@prisma/client"],
  logging: { serverFunctions: true, browserToTerminal: "warn" },
  //   serverExternalPackages: [
  //   "@prisma/client",
  //   "prisma",
  //   "genkit",
  //   "@genkit-ai/core",
  //   "@genkit-ai/google-genai",
  //   "express",
  // ],
  // typescript: {
  //   ignoreBuildErrors: true,
  // },
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
      {
        protocol: "https",
        hostname: "linear.app",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "upload.wikimedia.org",
        port: "",
        pathname: "/**",
      },
    ],
  },
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "date-fns",
      "recharts",
      "framer-motion",
      "@radix-ui/react-icons",
      "@radix-ui/react-accordion",
      "@radix-ui/react-dialog",
      "@radix-ui/react-select",
      "@radix-ui/react-slider",
      "@radix-ui/react-progress",
      "react-icons",
    ],
  },
  async headers() {
    return [
      {
        // One year caching for static assets (fonts, images, media)
        source: "/:all*(svg|jpg|jpeg|png|gif|ico|woff2|webp)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
