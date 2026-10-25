// Browser inspection of the production build with JavaScript disabled.
// Serves the existing `_site/` on a free loopback port (no rebuild, nothing
// injected), drives it with Playwright, and saves screenshots under
// `artifacts/preview/` (local evidence only, never published).
//
//   npm run build && npm run check:browser
//
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";
import { createPreviewServer, listen, siteDir } from "./preview.js";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const shotsDir = path.join(projectRoot, "artifacts/preview");
const LONG_ARTICLE = "/blog/fundamentals-how-i-leverage-ai/";
const START_ARTICLE = "/blog/why-learn-a-new-lang/";
const LINKED_ARTICLE = "/blog/languages/";
const FORMATTING_ARTICLE = "/blog/domain-logic-dx/";

const results = [];
function record(name, ok, detail = "") {
	results.push({ name, ok, detail });
	let mark = ok ? "PASS" : "FAIL";
	console.log(`  ${mark}  ${name}${detail ? ` (${detail})` : ""}`);
}

async function step(name, fn) {
	try {
		let detail = await fn();
		record(name, true, detail);
	} catch (error) {
		record(name, false, error.message);
	}
}

function assert(condition, message) {
	if(!condition) {
		throw new Error(message);
	}
}

async function launch() {
	try {
		let browser = await chromium.launch({ headless: true });
		return { browser, engine: "Chromium" };
	} catch (error) {
		let browser = await chromium.launch({ channel: "chrome", headless: true });
		return { browser, engine: "Google Chrome" };
	}
}

let server = createPreviewServer();
let port = await listen(server, { port: 0, strict: true });
let base = `http://127.0.0.1:${port}`;
let { browser, engine } = await launch();
console.log(`Serving ${path.relative(projectRoot, siteDir)}/ at ${base}/ · ${engine} ${browser.version()} · javaScriptEnabled: false\n`);
await mkdir(shotsDir, { recursive: true });

// Every request made by every page, to prove no script or third-party load.
const requests = [];
async function newContext(options = {}) {
	let ctx = await browser.newContext({ ...options, javaScriptEnabled: false });
	ctx.on("request", (req) => requests.push({ url: req.url(), type: req.resourceType() }));
	return ctx;
}

