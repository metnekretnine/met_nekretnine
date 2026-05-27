import { Metadata } from "next";
import { getLang } from "@/lib/utils";
import {
  fetchPosts,
  fetchPostsCount,
  fetchTopPicks,
  fetchAuthorBySlug,
  fetchBlogAuthorPageCms,
  fetchTopPicksSectionCms,
  fetchBlogPostsSectionCms,
  fetchStaticAllAuthorSlugs,
  fetchCtaSectionCms,
} from "@/sanity/queries";
import { generatePageMetadata } from "@/lib/utils/metadata";
import {
  BLOG_AUTHOR_LINK,
  DEFAULT_LANGUAGE,
  DEFAULT_POSTS_LIMIT,
} from "@/lib/constants";
import {
  BlogPosts,
  TopPicks,
  AuthorHeaderBlog,
  CTASection,
} from "@/components";
import { BlogBreadcrumbJsonLd } from "@/analytics";

interface AuthorPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: AuthorPageProps): Promise<Metadata> {
  const { slug } = await params;
  const lang = await getLang();
  const [author, blogAuthorPageCms] = await Promise.all([
    fetchAuthorBySlug(lang, slug),
    fetchBlogAuthorPageCms(lang),
  ]);

  return generatePageMetadata({
    metaTitle: `${blogAuthorPageCms.metaTitle} ${author.name}`,
    metaDescription: `${blogAuthorPageCms.metaDescription} ${author.name}`,
    metaOgImage: author.image,
    canonicalPath: `${BLOG_AUTHOR_LINK}/${author.slug}`,
  });
}

export async function generateStaticParams() {
  const slugs = await fetchStaticAllAuthorSlugs(DEFAULT_LANGUAGE);

  return slugs.map((slug) => ({ slug: slug.slug }));
}

export default async function AuthorPage({ params }: AuthorPageProps) {
  const { slug } = await params;
  const lang = await getLang();

  const [
    author,
    initialPosts,
    topPickPosts,
    totalPostsCount,
    topPicksCms,
    blogPostsCms,
    ctaSectionCms,
  ] = await Promise.all([
    fetchAuthorBySlug(lang, slug),
    fetchPosts(lang, DEFAULT_POSTS_LIMIT, 0, undefined, slug),
    fetchTopPicks(lang),
    fetchPostsCount(undefined, slug),
    fetchTopPicksSectionCms(lang),
    fetchBlogPostsSectionCms(lang),
    fetchCtaSectionCms(lang),
  ]);

  return (
    <div>
      <BlogBreadcrumbJsonLd
        lang={lang}
        currentName={author.name}
        currentPath={`${BLOG_AUTHOR_LINK}/${author.slug}`}
      />
      <AuthorHeaderBlog author={author} />
      <div className="container mx-auto px-global py-12 md:py-16">
        <BlogPosts
          key={lang}
          initialPosts={initialPosts}
          totalPostsCount={totalPostsCount}
          authorSlug={slug}
          lang={lang}
          cmsData={blogPostsCms}
          className="pb-12 pt-0 md:pb-16"
        />
      </div>
      <TopPicks cmsData={topPicksCms} topPickPosts={topPickPosts} lang={lang} />
      <CTASection cmsData={ctaSectionCms} />
    </div>
  );
}
