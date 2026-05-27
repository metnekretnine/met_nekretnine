import { defineField, defineType } from 'sanity';

export const contactFormSection = defineType({
  name: 'contactFormSection',
  title: 'Contact Form',
  type: 'document',
  fields: [
    defineField({
      name: 'nameLabel',
      title: 'Name Label',
      type: 'localeString',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'namePlaceholder',
      title: 'Name Placeholder',
      type: 'localeString',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'nameRequiredError',
      title: 'Name Required Error',
      type: 'localeString',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'emailLabel',
      title: 'Email Label',
      type: 'localeString',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'emailPlaceholder',
      title: 'Email Placeholder',
      type: 'localeString',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'emailRequiredError',
      title: 'Email Required Error',
      type: 'localeString',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'emailInvalidError',
      title: 'Email Invalid Error',
      type: 'localeString',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'phoneLabel',
      title: 'Phone Label',
      type: 'localeString',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'phonePlaceholder',
      title: 'Phone Placeholder',
      type: 'localeString',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'messageLabel',
      title: 'Message Label',
      type: 'localeString',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'messagePlaceholder',
      title: 'Message Placeholder',
      type: 'localeString',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'messageRequiredError',
      title: 'Message Required Error',
      type: 'localeString',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'sendButtonText',
      title: 'Send Button Text',
      type: 'localeString',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'sendingButtonText',
      title: 'Sending Button Text',
      type: 'localeString',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'successMessage',
      title: 'Success Message',
      type: 'localeString',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'errorMessage',
      title: 'Error Message',
      type: 'localeString',
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    prepare() {
      return {
        title: "Contact Form",
      };
    },
  },
});
