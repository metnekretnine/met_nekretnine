import { defineField, defineType } from "sanity";

export const submitApartmentInquiry = defineType({
  name: "submitApartmentInquiry",
  title: "Upit za stan",
  type: "document",
  fieldsets: [
    {
      name: "contact",
      title: "Kontakt",
      options: { collapsible: true, collapsed: false },
    },
    {
      name: "apartment",
      title: "Podaci o stanu",
      options: { collapsible: true, collapsed: false },
    },
    {
      name: "system",
      title: "Sustav",
      options: { collapsible: true, collapsed: true },
    },
  ],
  fields: [
    defineField({
      name: "status",
      title: "Status",
      type: "string",
      initialValue: "new",
      options: {
        list: [
          { title: "Novo", value: "new" },
          { title: "Kontaktirano", value: "contacted" },
          { title: "Arhivirano", value: "archived" },
        ],
        layout: "radio",
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "receivedAt",
      title: "Zaprimljeno",
      type: "datetime",
      readOnly: true,
      fieldset: "system",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "name",
      title: "Ime i prezime",
      type: "string",
      fieldset: "contact",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "phone",
      title: "Telefon",
      type: "string",
      fieldset: "contact",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "email",
      title: "Email",
      type: "string",
      fieldset: "contact",
      validation: (rule) => rule.required().email(),
    }),
    defineField({
      name: "district",
      title: "Lokacija / kvart",
      type: "string",
      fieldset: "apartment",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "area",
      title: "Površina stana",
      type: "string",
      fieldset: "apartment",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "rooms",
      title: "Broj soba",
      type: "string",
      fieldset: "apartment",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "rentPrice",
      title: "Okvirna cijena najma",
      type: "string",
      fieldset: "apartment",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "description",
      title: "Kratak opis",
      type: "text",
      rows: 5,
      fieldset: "apartment",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "photos",
      title: "Fotografije",
      type: "array",
      of: [
        {
          type: "image",
          options: { hotspot: true },
          fields: [
            defineField({
              name: "originalFilename",
              title: "Originalni naziv datoteke",
              type: "string",
              readOnly: true,
            }),
            defineField({
              name: "originalSizeMb",
              title: "Originalna veličina",
              type: "string",
              readOnly: true,
            }),
            defineField({
              name: "storedSizeMb",
              title: "Spremljena veličina",
              type: "string",
              readOnly: true,
            }),
            defineField({
              name: "processingMode",
              title: "Spremljeno kao",
              type: "string",
              readOnly: true,
            }),
            defineField({
              name: "contentType",
              title: "Tip datoteke",
              type: "string",
              readOnly: true,
            }),
            defineField({
              name: "originalSizeBytes",
              title: "Originalna veličina u bajtovima",
              type: "number",
              hidden: true,
              readOnly: true,
            }),
            defineField({
              name: "compressedSizeBytes",
              title: "Kompresirana veličina u bajtovima",
              type: "number",
              hidden: true,
              readOnly: true,
            }),
            defineField({
              name: "compressedSizeMb",
              title: "Kompresirana veličina",
              type: "string",
              hidden: true,
              readOnly: true,
            }),
            defineField({
              name: "storedSizeBytes",
              title: "Spremljena veličina u bajtovima",
              type: "number",
              hidden: true,
              readOnly: true,
            }),
          ],
        },
      ],
    }),
    defineField({
      name: "emailStatus",
      title: "Status email obavijesti",
      type: "string",
      readOnly: true,
      fieldset: "system",
      options: {
        list: [
          { title: "Nije poslano", value: "pending" },
          { title: "Poslano", value: "sent" },
          { title: "Greška", value: "failed" },
        ],
      },
    }),
    defineField({
      name: "emailSentAt",
      title: "Email poslan",
      type: "datetime",
      readOnly: true,
      fieldset: "system",
    }),
    defineField({
      name: "emailError",
      title: "Greška email obavijesti",
      type: "text",
      rows: 3,
      readOnly: true,
      fieldset: "system",
    }),
  ],
  preview: {
    select: {
      name: "name",
      district: "district",
      receivedAt: "receivedAt",
      media: "photos.0",
    },
    prepare({ name, district, receivedAt, media }) {
      const date = receivedAt
        ? new Intl.DateTimeFormat("hr-HR", {
            dateStyle: "medium",
            timeStyle: "short",
          }).format(new Date(receivedAt))
        : "Bez datuma";

      return {
        title: name || "Upit za stan",
        subtitle: [district, date].filter(Boolean).join(" - "),
        media,
      };
    },
  },
});
