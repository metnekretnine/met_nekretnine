"use client";

// import { visionTool } from "@sanity/vision";
import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { presentationTool } from "sanity/presentation";
import { media } from "sanity-plugin-media";
import { googleMapsInput } from "@sanity/google-maps-input";

// Go to https://www.sanity.io/docs/api-versioning to learn how API versioning works
import { schema } from "./src/sanity/schemaTypes";
import { structure } from "./src/sanity/structure";

export default defineConfig({
  basePath: "/admin",
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  schema,
  plugins: [
    presentationTool({
      previewUrl: {
        previewMode: {
          enable: "/api/draft-mode/enable",
        },
      },
    }),
    structureTool({ structure }),
    media(),
    googleMapsInput({
      apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
      defaultLocation: {
        lat: 45.813,
        lng: 15.977,
      },
      defaultZoom: 13,
    }),
    // Temporarily hidden
    // visionTool({
    //   defaultApiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION,
    // }),
  ],
});
