import { getStore } from "@netlify/blobs";
import { randomUUID } from "node:crypto";
import seedContent from "../../src/data/content.js";

export const TABLES = {
  profile: {
    id: "int", name: "text", role_line: "text", university: "text", university_url: "text",
    university_logo_url: "text", intro: "text", about: "text", location: "text", email: "text",
    phone: "text", linkedin: "text", github: "text", cv_url: "text", photo_url: "text",
    avatar_url: "text", status: "text", show_status: "bool", contact_heading: "text",
    sections: "json", updated_at: "text"
  },
  experience: {
    id: "text", role: "text", org: "text", logo_url: "text", start_label: "text", end_label: "text",
    current: "bool", summary: "text", tags: "list", sort: "int", created_at: "text"
  },
  projects: {
    id: "text", title: "text", tagline: "text", role: "text", year: "text", status: "text",
    summary: "text", highlights: "list", stack: "list", images: "list", link: "text", repo: "text",
    other_links: "list", sort: "int", created_at: "text"
  },
  certificates: {
    id: "text", title: "text", issuer: "text", issued: "text", image_url: "text", sort: "int", created_at: "text"
  },
  recognition: {
    id: "text", title: "text", org: "text", date_label: "text", note: "text", image_url: "text",
    sort: "int", created_at: "text"
  },
  skills: { id: "text", name: "text", category: "text", sort: "int", created_at: "text" },
  education: {
    id: "text", school: "text", degree: "text", logo_url: "text", start_label: "text", end_label: "text",
    note: "text", courses: "list", sort: "int", created_at: "text"
  }
};

export const LISTS = ["experience", "projects", "certificates", "recognition", "skills", "education"];

const DEFAULTS = { text: "", int: 0, bool: false, list: [], json: {} };

export function isTable(name) {
  return typeof name === "string" && Object.hasOwn(TABLES, name);
}
export function fieldType(table, field) {
  return typeof field === "string" && Object.hasOwn(TABLES[table], field) ? TABLES[table][field] : null;
}

export function contentStore() {
  return getStore({ name: "portfolio-content", consistency: "strong" });
}

export function mediaStore() {
  return getStore({ name: "portfolio-media", consistency: "strong" });
}

export function toType(type, v) {
  switch (type) {
    case "int": return Number.parseInt(v, 10) || 0;
    case "bool": return v === true || v === 1 || v === "1" || v === "true";
    case "list": {
      const arr = Array.isArray(v) ? v : typeof v === "string" ? v.split(/\r?\n/) : [];
      return arr.filter((x) => ["string", "number"].includes(typeof x)).map((x) => String(x).trim()).filter(Boolean);
    }
    case "json": return v && typeof v === "object" && !Array.isArray(v) ? v : {};
    default: return v === null || v === undefined ? "" : typeof v === "object" ? "" : String(v);
  }
}

export function cleanValues(table, values) {
  const cols = TABLES[table];
  const out = {};
  for (const [k, v] of Object.entries(values && typeof values === "object" ? values : {})) {
    if (Object.hasOwn(cols, k)) out[k] = toType(cols[k], v);
  }
  return out;
}

export function fullRow(table, row) {
  const cols = TABLES[table];
  const out = {};
  for (const [k, type] of Object.entries(cols)) {
    if (row && row[k] !== undefined) out[k] = toType(type, row[k]);
    else out[k] = table === "profile" && k === "show_status" ? true : structuredClone(DEFAULTS[type]);
  }
  return out;
}

export function emptyData() {
  const d = { profile: null };
  LISTS.forEach((t) => (d[t] = []));
  return d;
}

export function seedData() {
  const d = emptyData();
  d.profile = fullRow("profile", { ...seedContent.profile, id: 1 });
  const now = new Date().toISOString();
  for (const t of LISTS) {
    d[t] = (seedContent[t] || []).map((r, i) => fullRow(t, { ...r, id: randomUUID(), sort: (i + 1) * 10, created_at: now }));
  }
  return d;
}

export async function loadData(store = contentStore()) {
  const d = await store.get("content", { type: "json" });
  if (!d || typeof d !== "object") return null;
  const out = emptyData();
  out.profile = d.profile ? fullRow("profile", d.profile) : null;
  for (const t of LISTS) out[t] = Array.isArray(d[t]) ? d[t].map((r) => fullRow(t, r)) : [];
  return out;
}

export async function saveData(d, store = contentStore()) {
  await store.setJSON("content", d);
}

export { randomUUID };
