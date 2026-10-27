// Generic, markup driven form validation shared by every form on the site.
//
// Markup contract:
//   <input id="x" data-required="Enter your name">           error text goes in #x-error
//   <input type="email" data-format="email" data-format-message="...">
//   <fieldset id="g" data-required="Select an option">       radio group, error in #g-error
//   <fieldset id="d" data-validate="date" data-label="date of birth" data-required="...">
//
// Errors are written into the field's error element, the input gets aria-invalid,
// and the caller can show a summary of links that move focus to each field.

import { US_STATES } from "../data/datasets.js";

const FORMATS = {
  email: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
  "us-state": (v) => US_STATES.some((s) => s.toLowerCase() === v.toLowerCase()),
};

const CUSTOM = {
  date: validateDate,
};

function setError(errorEl, inputs, message) {
  if (errorEl) errorEl.textContent = message ? `Error: ${message}` : "";
  inputs.forEach((input) => {
    if (message) input.setAttribute("aria-invalid", "true");
    else input.removeAttribute("aria-invalid");
  });
}

// Memorable date: three numeric inputs (day, month, year) inside a fieldset
function validateDate(fieldset) {
  const part = (name) => fieldset.querySelector(`[data-part="${name}"]`);
  const inputs = ["day", "month", "year"].map(part);
  const [d, m, y] = inputs.map((i) => i.value.trim());
  const label = fieldset.dataset.label || "date";

  if (!d && !m && !y) return { message: fieldset.dataset.required || `Enter the ${label}`, invalid: inputs };

  const missing = inputs.filter((i) => !i.value.trim());
  if (missing.length) {
    const names = missing.map((i) => i.dataset.part).join(" and ");
    return { message: `The ${label} must include a ${names}`, invalid: missing };
  }

  const day = Number(d), month = Number(m), year = Number(y);
  const date = new Date(year, month - 1, day);
  const real = /^\d{4}$/.test(y) && date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
  if (!real) return { message: `The ${label} must be a real date`, invalid: inputs };

  if (fieldset.dataset.past !== undefined && date > new Date()) {
    return { message: `The ${label} must be in the past`, invalid: inputs };
  }
  return { message: "", invalid: [] };
}

// Validates every rule inside scope (a form or one step of a form).
// Returns [{ id, message }] where id is the element that should receive focus.
export function validateScope(scope) {
  const errors = [];

  scope.querySelectorAll("[data-required], [data-validate], [data-format]").forEach((el) => {
    // Inputs inside a validated fieldset are handled by the fieldset
    if (el.tagName !== "FIELDSET" && el.closest("fieldset[data-required], fieldset[data-validate]")) return;

    const errorEl = document.getElementById(`${el.id}-error`);

    if (el.tagName === "FIELDSET") {
      const inputs = [...el.querySelectorAll("input, select")];
      let message = "";
      let invalid = [];

      if (el.dataset.validate && CUSTOM[el.dataset.validate]) {
        ({ message, invalid } = CUSTOM[el.dataset.validate](el));
      } else if (!inputs.some((i) => i.checked)) {
        message = el.dataset.required;
        invalid = inputs;
      }

      setError(errorEl, inputs, "");
      setError(errorEl, invalid, message);
      if (message) errors.push({ id: (invalid[0] || inputs[0]).id, message });
      return;
    }

    const value = el.value.trim();
    let message = "";
    if (el.dataset.required !== undefined && !value) message = el.dataset.required;
    else if (value && el.dataset.format && !FORMATS[el.dataset.format](value)) message = el.dataset.formatMessage;

    setError(errorEl, [el], message);
    if (message) errors.push({ id: el.id, message });
  });

  return errors;
}

// Fills an error summary with links to each field and moves focus to it
export function showSummary(summary, errors) {
  const list = summary.querySelector("ul");
  list.replaceChildren(
    ...errors.map(({ id, message }) => {
      const li = document.createElement("li");
      const a = document.createElement("a");
      a.href = `#${id}`;
      a.textContent = message;
      a.addEventListener("click", (e) => {
        e.preventDefault();
        const target = document.getElementById(id);
        target.focus();
        target.scrollIntoView({ block: "center" });
      });
      li.append(a);
      return li;
    }),
  );
  summary.hidden = false;
  summary.focus();
}

export function hideSummary(summary) {
  summary.hidden = true;
  summary.querySelector("ul").replaceChildren();
}

// Wires a single page form: validate on submit, then call onValid
export function initValidatedForm(form, { onValid } = {}) {
  const summary = document.getElementById(form.dataset.summary);
  form.noValidate = true;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const errors = validateScope(form);
    if (errors.length) {
      showSummary(summary, errors);
      return;
    }
    hideSummary(summary);
    onValid?.(form);
  });
}
