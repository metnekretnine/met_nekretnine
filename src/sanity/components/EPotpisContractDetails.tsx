"use client";

import { useEffect, useState, type ReactNode } from "react";
import type { ObjectInputProps } from "sanity";
import type { ContractRow, ContractSnapshot } from "@/lib/epotpis/types";

export const contractStatusLabels: Record<string, string> = {
  preparing: "Izrada u tijeku", sent: "Poslan na potpis", signed: "Potpisan",
  revoked: "Link povučen", failed: "Izrada nije uspjela", expired: "Link istekao", deleted: "Obrisan",
};
export function readContract(payload: unknown) {
  if (typeof payload !== "string") throw new Error("Missing payload");
  const row = JSON.parse(payload) as ContractRow;
  const snapshot = JSON.parse(row.snapshot) as ContractSnapshot;
  if (!snapshot.input || !snapshot.number) throw new Error("Missing snapshot");
  return { row, snapshot };
}
function contractDate(value?: string) {
  if (!value) return "—";
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  return match ? `${match[3]}. ${match[2]}. ${match[1]}.` : value;
}
function date(value?: string | null) {
  if (!value) return "—";
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? value : parsed.toLocaleString("hr-HR", { timeZone: "Europe/Zagreb" });
}
const linkStyle = { display: "inline-block", padding: "12px 16px", border: "1px solid currentColor", borderRadius: 6, color: "inherit", fontWeight: 600, textDecoration: "none" };
function PdfDownload({ content, name, children }: { content: string; name: string; children: ReactNode }) {
  const [url, setUrl] = useState("");
  const [error, setError] = useState(false);
  useEffect(() => {
    setError(false); setUrl("");
    let objectUrl = "";
    try {
      const bytes = Uint8Array.from(atob(content), character => character.charCodeAt(0));
      if (String.fromCharCode(...bytes.slice(0, 5)) !== "%PDF-") throw new Error("Invalid PDF");
      objectUrl = URL.createObjectURL(new Blob([bytes], { type: "application/pdf" }));
      setUrl(objectUrl);
    } catch { setError(true); }
    return () => { if (objectUrl) URL.revokeObjectURL(objectUrl); };
  }, [content]);
  if (error) return <p role="alert">Spremljeni PDF nije moguće pročitati.</p>;
  return url ? <a href={url} download={name} style={linkStyle}>{children}</a> : <span>Priprema preuzimanja…</span>;
}
function Details({ values }: { values: [string, ReactNode][] }) {
  return <dl style={{ margin: 0, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: 20 }}>
    {values.map(([label, value]) => <div key={label} style={{ minWidth: 0 }}><dt style={{ fontSize: 12, opacity: .65, marginBottom: 6 }}>{label}</dt><dd style={{ margin: 0, overflowWrap: "anywhere", whiteSpace: "pre-wrap" }}>{value === undefined || value === null || value === "" ? "—" : value}</dd></div>)}
  </dl>;
}
function Section({ title, children }: { title: string; children: ReactNode }) {
  return <section style={{ padding: "24px 0", borderBottom: "1px solid #80808040" }}><h3 style={{ fontSize: 16, margin: "0 0 20px" }}>{title}</h3>{children}</section>;
}
export function ContractDetails({ payload }: { payload: unknown }) {
  let data: ReturnType<typeof readContract>;
  try { data = readContract(payload); } catch {
    return <p role="alert">Podaci ovog ugovora nisu potpuni ili ih nije moguće pročitati. Zapis nije izmijenjen.</p>;
  }
  const { row, snapshot } = data;
  const input = snapshot.input;
  const status = row.status === "sent" && Date.parse(snapshot.expiresAt) < Date.now() ? "expired" : row.status;
  const filename = `MET-${snapshot.number.replace(/[^\p{L}\p{N}._-]+/gu, "-")}`;
  const people = [input, ...(input.coOwner ? [input.coOwner] : [])];
  return <div style={{ padding: "0 8px", lineHeight: 1.5 }}>
    <Section title={`Ugovor ${snapshot.number}`}><Details values={[
      ["Status ugovora", contractStatusLabels[status] || status],
      ["Vrsta posredovanja", input.kind === "exclusive" ? "Isključivo posredovanje" : "Otvoreno posredovanje"],
      ["Izrađen", date(snapshot.createdAt)], ["Potpisan", date(row.signed_at)],
      ["Datum ugovora", contractDate(input.date)], ["Mjesto sklapanja", input.place],
    ]} /></Section>
    <Section title="Spremljeni dokumenti">
      <p style={{ opacity: .75 }}>Preuzimaju se izvorno spremljene kopije iz Sanityja. Preuzimanje ne ovisi o sučelju za potpisivanje i ne izrađuje novi PDF.</p>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", paddingTop: 16, paddingBottom: 8 }}>
        {row.final_pdf && <PdfDownload content={row.final_pdf} name={`${filename}-potpisan.pdf`}>Preuzmi potpisani PDF</PdfDownload>}
        {row.pdf && <PdfDownload content={row.pdf} name={`${filename}-poslan.pdf`}>Preuzmi PDF prije potpisa</PdfDownload>}
        {!row.final_pdf && !row.pdf && <p>PDF još nije spremljen za ovaj ugovor.</p>}
      </div>
    </Section>
    {people.map((person, index) => <Section key={index} title={`Nalogodavac ${index + 1}`}><Details values={[
      ["Ime i prezime / naziv", person.ownerName], ["OIB", person.oib], ["Adresa", person.ownerAddress],
      ["Telefon", person.phone], ...(index === 0 ? [["Email za dostavu", input.email] as [string, ReactNode]] : []),
      ["Ime / funkcija uz potpis", person.signerName],
    ]} /></Section>)}
    <Section title="Nekretnina i najam"><Details values={[
      ["Adresa nekretnine", input.propertyAddress], ["Opis", input.descriptionField], ["ZK podaci", input.landRegistry],
      ["Mjesečna najamnina", `${input.rent} EUR`], ["Polog", `${input.deposit} EUR`], ["Trajanje najma", input.duration],
      ["Nalogodavac je potrošač", input.consumer ? "Da" : "Ne"],
    ]} /></Section>
    <details style={{ marginTop: 24 }}><summary style={{ cursor: "pointer" }}>Podaci za provjeru dokumenta</summary><div style={{ paddingTop: 20 }}><Details values={[
      ["ID ugovora", row.id], ["Verzija predloška", snapshot.template?.version],
      ["Link vrijedi do", date(snapshot.expiresAt)], ["SHA-256 prije potpisa", row.document_hash], ["SHA-256 potpisanog PDF-a", row.final_hash],
    ]} /></div></details>
  </div>;
}
export function EPotpisContractDetails(props: ObjectInputProps) {
  if (props.value?.kind !== "contract") return props.renderDefault(props);
  return <ContractDetails payload={props.value.payload} />;
}
