// Runs axe and HTML_CodeSniffer (through pa11y) against the built site in both themes.
// Any WCAG 2.1 AA error fails the build.
import pa11y from "pa11y";
import { startServer } from "./serve.mjs";

const server = await startServer(4174);
const pages = [
  "http://127.0.0.1:4174/?theme=light",
  "http://127.0.0.1:4174/?theme=dark",
];

let failures = 0;
try {
  for (const url of pages) {
    const result = await pa11y(url, {
      standard: "WCAG2AA",
      runners: ["axe", "htmlcs"],
      chromeLaunchConfig: { args: ["--no-sandbox"] },
    });
    const errors = result.issues.filter((i) => i.type === "error");
    console.log(`\n${url}: ${errors.length} error(s)`);
    errors.forEach((i) => console.log(` - [${i.runner}] ${i.code}\n   ${i.message}\n   ${i.selector}`));
    failures += errors.length;
  }
} finally {
  server.close();
}

if (failures) {
  console.error(`\nAccessibility check failed with ${failures} error(s).`);
  process.exit(1);
}
console.log("\nAccessibility check passed.");
