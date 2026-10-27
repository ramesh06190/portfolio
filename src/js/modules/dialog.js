// Modal dialog on the native <dialog> element, which traps focus and closes on Escape
export function initDialogOpener(opener) {
  const dialog = document.getElementById(opener.dataset.openDialog);
  if (!dialog || typeof dialog.showModal !== "function") return;

  opener.addEventListener("click", () => dialog.showModal());
  dialog.querySelectorAll("[data-close-dialog]").forEach((btn) => {
    btn.addEventListener("click", () => dialog.close());
  });
  // Modern browsers restore focus on close already; this keeps older ones consistent
  dialog.addEventListener("close", () => opener.focus());
}
