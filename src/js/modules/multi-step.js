// Multi-step form with a progress indicator.
// Each step is validated before moving on, focus goes to the new step heading,
// and the last step lets people review and change their answers before submitting.
import { validateScope, showSummary, hideSummary } from "./validation.js";

const MONTHS = ["January", "February", "March", "April", "May", "June", "July",
  "August", "September", "October", "November", "December"];

// Turns a field into the text shown on the review step
function readValue(el) {
  if (el.dataset.validate === "date") {
    const get = (p) => el.querySelector(`[data-part="${p}"]`).value.trim();
    return `${Number(get("day"))} ${MONTHS[Number(get("month")) - 1]} ${get("year")}`;
  }
  if (el.tagName === "FIELDSET") {
    const checked = el.querySelector("input:checked");
    return checked ? el.querySelector(`label[for="${checked.id}"]`).textContent.trim() : "";
  }
  return el.value.trim() || "Not provided";
}

export function initMultiStep(form) {
  const steps = [...form.querySelectorAll("[data-step]")];
  const progress = [...form.querySelectorAll("[data-progress] li")];
  const summary = document.getElementById(form.dataset.summary);
  const backBtn = form.querySelector("[data-back]");
  const nextBtn = form.querySelector("[data-next]");
  const submitBtn = form.querySelector("[data-submit]");
  const review = form.querySelector("[data-review]");
  const confirmation = document.getElementById(form.dataset.confirmation);
  let current = 0;

  form.noValidate = true;

  function show(index, { focus = true } = {}) {
    current = index;
    steps.forEach((s, i) => { s.hidden = i !== index; });

    progress.forEach((li, i) => {
      li.classList.toggle("is-complete", i < index);
      li.querySelector("[data-progress-state]").textContent =
        i < index ? "Completed: " : i === index ? "Current step: " : "Not started: ";
      if (i === index) li.setAttribute("aria-current", "step");
      else li.removeAttribute("aria-current");
    });

    const last = index === steps.length - 1;
    backBtn.hidden = index === 0;
    nextBtn.hidden = last;
    submitBtn.hidden = !last;
    if (last) buildReview();

    hideSummary(summary);
    if (focus) steps[index].querySelector("h3").focus();
  }

  function buildReview() {
    const rows = [];
    steps.slice(0, -1).forEach((step, stepIndex) => {
      step.querySelectorAll("[data-review-label]").forEach((el) => {
        const div = document.createElement("div");
        div.className = "review__row";
        const dt = document.createElement("dt");
        dt.textContent = el.dataset.reviewLabel;
        const dd = document.createElement("dd");
        dd.textContent = readValue(el);
        const action = document.createElement("dd");
        action.className = "review__action";
        const change = document.createElement("button");
        change.type = "button";
        change.className = "link-button";
        change.innerHTML = `Change<span class="visually-hidden"> ${el.dataset.reviewLabel.toLowerCase()}</span>`;
        change.addEventListener("click", () => show(stepIndex));
        action.append(change);
        div.append(dt, dd, action);
        rows.push(div);
      });
    });
    review.replaceChildren(...rows);
  }

  function next() {
    const errors = validateScope(steps[current]);
    if (errors.length) {
      showSummary(summary, errors);
      return;
    }
    show(current + 1);
  }

  nextBtn.addEventListener("click", next);
  backBtn.addEventListener("click", () => show(current - 1));

  // Enter inside a field submits the form, so treat it as Continue until the last step
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (current < steps.length - 1) {
      next();
      return;
    }
    const ref = `WI-${Math.floor(100000 + Math.random() * 900000)}`;
    confirmation.querySelector("[data-reference]").textContent = ref;
    form.hidden = true;
    confirmation.hidden = false;
    confirmation.querySelector("h3").focus();
  });

  confirmation.querySelector("[data-restart]").addEventListener("click", () => {
    form.reset();
    form.querySelectorAll("[aria-invalid]").forEach((el) => el.removeAttribute("aria-invalid"));
    form.querySelectorAll(".field__error").forEach((el) => { el.textContent = ""; });
    confirmation.hidden = true;
    form.hidden = false;
    show(0);
  });

  show(0, { focus: false });
}
