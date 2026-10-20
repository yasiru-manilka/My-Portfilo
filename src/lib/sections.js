import content from "../data/content";

export const SECTION_KEYS = ["about", "projects", "experience", "achievements", "certificates", "skills", "education"];

export function getSections(profile) {
  const defaults = content.profile.sections || {};
  const saved = profile && profile.sections && typeof profile.sections === "object" ? profile.sections : {};
  const out = {};
  SECTION_KEYS.forEach((k) => {
    const cfg = { ...defaults[k], ...(saved[k] || {}) };
    out[k] = { ...cfg, title: (cfg.title || "").trim() || defaults[k].title };
  });
  return out;
}
