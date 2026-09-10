"use client";
import { useCallback, useRef, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Expand, RotateCw, X } from "lucide-react";
import type { EPotpisTexts } from "@/lib/epotpis/texts";
import type { Signature } from "@/lib/epotpis/types";

interface Props {
  cmsData: EPotpisTexts; onChange: (value: Signature | null) => void;
  initialValue?: Signature | null; label?: string; disabled?: boolean;
  onConfirm?: () => void; confirmDisabled?: boolean;
}
export function EPotpisSignature({ cmsData: c, onChange, initialValue, label, disabled = false, onConfirm, confirmDisabled }: Props) {
  const canvas = useRef<HTMLCanvasElement | null>(null);
  const observer = useRef<ResizeObserver | null>(null);
  const paths = useRef<number[][][]>(initialValue?.kind === "strokes" ? structuredClone(initialValue.paths) : []);
  const active = useRef<number | null>(null);
  const expandButton = useRef<HTMLButtonElement | null>(null);
  const [expanded, setExpanded] = useState(false);
  const redraw = useCallback(() => {
    const node = canvas.current, ctx = node?.getContext("2d");
    if (!node || !ctx) return;
    ctx.setTransform(node.width / 720, 0, 0, node.height / 240, 0, 0);
    ctx.clearRect(0, 0, 720, 240);
    ctx.lineWidth = 2.5; ctx.lineCap = "round"; ctx.lineJoin = "round"; ctx.strokeStyle = "#152c32"; ctx.fillStyle = "#152c32";
    for (const path of paths.current) {
      if (path.length === 1) { ctx.beginPath(); ctx.arc(path[0][0], path[0][1], ctx.lineWidth / 2, 0, Math.PI * 2); ctx.fill(); continue; }
      ctx.beginPath(); path.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.stroke();
    }
  }, []);
  const attachCanvas = useCallback((node: HTMLCanvasElement | null) => {
    observer.current?.disconnect(); canvas.current = node;
    if (!node) return;
    const resize = () => {
      const width = Math.max(1, Math.round(node.getBoundingClientRect().width * Math.min(window.devicePixelRatio || 1, 3)));
      node.width = width; node.height = Math.max(1, Math.round(width / 3)); redraw();
    };
    resize(); observer.current = new ResizeObserver(resize); observer.current.observe(node);
  }, [redraw]);
  function point(event: React.PointerEvent<HTMLCanvasElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    return [Math.max(0, Math.min(720, (event.clientX - rect.left) * 720 / rect.width)), Math.max(0, Math.min(240, (event.clientY - rect.top) * 240 / rect.height))];
  }
  function finish(event: React.PointerEvent<HTMLCanvasElement>) {
    if (active.current !== event.pointerId) return;
    active.current = null;
    onChange(paths.current.length ? { kind: "strokes", paths: structuredClone(paths.current) } : null);
  }
  function clear() { paths.current = []; active.current = null; redraw(); onChange(null); }
  const rotateHint = <p className="ep-rotate-hint"><RotateCw size={18} aria-hidden="true" />{c.signatureRotateHint}</p>;
  const pad = <div className="ep-signature-box"><canvas ref={attachCanvas} width={720} height={240} aria-label={label || c.signatureLabel} aria-disabled={disabled}
    onPointerDown={event => {
      if (disabled || active.current !== null || event.button !== 0 || paths.current.length >= 80) return;
      event.preventDefault(); active.current = event.pointerId; event.currentTarget.setPointerCapture(event.pointerId);
      paths.current.push([point(event)]); redraw();
    }}
    onPointerMove={event => {
      if (disabled || active.current !== event.pointerId) return;
      const path = paths.current.at(-1)!, next = point(event), last = path.at(-1)!;
      if (path.length < 2000 && (next[0] !== last[0] || next[1] !== last[1])) { path.push(next); redraw(); }
    }}
    onPointerUp={finish} onPointerCancel={finish} onLostPointerCapture={finish} />
    <span aria-hidden="true">{c.signatureHint}</span>
  </div>;
  const actions = <div className="ep-signature-actions">
    <button type="button" className="ep-text-button ep-clear-signature" disabled={disabled} onClick={clear}>{c.clearSignature}</button>
    {onConfirm && <button type="button" className="ep-button" disabled={disabled || confirmDisabled} onClick={onConfirm}>{c.confirmSignature}</button>}
  </div>;
  return <div className="ep-signature">
    {!expanded && <>{rotateHint}<div className="ep-signature-toolbar"><button ref={expandButton} type="button" className="ep-text-button" disabled={disabled} onClick={() => setExpanded(true)}><Expand size={16} />{c.signatureExpand}</button></div>{pad}{actions}</>}
    <Dialog.Root open={expanded} onOpenChange={setExpanded}><Dialog.Portal>
      <Dialog.Overlay className="ep-modal-overlay" />
      <Dialog.Content className="ep-root ep-draw-dialog" onPointerDownOutside={event => event.preventDefault()}
        onCloseAutoFocus={event => { event.preventDefault(); expandButton.current?.focus(); }}>
        <div className="ep-draw-header"><Dialog.Title>{label || c.signatureLabel}</Dialog.Title>
          <Dialog.Close asChild><button type="button" className="ep-secondary" aria-label={c.signatureCollapse}><X size={20} /><span>{c.signatureCollapse}</span></button></Dialog.Close>
        </div>
        <Dialog.Description className="ep-sr-only">{c.signatureHint}</Dialog.Description>
        {rotateHint}<div className="ep-draw-area">{pad}</div>{actions}
      </Dialog.Content>
    </Dialog.Portal></Dialog.Root>
  </div>;
}
