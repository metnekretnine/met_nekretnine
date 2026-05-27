import { render, screen } from "@testing-library/react";
import { CTASection } from "./CTASection";
import "@testing-library/jest-dom";
import { CtaSectionCMS } from "@/sanity/queries";

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

const mockCmsData: CtaSectionCMS = {
  title: "Test CTA Title",
  phoneText: "Call MET",
  phoneHref: "tel:+385000000000",
  whatsappText: "WhatsApp",
  whatsappHref: "https://wa.me/385000000000",
};

describe("CTASection", () => {
  it("renders the title", () => {
    render(<CTASection cmsData={mockCmsData} />);
    expect(screen.getByText(mockCmsData.title)).toBeInTheDocument();
  });

  it("renders CTA links with correct text and hrefs", () => {
    render(<CTASection cmsData={mockCmsData} />);
    const phoneLink = screen.getByRole("link", { name: mockCmsData.phoneText });
    const whatsappLink = screen.getByRole("link", {
      name: mockCmsData.whatsappText,
    });
    expect(phoneLink).toHaveAttribute("href", mockCmsData.phoneHref);
    expect(whatsappLink).toHaveAttribute("href", mockCmsData.whatsappHref);
  });
});
