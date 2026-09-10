"use client";
import { useRef, useState } from "react";
import Image from "next/image";
import { Check, Trash2 } from "lucide-react";
import type { Signature } from "@/lib/epotpis/types";
import { api } from "@/lib/epotpis/browser";
import { EPotpisLoader } from "../EPotpisLoader/EPotpisLoader";
import { EPotpisSignature } from "../EPotpisSignature/EPotpisSignature";
import { EPotpisDeleteDialog } from "../EPotpisDeleteDialog/EPotpisDeleteDialog";
import { useEPotpisAdmin } from "../EPotpisAdmin/EPotpisAdmin";

export function EPotpisSettings() {
  const { cms: c, hasSignature, signatureUrl, busy, run, refresh, setNotice, setError } = useEPotpisAdmin();
  const [loadedPreview, setLoadedPreview] = useState("");
  const [failedPreview, setFailedPreview] = useState("");
  const previewLoading = Boolean(signatureUrl && loadedPreview !== signatureUrl && failedPreview !== signatureUrl);
  const [signature, setSignature] = useState<Signature | null>(null);
  const [editingSignature, setEditingSignature] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const deleteTrigger = useRef<HTMLButtonElement | null>(null);
  function openDelete(trigger: HTMLButtonElement) {
    deleteTrigger.current = trigger; setDeleting(true); setError(""); setNotice("");
  }
  async function confirmDelete() {
    await api("/api/ugovori/settings/signature/delete", { confirmed: true });
    setSignature(null); setEditingSignature(false); setNotice(c.signatureDeleted);
    await refresh().catch(() => setError(c.error));
  }
  return <><div className="ep-settings-grid"><section className="ep-panel ep-settings">
        <h2>{c.signatureSettings}</h2><p className="ep-section-description">{c.signatureDescription}</p>
        {hasSignature && signatureUrl && <div className="ep-existing-signature"><h3><Check size={16} />{c.currentSignature}</h3><div className="ep-signature-preview"><Image src={signatureUrl} alt={c.currentSignature} width={540} height={180} unoptimized
          onLoad={() => setLoadedPreview(signatureUrl)} onError={() => setFailedPreview(signatureUrl)} />
          {previewLoading && <div className="ep-signature-preview-loading" role="status"><EPotpisLoader variant="inline" label={c.loading} /></div>}
          {failedPreview === signatureUrl && <div className="ep-signature-preview-loading" role="alert">{c.error}</div>}
        </div><p>{c.currentSignatureDescription}</p></div>}
        {hasSignature && !editingSignature && <div className="ep-settings-actions"><button className="ep-secondary" disabled={busy} onClick={() => { setSignature(null); setEditingSignature(true); setNotice(""); }}>{c.replaceSignature}</button>
          <button className="ep-secondary ep-danger-text" disabled={busy} onClick={event => openDelete(event.currentTarget)}><Trash2 size={16} />{c.deleteSignature}</button>
        </div>}
        {(!hasSignature || editingSignature) && <div className="ep-signature-editor"><h3>{hasSignature ? c.replacementSignature : c.drawSignature}</h3><EPotpisSignature cmsData={c} onChange={setSignature} />
          <div className="ep-settings-actions"><button className="ep-button" aria-busy={busy} disabled={busy || !signature} onClick={() => void run(async () => { await api("/api/ugovori/settings", { signature }); setSignature(null); setEditingSignature(false); await refresh(); setNotice(c.signatureSaved); })}>{busy ? <EPotpisLoader variant="inline" label={c.saving} /> : c.saveSignature}</button>
            {hasSignature && <button className="ep-secondary" disabled={busy} onClick={() => { setSignature(null); setEditingSignature(false); setError(""); }}>{c.cancel}</button>}
          </div>
        </div>}
      </section></div>
    {deleting && <EPotpisDeleteDialog cmsData={c} contract={null} onConfirm={confirmDelete} onClose={() => setDeleting(false)}
      onRestoreFocus={() => (deleteTrigger.current?.isConnected ? deleteTrigger.current : document.getElementById("ep-heading"))?.focus()} />}
  </>;
}
