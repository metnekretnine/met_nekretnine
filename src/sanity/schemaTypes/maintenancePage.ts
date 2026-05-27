import { defineField, defineType } from "sanity";

export const maintenancePage = defineType({
  name: "maintenancePage",
  title: "Maintenance Page",
  type: "document",
  fields: [
    defineField({
      name: "metaTitle",
      title: "Meta Title",
      type: "localeString",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "metaDescription",
      title: "Meta Description",
      type: "localeString",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "metaOgImage",
      title: "Meta Open Graph Image",
      type: "image",
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: "maintenanceText",
      title: "Maintenance Text",
      type: "localeRichText",
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    prepare() {
      return {
        title: "Maintenance Page",
      };
    },
  },
});
