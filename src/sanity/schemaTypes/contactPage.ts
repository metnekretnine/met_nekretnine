import { defineField, defineType } from "sanity";

export const contactPage = defineType({
  name: "contactPage",
  title: "Contact Page",
  type: "document",
  fieldsets: [
    {
      name: "heroSection",
      title: "Hero Section",
      options: { collapsible: true, collapsed: false },
    },
    {
      name: "seo",
      title: "SEO",
      options: { collapsible: true, collapsed: false },
    },
  ],
  fields: [
    defineField({
      name: "heroTitle",
      title: "Hero Title",
      type: "localeString",
      fieldset: "heroSection",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "heroDescriptionText",
      title: "Hero Description Text", 
      type: "localeString",
      fieldset: "heroSection",
    }),
    defineField({
      name: "heroBackgroundImage",
      title: "Hero Background Image",
      type: "image",
      options: {
        hotspot: true,
      },
      fieldset: "heroSection",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "heroBackgroundImageAlt",
      title: "Hero Background Image Alt",
      type: "localeString",
      fieldset: "heroSection",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "findUsTitle",
      title: "Find Us Title",
      type: "localeString",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "companyNameLabel",
      title: "Company Name Label",
      type: "localeString",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "companyNameValue",
      title: "Company Name Value",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "companyNameSubValue",
      title: "Company Name SubValue",
      type: "localeString",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "companyAddressLabel",
      title: "Company Address Label",
      type: "localeString",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "companyAddressValue",
      title: "Company Address Value",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "companyAddressSubValue",
      title: "Company Address SubValue",
      type: "localeString",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "companyPhoneLabel",
      title: "Company Phone Label",
      type: "localeString",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "companyPhoneValue",
      title: "Company Phone Value",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "companyEmailLabel",
      title: "Company Email Label",
      type: "localeString",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "companyEmailValue",
      title: "Company Email Value",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "instagramLabel",
      title: "Instagram Label",
      type: "localeString",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "instagramHref",
      title: "Instagram Href",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "linkedinLabel",
      title: "LinkedIn Label",
      type: "localeString",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "linkedinHref",
      title: "LinkedIn Href",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "infoLabel",
      title: "Info Label (e.g. OIB / MBS)",
      type: "localeString",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "infoValue",
      title: "Info Value (e.g. OIB number)",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "infoSubValue",
      title: "Info SubValue (e.g. MBS number)",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "sendInquiryTitle",
      title: "Send Inquiry Title",
      type: "localeString",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "metaTitle",
      title: "Meta Title",
      type: "localeString",
      fieldset: "seo",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "metaDescription",
      title: "Meta Description",
      type: "localeString",
      fieldset: "seo",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "metaOgImage",
      title: "Open Graph Image",
      type: "image",
      description:
        "Image displayed when the page is shared on social media platforms. Recommended dimensions: 1200×630 px.",
      fieldset: "seo",
    }),
    defineField({
      name: "meetingButtonText",
      title: "Meeting Button Text",
      type: "localeString",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "meetingButtonLink",
      title: "Meeting Button Link",
      type: "string",
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    prepare() {
      return {
        title: "Contact Page",
      };
    },
  },
});
