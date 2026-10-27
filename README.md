# Pydi Adapa portfolio

My personal portfolio and front-end code sample. It is hand written HTML5, Sass and vanilla
JavaScript with no UI framework, built to meet WCAG 2.1 AA.

## What to look at

| Area | Where |
|---|---|
| Design tokens (color, spacing, type, breakpoints) | `src/scss/tokens/` |
| Light and dark themes generated from the token maps | `src/scss/_base.scss` |
| Components (buttons, cards, tabs, accordion, forms, dialog) | `src/scss/components/` |
| Tabs, accordion, form validation, dialog and live region scripts | `src/js/main.js` |
| Automated accessibility tests | `scripts/a11y.mjs` |
| CI/CD pipeline | `.github/workflows/deploy.yml` |

## Design system approach

Every color, spacing value, radius, font size and breakpoint lives in a Sass map under
`src/scss/tokens`. The base layer turns the color maps into CSS custom properties for light
and dark themes, and components only reference tokens, never raw values. Changing a token
changes the whole site, which is the difference between a design system and dropping in
Bootstrap classes.

## Accessibility

- Semantic landmarks, one `h1`, and a logical heading outline
- Skip link and visible focus on every interactive element
- Tabs follow the WAI-ARIA tabs pattern with arrow keys, Home and End
- Accordion uses `aria-expanded` and `aria-controls` on real buttons
- Form errors are linked with `aria-describedby`, marked with `aria-invalid`, listed in an error summary that receives focus, and not shown by color alone
- Modal uses the native `dialog` element for focus trapping and Escape to close
- Status updates use `role="status"` so screen readers announce them
- Respects `prefers-reduced-motion` and `prefers-color-scheme`
- Reflows to one column at 320px and works at 200% zoom
- Color pairs checked for 4.5:1 text contrast and 3:1 UI contrast in both themes

Automated checks run axe and HTML_CodeSniffer through pa11y on every push, in both themes,
and the deploy fails if any WCAG 2.1 AA error is found. Manual checks are keyboard only
walkthroughs and NVDA screen reader testing.

## Run it locally

```bash
npm install
npm run build      # compile Sass and copy files to dist
npm run serve      # http://127.0.0.1:4173
npm run test:a11y  # accessibility tests
npm run watch      # recompile Sass on save
```

Add `?theme=dark` or `?theme=light` to the URL to force a theme.
