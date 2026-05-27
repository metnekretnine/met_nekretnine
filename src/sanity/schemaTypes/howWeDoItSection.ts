import { defineField, defineType } from "sanity";

export interface HowWeDoItItemCMS {
  title: string;
  description: string;
}

export interface HowWeDoItSectionCMS {
  title: string;
  steps: HowWeDoItItemCMS[];
}

export const howWeDoItSection = defineType({
  name: "howWeDoItSection",
  title: "How We Do It Section",
  type: "object",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "localeString",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "steps",
      title: "Steps",
      type: "array",
      of: [
        {
          type: "object",
          name: "stepItem",
          fields: [
            defineField({
              name: "title",
              title: "Title",
              type: "localeString",
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: "description",
              title: "Description",
              type: "localeString",
              validation: (Rule) => Rule.required(),
            }),
          ],
          preview: {
            select: {
              title: "title.hr",
            },
            prepare({ title }) {
              return {
                title: title || "No title",
              };
            },
          },
        },
      ],
    }),
  ],
});
