import { defineField, defineType } from "sanity";

export const category = defineType({
  name: "category",
  title: "Category",
  type: "document",
  fieldsets: [
    {
      name: "heroSection",
      title: "Hero Section",
      options: { collapsible: true, collapsed: false },
    },
  ],
  fields: [
    defineField({
      name: "name",
      title: "Category Name",
      type: "localeString",
      fieldset: "heroSection",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: {
        source: "name.hr", // Generate slug from English name
        maxLength: 96,
        isUnique: (value, context) => context.defaultIsUnique(value, context),
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "heroDescriptionText",
      title: "Hero Description Text",
      type: "localeString",
      fieldset: "heroSection",
      description: "Description displayed in the Hero section for this category.",
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
  ],
  preview: {
    select: {
      title: "name.hr",
    },
  },
});
