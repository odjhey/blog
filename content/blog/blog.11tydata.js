import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

// A note's optional raw dump sits next to the .md as <slug>.raw.txt. It is
// returned exactly as read (no trimming, no newline handling) and only HTML-
// escaped by the layout. `raw_at` in the front matter turns it on; the build
// fails if `raw_at` is set and the file is missing.
export default {
	tags: [
		"posts"
	],
	layout: "layouts/post.njk",
	// Posts are plain Markdown: `{{ }}` and `{% %}` in prose or code samples
	// are printed as written instead of being run through Nunjucks.
	templateEngineOverride: "md",
	eleventyComputed: {
		raw: (data) => {
			if(!data.raw_at) {
				return null;
			}
			let file = path.join(projectRoot, "content/blog", `${data.page.fileSlug}.raw.txt`);
			let source;
			try {
				source = readFileSync(file, "utf8");
			} catch {
				throw new Error(`${data.page.inputPath}: raw_at is set but content/blog/${data.page.fileSlug}.raw.txt is missing`);
			}
			return source;
		}
	}
};
