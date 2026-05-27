import type { PortableTextBlock } from "@portabletext/types";
import type { SanityImageSource } from "@sanity/image-url/lib/types/types";
import { getBaseUrl } from "@/config/env";
import {
  BLOG_AUTHOR_LINK,
  BLOG_CATEGORY_LINK,
  BLOG_LINK,
  COMPANY_NAME,
  DEFAULT_OG_IMAGE,
  HOME_LINK,
  LISTING_LINK,
  type Language,
} from "@/lib/constants";
import { urlFor } from "@/sanity/lib/image";
import type { ListingCMS, Post } from "@/sanity/queries";

type BreadcrumbItem = {
  name: string;
  item: string;
};

const COMPANY_LEGAL_NAME = "MET d.o.o. za poslovanje nekretninama";
const COMPANY_TAX_ID = "47926577116";
const COMPANY_COURT_ID = "081546123";
const COMPANY_STATISTICAL_ID = "05871867";
const COMPANY_PHONE = "+385914447071";
const COMPANY_FOUNDING_DATE = "2023-11-15";
const COMPANY_ADDRESS = {
  streetAddress: "Savska cesta 32",
  addressLocality: "Zagreb",
  postalCode: "10000",
  addressCountry: "HR",
};
const COMPANY_GEO = {
  latitude: 45.8046,
  longitude: 15.9647,
};

const roomCountMap: Record<string, number | string> = {
  studio_apartment: 1,
  one_room: 1,
  two_rooms: 2,
  three_rooms: 3,
  four_rooms: 4,
  five_rooms: "5+",
};

const listingAvailabilityMap: Record<ListingCMS["status"], string> = {
  active: "https://schema.org/InStock",
  reserved: "https://schema.org/LimitedAvailability",
  rented: "https://schema.org/SoldOut",
};

function absoluteUrl(path = "/") {
  return new URL(path, getBaseUrl()).toString();
}

function schemaImageUrl(
  image?: SanityImageSource | null,
  options: { width?: number; height?: number } = {},
) {
  if (!image) {
    return absoluteUrl(DEFAULT_OG_IMAGE);
  }

  try {
    let builder = urlFor(image)
      .width(options.width || 1200)
      .format("jpg")
      .quality(85);

    if (options.height) {
      builder = builder.height(options.height);
    }

    return builder.url();
  } catch {
    return absoluteUrl(DEFAULT_OG_IMAGE);
  }
}

function localeCode(lang: Language["id"]) {
  return lang === "en" ? "en-US" : "hr-HR";
}

function homeLabel(lang: Language["id"]) {
  return lang === "en" ? "Home" : "Naslovnica";
}

function textFromBlocks(blocks?: PortableTextBlock[]) {
  if (!blocks?.length) {
    return undefined;
  }

  return blocks
    .map((block) =>
      block.children
        ?.map((child) => ("text" in child ? child.text : ""))
        .join(""),
    )
    .filter(Boolean)
    .join("\n\n");
}

