import { config } from "dotenv";
import { cleanEnv, str } from "envalid";
import { resolve } from "path";

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), ".env.local"), quiet: true });

// IMPORTANT: Environment variable validation behavior:
// - Without `default: undefined`: the variable MUST exist in .env, but can be empty (e.g., NODE_ENV= or NODE_ENV="") — empty values won't throw an error, only a completely missing variable will.
// - With `default: undefined`: the variable doesn't need to be defined at all — if it's missing, it silently defaults to undefined instead of throwing an error.
const env = cleanEnv(process.env, {
  NODE_ENV: str({
    choices: ["development", "production", "test"], //test is set by Jest automatically
  }),
  NEXT_PUBLIC_SANITY_PROJECT_ID: str({
    desc: 'Sanity Project ID (e.g. "abcde123")',
  }),
  NEXT_PUBLIC_SANITY_DATASET: str({
    desc: 'Sanity Dataset (e.g. "production")',
  }),
  NEXT_PUBLIC_SANITY_API_VERSION: str({
    desc: 'Sanity API Version (e.g. "v2025-03-04")',
  }),
  RESEND_API_KEY: str({
    desc: "Resend API Key",
  }),
  NEXT_PUBLIC_BASE_URL_DEV: str({
    desc: "Development Base URL for the application (must be 'http://localhost:3000')",
    choices: ["http://localhost:3000"], // Enforce that the port cna be only 3000
  }),
  NEXT_PUBLIC_BASE_URL_PROD: str({
    desc: "Production Base URL for the application (e.g., 'https://template.hr')",
  }),
  NEXT_PUBLIC_IS_MAINTENANCE_MODE: str({
    desc: "Is Maintenance Mode Enabled (e.g., 'true' or 'false')",
    choices: ["true", "false"],
  }),
  SANITY_API_READ_TOKEN: str({
    desc: "Sanity API Read Token",
  }),
  SANITY_API_WRITE_TOKEN: str({
    desc: "Sanity API Write Token",
  }),
  SANITY_WEBHOOK_SECRET: str({
    desc: "Sanity Webhook Secret",
  }),
  NEXT_PUBLIC_GOOGLE_ANALYTICS_ID: str({
    desc: "Google Analytics Tracking ID (e.g., 'G-XXXXXXXXXX')",
    default: undefined, //allow undefined if not using Google Analytics
  }),
  NEXT_PUBLIC_META_PIXEL_ID: str({
    desc: "Meta Pixel ID (e.g., '1234567890')",
    default: undefined, //allow undefined if not using Meta Pixel
  }),
  NEXT_PUBLIC_MICROSOFT_CLARITY_ID: str({
    desc: "Microsoft Clarity Project ID (e.g., 'abcdefg')",
    default: undefined, //allow undefined if not using Microsoft Clarity
  }),
  NEXT_PUBLIC_HUBSPOT_CHATBOT_ID: str({
    desc: "HubSpot Chatbot ID (e.g., '1234567')",
    default: undefined, //allow undefined if not using HubSpot Chatbot
  }),
  NEXT_PUBLIC_CONTACT_FORM_RECIPIENT_EMAIL: str({
    desc: "Email address for contact form submissions (e.g., 'info@example.com')",
  }),
  NEXT_PUBLIC_CONTACT_FORM_SENDER_EMAIL: str({
    desc: "Email address for contact form submissions (e.g., 'onboarding@resend.dev')",
  }),
});

export function getBaseUrl(): string {
  return env.NODE_ENV === "production"
    ? env.NEXT_PUBLIC_BASE_URL_PROD
    : env.NEXT_PUBLIC_BASE_URL_DEV;
}

export default env;
