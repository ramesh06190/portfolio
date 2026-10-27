// Copies static files from src to dist, resolves HTML includes and compiles Sass.
import { cpSync, rmSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { compile } from "sass";

const SKIP = ["/scss", "/partials"];

rmSync("dist", { recursive: true, force: true });
cpSync("src", "dist", {
  recursive: true,
  filter: (path) => !SKIP.some((dir) => path.replaceAll("\\", "/").includes(dir)),
});

// <!-- @include name --> pulls in src/partials/name.html
const partial = (name) => readFileSync(`src/partials/${name}.html`, "utf8").trimEnd();

for (const file of readdirSync("src").filter((f) => f.endsWith(".html"))) {
  let html = readFileSync(`src/${file}`, "utf8");
  html = html.replace(/^[ \t]*<!-- @include (\w+) -->/gm, (_, name) => partial(name));

  // Mark the nav link for this page with aria-current, read from <body data-page="...">
  const page = html.match(/<body[^>]*data-page="([^"]+)"/)?.[1];
  if (page) {
    html = html.replace(
      new RegExp(`(<a [^>]*data-page="${page}")`, "g"),
      '$1 aria-current="page"',
    );
  }
  writeFileSync(`dist/${file}`, html);
}

const { css } = compile("src/scss/main.scss", { style: "compressed" });
mkdirSync("dist/css", { recursive: true });
writeFileSync("dist/css/main.css", css);

console.log("Built to dist/");
