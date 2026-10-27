// Editable combobox with list autocomplete, following the WAI-ARIA combobox pattern.
// Focus stays in the input the whole time and aria-activedescendant points at the highlighted option.
import { US_STATES } from "../data/datasets.js";

const SOURCES = { "us-states": US_STATES };

export function initCombobox(root) {
  const input = root.querySelector('[role="combobox"]');
  const listbox = document.getElementById(input.getAttribute("aria-controls"));
  const status = root.querySelector("[data-combobox-status]");
  const options = SOURCES[root.dataset.options];

  let matches = [];
  let active = -1;
  let statusTimer;

  const isOpen = () => input.getAttribute("aria-expanded") === "true";

  // Short delay so the count is announced after the typed character, not on top of it
  const announce = (text) => {
    clearTimeout(statusTimer);
    statusTimer = setTimeout(() => { status.textContent = text; }, 400);
  };

  function filter() {
    const q = input.value.trim().toLowerCase();
    if (!q) return [...options];
    const starts = options.filter((o) => o.toLowerCase().startsWith(q));
    const contains = options.filter((o) => !o.toLowerCase().startsWith(q) && o.toLowerCase().includes(q));
    return [...starts, ...contains];
  }

  function open() {
    matches = filter();
    active = -1;
    listbox.replaceChildren(
      ...matches.map((text, i) => {
        const li = document.createElement("li");
        li.id = `${listbox.id}-opt-${i}`;
        li.setAttribute("role", "option");
        li.setAttribute("aria-selected", "false");
        li.textContent = text;
        // mousedown would blur the input before click fires, so keep focus where it is
        li.addEventListener("mousedown", (e) => e.preventDefault());
        li.addEventListener("click", () => choose(i));
        return li;
      }),
    );

    if (!matches.length) {
      close();
      announce("No results.");
      return;
    }
    listbox.hidden = false;
    input.setAttribute("aria-expanded", "true");
    input.removeAttribute("aria-activedescendant");
    announce(`${matches.length} ${matches.length === 1 ? "result" : "results"} available.`);
  }

  function close() {
    listbox.hidden = true;
    input.setAttribute("aria-expanded", "false");
    input.removeAttribute("aria-activedescendant");
    active = -1;
  }

  function highlight(i) {
    const items = listbox.children;
    if (items[active]) items[active].setAttribute("aria-selected", "false");
    active = i;
    const item = items[active];
    item.setAttribute("aria-selected", "true");
    input.setAttribute("aria-activedescendant", item.id);
    item.scrollIntoView({ block: "nearest" });
  }

  function choose(i) {
    input.value = matches[i];
    close();
    input.dispatchEvent(new Event("change", { bubbles: true }));
  }

  input.addEventListener("input", open);
  input.addEventListener("blur", close);
  input.addEventListener("click", () => { if (!isOpen()) open(); });

  input.addEventListener("keydown", (e) => {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        if (!isOpen()) { open(); if (e.altKey) return; }
        if (matches.length) highlight((active + 1) % matches.length);
        break;
      case "ArrowUp":
        e.preventDefault();
        if (!isOpen()) open();
        if (matches.length) highlight(active <= 0 ? matches.length - 1 : active - 1);
        break;
      case "Enter":
        if (isOpen() && active >= 0) {
          e.preventDefault(); // pick the option instead of submitting the form
          choose(active);
        }
        break;
      case "Escape":
        if (isOpen()) close();
        else input.value = "";
        break;
      case "Tab":
        close();
        break;
    }
  });
}
