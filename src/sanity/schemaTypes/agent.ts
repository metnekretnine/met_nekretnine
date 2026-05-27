import { defineField, defineType } from "sanity";
import { UserIcon } from "@sanity/icons";

export const agent = defineType({
  name: "agent",
  title: "Agent",
  type: "document",
  icon: UserIcon,
  fields: [
    defineField({
      name: "name",
      title: "Ime i prezime",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "image",
      title: "Slika",
      type: "image",
      options: { hotspot: true },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "position",
      title: "Pozicija",
      type: "localeString",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "email",
      title: "Email",
      type: "string",
    }),
    defineField({
      name: "phone",
      title: "Telefon",
      type: "string",
    }),
    defineField({
      name: "role",
      title: "Uloga",
      type: "string",
      options: {
        list: [{ title: "Agent", value: "agent" }],
        layout: "radio",
      },
      initialValue: "agent",
      validation: (rule) => rule.required(),
    }),
  ],
});
