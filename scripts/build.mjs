// Copies static files from src to dist and compiles Sass.
import { cpSync, rmSync, mkdirSync } from "node:fs";
import { compile } from "sass";
import { writeFileSync } from "node:fs";

rmSync("dist", { recursive: true, force: true });
cpSync("src", "dist", {
  recursive: true,
  filter: (path) => !path.replaceAll("\\", "/").includes("/scss"),
});

const { css } = compile("src/scss/main.scss", { style: "compressed" });
mkdirSync("dist/css", { recursive: true });
writeFileSync("dist/css/main.css", css);

console.log("Built to dist/");
