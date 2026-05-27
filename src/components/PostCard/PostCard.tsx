import Link from "next/link";
import Image from "next/image";
import { Post } from "@/sanity/queries";
import { urlFor } from "@/sanity/lib/image";
import {
  DEFAULT_OG_IMAGE,
  Language,
  BLOG_LINK,
  BLOG_CATEGORY_LINK,
  BLOG_AUTHOR_LINK,
} from "@/lib/constants";
import { formatDate } from "@/lib/utils/date";

interface PostCardProps {
  post: Post;
  lang: Language["id"];
}

export const PostCard: React.FC<PostCardProps> = ({ post, lang }) => {
  const imageUrl = post.coverImage
    ? urlFor(post.coverImage).url()
    : DEFAULT_OG_IMAGE;
  const imageAlt = post.coverImageAlt || post.title;
  const publishedDate = formatDate(post.publishedAt, lang);

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-lg border border-foreground/10 bg-white transition-colors hover:border-foreground/25">
      <Link
        href={`${BLOG_LINK}/${post.slug}`}
        className="absolute inset-0 z-10"
        aria-label={post.title}
      />

      <div className="relative aspect-[4/3] w-full shrink-0 overflow-hidden">
        <Image
          src={imageUrl}
          alt={imageAlt}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          sizes="(max-width: 768px) 100vw, 33vw"
        />
      </div>

      <div className="flex flex-grow flex-col bg-white p-6">
        <div className="relative z-20 mb-5 flex flex-wrap gap-2">
          {post.categories.slice(0, 2).map((category) => (
            <Link
              key={category.slug}
              href={`${BLOG_CATEGORY_LINK}/${category.slug}`}
              className="rounded-md border border-foreground/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground"
            >
              {category.name}
            </Link>
          ))}
        </div>

        <h3 className="mb-6 line-clamp-3 text-2xl font-semibold leading-tight tracking-tight text-foreground transition-colors group-hover:text-foreground/70">
          {post.title}
        </h3>

        <div className="relative z-20 mt-auto flex items-center justify-between gap-4 border-t border-foreground/10 pt-5">
          <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            {publishedDate}
          </span>
          <Link
            href={`${BLOG_AUTHOR_LINK}/${post.author.slug}`}
            className="text-right text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:text-foreground"
          >
            {post.author.name}
          </Link>
        </div>
      </div>
    </article>
  );
};
