import Link from "next/link";
import { Post } from "@/sanity/queries";
import {
  Language,
  BLOG_LINK,
  BLOG_CATEGORY_LINK,
} from "@/lib/constants";
import { format } from "date-fns";

interface PostCardProps {
  post: Post;
  lang: Language["id"];
}

export const PostCard: React.FC<PostCardProps> = ({ post, lang }) => {
  const publishedDate = post.publishedAt
    ? format(new Date(post.publishedAt), lang === "hr" ? "dd.MM.yyyy." : "MM/dd/yyyy")
    : "";
  const primaryCategory = post.categories[0];

  return (
    <article className="group border-b border-foreground/10 py-8 first:pt-0">
      <div className="mb-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        {primaryCategory && (
          <>
            <Link
              href={`${BLOG_CATEGORY_LINK}/${primaryCategory.slug}`}
              className="transition-colors hover:text-foreground"
            >
              {primaryCategory.name}
            </Link>
            <span aria-hidden="true">•</span>
          </>
        )}
        <span>{publishedDate}</span>
      </div>

      <Link href={`${BLOG_LINK}/${post.slug}`} className="block">
        <h3 className="text-3xl font-semibold leading-tight tracking-tight text-foreground transition-colors group-hover:text-foreground/70 md:text-4xl">
          {post.title}
        </h3>
      </Link>
      <p className="mt-4 max-w-3xl text-base leading-relaxed text-muted-foreground md:text-lg">
        {post.metaDescription}
      </p>
    </article>
  );
};
