// Runs axe and HTML_CodeSniffer (through pa11y) against every page in both themes.
// Any WCAG 2.1 AA error fails the build.
//
// audit-before.html is deliberately broken, so it is checked the other way round:
// the tools must still find the issues the audit report says they find.
import pa11y from "pa11y";
import { startServer } from "./serve.mjs";

const PORT = 4174;
const BASE = `http://127.0.0.1:${PORT}`;
const PAGES = ["index.html", "audit.html", "audit-after.html", "design-system.html", "components.html"];
const THEMES = ["light", "dark"];

// Rules the audit report says the automated tools catch on the broken page
const EXPECTED_ON_BEFORE = [
  "html-has-lang", "image-alt", "label", "color-contrast", "bypass",
  "WCAG2AA.Principle4.Guideline4_1.4_1_2.H91.InputText.Name",
];

const options = {
  standard: "WCAG2AA",
  runners: ["axe", "htmlcs"],
  chromeLaunchConfig: { args: ["--no-sandbox"] },
};

const server = await startServer(PORT);
let failures = 0;

try {
  for (const page of PAGES) {
    for (const theme of THEMES) {
      const result = await pa11y(`${BASE}/${page}?theme=${theme}`, options);
      const errors = result.issues.filter((i) => i.type === "error");
      console.log(`${page} (${theme}): ${errors.length} error(s)`);
      errors.forEach((i) => console.log(`  - [${i.runner}] ${i.code}\n    ${i.message}\n    ${i.selector}`));
      failures += errors.length;
    }
  }

  const before = await pa11y(`${BASE}/audit-before.html`, options);
  const found = new Set(before.issues.filter((i) => i.type === "error").map((i) => i.code));
  const missing = EXPECTED_ON_BEFORE.filter((code) => !found.has(code));
  console.log(`audit-before.html (expected to fail): ${found.size} rule(s) flagged`);
  if (missing.length) {
    console.log(`  - expected these to be flagged but they were not: ${missing.join(", ")}`);
    failures += missing.length;
  }
} finally {
  server.close();
}

if (failures) {
  console.error(`\nAccessibility check failed with ${failures} problem(s).`);
  process.exit(1);
}
console.log("\nAccessibility check passed.");
