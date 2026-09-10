import { MetadataRoute } from "next";
import { getBaseUrl } from "@/config/env";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = getBaseUrl();

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/", "/api", "/ugovori"],
      },
      {
        userAgent: "GPTBot",
        allow: "/",
        disallow: ["/ugovori", "/api/ugovori"],
      },
      {
        userAgent: "ChatGPT-User",
        allow: "/",
        disallow: ["/ugovori", "/api/ugovori"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
