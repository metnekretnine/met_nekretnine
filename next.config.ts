import type { NextConfig } from "next";
import "./src/config/env"; // Import env to ensure early validation during build time

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "30mb",
    },
  },
  images: {
    loader: "custom",
    loaderFile: "./src/sanity/lib/sanity-image-loader.ts",
    remotePatterns: [{ hostname: "cdn.sanity.io" }],
  },
  async redirects() {
    return [
      {
        source: "/najam",
        destination: "/stanovi-za-najam",
        permanent: true,
      },
      {
        source: "/nekretnina/:slug",
        destination: "/stanovi-za-najam/:slug",
        permanent: true,
      },
      {
        source: "/o-nama",
        destination: "/o-agenciji",
        permanent: true,
      },
      {
        source: "/prodaja",
        destination: "/stanovi-za-najam",
        permanent: true,
      },
      {
        source: "/usluge",
        destination: "/za-najmodavce",
        permanent: true,
      },
      {
        source: "/usluge/:slug",
        destination: "/za-najmodavce",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
