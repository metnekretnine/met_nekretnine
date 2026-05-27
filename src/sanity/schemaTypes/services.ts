import { defineField, defineType } from "sanity";

export const services = defineType({
  name: "services",
  title: "Services",
  type: "document",
  fieldsets: [
    {
      name: "servicesPage",
      title: "Services Page",
      options: { collapsible: true, collapsed: false },
    },
    {
      name: "servicesSection",
      title: "Services Displayer",
      options: { collapsible: true, collapsed: false },
    },
    {
      name: "serviceDetailsPage",
      title: "Service Detail Page",
      options: { collapsible: true, collapsed: false },
    },
  ],
  fields: [
    defineField({
      name: "servicesPageTitle",
      title: "Services Page Title",
      type: "localeString",
      validation: (rule) => rule.required(),
      fieldset: "servicesPage",
    }),
    defineField({
      name: "servicesPageDescription",
      title: "Services Page Description",
      type: "localeRichText",
      validation: (rule) => rule.required(),
      fieldset: "servicesPage",
    }),
    defineField({
      name: "servicesPageImage",
      title: "Services Page Image",
      type: "image",
      options: {
        hotspot: true,
      },
      validation: (rule) => rule.required(),
      fieldset: "servicesPage",
    }),
    defineField({
      name: "servicesPageImageAlt",
      title: "Services Page Image Alt Text",
      type: "localeString",
      validation: (rule) => rule.required(),
      fieldset: "servicesPage",
    }),
    defineField({
      name: "servicesPageButtonText",
      title: "Services Page Button Text",
      type: "localeString",
      fieldset: "servicesPage",
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: {
        source: "servicesPageTitle.hr",
        maxLength: 96,
      },
      validation: (rule) => rule.required(),
      fieldset: "serviceDetailsPage",
    }),
    defineField({
      name: "metaTitle",
      title: "Meta Title",
      type: "localeString",
      fieldset: "serviceDetailsPage",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "metaDescription",
      title: "Meta Description",
      type: "localeString",
      fieldset: "serviceDetailsPage",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "metaOgImage",
      title: "Open Graph Image",
      type: "image",
      description:
        "Image displayed when the page is shared on social media platforms. Recommended dimensions: 1200×630 px.",
      fieldset: "serviceDetailsPage",
    }),
    defineField({
      name: "heroBackgroundImage",
      title: "Hero Background Image",
      type: "image",
      options: { hotspot: true },
      fieldset: "serviceDetailsPage",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "heroDescriptionText",
      title: "Hero Description Text",
      type: "localeString",
      description: "Displayed in the hero section below the title.",
      fieldset: "serviceDetailsPage",
    }),
    defineField({
      name: "contentSections",
      title: "Content Sections",
      type: "array",
      fieldset: "serviceDetailsPage",
      of: [{ type: "contentSection" }],
    }),
    defineField({
      name: "servicesSectionTitle",
      title: "Services Title",
      type: "localeString",
      description: "If not defined, the default service title will be used.",
      fieldset: "servicesSection",
    }),
    defineField({
      name: "servicesSectionDescription",
      title: "Services Description",
      type: "localeRichText",
      description:
        "If not defined, the default service description will be used.",
      fieldset: "servicesSection",
    }),
    defineField({
      name: "servicesSectionImage",
      title: "Services Image",
      type: "image",
      options: {
        hotspot: true,
      },
      description: "If not defined, the default service image will be used.",
      fieldset: "servicesSection",
    }),
    defineField({
      name: "servicesSectionImageAlt",
      title: "Services Image Alt Text",
      type: "localeString",
      description:
        "If not defined, the default service image alt text will be used.",
      fieldset: "servicesSection",
    }),
    defineField({
      name: "servicesSectionButtonText",
      title: "Services Button Text",
      type: "localeString",
      description: "Required",
      fieldset: "servicesSection",
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: {
      title: "servicesPageTitle.hr",
      slug: "slug.current",
    },
    prepare({ title, slug }) {
      return {
        title: title,
        subtitle: slug ? `/${slug}` : "",
      };
    },
  },
});
