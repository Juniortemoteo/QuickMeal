import { existsSync, readdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { dirname, extname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";

// Keep Expo's bundled fonts outside paths named node_modules, which static
// hosting and source-control tooling may exclude from published assets.
const root = resolve(dirname(fileURLToPath(import.meta.url)), "../dist");
const source = join(root, "assets", "node_modules");
const destination = join(root, "assets", "vendor");
const textExtensions = new Set([".html", ".js", ".css", ".json"]);
const renamedBundles = new Map();

function rewriteReferences(directory) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      rewriteReferences(path);
    } else if (entry.isFile() && textExtensions.has(extname(entry.name))) {
      const content = readFileSync(path, "utf8");
      let updated = content.replaceAll("/assets/node_modules/", "/assets/vendor/");
      for (const [previous, current] of renamedBundles) {
        updated = updated.replaceAll(previous, current);
      }
      if (updated !== content) writeFileSync(path, updated);
    }
  }
}

if (existsSync(source)) {
  if (existsSync(destination)) {
    throw new Error("Re-export the web build before preparing its assets.");
  }
  renameSync(source, destination);
}
rewriteReferences(root);
// A changed bundle must have a new URL to avoid stale immutable browser caches.
const bundles = join(root, "_expo", "static", "js", "web");
for (const entry of readdirSync(bundles)) {
  if (!/-[a-f0-9]{32}\.js$/.test(entry)) continue;
  const path = join(bundles, entry);
  const hash = createHash("md5").update(readFileSync(path)).digest("hex");
  const next = entry.replace(/-[a-f0-9]{32}\.js$/, `-${hash}.js`);
  if (next !== entry) {
    renameSync(path, join(bundles, next));
    renamedBundles.set(entry, next);
  }
}
rewriteReferences(root);
console.log("Web assets prepared for static hosting.");
