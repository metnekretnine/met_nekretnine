import Image from "next/image";
import { Author } from "@/sanity/queries";
import { urlFor } from "@/sanity/lib/image";
import { DEFAULT_OG_IMAGE } from "@/lib/constants";

interface AuthorHeaderBlogProps {
  author: Author;
}

export function AuthorHeaderBlog({ author }: AuthorHeaderBlogProps) {
  const authorImageUrl = author.image
    ? urlFor(author.image).url()
    : DEFAULT_OG_IMAGE;

  const backgroundImage = author.heroBackgroundImage
    ? urlFor(author.heroBackgroundImage).url()
    : null;

  return (
    <section className="relative min-h-[50dvh] mt-14 md:mt-20 flex items-end overflow-hidden">
      <div className="absolute inset-0 z-0">
        {backgroundImage ? (
          <Image
            src={backgroundImage}
            alt={author.name}
            fill
            className="object-cover object-top"
            priority
          />
        ) : (
          <div className="absolute inset-0 bg-foreground" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20 z-10" />
      </div>

      <div className="container relative z-20 mx-auto px-global pb-16 md:pb-24 pt-32">
        <div className="max-w-5xl">
          <div className="mb-6 flex items-center gap-4">
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg ring-1 ring-white/20 md:h-20 md:w-20">
              <Image
                src={authorImageUrl}
                alt={author.name}
                fill
                className="object-cover"
                sizes="80px"
                priority
              />
            </div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/60">
              {author.title}
            </p>
          </div>

          <h1 className="max-w-5xl text-5xl font-semibold uppercase leading-none tracking-tight text-white md:text-7xl lg:text-8xl">
            {author.name}
          </h1>

          {author.bio && (
            <p className="mt-6 text-2xl font-medium text-white/86 md:text-3xl">
              {author.bio}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
