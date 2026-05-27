import { defineField, defineType } from "sanity";

export const servicesSection = defineType({
  name: "servicesSection",
  title: "Services Displayer",
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
      name: "services",
      title: "Services",
      type: "array",
      of: [{ type: "reference", to: [{ type: "services" }] }],
    }),
  ],
  preview: {
    prepare() {
      return {
        title: "Services Displayer",
      };
    },
  },
});
