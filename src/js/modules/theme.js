// Theme toggle. The label names the action the button will take, so it flips with the current theme.
// No aria-pressed here: a changing label plus a pressed state would announce a contradiction.

const storage = {
  set(key, value) {
    try { localStorage.setItem(key, value); } catch { /* storage blocked, theme just won't persist */ }
  },
};

const root = document.documentElement;
const systemDark = window.matchMedia("(prefers-color-scheme: dark)");

export function isDarkTheme() {
  const forced = root.getAttribute("data-theme");
  return forced ? forced === "dark" : systemDark.matches;
}

export function initThemeToggle(button) {
  const label = button.querySelector(".theme-toggle__label");

  const render = () => {
    const dark = isDarkTheme();
    label.textContent = dark ? "Switch to light theme" : "Switch to dark theme";
    button.classList.toggle("is-dark", dark);
    // Other components (like the contrast checker) listen for this
    document.dispatchEvent(new CustomEvent("themechange", { detail: { dark } }));
  };

  button.addEventListener("click", () => {
    const next = isDarkTheme() ? "light" : "dark";
    root.setAttribute("data-theme", next);
    storage.set("theme", next);
    render();
  });

  systemDark.addEventListener("change", render);
  render();
}
