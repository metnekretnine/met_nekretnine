import { Metadata } from "next";
import Image from "next/image";
import { getLang } from "@/lib/utils";
import {
  fetchPostBySlug,
  fetchTopPicks,
  fetchTopPicksSectionCms,
  fetchStaticAllPostSlugs,
  fetchCtaSectionCms,
} from "@/sanity/queries";
import { generatePageMetadata } from "@/lib/utils/metadata";
import Link from "next/link";
import { PortableText } from "@/components/PortableText/PortableText";
import { formatDate } from "@/lib/utils";
import { TopPicks, CTASection, PhotoCredit } from "@/components";
import {
  BLOG_CATEGORY_LINK,
  BLOG_AUTHOR_LINK,
  BLOG_LINK,
  DEFAULT_LANGUAGE,
  DEFAULT_OG_IMAGE,
} from "@/lib/constants";
import { BlogBreadcrumbJsonLd, BlogPostingJsonLd } from "@/analytics";
import { urlFor } from "@/sanity/lib/image";

interface PostPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: PostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const lang = await getLang();
  const post = await fetchPostBySlug(lang, slug);

  return generatePageMetadata({
    metaTitle: post.metaTitle || post.title,
    metaDescription: post.metaDescription,
    metaOgImage: post.coverImage,
    canonicalPath: `${BLOG_LINK}/${post.slug}`,
    ogType: "article",
    article: {
      publishedTime: post.publishedAt,
      modifiedTime: post.publishedAt,
      authors: post.author.name,
      tags: post.categories.map((category) => category.name),
    },
  });
}

export async function generateStaticParams() {
  const slugs = await fetchStaticAllPostSlugs(DEFAULT_LANGUAGE);
  return slugs.map((slug) => ({ slug: slug.slug }));
}

export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params;
  const lang = await getLang();

  const [post, topPickPosts, topPicksCms, ctaCms] =
    await Promise.all([
      fetchPostBySlug(lang, slug),
      fetchTopPicks(lang),
      fetchTopPicksSectionCms(lang),
      fetchCtaSectionCms(lang),
    ]);

  const publishedDate = formatDate(post.publishedAt, lang);
  const coverImageUrl = post.coverImage
    ? urlFor(post.coverImage).width(2000).height(1100).url()
    : DEFAULT_OG_IMAGE;

  return (
    <div>
      <BlogPostingJsonLd post={post} lang={lang} />
      <BlogBreadcrumbJsonLd
        lang={lang}
        currentName={post.title}
        currentPath={`${BLOG_LINK}/${post.slug}`}
      />

      <section className="relative mt-14 h-[48dvh] min-h-[360px] overflow-hidden md:mt-20 md:h-[56dvh]">
        <Image
          src={coverImageUrl}
          alt={post.coverImageAlt || post.title}
          fill
          className="object-cover object-center md:object-[center_65%]"
          sizes="100vw"
          priority
        />
      </section>
      {post.coverImage && <PhotoCredit />}

      <article className="container mx-auto px-global py-20 md:py-28">
        <header className="mx-auto mb-14 max-w-4xl">
          <div className="mb-6 flex flex-wrap gap-2">
            {post.categories.map((category) => (
              <Link
                key={category.slug}
                href={`${BLOG_CATEGORY_LINK}/${category.slug}`}
                className="rounded-md border border-foreground/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground"
              >
                {category.name}
              </Link>
            ))}
          </div>

          <h1 className="mb-8 max-w-5xl text-5xl font-semibold leading-none tracking-tight md:text-7xl">
            {post.title}
          </h1>

          <span className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            {publishedDate} ·{" "}
            <Link
              href={`${BLOG_AUTHOR_LINK}/${post.author.slug}`}
              className="transition-colors hover:text-foreground"
            >
              {post.author.name}
            </Link>
          </span>
        </header>

        <div className="mx-auto max-w-3xl">
          <PortableText value={post.content} textSize="text-lg md:text-xl" />
        </div>
      </article>

      <CTASection cmsData={ctaCms} />
      <TopPicks cmsData={topPicksCms} topPickPosts={topPickPosts} lang={lang} />
    </div>
  );
}
