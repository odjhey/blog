# Working with the author

This is the personal blog of odjhey (odjhey.com). The author writes posts directly or creates raw dumps, refines them with an assistant, and publishes each note with zero browser JavaScript.

## Raws are the record of intent

- An optional raw dump sits next to a note as `content/blog/<slug>.raw.txt`. The post's front matter specifies `raw_at: YYYY-MM-DDTHH:MM` for when it was written.
- The raw file is published verbatim as typed. Never edit, reformat, rename, move or delete it, and never clean up misspellings or grammar. The only exception is if the author explicitly requests a specific change.
- Raws are public: when the note is published, the raw is published alongside it.

## Refinement session (no drafts)

Every post in this repo is published; there is no draft status.
1. Read the raw(s) or post the author specifies.
2. Summarize what the raw is expressing in a sentence or two. Clarify ambiguities with the author; do not invent background facts or narrative.
3. Write or update `content/blog/<slug>.md` directly. Use `##` for sections. Preserve the author's voice and intent.
4. Point out where the revised post drifted from the raw so the author can review the diff.
5. Run `npm run check` and report the result.
6. The author reviews the git diff before committing.
