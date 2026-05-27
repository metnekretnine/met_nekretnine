import { defineField, defineType } from "sanity";

export const privacyPolicyPage = defineType({
  name: "privacyPolicyPage",
  title: "Privacy Policy Page",
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
      name: "heroDescriptionText",
      title: "Hero Description Text",
      type: "localeString",
      fieldset: "heroSection",
      description: "Optional description displayed in the Hero section.",
    }),
    defineField({
      name: "heroBackgroundImage",
      title: "Hero Background Image",
      type: "image",
      fieldset: "heroSection",
      options: {
        hotspot: true,
      },
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
      name: "content",
      title: "Content",
      type: "localeRichText",
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
      description:
        "Image displayed when the page is shared on social media platforms. Recommended dimensions: 1200×630 px.",
      fieldset: "seo",
    }),
  ],
  preview: {
    prepare() {
      return {
        title: "Privacy Policy Page",
      };
    },
  },
});
