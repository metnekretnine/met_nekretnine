import { defineField, defineType } from "sanity";

// Marks where the current price list table is rendered inside rich text.
// The table itself is edited in "Cjenik → Novi cjenik".
export const priceListTable = defineType({
  name: "priceListTable",
  title: "Cjenik usluga",
  type: "object",
  fields: [
    // Sanity objects need at least one field; this one is never edited.
    defineField({
      name: "source",
      title: "Izvor",
      type: "string",
      initialValue: "priceListSection",
      hidden: true,
      readOnly: true,
    }),
  ],
  preview: {
    prepare() {
      return {
        title: "Cjenik usluga",
        subtitle:
          "Tablica, CSV i prethodne verzije. Uređuje se u Cjenik → Novi cjenik.",
      };
    },
  },
});
