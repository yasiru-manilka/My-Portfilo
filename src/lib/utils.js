export function safeUrl(u) {
  const s = String(u || "").trim();
  if (!s) return "";
  if (/^(https?:|mailto:|tel:)/i.test(s) || /^[\w./-]+$/.test(s)) return s;
  return "";
}

export function list(v) {
  if (Array.isArray(v)) return v.map((x) => String(x).trim()).filter(Boolean);
  if (typeof v === "string") return v.split("\n").map((x) => x.trim()).filter(Boolean);
  return [];
}

export function parseLinks(v) {
  return list(v)
    .map((line) => {
      const i = line.lastIndexOf("|");
      const label = i > -1 ? line.slice(0, i).trim() : "";
      const url = safeUrl(i > -1 ? line.slice(i + 1).trim() : line);
      return url ? { label: label || url.replace(/^https?:\/\//, ""), url } : null;
    })
    .filter(Boolean);
}

export function range(start, end, current) {
  const a = start || "";
  const b = current ? "now" : end || "";
  if (!a) return b;
  if (!b || a === b) return a;
  return `${a} – ${b}`;
}

export const siteRoot = new URL(
  location.pathname.replace(/admin\/(index\.html)?$/, "").replace(/[^/]*$/, ""),
  location.origin
).href;

export function assetUrl(u) {
  const s = safeUrl(u);
  if (!s) return "";
  if (/^(https?:|mailto:|tel:)/i.test(s)) return s;
  return new URL(s.replace(/^\/+/, ""), siteRoot).href;
}

export function externalProps(u) {
  return /^https?:/i.test(u) ? { target: "_blank", rel: "noopener" } : {};
}
