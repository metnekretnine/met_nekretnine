"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FileText, Plus, Send } from "lucide-react";
import type { AdminContract, ContractInput, ContractOwner } from "@/lib/epotpis/types";
import { api, createRequestId } from "@/lib/epotpis/browser";
import { normalizeOib, oibCheck } from "@/lib/epotpis/oib";
import { EPotpisLoader } from "../EPotpisLoader/EPotpisLoader";
import { EPotpisPdf } from "../EPotpisPdf/EPotpisPdf";
import { useEPotpisAdmin } from "../EPotpisAdmin/EPotpisAdmin";

const fields = {
  ownerSection: ["ownerName", "oib", "ownerAddress", "phone", "email", "signerName"],
  propertySection: ["propertyAddress", "descriptionField", "landRegistry", "rent", "deposit", "duration"],
  agreementSection: ["place", "date"],
} as const;
const coOwnerFields = fields.ownerSection.filter(name => name !== "email");
export function EPotpisCreate({ testSamples }: { testSamples: { single: ContractInput; joint: ContractInput } }) {
  const { paths, cms: c, hasSignature, busy, run, refresh, showCreated } = useEPotpisAdmin();
  const router = useRouter();
  const [hasCoOwner, setHasCoOwner] = useState(false);
  const [oibErrors, setOibErrors] = useState<Record<string, string>>({});
  const [previewUrl, setPreviewUrl] = useState("");
  const [previewReady, setPreviewReady] = useState(false);
  const [formInput, setFormInput] = useState<ContractInput | null>(null);
  const [defaults, setDefaults] = useState<Partial<ContractInput>>({});
  const [formVersion, setFormVersion] = useState(0);
  const idempotency = useRef("");
  useEffect(() => () => { if (previewUrl.startsWith("blob:")) URL.revokeObjectURL(previewUrl); }, [previewUrl]);
  async function fillTestData(joint: boolean) {
    await run(async () => {
      setDefaults(joint ? testSamples.joint : testSamples.single); setHasCoOwner(joint); setOibErrors({});
      setPreviewUrl(""); setFormInput(null); setPreviewReady(false); setFormVersion(value => value + 1);
    });
  }
  async function prepare(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const values = Object.fromEntries(new FormData(event.currentTarget));
    const oib = normalizeOib(String(values.oib));
    const coOwner = hasCoOwner ? Object.fromEntries(coOwnerFields.map(name => [name, String(values[`coOwner.${name}`] || "")])) as unknown as ContractOwner : undefined;
    if (coOwner) coOwner.oib = normalizeOib(coOwner.oib);
    if (!oibCheck(oib) || (coOwner && !oibCheck(coOwner.oib))) {
      setOibErrors({ oib: oibCheck(oib) ? "" : c.oibInvalid, "coOwner.oib": coOwner && !oibCheck(coOwner.oib) ? c.oibInvalid : "" }); return;
    }
    const primaryValues = Object.fromEntries(Object.entries(values).filter(([name]) => !name.startsWith("coOwner.")));
    const input = { ...primaryValues, oib, ...(coOwner ? { coOwner } : {}), consumer: values.consumer === "true", rent: Number(values.rent), deposit: Number(values.deposit) } as unknown as ContractInput;
    await run(async () => {
      const response = await fetch("/api/ugovori/preview", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(input) });
      if (!response.ok) throw new Error((await response.json()).error);
      setFormInput(input); idempotency.current = createRequestId(); setPreviewReady(false); setPreviewUrl(URL.createObjectURL(await response.blob()));
    });
  }
  async function send() {
    if (!previewReady) return;
    await run(async () => {
      const created = await api<AdminContract>("/api/ugovori/contracts", formInput, { "Idempotency-Key": idempotency.current });
      await refresh(); showCreated(created.signUrl); router.push(paths.home);
    });
  }
  function checkOibInput(input: HTMLInputElement, showError: boolean) {
    const invalid = Boolean(input.value) && !oibCheck(input.value);
    input.setCustomValidity(invalid ? c.oibInvalid : "");
    if (showError || !invalid) setOibErrors(current => ({ ...current, [input.name]: invalid ? c.oibInvalid : "" }));
  }
  function renderField(name: (typeof fields)[keyof typeof fields][number], prefix = "") {
    const fieldName = `${prefix}${name}`;
    const oibError = oibErrors[fieldName];
    const defaultValue = prefix ? defaults.coOwner?.[name as keyof ContractOwner] : defaults[name];
    const errorId = `ep-${fieldName.replace(".", "-")}-error`;
    return <label key={fieldName} className={`ep-field ${name === "descriptionField" || name === "landRegistry" ? "ep-wide" : ""}`}>{c[name]}
      {name === "descriptionField" || name === "landRegistry" ? <textarea defaultValue={defaultValue} name={fieldName} placeholder={c[`${name}Placeholder`]} required maxLength={name === "descriptionField" ? 500 : 300} rows={2} /> : <input name={fieldName} placeholder={c[`${name}Placeholder`]} required
        type={name === "email" ? "email" : name === "phone" ? "tel" : name === "date" ? "date" : name === "rent" || name === "deposit" ? "number" : "text"}
        inputMode={name === "oib" ? "numeric" : name === "phone" ? "tel" : undefined}
        minLength={name === "oib" ? 11 : undefined} pattern={name === "oib" ? "[0-9]{11}" : undefined}
        maxLength={name === "oib" ? 11 : name === "ownerName" || name === "signerName" || name === "duration" ? 120 : name === "phone" ? 40 : name === "place" ? 100 : 200}
        onBlur={name === "oib" ? e => checkOibInput(e.currentTarget, true) : undefined}
        onChange={name === "oib" ? e => checkOibInput(e.currentTarget, Boolean(oibError)) : undefined}
        onInvalid={name === "oib" ? e => checkOibInput(e.currentTarget, true) : undefined}
        aria-invalid={name === "oib" ? Boolean(oibError) : undefined} aria-describedby={name === "oib" && oibError ? errorId : undefined}
        min={name === "rent" ? 0.01 : name === "deposit" ? 0 : undefined} max={name === "rent" || name === "deposit" ? 9999999 : undefined} step={name === "rent" || name === "deposit" ? "0.01" : undefined}
        defaultValue={defaultValue ?? (name === "date" ? new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Zagreb" }).format(new Date()) : name === "place" ? "Zagreb" : undefined)} />}
      {name === "oib" && oibError && <span id={errorId} role="alert" className="ep-field-error">{oibError}</span>}
    </label>;
  }
  if (!hasSignature) return <section className="ep-panel"><p className="ep-section-description">{c.signatureRequired}</p><Link className="ep-secondary" href={paths.settings}>{c.settings}</Link></section>;
  return <>
        <form key={formVersion} onSubmit={prepare} className={previewUrl ? "ep-hidden" : "ep-create-form"}>
          <div className="ep-test-actions">
            <button type="button" className="ep-secondary" disabled={busy} onClick={() => void fillTestData(false)}>{c.fillTestSingle}</button>
            <button type="button" className="ep-secondary" disabled={busy} onClick={() => void fillTestData(true)}>{c.fillTestJoint}</button>
          </div>
          <section className="ep-panel"><label className="ep-field">{c.contractNumber}<input name="contractNumber" defaultValue={defaults.contractNumber} placeholder={c.contractNumberPlaceholder} required maxLength={40} /></label>
            <p className="ep-section-description">{c.contractNumberDescription}</p><h2>{c.contractType}</h2><div className="ep-type-options">
            <label><input type="radio" name="kind" value="open" defaultChecked={defaults.kind !== "exclusive"} required /><span>{c.open}</span></label>
            <label><input type="radio" name="kind" value="exclusive" defaultChecked={defaults.kind === "exclusive"} /><span>{c.exclusive}</span></label>
          </div></section>
          {Object.entries(fields).map(([section, names]) => <section className="ep-panel" key={section}><h2>{c[section as keyof typeof c]}</h2><div className="ep-form-grid">
            {names.map(name => renderField(name))}
            {section === "ownerSection" && <label className="ep-field">{c.consumer}<select name="consumer" defaultValue={String(defaults.consumer ?? true)}><option value="true">{c.yes}</option><option value="false">{c.no}</option></select></label>}
          </div>{section === "ownerSection" && <div className="ep-co-owner">
            {hasCoOwner ? <fieldset><legend>{c.coOwnerSection}</legend><p className="ep-section-description">{c.coOwnerDescription}</p>
              <div className="ep-form-grid">{coOwnerFields.map(name => renderField(name, "coOwner."))}</div>
              <button type="button" className="ep-text-button ep-danger-text" onClick={() => { setHasCoOwner(false); setDefaults(current => ({ ...current, coOwner: undefined })); setOibErrors(current => ({ ...current, "coOwner.oib": "" })); }}>{c.removeCoOwner}</button>
            </fieldset> : <button type="button" className="ep-secondary" onClick={() => setHasCoOwner(true)}><Plus size={16} />{c.addCoOwner}</button>}
          </div>}</section>)}
          <div className="ep-form-footer ep-align-end"><button className="ep-button" disabled={busy} aria-busy={busy}>{busy ? <EPotpisLoader variant="inline" label={c.loading} /> : <><FileText size={18} />{c.preview}</>}</button></div>
        </form>
        {previewUrl && <section className="ep-preview"><h2>{c.previewTitle}</h2><p className="ep-muted">{c.previewDescription}</p><EPotpisPdf cmsData={c} url={previewUrl} onReady={() => setPreviewReady(true)} />
          <div className="ep-form-footer"><button className="ep-secondary" disabled={busy} onClick={() => setPreviewUrl("")}>{c.back}</button><button className="ep-button" aria-busy={busy} disabled={busy || !previewReady} onClick={() => void send()}>{busy ? <EPotpisLoader variant="inline" label={c.saving} /> : <><Send size={17} />{c.send}</>}</button></div>
        </section>}
  </>;
}
