import { defineField, defineType } from 'sanity';

export const notificationBarSection = defineType({
  name: 'notificationBarSection',
  title: 'Notification Bar',
  type: 'document',
  fields: [
    defineField({
      name: 'isEnabled',
      title: 'Is Enabled',
      type: 'boolean',
      description: 'Whether the notification bar is enabled or not.',
      initialValue: false,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'message',
      title: 'Message',
      type: 'localeString',
      description: 'The message to display in the notification bar.',
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    prepare() {
      return {
        title: "Notification Bar",
      };
    },
  },
});
