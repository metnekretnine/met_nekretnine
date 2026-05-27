import { defineField, defineType } from "sanity";

export const cookieConsentSection = defineType({
  name: "cookieConsentSection",
  title: "Cookie Consent",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "localeString",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "localeString",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "agreementText",
      title: "Agreement Text",
      type: "localeString",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "learnMoreLinkText",
      title: "Learn More Link Text",
      type: "localeString",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "declineButtonText",
      title: "Decline Button Text",
      type: "localeString",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "acceptButtonText",
      title: "Accept Button Text",
      type: "localeString",
      validation: (rule) => rule.required(),
    }),
  ],

  preview: {
    prepare() {
      return {
        title: "Cookie Consent",
      };
    },
  },
});
