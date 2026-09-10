"use client";
import { useRef, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Trash2 } from "lucide-react";
import type { EPotpisTexts } from "@/lib/epotpis/texts";
import type { AdminContract } from "@/lib/epotpis/types";
import { EPotpisLoader } from "../EPotpisLoader/EPotpisLoader";

interface Props {
  cmsData: EPotpisTexts;
  contract: AdminContract | null;
  onConfirm: (confirmation: string) => Promise<void>;
  onClose: () => void;
  onRestoreFocus: () => void;
}
export function EPotpisDeleteDialog({ cmsData: c, contract, onConfirm, onClose, onRestoreFocus }: Props) {
  const [confirmation, setConfirmation] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const cancel = useRef<HTMLButtonElement>(null);
  const matches = !contract || Boolean(c.deleteContractConfirmationPlaceholder && confirmation === c.deleteContractConfirmationPlaceholder);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy || !matches) return;
    setBusy(true); setError("");
    try { await onConfirm(confirmation); onClose(); }
    catch (error) { const key = error instanceof Error ? error.message : "error"; setError(c[key as keyof typeof c] || c.error); }
    finally { setBusy(false); }
  }
  return <Dialog.Root open onOpenChange={open => { if (!open && !busy) onClose(); }}>
    <Dialog.Portal>
      <Dialog.Overlay className="ep-modal-overlay" />
      <Dialog.Content className="ep-root ep-delete-dialog" onOpenAutoFocus={event => { event.preventDefault(); cancel.current?.focus(); }}
        onCloseAutoFocus={event => { event.preventDefault(); onRestoreFocus(); }}
        onEscapeKeyDown={event => { if (busy) event.preventDefault(); }} onPointerDownOutside={event => event.preventDefault()}>
        <span className="ep-delete-icon" aria-hidden="true"><Trash2 size={22} /></span>
        <Dialog.Title>{contract ? c.deleteContractTitle : c.deleteSignatureTitle}</Dialog.Title>
        {contract && <p className="ep-delete-target"><strong>{contract.number}</strong><span>{contract.ownerName}</span></p>}
        <Dialog.Description className="ep-section-description">{contract ? c.deleteContractDescription : c.deleteSignatureDescription}</Dialog.Description>
        <form onSubmit={submit} aria-busy={busy}>
          {contract && <label className="ep-field">{c.deleteContractConfirmationLabel}
            <input value={confirmation} onChange={event => setConfirmation(event.target.value)} placeholder={c.deleteContractConfirmationPlaceholder}
              autoComplete="off" spellCheck={false} autoCapitalize="off" disabled={busy} />
          </label>}
          {error && <p className="ep-error" role="alert">{error}</p>}
          <div className="ep-delete-actions">
            <button ref={cancel} type="button" className="ep-secondary" disabled={busy} onClick={onClose}>{c.cancel}</button>
            <button type="submit" className="ep-button ep-danger-button" aria-busy={busy} disabled={busy || !matches}>{busy ? <EPotpisLoader variant="inline" label={c.deleting} /> : contract ? c.deleteContract : c.deleteSignature}</button>
          </div>
        </form>
      </Dialog.Content>
    </Dialog.Portal>
  </Dialog.Root>;
}
