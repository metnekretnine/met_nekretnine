import Link from "next/link";
import { getEPotpisTexts } from "@/lib/epotpis/texts";

export default async function ContractNotFound() {
  const { app: c } = await getEPotpisTexts("hr");
  return <div className="ep-root"><main className="ep-signer-main"><section className="ep-panel">
    <h1>{c.invalidTitle}</h1><p>{c.invalidDescription}</p><Link className="ep-button" href="/ugovori">{c.back}</Link>
  </section></main></div>;
}
