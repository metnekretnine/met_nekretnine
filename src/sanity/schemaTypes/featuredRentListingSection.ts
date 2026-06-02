import { defineField, defineType } from "sanity";

export const featuredRentListingSection = defineType({
  name: "featuredRentListingSection",
  title: "Featured Rent Listings Displayer",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "localeString",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "moreInfoText",
      title: "More Info Text",
      type: "localeString",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "moreInfoLink",
      title: "More Info Link",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "buttonText",
      title: "Button Text",
      type: "localeString",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "rentedLabel",
      title: "Rented Label",
      type: "localeString",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "reservedLabel",
      title: "Reserved Label",
      type: "localeString",
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    prepare() {
      return {
        title: "Featured Rent Listings Displayer",
      };
    },
  },
});
