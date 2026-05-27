import { render, screen } from "@testing-library/react";
import { Navigation } from "./Navigation";
import "@testing-library/jest-dom";
import { NavigationSectionCMS } from "@/sanity/queries";

// Mock next/link
jest.mock("next/link", () => {
  const MockLink = ({
    children,
    href,
    ...props
  }: {
    children: React.ReactNode;
    href: string;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  );
  MockLink.displayName = "Link";
  return MockLink;
});

// Mock next/navigation
jest.mock("next/navigation", () => ({
  usePathname: () => "/",
}));

// Mock child components
jest.mock("@/components", () => ({
  ThemeToggle: () => <div data-testid="theme-toggle-mock" />,
  LanguageSwitcher: () => <div data-testid="language-switcher-mock" />,
}));

// Mock CMS data
const mockCmsData: NavigationSectionCMS = {
  links: [
    { href: "/", title: "Home" },
    { href: "/about", title: "About" },
    { href: "/contact", title: "Contact" },
  ],
  ctaButton: {
    href: "/get-started",
    title: "Get Started",
  },
};

describe("Navigation", () => {
  const notificationBarHeight = 0;

  it("renders the main logo link with correct text and icon", () => {
    render(
      <Navigation
        cmsData={mockCmsData}
        notificationBarHeight={notificationBarHeight}
      />
    );
    const logoLink = screen.getByRole("link", { name: /Company/i });
    expect(logoLink).toBeInTheDocument();
    expect(logoLink).toHaveAttribute("href", "/");
    expect(screen.getByTestId("home-icon")).toBeInTheDocument();
  });

  it("renders all navigation links from CMS data", () => {
    render(
      <Navigation
        cmsData={mockCmsData}
        notificationBarHeight={notificationBarHeight}
      />
    );
    mockCmsData.links.forEach((link) => {
      const navLinks = screen.getAllByRole("link", { name: link.title });
      expect(navLinks.length).toBeGreaterThan(0);
      expect(navLinks[0]).toHaveAttribute("href", link.href);
    });
  });

  it("renders the CTA button from CMS data", () => {
    render(
      <Navigation
        cmsData={mockCmsData}
        notificationBarHeight={notificationBarHeight}
      />
    );
    const ctaButtons = screen.getAllByRole("link", {
      name: mockCmsData.ctaButton.title,
    });
    expect(ctaButtons.length).toBeGreaterThan(0);
    expect(ctaButtons[0]).toHaveAttribute("href", mockCmsData.ctaButton.href);
  });

  it("renders ThemeToggle and LanguageSwitcher components", () => {
    render(
      <Navigation
        cmsData={mockCmsData}
        notificationBarHeight={notificationBarHeight}
      />
    );
    const themeToggles = screen.getAllByTestId("theme-toggle-mock");
    const languageSwitchers = screen.getAllByTestId("language-switcher-mock");

    expect(themeToggles.length).toBe(1);
    expect(languageSwitchers.length).toBe(1);
  });
});
