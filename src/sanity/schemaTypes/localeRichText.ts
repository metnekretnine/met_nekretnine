import { defineType, defineField } from 'sanity';
import { SUPPORTED_LANGUAGES } from '../../lib/constants'; // Re-use supportedLanguages

export const localeRichText = defineType({
  name: 'localeRichText',
  title: 'Localized Rich Text',
  type: 'object',
  fields: SUPPORTED_LANGUAGES.map((lang) =>
    defineField({
      name: lang.id,
      title: lang.title,
      type: 'array',
      of: [
        {
          type: 'block',
        },
        {
          type: 'image',
          fields: [
            {
              name: 'alt',
              title: 'Alternative text',
              type: 'string',
            },
            {
              name: 'caption',
              type: 'string',
              title: 'Caption',
              description: 'Optional caption for the image.',
            },
          ],
        },
      ],
    })
  ),
});
