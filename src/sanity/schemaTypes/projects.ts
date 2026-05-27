import { defineField, defineType } from "sanity";

export const projects = defineType({
  name: "projects",
  title: "Projects",
  type: "document",
  hidden: true,
  fieldsets: [
    {
      name: "projectsPage",
      title: "Projects Page",
      options: { collapsible: true, collapsed: false },
    },
    {
      name: "projectsSection",
      title: "Projects Displayer",
      options: { collapsible: true, collapsed: false },
    },
    {
      name: "projectDetailsPage",
      title: "Project Detail Page",
      options: { collapsible: true, collapsed: false },
    },
  ],
  fields: [
    defineField({
      name: "projectsPageTitle",
      title: "Projects Page Title",
      type: "localeString",
      validation: (rule) => rule.required(),
      fieldset: "projectsPage",
    }),
    defineField({
      name: "projectsPageDescription",
      title: "Projects Page Description",
      type: "localeRichText",
      validation: (rule) => rule.required(),
      fieldset: "projectsPage",
    }),
    defineField({
      name: "projectsPageImage",
      title: "Projects Page Image",
      type: "image",
      options: {
        hotspot: true,
      },
      validation: (rule) => rule.required(),
      fieldset: "projectsPage",
    }),
    defineField({
      name: "projectsPageImageAlt",
      title: "Projects Page Image Alt Text",
      type: "localeString",
      validation: (rule) => rule.required(),
      fieldset: "projectsPage",
    }),
    defineField({
      name: "projectsPageButtonText",
      title: "Projects Page Button Text",
      type: "localeString",
      fieldset: "projectsPage",
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: {
        source: "projectsPageTitle.hr",
        maxLength: 96,
      },
      validation: (rule) => rule.required(),
      fieldset: "projectDetailsPage",
    }),
    defineField({
      name: "metaTitle",
      title: "Meta Title",
      type: "localeString",
      fieldset: "projectDetailsPage",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "metaDescription",
      title: "Meta Description",
      type: "localeString",
      fieldset: "projectDetailsPage",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "metaOgImage",
      title: "Open Graph Image",
      type: "image",
      description:
        "Image displayed when the page is shared on social media platforms. Recommended dimensions: 1200×630 px.",
      fieldset: "projectDetailsPage",
    }),
    defineField({
      name: "heroBackgroundImage",
      title: "Hero Background Image",
      type: "image",
      options: { hotspot: true },
      fieldset: "projectDetailsPage",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "heroDescriptionText",
      title: "Hero Description Text",
      type: "localeString",
      description: "Displayed in the hero section below the title.",
      fieldset: "projectDetailsPage",
    }),
    defineField({
      name: "contentSections",
      title: "Content Sections",
      type: "array",
      fieldset: "projectDetailsPage",
      of: [{ type: "contentSection" }],
    }),
    defineField({
      name: "projectsSectionTitle",
      title: "Projects Title",
      type: "localeString",
      description: "If not defined, the default project title will be used.",
      fieldset: "projectsSection",
    }),
    defineField({
      name: "projectsSectionDescription",
      title: "Projects Description",
      type: "localeRichText",
      description:
        "If not defined, the default project description will be used.",
      fieldset: "projectsSection",
    }),
    defineField({
      name: "projectsSectionImage",
      title: "Projects Image",
      type: "image",
      options: {
        hotspot: true,
      },
      description: "If not defined, the default project image will be used.",
      fieldset: "projectsSection",
    }),
    defineField({
      name: "projectsSectionImageAlt",
      title: "Projects Image Alt Text",
      type: "localeString",
      description:
        "If not defined, the default project image alt text will be used.",
      fieldset: "projectsSection",
    }),
    defineField({
      name: "projectsSectionButtonText",
      title: "Projects Button Text",
      type: "localeString",
      description: "Required",
      fieldset: "projectsSection",
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: {
      title: "projectsPageTitle.hr",
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
