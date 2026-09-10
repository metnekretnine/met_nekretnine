const escapeHtml = (value: string) => value.replace(/[&<>"']/g, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]!);
export const emailDashes = (value: string) => value.replace(/[\u2013\u2014]/g, "-");

interface EmailAction { url: string; label: string; fallbackText: string }

/** Add a contract button at its existing link, while preserving a readable fallback URL. */
export function emailHtml(brand: string, subject: string, body: string, action?: EmailAction): string {
  const blocks: string[] = [];
  let lines: string[] = [], actionRendered = false;
  const link = (url: string) => `<a href="${escapeHtml(url)}" style="color:#101114;text-decoration:underline;overflow-wrap:anywhere;word-break:break-word">${escapeHtml(url)}</a>`;
  function flush() {
    if (!lines.length) return;
    blocks.push(`<p style="margin:0 0 22px;line-height:1.75">${lines.map(line => /^https?:\/\/\S+$/.test(line.trim()) ? link(line.trim()) : escapeHtml(line)).join("<br>")}</p>`);
    lines = [];
  }
  for (const line of body.split("\n")) {
    if (!line.trim()) { flush(); continue; }
    if (action && !actionRendered && /^https?:\/\/\S+$/.test(action.url) && line.trim() === action.url) {
      flush(); actionRendered = true;
      blocks.push(`<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:separate;margin:0 0 16px"><tr><td align="center" bgcolor="#101114" style="border-radius:4px"><a href="${escapeHtml(action.url)}" style="display:inline-block;padding:14px 22px;border:1px solid #101114;border-radius:4px;background:#101114;color:#fff;font-size:14px;line-height:20px;font-weight:700;text-decoration:none;text-align:center">${escapeHtml(action.label)}</a></td></tr></table>`);
      blocks.push(`<p style="margin:0 0 26px;font-size:12px;line-height:1.75;color:#65717a;overflow-wrap:anywhere;word-break:break-word">${escapeHtml(action.fallbackText)}<br>${link(action.url)}</p>`);
    } else lines.push(line);
  }
  flush();
  const paragraphs = blocks.join("");
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="margin:0;padding:28px 12px;background:#f5f7f8;color:#101114;font-family:Arial,Helvetica,sans-serif"><table role="presentation" style="width:100%;max-width:600px;margin:0 auto;border-collapse:collapse;background:#fff;border:1px solid #e3e7ea"><tr><td style="padding:32px 28px 24px;border-bottom:1px solid #e3e7ea;font-size:36px;letter-spacing:-2px;font-weight:700">${escapeHtml(brand)}</td></tr><tr><td style="padding:28px;font-size:15px"><h1 style="font-size:21px;line-height:1.4;font-weight:600;margin:0 0 28px">${escapeHtml(subject)}</h1>${paragraphs}</td></tr></table></body></html>`;
}
