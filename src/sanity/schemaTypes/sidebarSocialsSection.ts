import { defineField, defineType } from 'sanity';

export const sidebarSocialsSection = defineType({
  name: 'sidebarSocialsSection',
  title: 'Sidebar Socials Displayer',
  type: 'document',
  fields: [
    defineField({
      name: 'phone',
      title: 'Phone Number',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'email',
      title: 'Email Address',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'facebook',
      title: 'Facebook URL',
      type: 'url',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'instagram',
      title: 'Instagram URL',
      type: 'url',
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    prepare() {
      return {
        title: "Sidebar Socials",
      };
    },
  },
});
