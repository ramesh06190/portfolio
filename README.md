# Pydi Adapa portfolio

[![Build, test and deploy](https://github.com/ramesh06190/portfolio/actions/workflows/deploy.yml/badge.svg)](https://github.com/ramesh06190/portfolio/actions/workflows/deploy.yml)
![WCAG 2.1 AA](https://img.shields.io/badge/WCAG-2.1%20AA-0b5cad)
![Lighthouse accessibility 100](https://img.shields.io/badge/Lighthouse%20accessibility-100-1e6b34)
![Playwright keyboard tests](https://img.shields.io/badge/Playwright-keyboard%20tests-2ead33)
![No framework](https://img.shields.io/badge/HTML5%20%2B%20Sass%20%2B%20vanilla%20JS-no%20framework-4a5561)

My personal portfolio and front-end code sample, live at
**https://ramesh06190.github.io/portfolio/**

It is hand written HTML5, Sass and vanilla JavaScript with no UI framework, built on its own
small design system and tested to WCAG 2.1 AA on every push.

## Pages

| Page | What it shows |
|---|---|
| [Home](https://ramesh06190.github.io/portfolio/) | Experience, case studies, tabs, accordion, dialog and form validation |
| [Accessibility audit](https://ramesh06190.github.io/portfolio/audit.html) | A WCAG 2.1 AA audit of a deliberately broken legacy form: 16 findings mapped to success criteria, how each was found, and the fix |
| [Fixed form](https://ramesh06190.github.io/portfolio/audit-after.html) | The remediated version of that form |
| [Design system](https://ramesh06190.github.io/portfolio/design-system.html) | Tokens, live contrast checks, component states, usage guidance, and design system vs Bootstrap |
| [Components](https://ramesh06190.github.io/portfolio/components.html) | Sortable paginated table, autocomplete combobox, memorable date input, multi-step form |

## Code tour

| Area | Where |
|---|---|
| Design tokens (color, spacing, type, breakpoints) | `src/scss/tokens/` |
| Light and dark themes generated from the token maps | `src/scss/_base.scss` |
| Component styles | `src/scss/components/` |
| One ES module per component | `src/js/modules/` |
| Markup driven form validation shared by every form | `src/js/modules/validation.js` |
| Shared head, header and footer | `src/partials/`, resolved by `scripts/build.mjs` |
| Accessibility scan (axe and HTML_CodeSniffer) | `scripts/a11y.mjs` |
| Keyboard tests | `tests/keyboard.spec.js` |
| Lighthouse budgets | `lighthouserc.json` |
| CI/CD pipeline | `.github/workflows/deploy.yml` |

## Testing

Every push runs four checks, and the site only deploys if all of them pass:

1. **axe and HTML_CodeSniffer** through pa11y, on every page in light and dark themes. Any WCAG 2.1 AA error fails the build. The deliberately broken audit page is checked the other way round: the tools must still catch the issues the audit report says they catch.
2. **Playwright keyboard tests** for what scanners cannot see: skip link, focus order, tabs with arrow keys, dialog focus return, error summary focus, table sorting with `aria-sort`, pagination focus, combobox keys, date validation, the full multi-step flow, and 320px reflow on every page.
3. **Lighthouse CI** on every page. Accessibility must be 100 and best practices 95 or higher. Reports are saved as a build artifact.
4. **Manual checks** I do myself: keyboard only walkthroughs, NVDA with Chrome and Firefox, and 200% zoom.

## Design system approach

Every color, spacing value, radius, font size and breakpoint lives in a Sass map under
`src/scss/tokens`. The base layer turns the color maps into CSS custom properties for both
themes, and components only reference tokens. Changing a token changes the whole site, which
is the difference between a design system and dropping in Bootstrap classes. The
[design system page](https://ramesh06190.github.io/portfolio/design-system.html) documents it.

## Run it locally

```bash
npm install
npx playwright install chromium   # once, for the keyboard tests
npm run build                      # resolve includes, compile Sass, output to dist
npm run serve                      # http://127.0.0.1:4173
npm test                           # build, then all three automated test suites
```

Add `?theme=dark` or `?theme=light` to any URL to force a theme.
