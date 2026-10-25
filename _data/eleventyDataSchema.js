import { z } from "zod";

const dateOnly = z.union([
	z.date(),
	z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use a YYYY-MM-DD date"),
]);

// Validates post front matter fields. Every post is published; no drafts or demo fields.
export default function() {
	return function(data) {
		let result = z.object({
			title: z.optional(z.string()),
			date: z.optional(dateOnly),
			tags: z.optional(z.union([z.array(z.string()), z.string()])),
			updated: z.optional(dateOnly),
			revisionNote: z.optional(z.string()),
			description: z.optional(z.string()),
			// When the raw was typed. The raw sits next to the post as <slug>.raw.txt
			raw_at: z.optional(z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/, "Use ISO 8601 down to the minute, e.g. 2026-10-09T22:15")),
			// The note this one continues, by slug (its file name). Listed under it on the index.
			extends: z.optional(z.string().regex(/^[a-z0-9][a-z0-9-]*$/, "Use the slug of another note, e.g. a-useful-thought")),
		}).safeParse(data);

		if(result.error) {
			throw new Error(`${data.page?.inputPath}: ${z.prettifyError(result.error)}`);
		}
	};
}
