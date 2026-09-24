import { defineField, defineType } from "sanity";
import { PriceListSectionInput } from "../components/PriceListSectionInput";

export const priceListSection = defineType({
  name: "priceListSection",
  title: "Novi cjenik",
  type: "document",
  components: { input: PriceListSectionInput },
  // The published price list is locked; "Kreiraj novi cjenik" creates an
  // editable draft copy. A document that was never published stays editable.
  readOnly: ({ document }) =>
    Boolean(document?._rev) && !document?._id?.startsWith("drafts."),
  fields: [
    defineField({
      name: "services",
      title: "Usluge i cijene",
      type: "array",
      of: [{ type: "priceListService" }],
      validation: (rule) => rule.required().min(1),
    }),
  ],
  preview: {
    prepare() {
      return { title: "Novi cjenik" };
    },
  },
});
