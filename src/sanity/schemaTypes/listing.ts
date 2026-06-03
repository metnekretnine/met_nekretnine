import { defineField, defineType } from "sanity";
import { CaseIcon } from "@sanity/icons";
import { CodeInputSanity } from "@/components/CodeInputSanity/CodeInputSanity";
import { FeaturedListingInputSanity } from "@/components/FeaturedListingInputSanity/FeaturedListingInputSanity";
import { HeatingInputSanity } from "@/components/HeatingInputSanity/HeatingInputSanity";
import { ListingImagesInput } from "@/components/ListingImagesInput/ListingImagesInput";
import { ListingPublicLinkField } from "@/components/ListingPublicLinkField/ListingPublicLinkField";
import { NjuskaloLocationInput } from "@/components";
import {
  FEATURED_LISTINGS_COUNT_QUERY,
  MAX_FEATURED_LISTINGS,
} from "@/lib/featuredListings";
import { LISTING_CODE_LENGTH } from "@/lib/listingCode";
import {
  getNjuskaloImageSyncState,
  NJUSKALO_WATERMARK_VERSION,
  type NjuskaloImageItem,
  type SanityImageValue,
} from "@/lib/njuskaloImageSync";
import { ZAGREB_DISTRICTS } from "@/lib/zagrebDistricts";
import { NJUSKALO_HEATING_OPTIONS } from "@/lib/listingFieldFormatters";