function JsonLdScript({ data }: { data: unknown }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function JsonLd({ lang }: { lang: Language["id"] }) {
  const baseUrl = getBaseUrl();
  const description =
    lang === "en"
      ? "MET d.o.o. is a Zagreb real estate agency specialized exclusively in long-term apartment rentals."
      : "MET d.o.o. je agencija za nekretnine specijalizirana isključivo za dugoročni najam stanova u Zagrebu.";

  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${baseUrl}/#website`,
        name: COMPANY_NAME,
        url: baseUrl,
        inLanguage: localeCode(lang),
        publisher: { "@id": `${baseUrl}/#organization` },
      },
      {
        "@type": "RealEstateAgent",
        "@id": `${baseUrl}/#organization`,
        name: COMPANY_NAME,
        legalName: COMPANY_LEGAL_NAME,
        alternateName: "MET",
        url: baseUrl,
        logo: {
          "@type": "ImageObject",
          url: absoluteUrl("/met-logo.svg"),
        },
        image: {
          "@type": "ImageObject",
          url: absoluteUrl("/default-og-image.webp"),
        },
        description,
        telephone: COMPANY_PHONE,
        taxID: `OIB ${COMPANY_TAX_ID}`,
        foundingDate: COMPANY_FOUNDING_DATE,
        founder: {
          "@type": "Person",
          name: "Maja Mara",
        },
        employee: {
          "@type": "Person",
          name: "Maja Mara",
          jobTitle: lang === "en" ? "Director" : "Direktor",
        },
        address: {
          "@type": "PostalAddress",
          ...COMPANY_ADDRESS,
        },
        geo: {
          "@type": "GeoCoordinates",
          ...COMPANY_GEO,
        },
        areaServed: [
          {
            "@type": "City",
            name: "Zagreb",
          },
          {
            "@type": "Country",
            name: "Croatia",
          },
        ],
        knowsLanguage: ["hr", "en"],
        currenciesAccepted: "EUR",
        priceRange: "€€",
        identifier: [
          {
            "@type": "PropertyValue",
            propertyID: "OIB",
            value: COMPANY_TAX_ID,
          },
          {
            "@type": "PropertyValue",
            propertyID: "MBS",
            value: COMPANY_COURT_ID,
          },
          {
            "@type": "PropertyValue",
            propertyID: "MB DZS",
            value: COMPANY_STATISTICAL_ID,
          },
          {
            "@type": "PropertyValue",
            propertyID: "NKD",
            value:
              "M68310 - Uslužne djelatnosti posredovanja u poslovanju nekretninama",
          },
        ],
        additionalProperty: [
          {
            "@type": "PropertyValue",
            name: lang === "en" ? "Company status" : "Status tvrtke",
            value: lang === "en" ? "Active" : "Aktivan",
          },
          {
            "@type": "PropertyValue",
            name:
              lang === "en"
                ? "Credit excellence certificate"
                : "Certifikat bonitetne izvrsnosti",
            value: "AA-",
          },
        ],
        hasOfferCatalog: {
          "@type": "OfferCatalog",
          name:
            lang === "en"
              ? "Long-term apartment rentals in Zagreb"
              : "Dugoročni najam stanova u Zagrebu",
          itemListElement: [
            {
              "@type": "Offer",
              itemOffered: {
                "@type": "Service",
                name:
                  lang === "en"
                    ? "Long-term apartment rental mediation"
                    : "Posredovanje u dugoročnom najmu stanova",
              },
            },
            {
              "@type": "Offer",
              itemOffered: {
                "@type": "Service",
                name:
                  lang === "en"
                    ? "Corporate and international tenant rentals"
                    : "Corporate i međunarodni najam",
              },
            },
          ],
        },
      },
    ],
  };

  return <JsonLdScript data={schema} />;
}

export function BreadcrumbJsonLd({ items }: { items: BreadcrumbItem[] }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.item),
    })),
  };

  return <JsonLdScript data={schema} />;
}

export function PageBreadcrumbJsonLd({
  lang,
  name,
  path,
}: {
  lang: Language["id"];
  name: string;
  path: string;
}) {
  return (
    <BreadcrumbJsonLd
      items={[
        { name: homeLabel(lang), item: HOME_LINK },
        { name, item: path },
      ]}
    />
  );
}

export function BlogJsonLd({
  lang,
  title,
  description,
}: {
  lang: Language["id"];
  title: string;
  description: string;
}) {
  const baseUrl = getBaseUrl();
  const schema = {
    "@context": "https://schema.org",
    "@type": "Blog",
    "@id": `${absoluteUrl(BLOG_LINK)}#blog`,
    name: title,
    description,
    url: absoluteUrl(BLOG_LINK),
    inLanguage: localeCode(lang),
    publisher: { "@id": `${baseUrl}/#organization` },
    isPartOf: { "@id": `${baseUrl}/#website` },
  };

  return <JsonLdScript data={schema} />;
}

export function BlogPostingJsonLd({
  post,
  lang,
}: {
  post: Post;
  lang: Language["id"];
}) {
  const baseUrl = getBaseUrl();
  const postUrl = absoluteUrl(`${BLOG_LINK}/${post.slug}`);
  const articleBody = textFromBlocks(post.content);

  const schema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": `${postUrl}#article`,
    mainEntityOfPage: postUrl,
    headline: post.title,
    description: post.metaDescription,
    image: [schemaImageUrl(post.coverImage, { width: 1200, height: 630 })],
    datePublished: post.publishedAt,
    dateModified: post.publishedAt,
    inLanguage: localeCode(lang),
    articleSection: post.categories?.map((category) => category.name),
    articleBody,
    author: {
      "@type": "Person",
      name: post.author.name,
      url: absoluteUrl(`${BLOG_AUTHOR_LINK}/${post.author.slug}`),
    },
    publisher: { "@id": `${baseUrl}/#organization` },
    isPartOf: { "@id": `${absoluteUrl(BLOG_LINK)}#blog` },
  };

  return <JsonLdScript data={schema} />;
}

