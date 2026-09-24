import { defineField, defineType } from "sanity";

export const priceListService = defineType({
  name: "priceListService",
  title: "Stavka cjenika",
  type: "object",
  fieldsets: [
    {
      name: "current",
      title: "Aktualna cijena",
      options: { collapsible: true, collapsed: false },
    },
    {
      name: "service",
      title: "Usluga",
      options: { collapsible: true, collapsed: true },
    },
    {
      name: "anchor",
      title: "Sidrena cijena",
      options: { collapsible: true, collapsed: true },
    },
  ],
  fields: [
    defineField({
      name: "currentPrice",
      title: "Aktualna cijena ili način obračuna",
      description:
        "Primjeri: 100 % ugovorene mjesečne najamnine; 150,00 EUR; bez zasebne naknade.",
      type: "localeString",
      fieldset: "current",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "maxPrice",
      title: "Najviši iznos naknade",
      description:
        "Prikazuje se ispod aktualne cijene, npr. „najviše 100 %”. Ostavite prazno ako usluga nema zasebnu naknadu.",
      type: "localeString",
      fieldset: "current",
    }),
    defineField({
      name: "isSpecialSale",
      title: "Poseban oblik prodaje",
      description:
        "Uključite ako je aktualna cijena privremeno snižena u sklopu posebnog oblika prodaje: akcija, sezonsko sniženje, rasprodaja ili slično. Primjer: usluga redovno stoji 60,00 EUR, a tijekom „Jesenske akcije” 45,00 EUR. Za redovnu cijenu bez popusta ostavite isključeno.",
      type: "boolean",
      fieldset: "current",
      initialValue: false,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "specialSaleName",
      title: "Naziv posebnog oblika prodaje",
      description:
        "Naziv pod kojim popust ističete kupcima. Primjeri: Jesenska akcija; Sezonsko sniženje; Rasprodaja zbog zatvaranja.",
      type: "localeString",
      fieldset: "current",
      hidden: ({ parent }) => !parent?.isSpecialSale,
      validation: (rule) =>
        rule.custom((value, { parent }) =>
          (parent as { isSpecialSale?: boolean } | undefined)?.isSpecialSale &&
          !value
            ? "Unesite naziv posebnog oblika prodaje."
            : true,
        ),
    }),
    defineField({
      name: "name",
      title: "Naziv usluge",
      description:
        "Ispravak ili preimenovanje ne čini uslugu novom: ako je to i dalje ista usluga, sidrena cijena i njezin datum ostaju isti. Za stvarno novu uslugu dodajte novu stavku.",
      type: "localeString",
      fieldset: "service",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "payer",
      title: "Obveznik plaćanja",
      description: "Tko plaća naknadu, npr. „Nalogodavac - najmodavac”.",
      type: "localeString",
      fieldset: "service",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "note",
      title: "Napomena uz uslugu",
      description:
        "Neobavezno javno objašnjenje cijene ili načina obračuna, npr. što je uključeno. Izmjena napomene ne čini uslugu novom; sidrena cijena i njezin datum ostaju isti.",
      type: "localeString",
      fieldset: "service",
    }),
    defineField({
      name: "referencePrice",
      title: "Sidrena cijena",
      description:
        "Redovna cijena usluge na datum ispod, bez popusta i drugih posebnih oblika prodaje. Upisuje se jednom i ne mijenja se kad kasnije promijenite aktualnu cijenu.",
      type: "localeString",
      fieldset: "anchor",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "referenceDate",
      title: "Datum sidrene cijene",
      description:
        "Za usluge koje ste nudili 10. 9. 2026. ostavite taj datum. Za uslugu uvedenu kasnije unesite datum kada je prvi put ponuđena, npr. 2. 11. 2026., a kao sidrenu cijenu njezinu tadašnju cijenu. Sama promjena naziva postojeće usluge ne čini je novom.",
      type: "date",
      fieldset: "anchor",
      initialValue: "2026-09-10",
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: {
      title: "name.hr",
      subtitle: "currentPrice.hr",
    },
  },
});