try {
	let ctx = await newContext({ viewport: { width: 1440, height: 1000 } });
	await step("Context really has JavaScript disabled (probe page with an inline script)", async () => {
		let probe = await ctx.newPage();
		await probe.route(base + "/__js-probe", route => route.fulfill({
			contentType: "text/html",
			body: "<title>scripts off</title><script>document.title = 'scripts on'</script>",
		}));
		await probe.goto(base + "/__js-probe");
		let title = await probe.title();
		await probe.close();
		assert(title === "scripts off", `probe script ran (title: ${title})`);
		return "inline probe script did not run";
	});

	// 1. Navigation from a fresh, direct article URL, using only links.
	let page = await ctx.newPage();

	await step("JS-disabled navigation: article → index → tags → tag → article → about", async () => {
		let response = await page.goto(base + START_ARTICLE);
		assert(response.status() === 200, `article returned ${response.status()}`);
		assert(await page.locator("article p").first().isVisible(), "article body not visible");
		assert(await page.locator("article .date time").isVisible(), "article date not visible");
		let trail = [START_ARTICLE];
		let nav = () => page.getByRole("navigation", { name: "Site" });
		let go = async (locator, expected) => {
			await Promise.all([page.waitForURL(base + expected), locator.click()]);
			assert(await page.locator("h1").count() === 1, `${expected} has no single h1`);
			trail.push(expected);
		};
		let back = () => go(page.locator("header .site a"), "/");
		await back();
		await go(nav().getByRole("link", { name: "Tags", exact: true }), "/tags/");
		await go(page.locator("main").getByRole("link", { name: "programming", exact: true }), "/tags/programming/");
		await go(page.locator("main").getByRole("link", { name: "Why Learn a NEW Language (Programming)", exact: true }), START_ARTICLE);
		await back();
		await go(nav().getByRole("link", { name: "About", exact: true }), "/about/");
		return trail.join(" → ");
	});

	await step("Feed, sitemap and 404 respond from the static server", async () => {
		let feed = await page.request.get(base + "/feed.xml");
		assert(feed.ok() && feed.headers()["content-type"].includes("xml"), "feed not served as XML");
		let sitemap = await page.request.get(base + "/sitemap.xml");
		assert(sitemap.ok(), "sitemap missing");
		let missing = await page.goto(base + "/no-such-page/");
		assert(missing.status() === 404, `expected 404, got ${missing.status()}`);
		assert(await page.locator("h1").textContent() === "This page is not here", "404 page not rendered");
		return "feed.xml 200 xml, sitemap 200, unknown URL 404 with styled page";
	});

	// 2. Keyboard and semantics.
	await step("Keyboard: skip link is first, visible on focus, and moves focus to main", async () => {
		await page.goto(base + "/");
		await page.keyboard.press("Tab");
		let skip = page.locator(".skip-link");
		assert(await skip.evaluate(el => el === document.activeElement), "first Tab did not focus the skip link");
		let box = await skip.boundingBox();
		assert(box && box.y >= 0 && box.y < 100, "skip link not visible when focused");
		await page.keyboard.press("Enter");
		assert(page.url().endsWith("#main"), "skip link did not navigate to #main");
		await page.keyboard.press("Tab");
		let inMain = await page.evaluate(() => document.activeElement.closest("main") !== null);
		assert(inMain, "next Tab after skip did not land inside main");
		return "home: Tab → skip link at top; Enter → #main; next Tab inside main";
	});

	await step("Keyboard: header links reachable in order with a visible focus outline", async () => {
		await page.goto(base + "/");
		let order = [];
		for(let i = 0; i < 6; i++) {
			await page.keyboard.press("Tab");
			let info = await page.evaluate(() => {
				let el = document.activeElement;
				let style = getComputedStyle(el);
				return { text: el.textContent.trim(), outline: style.outlineStyle, width: parseFloat(style.outlineWidth) };
			});
			assert(info.outline !== "none" && info.width >= 2, `"${info.text}" has no visible focus outline`);
			order.push(info.text);
		}
		let expected = ["skip to content", "odjhey", "Blog", "Tags", "About", "RSS"];
		assert(JSON.stringify(order) === JSON.stringify(expected), `focus order was ${order.join(", ")}`);
		return order.join(" → ");
	});

	await step("Semantics: landmarks, one h1, no skipped heading levels", async () => {
		let checked = [];
		for(let url of ["/", "/tags/", "/tags/programming/", "/about/", START_ARTICLE, LONG_ARTICLE, FORMATTING_ARTICLE]) {
			await page.goto(base + url);
			for(let role of ["banner", "navigation", "main", "contentinfo"]) {
				assert(await page.getByRole(role).first().isVisible(), `${url}: missing ${role} landmark`);
			}
			let levels = await page.locator("h1, h2, h3, h4, h5, h6").evaluateAll(els => els.map(el => Number(el.tagName[1])));
			assert(levels.filter(l => l === 1).length === 1, `${url}: ${levels.filter(l => l === 1).length} h1`);
			levels.forEach((l, i) => assert(i === 0 || l <= levels[i - 1] + 1, `${url}: h${levels[i - 1]} → h${l}`));
			checked.push(url);
		}
		return `${checked.length} pages`;
	});

	await step("Note graph: → / ← rows after the article, followed with JavaScript off", async () => {
		await page.goto(base + START_ARTICLE);
		let links = page.getByRole("navigation", { name: "Linked notes" });
		assert(await links.evaluate(nav => nav.previousElementSibling?.tagName === "ARTICLE"), "link rows are not right after the article");
		assert(await links.getByRole("img", { name: "Links to" }).isVisible(), "→ row missing");
		await Promise.all([page.waitForURL(base + LINKED_ARTICLE), links.getByRole("link", { name: "Languages" }).click()]);
		let back = page.getByRole("navigation", { name: "Linked notes" });
		assert(await back.getByRole("img", { name: "Linked from" }).isVisible(), "← row missing on the linked note");
		await Promise.all([page.waitForURL(base + START_ARTICLE), back.getByRole("link", { name: "Why Learn a NEW Language (Programming)" }).click()]);
		return `${START_ARTICLE} → ${LINKED_ARTICLE} ← back`;
	});

	await step("Print stylesheet hides header and footer and keeps the article", async () => {
		await page.goto(base + LONG_ARTICLE);
		await page.emulateMedia({ media: "print" });
		assert(!await page.locator("body > header").isVisible(), "header visible in print");
		assert(!await page.locator("body > footer").isVisible(), "footer visible in print");
		assert(await page.locator("article").isVisible(), "article hidden in print");
		await page.emulateMedia({ media: "screen" });
		return "header and footer hidden; article visible";
	});

	await step("Dark mode follows the device setting: true black background, grey text", async () => {
		let colours = {};
		for(let scheme of ["light", "dark"]) {
			await page.emulateMedia({ colorScheme: scheme });
			await page.goto(base + LONG_ARTICLE);
			colours[scheme] = await page.evaluate(() => {
				let s = getComputedStyle(document.documentElement);
				return { bg: s.backgroundColor, text: s.color };
			});
		}
		await page.emulateMedia({ colorScheme: "light" });
		assert(colours.light.bg === "rgb(255, 255, 255)", `light background is ${colours.light.bg}`);
		assert(colours.dark.bg === "rgb(0, 0, 0)", `dark background is ${colours.dark.bg}`);
		assert(colours.dark.text === "rgb(184, 184, 184)", `dark text is ${colours.dark.text}, expected #b8b8b8`);
		return `light ${colours.light.bg} / ${colours.light.text}; dark ${colours.dark.bg} / ${colours.dark.text}`;
	});

	await step("Column is left-pinned: 16px gutter on phones, 2rem from 900px, 15vw from 1600px", async () => {
		let seen = [];
		for(let [width, left] of [[390, 16], [1000, 32], [1440, 32], [1920, 288]]) {
			await page.setViewportSize({ width, height: 900 });
			await page.goto(base + LONG_ARTICLE);
			let x = (await page.locator("body").boundingBox()).x;
			let pad = await page.evaluate(() => parseFloat(getComputedStyle(document.body).paddingLeft));
			assert(Math.abs(x + pad - left) < 2, `at ${width}px the content starts at ${x + pad}px, expected ${left}px`);
			seen.push(`${width}→${x + pad}`);
		}
		return seen.join(", ");
	});
	await ctx.close();

	// 3. Responsive layouts and screenshots.
	let sizes = [
		{ label: "desktop", width: 1440, height: 1000 },
		{ label: "mobile", width: 390, height: 844 },
		{ label: "narrow", width: 320, height: 700 },
	];
	for(let size of sizes) {
		let context = await newContext({ viewport: { width: size.width, height: size.height }, deviceScaleFactor: size.label === "desktop" ? 1 : 2, hasTouch: size.label !== "desktop" });
		let p = await context.newPage();
		await step(`Responsive ${size.width}×${size.height}: no page-wide horizontal overflow; nav visible without hover`, async () => {
			let pages = ["/", "/tags/", "/about/", START_ARTICLE, LONG_ARTICLE, FORMATTING_ARTICLE, "/tags/programming/"];
			for(let url of pages) {
				await p.goto(base + url);
				let { scrollWidth, clientWidth } = await p.evaluate(() => ({ scrollWidth: document.documentElement.scrollWidth, clientWidth: document.documentElement.clientWidth }));
				assert(scrollWidth <= clientWidth, `${url}: page is ${scrollWidth}px wide in a ${clientWidth}px viewport`);
				for(let name of ["Blog", "Tags", "About", "RSS"]) {
					assert(await p.getByRole("navigation", { name: "Site" }).getByRole("link", { name, exact: true }).isVisible(), `${url}: nav link ${name} hidden`);
				}
			}
			if(size.label !== "narrow") {
				for(let scheme of ["light", "dark"]) {
					await p.emulateMedia({ colorScheme: scheme });
					for(let [name, url] of [["home", "/"], ["article", LONG_ARTICLE]]) {
						await p.goto(base + url);
						await p.screenshot({ path: path.join(shotsDir, `${name}-${size.label}${scheme === "dark" ? "-dark" : ""}.png`), fullPage: true });
					}
				}
			}
			return `${pages.length} pages checked`;
		});
		await context.close();
	}

	// 4. Requests made during the whole session.
	await step("No script or third-party requests during browsing", async () => {
		let scripts = requests.filter(r => r.type === "script" || /\.(m?js)(\?|$)/.test(r.url));
		let external = requests.filter(r => !r.url.startsWith(base));
		assert(scripts.length === 0, `script requests: ${scripts.map(r => r.url).join(", ")}`);
		assert(external.length === 0, `external requests: ${external.map(r => r.url).join(", ")}`);
		let types = [...new Set(requests.map(r => r.type))].sort().join(", ");
		return `${requests.length} requests, all to ${base}; types: ${types}`;
	});
} finally {
	await browser.close();
	server.close();
}

let failed = results.filter(r => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} browser checks passed. Screenshots: ${path.relative(projectRoot, shotsDir)}/`);
process.exit(failed.length ? 1 : 0);
