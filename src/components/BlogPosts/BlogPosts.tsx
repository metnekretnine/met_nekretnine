"use client";

import { useState } from "react";
import { PostCard } from "../PostCard/PostCard";
import { Button } from "@/shadcn/components/ui/button";
import { LOAD_MORE_POSTS_INCREMENT } from "@/lib/constants";
import { Language } from "@/lib/constants";
import { loadMoreBlogPosts } from "@/lib/actions/blog";
import { BlogPostsSectionCMS, Post } from "@/sanity/queries";

interface BlogPostsProps {
  initialPosts: Post[];
  totalPostsCount: number;
  lang: Language["id"];
  categorySlug?: string;
  authorSlug?: string;
  cmsData: BlogPostsSectionCMS;
  className?: string;
}

export const BlogPosts: React.FC<BlogPostsProps> = ({
  initialPosts,
  totalPostsCount,
  lang,
  categorySlug,
  authorSlug,
  cmsData,
  className,
}) => {
  const [displayedPosts, setDisplayedPosts] = useState(initialPosts);
  const [postsLoaded, setPostsLoaded] = useState(initialPosts.length);
  const [loading, setLoading] = useState(false);

  const handleLoadMore = async () => {
    setLoading(true);
    try {
      const newPosts = await loadMoreBlogPosts(
        lang,
        LOAD_MORE_POSTS_INCREMENT,
        postsLoaded,
        categorySlug,
        authorSlug
      );
      setDisplayedPosts((prevPosts) => [...prevPosts, ...newPosts]);
      setPostsLoaded((prevCount) => prevCount + newPosts.length);
    } catch (error) {
      console.error("Failed to load more posts:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {initialPosts.length > 0 ? (
        <section className={`w-full py-8 ${className}`}>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {displayedPosts.map((post) => (
              <PostCard key={post._id} post={post} lang={lang} />
            ))}
          </div>
          {postsLoaded < totalPostsCount && (
            <div className="mt-10 text-center">
              <Button
                onClick={handleLoadMore}
                disabled={loading}
                className="h-12 rounded-lg bg-foreground px-8 text-sm font-semibold uppercase tracking-[0.14em] text-white hover:bg-foreground/90"
              >
                {loading
                  ? cmsData.loadingButtonText
                  : cmsData.loadMoreButtonText}
              </Button>
            </div>
          )}
        </section>
      ) : (
        <div
          className={`w-full text-center text-lg text-muted-foreground py-md`}
        >
          {cmsData.noArticlesFoundText}
        </div>
      )}
    </>
  );
};
