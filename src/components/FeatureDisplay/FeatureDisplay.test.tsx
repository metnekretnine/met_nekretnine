import { render, screen } from "@testing-library/react";
import { FeatureDisplay } from "./FeatureDisplay";
import "@testing-library/jest-dom";
import { ItemsDisplayer } from "@/lib/utils/mappers";
import { PortableTextBlock, PortableTextSpan } from "@portabletext/types";

// Mock next/image
jest.mock("next/image", () => ({
  __esModule: true,
  default: (props: React.ComponentProps<"img">) => {
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

const mockCmsData: ItemsDisplayer = {
  title: "Our Features",
  moreInfoLink: "/features",
  moreInfoText: "View All Features",
  items: [
    {
      title: "Feature One",
      description: [
        {
          _key: "a1b2c3d4e5f6",
          _type: "block",
          children: [
            {
              _key: "g7h8i9j0k1l2",
              _type: "span",
              marks: [],
              text: "Description for feature one.",
            },
          ],
          markDefs: [],
          style: "normal",
        },
      ],
      buttonText: "Learn More",
      buttonLink: "/feature-one",
      image: {
        asset: {
          _ref: "image-mock-ref-1",
          _type: "reference",
        },
      },
      imageAlt: "Image for feature one",
    },
    {
      title: "Feature Two",
      description: [
        {
          _key: "a1b2c3d4e5f6",
          _type: "block",
          children: [
            {
              _key: "g7h8i9j0k1l2",
              _type: "span",
              marks: [],
              text: "Description for feature two.",
            },
          ],
          markDefs: [],
          style: "normal",
        },
      ],
      buttonText: "Discover",
      buttonLink: "/feature-two",
      image: {
        asset: {
          _ref: "image-mock-ref-2",
          _type: "reference",
        },
      },
      imageAlt: "Image for feature two",
    },
  ],
};

// Mock the portableToText function
jest.mock("@/lib/utils/text", () => ({
  portableToText: jest.fn((portableText: PortableTextBlock[]) => {
    if (!portableText) return "";
    return portableText
      .map((block: PortableTextBlock) =>
        block.children
          ? block.children
              .map((span) => (span as PortableTextSpan).text || "")
              .join("")
          : ""
      )
      .join("\n");
  }),
}));

describe("FeatureDisplay", () => {
  it("renders the title and more info link", () => {
    render(<FeatureDisplay cmsData={mockCmsData} />);
    expect(screen.getByText(mockCmsData.title)).toBeInTheDocument();
    const moreInfoLink = screen.getByRole("link", {
      name: mockCmsData.moreInfoText,
    });
    expect(moreInfoLink).toBeInTheDocument();
    expect(moreInfoLink).toHaveAttribute("href", mockCmsData.moreInfoLink);
  });

  it("renders all feature cards with correct content and links", () => {
    render(<FeatureDisplay cmsData={mockCmsData} />);
    mockCmsData.items.forEach((feature) => {
      // Find the link that wraps the entire card
      const cardLink = screen.getByRole("link", {
        name: new RegExp(feature.title),
      });
      expect(cardLink).toBeInTheDocument();
      expect(cardLink).toHaveAttribute("href", feature.buttonLink);

      // Check if the content is within this link
      expect(cardLink).toHaveTextContent(feature.title);
      expect(cardLink).toHaveTextContent(
        jest.requireMock("@/lib/utils/text").portableToText(feature.description)
      );
      expect(cardLink).toHaveTextContent(feature.buttonText);

      // Check the image within the link
      const featureImage = screen.getByRole("img", { name: feature.imageAlt });
      expect(featureImage).toBeInTheDocument();
      expect(featureImage).toHaveAttribute(
        "src",
        "https://example.com/mock-image.jpg"
      );
    });
  });

  it("renders the correct number of feature cards", () => {
    render(<FeatureDisplay cmsData={mockCmsData} />);
    // Find all links that wrap the feature cards. Their accessible name will contain the title.
    const featureCards = screen.getAllByRole("link", {
      name: /Feature One|Feature Two/i,
    });
    expect(featureCards).toHaveLength(mockCmsData.items.length);
  });
});
