import type { NextConfig } from "next";
import "./src/config/env"; // Import env to ensure early validation during build time

const nextConfig: NextConfig = {
  // Used only by isolated verification servers; regular builds still use .next.
  distDir: process.env.EPOTPIS_BUILD_DIR || ".next",
  typescript: { tsconfigPath: "tsconfig.build.json" },
  serverExternalPackages: ["pdf-lib", "@pdf-lib/fontkit", "pngjs"],
  outputFileTracingIncludes: {
    "/api/ugovori/*": ["./resources/epotpis/fonts/*", "./resources/epotpis/templates/templates.json"],
  },
  async headers() {
    const headers = [
      { key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" },
      { key: "Referrer-Policy", value: "no-referrer" },
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Cache-Control", value: "private, no-store" },
    ];
    return [
      { source: "/:path*", has: [{ type: "host", value: "ugovori\\.metnekretnine\\.hr(:\\d+)?" }], headers: headers.filter(header => header.key !== "Cache-Control") },
      { source: "/ugovori/:path*", headers },
      { source: "/api/ugovori/:path*", headers },
    ];
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "5mb",
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
