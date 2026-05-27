import { Metadata } from "next";
import { getLang } from "@/lib/utils";
import {
  fetchBlogPageCms,
  fetchPosts,
  fetchTopPicks,
  fetchAllCategories,
  fetchPostsCount,
  fetchTopPicksSectionCms,
  fetchBlogPostsSectionCms,
  fetchCategoriesFilterSectionCms,
  fetchCtaSectionCms,
} from "@/sanity/queries";
import { generatePageMetadata } from "@/lib/utils/metadata";
import {
  BlogPosts,
  TopPicks,
  CategoriesFilter,
  SubPageHero,
  CTASection,
} from "@/components";
import { BLOG_LINK, DEFAULT_POSTS_LIMIT } from "@/lib/constants";
import { BlogBreadcrumbJsonLd, BlogJsonLd } from "@/analytics";

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLang();
  const blogCms = await fetchBlogPageCms(lang);

  return generatePageMetadata({
    metaTitle: blogCms.metaTitle,
    metaDescription: blogCms.metaDescription,
    metaOgImage: blogCms.metaOgImage,
    canonicalPath: BLOG_LINK,
  });
}

export default async function BlogPage() {
  const lang = await getLang();

  const [
    blogCms,
    initialPosts,
    topPickPosts,
    totalPostsCount,
    allCategories,
    topPicksCms,
    blogPostsCms,
    categoriesFilterCms,
    ctaSectionCms,
  ] = await Promise.all([
    fetchBlogPageCms(lang),
    fetchPosts(lang, DEFAULT_POSTS_LIMIT, 0),
    fetchTopPicks(lang),
    fetchPostsCount(),
    fetchAllCategories(lang),
    fetchTopPicksSectionCms(lang),
    fetchBlogPostsSectionCms(lang),
    fetchCategoriesFilterSectionCms(lang),
    fetchCtaSectionCms(lang),
  ]);

  return (
    <div>
      <BlogJsonLd
        lang={lang}
        title={blogCms.heroTitle}
        description={blogCms.metaDescription}
      />
      <BlogBreadcrumbJsonLd lang={lang} />
      <SubPageHero
        title={blogCms.heroTitle}
        description={blogCms.heroDescriptionText}
        backgroundImage={blogCms.heroBackgroundImage}
      />
      <div className="container mx-auto px-global py-12 md:py-16">
        <CategoriesFilter
          cmsData={categoriesFilterCms}
          categories={allCategories}
        />

        <BlogPosts
          key={lang}
          initialPosts={initialPosts}
          totalPostsCount={totalPostsCount}
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
