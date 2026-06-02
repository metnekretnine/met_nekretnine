"use client";

import Link from "next/link";
import { BLOG_LINK, BLOG_CATEGORY_LINK } from "@/lib/constants";
import { Category } from "@/sanity/queries/blog";
import { usePathname } from "next/navigation";
import { CategoriesFilterSectionCMS } from "@/sanity/queries";

interface CategoriesFilterProps {
  categories: Category[];
  cmsData: CategoriesFilterSectionCMS;
  className?: string;
}

export function CategoriesFilter({
  categories,
  cmsData,
  className,
}: CategoriesFilterProps) {
  const pathname = usePathname();
  const activeCategorySlug = pathname.split("/").filter(Boolean).pop();
  const isAll = pathname === BLOG_LINK;

  return (
    <section className={`w-full pb-12 pt-4 md:pt-6 ${className}`}>
      <div className="mx-auto flex max-w-4xl flex-wrap gap-2">
        <Link
          href={BLOG_LINK}
          className={`rounded-lg border px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] transition-colors ${
            isAll
              ? "border-foreground bg-foreground text-white"
              : "border-foreground/10 bg-white text-muted-foreground hover:border-foreground/30 hover:text-foreground"
          }`}
        >
          {cmsData.allCategoriesText}
        </Link>
        {categories.map((category: Category) => {
          const isActive = activeCategorySlug === category.slug;
          return (
            <Link
              key={category.slug}
              href={`${BLOG_CATEGORY_LINK}/${category.slug}`}
              className={`rounded-lg border px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] transition-colors ${
                isActive
                  ? "border-foreground bg-foreground text-white"
                  : "border-foreground/10 bg-white text-muted-foreground hover:border-foreground/30 hover:text-foreground"
              }`}
            >
              {category.name}
            </Link>
          );
        })}
      </div>
    </section>
  );
}
