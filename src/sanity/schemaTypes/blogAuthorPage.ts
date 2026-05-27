import { defineField, defineType } from "sanity";

export const blogAuthorPage = defineType({
  name: "blogAuthorPage",
  title: "Blog Author Page",
  type: "document",
  fields: [
    defineField({
      name: "metaTitle",
      title: "Meta Title",
      type: "localeString",
      description:
        'This will be prefixed to the author\'s name (e.g., "Articles by [Author Name]").',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "metaDescription",
      title: "Meta Description",
      type: "localeString",
      description:
        'This will be prefixed to the author\'s name (e.g., "Read articles by [Author Name]").',
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    prepare() {
      return {
        title: "Blog Author Page",
      };
    },
  },
});
