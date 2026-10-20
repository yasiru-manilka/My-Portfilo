import { cpSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const dist = `${root}dist`;

if (!existsSync(dist)) {
  console.error("dist/ not found. Run `npm run build` first.");
  process.exit(1);
}
const { default: content } = await import("../src/data/content.js");
writeFileSync(`${root}server/seed.json`, JSON.stringify(content, null, 2));

cpSync(`${root}server`, `${dist}/server`, { recursive: true });
mkdirSync(`${dist}/uploads`, { recursive: true });
cpSync(`${root}uploads`, `${dist}/uploads`, { recursive: true, force: false });

console.log("\nReady for XAMPP: copy everything inside dist/ into C:\\xampp\\htdocs\\portfolio\\");
console.log("Then open http://localhost/portfolio/server/setup.php once.\n");
