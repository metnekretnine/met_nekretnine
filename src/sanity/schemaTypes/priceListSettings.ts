import { defineField, defineType } from "sanity";

export const priceListSettings = defineType({
  name: "priceListSettings",
  title: "Podaci o objektu i prikaz",
  type: "document",
  description:
    "Fiksni podaci za prikaz i CSV datoteke. Ne mijenjaju se pri redovnom ažuriranju cijena.",
  fieldsets: [
    {
      name: "details",
      title: "Podaci o objektu",
      description: "Obavezni. Ulaze u propisani naziv CSV datoteke cjenika.",
      options: { collapsible: true, collapsed: false },
    },
    {
      name: "labels",
      title: "Tekstovi tablice i poveznica",
      options: { collapsible: true, collapsed: true },
    },
    {
      name: "archive",
      title: "Prethodne verzije na webu",
      options: { collapsible: true, collapsed: true },
    },
  ],
  fields: [
    defineField({
      name: "locationType",
      title: "Vrsta uslužnog objekta",
      description:
        "Koristi se u nazivu CSV datoteke, primjerice agencija za nekretnine.",
      type: "string",
      fieldset: "details",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "locationAddress",
      title: "Adresa uslužnog objekta",
      type: "string",
      fieldset: "details",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "locationCode",
      title: "Oznaka uslužnog objekta",
      description: "Primjerice U-01 ili 01.",
      type: "string",
      fieldset: "details",
      validation: (rule) =>
        rule.required().regex(/^[A-Za-z0-9-]+$/, {
          name: "slova, brojevi i crtice",
        }),
    }),
    defineField({
      name: "serviceLabel",
      title: "Naziv stupca za uslugu",
      type: "localeString",
      fieldset: "labels",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "payerLabel",
      title: "Naziv stupca za obveznika plaćanja",
      type: "localeString",
      fieldset: "labels",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "currentPriceLabel",
      title: "Naziv stupca za aktualnu cijenu",
      type: "localeString",
      fieldset: "labels",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "referencePriceLabel",
      title: "Naziv stupca za sidrenu cijenu",
      type: "localeString",
      fieldset: "labels",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "lastUpdatedLabel",
      title: "Tekst uz datum objave",
      type: "localeString",
      fieldset: "labels",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "downloadCsvLabel",
      title: "Tekst poveznice za aktualni CSV",
      type: "localeString",
      fieldset: "labels",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "archiveTitle",
      title: "Naslov arhive",
      type: "localeString",
      fieldset: "archive",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "archiveDescription",
      title: "Opis arhive",
      type: "localeString",
      fieldset: "archive",
    }),
    defineField({
      name: "archiveItemLabel",
      title: "Naziv prethodne verzije",
      description:
        "{from} i {to} zamjenjuju se datumom i vremenom početka i kraja važenja, npr. „Cjenik od {from} do {to}”.",
      type: "localeString",
      fieldset: "archive",
      validation: (rule) =>
        rule.required().custom((value) => {
          const localizedValue = value as
            | { hr?: string; en?: string }
            | undefined;
          const texts = [localizedValue?.hr, localizedValue?.en].filter(
            (text): text is string => Boolean(text?.trim()),
          );

          return texts.every(
            (text) => text.includes("{from}") && text.includes("{to}"),
          )
            ? true
            : "Tekst mora sadržavati {from} i {to}.";
        }),
    }),
    defineField({
      name: "downloadArchiveLabel",
      title: "Tekst poveznice za arhivirani CSV",
      type: "localeString",
      fieldset: "archive",
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    prepare() {
      return { title: "Podaci o objektu i prikaz" };
    },
  },
});
