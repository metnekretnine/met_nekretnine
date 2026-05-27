import { Metadata } from "next";
import { SanityImageSource } from "@sanity/image-url/lib/types/types";
import { urlFor } from "@/sanity/lib/image";
import { COMPANY_NAME, DEFAULT_OG_IMAGE } from "../constants";

const baseUrl =
  process.env.NODE_ENV === "production"
    ? process.env.NEXT_PUBLIC_BASE_URL_PROD!
    : process.env.NEXT_PUBLIC_BASE_URL_DEV!;

/**
 * Generates a bulletproof canonical URL.
 *
 * @param canonicalPath - Accepts all formats:
 *   "usluge"                        → https://example.hr/usluge
 *   "/usluge"                       → https://example.hr/usluge
 *   "/usluge/"                      → https://example.hr/usluge  (trailing slash stripped)
 *   "https://example.hr/blog/post"  → https://example.hr/blog/post (own domain accepted)
 *   "https://malicious.com"         → https://example.hr (foreign domain → fallback to homepage)
 */
function buildCanonicalUrl(canonicalPath: string, base: string): string {
  if (canonicalPath.startsWith("http")) {
    return canonicalPath.startsWith(base) ? canonicalPath : base;
  }

  const withLeadingSlash = canonicalPath.startsWith("/")
    ? canonicalPath
    : `/${canonicalPath}`;

  const cleanPath =
    withLeadingSlash !== "/"
      ? withLeadingSlash.replace(/\/$/, "")
      : withLeadingSlash;

  return `${base}${cleanPath === "/" ? "" : cleanPath}`;
}

/**
 * Generates a Next.js Metadata object with full SEO support.
 *
 * @param metaTitle       - Page-specific title (without brand suffix)
 * @param metaDescription - Meta description for this page
 * @param metaOgImage     - Optional Sanity OG image; falls back to default
 * @param canonicalPath   - Required relative path for canonical URL (e.g. "/usluge" or "usluge")
 *                          Also accepts absolute URL from our domain (e.g. "https://example.hr/usluge")
 * @param noIndex         - Set true for pages you don't want indexed (thank-you, preview, etc.)
 * @param ogType          - "website" for regular pages, "article" for blog posts
 * @param article         - Article-specific metadata (only used when ogType is "article")
 */
export function generatePageMetadata({
  metaTitle,
  metaDescription,
  metaOgImage,
  canonicalPath,
  noIndex = false,
  ogType = "website",
  article,
}: {
  metaTitle: string;
  metaDescription: string;
  metaOgImage?: SanityImageSource | null;
  canonicalPath: string;
  noIndex?: boolean;
  ogType?: "website" | "article";
  article?: {
    publishedTime: string;
    modifiedTime?: string;
    authors?: string | string[];
    tags?: string[];
  };
}): Metadata {
  const title = `${metaTitle} | ${COMPANY_NAME}`;
  const canonicalUrl = buildCanonicalUrl(canonicalPath, baseUrl);

  const ogImage = metaOgImage
    ? (urlFor(metaOgImage)
        ?.width(1200)
        .height(630)
        .format("webp")
        .quality(80)
        .url() ?? DEFAULT_OG_IMAGE)
    : DEFAULT_OG_IMAGE;

  const ogImages = [{ url: ogImage, width: 1200, height: 630, alt: metaTitle }];

  return {
    title,
    description: metaDescription,

    // ── Canonical ──────────────────────────────────────────────────────────
    // Tells Google which URL is the "master" version of this page.
    // Prevents duplicate content issues from UTM params, trailing slashes, etc.
    alternates: {
      canonical: canonicalUrl,
    },

    // ── Robots ─────────────────────────────────────────────────────────────
    // "index, follow" is the default but explicit is better.
    // noIndex prop lets you block pages like /hvala, /preview, /admin.
    robots: noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true, "max-image-preview": "large" },

    // ── Open Graph ─────────────────────────────────────────────────────────
    openGraph: {
      title,
      description: metaDescription,
      url: canonicalUrl,
      siteName: COMPANY_NAME,
      images: ogImages,
      type: ogType,
      locale: "hr_HR",
      // Article-specific fields — only included when ogType is "article"
      ...(ogType === "article" &&
        article && {
          publishedTime: article.publishedTime,
          ...(article.modifiedTime && { modifiedTime: article.modifiedTime }),
          ...(article.authors && {
            // Normalize string | string[] → string[] for Next.js type compatibility
            authors: Array.isArray(article.authors)
              ? article.authors
              : [article.authors],
          }),
          ...(article.tags && { tags: article.tags }),
        }),
    },

    // ── Twitter / X Card ───────────────────────────────────────────────────
    twitter: {
      card: "summary_large_image",
      title,
      description: metaDescription,
      images: ogImages,
    },
  };
}
