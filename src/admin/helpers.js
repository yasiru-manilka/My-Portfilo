import config from "../config";

export const BUCKET = config.storageBucket || "media";

export function explain(err) {
  const m = (err && err.message) || String(err);
  if (/row-level security|violates/i.test(m))
    return "Saving was blocked. Make sure you signed in with the admin email set in schema.sql.";
  if (/permission denied/i.test(m)) return "You're signed out. Reload the page and sign in again.";
  if (/Failed to fetch/i.test(m)) return "Couldn't reach Supabase. Check your internet connection and src/config.js.";
  return m;
}

export function slug(s) {
  return String(s).toLowerCase().replace(/[^a-z0-9.]+/g, "-").replace(/^-+|-+$/g, "");
}

export async function uploadFile(db, file, folder) {
  const maxMB = db.maxUploadMB || 8;
  if (file.size > maxMB * 1024 * 1024) throw new Error(`${file.name} is larger than ${maxMB} MB. Use a smaller file.`);
  const path = `${folder}/${Date.now()}-${slug(file.name)}`;
  const { error } = await db.storage.from(BUCKET).upload(path, file, { cacheControl: "31536000", upsert: false });
  if (error) throw error;
  return db.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
}
