import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import {
  cleanValues, emptyData, fieldType, fullRow, isTable, loadData, mediaStore, randomUUID, saveData, seedData
} from "../shared/portfolio.mjs";

export const config = { path: "/api" };

const MAX_UPLOAD_MB = 5;
const SESSION_DAYS = 7;

function env(name) {
  const fromNetlify = globalThis.Netlify && globalThis.Netlify.env ? globalThis.Netlify.env.get(name) : undefined;
  return String(fromNetlify ?? process.env[name] ?? "").trim();
}

function json(payload, status = 200, headers = {}) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      "x-content-type-options": "nosniff",
      ...headers
    }
  });
}

class ApiError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.status = status;
  }
}

const ok = (data, headers) => json({ data, error: null }, 200, headers);

function adminEmail() {
  return env("ADMIN_EMAIL").toLowerCase();
}

function secret() {
  return env("SESSION_SECRET") || createHash("sha256").update(`pf:${adminEmail()}:${env("ADMIN_PASSWORD")}`).digest("hex");
}

function sameText(a, b) {
  const ha = createHash("sha256").update(String(a)).digest();
  const hb = createHash("sha256").update(String(b)).digest();
  return timingSafeEqual(ha, hb);
}

function signSession(email) {
  const body = Buffer.from(JSON.stringify({ email, exp: Date.now() + SESSION_DAYS * 86400000 })).toString("base64url");
  const sig = createHmac("sha256", secret()).update(body).digest("base64url");
  return `${body}.${sig}`;
}

function readSession(req) {
  const cookie = req.headers.get("cookie") || "";
  const match = cookie.split(";").map((c) => c.trim()).find((c) => c.startsWith("pf_session="));
  if (!match || !env("ADMIN_PASSWORD") || !adminEmail()) return null;
  const [body, sig] = match.slice("pf_session=".length).split(".");
  if (!body || !sig) return null;
  const expected = createHmac("sha256", secret()).update(body).digest("base64url");
  if (!sameText(sig, expected)) return null;
  try {
    const p = JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
    if (!p.exp || p.exp < Date.now() || p.email !== adminEmail()) return null;
    return p;
  } catch {
    return null;
  }
}

function sessionCookie(value, maxAge) {
  return `pf_session=${value}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${maxAge}`;
}

function requireAdmin(req) {
  if (!readSession(req)) throw new ApiError("permission denied: sign in to the admin panel first.", 401);
}

function table(name) {
  if (!isTable(name)) throw new ApiError("Unknown table.");
  return name;
}

function rowsOf(d, t) {
  if (t === "profile") return d.profile ? [d.profile] : [];
  return d[t];
}

function matches(t, row, filters) {
  return (filters || []).every((f) => {
    if (!Array.isArray(f) || f.length !== 2 || !fieldType(t, f[0])) throw new ApiError("Invalid filter.");
    return String(row[f[0]]) === String(f[1]);
  });
}

function sorted(rows, order) {
  if (!order || !["sort", "created_at"].includes(order.column)) return rows;
  const dir = order.ascending === false ? -1 : 1;
  return [...rows].sort((a, b) => {
    const x = a[order.column], y = b[order.column];
    if (x !== y) return (x > y ? 1 : -1) * dir;
    return String(a.created_at).localeCompare(String(b.created_at));
  });
}

function insertRow(d, t, values) {
  if (t === "profile") {
    d.profile = fullRow("profile", { ...(d.profile || {}), ...cleanValues("profile", values), id: 1 });
    return d.profile;
  }
  const row = fullRow(t, { ...cleanValues(t, values), id: randomUUID(), created_at: new Date().toISOString() });
  d[t].push(row);
  return row;
}

function updateRows(d, t, values, filters) {
  if (!filters || !filters.length) throw new ApiError("An update needs a filter.");
  const changes = cleanValues(t, values);
  delete changes.id;
  delete changes.created_at;
  const hit = rowsOf(d, t).filter((r) => matches(t, r, filters));
  hit.forEach((r) => Object.assign(r, changes));
  return hit;
}

