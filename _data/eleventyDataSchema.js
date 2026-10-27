import { z } from "zod";

// A calendar day; an optional UTC time only orders same-day posts.
const postDate = z.union([
	z.date(),
	z.string().regex(/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2})?$/, "Use a YYYY-MM-DD or YYYY-MM-DDTHH:MM date"),
]);

// Validates post front matter fields. Every post is published; no drafts or demo fields.
export default function() {
	return function(data) {
		let result = z.object({
			title: z.optional(z.string()),
			date: z.optional(postDate),
			tags: z.optional(z.union([z.array(z.string()), z.string()])),
			description: z.optional(z.string()),
			// When the raw was typed. The raw sits next to the post as <slug>.raw.txt
			raw_at: z.optional(z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/, "Use ISO 8601 down to the minute, e.g. 2026-10-09T22:15")),
			// The note this one continues, by slug (its file name). Listed under it on the index.
			extends: z.optional(z.string().regex(/^[a-z0-9][a-z0-9-]*$/, "Use the slug of another note, e.g. a-useful-thought")),
			// With `extends`: also listed as its own top-level row, not only under its parent.
			primary: z.optional(z.boolean()),
		}).safeParse(data);

		if(result.error) {
			throw new Error(`${data.page?.inputPath}: ${z.prettifyError(result.error)}`);
		}
	};
}
