import { defineField, defineType } from 'sanity';

export const testimonialsSection = defineType({
  name: 'testimonialsSection',
  title: 'Testimonials Section',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'localeString',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'showMoreLabel',
      title: 'Show More Label',
      type: 'localeString',
      description: 'Tekst na gumbu unutar kartice za proširivanje recenzije (npr. Pročitaj više)',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'showLessLabel',
      title: 'Show Less Label',
      type: 'localeString',
      description: 'Tekst na gumbu unutar kartice za skupljanje recenzije (npr. Prikaži manje)',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'testimonials',
      title: 'Testimonials',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'testimonial',
          fields: [
            defineField({
              name: 'name',
              title: 'Name',
              type: 'string',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'text',
              title: 'Text',
              type: 'localeString',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'rating',
              title: 'Rating',
              type: 'number',
              initialValue: 5,
              validation: (Rule) => Rule.required().min(1).max(5),
            }),
          ],
          preview: {
            select: {
              title: 'name',
              rating: 'rating',
            },
            prepare({ title, rating }) {
              return {
                title: title,
                subtitle: `${rating} stars`,
              };
            },
          },
        },
      ],
      validation: (Rule) => Rule.required().min(1),
    }),
  ],
  preview: {
    select: {
      title: 'title.hr',
    },
    prepare({ title }) {
      return {
        title: title || 'Testimonials Section',
      };
    },
  },
});
