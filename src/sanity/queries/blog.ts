import { groq } from "next-sanity";
import { notFound } from "next/navigation";
import { sanityFetch } from "../lib/live";
import { client } from "../lib/client";
import { Language, MIN_TOP_PICKS_REQUIRED } from "@/lib/constants";
import { PortableTextBlock } from "@portabletext/types";
import { SanityImageSource } from "@sanity/image-url/lib/types/types";

//blog.ts is unique because it contains all queries and fetch functions for the blog,
//they aren't separated as in other functions, so other functions only fetch texts

export interface BlogPageCMS {
  heroTitle: string;
  heroDescriptionText?: string;
  heroBackgroundImage: SanityImageSource;
  metaTitle: string;
  metaDescription: string;
  metaOgImage?: SanityImageSource;
}

export interface Author {
  name: string;
  slug: string;
  image: SanityImageSource;
  heroBackgroundImage?: SanityImageSource;
  title: string;
  bio: string;
}

export interface Category {
  name: string;
  slug: string;
  heroBackgroundImage: SanityImageSource;
  heroDescriptionText?: string;
}

export interface Post {
  _id: string;
  title: string;
  metaTitle?: string;
  metaDescription: string;
  slug: string;
  author: Author;
  categories: Category[];
  coverImage: SanityImageSource;
  coverImageAlt?: string;
  publishedAt: string;
  content: PortableTextBlock[];
  isPublished: boolean;
  isTopPick: boolean;
}

/////////////////////////////////////////

const postFields = groq`
  _id,
  "title": title[$lang],
  "metaTitle": coalesce(metaTitle[$lang], title[$lang]),
  "metaDescription": metaDescription[$lang],
  "slug": slug.current,
  "author": author->{
    name,
    "slug": slug.current,
    image,
    heroBackgroundImage,
    "title": title[$lang],
    "bio": bio[$lang]
  },
  "categories": categories[]->{
    "name": name[$lang],
    "slug": slug.current
  },
  coverImage,
  "coverImageAlt": coalesce(coverImageAlt[$lang], coverImage.asset->altText[$lang]),
  publishedAt,
  "content": content[$lang],
  isPublished,
  isTopPick
`;

//----------------------------------------

const blogPageQuery = groq`
  *[_type == "blogPage"][0] {
    "heroTitle": heroTitle[$lang],
    "heroDescriptionText": heroDescriptionText[$lang],
    heroBackgroundImage,
    "metaTitle": metaTitle[$lang],
    "metaDescription": metaDescription[$lang],
    metaOgImage,
  }
`;

//----------------------------------------

//Crucial for displaying limited number of most recent posts for certain category, because they don't have validation limit
export const topPicksPostsByCategoryQuery = groq`
  *[_type == "post" && isPublished == true && $slug in categories[]->slug.current] | order(publishedAt desc) [0...${MIN_TOP_PICKS_REQUIRED}] {
    ${postFields}
  }
`;

export const topPickPostsQuery = groq`
  *[_type == "post" && isPublished == true && isTopPick == true] | order(publishedAt desc) [0...${MIN_TOP_PICKS_REQUIRED}] {
    ${postFields}
  }
`;

//----------------------------------------

export const postsByCategoryQuery = groq`
  *[_type == "post" && isPublished == true && $slug in categories[]->slug.current] | order(publishedAt desc) {
    ${postFields}
  }
`;

export const postsByAuthorQuery = groq`
  *[_type == "post" && isPublished == true && author->slug.current == $slug] | order(publishedAt desc) {
    ${postFields}
  }
`;

export const postsQuery = groq`
  *[_type == "post" && isPublished == true] | order(publishedAt desc) {
    ${postFields}
  }
`;

//----------------------------------------

export const totalPostsCountByCategoryQuery = groq`
  count(*[_type == "post" && isPublished == true && $slug in categories[]->slug.current])
`;

export const totalPostsCountByAuthorQuery = groq`
  count(*[_type == "post" && isPublished == true && author->slug.current == $slug])
`;
export const totalPostsCountQuery = groq`
  count(*[_type == "post" && isPublished == true])
`;

//----------------------------------------

export const allCategoriesQuery = groq`
  *[_type == "category" && count(*[_type == "post" && isPublished == true && references(^._id)]) > 0] {
    "name": name[$lang],
    "slug": slug.current
  }
`;

//----------------------------------------

export const authorBySlugQuery = groq`
  *[_type == "author" && slug.current == $slug && count(*[_type == "post" && isPublished == true && references(^._id)]) > 0][0] {
    name,
    "slug": slug.current,
    image,
    heroBackgroundImage,
    "title": title[$lang],
    "bio": bio[$lang]
  }
`;

export const categoryBySlugQuery = groq`
  *[_type == "category" && slug.current == $slug && count(*[_type == "post" && isPublished == true && references(^._id)]) > 0][0] {
    "name": name[$lang],
    "slug": slug.current,
    heroBackgroundImage,
    "heroDescriptionText": heroDescriptionText[$lang]
  }
`;

export const postBySlugQuery = groq`
  *[_type == "post" && isPublished == true && slug.current == $slug][0] {
    ${postFields}
  }
`;

/////////////////////////////////////////

export async function fetchBlogPageCms(
  lang: Language["id"]
): Promise<BlogPageCMS> {
  const { data } = await sanityFetch({
    query: blogPageQuery,
    params: { lang },
    tags: ["blogPage"],
  });
  if (!data) {
    notFound();
  }
  return data as BlogPageCMS;
}

/////////////////////////////////////////

