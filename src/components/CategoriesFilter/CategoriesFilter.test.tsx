import { render, screen, fireEvent } from "@testing-library/react";
import { CategoriesFilter } from "./CategoriesFilter";
import "@testing-library/jest-dom";
import { CategoriesFilterSectionCMS, Category } from "@/sanity/queries";

// Mock next/navigation
const mockPush = jest.fn();
const mockUsePathname = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  usePathname: () => mockUsePathname(),
  useSearchParams: () => new URLSearchParams(),
}));

// Mock next/link to ensure clicks trigger mockPush
jest.mock("next/link", () => {
  const MockLink = ({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) => (
    <a
      href={href}
      onClick={(e) => {
        e.preventDefault(); // Prevent default navigation
        mockPush(href);
      }}
    >
      {children}
    </a>
  );
  MockLink.displayName = "Link";
  return MockLink;
});

const mockCategories: Category[] = [
  { name: "Category 1", slug: "category-1" },
  { name: "Category 2", slug: "category-2" },
  { name: "Category 3", slug: "category-3" },
];

const mockCmsData: CategoriesFilterSectionCMS = {
  allCategoriesText: "All Categories",
};

describe("CategoriesFilter", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders "All Categories" link', () => {
    mockUsePathname.mockReturnValue("/blog"); // Ensure pathname is defined for this test
    render(
      <CategoriesFilter categories={mockCategories} cmsData={mockCmsData} />
    );
    expect(
      screen.getByRole("link", { name: mockCmsData.allCategoriesText })
    ).toBeInTheDocument();
  });

  it("renders all provided categories as links", () => {
    mockUsePathname.mockReturnValue("/blog"); // Ensure pathname is defined for this test
    render(
      <CategoriesFilter categories={mockCategories} cmsData={mockCmsData} />
    );
    mockCategories.forEach((category) => {
      expect(
        screen.getByRole("link", { name: category.name })
      ).toBeInTheDocument();
    });
  });

  it('applies active style to "All Categories" link when on /blog path', () => {
    mockUsePathname.mockReturnValue("/blog");
    render(
      <CategoriesFilter categories={mockCategories} cmsData={mockCmsData} />
    );
    const allCategoriesBadge = screen.getByText(mockCmsData.allCategoriesText);
    expect(allCategoriesBadge).toHaveClass(
      "bg-primary text-primary-foreground"
    );
  });

  it("applies active style to the selected category link", () => {
    mockUsePathname.mockReturnValue("/blog/category/category-2");
    render(
      <CategoriesFilter categories={mockCategories} cmsData={mockCmsData} />
    );
    const category2Badge = screen.getByText("Category 2");
    expect(category2Badge).toHaveClass("bg-primary text-primary-foreground");
    const allCategoriesBadge = screen.getByText(mockCmsData.allCategoriesText);
    expect(allCategoriesBadge).not.toHaveClass(
      "bg-primary text-primary-foreground"
    );
  });

  it('navigates to /blog when "All Categories" is clicked', () => {
    mockUsePathname.mockReturnValue("/blog"); // Ensure pathname is defined for this test
    render(
      <CategoriesFilter categories={mockCategories} cmsData={mockCmsData} />
    );
    fireEvent.click(
      screen.getByRole("link", { name: mockCmsData.allCategoriesText })
    );
    expect(mockPush).toHaveBeenCalledWith("/blog");
  });

  it("navigates to /blog/category/slug when a category link is clicked", () => {
    mockUsePathname.mockReturnValue("/blog"); // Ensure pathname is defined for this test
    render(
      <CategoriesFilter categories={mockCategories} cmsData={mockCmsData} />
    );
    fireEvent.click(screen.getByRole("link", { name: "Category 1" }));
    expect(mockPush).toHaveBeenCalledWith("/blog/category/category-1");
  });
});
