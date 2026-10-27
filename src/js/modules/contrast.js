// Live contrast checker for the design system page.
// Reads the current token values from CSS custom properties, so the numbers
// always match the theme on screen, then computes the WCAG 2.1 contrast ratio.

const token = (name) =>
  getComputedStyle(document.documentElement).getPropertyValue(`--color-${name}`).trim();

function toRgb(hex) {
  let h = hex.replace("#", "");
  if (h.length === 3) h = [...h].map((c) => c + c).join("");
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
}

// Relative luminance as defined in WCAG 2.1
function luminance([r, g, b]) {
  const [R, G, B] = [r, g, b].map((v) => {
    const c = v / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}

export function contrastRatio(fg, bg) {
  const [a, b] = [luminance(toRgb(fg)), luminance(toRgb(bg))].sort((x, y) => y - x);
  return (a + 0.05) / (b + 0.05);
}

function update() {
  document.querySelectorAll("[data-token-value]").forEach((el) => {
    el.textContent = token(el.dataset.tokenValue);
  });

  document.querySelectorAll("[data-contrast]").forEach((el) => {
    const [fg, bg] = el.dataset.contrast.split(" on ");
    const min = Number(el.dataset.min || 4.5);
    const ratio = contrastRatio(token(fg), token(bg));
    const pass = ratio >= min;
    el.textContent = `${ratio.toFixed(2)}:1 ${pass ? "Pass" : "Fail"}`;
    el.classList.toggle("is-pass", pass);
    el.classList.toggle("is-fail", !pass);
  });
}

export function initContrastChecks() {
  if (!document.querySelector("[data-contrast], [data-token-value]")) return;
  update();
  document.addEventListener("themechange", update);
}
