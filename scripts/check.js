// Focused checks on the generated site in `_site/`. Run with `npm run check`,
// which builds first. Exits non-zero when any check fails.
import { readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseDocument, DomUtils } from "htmlparser2";
import { XMLValidator, XMLParser } from "fast-xml-parser";
import matter from "gray-matter";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const { default: metadata } = await import(path.join(projectRoot, "_data/metadata.js"));
const ORIGIN = metadata.url; // e.g. https://odjhey.com/

const TEXT_EXTENSIONS = new Set([".html", ".xml", ".css", ".svg", ".txt", ".json"]);
const FORBIDDEN_EXTENSIONS = new Set([".js", ".mjs", ".cjs", ".map", ".ts", ".md", ".njk", ".log"]);
const FORBIDDEN_NAMES = new Set([
	"AGENTS.md", "README.md", "package.json", "package-lock.json",
	"eleventy.config.js", "node_modules", "artifacts", "scripts", "_data", "_includes", "_config",
	"content", ".dev-site", ".git", ".env", "LICENSE-eleventy-base-blog", "LICENSE", "vercel.json"
]);

// ---------------------------------------------------------------- helpers

function slugify(s) {
	return String(s).toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "")
		.replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function dayString(value) {
	if(value instanceof Date) {
		return value.toISOString().slice(0, 10);
	}
	return String(value);
}

async function walk(dir) {
	let out = [];
	for(let entry of await readdir(dir, { withFileTypes: true })) {
		let full = path.join(dir, entry.name);
		out.push(full);
		if(entry.isDirectory()) {
			out.push(...await walk(full));
		}
	}
	return out;
}

async function exists(p) {
	try {
		await stat(p);
		return true;
	} catch {
		return false;
	}
}

// Reads every Markdown post under content/blog.
async function readPosts(root) {
	let blogDir = path.join(root, "content/blog");
	let files = (await exists(blogDir)) ? (await walk(blogDir)).filter(f => f.endsWith(".md")) : [];
	let posts = [];
	for(let file of files) {
		let { data, content } = matter(await readFile(file, "utf8"));
		let slug = path.basename(file, ".md");
		posts.push({
			file: path.relative(root, file),
			slug,
			url: `/blog/${slug}/`,
			title: data.title,
			date: dayString(data.date),
			tags: (Array.isArray(data.tags) ? data.tags : data.tags ? [data.tags] : []).filter(t => t !== "posts"),
			raw_at: typeof data.raw_at === "string" ? data.raw_at : null,
			extends: typeof data.extends === "string" ? data.extends : null,
			bodyLength: content.trim().length,
		});
	}
	// Newest first. Eleventy orders collections by date, then input path (both
	// ascending) and the site lists them reversed, so same-day posts appear in
	// reverse file-name order.
	let byInputPath = (a, b) => a.file < b.file ? -1 : a.file > b.file ? 1 : 0;
	let published = posts.sort((a, b) => b.date.localeCompare(a.date) || byInputPath(b, a));
	return { published };
}

class Report {
	constructor(label) {
		this.label = label;
		this.failures = [];
		this.notes = [];
		this.passed = 0;
	}
	ok(condition, message) {
		if(condition) {
			this.passed++;
		} else {
			this.failures.push(message);
		}
		return condition;
	}
	note(message) {
		this.notes.push(message);
	}
	print() {
		let status = this.failures.length ? "FAIL" : "PASS";
		console.log(`\n${status}  ${this.label}  (${this.passed} assertions passed, ${this.failures.length} failed)`);
		for(let n of this.notes) {
			console.log(`      note: ${n}`);
		}
		for(let f of this.failures) {
			console.log(`   ✗ ${f}`);
		}
		return this.failures.length === 0;
	}
}

