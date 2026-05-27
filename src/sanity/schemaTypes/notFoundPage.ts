import { defineField, defineType } from "sanity";

export const notFoundPage = defineType({
  name: "notFoundPage",
  title: "Not Found Page",
  type: "document",
  fieldsets: [
    {
      name: "heroSection",
      title: "Hero Section",
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
      name: "heroTitle",
      title: "Hero Title",
      type: "localeString",
      fieldset: "heroSection",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "subtitle",
      title: "Subtitle",
      type: "localeString",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "text",
      title: "Text",
      type: "localeString",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "buttonText",
      title: "Button Text",
      type: "localeString",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "metaTitle",
      title: "Meta Title",
      type: "localeString",
      fieldset: "seo",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "metaDescription",
      title: "Meta Description",
      type: "localeString",
      fieldset: "seo",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "metaOgImage",
      title: "Open Graph Image",
      type: "image",
      description:
        "Image displayed when the page is shared on social media platforms. Recommended dimensions: 1200×630 px.",
      fieldset: "seo",
    }),
  ],
  preview: {
    prepare() {
      return {
        title: "Not Found Page",
      };
    },
  },
});
