interface Props { label: string; variant?: "panel" | "pdf" | "inline" }

export function EPotpisLoader({ label, variant = "panel" }: Props) {
  if (variant === "inline") return <span className="ep-loader-inline"><span className="ep-loader-spinner" aria-hidden="true" /><span>{label}</span></span>;
  return <div className={`ep-loader ep-loader-${variant}`} role="status" aria-live="polite">
    <div className="ep-loader-mark" aria-hidden="true"><span className="ep-loader-spinner" /></div>
    <span className="ep-loader-label">{label}</span>
    <div className="ep-loader-lines" aria-hidden="true"><span /><span /><span /></div>
  </div>;
}
