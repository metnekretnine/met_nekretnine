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
      name: "learnMoreLinkText",
      title: "Learn More Link Text",
      type: "localeString",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "acceptButtonText",
      title: "Accept Button Text",
      type: "localeString",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "settingsButtonText",
      title: "Settings Button Text",
      type: "localeString",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "saveSettingsButtonText",
      title: "Save Settings Button Text",
      type: "localeString",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "necessaryCookiesLabel",
      title: "Necessary Cookies Label",
      type: "localeString",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "necessaryCookiesDescription",
      title: "Necessary Cookies Description",
      type: "localeString",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "analyticsCookiesLabel",
      title: "Analytics Cookies Label",
      type: "localeString",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "analyticsCookiesDescription",
      title: "Analytics Cookies Description",
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
