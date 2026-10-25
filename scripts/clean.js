// Removes the production output directory before a build.
// Only ever deletes `<project root>/_site`.
import { rm } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputDir = path.join(projectRoot, "_site");

if(path.dirname(outputDir) !== projectRoot || path.basename(outputDir) !== "_site") {
	throw new Error(`Refusing to clean unexpected path: ${outputDir}`);
}

await rm(outputDir, { recursive: true, force: true });
console.log(`[clean] removed ${path.relative(process.cwd(), outputDir) || outputDir}`);
