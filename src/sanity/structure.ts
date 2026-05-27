import type {
  DefaultDocumentNodeResolver,
  StructureResolver,
  StructureBuilder,
} from "sanity/structure";
import React, { ComponentType } from "react";
import {
  CaseIcon,
  CogIcon,
  ComposeIcon,
  DocumentsIcon,
  EnvelopeIcon,
  HelpCircleIcon,
  HomeIcon,
  LockIcon,
  UserIcon,
  WrenchIcon,
} from "@sanity/icons";

const singletonListItem = (
  S: StructureBuilder,
  title: string,
  schemaType: string,
  icon?: ComponentType,
) =>
  S.listItem()
    .title(title)
    .id(schemaType)
    .schemaType(schemaType)
    .child(S.document().schemaType(schemaType).documentId(schemaType))
    .icon(icon);

// List of all schemas that are handled manually
const manuallyHandledSchemas = [
  "metHomePage",
  "apartmentsRentPage",
  "landlordsPage",
  "tenantsPage",
  "submitApartmentPage",
  "agencyPage",
  "termsPage",
  "cookiePolicyPage",
  "listingDetailsPage",
  "contactPage",
  "privacyPolicyPage",
  "notFoundPage",
  "maintenancePage",
  "blogPage",
  "blogCategoryPage",
  "blogAuthorPage",
  "post",
  "author",
  "category",
  "configurationSection",
  "navigationSection",
  "footerSection",
  "cookieConsentSection",
  "whatsAppButtonSection",
  "notificationBarSection",
  "topPicksSection",
  "blogPostsSection",
  "categoriesFilterSection",
  "recentPostsSection",
  "contactFormSection",
  "ctaSection",
  "agent",
  "listing",
  "listingExplorerSection",
];

