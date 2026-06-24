import { client } from "./client";
import env from "@/config/env";

export const writeClient = client.withConfig({
  token: env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
});
