"use client";
import { useEffect, useRef, useState } from "react";
import { Check, ArrowDownToLine, PenLine } from "lucide-react";
import type { EPotpisTexts } from "@/lib/epotpis/texts";
import type { PublicContract, Signature } from "@/lib/epotpis/types";
import { EPotpisSignature } from "../EPotpisSignature/EPotpisSignature";
import { EPotpisPdf } from "../EPotpisPdf/EPotpisPdf";
import { api } from "@/lib/epotpis/browser";
import { LogoCompany as EPotpisLogo } from "@/components/Icons/LogoCompany";
import { EPotpisLoader } from "../EPotpisLoader/EPotpisLoader";
import { EPotpisSignaturePreview } from "../EPotpisSignaturePreview/EPotpisSignaturePreview";
import { signatureHasInk } from "@/lib/epotpis/signature-geometry";

interface Props { cmsData: EPotpisTexts; token: string }
export function EPotpisSigner({ cmsData: c, token }: Props) {
  const [contract, setContract] = useState<PublicContract | null>(null);
  const [loading, setLoading] = useState(true);
  const [invalid, setInvalid] = useState(false);
  const [signatures, setSignatures] = useState<(Signature | null)[]>([]);
  const [draft, setDraft] = useState<Signature | null>(null);
  const [editing, setEditing] = useState<number | null>(0);
  const focusCapture = useRef(false);
  const captureHeading = useRef<HTMLHeadingElement>(null);
  const reviewHeading = useRef<HTMLParagraphElement>(null);
  const [consent, setConsent] = useState(false);
  const [consumerConsent, setConsumerConsent] = useState(false);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const path = `/api/ugovori/sign/${encodeURIComponent(token)}`;
  useEffect(() => { void api<PublicContract>(path).then(data => {
    setContract(data); setSignatures((data.signers || [data.ownerName]).map(() => null)); setDraft(null); setEditing(0);
  }).catch(() => setInvalid(true)).finally(() => setLoading(false)); }, [path]);
  useEffect(() => {
    if (!focusCapture.current) return;
    (editing === null ? reviewHeading.current : captureHeading.current)?.focus(); focusCapture.current = false;
  }, [editing]);
  const names = contract?.signers || (contract ? [contract.ownerName] : []);
  const signatureTitle = (name: string) => c.signatureFor.replace("{name}", name);
  const complete = signatures.length === names.length && signatures.length > 0 && signatures.every(signatureHasInk);
  function acceptSignature() {
    if (editing === null || !signatureHasInk(draft)) { setError(c.signatureRequired); return; }
    const saved = signatures.map((item, index) => index === editing ? draft : item);
    setSignatures(saved); setDraft(null); setError(""); focusCapture.current = true;
    const next = saved.findIndex(item => !item); setEditing(next === -1 ? null : next);
  }
  function editSignature(index: number) {
    setDraft(signatures[index]); setEditing(index); setError(""); focusCapture.current = true;
  }
  async function sign() {
    if (!complete || editing !== null) { setError(c.signatureRequired); return; }
    if (!consent || (contract?.consumer && !consumerConsent)) { setError(c.consentRequired); return; }
    if (!ready) { setError(c.reviewRequired); return; }
    setBusy(true); setError("");
    try { setContract(await api<PublicContract>(path, { signatures, consent, consumerConsent, documentHash: contract?.documentHash })); }
    catch (e) { const key = e instanceof Error ? e.message : "error"; setError(c[key as keyof typeof c] || c.error); }
    finally { setBusy(false); }
  }
  const signed = contract?.status === "signed";
  return <div className="ep-root"><header className="ep-header"><a href="#" className="ep-brand"><EPotpisLogo aria-label={c.brand} /></a></header>
    <main className="ep-signer-main">
      {loading ? <EPotpisLoader label={c.loading} /> : invalid ? <div className="ep-panel ep-success"><h1>{c.invalidTitle}</h1><p>{c.invalidDescription}</p></div> : contract && <>
        <div className="ep-sign-intro"><span className={`ep-round-icon ${signed ? "is-signed" : ""}`}>{signed ? <Check /> : <PenLine />}</span>
          <p className="ep-eyebrow">{contract.number} · {contract.kind === "open" ? c.open : c.exclusive}</p>
          <h1>{signed ? c.signedTitle : c.signTitle}</h1><p>{signed ? c.signedDescription : c.signDescription}</p>
        </div>
        <div className="ep-contract-summary"><strong>{contract.ownerName}</strong><span>{contract.propertyAddress}</span></div>
        {signed && <div className="ep-panel ep-success"><p>{c.signedAt}: {new Date(contract.signedAt!).toLocaleString("hr-HR", { timeZone: "Europe/Zagreb" })}</p>
          <a className="ep-button" href={`${path}/pdf?download=1`}><ArrowDownToLine size={18} />{c.download}</a>
        </div>}
        <EPotpisPdf key={contract.status} cmsData={c} url={`${path}/pdf`} onReady={() => setReady(true)} />
        {!signed && <section className="ep-panel ep-sign-form"><h2>{c.drawSignature}</h2>
          {(names.length > 1 || complete) && <div className="ep-signer-cards">
            {names.map((name, index) => <div key={index} className={`ep-signer-card ${editing === index ? "is-active" : ""}`}>
              <strong>{name}</strong><span className="ep-signature-status">{signatures[index] ? <><Check size={14} />{c.signatureReady}</> : c.signaturePending}</span>
              {signatures[index] && <><EPotpisSignaturePreview signature={signatures[index]!} label={signatureTitle(name)} />
                <button type="button" className="ep-text-button" disabled={busy || editing !== null} onClick={() => editSignature(index)}>{c.editSignature}</button></>}
            </div>)}
          </div>}
          {editing !== null && <div className="ep-signature-capture">
            <p className="ep-eyebrow">{c.signatureStep.replace("{current}", String(editing + 1)).replace("{total}", String(names.length))}</p>
            <h3 ref={captureHeading} tabIndex={-1}>{signatureTitle(names[editing])}</h3>
            <EPotpisSignature key={editing} cmsData={c} initialValue={signatures[editing]} label={signatureTitle(names[editing])}
              disabled={busy || !ready} onChange={value => { setDraft(value); setError(""); }} onConfirm={acceptSignature} confirmDisabled={!signatureHasInk(draft)} />
            {signatures[editing] && <button type="button" className="ep-text-button" disabled={busy} onClick={() => { setDraft(null); focusCapture.current = true; setEditing(null); }}>{c.cancel}</button>}
          </div>}
          {complete && editing === null && <p className="ep-signature-review" ref={reviewHeading} tabIndex={-1}>{c.signatureReview}</p>}
          <label className="ep-check"><input type="checkbox" disabled={busy} checked={consent} onChange={e => setConsent(e.target.checked)} />{c.consent}</label>
          {contract.consumer && <label className="ep-check"><input type="checkbox" disabled={busy} checked={consumerConsent} onChange={e => setConsumerConsent(e.target.checked)} />{c.consumerConsent}</label>}
          {error && <p role="alert" className="ep-error">{error}</p>}
          <button className="ep-button ep-sign-button" aria-busy={busy} disabled={busy || !ready || !complete || editing !== null} onClick={() => void sign()}>{busy ? <EPotpisLoader variant="inline" label={c.signing} /> : <><PenLine size={18} />{c.signAction}</>}</button>
        </section>}
      </>}
    </main>
  </div>;
}
