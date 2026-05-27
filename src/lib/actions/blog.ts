"use server";

import { fetchPosts } from "@/sanity/queries";
import { Language } from "@/lib/constants";

//for pagination, works for blog page, category page and author page
export async function loadMoreBlogPosts(
  lang: Language["id"],
  limit: number,
  offset: number,
  categorySlug?: string,
  authorSlug?: string
) {
  return await fetchPosts(lang, limit, offset, categorySlug, authorSlug);
}