export const listing = defineType({
  name: "listing",
  title: "Stan za najam",
  type: "document",
  icon: CaseIcon,
  fieldsets: [
    {
      name: "njuskalo",
      title: "Njuškalo sinkronizacija",
      options: { collapsible: true, collapsed: false },
    },
    {
      name: "rental",
      title: "Detalji najma",
      options: { collapsible: true, collapsed: false },
    },
  ],
  fields: [
    defineField({
      name: "publicListingLink",
      title: "Javni oglas",
      type: "string",
      readOnly: true,
      components: {
        field: ListingPublicLinkField,
      },
    }),
    defineField({
      name: "title",
      title: "Naslov oglasa",
      type: "localeString",
      description:
        "Koristi se kao naslov oglasa na stranici i kao SEO meta title, uz dodatak naziva MET d.o.o.",
      validation: (rule) =>
        rule.required().custom((value) => {
          const title = value as { hr?: string } | undefined;

          return title?.hr?.trim()
            ? true
            : "Hrvatski naslov je obavezan za Njuškalo.";
        }),
    }),
    defineField({
      name: "shortDescription",
      title: "Kratki opis",
      type: "localeString",
      description:
        "Koristi se kao kratki opis na stranici i kao SEO meta description za ovaj oglas.",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: {
        source: "title.hr",
        maxLength: 96,
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "type",
      title: "Tip oglasa",
      type: "string",
      options: {
        list: [{ title: "Najam", value: "rent" }],
        layout: "radio",
      },
      initialValue: "rent",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "status",
      title: "Status oglasa",
      type: "string",
      options: {
        list: [
          { title: "Aktivan", value: "active" },
          { title: "Rezerviran", value: "reserved" },
          { title: "Iznajmljen", value: "rented" },
        ],
        layout: "radio",
      },
      initialValue: "active",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "isFeatured",
      title: "Istaknuta nekretnina",
      type: "boolean",
      initialValue: false,
      components: {
        input: FeaturedListingInputSanity,
      },
      validation: (rule) =>
        rule.custom(async (value, context) => {
          if (value !== true) {
            return true;
          }

          const documentId =
            typeof context.document?._id === "string"
              ? context.document._id.replace(/^drafts\./, "")
              : undefined;
          const client = context.getClient({
            apiVersion:
              process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2024-01-01",
          });
          const featuredCount = await client.fetch<number>(
            FEATURED_LISTINGS_COUNT_QUERY,
            {
              draftId: documentId ? `drafts.${documentId}` : undefined,
              publishedId: documentId,
            },
          );

          return featuredCount < MAX_FEATURED_LISTINGS
            ? true
            : `Najviše ${MAX_FEATURED_LISTINGS} nekretnine mogu biti istaknute istovremeno.`;
        }),
    }),
    defineField({
      name: "category",
      title: "Vrsta nekretnine",
      type: "string",
      options: {
        list: [{ title: "Stan", value: "apartment" }],
      },
      initialValue: "apartment",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "district",
      title: "Kvart u Zagrebu",
      type: "string",
      options: {
        list: [...ZAGREB_DISTRICTS],
      },
      validation: (rule) =>
        rule.required().custom((value) =>
          ZAGREB_DISTRICTS.includes(value as (typeof ZAGREB_DISTRICTS)[number])
            ? true
            : "Odaberite jedan od dostupnih zagrebačkih kvartova.",
        ),
    }),
    defineField({
      name: "price",
      title: "Cijena (€)",
      type: "number",
      validation: (rule) => rule.required().min(1),
    }),
    defineField({
      name: "livingArea",
      title: "Stambena površina (m2)",
      type: "number",
      validation: (rule) => rule.required().min(1),
    }),
    defineField({
      name: "floor",
      title: "Kat",
      type: "string",
      options: {
        list: [
          { title: "Suteren", value: "basement" },
          { title: "Prizemlje", value: "ground_floor" },
          { title: "Visoko prizemlje", value: "high_ground_floor" },
          ...Array.from({ length: 24 }, (_, i) => ({
            title: `${i + 1}.`,
            value: (i + 1).toString(),
          })),
          { title: "25+", value: "25_plus" },
          { title: "Potkrovlje", value: "attic" },
          { title: "Visoko potkrovlje", value: "high_attic" },
          { title: "Penthouse", value: "penthouse" },
        ],
      },
    }),
    defineField({
      name: "heating",
      title: "Grijanje",
      type: "string",
      fieldset: "rental",
      description:
        "Vrijednost se direktno sinkronizira s Njuškalom. Ako je odabrano “Nije odabrano”, grijanje se ne šalje na Njuškalo.",
      components: {
        input: HeatingInputSanity,
      },
      options: {
        list: NJUSKALO_HEATING_OPTIONS.map((option) => ({
          title: option.title.hr,
          value: option.value,
        })),
      },
      initialValue: "not_selected",
      validation: (rule) =>
        rule
          .required()
          .custom((value) =>
            value
              ? true
              : 'Odaberite "Nije odabrano" ako grijanje ne želite sinkronizirati.',
          ),
    }),
    defineField({
      name: "availableFromDate",
      title: "Dostupno od",
      type: "date",
      fieldset: "rental",
      description:
        "Datum se sprema kao date-only vrijednost i za Njuškalo se formatira u hrvatskom formatu DD.MM.GGGG.",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "petFriendly",
      title: "Pet friendly",
      type: "boolean",
      fieldset: "rental",
      initialValue: false,
    }),
    defineField({
      name: "code",
      title: "Šifra nekretnine",
      type: "string",
      description:
        "Automatski generirana jedinstvena numerička šifra. Zaključava se nakon generiranja.",
      components: {
        input: CodeInputSanity,
      },
      readOnly: ({ value }) => Boolean(value),
      validation: (rule) =>
        rule
          .required()
          .regex(new RegExp(`^\\d{${LISTING_CODE_LENGTH}}$`), {
            name: `${LISTING_CODE_LENGTH} znamenki`,
          })
          .custom(async (value, context) => {
            if (!value) {
              return true;
            }

            const documentId =
              typeof context.document?._id === "string"
                ? context.document._id.replace(/^drafts\./, "")
                : undefined;
            const client = context.getClient({
              apiVersion:
                process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2024-01-01",
            });
            const duplicateCount = await client.fetch<number>(
              `count(*[_type == "listing" && code == $code && !(_id in [$draftId, $publishedId])])`,
              {
                code: value,
                draftId: documentId ? `drafts.${documentId}` : undefined,
                publishedId: documentId,
              },
            );

            return duplicateCount === 0
              ? true
              : "Šifra nekretnine već postoji.";
          }),
    }),
    defineField({
      name: "images",
      title: "Slike",
      type: "array",
      of: [
        {
          type: "image",
          options: { hotspot: true },
          fields: [
            defineField({
              name: "watermarkTone",
              title: "Njuškalo watermark",
              type: "string",
              description:
                "Odaberite ton watermarka za Njuškalo verziju slike. Originalna slika na webu ostaje bez watermarka.",
              options: {
                list: [
                  { title: "Tamnosivi", value: "dark" },
                  { title: "Bijeli", value: "white" },
                ],
                layout: "radio",
              },
              initialValue: "dark",
              validation: (rule) => rule.required(),
            }),
          ],
        },
      ],
      components: {
        input: ListingImagesInput,
      },
      options: {
        layout: "grid",
      },
      validation: (rule) => rule.required().min(1),
    }),
    defineField({
      name: "video",
      title: "Video URL (YouTube ili Vimeo)",
      type: "url",
      description:
        "Zalijepite puni link na video (npr. https://www.youtube.com/watch?v=... ili https://vimeo.com/...)",
    }),
    defineField({
      name: "description",
      title: "Opis stana",
      type: "localeRichText",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "locationDescription",
      title: "Lokacija",
      type: "localeString",
      fieldset: "rental",
      description: "Kratak opis lokacije/kvarta koji se prikazuje na detalju stana.",
    }),
    defineField({
      name: "rentalTerms",
      title: "Uvjeti najma",
      type: "localeRichText",
      fieldset: "rental",
    }),
    defineField({
      name: "location",
      title: "Lokacija na karti",
      type: "geopoint",
      validation: (rule) =>
        rule.required().custom((field) => {
          const geopoint = field as
            | { lat?: number; lng?: number }
            | undefined;

          return typeof geopoint?.lat === "number" &&
            typeof geopoint?.lng === "number"
            ? true
            : "Lokacija na karti je obavezna za Njuškalo sinkronizaciju.";
        }),
    }),
    defineField({
      name: "publishedAt",
      title: "Datum objavljivanja",
      type: "datetime",
      initialValue: () => new Date().toISOString(),
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "agent",
      title: "Agent / kontakt",
      type: "reference",
      to: [{ type: "agent" }],
      validation: (rule) => rule.required(),
    }),

    // ─── Njuškalo sinkronizacija ───────────────────────────────────────────
    defineField({
      name: "syncToNjuskalo",
      fieldset: "njuskalo",
      title: "Sinkroniziraj na Njuškalo",
      type: "boolean",
      initialValue: false,
      validation: (rule) =>
        rule.required().custom((value, context) => {
          if (value !== true) {
            return true;
          }

          const document = context.document as
            | {
                images?: SanityImageValue[];
                njuskaloImages?: NjuskaloImageItem[];
              }
            | undefined;
          const syncState = getNjuskaloImageSyncState(
            document?.images,
            document?.njuskaloImages,
            NJUSKALO_WATERMARK_VERSION,
          );

          if (syncState.sourceCount === 0) {
            return "Dodajte barem jednu sliku prije Njuškalo sinkronizacije.";
          }

          if (syncState.isReady) {
            return true;
          }

          const staleCount = syncState.staleRefs.length;

          if (syncState.missingCount > 0 && staleCount > 0) {
            return `Njuškalo sinkronizacija nije moguća: nedostaje ${syncState.missingCount} watermark verzija slika i postoji ${staleCount} zastarjelih verzija.`;
          }

          if (syncState.missingCount > 0) {
            return `Njuškalo sinkronizacija nije moguća: nedostaje ${syncState.missingCount} watermark verzija slika.`;
          }

          return `Njuškalo sinkronizacija nije moguća: postoji ${staleCount} zastarjelih watermark verzija slika.`;
        }),
    }),
    defineField({
      name: "njuskaloLocationId",
      fieldset: "njuskalo",
      title: "Njuškalo lokacija",
      type: "string",
      description: "Pretraži i odaberi lokaciju iz Njuškalo baze.",
      components: {
        input: NjuskaloLocationInput,
      },
      validation: (rule) =>
        rule.required().regex(/^\d+$/, {
          name: "Njuškalo location ID",
        }),
    }),
    defineField({
      name: "njuskaloImages",
      fieldset: "njuskalo",
      title: "Njuškalo watermark slike",
      type: "array",
      hidden: true,
      readOnly: true,
      of: [
        {
          type: "object",
          fields: [
            defineField({
              name: "sourceAssetRef",
              title: "Original Asset Ref",
              type: "string",
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: "watermarkVersion",
              title: "Watermark Version",
              type: "string",
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: "watermarkTone",
              title: "Watermark Tone",
              type: "string",
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: "image",
              title: "Watermarked Image",
              type: "image",
              validation: (rule) => rule.required(),
            }),
          ],
        },
      ],
    }),

    // Stan (apartment) — obavezna polja za Njuškalo
    defineField({
      name: "flatBuildingType",
      fieldset: "njuskalo",
      title: "Tip stana",
      type: "string",
      description: "Obavezno za Njuškalo sinkronizaciju stanova.",
      options: {
        list: [
          { title: "Stan u kući", value: "flat_in_house" },
          { title: "Stan u zgradi", value: "flat_in_residential_building" },
        ],
        layout: "radio",
      },
      initialValue: "flat_in_residential_building",
      hidden: ({ document }) => document?.category !== "apartment",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "flatFloorCount",
      fieldset: "njuskalo",
      title: "Broj etaža stana",
      type: "string",
      description: "Obavezno za Njuškalo sinkronizaciju stanova.",
      options: {
        list: [
          { title: "Jednoetažni", value: "single_floor" },
          { title: "Dvoetažni", value: "two_floor" },
          { title: "Višeetažni", value: "multi_floor" },
        ],
        layout: "radio",
      },
      initialValue: "single_floor",
      hidden: ({ document }) => document?.category !== "apartment",
      validation: (rule) => rule.required(),
    }),

    // Broj soba
    defineField({
      name: "numberOfRooms",
      title: "Broj soba",
      type: "string",
      fieldset: "rental",
      description: "Obavezno za Njuškalo sinkronizaciju stanova.",
      options: {
        list: [
          { title: "Garsonijera", value: "studio_apartment" },
          { title: "1 soba", value: "one_room" },
          { title: "2 sobe", value: "two_rooms" },
          { title: "3 sobe", value: "three_rooms" },
          { title: "4 sobe", value: "four_rooms" },
          { title: "5+ soba", value: "five_rooms" },
        ],
      },
      hidden: ({ document }) => document?.category !== "apartment",
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: {
      title: "title.hr",
      subtitle: "price",
      media: "images.0",
    },
    prepare({ title, subtitle, media }) {
      return {
        title: title || "Bez naslova",
        subtitle: subtitle ? `${subtitle} €` : "Cijena nije unesena",
        media,
      };
    },
  },
});