export function ListingJsonLd({
  listing,
  lang,
}: {
  listing: ListingCMS;
  lang: Language["id"];
}) {
  const baseUrl = getBaseUrl();
  const listingUrl = absoluteUrl(`${LISTING_LINK}/${listing.slug}`);
  const imageUrls =
    listing.images?.map((image) => schemaImageUrl(image, { width: 1600 })) ||
    [];

  const apartment = {
    "@type": "Apartment",
    "@id": `${listingUrl}#apartment`,
    name: listing.title,
    description: listing.shortDescription,
    url: listingUrl,
    image: imageUrls,
    identifier: listing.code,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Zagreb",
      addressRegion: listing.district,
      addressCountry: "HR",
    },
    ...(listing.location
      ? {
          geo: {
            "@type": "GeoCoordinates",
            latitude: listing.location.lat,
            longitude: listing.location.lng,
          },
        }
      : {}),
    floorSize: {
      "@type": "QuantitativeValue",
      value: listing.livingArea,
      unitCode: "MTK",
      unitText: "m²",
    },
    numberOfRooms: roomCountMap[listing.numberOfRooms] || listing.numberOfRooms,
    additionalProperty: [
      listing.floor
        ? {
            "@type": "PropertyValue",
            name: lang === "en" ? "Floor" : "Kat",
            value: listing.floor,
          }
        : null,
      {
        "@type": "PropertyValue",
        name: lang === "en" ? "District" : "Kvart",
        value: listing.district,
      },
      {
        "@type": "PropertyValue",
        name: "Pet friendly",
        value: listing.petFriendly ? "true" : "false",
      },
    ].filter(Boolean),
  };

  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "RealEstateListing",
        "@id": `${listingUrl}#listing`,
        name: listing.title,
        description: listing.shortDescription,
        url: listingUrl,
        datePosted: listing.publishedAt,
        inLanguage: localeCode(lang),
        image: imageUrls,
        publisher: { "@id": `${baseUrl}/#organization` },
        mainEntity: { "@id": `${listingUrl}#apartment` },
        offers: { "@id": `${listingUrl}#offer` },
      },
      apartment,
      {
        "@type": "Offer",
        "@id": `${listingUrl}#offer`,
        url: listingUrl,
        price: listing.price,
        priceCurrency: "EUR",
        availability: listingAvailabilityMap[listing.status],
        availabilityStarts: listing.availableFromDate,
        seller: { "@id": `${baseUrl}/#organization` },
        itemOffered: { "@id": `${listingUrl}#apartment` },
        priceSpecification: {
          "@type": "UnitPriceSpecification",
          price: listing.price,
          priceCurrency: "EUR",
          unitText: lang === "en" ? "per month" : "mjesečno",
        },
      },
    ],
  };

  return <JsonLdScript data={schema} />;
}

export function ListingsItemListJsonLd({
  listings,
}: {
  listings: ListingCMS[];
}) {
  if (!listings.length) {
    return null;
  }

  const schema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: listings.map((listing, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: absoluteUrl(`${LISTING_LINK}/${listing.slug}`),
      name: listing.title,
    })),
  };

  return <JsonLdScript data={schema} />;
}

export function BlogBreadcrumbJsonLd({
  lang,
  currentName,
  currentPath,
}: {
  lang: Language["id"];
  currentName?: string;
  currentPath?: string;
}) {
  const items = [
    { name: homeLabel(lang), item: HOME_LINK },
    { name: lang === "en" ? "Blog" : "Blog", item: BLOG_LINK },
  ];

  if (currentName && currentPath) {
    items.push({ name: currentName, item: currentPath });
  }

  return <BreadcrumbJsonLd items={items} />;
}

export function BlogCategoryBreadcrumbJsonLd({
  lang,
  categoryName,
  categorySlug,
}: {
  lang: Language["id"];
  categoryName: string;
  categorySlug: string;
}) {
  return (
    <BlogBreadcrumbJsonLd
      lang={lang}
      currentName={categoryName}
      currentPath={`${BLOG_CATEGORY_LINK}/${categorySlug}`}
    />
  );
}
