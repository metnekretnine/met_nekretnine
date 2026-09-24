import { defineField, defineType } from "sanity";

const readOnly = true;

const dateTimeFormat = new Intl.DateTimeFormat("hr-HR", {
  day: "numeric",
  month: "numeric",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Europe/Zagreb",
});

function formatDateTime(value?: string): string {
  return value ? dateTimeFormat.format(new Date(value)) : "?";
}

export const priceListSnapshot = defineType({
  name: "priceListSnapshot",
  title: "Verzija cjenika",
  type: "document",
  fieldsets: [
    {
      name: "location",
      title: "Podaci o objektu",
      options: { collapsible: true, collapsed: true },
    },
    {
      name: "technical",
      title: "Tehnički podaci",
      description: "Koristi ih web za prepoznavanje verzija. Nije ih potrebno pregledavati.",
      options: { collapsible: true, collapsed: true },
    },
  ],
  fields: [
    defineField({
      name: "publishedAt",
      title: "Vrijedi od",
      type: "datetime",
      readOnly,
    }),
    defineField({
      name: "replacedAt",
      title: "Vrijedi do",
      description:
        "Prazno ako je ovo aktualna verzija. Nakon 30 dana od ovog datuma verziju možete obrisati gumbom „Delete” dolje desno; do tada je gumb onemogućen.",
      type: "datetime",
      readOnly,
    }),
    defineField({
      name: "services",
      title: "Usluge i cijene",
      type: "array",
      of: [{ type: "priceListService" }],
      readOnly,
    }),
    defineField({
      name: "locationType",
      title: "Vrsta uslužnog objekta",
      type: "string",
      fieldset: "location",
      readOnly,
    }),
    defineField({
      name: "locationAddress",
      title: "Adresa uslužnog objekta",
      type: "string",
      fieldset: "location",
      readOnly,
    }),
    defineField({
      name: "locationCode",
      title: "Oznaka uslužnog objekta",
      type: "string",
      fieldset: "location",
      readOnly,
    }),
    defineField({
      name: "fileName",
      title: "Naziv CSV datoteke",
      description: "Pod ovim je nazivom verzija javno dostupna za preuzimanje.",
      type: "string",
      fieldset: "technical",
      readOnly,
    }),
    defineField({
      name: "storageNumber",
      title: "Redni broj pohrane",
      type: "number",
      fieldset: "technical",
      readOnly,
    }),
    defineField({
      name: "sourceRevision",
      title: "Revizija izvornog dokumenta",
      type: "string",
      fieldset: "technical",
      readOnly,
    }),
    defineField({
      name: "contentHash",
      title: "Sažetak sadržaja",
      type: "string",
      fieldset: "technical",
      readOnly,
    }),
  ],
  preview: {
    select: {
      publishedAt: "publishedAt",
      replacedAt: "replacedAt",
      fileName: "fileName",
    },
    prepare({ publishedAt, replacedAt, fileName }) {
      return {
        title: `Cjenik ${formatDateTime(publishedAt)} – ${
          replacedAt ? formatDateTime(replacedAt) : "aktualni"
        }`,
        subtitle: fileName,
      };
    },
  },
});
