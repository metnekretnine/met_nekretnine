import { defineType, defineField } from "sanity";

export const aboutPage = defineType({
  name: "aboutPage",
  title: "About Page",
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
    }),
    defineField({
      name: "heroBackgroundImage",
      title: "Hero Background Image",
      type: "image",
      fieldset: "heroSection",
      options: { hotspot: true },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "missionTitle",
      title: "Mission Title",
      type: "localeString",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "missionContent",
      title: "Mission Content",
      type: "localeRichText",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "missionImage",
      title: "Mission Image",
      type: "image",
      options: { hotspot: true },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "teamTitle",
      title: "Team Title",
      type: "localeString",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "teamDescription",
      title: "Team Description",
      type: "localeString",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "faqSection",
      title: "FAQ Section",
      type: "faqSection",
    }),
    defineField({
      name: "teamMembers",
      title: "Team Members",
      type: "array",
      validation: (rule) => rule.required().min(1),
      of: [
        {
          type: "object",
          fields: [
            {
              name: "name",
              title: "Name",
              type: "string",
              validation: (rule) => rule.required(),
            },
            {
              name: "role",
              title: "Role",
              type: "localeString",
              validation: (rule) => rule.required(),
            },
            {
              name: "description",
              title: "Description",
              type: "localeString",
              validation: (rule) => rule.required(),
            },
            {
              name: "image",
              title: "Image",
              type: "image",
              options: { hotspot: true },
              validation: (rule) => rule.required(),
            },
          ],
        },
      ],
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
        title: "About Page",
      };
    },
  },
});
