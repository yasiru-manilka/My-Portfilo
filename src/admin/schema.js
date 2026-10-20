export const PROFILE_FIELDS = [
  { k: "name", label: "Name", required: true },
  { k: "role_line", label: "Degree and year", help: "Shown above your name, e.g. BSc Computer Science (UG), 2nd Year" },
  { k: "university", label: "University", help: "e.g. University of Colombo School of Computing" },
  { k: "university_url", label: "University website", type: "url" },
  { k: "university_logo_url", label: "University logo", type: "image", folder: "profile", help: "If it can't load, the site shows the university initials instead." },
  { k: "intro", label: "Description about me", type: "textarea", help: "The paragraph under your name on the homepage. One to three sentences." },
  { k: "about", label: "About", type: "textarea", rows: 6 },
  { k: "photo_url", label: "Portrait photo", type: "image", folder: "profile", help: "The large photo on the homepage." },
  { k: "avatar_url", label: "Small round photo", type: "image", folder: "profile", help: "Shown in the circle at the top left. A square, face-centred photo works best." },
  { k: "status", label: "Availability message", help: "Shown under your name with a green dot. e.g. Open to software engineering internships" },
  { k: "show_status", label: "Show the availability message on the website", type: "checkbox" },
  { k: "location", label: "Location" },
  { k: "email", label: "Email", type: "email" },
  { k: "phone", label: "Phone", help: "Leave empty to keep it off the website." },
  { k: "linkedin", label: "LinkedIn URL", type: "url" },
  { k: "github", label: "GitHub URL", type: "url" },
  { k: "cv_url", label: "CV (PDF)", type: "file", folder: "cv", accept: "application/pdf" },
  { k: "contact_heading", label: "Contact heading", type: "textarea", rows: 2, help: "The sentence above your email at the bottom of the page." }
];

function range(r) {
  const b = r.current ? "now" : r.end_label;
  return [r.start_label, b].filter(Boolean).join(" – ");
}

export const COLLECTIONS = {
  experience: {
    label: "Experience", single: "role",
    hint: "Roles in societies, jobs and internships. The top item shows first on the website.",
    title: (r) => r.role, sub: (r) => [r.org, range(r)].filter(Boolean).join(", "),
    thumb: (r) => r.logo_url, square: true,
    fields: [
      { k: "role", label: "Role", required: true },
      { k: "org", label: "Organization", required: true },
      { k: "logo_url", label: "Organization logo", type: "image", folder: "logos", help: "e.g. the CSSL GenZ logo. Square images look best." },
      { k: "start_label", label: "Started", help: "e.g. Apr 2026" },
      { k: "end_label", label: "Ended", help: "Leave empty if you still hold this role." },
      { k: "current", label: "I currently hold this role", type: "checkbox" },
      { k: "summary", label: "What you did", type: "textarea" },
      { k: "tags", label: "Skills used", type: "list", help: "One per line." }
    ]
  },
  projects: {
    label: "Projects", single: "project",
    hint: "Things you've built. Add screenshots and links when you have them.",
    title: (r) => r.title, sub: (r) => [r.role, r.year, r.status].filter(Boolean).join(", "),
    thumb: (r) => (r.images || [])[0],
    fields: [
      { k: "title", label: "Project name", required: true },
      { k: "tagline", label: "One-line description", help: "e.g. Smart technician booking management platform" },
      { k: "role", label: "Type and team", help: "e.g. 2nd-year group project, 4 members" },
      { k: "year", label: "Year" },
      { k: "status", label: "Status", help: "e.g. In development, Completed" },
      { k: "summary", label: "What it is", type: "textarea" },
      { k: "highlights", label: "Your part", type: "list", help: "One point per line. Each line becomes a bullet point." },
      { k: "stack", label: "Built with", type: "list", help: "One technology per line." },
      { k: "images", label: "Photos and screenshots", type: "images", folder: "projects", help: "Add as many as you like. The first one is the cover." },
      { k: "link", label: "Live link", type: "url", help: "Where people can try it." },
      { k: "repo", label: "GitHub link", type: "url" },
      { k: "other_links", label: "Other links", type: "list", help: "One per line as  Label | https://link  e.g.  Demo video | https://youtu.be/..." }
    ]
  },
  certificates: {
    label: "Certificates", single: "certificate",
    hint: "Upload the certificate image. Visitors can open it full size.",
    title: (r) => r.title, sub: (r) => [r.issuer, r.issued].filter(Boolean).join(", "),
    thumb: (r) => r.image_url,
    fields: [
      { k: "title", label: "Course or certificate name", required: true },
      { k: "issuer", label: "Issued by", required: true },
      { k: "issued", label: "Date issued", help: "e.g. Jun 2026" },
      { k: "image_url", label: "Certificate image", type: "image", folder: "certificates" }
    ]
  },
  recognition: {
    label: "Achievements", single: "achievement",
    hint: "Awards, Director's List, scholarships and similar.",
    title: (r) => r.title, sub: (r) => [r.org, r.date_label].filter(Boolean).join(", "),
    thumb: (r) => r.image_url,
    fields: [
      { k: "title", label: "Award", required: true },
      { k: "org", label: "Given by" },
      { k: "date_label", label: "When", help: "e.g. July 2026" },
      { k: "note", label: "Note", type: "textarea", rows: 3 },
      { k: "image_url", label: "Photo or proof", type: "image", folder: "achievements", help: "e.g. the Director's List page or an event photo. Visitors can open it larger." }
    ]
  },
  skills: {
    label: "Skills", single: "skill",
    hint: "Skills are grouped on the website by their group name. Type an existing group name to add to it.",
    title: (r) => r.name, sub: (r) => r.category,
    fields: [
      { k: "name", label: "Skill", required: true },
      { k: "category", label: "Group", required: true, datalist: "categories", help: "e.g. Languages and web" }
    ]
  },
  education: {
    label: "Education", single: "education entry",
    hint: "Degrees and schools.",
    title: (r) => r.degree, sub: (r) => [r.school, range(r)].filter(Boolean).join(", "),
    thumb: (r) => r.logo_url, square: true,
    fields: [
      { k: "degree", label: "Degree or qualification", required: true },
      { k: "school", label: "Institution", required: true },
      { k: "logo_url", label: "Institution logo", type: "image", folder: "logos" },
      { k: "start_label", label: "Started" },
      { k: "end_label", label: "Finished", help: "Leave empty if ongoing." },
      { k: "note", label: "Note", type: "textarea", rows: 3 },
      { k: "courses", label: "Modules", type: "list", help: "One per line." }
    ]
  }
};

export const COLLECTION_KEYS = Object.keys(COLLECTIONS);
