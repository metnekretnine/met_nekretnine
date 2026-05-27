import { defineField, defineType } from 'sanity';

export const whatsAppButtonSection = defineType({
  name: 'whatsAppButtonSection',
  title: 'WhatsApp Button',
  type: 'document',
  fields: [
    defineField({
      name: 'whatsappNumber',
      title: 'WhatsApp Number',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'whatsappMessage',
      title: 'WhatsApp Message',
      type: 'localeString',
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    prepare() {
      return {
        title: "WhatsApp Button",
      };
    },
  },
});
