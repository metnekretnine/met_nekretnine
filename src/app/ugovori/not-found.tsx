import { headers } from "next/headers";
import { contractPaths } from "@/lib/epotpis/routes";
import Link from "next/link";
import { getEPotpisTexts } from "@/lib/epotpis/texts";

export default async function ContractNotFound() {
  const paths = contractPaths((await headers()).get("host") || "");
  const { app: c } = await getEPotpisTexts("hr");
  return <div className="ep-root"><main className="ep-signer-main"><section className="ep-panel">
    <h1>{c.invalidTitle}</h1><p>{c.invalidDescription}</p><Link className="ep-button" href={paths.home}>{c.back}</Link>
  </section></main></div>;
}
