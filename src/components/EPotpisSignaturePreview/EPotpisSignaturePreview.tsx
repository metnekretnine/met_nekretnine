import type { Signature } from "@/lib/epotpis/types";

export function EPotpisSignaturePreview({ signature, label }: { signature: Signature; label: string }) {
  if (signature.kind !== "strokes" || !signature.paths.flat().length) return null;
  const points = signature.paths.flat();
  const minX = Math.min(...points.map(p => p[0])), minY = Math.min(...points.map(p => p[1]));
  const width = Math.max(...points.map(p => p[0])) - minX, height = Math.max(...points.map(p => p[1])) - minY;
  return <svg className="ep-signature-ink" role="img" aria-label={label} viewBox={`${minX - 8} ${minY - 8} ${width + 16} ${height + 16}`} preserveAspectRatio="xMidYMax meet">
    <g fill="none" stroke="#152c32" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      {signature.paths.map((path, index) => path.length === 1
        ? <circle key={index} cx={path[0][0]} cy={path[0][1]} r="1.25" fill="#152c32" stroke="none" />
        : <polyline key={index} points={path.map(point => point.join(",")).join(" ")} />)}
    </g>
  </svg>;
}
