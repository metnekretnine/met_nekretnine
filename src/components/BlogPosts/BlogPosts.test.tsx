import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BlogPosts } from "./BlogPosts";
import "@testing-library/jest-dom";
import { loadMoreBlogPosts } from "@/lib/actions/blog";
import { BlogPostsSectionCMS, Post } from "@/sanity/queries";
import { LOAD_MORE_POSTS_INCREMENT } from "@/lib/constants";

// Mock the server action
jest.mock("@/lib/actions/blog", () => ({
  loadMoreBlogPosts: jest.fn(() => Promise.resolve([])), // Default mock to return a resolved promise
}));

// Mock next/link
jest.mock("next/link", () => {
  const MockLink = ({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) => <a href={href}>{children}</a>;
  MockLink.displayName = "Link";
  return MockLink;
});

// Mock the PostCard component
jest.mock("@/components", () => ({
  PostCard: ({ post }: { post: Post; lang: string }) => (
    <div>
      <h3>{post.title}</h3>
      <p>{post.author.name}</p>
    </div>
  ),
}));

const mockInitialPosts: Post[] = [
  {
    _id: "1",
    title: "Post 1",
    metaDescription: "Meta description for post 1",
    slug: "post-1",
    coverImage: {
      asset: {
        _ref: "image-Tb9Ew8CXIwaY6R1kjMvI0uRR-2000x3000-jpg",
        _type: "reference",
      },
    },
    coverImageAlt: "Cover image alt 1",
    publishedAt: "2023-01-01T10:00:00Z",
    author: {
      name: "Author 1",
      slug: "author-1",
      image: {
        asset: {
          _ref: "image-Tb9Ew8CXIwaY6R1kjMvI0uRR-2000x3000-jpg",
          _type: "reference",
        },
      },
      bio: "Bio 1",
      title: "Title 1",
    },
    categories: [{ name: "Category 1", slug: "category-1" }],
    content: [],
    isTopPick: false,
  },
];

const mockMorePosts: Post[] = [
  {
    _id: "2",
    title: "Post 2",
    metaDescription: "Meta description for post 2",
    slug: "post-2",

    coverImage: {
      asset: {
        _ref: "image-Tb9Ew8CXIwaY6R1kjMvI0uRR-2000x3000-jpg",
        _type: "reference",
      },
    },
    coverImageAlt: "Cover image alt 2",
    publishedAt: "2023-01-02T10:00:00Z",
    author: {
      name: "Author 2",
      slug: "author-2",
      image: {
        asset: {
          _ref: "image-Tb9Ew8CXIwaY6R1kjMvI0uRR-2000x3000-jpg-2",
          _type: "reference",
        },
      },
      bio: "Bio 2",
      title: "Title 2",
    },
    categories: [{ name: "Category 2", slug: "category-2" }],
    content: [],
    isTopPick: false,
  },
];

const mockCmsData: BlogPostsSectionCMS = {
  loadMoreButtonText: "Load More",
  loadingButtonText: "Loading...",
  noArticlesFoundText: "No posts available.",
};

describe("BlogPosts", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders initial posts and load more button if totalPostsCount is greater", () => {
    render(
      <BlogPosts
        initialPosts={mockInitialPosts}
        totalPostsCount={3}
        lang="en"
        cmsData={mockCmsData}
      />
    );
    expect(screen.getByText("Post 1")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: mockCmsData.loadMoreButtonText })
    ).toBeInTheDocument();
  });

  it("does not render load more button if all posts are displayed", () => {
    render(
      <BlogPosts
        initialPosts={mockInitialPosts}
        totalPostsCount={1}
        lang="en"
        cmsData={mockCmsData}
      />
    );
    expect(
      screen.queryByRole("button", { name: mockCmsData.loadMoreButtonText })
    ).not.toBeInTheDocument();
  });

  it("renders no posts available message when initialPosts is empty", () => {
    render(
      <BlogPosts
        initialPosts={[]}
        totalPostsCount={0}
        lang="en"
        cmsData={mockCmsData}
      />
    );
    expect(
      screen.getByText(mockCmsData.noArticlesFoundText)
    ).toBeInTheDocument();
  });

  it('loads more posts when "Load More" button is clicked', async () => {
    (loadMoreBlogPosts as jest.Mock).mockImplementation(() => {
      return new Promise((resolve) =>
        setTimeout(() => resolve(mockMorePosts), 50)
      ); // Simulate a small delay
    });

    render(
      <BlogPosts
        initialPosts={mockInitialPosts}
        totalPostsCount={3}
        lang="en"
        cmsData={mockCmsData}
      />
    );

    const loadMoreButton = screen.getByRole("button", {
      name: mockCmsData.loadMoreButtonText,
    });
    fireEvent.click(loadMoreButton);

    expect(loadMoreButton).toHaveTextContent(mockCmsData.loadingButtonText);

    // Wait for the new post to appear and the button text to revert
    await waitFor(
      async () => {
        expect(await screen.findByText("Post 2")).toBeInTheDocument();
        expect(
          await screen.findByRole("button", {
            name: mockCmsData.loadMoreButtonText,
          })
        ).toBeInTheDocument();
      },
      { timeout: 1000 }
    ); // Increased timeout to 1 second

    // Assert that loadMoreBlogPosts was called
    expect(loadMoreBlogPosts).toHaveBeenCalledWith(
      "en",
      LOAD_MORE_POSTS_INCREMENT,
      mockInitialPosts.length,
      undefined,
      undefined
    );
  });

  it("handles error during loading more posts", async () => {
    const consoleErrorSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});
    (loadMoreBlogPosts as jest.Mock).mockImplementation(() => {
      return new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Failed to fetch")), 50)
      ); // Simulate a small delay
    });

    render(
      <BlogPosts
        initialPosts={mockInitialPosts}
        totalPostsCount={2}
        lang="en"
        cmsData={mockCmsData}
      />
    );

    const loadMoreButton = screen.getByRole("button", {
      name: mockCmsData.loadMoreButtonText,
    });
    fireEvent.click(loadMoreButton);

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Failed to load more posts:",
        expect.any(Error)
      );
      expect(loadMoreButton).toHaveTextContent(mockCmsData.loadMoreButtonText);
    });

    consoleErrorSpy.mockRestore();
  });
});
