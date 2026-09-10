"use client";
import { useRef, useState } from "react";
import { Check, Copy, Download, ExternalLink, FileText, Search, Send, Trash2 } from "lucide-react";
import type { AdminContract } from "@/lib/epotpis/types";
import { api } from "@/lib/epotpis/browser";
import { EPotpisLoader } from "../EPotpisLoader/EPotpisLoader";
import { EPotpisDeleteDialog } from "../EPotpisDeleteDialog/EPotpisDeleteDialog";
import { useEPotpisAdmin } from "../EPotpisAdmin/EPotpisAdmin";

export function EPotpisContracts() {
  const { cms: c, contracts, busy, run, refresh, setNotice, setError, createdLink, setCreatedLink, copy } = useEPotpisAdmin();
  const [working, setWorking] = useState("");
  async function runFor(key: string, action: () => Promise<void>) {
    setWorking(key);
    try { await run(action); } finally { setWorking(""); }
  }
  const [filter, setFilter] = useState("all"), [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<AdminContract | null>(null);
  const deleteTrigger = useRef<HTMLButtonElement | null>(null);
  const filtered = contracts.filter(item => (filter === "all" || item.status === filter) && `${item.number} ${item.ownerName} ${item.propertyAddress}`.toLocaleLowerCase().includes(search.toLocaleLowerCase()));
  function openDelete(target: AdminContract, trigger: HTMLButtonElement) {
    deleteTrigger.current = trigger; setDeleteTarget(target); setError(""); setNotice("");
  }
  async function confirmDelete(confirmation: string) {
    if (!deleteTarget) return;
    await api(`/api/ugovori/contracts/${deleteTarget.id}/delete`, { confirmation });
    if (createdLink === deleteTarget.signUrl) setCreatedLink("");
    setNotice(c.contractDeleted); await refresh().catch(() => setError(c.error));
  }
  return <>
        <div className="ep-stats">{[["contracts", contracts.length, FileText], ["sent", contracts.filter(i => i.status === "sent").length, Send], ["signed", contracts.filter(i => i.status === "signed").length, Check]].map(([label, count, Icon]) => {
          const StatIcon = Icon as typeof FileText; return <div className="ep-stat" key={String(label)}><span>{c[label as keyof typeof c]}</span><strong>{String(count)}</strong><StatIcon size={23} /></div>;
        })}</div>
        <section className="ep-panel ep-list"><div className="ep-list-toolbar"><div className="ep-tabs">{["all", "sent", "signed"].map(item => <button key={item} className={filter === item ? "is-active" : ""} onClick={() => setFilter(item)}>{c[item as keyof typeof c]}</button>)}</div>
          <label className="ep-search"><Search size={17} /><input placeholder={c.search} aria-label={c.search} value={search} onChange={e => setSearch(e.target.value)} /></label></div>
          {!filtered.length ? <div className="ep-empty"><FileText size={32} /><h2>{contracts.length ? c.noResults : c.emptyTitle}</h2><p>{c.emptyDescription}</p></div> : <div className="ep-table-wrap"><table><thead><tr>{["number", "owner", "property", "status", "actions"].map(key => <th key={key}>{c[key as keyof typeof c]}</th>)}</tr></thead><tbody>
            {filtered.map(item => <tr key={item.id}><td><strong>{item.number}</strong><small>{item.kind === "open" ? c.open : c.exclusive}</small></td><td>{item.ownerName}<small>{new Date(item.createdAt).toLocaleDateString("hr-HR")}</small></td><td>{item.propertyAddress}</td>
              <td><span className={`ep-badge ep-${item.status}`}>{c[item.status]}</span><small>{item.emailStatus === "preview" ? c.unsentEmail : item.emailStatus === "delivered" ? c.deliveredEmail : item.emailStatus === "failed" ? c.failedEmail : c.pendingEmail}</small></td>
              <td><div className="ep-row-actions">{item.status !== "failed" && <a href={`/api/ugovori/contracts/${item.id}/pdf?download=1`} title={c.download} aria-label={c.download}><Download size={17} /></a>}
                {(item.status === "sent" || item.status === "signed") && <><button title={c.copyLink} aria-label={c.copyLink} onClick={() => void copy(item.signUrl)}><Copy size={17} /></button><a href={item.signUrl} target="_blank" rel="noreferrer" title={c.viewDocument} aria-label={c.viewDocument}><ExternalLink size={17} /></a></>}
                <button className="ep-danger-text" title={c.deleteContract} aria-label={c.deleteContract} disabled={busy} onClick={event => openDelete(item, event.currentTarget)}><Trash2 size={17} /></button>
              </div>{item.status === "sent" && <button className="ep-text-button" aria-busy={working === `${item.id}:revoke`} disabled={busy} onClick={() => { if (window.confirm(c.confirmRevoke)) void runFor(`${item.id}:revoke`, async () => { await api(`/api/ugovori/contracts/${item.id}/revoke`, {}); await refresh(); }); }}>{working === `${item.id}:revoke` ? <EPotpisLoader variant="inline" label={c.loading} /> : c.revoke}</button>}
              {(item.emailStatus === "failed" || item.emailStatus === "pending") && <button className="ep-text-button" aria-busy={working === `${item.id}:retry`} disabled={busy} onClick={() => void runFor(`${item.id}:retry`, async () => { await api(`/api/ugovori/contracts/${item.id}/retry`, {}); await refresh(); })}>{working === `${item.id}:retry` ? <EPotpisLoader variant="inline" label={c.loading} /> : c.retryEmail}</button>}</td>
            </tr>)}
          </tbody></table></div>}
        </section>
    {deleteTarget && <EPotpisDeleteDialog cmsData={c} contract={deleteTarget} onConfirm={confirmDelete} onClose={() => setDeleteTarget(null)}
      onRestoreFocus={() => (deleteTrigger.current?.isConnected ? deleteTrigger.current : document.getElementById("ep-heading"))?.focus()} />}
  </>;
}
