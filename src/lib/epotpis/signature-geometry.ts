import type { SignAnchor, Signature } from "./types";

export function splitSignatureAnchor(anchor: SignAnchor, count: number): SignAnchor {
  const { slots: _slots, ...box } = anchor;
  const gap = count === 2 ? 10 : 0;
  const width = (box.width - gap) / count;
  return { ...box, slots: Array.from({ length: count }, (_, index) => ({ ...box, x: box.x + index * (width + gap), width })) };
}

export function signatureHasInk(signature: Signature | null): boolean {
  if (!signature || signature.kind !== "strokes") return false;
  const points = signature.paths.flat();
  if (points.length < 5 || points.length > 10000) return false;
  const length = signature.paths.reduce((sum, path) => sum + path.slice(1).reduce((n, p, i) => n + Math.hypot(p[0] - path[i][0], p[1] - path[i][1]), 0), 0);
  return length >= 50 && Math.max(...points.map(p => p[0])) - Math.min(...points.map(p => p[0])) >= 20;
}
