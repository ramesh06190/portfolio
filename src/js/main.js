// Entry point. Each component lives in its own module and only starts if its markup is on the page.
// Every interactive pattern follows the matching WAI-ARIA Authoring Practices guide.
import { initThemeToggle } from "./modules/theme.js";
import { initNav } from "./modules/nav.js";
import { initTabs } from "./modules/tabs.js";
import { initAccordion } from "./modules/accordion.js";
import { initDialogOpener } from "./modules/dialog.js";
import { initValidatedForm } from "./modules/validation.js";
import { initSortableTable } from "./modules/sortable-table.js";
import { initCombobox } from "./modules/combobox.js";
import { initMultiStep } from "./modules/multi-step.js";
import { initContrastChecks } from "./modules/contrast.js";

const each = (selector, init) => document.querySelectorAll(selector).forEach((el) => init(el));

each(".theme-toggle", initThemeToggle);
each(".nav-toggle", initNav);
each("[data-tabs]", initTabs);
each("[data-accordion]", initAccordion);
each("[data-open-dialog]", initDialogOpener);
each("[data-sortable-table]", initSortableTable);
each("[data-combobox]", initCombobox);
each("[data-multi-step]", initMultiStep);
initContrastChecks();

// Single page forms that just confirm success in a live region
each("form[data-validated]", (form) =>
  initValidatedForm(form, {
    onValid: () => {
      const status = document.getElementById(form.dataset.status);
      form.reset();
      if (status) status.textContent = form.dataset.successMessage || "Form submitted.";
    },
  }),
);

// Live status message demo on the home page
const saveDraft = document.getElementById("save-draft");
if (saveDraft) {
  let count = 0;
  saveDraft.addEventListener("click", () => {
    count += 1;
    const time = new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
    document.getElementById("draft-status").textContent =
      `Draft saved at ${time} (${count} ${count === 1 ? "save" : "saves"})`;
  });
}
