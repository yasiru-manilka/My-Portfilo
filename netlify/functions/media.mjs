import { mediaStore } from "../shared/portfolio.mjs";

export const config = { path: "/media/*" };

export default async (req) => {
  const key = decodeURIComponent(new URL(req.url).pathname.replace(/^\/media\//, "")).toLowerCase();
  if (!/^[a-z0-9_-]{1,40}\/[a-z0-9][a-z0-9._-]{0,150}$/.test(key) || key.includes("..")) {
    return new Response("Not found", { status: 404 });
  }
  const entry = await mediaStore().getWithMetadata(key, { type: "arrayBuffer" });
  if (!entry) return new Response("Not found", { status: 404 });
  return new Response(entry.data, {
    headers: {
      "content-type": (entry.metadata && entry.metadata.contentType) || "application/octet-stream",
      "cache-control": "public, max-age=31536000, immutable",
      "x-content-type-options": "nosniff",
      "content-security-policy": "default-src 'none'; style-src 'unsafe-inline'; sandbox"
    }
  });
};
