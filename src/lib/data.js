import config from "../config";
import content from "../data/content";
import { createApiClient } from "./apiClient";

export const TABLES = ["experience", "projects", "certificates", "recognition", "skills", "education"];

export function backend() {
  const choice = String(config.backend || "auto").toLowerCase();
  if (choice === "php" || choice === "xampp") return "php";
  if (choice === "netlify") return "netlify";
  if (choice === "supabase") return "supabase";
  if (location.hostname.endsWith(".netlify.app")) return "netlify";
  const local = ["localhost", "127.0.0.1"].includes(location.hostname);
  const apachePort = ["", "80", "443", "8080", "8081"].includes(location.port);
  return local && apachePort ? "php" : "supabase";
}

export function isConfigured() {
  if (backend() === "php" || backend() === "netlify") return true;
  const { supabaseUrl: u, supabaseAnonKey: k } = config;
  return Boolean(u && k && !u.includes("YOUR_") && !k.includes("YOUR_"));
}

let client = null;
export async function getClient() {
  if (!isConfigured()) return null;
  if (!client) {
    const kind = backend();
    if (kind === "php" || kind === "netlify") {
      client = createApiClient(kind);
    } else {
      const { createClient } = await import("@supabase/supabase-js");
      client = createClient(config.supabaseUrl, config.supabaseAnonKey);
    }
  }
  return client;
}

export function seed() {
  return JSON.parse(JSON.stringify(content));
}

export async function loadPortfolio() {
  const db = await getClient();
  if (!db) return { ...seed(), source: "seed" };

  try {
    const profileReq = db.from("profile").select("*").eq("id", 1).maybeSingle();
    const listReqs = TABLES.map((t) => db.from(t).select("*").order("sort", { ascending: true }));
    const [profileRes, ...lists] = await Promise.all([profileReq, ...listReqs]);

    if (profileRes.error) throw profileRes.error;
    if (!profileRes.data) return { ...seed(), source: "seed" };

    const out = { profile: profileRes.data, source: "database" };
    TABLES.forEach((t, i) => {
      if (lists[i].error) throw lists[i].error;
      out[t] = lists[i].data || [];
    });
    if (TABLES.every((t) => !out[t].length)) {
      const s = seed();
      TABLES.forEach((t) => (out[t] = s[t] || []));
      out.source = "database-profile-only";
    }
    return out;
  } catch (err) {
    console.warn("Could not load from the database, showing starting content instead.", err);
    return { ...seed(), source: "seed" };
  }
}
