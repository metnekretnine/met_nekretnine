import { defineField, defineType } from 'sanity';

export const configurationSection = defineType({
  name: 'configurationSection',
  title: 'Configuration',
  type: 'document',
  fields: [
    defineField({
      name: 'isWhatsAppEnabled',
      title: 'Is WhatsApp Button Enabled',
      type: 'boolean',
      initialValue: true,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'isHubSpotEnabled',
      title: 'Is HubSpot Chatbot Enabled',
      type: 'boolean',
      initialValue: true,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'isBackToTopButtonEnabled',
      title: 'Is Back To Top Button Enabled',
      type: 'boolean',
      initialValue: true,
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    prepare() {
      return {
        title: "Configuration",
      };
    },
  },
});
