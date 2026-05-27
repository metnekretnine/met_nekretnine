import { defineType, defineField } from 'sanity';
import { SUPPORTED_LANGUAGES } from '../../lib/constants';

export const localeString = defineType({
  name: 'localeString',
  title: 'Localized string',
  type: 'object',
  fields: SUPPORTED_LANGUAGES.map((lang) =>
    defineField({
      name: lang.id,
      title: lang.title,
      type: 'string',
    })
  ),
});