const TYPES = { jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", gif: "image/gif", webp: "image/webp", pdf: "application/pdf" };

function looksLike(ext, b) {
  const starts = (...bytes) => bytes.every((x, i) => b[i] === x);
  if (ext === "jpg" || ext === "jpeg") return starts(0xff, 0xd8, 0xff);
  if (ext === "png") return starts(0x89, 0x50, 0x4e, 0x47);
  if (ext === "gif") return starts(0x47, 0x49, 0x46, 0x38);
  if (ext === "webp") return starts(0x52, 0x49, 0x46, 0x46) && String.fromCharCode(...b.slice(8, 12)) === "WEBP";
  if (ext === "pdf") return String.fromCharCode(...b.slice(0, 5)) === "%PDF-";
  return false;
}

async function upload(req) {
  requireAdmin(req);
  let form;
  try {
    form = await req.formData();
  } catch {
    throw new ApiError(`The upload failed. Files must be smaller than ${MAX_UPLOAD_MB} MB.`);
  }
  const file = form.get("file");
  const path = String(form.get("path") || "").toLowerCase();
  if (!file || typeof file.arrayBuffer !== "function") throw new ApiError("No file arrived.");
  if (!/^[a-z0-9_-]{1,40}\/[a-z0-9][a-z0-9._-]{0,150}$/.test(path) || path.includes("..")) throw new ApiError("Invalid file name.");
  const ext = path.split(".").pop();
  if (!TYPES[ext]) throw new ApiError("Only JPG, PNG, GIF, WEBP images and PDF files can be uploaded.");
  if (file.size > MAX_UPLOAD_MB * 1024 * 1024) throw new ApiError(`This file is larger than ${MAX_UPLOAD_MB} MB. Use a smaller file.`);
  const bytes = new Uint8Array(await file.arrayBuffer());
  if (!looksLike(ext, bytes)) throw new ApiError(ext === "pdf" ? "That file is not a valid PDF." : "That file is not a valid image.");
  await mediaStore().set(path, bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength), {
    metadata: { contentType: TYPES[ext] }
  });
  return ok({ path });
}

export default async (req) => {
  const url = new URL(req.url);
  const action = url.searchParams.get("action") || "";

  try {
    if (req.method === "POST" && req.headers.get("x-portfolio") !== "1") throw new ApiError("Request blocked.", 403);

    if (action === "session") {
      const s = readSession(req);
      return ok({ user: s ? { email: s.email } : null });
    }

    if (action === "logout") return ok(true, { "set-cookie": sessionCookie("", 0) });

    if (action === "upload") return await upload(req);

    let body = {};
    if (req.method === "POST") {
      try { body = (await req.json()) || {}; } catch { body = {}; }
    }

    if (action === "login") {
      const email = String(body.email || "").trim().toLowerCase();
      const password = String(body.password || "");
      if (!adminEmail() || !env("ADMIN_PASSWORD")) {
        throw new ApiError(
          "The admin login isn't set up yet. In Netlify, add ADMIN_EMAIL and ADMIN_PASSWORD under Project configuration → Environment variables, then go to Deploys → Trigger deploy.",
          500
        );
      }
      if (!sameText(email, adminEmail()) || !sameText(password, env("ADMIN_PASSWORD"))) {
        await new Promise((r) => setTimeout(r, 600));
        throw new ApiError("Invalid login credentials", 401);
      }
      if (!(await loadData())) await saveData(seedData());
      return ok({ user: { email } }, { "set-cookie": sessionCookie(signSession(email), SESSION_DAYS * 86400) });
    }

    if (action === "select") {
      const t = table(body.table);
      const d = (await loadData()) || emptyData();
      return ok(sorted(rowsOf(d, t).filter((r) => matches(t, r, body.filters)), body.order));
    }

    if (["insert", "update", "upsert", "delete"].includes(action)) {
      requireAdmin(req);
      const t = table(body.table);
      const d = (await loadData()) || emptyData();
      let result;

      if (action === "insert") {
        const rows = Array.isArray(body.rows) ? body.rows : [body.rows || {}];
        result = rows.map((r) => insertRow(d, t, r));
      } else if (action === "update") {
        result = updateRows(d, t, body.values, body.filters);
      } else if (action === "upsert") {
        const row = body.row || {};
        const exists = row.id !== undefined && rowsOf(d, t).some((r) => String(r.id) === String(t === "profile" ? 1 : row.id));
        result = exists ? updateRows(d, t, row, [["id", t === "profile" ? 1 : row.id]]) : [insertRow(d, t, row)];
      } else {
        if (!Array.isArray(body.filters) || !body.filters.length) throw new ApiError("A delete needs a filter.");
        if (t === "profile") d.profile = null;
        else d[t] = d[t].filter((r) => !matches(t, r, body.filters));
        result = [];
      }

      await saveData(d);
      return ok(result);
    }

    throw new ApiError("Unknown action.", 404);
  } catch (err) {
    if (err instanceof ApiError) return json({ data: null, error: { message: err.message } }, err.status);
    console.error(err);
    return json({ data: null, error: { message: "Something went wrong on the server. Try again in a moment." } }, 500);
  }
};

