// Serves the existing `_site/` folder as plain static files: no rebuild,
// no live reload, no injected scripts. Binds to 127.0.0.1 by default.
//
//   npm run preview                 first free port from 8080
//   PORT=9000 npm run preview       exactly port 9000 (fails if busy)
//   HOST=0.0.0.0 npm run preview    expose on the local network
import { createServer } from "node:http";
import net from "node:net";
import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
export const siteDir = path.join(projectRoot, "_site");

const TYPES = {
	".html": "text/html; charset=utf-8",
	".css": "text/css; charset=utf-8",
	".xml": "application/xml; charset=utf-8",
	".svg": "image/svg+xml",
	".png": "image/png",
	".jpg": "image/jpeg",
	".jpeg": "image/jpeg",
	".gif": "image/gif",
	".webp": "image/webp",
	".avif": "image/avif",
	".ico": "image/x-icon",
	".txt": "text/plain; charset=utf-8",
};

async function resolveFile(urlPath) {
	let decoded;
	try {
		decoded = decodeURIComponent(urlPath);
	} catch {
		return null;
	}
	let filePath = path.join(siteDir, path.normalize(decoded));
	if(filePath !== siteDir && !filePath.startsWith(siteDir + path.sep)) {
		return null;
	}
	try {
		let info = await stat(filePath);
		if(info.isDirectory()) {
			filePath = path.join(filePath, "index.html");
			info = await stat(filePath);
		}
		return info.isFile() ? filePath : null;
	} catch {
		return null;
	}
}

function send(res, status, filePath, method) {
	res.writeHead(status, {
		"Content-Type": TYPES[path.extname(filePath).toLowerCase()] || "application/octet-stream",
		"Cache-Control": "no-store",
	});
	if(method === "HEAD") {
		res.end();
		return;
	}
	createReadStream(filePath).pipe(res);
}

export function createPreviewServer() {
	return createServer(async (req, res) => {
		if(req.method !== "GET" && req.method !== "HEAD") {
			res.writeHead(405, { Allow: "GET, HEAD" }).end();
			return;
		}
		let { pathname } = new URL(req.url, "http://localhost");
		// Directory URLs without a trailing slash redirect, like most static hosts.
		if(!pathname.endsWith("/") && !path.extname(pathname)) {
			let dir = await resolveFile(pathname);
			if(dir?.endsWith(`${path.sep}index.html`)) {
				res.writeHead(301, { Location: `${pathname}/` }).end();
				return;
			}
		}
		let filePath = await resolveFile(pathname);
		if(filePath) {
			send(res, 200, filePath, req.method);
			return;
		}
		let notFound = await resolveFile("/404.html");
		if(notFound) {
			send(res, 404, notFound, req.method);
		} else {
			res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" }).end("Not found");
		}
	});
}

// True when something already accepts connections on `port` over IPv4 or IPv6
// loopback. Needed because macOS lets a new 127.0.0.1 listener share a port
// with an existing wildcard listener instead of failing with EADDRINUSE.
function portAnswers(port) {
	let probe = (host) => new Promise((resolve) => {
		let socket = net.connect({ port, host });
		let done = (answer) => {
			socket.destroy();
			resolve(answer);
		};
		socket.setTimeout(300, () => done(false));
		socket.once("connect", () => done(true));
		socket.once("error", () => done(false));
	});
	return Promise.all([probe("127.0.0.1"), probe("::1")]).then(r => r.some(Boolean));
}

// Listens on `port`, or on the next free port when `port` is busy and `strict`
// is false. Port 0 asks the OS for any free port. Never touches whatever
// already owns a port.
export async function listen(server, { host = "127.0.0.1", port = 8080, strict = false, attempts = 20 } = {}) {
	for(let p = port, left = attempts; ; p++, left--) {
		let busy = p !== 0 && await portAnswers(p);
		if(!busy) {
			try {
				await new Promise((resolve, reject) => {
					server.once("error", reject);
					server.listen(p, host, () => {
						server.off("error", reject);
						resolve();
					});
				});
				return server.address().port;
			} catch(error) {
				if(error.code !== "EADDRINUSE") {
					throw error;
				}
			}
		}
		if(strict || left <= 1) {
			throw new Error(`Port ${p} is already in use${strict ? "" : ` (tried ${port}–${p})`}. Set PORT to a free port.`);
		}
	}
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if(isMain) {
	try {
		await stat(path.join(siteDir, "index.html"));
	} catch {
		console.error("[preview] _site/index.html not found. Run `npm run build` first.");
		process.exit(1);
	}
	let host = process.env.HOST || "127.0.0.1";
	let port;
	try {
		port = await listen(createPreviewServer(), {
			host,
			port: Number(process.env.PORT) || 8080,
			strict: Boolean(process.env.PORT),
		});
	} catch(error) {
		console.error(`[preview] ${error.message}`);
		process.exit(1);
	}
	let shownHost = host.includes(":") ? `[${host}]` : host;
	console.log(`[preview] Serving _site/ at http://${shownHost}:${port}/ (Ctrl+C to stop)`);
}
