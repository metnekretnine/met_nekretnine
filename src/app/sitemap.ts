import { MetadataRoute } from "next";
import { getBaseUrl } from "@/config/env";
import {
  fetchAllAuthorSlugs,
  fetchAllCategorySlugs,
  fetchAllPostSlugs,
} from "@/sanity/queries/blog";
import { fetchAllListingSlugs } from "@/sanity/queries/listings";
import {
  ABOUT_LINK,
  BLOG_AUTHOR_LINK,
  BLOG_CATEGORY_LINK,
  BLOG_LINK,
  CONTACT_LINK,
  COOKIE_POLICY_LINK,
  LANDLORD_LINK,
  LISTING_LINK,
  PRIVACY_POLICY_LINK,
  RENT_LINK,
  SUBMIT_APARTMENT_LINK,
  TENANT_LINK,
  TERMS_LINK,
} from "@/lib/constants";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getBaseUrl();
  const lastModified = new Date();

  const [posts, authors, categories, listings] = await Promise.all([
    fetchAllPostSlugs(),
    fetchAllAuthorSlugs(),
    fetchAllCategorySlugs(),
    fetchAllListingSlugs(),
  ]);

  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified, changeFrequency: "daily", priority: 1 },
    {
      url: `${baseUrl}${RENT_LINK}`,
      lastModified,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}${LANDLORD_LINK}`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}${TENANT_LINK}`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}${SUBMIT_APARTMENT_LINK}`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}${ABOUT_LINK}`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}${CONTACT_LINK}`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}${BLOG_LINK}`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}${TERMS_LINK}`,
      lastModified,
      changeFrequency: "yearly",
      priority: 0.4,
    },
    {
      url: `${baseUrl}${PRIVACY_POLICY_LINK}`,
      lastModified,
      changeFrequency: "yearly",
      priority: 0.4,
    },
    {
      url: `${baseUrl}${COOKIE_POLICY_LINK}`,
      lastModified,
      changeFrequency: "yearly",
      priority: 0.4,
    },
  ];

  const listingRoutes: MetadataRoute.Sitemap = listings.map((listing) => ({
    url: `${baseUrl}${LISTING_LINK}/${listing.slug}`,
    lastModified: listing.publishedAt
      ? new Date(listing.publishedAt)
      : lastModified,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const postRoutes: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${baseUrl}${BLOG_LINK}/${post.slug}`,
    lastModified: post.publishedAt ? new Date(post.publishedAt) : lastModified,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  const authorRoutes: MetadataRoute.Sitemap = authors.map((author) => ({
    url: `${baseUrl}${BLOG_AUTHOR_LINK}/${author.slug}`,
    lastModified,
    changeFrequency: "monthly",
    priority: 0.4,
  }));

  const categoryRoutes: MetadataRoute.Sitemap = categories.map((category) => ({
    url: `${baseUrl}${BLOG_CATEGORY_LINK}/${category.slug}`,
    lastModified,
    changeFrequency: "monthly",
    priority: 0.4,
  }));

  return [
    ...staticPages,
    ...listingRoutes,
    ...postRoutes,
    ...authorRoutes,
    ...categoryRoutes,
  ];
}
