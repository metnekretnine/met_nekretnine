import createImageUrlBuilder from "@sanity/image-url";
import { SanityImageSource } from "@sanity/image-url/lib/types/types";

// https://www.sanity.io/docs/image-url
const builder = createImageUrlBuilder({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
});

export const urlFor = (source: SanityImageSource) => {
  // Quality 100 is added to url when fetching from sanity CDN, although
  // next.config.ts also has qualities: [100] defined which are prioritized by Next.js
  return builder.image(source).quality(100).auto("format").fit("max");
};
