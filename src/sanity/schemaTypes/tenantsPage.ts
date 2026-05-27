import { defineField, defineType } from "sanity";

export const tenantsPage = defineType({
  name: "tenantsPage",
  title: "Tenants Page",
  type: "document",
  fieldsets: [
    {
      name: "heroSection",
      title: "Hero Section",
      options: { collapsible: true, collapsed: false },
    },
    {
      name: "processSection",
      title: "Process Section",
      options: { collapsible: true, collapsed: false },
    },
    {
      name: "contentSection",
      title: "Content Section",
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
      name: "heroDescriptionText",
      title: "Hero Description Text",
      type: "localeString",
      fieldset: "heroSection",
    }),
    defineField({
      name: "heroBackgroundImage",
      title: "Hero Background Image",
      type: "image",
      options: { hotspot: true },
      fieldset: "heroSection",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "heroBackgroundImageAlt",
      title: "Hero Background Image Alt",
      type: "localeString",
      fieldset: "heroSection",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "processTitle",
      title: "Process Title",
      type: "localeString",
      fieldset: "processSection",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "processItems",
      title: "Process Items",
      type: "array",
      fieldset: "processSection",
      validation: (rule) => rule.required().min(1),
      of: [
        {
          type: "object",
          fields: [
            defineField({
              name: "text",
              title: "Text",
              type: "localeString",
              validation: (rule) => rule.required(),
            }),
          ],
          preview: { select: { title: "text.hr" } },
        },
      ],
    }),
    defineField({
      name: "content",
      title: "Content",
      type: "localeRichText",
      fieldset: "contentSection",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "ctaText",
      title: "CTA Text",
      type: "localeString",
      fieldset: "contentSection",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "ctaHref",
      title: "CTA Href",
      type: "string",
      fieldset: "contentSection",
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
        title: "Tenants Page",
      };
    },
  },
});
