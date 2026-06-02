import { defineField, defineType } from "sanity";

export const post = defineType({
  name: "post",
  title: "Post",
  type: "document",
  fieldsets: [
    {
      name: "imageDetails",
      title: "Image Details",
      options: { collapsible: true, collapsed: false },
    },
  ],
  fields: [
    defineField({
      name: "title",
      title: "Title",
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
      name: "metaTitle",
      title: "Meta Title",
      type: "localeString",
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: {
        source: "title.hr", // Generate slug from Croatian title
        maxLength: 96,
        isUnique: (value, context) => context.defaultIsUnique(value, context),
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "author",
      title: "Author",
      type: "reference",
      to: [{ type: "author" }],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "categories",
      title: "Categories",
      type: "array",
      of: [{ type: "reference", to: [{ type: "category" }] }],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "coverImage",
      title: "Cover Image",
      type: "image",
      options: {
        hotspot: true,
      },
      validation: (rule) => rule.required(),
      fieldset: "imageDetails",
    }),
    defineField({
      name: "coverImageAlt",
      type: "localeString",
      title: "Cover Image Alternative text",
      description: "Important for SEO and accessibility.",
      fieldset: "imageDetails",
    }),
    defineField({
      name: "publishedAt",
      title: "Published At",
      type: "datetime",
      initialValue: () => new Date().toISOString(),
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "isPublished",
      title: "Objavljeno na MET webu",
      type: "boolean",
      initialValue: false,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "content",
      title: "Content",
      type: "localeRichText",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "isTopPick",
      title: "Is Top Pick",
      type: "boolean",
      initialValue: false,
    }),
  ],
    preview: {
    select: {
      title: "title.hr",
      media: "coverImage",
    },
  },
});
