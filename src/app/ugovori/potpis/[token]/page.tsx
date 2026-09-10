import { getLang } from "@/lib/utils";
import { getEPotpisTexts } from "@/lib/epotpis/texts";
import { EPotpisSigner } from "@/components/EPotpisSigner/EPotpisSigner";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export default async function SignPage({ params }: { params: Promise<{ token: string }> }) {
  const lang = await getLang();
  const [cms, { token }] = await Promise.all([getEPotpisTexts(lang), params]);
  return <EPotpisSigner cmsData={cms.app} token={token} />;
}