// Maps a site URL path to the file a static host would serve, or null.
async function fileForUrl(siteDir, urlPath) {
	let clean = decodeURIComponent(urlPath.split(/[?#]/)[0]);
	let candidates = clean.endsWith("/")
		? [path.join(siteDir, clean, "index.html")]
		: [path.join(siteDir, clean), path.join(siteDir, clean, "index.html")];
	for(let candidate of candidates) {
		if(!candidate.startsWith(siteDir)) {
			continue;
		}
		try {
			if((await stat(candidate)).isFile()) {
				return candidate;
			}
		} catch {}
	}
	return null;
}

function urlForFile(siteDir, file) {
	let rel = "/" + path.relative(siteDir, file).split(path.sep).join("/");
	return rel.endsWith("/index.html") ? rel.slice(0, -"index.html".length) : rel;
}

const textOf = (node) => DomUtils.textContent(node).replace(/\s+/g, " ").trim();

// ------------------------------------------------------- site-wide checks

async function checkSite(siteDir, { label, posts }) {
	let r = new Report(label);
	let { published } = posts;
	let all = await walk(siteDir);
	let files = [];
	for(let f of all) {
		if((await stat(f)).isFile()) {
			files.push(f);
		}
	}
	let rel = (f) => path.relative(siteDir, f).split(path.sep).join("/");

	// Required pages
	let required = ["index.html", "blog/index.html", "tags/index.html", "about/index.html", "404.html", "feed.xml", "sitemap.xml"];
	for(let p of published) {
		required.push(`blog/${p.slug}/index.html`);
	}
	let publishedTags = new Set(published.flatMap(p => p.tags));
	for(let tag of publishedTags) {
		required.push(`tags/${slugify(tag)}/index.html`);
	}
	for(let req of required) {
		r.ok(await exists(path.join(siteDir, req)), `missing required output: ${req}`);
	}

	// Zero JavaScript files, no source files or project documents
	for(let f of all) {
		let name = path.basename(f);
		let ext = path.extname(f).toLowerCase();
		r.ok(!FORBIDDEN_EXTENSIONS.has(ext), `forbidden file type in output: ${rel(f)}`);
		r.ok(!FORBIDDEN_NAMES.has(name), `source or project file in output: ${rel(f)}`);
	}

	// Text-level scans: development hosts
	let textFiles = files.filter(f => TEXT_EXTENSIONS.has(path.extname(f)));
	let texts = new Map();
	for(let f of textFiles) {
		let text = await readFile(f, "utf8");
		texts.set(f, text);
		r.ok(!/localhost|127\.0\.0\.1|0\.0\.0\.0/.test(text), `development host in ${rel(f)}`);
	}

	// Per-page HTML checks
	let htmlFiles = files.filter(f => f.endsWith(".html"));
	let parsed = new Map();
	for(let f of htmlFiles) {
		parsed.set(f, parseDocument(texts.get(f)));
	}
	let idsByFile = new Map();
	for(let [f, doc] of parsed) {
		idsByFile.set(f, new Set(DomUtils.findAll(el => Boolean(el.attribs?.id), doc.children).map(el => el.attribs.id)));
	}

	for(let [f, doc] of parsed) {
		let name = rel(f);
		let pageUrl = urlForFile(siteDir, f);
		let elements = DomUtils.findAll(() => true, doc.children);
		let byTag = (tag) => elements.filter(el => el.name === tag);

		// No script, no handlers, no javascript: URLs, no embeds, no noscript fallbacks
		r.ok(byTag("script").length === 0, `${name}: contains <script>`);
		r.ok(byTag("noscript").length === 0, `${name}: contains <noscript>`);
		for(let tag of ["iframe", "embed", "object", "frame"]) {
			r.ok(byTag(tag).length === 0, `${name}: contains <${tag}>`);
		}
		for(let el of elements) {
			for(let [attr, value] of Object.entries(el.attribs)) {
				r.ok(!/^on/i.test(attr), `${name}: inline handler ${attr} on <${el.name}>`);
				r.ok(!/^\s*javascript:/i.test(value.replace(/[\u0000-\u001f]/g, "")), `${name}: javascript: URL in ${attr} on <${el.name}>`);
			}
		}

		// No third-party runtime requests (fonts, images, styles, embeds)
		for(let el of elements) {
			let isResource = ["img", "source", "video", "audio", "track", "input"].includes(el.name)
				|| (el.name === "link" && !["canonical", "alternate"].includes(el.attribs.rel));
			let url = el.attribs.src || el.attribs.srcset || (el.name === "link" ? el.attribs.href : null);
			if(isResource && url) {
				r.ok(!/^(https?:)?\/\//i.test(url), `${name}: external resource ${url}`);
			}
		}
		let inlineCss = byTag("style").map(textOf).join("\n");
		r.ok(!/@import|url\(\s*["']?(https?:)?\/\//i.test(inlineCss), `${name}: CSS loads an external resource`);

		// Semantics
		r.ok(byTag("h1").length === 1, `${name}: expected exactly one <h1>, found ${byTag("h1").length}`);
		for(let tag of ["header", "nav", "main", "footer"]) {
			r.ok(byTag(tag).length >= 1, `${name}: missing <${tag}>`);
		}
		let firstLink = byTag("a")[0];
		r.ok(firstLink?.attribs.href === "#main" && idsByFile.get(f).has("main"), `${name}: first link is not a working skip link`);
		let levels = DomUtils.findAll(el => /^h[1-6]$/.test(el.name), doc.children).map(el => Number(el.name[1]));
		for(let i = 1; i < levels.length; i++) {
			r.ok(levels[i] <= levels[i - 1] + 1, `${name}: heading level jumps from h${levels[i - 1]} to h${levels[i]}`);
		}
		for(let time of byTag("time")) {
			r.ok(/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}(:\d{2}(\.\d+)?)?(Z|[+-]\d{2}:\d{2})?)?$/.test(time.attribs.datetime || ""), `${name}: <time> without a valid datetime`);
		}
		let canonical = byTag("link").find(el => el.attribs.rel === "canonical");
		if(name !== "404.html") {
			r.ok(canonical?.attribs.href === new URL(pageUrl.slice(1), ORIGIN).href, `${name}: canonical is ${canonical?.attribs.href}, expected ${ORIGIN}${pageUrl.slice(1)}`);
		}
		// Link preview card: points at this page and at an image that ships.
		let og = Object.fromEntries(byTag("meta").filter(el => el.attribs.property?.startsWith("og:")).map(el => [el.attribs.property, el.attribs.content]));
		r.ok(og["og:url"] === canonical?.attribs.href, `${name}: og:url ${og["og:url"]} differs from canonical`);
		r.ok(og["og:title"] && og["og:description"], `${name}: og:title or og:description missing`);
		r.ok(og["og:image"]?.startsWith(ORIGIN) && await fileForUrl(siteDir, new URL(og["og:image"]).pathname), `${name}: og:image ${og["og:image"]} is not a shipped absolute URL`);

		// Internal links, assets and fragments resolve
		for(let el of elements) {
			for(let attr of ["href", "src"]) {
				let value = el.attribs[attr];
				if(!value || /^(mailto|tel):/i.test(value)) {
					continue;
				}
				let target;
				if(value.startsWith(ORIGIN)) {
					target = new URL(value);
				} else if(/^([a-z]+:)?\/\//i.test(value)) {
					continue; // external link
				} else {
					target = new URL(value, `http://site.invalid${pageUrl}`);
				}
				let file = target.pathname === pageUrl && value.startsWith("#") ? f : await fileForUrl(siteDir, target.pathname);
				if(!r.ok(file, `${name}: broken internal ${attr} "${value}"`)) {
					continue;
				}
				if(target.hash && file.endsWith(".html")) {
					let id = decodeURIComponent(target.hash.slice(1));
					r.ok(idsByFile.get(file)?.has(id), `${name}: link "${value}" points to a missing #${id}`);
				}
			}
		}
	}

	// The note graph, from front matter and rendered articles
	let bySlug = new Map(published.map(p => [p.slug, p]));
	let parentOf = (p) => {
		let q = bySlug.get(p.extends);
		return q !== p ? q : undefined;
	};
	let rootOf = (p) => {
		let chain = [p];
		for(let q = parentOf(p); q && !chain.includes(q); q = parentOf(q)) {
			if(!parentOf(q)) {
				return q;
			}
			chain.push(q);
		}
		return undefined;
	};
	let indexTree = published.filter(p => !rootOf(p)).flatMap(p => [
		{ href: p.url, child: false },
		...published.filter(c => rootOf(c) === p).map(c => ({ href: c.url, child: true })),
	]);

	// /blog/: newest first, grouped under a year heading; a row shows "Apr 18".
	// Home: the `metadata.latest` newest under "Latest", dated in full, then a link to /blog/.
	const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
	let listDate = (iso) => {
		let [, m, d] = iso.split("-").map(Number);
		return `${MONTHS[m - 1]} ${String(d).padStart(2, "0")}`;
	};
	let listed = (doc) => DomUtils.findAll(el => el.name === "section" && el.attribs.class?.split(" ").includes("year"), doc.children)
		.flatMap(section => {
			let year = textOf(DomUtils.findOne(el => el.name === "h2", section.children) || section);
			return DomUtils.findAll(el => el.name === "ul" && el.attribs.class === "posts", section.children)
				.flatMap(ul => DomUtils.findAll(el => el.name === "li", ul.children))
				.map(li => {
					let time = DomUtils.findOne(el => el.name === "time", li.children);
					return { href: DomUtils.findOne(el => el.name === "a", li.children)?.attribs.href, child: li.attribs.class === "child", datetime: time?.attribs.datetime, text: time && textOf(time), year };
				});
		});
	let home = parsed.get(path.join(siteDir, "index.html"));
	let blogIndex = parsed.get(path.join(siteDir, "blog/index.html"));
	let tagsIndex = parsed.get(path.join(siteDir, "tags/index.html"));
	if(home && blogIndex && tagsIndex) {
		let latest = listed(home);
		let expectedLatest = published.slice(0, metadata.latest).map(p => `Latest ${p.date} ${p.url}`);
		let shownLatest = latest.map(x => `${x.year} ${x.text} ${x.child ? "└ " : ""}${x.href}`);
		r.ok(JSON.stringify(shownLatest) === JSON.stringify(expectedLatest), `home lists ${shownLatest.join(", ")} but expected ${expectedLatest.join(", ")}`);
		r.ok(latest.every(x => x.datetime === x.text), "home: a row's <time datetime> differs from its shown date");
		let more = DomUtils.findOne(el => el.name === "p" && el.attribs.class === "more", home.children);
		r.ok(more && DomUtils.findOne(el => el.name === "a", more.children)?.attribs.href === "/blog/" && textOf(more) === `All ${published.length} posts →`, `home: missing "All ${published.length} posts →" link to /blog/`);

		let rows = listed(blogIndex);
		let shown = rows.map(x => `${x.child ? "└ " : ""}${x.href}`);
		let expected = indexTree.map(x => `${x.child ? "└ " : ""}${x.href}`);
		r.ok(JSON.stringify(shown) === JSON.stringify(expected), `/blog/ lists ${shown.join(", ")} but expected ${expected.join(", ")}`);
		for(let row of rows) {
			let p = published.find(q => q.url === row.href);
			r.ok(p && row.datetime === p.date, `/blog/: ${row.href} has datetime ${row.datetime}, expected ${p?.date}`);
			r.ok(p && row.text === listDate(p.date), `/blog/: ${row.href} shows "${row.text}", expected "${p && listDate(p.date)}"`);
			r.ok(p && (row.child || row.year === p.date.slice(0, 4)), `/blog/: ${row.href} listed under ${row.year}, expected ${p?.date.slice(0, 4)}`);
		}
		let tagNames = DomUtils.findAll(el => el.name === "a" && el.attribs.href?.startsWith("/tags/") && el.attribs.href !== "/tags/", tagsIndex.children).map(textOf);
		r.ok(JSON.stringify([...tagNames].sort()) === JSON.stringify([...publishedTags].sort()), `tags index shows ${tagNames}, expected ${[...publishedTags]}`);
		r.ok(!tagNames.includes("posts") && !tagNames.includes("all"), "internal collection exposed as a tag");
	}

	// Each article: body in initial HTML and published date without time-zone shift
	for(let p of published) {
		let doc = parsed.get(path.join(siteDir, "blog", p.slug, "index.html"));
		if(!doc) {
			continue;
		}
		let article = DomUtils.findOne(el => el.name === "article", doc.children);
		r.ok(article, `${p.url}: no <article>`);
		let date = DomUtils.findOne(el => el.attribs?.class === "date", doc.children);
		let time = date && DomUtils.findOne(el => el.name === "time", date.children);
		r.ok(time?.attribs.datetime === p.date, `${p.url}: published datetime ${time?.attribs.datetime} does not match front matter ${p.date}`);
		if(p.bodyLength > 100) {
			r.ok(article && textOf(article).length > 100, `${p.url}: article body missing from initial HTML`);
		}
	}

	// → / ← rows after each article
	let linksOut = new Map();
	for(let p of published) {
		let article = DomUtils.findOne(el => el.name === "article", parsed.get(path.join(siteDir, "blog", p.slug, "index.html"))?.children || []);
		let targets = new Set(parentOf(p) ? [parentOf(p)] : []);
		for(let a of article ? DomUtils.findAll(el => el.name === "a" && el.attribs.href, article.children) : []) {
			let url = new URL(a.attribs.href, `http://site.invalid${p.url}`);
			let slug = (url.origin === "http://site.invalid" || url.href.startsWith(ORIGIN)) && url.pathname.match(/^\/blog\/([^/]+)\/$/)?.[1];
			let target = bySlug.get(slug);
			if(target && target !== p) {
				targets.add(target);
			}
		}
		linksOut.set(p, [...targets]);
	}
	for(let p of published) {
		let doc = parsed.get(path.join(siteDir, "blog", p.slug, "index.html"));
		if(!doc) {
			continue;
		}
		let expected = [
			["→", linksOut.get(p)],
			["←", published.filter(q => linksOut.get(q).includes(p))],
		].filter(([, list]) => list.length).map(([arrow, list]) => `${arrow} ${list.map(q => q.url).join(" ")}`);
		let nav = DomUtils.findAll(el => el.name === "nav" && el.attribs.class === "links", doc.children);
		let shown = nav.flatMap(n => DomUtils.findAll(el => el.name === "div" && el.attribs.class === "row", n.children))
			.map(row => `${textOf(DomUtils.findOne(el => el.name === "span", row.children) || row)} ${DomUtils.findAll(el => el.name === "a", row.children).map(a => a.attribs.href).join(" ")}`);
		r.ok(nav.length === (expected.length ? 1 : 0) && JSON.stringify(shown) === JSON.stringify(expected), `${p.url}: link rows ${JSON.stringify(shown)}, expected ${JSON.stringify(expected)}`);
	}

	// Older and newer post by date, after the → / ← rows.
	published.forEach((p, i) => {
		let doc = parsed.get(path.join(siteDir, "blog", p.slug, "index.html"));
		if(!doc) {
			return;
		}
		let expected = `older ${published[i + 1]?.url ?? "-"} newer ${published[i - 1]?.url ?? "-"}`;
		let nav = DomUtils.findAll(el => el.name === "nav" && el.attribs.class === "pager", doc.children);
		let rel = (name) => nav.flatMap(n => DomUtils.findAll(el => el.name === "a" && el.attribs.rel === name, n.children))[0]?.attribs.href ?? "-";
		let shown = `older ${rel("prev")} newer ${rel("next")}`;
		r.ok(nav.length === 1 && shown === expected, `${p.url}: pager "${shown}", expected "${expected}"`);
	});

	// `extends` names an existing note other than itself, without a cycle
	for(let p of published.filter(q => q.extends)) {
		let parent = published.find(q => q.slug === p.extends);
		r.ok(parent && parent !== p, `${p.file}: extends "${p.extends}", which is not another note`);
		let seen = new Set([p]);
		for(let q = parent; q?.extends; q = published.find(x => x.slug === q.extends)) {
			if(!r.ok(!seen.has(q), `${p.file}: extends chain loops back through ${q.file}`)) {
				break;
			}
			seen.add(q);
		}
	}

	// Each tag page lists exactly the published posts with that tag, newest first
	for(let tag of publishedTags) {
		let doc = parsed.get(path.join(siteDir, "tags", slugify(tag), "index.html"));
		if(!doc) {
			continue;
		}
		let hrefs = listed(doc).map(x => x.href);
		let expected = published.filter(p => p.tags.includes(tag)).map(p => p.url);
		r.ok(JSON.stringify(hrefs) === JSON.stringify(expected), `/tags/${slugify(tag)}/ lists ${hrefs}, expected ${expected}`);
	}

	// Feed and sitemap
	let xmlParser = new XMLParser({ ignoreAttributes: false, isArray: (n) => ["entry", "url", "link"].includes(n) });
	let feedText = texts.get(path.join(siteDir, "feed.xml"));
	if(feedText) {
		r.ok(XMLValidator.validate(feedText) === true, "feed.xml is not well-formed XML");
		let feed = xmlParser.parse(feedText).feed;
		r.ok(feed?.id?.startsWith(ORIGIN), `feed id ${feed?.id} does not use ${ORIGIN}`);
		for(let link of feed?.link || []) {
			r.ok(link["@_href"].startsWith(ORIGIN), `feed link ${link["@_href"]} does not use ${ORIGIN}`);
		}
		let entries = feed?.entry || [];
		r.ok(entries.length === Math.min(published.length, 20), `feed has ${entries.length} entries, expected ${published.length}`);
		for(let entry of entries) {
			let href = entry.link?.[0]?.["@_href"] || "";
			r.ok(href.startsWith(ORIGIN) && await fileForUrl(siteDir, new URL(href).pathname), `feed entry link ${href} does not resolve to a page`);
			r.ok(!/<script/i.test(String(entry.content?.["#text"] ?? entry.content ?? "")), `feed entry ${href} contains a script`);
		}
	}
	let sitemapText = texts.get(path.join(siteDir, "sitemap.xml"));
	if(sitemapText) {
		r.ok(XMLValidator.validate(sitemapText) === true, "sitemap.xml is not well-formed XML");
		let locs = (xmlParser.parse(sitemapText).urlset?.url || []).map(u => u.loc);
		for(let loc of locs) {
			r.ok(loc.startsWith(ORIGIN) && await fileForUrl(siteDir, new URL(loc).pathname), `sitemap entry ${loc} does not resolve to a page`);
		}
		for(let page of ["", "blog/", "tags/", "about/", ...published.map(p => p.url.slice(1))]) {
			r.ok(locs.includes(ORIGIN + page), `sitemap is missing ${ORIGIN}${page}`);
		}
		r.ok(!locs.some(l => l.endsWith("404.html")), "sitemap lists the 404 page");
	}

	r.note(`${htmlFiles.length} HTML pages, ${files.length} files, ${published.length} published posts`);
	return r;
}

// A note's optional raw dump sits next to it as <slug>.raw.txt. It is
// published as the same string the author typed (HTML-escaped), so we round-
// trip its content out of the rendered page and compare.
async function checkRaws(siteDir, posts) {
	let r = new Report("Raw dumps: present, dated, copied byte for byte");
	let decodeHtml = (s) => s.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, "\"").replace(/&#39;/g, "'").replace(/&#92;/g, "\\").replace(/&amp;/g, "&");
	for(let post of posts.published) {
		let file = path.join(projectRoot, post.file.replace(/\.md$/, ".raw.txt"));
		let hasFile = await exists(file);
		r.ok(hasFile === Boolean(post.raw_at), `${post.file}: ${hasFile && post.raw_at ? "raw" : !hasFile && !post.raw_at ? "no raw" : post.raw_at ? "raw_at is set but no .raw.txt" : ".raw.txt exists but no raw_at"}`);
		if(!hasFile) {
			continue;
		}
		let source = await readFile(file, "utf8");
		let page = path.join(siteDir, "blog", post.slug, "index.html");
		if(!await exists(page)) {
			continue;
		}
		let html = await readFile(page, "utf8");
		let pre = html.match(/<details class="raw">[\s\S]*?<pre>([\s\S]*?)<\/pre>/);
		r.ok(pre, `${post.file}: <details class="raw"> not rendered`);
		if(!pre) {
			continue;
		}
		r.ok(pre[1].startsWith("\n") && decodeHtml(pre[1].slice(1)) === source, `${post.file}: rendered raw differs from <slug>.raw.txt`);
		let summary = html.match(/<details class="raw">[\s\S]*?<summary>([\s\S]*?)<\/summary>/);
		r.ok(summary && /typed <time datetime="\d{4}-\d{2}-\d{2}T\d{2}:\d{2}">/.test(summary[1]), `${post.file}: raw summary missing typed <time datetime>`);
	}
	let blogDir = path.join(projectRoot, "content/blog");
	if(await exists(blogDir)) {
		let notes = new Set(posts.published.map(p => p.file.replace(/\.md$/, ".raw.txt")));
		for(let name of (await readdir(blogDir)).filter(n => n.endsWith(".raw.txt"))) {
			let rel = `content/blog/${name}`;
			if(!notes.has(rel)) {
				r.note(`${rel}: no note yet (not published)`);
			}
		}
	}
	return r;
}

// ------------------------------------------------------------------- main

let siteDir = path.join(projectRoot, "_site");
if(!await exists(path.join(siteDir, "index.html"))) {
	console.error("_site/index.html not found. Run `npm run build` before `npm run check`.");
	process.exit(1);
}

let posts = await readPosts(projectRoot);
let reports = [await checkSite(siteDir, { label: "Production output in _site/", posts })];
reports.push(await checkRaws(siteDir, posts));

let ok = reports.map(r => r.print()).every(Boolean);
console.log(ok ? "\nAll checks passed." : "\nSome checks failed.");
process.exit(ok ? 0 : 1);
