import { defineField, defineType } from "sanity";

export const apartmentsRentPage = defineType({
  name: "apartmentsRentPage",
  title: "Apartments Rent Page",
  type: "document",
  fieldsets: [
    {
      name: "introSection",
      title: "Intro Section",
      options: { collapsible: true, collapsed: false },
    },
    {
      name: "seo",
      title: "SEO",
      options: { collapsible: true, collapsed: false },
    },
  ],
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "localeString",
      fieldset: "introSection",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "intro",
      title: "Intro",
      type: "localeString",
      fieldset: "introSection",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "metaTitle",
      title: "Meta Title",
      type: "localeString",
      fieldset: "seo",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "metaDescription",
      title: "Meta Description",
      type: "localeString",
      fieldset: "seo",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "metaOgImage",
      title: "Open Graph Image",
      type: "image",
      options: { hotspot: true },
      fieldset: "seo",
    }),
  ],
  preview: {
    prepare() {
      return {
        title: "Apartments Rent Page",
      };
    },
  },
});
