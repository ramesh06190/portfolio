// Tiny static server for dist, used for local preview and the accessibility tests.
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";

const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css",
  ".js": "text/javascript",
  ".svg": "image/svg+xml",
  ".png": "image/png",
};

export function startServer(port = 4173) {
  const server = createServer(async (req, res) => {
    const urlPath = decodeURIComponent(new URL(req.url, "http://x").pathname);
    const safe = normalize(urlPath).replace(/^(\.\.[\\/])+/, "");
    const file = join("dist", safe.endsWith("/") || safe.endsWith("\\") ? join(safe, "index.html") : safe);
    try {
      const body = await readFile(file);
      res.writeHead(200, { "Content-Type": types[extname(file)] || "application/octet-stream" });
      res.end(body);
    } catch {
      res.writeHead(404).end("Not found");
    }
  });
  return new Promise((resolve) => server.listen(port, "127.0.0.1", () => resolve(server)));
}

// Only start listening when run directly (npm run serve or Playwright), not when imported by a11y.mjs
if (process.argv[1]?.endsWith("serve.mjs")) {
  const port = Number(process.env.PORT) || 4173;
  await startServer(port);
  console.log(`Serving dist at http://127.0.0.1:${port}`);
}
