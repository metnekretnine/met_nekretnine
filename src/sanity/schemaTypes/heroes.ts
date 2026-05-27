import { defineField, defineType } from 'sanity';

export const heroes = defineType({
  name: 'heroes',
  title: 'Heroes',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'badgeText',
      title: 'Badge Text',
      type: 'localeString',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'mainHeading',
      title: 'Main Heading',
      type: 'localeString',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'subtitle',
      title: 'Subtitle',
      type: 'localeString',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'primaryButton',
      title: 'Primary Button',
      type: 'object',
      fields: [
        defineField({
          name: 'title',
          title: 'Title',
          type: 'localeString',
        }),
        defineField({
          name: 'href',
          title: 'Href',
          type: 'string',
        }),
      ],
    }),
    defineField({
      name: 'secondaryButton',
      title: 'Watch Demo Button',
      type: 'object',
      fields: [
        defineField({
          name: 'title',
          title: 'Title',
          type: 'localeString',
        }),
        defineField({
          name: 'href',
          title: 'Href',
          type: 'string',
        }),
      ],
    }),
    defineField({
      name: 'videoFile',
      title: 'Video File',
      description: 'Optional: Upload a video file (mp4). If provided, it will be used instead of background images.',
      type: 'file',
      options: {
        accept: 'video/mp4',
      },
    }),
    defineField({
      name: 'backgroundImages',
      title: 'Background Images',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({
              name: 'image',
              title: 'Image',
              type: 'image',
              options: {
                hotspot: true,
              },
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'imageAlt',
              title: 'Image Alt Text',
              type: 'localeString',
              validation: (rule) => rule.required(),
            }),
          ],
          preview: {
            select: {
              title: 'imageAlt.hr',
              media: 'image',
            },
            prepare({ title, media }) {
              return {
                title: title,
                media: media,
              };
            },
          },
        },
      ],
    }),
  ],
  preview: {
    select: {
      title: 'title',
    },
    prepare({ title }) {
      return {
        title: title || 'Hero',
      };
    },
  },
});
