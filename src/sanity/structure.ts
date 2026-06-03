import type {
  DefaultDocumentNodeResolver,
  StructureResolver,
  StructureBuilder,
} from "sanity/structure";
import React, { ComponentType } from "react";
import {
  CaseIcon,
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

// Popis shema koje se ručno prikazuju u strukturi
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
    .title("Sadržaj")
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
                      '_type == "listing" && type == "rent" && category == "apartment" && status == "active"',
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

      // Elementi za stanove
      S.listItem()
        .title("Elementi za stanove")
        .icon(CaseIcon)
        .child(
          S.list()
            .title("Elementi za stanove")
            .items([
              singletonListItem(
                S,
                "Konfiguracija pretrage stanova",
                "listingExplorerSection",
              ),
            ]),
        ),
      S.divider(),

      // Stranice
      S.listItem()
        .title("Stranice")
        .icon(DocumentsIcon)
        .child(
          S.list()
            .title("Stranice")
            .items([
              singletonListItem(
                S,
                "Detalj stana",
                "listingDetailsPage",
                HomeIcon,
              ),
              singletonListItem(S, "Početna stranica", "metHomePage", HomeIcon),
              singletonListItem(
                S,
                "Stranica Stanovi za najam",
                "apartmentsRentPage",
                HomeIcon,
              ),
              singletonListItem(
                S,
                "Stranica Za najmodavce",
                "landlordsPage",
                HomeIcon,
              ),
              singletonListItem(
                S,
                "Stranica Za najmoprimce",
                "tenantsPage",
                HomeIcon,
              ),
              singletonListItem(
                S,
                "Stranica Ponudite stan",
                "submitApartmentPage",
                EnvelopeIcon,
              ),
              singletonListItem(S, "Stranica O agenciji", "agencyPage", UserIcon),
              singletonListItem(S, "Stranica Opći uvjeti", "termsPage", LockIcon),
              singletonListItem(
                S,
                "Stranica Politika kolačića",
                "cookiePolicyPage",
                LockIcon,
              ),
              singletonListItem(S, "Stranica Kontakt", "contactPage", EnvelopeIcon),
              singletonListItem(
                S,
                "Stranica Politika privatnosti",
                "privacyPolicyPage",
                LockIcon,
              ),
              singletonListItem(
                S,
                "Stranica 404",
                "notFoundPage",
                HelpCircleIcon,
              ),
              singletonListItem(
                S,
                "Stranica održavanja",
                "maintenancePage",
                WrenchIcon,
              ),
              S.divider(),
              singletonListItem(S, "Stranica Blog", "blogPage", ComposeIcon),
              singletonListItem(
                S,
                "Stranica Blog kategorije",
                "blogCategoryPage",
                ComposeIcon,
              ),
              singletonListItem(
                S,
                "Stranica Blog autora",
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
              S.documentTypeListItem("post").title("Objave"),
              S.documentTypeListItem("author").title("Autori"),
              S.documentTypeListItem("category").title("Kategorije"),
              S.divider(),
              // Dinamičke liste
              S.listItem()
                .title("Objave po kategoriji")
                .child(
                  S.documentTypeList("category")
                    .title("Filtriraj po kategoriji")
                    .child((categoryId) =>
                      S.documentList()
                        .title("Objave")
                        .filter(
                          '_type == "post" && $categoryId in categories[]._ref',
                        )
                        .params({ categoryId }),
                    ),
                ),
              S.listItem()
                .title("Objave po autoru")
                .child(
                  S.documentTypeList("author")
                    .title("Filtriraj po autoru")
                    .child((authorId) =>
                      S.documentList()
                        .title("Objave")
                        .filter('_type == "post" && $authorId == author._ref')
                        .params({ authorId }),
                    ),
                ),
              S.listItem()
                .title("Izdvojene objave")
                .child(
                  S.documentList()
                    .title("Izdvojene objave")
                    .filter('_type == "post" && isTopPick == true'),
                ),
            ]),
        ),

      // Blog elementi
      S.listItem()
        .title("Blog elementi")
        .icon(ComposeIcon)
        .child(
          S.list()
            .title("Blog elementi")
            .items([
              singletonListItem(S, "Izdvojeno", "topPicksSection"),
              singletonListItem(S, "Blog objave", "blogPostsSection"),
              singletonListItem(
                S,
                "Filter kategorija",
                "categoriesFilterSection",
              ),
              singletonListItem(
                S,
                "Sekcija nedavnih objava",
                "recentPostsSection",
              ),
            ]),
        ),
      S.divider(),

      // Elementi stranice
      S.listItem()
        .title("Elementi stranice")
        .icon(WrenchIcon)
        .child(
          S.list()
            .title("Elementi stranice")
            .items([
              singletonListItem(S, "Navigacija", "navigationSection"),
              singletonListItem(S, "Podnožje", "footerSection"),
              singletonListItem(S, "Privola za kolačiće", "cookieConsentSection"),
            ]),
        ),
      S.divider(),

      // Kontakt elementi
      S.listItem()
        .title("Kontakt elementi")
        .icon(EnvelopeIcon)
        .child(
          S.list()
            .title("Kontakt elementi")
            .items([
              singletonListItem(S, "Kontakt forma", "contactFormSection"),
            ]),
        ),
      S.divider(),

      // Poziv na akciju
      singletonListItem(
        S,
        "Poziv na akciju",
        "ctaSection",
        DocumentsIcon,
      ),
      S.divider(),

      // Prikaži preostale tipove shema koji nisu ručno obrađeni
      ...S.documentTypeListItems().filter(
        (listItem) => !manuallyHandledSchemas.includes(listItem.getId()!),
      ),
    ]);

// Dodaje JSON pregled svim tipovima dokumenata
// https://www.sanity.io/docs/create-custom-document-views-with-structure-builder
export const defaultDocumentNode: DefaultDocumentNodeResolver = (S) => {
  return S.document().views([
    S.view.form(),
    S.view
      .component(({ document }) =>
        React.createElement(
          "div",
          { style: { padding: "2rem" } },
          React.createElement("h2", null, "JSON podaci"),
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
