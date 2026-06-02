import { Metadata } from "next";
import { getLang } from "@/lib/utils";
import {
  fetchTopPicks,
  fetchAllCategories,
  fetchPostsCount,
  fetchPosts,
  fetchCategoryBySlug,
  fetchBlogPageCms,
  fetchBlogCategoryPageCms,
  fetchTopPicksSectionCms,
  fetchBlogPostsSectionCms,
  fetchCategoriesFilterSectionCms,
  fetchStaticAllCategorySlugs,
  fetchCtaSectionCms,
} from "@/sanity/queries";
import { generatePageMetadata } from "@/lib/utils/metadata";
import {
  BLOG_CATEGORY_LINK,
  DEFAULT_LANGUAGE,
  DEFAULT_POSTS_LIMIT,
} from "@/lib/constants";
import {
  BlogPosts,
  TopPicks,
  CategoriesFilter,
  SubPageHero,
  CTASection,
} from "@/components";
import { BlogCategoryBreadcrumbJsonLd } from "@/analytics";

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const slugs = await fetchStaticAllCategorySlugs(DEFAULT_LANGUAGE);

  return slugs.map((slug) => ({ slug: slug.slug }));
}

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const lang = await getLang();
  const [category, blogCategoryPageCms] = await Promise.all([
    fetchCategoryBySlug(lang, slug),
    fetchBlogCategoryPageCms(lang),
  ]);

  return generatePageMetadata({
    metaTitle: category.name,
    metaDescription: `${blogCategoryPageCms.metaDescription} ${category.name}`,
    metaOgImage: blogCategoryPageCms.metaOgImage,
    canonicalPath: `${BLOG_CATEGORY_LINK}/${category.slug}`,
  });
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const lang = await getLang();

  const [
    category,
    initialPosts,
    topPickPosts,
    totalPostsCount,
    allCategories,
    blogCms,
    topPicksCms,
    blogPostsCms,
    categoriesFilterCms,
    ctaSectionCms,
  ] = await Promise.all([
    fetchCategoryBySlug(lang, slug),
    fetchPosts(lang, DEFAULT_POSTS_LIMIT, 0, slug, undefined),
    fetchTopPicks(lang, slug),
    fetchPostsCount(slug, undefined),
    fetchAllCategories(lang),
    fetchBlogPageCms(lang),
    fetchTopPicksSectionCms(lang),
    fetchBlogPostsSectionCms(lang),
    fetchCategoriesFilterSectionCms(lang),
    fetchCtaSectionCms(lang),
  ]);

  return (
    <div>
      <BlogCategoryBreadcrumbJsonLd
        lang={lang}
        categoryName={category.name}
        categorySlug={category.slug}
      />
      <SubPageHero
        title={blogCms.heroTitle}
        description={category.heroDescriptionText}
        backgroundImage={category.heroBackgroundImage}
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
          categorySlug={slug}
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
