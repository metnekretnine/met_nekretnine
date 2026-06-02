import { defineField, defineType } from "sanity";

export const landlordsPage = defineType({
  name: "landlordsPage",
  title: "Landlords Page",
  type: "document",
  fieldsets: [
    {
      name: "heroSection",
      title: "Hero Section",
      options: { collapsible: true, collapsed: false },
    },
    {
      name: "introSection",
      title: "Intro Section",
      options: { collapsible: true, collapsed: false },
    },
    {
      name: "processSection",
      title: "Process Section",
      options: { collapsible: true, collapsed: false },
    },
    {
      name: "whyMetBox",
      title: "Why MET Box",
      options: { collapsible: true, collapsed: false },
    },
    {
      name: "modelSection",
      title: "Model Section",
      options: { collapsible: true, collapsed: false },
    },
    {
      name: "faq",
      title: "FAQ",
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
      name: "introTitle",
      title: "Intro Title",
      type: "localeString",
      fieldset: "introSection",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "introText",
      title: "Intro Text",
      type: "localeString",
      fieldset: "introSection",
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
          preview: {
            select: { title: "text.hr" },
          },
        },
      ],
    }),
    defineField({
      name: "whyMetTitle",
      title: "Why MET Title",
      type: "localeString",
      fieldset: "whyMetBox",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "whyMetItems",
      title: "Why MET Items",
      type: "array",
      fieldset: "whyMetBox",
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
          preview: {
            select: { title: "text.hr" },
          },
        },
      ],
    }),
    defineField({
      name: "channelsContent",
      title: "Channels Content",
      type: "localeRichText",
      fieldset: "modelSection",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "modelTitle",
      title: "Model Title",
      type: "localeString",
      fieldset: "modelSection",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "modelItems",
      title: "Model Items",
      type: "array",
      fieldset: "modelSection",
      validation: (rule) => rule.required().min(1),
      of: [
        {
          type: "object",
          fields: [
            defineField({
              name: "title",
              title: "Title",
              type: "localeString",
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: "text",
              title: "Text",
              type: "localeString",
              validation: (rule) => rule.required(),
            }),
          ],
          preview: {
            select: { title: "title.hr" },
          },
        },
      ],
    }),
    defineField({
      name: "ctaText",
      title: "CTA Text",
      type: "localeString",
      fieldset: "modelSection",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "ctaHref",
      title: "CTA Href",
      type: "string",
      fieldset: "modelSection",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "faqSection",
      title: "FAQ Section",
      type: "faqSection",
      fieldset: "faq",
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
        title: "Landlords Page",
      };
    },
  },
});
