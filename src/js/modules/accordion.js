// Accordion: real buttons inside headings, state in aria-expanded
export function initAccordion(container) {
  container.querySelectorAll(".accordion__trigger").forEach((trigger) => {
    trigger.addEventListener("click", () => {
      const expanded = trigger.getAttribute("aria-expanded") === "true";
      trigger.setAttribute("aria-expanded", String(!expanded));
      document.getElementById(trigger.getAttribute("aria-controls")).hidden = expanded;
    });
  });
}
