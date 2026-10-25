# odjhey.com

Personal blog of odjhey. Built with [Eleventy](https://www.11ty.dev/) and plain CSS. Ships zero browser JavaScript, makes no third-party requests, and adheres strictly to semantic HTML.

## Commands

Requires Node.js >=22 and npm.

| Command | Description |
| --- | --- |
| `npm run dev` | Development server at http://localhost:8081/ |
| `npm run build` | Clean production build into `_site/` |
| `npm run preview` | Serves `_site/` as plain static files on http://127.0.0.1:8080/ |
| `npm run check` | Builds and runs strict HTML, XML, schema, link, and empty-state checks |
| `npm run check:browser` | Headless Chromium check with JavaScript disabled; generates screenshots in `artifacts/preview/` |

## Writing

Every post in `content/blog/<slug>.md` is published; there are no drafts.

### Front matter

```yaml
---
title: "Post Title"
date: "YYYY-MM-DD"
tags:
  - programming
description: "Optional summary for meta description and feed."
# Optional:
raw_at: "2026-10-25T12:00"   # When content/blog/<slug>.raw.txt was typed (to the minute)
extends: "parent-slug"        # Groups this note under another in the index tree
updated: "YYYY-MM-DD"         # Date of meaningful revision
revisionNote: "What changed"
---
```

### Raws
An unedited text dump can be placed alongside a note as `<slug>.raw.txt`. Adding `raw_at` to the post front matter includes the raw verbatim under a `<details class="raw">` fold on the post page.

### Note graph
- Author-written internal links like `/blog/<slug>/` automatically generate `→` (links to) and `←` (linked from) navigation rows at the end of connected notes.
- The `extends: <slug>` field nests child notes under their parent in list views.

### Tags
Tags are declared in front matter. The site generates `/tags/` as an index of all tags and `/tags/<tag>/` for each tag.

## Deployment

Hosted on Vercel as a static site via `vercel.json`:
- Build Command: `npm run build`
- Output Directory: `_site`
- `trailingSlash: true`: pages are `/blog/<slug>/`; the old slash-less URLs (`/blog/<slug>`, `/tags/<tag>`, `/about`) 308 to them. `/feed.xml` and `/sitemap.xml` keep their paths.
- Redirect: the old paginated `/blog/page/:n` goes to `/blog/`.

## Design

"Ledger": a year-grouped index with mono dates, and on posts a left rail with date, reading time, tags and the source link. One inlined stylesheet (`css/index.css`), system fonts, light/dark from the device setting.
