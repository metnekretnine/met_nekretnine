import React from "react";
import { PostCard } from "../PostCard/PostCard";
import { Language, MIN_TOP_PICKS_REQUIRED } from "@/lib/constants";
import { TopPicksSectionCMS, Post } from "@/sanity/queries";

interface TopPicksProps {
  topPickPosts: Post[];
  lang: Language["id"];
  cmsData: TopPicksSectionCMS;
  className?: string;
}

export const TopPicks: React.FC<TopPicksProps> = ({
  topPickPosts,
  lang,
  cmsData,
  className,
}) => {
  if (topPickPosts.length < MIN_TOP_PICKS_REQUIRED) {
    return null;
  }

  return (
    <section className={`w-full bg-[#f5f7f8] py-20 md:py-28 ${className}`}>
      <div className="container mx-auto px-global">
        <div className="mb-10 max-w-3xl">
          <h2 className="text-4xl font-semibold tracking-tight md:text-6xl">
            {cmsData.title}
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {topPickPosts.map((post) => (
            <PostCard key={post._id} post={post} lang={lang} />
          ))}
        </div>
      </div>
    </section>
  );
};
