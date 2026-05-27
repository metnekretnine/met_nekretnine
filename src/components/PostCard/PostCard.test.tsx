import { render, screen } from "@testing-library/react";
import { PostCard } from "./PostCard";
import "@testing-library/jest-dom";
import { Post } from "@/sanity/queries";
import { formatDate } from "@/lib/utils/date";

// Mock next/image
jest.mock("next/image", () => ({
  __esModule: true,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  default: (props: any) => {
    // eslint-disable-next-line jsx-a11y/alt-text, @next/next/no-img-element
    return <img {...props} />;
  },
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

// Mock the urlFor function from Sanity
jest.mock("@/sanity/lib/image", () => ({
  urlFor: jest.fn().mockReturnValue({
    width: jest.fn().mockReturnThis(),
    url: jest.fn().mockReturnValue("https://example.com/mock-image.jpg"),
  }),
}));

// Mock formatDate
jest.mock("@/lib/utils/date", () => ({
  formatDate: jest.fn((date, lang) => `Formatted Date ${date} ${lang}`),
}));

const mockPost: Post = {
  _id: "1",
  title: "Test Post Title",
  metaDescription: "Test Meta Description",
  slug: "test-post-slug",
  author: {
    name: "Test Author",
    slug: "test-author-slug",
    image: {
      asset: {
        _ref: "image-Tb9Ew8CXIwaY6R1kjMvI0uRR-2000x3000-jpg",
        _type: "reference",
      },
    },
    bio: "Test Bio",
    title: "Test Author Title",
  },
  categories: [
    { name: "Category A", slug: "category-a" },
    { name: "Category B", slug: "category-b" },
  ],
  coverImage: {
    asset: {
      _ref: "image-Tb9Ew8CXIwaY6R1kjMvI0uRR-2000x3000-jpg",
      _type: "reference",
    },
  },
  coverImageAlt: "Test Cover Image Alt",
  publishedAt: "2023-01-15T10:00:00Z",
  content: [],
  isTopPick: false,
};

describe("PostCard", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the post title and links to the post page", () => {
    render(<PostCard post={mockPost} lang="en" />);
    const titleLink = screen.getByRole("link", { name: mockPost.title });
    expect(titleLink).toBeInTheDocument();
    expect(titleLink).toHaveAttribute("href", `/blog/${mockPost.slug}`);
  });

  it("renders the author name and links to the author page", () => {
    render(<PostCard post={mockPost} lang="en" />);
    const authorLink = screen.getByRole("link", { name: mockPost.author.name });
    expect(authorLink).toBeInTheDocument();
    expect(authorLink).toHaveAttribute(
      "href",
      `/blog/author/${mockPost.author.slug}`
    );
  });

  it("renders the formatted published date", () => {
    render(<PostCard post={mockPost} lang="en" />);
    expect(formatDate).toHaveBeenCalledWith(mockPost.publishedAt, "en");
    expect(
      screen.getByText(`Formatted Date ${mockPost.publishedAt} en`)
    ).toBeInTheDocument();
  });

  it("renders the cover image with correct src and alt text", () => {
    render(<PostCard post={mockPost} lang="en" />);
    const image = screen.getByRole("img", { name: mockPost.coverImageAlt });
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute("src", "https://example.com/mock-image.jpg");
  });

  it("uses DEFAULT_OG_IMAGE if coverImage is not provided", () => {
    const postWithoutImage = {
      ...mockPost,
      coverImage: {
        asset: {
          _ref: "image-Tb9Ew8CXIwaY6R1kjMvI0uRR-2000x3000-jpg",
          _type: "reference",
        },
      },
    }; // Ensure coverImage is always a valid object
    render(<PostCard post={postWithoutImage} lang="en" />);
    const image = screen.getByRole("img", { name: mockPost.coverImageAlt });
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute("src", "https://example.com/mock-image.jpg"); // Mocked urlFor returns this
  });

  it("uses post title as alt text if coverImageAlt is not provided", () => {
    const postWithoutAlt = { ...mockPost, coverImageAlt: undefined };
    render(<PostCard post={postWithoutAlt} lang="en" />);
    const image = screen.getByRole("img", { name: mockPost.title });
    expect(image).toBeInTheDocument();
  });

  it("renders all categories as badges with correct links", () => {
    render(<PostCard post={mockPost} lang="en" />);
    mockPost.categories.forEach((category) => {
      const categoryBadge = screen.getByText(category.name);
      expect(categoryBadge).toBeInTheDocument();
      expect(categoryBadge.closest("a")).toHaveAttribute(
        "href",
        `/blog/category/${category.slug}`
      );
    });
  });
});
