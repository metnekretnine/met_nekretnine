import { defineField, defineType } from "sanity";

export const projectsSection = defineType({
  name: "projectsSection",
  title: "Projects Displayer",
  type: "document",
  hidden: true,
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "localeString",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "moreInfoText",
      title: "More Info Text",
      type: "localeString",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "moreInfoLink",
      title: "More Info Link",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "projects",
      title: "Projects",
      type: "array",
      of: [{ type: "reference", to: [{ type: "projects" }] }],
    }),
  ],
  preview: {
    prepare() {
      return {
        title: "Projects Displayer",
      };
    },
  },
});