export const structure: StructureResolver = (S) =>
  S.list()
    .title("Content")
    .items([
      // Stanovi
      S.listItem()
        .title("Stanovi za najam")
        .icon(CaseIcon)
        .child(
          S.list()
            .title("Stanovi za najam")
            .items([
              S.documentTypeListItem("listing").title("Svi stanovi"),

              S.listItem()
                .title("Aktivni")
                .child(
                  S.documentList()
                    .title("Aktivni stanovi")
                    .filter(
                      '_type == "listing" && type == "rent" && category == "apartment" && status in ["active", "published"]',
                    ),
                ),
              S.listItem()
                .title("Rezervirani")
                .child(
                  S.documentList()
                    .title("Rezervirani stanovi")
                    .filter(
                      '_type == "listing" && type == "rent" && category == "apartment" && status == "reserved"',
                    ),
                ),
              S.listItem()
                .title("Iznajmljeni")
                .child(
                  S.documentList()
                    .title("Iznajmljeni stanovi")
                    .filter(
                      '_type == "listing" && type == "rent" && category == "apartment" && status == "rented"',
                    ),
                ),
              S.divider(),

              S.listItem()
                .title("Istaknuti")
                .child(
                  S.documentList()
                    .title("Istaknuti stanovi")
                    .filter(
                      '_type == "listing" && type == "rent" && category == "apartment" && isFeatured == true',
                    ),
                ),
              S.listItem()
                .title("Njuškalo")
                .child(
                  S.documentList()
                    .title("Njuškalo stanovi")
                    .filter(
                      '_type == "listing" && type == "rent" && category == "apartment" && syncToNjuskalo == true',
                    ),
                ),
              S.listItem()
                .title("Kontakti")
                .child(
                  S.list()
                    .title("Kontakti")
                    .items([
                      S.documentTypeListItem("agent").title("Agenti"),
                    ]),
                ),
            ]),
        ),

      // Stanovi Elements
      S.listItem()
        .title("Stanovi Elements")
        .icon(CaseIcon)
        .child(
          S.list()
            .title("Stanovi Elements")
            .items([
              singletonListItem(
                S,
                "Listing Explorer Config",
                "listingExplorerSection",
              ),
            ]),
        ),
      S.divider(),

      // Pages
      S.listItem()
        .title("Pages")
        .icon(DocumentsIcon)
        .child(
          S.list()
            .title("Pages")
            .items([
              singletonListItem(
                S,
                "Detalj stana",
                "listingDetailsPage",
                HomeIcon,
              ),
              singletonListItem(S, "MET Home Page", "metHomePage", HomeIcon),
              singletonListItem(
                S,
                "Stanovi za najam Page",
                "apartmentsRentPage",
                HomeIcon,
              ),
              singletonListItem(
                S,
                "Za najmodavce Page",
                "landlordsPage",
                HomeIcon,
              ),
              singletonListItem(
                S,
                "Za najmoprimce Page",
                "tenantsPage",
                HomeIcon,
              ),
              singletonListItem(
                S,
                "Ponudite stan Page",
                "submitApartmentPage",
                EnvelopeIcon,
              ),
              singletonListItem(S, "O agenciji Page", "agencyPage", UserIcon),
              singletonListItem(S, "Opći uvjeti Page", "termsPage", LockIcon),
              singletonListItem(
                S,
                "Politika kolačića Page",
                "cookiePolicyPage",
                LockIcon,
              ),
              singletonListItem(S, "Contact Page", "contactPage", EnvelopeIcon),
              singletonListItem(
                S,
                "Privacy Policy Page",
                "privacyPolicyPage",
                LockIcon,
              ),
              singletonListItem(
                S,
                "Not Found Page",
                "notFoundPage",
                HelpCircleIcon,
              ),
              singletonListItem(
                S,
                "Maintenance Page",
                "maintenancePage",
                WrenchIcon,
              ),
              S.divider(),
              singletonListItem(S, "Blog Page", "blogPage", ComposeIcon),
              singletonListItem(
                S,
                "Blog Category Page",
                "blogCategoryPage",
                ComposeIcon,
              ),
              singletonListItem(
                S,
                "Blog Author Page",
                "blogAuthorPage",
                ComposeIcon,
              ),
            ]),
        ),
      S.divider(),

      // Blog
      S.listItem()
        .title("Blog")
        .icon(ComposeIcon)
        .child(
          S.list()
            .title("Blog")
            .items([
              S.documentTypeListItem("post").title("Posts"),
              S.documentTypeListItem("author").title("Authors"),
              S.documentTypeListItem("category").title("Categories"),
              S.divider(),
              // Dynamic lists
              S.listItem()
                .title("Posts by Category")
                .child(
                  S.documentTypeList("category")
                    .title("Filter by Category")
                    .child((categoryId) =>
                      S.documentList()
                        .title("Posts")
                        .filter(
                          '_type == "post" && $categoryId in categories[]._ref',
                        )
                        .params({ categoryId }),
                    ),
                ),
              S.listItem()
                .title("Posts by Author")
                .child(
                  S.documentTypeList("author")
                    .title("Filter by Author")
                    .child((authorId) =>
                      S.documentList()
                        .title("Posts")
                        .filter('_type == "post" && $authorId == author._ref')
                        .params({ authorId }),
                    ),
                ),
              S.listItem()
                .title("Top Picks Posts")
                .child(
                  S.documentList()
                    .title("Top Picks Posts")
                    .filter('_type == "post" && isTopPick == true'),
                ),
            ]),
        ),

      // Blog Elements
      S.listItem()
        .title("Blog Elements")
        .icon(ComposeIcon)
        .child(
          S.list()
            .title("Blog Elements")
            .items([
              singletonListItem(S, "Top Picks", "topPicksSection"),
              singletonListItem(S, "Blog Posts", "blogPostsSection"),
              singletonListItem(
                S,
                "Categories Filter",
                "categoriesFilterSection",
              ),
              singletonListItem(
                S,
                "Recent Posts Section",
                "recentPostsSection",
              ),
            ]),
        ),
      S.divider(),

      // Site Elements
      S.listItem()
        .title("Site Elements")
        .icon(WrenchIcon)
        .child(
          S.list()
            .title("Site Elements")
            .items([
              singletonListItem(S, "Navigation", "navigationSection"),
              singletonListItem(S, "Footer", "footerSection"),
              singletonListItem(S, "Cookie Consent", "cookieConsentSection"),
              singletonListItem(S, "WhatsApp Button", "whatsAppButtonSection"),
              singletonListItem(
                S,
                "Notification Bar",
                "notificationBarSection",
              ),
            ]),
        ),
      S.divider(),

      // Contact Elements
      S.listItem()
        .title("Contact Elements")
        .icon(EnvelopeIcon)
        .child(
          S.list()
            .title("Contact Elements")
            .items([
              singletonListItem(S, "Contact Form", "contactFormSection"),
            ]),
        ),
      S.divider(),

      // Call To Action
      singletonListItem(
        S,
        "Call To Action Section",
        "ctaSection",
        DocumentsIcon,
      ),
      S.divider(),

      // Site Configuration
      S.listItem()
        .title("Site Configuration")
        .icon(CogIcon)
        .child(
          S.document()
            .schemaType("configurationSection")
            .documentId("configurationSection"),
        ),
      S.divider(),

      // Display any remaining schemas that are not handled manually
      ...S.documentTypeListItems().filter(
        (listItem) => !manuallyHandledSchemas.includes(listItem.getId()!),
      ),
    ]);

// Adds a JSON preview tab to all document types
// https://www.sanity.io/docs/create-custom-document-views-with-structure-builder
export const defaultDocumentNode: DefaultDocumentNodeResolver = (S) => {
  return S.document().views([
    S.view.form(),
    S.view
      .component(({ document }) =>
        React.createElement(
          "div",
          { style: { padding: "2rem" } },
          React.createElement("h2", null, "JSON Data"),
          React.createElement(
            "pre",
            null,
            JSON.stringify(document.displayed, null, 2),
          ),
        ),
      )
      .title("JSON"),
  ]);
};
