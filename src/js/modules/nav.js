// Mobile navigation disclosure
export function initNav(toggle) {
  const nav = document.getElementById(toggle.getAttribute("aria-controls"));
  if (!nav) return;

  const setOpen = (open) => {
    toggle.setAttribute("aria-expanded", String(open));
    nav.classList.toggle("is-open", open);
  };

  toggle.addEventListener("click", () => {
    setOpen(toggle.getAttribute("aria-expanded") !== "true");
  });

  // Close after choosing a link, and on Escape with focus returned to the toggle
  nav.addEventListener("click", (e) => {
    if (e.target.closest("a")) setOpen(false);
  });
  nav.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") {
      setOpen(false);
      toggle.focus();
    }
  });
}
