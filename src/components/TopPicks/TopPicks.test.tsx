import { render, screen } from "@testing-library/react";
import { TopPicks } from "./TopPicks";
import "@testing-library/jest-dom";
import { TopPicksSectionCMS, Post } from "@/sanity/queries";
import { MIN_TOP_PICKS_REQUIRED } from "@/lib/constants";

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

// Mock next/image
jest.mock("next/image", () => ({
  __esModule: true,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  default: (props: any) => {
    // eslint-disable-next-line jsx-a11y/alt-text, @next/next/no-img-element
    return <img {...props} />;
  },
}));

// Mock the urlFor function from Sanity
jest.mock("@/sanity/lib/image", () => ({
  urlFor: jest.fn().mockReturnValue({
    width: jest.fn().mockReturnThis(),
    url: jest.fn().mockReturnValue("https://example.com/mock-image.jpg"),
  }),
}));

// Mock PostCard component
jest.mock("@/components", () => ({
  PostCard: ({ post }: { post: Post }) => (
    <div>
      <h3>{post.title}</h3>
    </div>
  ),
}));

const mockTopPicksPosts: Post[] = [
  {
    _id: "1",
    title: "Top Pick Post 1",
    metaDescription: "Meta description for top pick 1",
    slug: "top-pick-1",
    coverImage: {
      asset: {
        _ref: "image-Tb9Ew8CXIwaY6R1kjMvI0uRR-2000x3000-jpg",
        _type: "reference",
      },
    },
    coverImageAlt: "Cover image alt 1",
    publishedAt: "2023-01-01T10:00:00Z",
    author: {
      name: "Author A",
      slug: "author-a",
      image: {
        asset: {
          _ref: "image-Tb9Ew8CXIwaY6R1kjMvI0uRR-2000x3000-jpg",
          _type: "reference",
        },
      },
      bio: "Bio A",
      title: "Title A",
    },
    categories: [{ name: "Category X", slug: "category-x" }],
    content: [],
    isTopPick: true,
  },
  {
    _id: "2",
    title: "Top Pick Post 2",
    metaDescription: "Meta description for top pick 2",
    slug: "top-pick-2",
    coverImage: {
      asset: {
        _ref: "image-Tb9Ew8CXIwaY6R1kjMvI0uRR-2000x3000-jpg",
        _type: "reference",
      },
    },
    coverImageAlt: "Cover image alt 2",
    publishedAt: "2023-01-02T10:00:00Z",
    author: {
      name: "Author B",
      slug: "author-b",
      image: {
        asset: {
          _ref: "image-Tb9Ew8CXIwaY6R1kjMvI0uRR-2000x3000-jpg",
          _type: "reference",
        },
      },
      bio: "Bio B",
      title: "Title B",
    },
    categories: [{ name: "Category Y", slug: "category-y" }],
    content: [],
    isTopPick: true,
  },
  {
    _id: "3",
    title: "Top Pick Post 3",
    metaDescription: "Meta description for top pick 3",
    slug: "top-pick-3",
    coverImage: {
      asset: {
        _ref: "image-Tb9Ew8CXIwaY6R1kjMvI0uRR-2000x3000-jpg",
        _type: "reference",
      },
    },
    coverImageAlt: "Cover image alt 3",
    publishedAt: "2023-01-03T10:00:00Z",
    author: {
      name: "Author C",
      slug: "author-c",
      image: {
        asset: {
          _ref: "image-Tb9Ew8CXIwaY6R1kjMvI0uRR-2000x3000-jpg-c",
          _type: "reference",
        },
      },
      bio: "Bio C",
      title: "Title C",
    },
    categories: [{ name: "Category Z", slug: "category-z" }],
    content: [],
    isTopPick: true,
  },
];

const mockCmsData: TopPicksSectionCMS = {
  title: "Top Picks",
};

describe("TopPicks", () => {
  it("renders the title when enough posts are provided", () => {
    render(
      <TopPicks
        topPickPosts={mockTopPicksPosts}
        lang="en"
        cmsData={mockCmsData}
      />
    );
    expect(screen.getByText(mockCmsData.title)).toBeInTheDocument();
  });

  it("renders all top pick posts using PostCard component when enough posts are provided", () => {
    render(
      <TopPicks
        topPickPosts={mockTopPicksPosts}
        lang="en"
        cmsData={mockCmsData}
      />
    );
    expect(screen.getByText("Top Pick Post 1")).toBeInTheDocument();
    expect(screen.getByText("Top Pick Post 2")).toBeInTheDocument();
  });

  it("does not render if fewer than MIN_TOP_PICKS_REQUIRED posts are provided", () => {
    const lessThanMinPosts = mockTopPicksPosts.slice(
      0,
      MIN_TOP_PICKS_REQUIRED - 1
    );
    render(
      <TopPicks
        topPickPosts={lessThanMinPosts}
        lang="en"
        cmsData={mockCmsData}
      />
    );
    expect(screen.queryByText(mockCmsData.title)).not.toBeInTheDocument();
  });

  it("does not render if no posts are provided", () => {
    render(<TopPicks topPickPosts={[]} lang="en" cmsData={mockCmsData} />);
    expect(screen.queryByText(mockCmsData.title)).not.toBeInTheDocument();
  });
});
