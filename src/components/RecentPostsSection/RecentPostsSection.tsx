import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Post } from "@/sanity/queries/blog";
import { urlFor } from "@/sanity/lib/image";
import { Language, BLOG_LINK } from "@/lib/constants";
import { formatDate } from "@/lib/utils/date";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { RecentPostsSectionCMS } from "@/sanity/queries/recentPostsSection";

interface RecentPostsSectionProps {
  posts: Post[];
  lang: Language["id"];
  cmsData: RecentPostsSectionCMS;
  className?: string;
}

export const RecentPostsSection: React.FC<RecentPostsSectionProps> = ({
  posts,
  lang,
  cmsData,
  className,
}) => {
  if (!posts || posts.length === 0) return null;

  const { title, viewAllLabel } = cmsData;
  const [featured, ...rest] = posts.slice(0, 4);

  return (
    <section className={`w-full py-32 ${className}`}>
      <div className="container mx-auto px-global">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-16">
          <div className="space-y-6 max-w-3xl">
            <h2 className="text-5xl lg:text-7xl font-black tracking-tighter text-foreground leading-none uppercase">
              {title}
            </h2>
          </div>

          <Link
            href={BLOG_LINK}
            className="inline-flex items-center gap-3 text-sm font-black uppercase tracking-widest text-foreground/40 hover:text-primary transition-all duration-300 group pb-2 border-b-2 border-transparent hover:border-primary shrink-0"
          >
            {viewAllLabel}
            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-2" />
          </Link>
        </div>

        {/* Content: Featured + List */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Featured post — large card */}
          <Link
            href={`${BLOG_LINK}/${featured.slug}`}
            className="group relative flex flex-col lg:w-1/2 h-[600px] lg:h-[700px] rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-700 hover:-translate-y-1 bg-white"
          >
            <div className="relative h-[65%] w-full overflow-hidden">
              {featured.coverImage && (
                <Image
                  src={urlFor(featured.coverImage).url()}
                  alt={featured.coverImageAlt || featured.title}
                  fill
                  className="object-cover transition-transform duration-1000 group-hover:scale-105"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              )}
              <div className="absolute bottom-6 right-6 bg-white/95 backdrop-blur-md p-3 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-2 group-hover:translate-y-0">
                <ArrowUpRight className="h-5 w-5 text-primary" />
              </div>
            </div>

            <div className="p-10 flex flex-col flex-grow bg-white">
              <h3 className="text-3xl lg:text-4xl font-black text-foreground group-hover:text-primary transition-colors leading-tight uppercase mb-auto">
                {featured.title}
              </h3>

              <div className="flex items-center justify-between pt-6 border-t border-foreground/5 mt-6">
                <span className="text-foreground/40 text-[10px] font-black uppercase tracking-widest">
                  {formatDate(featured.publishedAt, lang)}
                </span>
              </div>
            </div>
          </Link>

          {/* Remaining posts — stacked horizontal cards */}
          <div className="lg:w-1/2 flex flex-col gap-6">
            {rest.map((post) => (
              <Link
                key={post._id}
                href={`${BLOG_LINK}/${post.slug}`}
                className="group relative flex flex-row h-[220px] rounded-[2rem] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-700 hover:-translate-y-1 bg-white"
              >
                {/* Thumbnail */}
                <div className="relative w-[40%] shrink-0 overflow-hidden">
                  {post.coverImage && (
                    <Image
                      src={urlFor(post.coverImage).url()}
                      alt={post.coverImageAlt || post.title}
                      fill
                      className="object-cover transition-transform duration-1000 group-hover:scale-110"
                      sizes="(max-width: 1024px) 40vw, 20vw"
                    />
                  )}
                </div>

                {/* Content */}
                <div className="flex flex-col flex-grow p-7 bg-white">
                  <h3 className="text-xl font-black text-foreground group-hover:text-primary transition-colors leading-tight uppercase mb-auto line-clamp-4">
                    {post.title}
                  </h3>

                  <div className="flex items-center justify-between pt-4 border-t border-foreground/5 mt-4">
                    <span className="text-foreground/40 text-[10px] font-black uppercase tracking-widest">
                      {formatDate(post.publishedAt, lang)}
                    </span>
                    <div className="bg-white/95 backdrop-blur-md p-2 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-all duration-500">
                      <ArrowUpRight className="h-4 w-4 text-primary" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
