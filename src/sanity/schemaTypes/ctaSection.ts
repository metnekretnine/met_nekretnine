import { defineField, defineType } from 'sanity';

export const ctaSection = defineType({
  name: 'ctaSection',
  title: 'Call To Action Section',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'localeString',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'phoneText',
      title: 'Phone CTA Text',
      type: 'localeString',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'phoneHref',
      title: 'Phone CTA Href',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'whatsappText',
      title: 'WhatsApp CTA Text',
      type: 'localeString',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'whatsappHref',
      title: 'WhatsApp CTA Href',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    prepare() {
      return {
        title: "Call To Action Section",
      };
    },
  },
});
