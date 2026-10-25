import metadata from "../_data/metadata.js";

// Notes form a graph: the links the author wrote between notes, plus
// `extends`. It is shown as the index tree and the → / ← rows on each note.

// Links to another note: /blog/<slug>/ (relative or on the production origin,
// any #fragment or ?query), or a Markdown path ending in <slug>.md, which the
// InputPathToUrl plugin rewrites to the same URL.
function slugOf(href) {
	if(!href) {
		return undefined;
	}
	if(href.startsWith(metadata.url)) {
		href = "/" + href.slice(metadata.url.length);
	}
	let p = href.split(/[?#]/)[0];
	return (p.match(/^\/blog\/([^/]+)\/?$/) || p.match(/(?:^|\/)([^/]+)\.md$/))?.[1];
}

// Hrefs in Markdown body order. Parsing tokens rather than text skips link
// syntax inside code; raw HTML anchors are read from html tokens.
function hrefsIn(tokens, out = []) {
	for(let t of tokens) {
		if(t.type === "link_open") {
			let href = t.attrs?.find(([k]) => k === "href")?.[1];
			if(href) {
				out.push(href);
			}
		} else if(t.children) {
			hrefsIn(t.children, out);
		}
	}
	return out;
}

// `posts` is the collection, oldest first; everything below walks it newest
// first, so lists come out newest first with the collection's tie order.
function build(posts, md) {
	let newest = [...posts].reverse();
	let bySlug = new Map(posts.map(p => [p.page.fileSlug, p]));
	let parentOf = (p) => {
		let q = bySlug.get(p.data.extends);
		return q !== p ? q : undefined;
	};
	// One level of nesting, ever: a note extending a child is listed under
	// that child's own parent. Cycles and missing parents leave a note at the
	// top level (`npm run check` reports both).
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

	let out = new Map();
	let incoming = new Map(posts.map(p => [p, []]));
	let children = new Map(posts.map(p => [p, []]));
	let top = [];
	for(let p of newest) {
		let targets = new Set();
		let parent = parentOf(p);
		if(parent) {
			targets.add(parent);
		}
		for(let href of hrefsIn(md.parse(p.rawInput || "", {}))) {
			let target = bySlug.get(slugOf(href));
			if(target && target !== p) {
				targets.add(target);
			}
		}
		out.set(p, [...targets]);
		for(let t of targets) {
			incoming.get(t).push(p);
		}
		let root = rootOf(p);
		if(root) {
			children.get(root).push(p);
		} else {
			top.push(p);
		}
	}
	let tree = top.flatMap(p => [{ post: p, child: false }, ...children.get(p).map(c => ({ post: c, child: true }))]);
	return { out, incoming, tree };
}

export default function(eleventyConfig) {
	let md;
	eleventyConfig.amendLibrary("md", (lib) => {
		md = lib;
	});

	// Built once per collection array, i.e. once per build.
	let cache = new WeakMap();
	let graphOf = (posts) => {
		if(!cache.has(posts)) {
			cache.set(posts, build(posts, md));
		}
		return cache.get(posts);
	};

	// Rows for postslist.njk, newest first. `nested`: the index tree, with
	// children directly under their parent.
	eleventyConfig.addFilter("postRows", (posts, nested) => {
		if(nested) {
			return graphOf(posts || []).tree;
		}
		return [...(posts || [])].reverse().map(post => ({ post, child: false }));
	});

	// { out, in } for the note at `url`: notes it links to (parent first, then
	// body order, deduplicated) and notes linking to it, newest first.
	eleventyConfig.addFilter("noteLinks", (posts, url) => {
		let graph = graphOf(posts || []);
		let note = (posts || []).find(p => p.url === url);
		return { out: graph.out.get(note) || [], in: graph.incoming.get(note) || [] };
	});
}
