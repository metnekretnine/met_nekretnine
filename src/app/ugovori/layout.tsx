import type { Metadata } from "next";
import { getEPotpisTexts } from "@/lib/epotpis/texts";
import "./ugovori.css";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const texts = await getEPotpisTexts("hr");
  return {
    title: texts.metaTitle,
    description: texts.metaDescription,
    robots: { index: false, follow: false, noarchive: true },
    referrer: "no-referrer",
  };
}

// Public signing is a sibling of (admin), so it never requires a Clerk session.
export default function ContractsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