export async function fetchTopPicks(
  lang: Language["id"],
  slug?: string
): Promise<Post[]> {
  const query = slug ? topPicksPostsByCategoryQuery : topPickPostsQuery;
  const { data } = await sanityFetch({
    query,
    params: { lang, slug },
    tags: ["post"],
  });
  return data as Post[];
}

/////////////////////////////////////////

export async function fetchPosts(
  lang: Language["id"],
  limit: number,
  offset: number,
  categorySlug?: string,
  authorSlug?: string
): Promise<Post[]> {
  let baseQuery = postsQuery;
  if (categorySlug) {
    baseQuery = postsByCategoryQuery;
  } else if (authorSlug) {
    baseQuery = postsByAuthorQuery;
  }

  const query = `${baseQuery}[${offset}...${offset + limit}]`;
  const { data } = await sanityFetch({
    query,
    params: {
      lang,
      slug: categorySlug || authorSlug,
    },
    tags: ["post"],
  });
  return data as Post[];
}

/////////////////////////////////////////

export async function fetchPostsCount(
  categorySlug?: string,
  authorSlug?: string
): Promise<number> {
  let query = totalPostsCountQuery;
  if (categorySlug) {
    query = totalPostsCountByCategoryQuery;
  } else if (authorSlug) {
    query = totalPostsCountByAuthorQuery;
  }

  const { data } = await sanityFetch({
    query,
    params: {
      slug: categorySlug || authorSlug,
    },
    tags: ["post"],
  });
  return data as number;
}

/////////////////////////////////////////

export async function fetchAllPostsByAuthor(
  lang: Language["id"],
  slug: string
): Promise<Post[]> {
  const { data } = await sanityFetch({
    query: postsByAuthorQuery,
    params: { lang, slug },
    tags: ["post"],
  });
  return data as Post[];
}

/////////////////////////////////////////

export async function fetchAllCategories(
  lang: Language["id"]
): Promise<Category[]> {
  const { data } = await sanityFetch({
    query: allCategoriesQuery,
    params: { lang },
    tags: ["category"],
  });
  return data as Category[];
}

/////////////////////////////////////////

export async function fetchAuthorBySlug(
  lang: Language["id"],
  slug: string
): Promise<Author> {
  const { data } = await sanityFetch({
    query: authorBySlugQuery,
    params: { lang, slug },
    tags: ["author"],
  });
  if (!data) {
    notFound();
  }
  return data as Author;
}

export async function fetchCategoryBySlug(
  lang: Language["id"],
  slug: string
): Promise<Category> {
  const { data } = await sanityFetch({
    query: categoryBySlugQuery,
    params: {
      lang,
      slug,
    },
    tags: ["category"],
  });
  if (!data) {
    notFound();
  }
  return data as Category;
}

export async function fetchPostBySlug(
  lang: Language["id"],
  slug: string
): Promise<Post> {
  const { data } = await sanityFetch({
    query: postBySlugQuery,
    params: { lang, slug },
    tags: ["post", `post-${slug}`], // Added dynamic tag for specific post revalidation
  });
  if (!data) {
    notFound();
  }
  return data as Post;
}

/////////////////////////////////////////////////////
// Queries and fetch functions for sitemap generation
export const allPostsSlugsQuery = groq`
  *[_type == "post" && isPublished == true] {
    "slug": slug.current,
    publishedAt
  }
`;

export const allAuthorsSlugsQuery = groq`
  *[_type == "author" && count(*[_type == "post" && isPublished == true && references(^._id)]) > 0] {
    "slug": slug.current,
  }
`;

export const allCategoriesSlugsQuery = groq`
  *[_type == "category" && count(*[_type == "post" && isPublished == true && references(^._id)]) > 0] {
    "slug": slug.current,
  }
`;

export async function fetchAllPostSlugs(): Promise<
  Pick<Post, "slug" | "publishedAt">[]
> {
  const { data } = await sanityFetch({
    query: allPostsSlugsQuery,
    tags: ["post"],
  });
  return data as Pick<Post, "slug" | "publishedAt">[];
}

// Static fetch function for build time (generateStaticParams)
export async function fetchStaticAllPostSlugs(
  lang: Language
): Promise<Pick<Post, "slug" | "publishedAt">[]> {
  const data = await client.fetch(allPostsSlugsQuery, { lang });

  if (!data) {
    return [];
  }

  return data as Pick<Post, "slug" | "publishedAt">[];
}

export async function fetchAllAuthorSlugs(): Promise<Pick<Author, "slug">[]> {
  const { data } = await sanityFetch({
    query: allAuthorsSlugsQuery,
    tags: ["author"],
  });
  return data as Pick<Author, "slug">[];
}

// Static fetch function for build time (generateStaticParams)
export async function fetchStaticAllAuthorSlugs(
  lang: Language
): Promise<Pick<Author, "slug">[]> {
  const data = await client.fetch(allAuthorsSlugsQuery, { lang });

  if (!data) {
    return [];
  }

  return data as Pick<Author, "slug">[];
}

export async function fetchAllCategorySlugs(): Promise<
  Pick<Category, "slug">[]
> {
  const { data } = await sanityFetch({
    query: allCategoriesSlugsQuery,
    tags: ["category"],
  });
  return data as Pick<Category, "slug">[];
}

// Static fetch function for build time (generateStaticParams)
export async function fetchStaticAllCategorySlugs(
  lang: Language
): Promise<Pick<Category, "slug">[]> {
  const data = await client.fetch(allCategoriesSlugsQuery, { lang });

  if (!data) {
    return [];
  }

  return data as Pick<Category, "slug">[];
}
