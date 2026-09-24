import { defineType, defineField } from 'sanity';
import { SUPPORTED_LANGUAGES } from '../../lib/constants'; // Re-use supportedLanguages

const defineLocaleRichText = (name: string, extraBlocks: { type: string }[] = []) =>
  defineType({
    name,
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
            type: 'table',
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
          ...extraBlocks,
        ],
      })
    ),
  });

export const localeRichText = defineLocaleRichText('localeRichText');

// Only the terms page embeds the price list, so other rich text fields do not offer it.
export const termsRichText = defineLocaleRichText('termsRichText', [
  { type: 'priceListTable' },
]);
