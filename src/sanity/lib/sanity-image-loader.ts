export default function sanityLoader({
  src,
  width,
  quality,
}: {
  src: string;
  width: number;
  quality?: number;
}) {
  if (!src.includes("cdn.sanity.io")) {
    return src;
  }

  const url = new URL(src);
  url.searchParams.set("w", width.toString());
  url.searchParams.set("q", (quality || 100).toString());
  url.searchParams.set("fit", "max");
  url.searchParams.set("auto", "format");
  return url.toString();
}
