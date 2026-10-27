// Small, dependency free scripts for the portfolio.
// Each component follows the matching WAI-ARIA Authoring Practices pattern.

const storage = {
  get(key) {
    try { return localStorage.getItem(key); } catch { return null; }
  },
  set(key, value) {
    try { localStorage.setItem(key, value); } catch { /* storage blocked, theme just won't persist */ }
  },
};

/* ---------- Theme toggle ---------- */
function initThemeToggle() {
  const button = document.querySelector(".theme-toggle");
  if (!button) return;
  const label = button.querySelector(".theme-toggle__label");
  const root = document.documentElement;
  const systemDark = window.matchMedia("(prefers-color-scheme: dark)");

  const isDark = () => {
    const forced = root.getAttribute("data-theme");
    return forced ? forced === "dark" : systemDark.matches;
  };

  // The label names the action the button will take, so it flips with the current theme.
  // No aria-pressed here: a changing label plus a pressed state would announce a contradiction.
  const render = () => {
    const dark = isDark();
    label.textContent = dark ? "Switch to light theme" : "Switch to dark theme";
    button.classList.toggle("is-dark", dark);
  };

  button.addEventListener("click", () => {
    const next = isDark() ? "light" : "dark";
    root.setAttribute("data-theme", next);
    storage.set("theme", next);
    render();
  });

  systemDark.addEventListener("change", render);
  render();
}

/* ---------- Mobile navigation ---------- */
function initNav() {
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.getElementById("site-nav");
  if (!toggle || !nav) return;

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

/* ---------- Tabs (automatic activation, roving tabindex) ---------- */
function initTabs(container) {
  const tabs = Array.from(container.querySelectorAll('[role="tab"]'));

  const select = (tab, moveFocus = true) => {
    tabs.forEach((t) => {
      const selected = t === tab;
      t.setAttribute("aria-selected", String(selected));
      t.tabIndex = selected ? 0 : -1;
      document.getElementById(t.getAttribute("aria-controls")).hidden = !selected;
    });
    if (moveFocus) tab.focus();
  };

  tabs.forEach((tab, i) => {
    tab.addEventListener("click", () => select(tab));
    tab.addEventListener("keydown", (e) => {
      let next = null;
      if (e.key === "ArrowRight") next = tabs[(i + 1) % tabs.length];
      if (e.key === "ArrowLeft") next = tabs[(i - 1 + tabs.length) % tabs.length];
      if (e.key === "Home") next = tabs[0];
      if (e.key === "End") next = tabs[tabs.length - 1];
      if (next) {
        e.preventDefault();
        select(next);
      }
    });
  });
}

/* ---------- Accordion ---------- */
function initAccordion(container) {
  container.querySelectorAll(".accordion__trigger").forEach((trigger) => {
    trigger.addEventListener("click", () => {
      const expanded = trigger.getAttribute("aria-expanded") === "true";
      trigger.setAttribute("aria-expanded", String(!expanded));
      document.getElementById(trigger.getAttribute("aria-controls")).hidden = expanded;
    });
  });
}

/* ---------- Form validation with error summary ---------- */
function initDemoForm() {
  const form = document.getElementById("demo-form");
  const summary = document.getElementById("error-summary");
  if (!form || !summary) return;
  const summaryList = summary.querySelector("ul");
  const status = document.getElementById("status");

  const rules = [
    {
      id: "f-name",
      check: () => form.name.value.trim() !== "",
      message: "Enter your full name",
    },
    {
      id: "f-email",
      check: () => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.value.trim()),
      message: () => form.email.value.trim() === ""
        ? "Enter your email address"
        : "Enter an email address in the correct format, like name@example.com",
    },
    {
      id: "f-contact-email",
      errorId: "f-contact-error",
      group: "contact",
      check: () => form.querySelector('input[name="contact"]:checked') !== null,
      message: "Select how you would like to be contacted",
    },
  ];

  const setFieldError = (rule, text) => {
    const errorEl = document.getElementById(rule.errorId || `${rule.id}-error`);
    errorEl.textContent = text ? `Error: ${text}` : "";
    const inputs = rule.group
      ? form.querySelectorAll(`input[name="${rule.group}"]`)
      : [document.getElementById(rule.id)];
    inputs.forEach((input) => {
      if (text) input.setAttribute("aria-invalid", "true");
      else input.removeAttribute("aria-invalid");
    });
  };

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    summaryList.replaceChildren();
    const failed = [];

    rules.forEach((rule) => {
      const ok = rule.check();
      const message = typeof rule.message === "function" ? rule.message() : rule.message;
      setFieldError(rule, ok ? "" : message);
      if (!ok) failed.push({ rule, message });
    });

    if (failed.length) {
      failed.forEach(({ rule, message }) => {
        const li = document.createElement("li");
        const a = document.createElement("a");
        a.href = `#${rule.id}`;
        a.textContent = message;
        a.addEventListener("click", (ev) => {
          ev.preventDefault();
          document.getElementById(rule.id).focus();
        });
        li.append(a);
        summaryList.append(li);
      });
      summary.hidden = false;
      summary.focus();
      return;
    }

    summary.hidden = true;
    form.reset();
    status.textContent = "Thanks, the demo form passed validation. Nothing was sent.";
  });
}

/* ---------- Dialog ---------- */
function initDialogs() {
  document.querySelectorAll("[data-open-dialog]").forEach((opener) => {
    const dialog = document.getElementById(opener.dataset.openDialog);
    if (!dialog || typeof dialog.showModal !== "function") return;

    opener.addEventListener("click", () => dialog.showModal());
    dialog.querySelectorAll("[data-close-dialog]").forEach((btn) => {
      btn.addEventListener("click", () => dialog.close());
    });
    // Native dialog restores focus to the opener on close in modern browsers;
    // this keeps that behavior consistent in older ones.
    dialog.addEventListener("close", () => opener.focus());
  });
}

/* ---------- Live region ---------- */
function initStatus() {
  const button = document.getElementById("save-draft");
  const status = document.getElementById("status");
  if (!button || !status) return;
  let count = 0;
  button.addEventListener("click", () => {
    count += 1;
    const time = new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
    status.textContent = `Draft saved at ${time} (${count} ${count === 1 ? "save" : "saves"})`;
  });
}

initThemeToggle();
initNav();
document.querySelectorAll("[data-tabs]").forEach(initTabs);
document.querySelectorAll("[data-accordion]").forEach(initAccordion);
initDemoForm();
initDialogs();
initStatus();
