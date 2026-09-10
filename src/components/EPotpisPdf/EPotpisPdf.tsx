"use client";
import { useEffect, useRef, useState } from "react";
import type { EPotpisTexts } from "@/lib/epotpis/texts";
import { EPotpisLoader } from "../EPotpisLoader/EPotpisLoader";

interface Props { cmsData: EPotpisTexts; url: string; onReady?: () => void }
export function EPotpisPdf({ cmsData: c, url, onReady }: Props) {
  const container = useRef<HTMLDivElement>(null);
  const ready = useRef(onReady);
  const [zoom, setZoom] = useState(1);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  useEffect(() => { ready.current = onReady; }, [onReady]);
  useEffect(() => {
    let disposed = false;
    let destroy: (() => void) | undefined;
    setLoading(true); setError(false);
    async function render() {
      // Keep the renderer and worker on PDF.js's matching compatibility builds.
      const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
      if (disposed) return;
      pdfjs.GlobalWorkerOptions.workerSrc = `/epotpis/pdf.worker.min.mjs?v=${pdfjs.version}-legacy`;
      const task = pdfjs.getDocument({ url });
      destroy = () => { void task.destroy(); };
      const document = await task.promise;
      if (!container.current || disposed) return;
      container.current.replaceChildren();
      for (let index = 1; index <= document.numPages; index++) {
        if (disposed) break;
        const page = await document.getPage(index);
        if (disposed) return;
        const canvas = window.document.createElement("canvas");
        const base = page.getViewport({ scale: 1 });
        const width = Math.min(container.current.clientWidth, 900) * zoom;
        // Bound backing-store memory when zooming on high-density mobile screens.
        const ratio = Math.min(window.devicePixelRatio || 1, 2, Math.sqrt(4_000_000 / (width * width * base.height / base.width)));
        const viewport = page.getViewport({ scale: width / base.width * ratio });
        canvas.width = viewport.width; canvas.height = viewport.height;
        canvas.style.width = `${width}px`; canvas.style.height = `${viewport.height / ratio}px`;
        canvas.setAttribute("aria-label", `${c.page} ${index}`);
        container.current.appendChild(canvas);
        await page.render({ canvas, canvasContext: canvas.getContext("2d")!, viewport }).promise;
        page.cleanup();
      }
      if (!disposed) { setLoading(false); ready.current?.(); }
    }
    void render().catch(() => { if (!disposed) { setLoading(false); setError(true); } });
    const pages = container.current;
    return () => {
      disposed = true; destroy?.();
      // Safari retains detached canvas backing stores unless explicitly released.
      pages?.querySelectorAll("canvas").forEach(canvas => { canvas.width = 0; canvas.height = 0; });
      pages?.replaceChildren();
    };
  }, [url, zoom, c.page]);
  return <div className="ep-pdf">
    <div className="ep-pdf-toolbar"><span>{c.reviewTitle}</span><div>
      <button type="button" aria-label={c.zoomOut} disabled={zoom <= 1} onClick={() => setZoom(z => z - 0.5)}>−</button>
      <span>{Math.round(zoom * 100)}%</span>
      <button type="button" aria-label={c.zoomIn} disabled={zoom >= 2.5} onClick={() => setZoom(z => z + 0.5)}>+</button>
    </div></div>
    {error && <p role="alert" className="ep-error">{c.documentError}</p>}
    <div className={`ep-pdf-scroll ${loading ? "is-loading" : ""} ${error ? "is-error" : ""}`}>
      <div ref={container} className="ep-pdf-pages" aria-busy={loading} />
      {loading && <EPotpisLoader variant="pdf" label={c.documentLoading} />}
    </div>
  </div>;
}
