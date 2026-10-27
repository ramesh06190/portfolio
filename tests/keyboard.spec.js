// Keyboard tests: things axe cannot check, like focus order, focus management
// and whether each widget actually works without a mouse.
import { test, expect } from "@playwright/test";

const PAGES = ["index.html", "audit.html", "audit-after.html", "design-system.html", "components.html"];

test.describe("site wide", () => {
  test("skip link is the first stop and moves focus to main", async ({ page }) => {
    await page.goto("index.html");
    await page.keyboard.press("Tab");
    const skip = page.getByRole("link", { name: "Skip to main content" });
    await expect(skip).toBeFocused();
    await expect(skip).toBeInViewport();
    await page.keyboard.press("Enter");
    await expect(page.locator("main")).toBeFocused();
  });

  test("current page is marked in the navigation", async ({ page }) => {
    await page.goto("components.html");
    await expect(page.locator('#site-nav [aria-current="page"]')).toHaveText("Components");
  });

  test("theme button label names the action it will take", async ({ page }) => {
    await page.goto("index.html?theme=light");
    const toggle = page.locator(".theme-toggle");
    await expect(toggle).toHaveText("Switch to dark theme");
    await toggle.focus();
    await page.keyboard.press("Enter");
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
    await expect(toggle).toHaveText("Switch to light theme");
  });

  test("mobile menu opens, and Escape closes it and returns focus", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 800 });
    await page.goto("index.html");
    const toggle = page.getByRole("button", { name: "Menu" });
    await toggle.focus();
    await page.keyboard.press("Enter");
    await expect(toggle).toHaveAttribute("aria-expanded", "true");
    await page.keyboard.press("Tab");
    await expect(page.getByRole("link", { name: "About" })).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(toggle).toHaveAttribute("aria-expanded", "false");
    await expect(toggle).toBeFocused();
  });

  for (const path of PAGES) {
    test(`${path} reflows at 320px with no horizontal page scroll`, async ({ page }) => {
      await page.setViewportSize({ width: 320, height: 700 });
      await page.goto(path);
      const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      expect(scrollWidth).toBeLessThanOrEqual(320);
    });
  }
});

test.describe("home page", () => {
  test("tabs move with arrow keys, Home and End", async ({ page }) => {
    await page.goto("index.html");
    const first = page.getByRole("tab", { name: "State of Wisconsin DWD" });
    await first.focus();
    await page.keyboard.press("ArrowRight");
    const holman = page.getByRole("tab", { name: "Holman" });
    await expect(holman).toBeFocused();
    await expect(holman).toHaveAttribute("aria-selected", "true");
    await expect(page.locator("#panel-holman")).toBeVisible();
    await expect(page.locator("#panel-dwd")).toBeHidden();
    await page.keyboard.press("End");
    await expect(page.getByRole("tab", { name: "Tata Advanced Systems" })).toBeFocused();
    await page.keyboard.press("Home");
    await expect(first).toBeFocused();
    await page.keyboard.press("ArrowLeft");
    await expect(page.getByRole("tab", { name: "Tata Advanced Systems" })).toBeFocused();
  });

  test("accordion toggles with Enter", async ({ page }) => {
    await page.goto("index.html");
    const trigger = page.getByRole("button", { name: /Vendor portal UI component library/ });
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
    await trigger.focus();
    await page.keyboard.press("Enter");
    await expect(trigger).toHaveAttribute("aria-expanded", "true");
    await expect(page.locator("#cs-holman")).toBeVisible();
  });

  test("dialog traps focus, closes on Escape and returns focus", async ({ page }) => {
    await page.goto("index.html");
    const opener = page.getByRole("button", { name: "Open dialog" });
    await opener.focus();
    await page.keyboard.press("Enter");
    const dialog = page.getByRole("dialog", { name: "Confirm submission" });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole("button", { name: "Cancel" })).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(opener).toBeFocused();
  });

  test("form errors go to a focused summary that links to each field", async ({ page }) => {
    await page.goto("index.html");
    await page.locator("#demo-form").getByRole("button", { name: "Submit" }).press("Enter");
    const summary = page.locator("#error-summary");
    await expect(summary).toBeFocused();
    await expect(summary.getByRole("link")).toHaveText([
      "Enter your full name",
      "Enter your email address",
      "Select how you would like to be contacted",
    ]);
    await expect(page.locator("#f-name")).toHaveAttribute("aria-invalid", "true");
    await summary.getByRole("link", { name: "Enter your email address" }).press("Enter");
    await expect(page.locator("#f-email")).toBeFocused();
  });

  test("live region announces saves", async ({ page }) => {
    await page.goto("index.html");
    await page.getByRole("button", { name: "Save draft" }).press("Enter");
    await expect(page.locator("#draft-status")).toContainText("Draft saved");
  });
});

test.describe("audit fixed form", () => {
  test("can be completed with the keyboard only", async ({ page }) => {
    await page.goto("audit-after.html");
    const submit = page.getByRole("button", { name: "Submit weekly claim" });
    await submit.press("Enter");
    await expect(page.locator("#claim-summary")).toBeFocused();
    await expect(page.locator("#claim-summary li")).toHaveCount(5);

    await page.getByLabel("Full name").fill("Avery Johnson");
    await page.getByLabel("Claimant ID").fill("12345678");
    await page.getByLabel("Day").fill("18");
    await page.getByLabel("Month").fill("10");
    await page.getByLabel("Year").fill("2026");
    await page.locator("#claim-worked-no").focus();
    await page.keyboard.press("Space");
    await page.locator("#claim-able-yes").focus();
    await page.keyboard.press("Space");
    await submit.press("Enter");

    await expect(page.locator("#claim-summary")).toBeHidden();
    await expect(page.locator("#claim-status")).toContainText("Your weekly claim was submitted");
  });
});

test.describe("components page", () => {
  test("table sorts from the keyboard and updates aria-sort", async ({ page }) => {
    await page.goto("components.html");
    const header = page.locator('th[data-key="name"]');
    const sortButton = header.getByRole("button");
    await sortButton.press("Enter");
    await expect(header).toHaveAttribute("aria-sort", "ascending");
    await expect(page.locator("tbody tr").first().locator("td").first()).toHaveText("Avery Johnson");
    await expect(page.locator("[data-table-status]")).toContainText("sorted by Claimant ascending");
    await sortButton.press("Enter");
    await expect(header).toHaveAttribute("aria-sort", "descending");
    await expect(page.locator("th[aria-sort]")).toHaveCount(1);
  });

  test("pagination keeps focus on Next at the last page", async ({ page }) => {
    await page.goto("components.html");
    const next = page.getByRole("button", { name: "Next page" });
    await next.press("Enter");
    await expect(page.getByRole("button", { name: "Page 2" })).toHaveAttribute("aria-current", "page");
    await next.press("Enter");
    await expect(next).toHaveAttribute("aria-disabled", "true");
    await expect(next).toBeFocused();
    await next.press("Enter");
    await expect(page.getByRole("button", { name: "Page 3" })).toHaveAttribute("aria-current", "page");
    await expect(page.locator("[data-table-status]")).toContainText("Showing 17 to 24 of 24 claims");
  });

  test("combobox filters, highlights with arrows and picks with Enter", async ({ page }) => {
    await page.goto("components.html");
    const input = page.locator("#cb-state");
    await input.focus();
    await page.keyboard.type("wi");
    await expect(input).toHaveAttribute("aria-expanded", "true");
    await expect(page.locator("#cb-state-listbox [role=option]").first()).toHaveText("Wisconsin");
    await page.keyboard.press("ArrowDown");
    await expect(input).toHaveAttribute("aria-activedescendant", "cb-state-listbox-opt-0");
    await expect(page.locator("#cb-state-listbox-opt-0")).toHaveAttribute("aria-selected", "true");
    await page.keyboard.press("Enter");
    await expect(input).toHaveValue("Wisconsin");
    await expect(input).toHaveAttribute("aria-expanded", "false");
    await expect(input).toBeFocused();
  });

  test("combobox Escape closes, second Escape clears", async ({ page }) => {
    await page.goto("components.html");
    const input = page.locator("#cb-state");
    await input.focus();
    await page.keyboard.type("new");
    await page.keyboard.press("Escape");
    await expect(input).toHaveAttribute("aria-expanded", "false");
    await expect(input).toHaveValue("new");
    await page.keyboard.press("Escape");
    await expect(input).toHaveValue("");
  });

  test("date input names the missing part and rejects impossible dates", async ({ page }) => {
    await page.goto("components.html");
    const check = page.getByRole("button", { name: "Check date" });
    await page.locator("#dob-day").fill("31");
    await page.locator("#dob-year").fill("2000");
    await check.press("Enter");
    await expect(page.locator("#dob-error")).toHaveText("Error: The date of birth must include a month");
    await expect(page.locator("#dob-month")).toHaveAttribute("aria-invalid", "true");
    await expect(page.locator("#dob-day")).not.toHaveAttribute("aria-invalid", "true");

    await page.locator("#dob-month").fill("2");
    await check.press("Enter");
    await expect(page.locator("#dob-error")).toHaveText("Error: The date of birth must be a real date");

    await page.locator("#dob-day").fill("28");
    await check.press("Enter");
    await expect(page.locator("#date-status")).toHaveText("That date is valid.");
  });

  test("multi-step form validates, moves focus, reviews and submits", async ({ page }) => {
    await page.goto("components.html");
    const form = page.locator("#ms-form");
    const continueBtn = form.getByRole("button", { name: "Continue" });

    await continueBtn.press("Enter");
    await expect(page.locator("#ms-summary")).toBeFocused();
    await expect(page.locator("#ms-summary li")).toHaveCount(3);

    await page.locator("#ms-name").fill("Jordan Smith");
    await page.locator("#ms-dob-day").fill("4");
    await page.locator("#ms-dob-month").fill("7");
    await page.locator("#ms-dob-year").fill("1988");
    await page.locator("#ms-state").focus();
    await page.keyboard.type("Wisc");
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("Enter");
    await continueBtn.press("Enter");

    await expect(page.locator("#ms-step2-title")).toBeFocused();
    const steps = form.locator("[data-progress] li");
    await expect(steps.nth(0)).toContainText("Completed:");
    await expect(steps.nth(1)).toHaveAttribute("aria-current", "step");

    await page.locator("#ms-employer").fill("Sample Logistics");
    await page.locator("#ms-lastday-day").fill("10");
    await page.locator("#ms-lastday-month").fill("9");
    await page.locator("#ms-lastday-year").fill("2026");
    await page.locator("#ms-reason-layoff").focus();
    await page.keyboard.press("Space");
    await continueBtn.press("Enter");

    await expect(page.locator("#ms-step3-title")).toBeFocused();
    const review = form.locator("[data-review]");
    await expect(review).toContainText("Jordan Smith");
    await expect(review).toContainText("4 July 1988");
    await expect(review).toContainText("Wisconsin");
    await expect(review).toContainText("Laid off or lack of work");

    await review.getByRole("button", { name: "Change full name" }).press("Enter");
    await expect(page.locator("#ms-step1-title")).toBeFocused();
    await continueBtn.press("Enter");
    await continueBtn.press("Enter");

    await form.getByRole("button", { name: "Submit claim" }).press("Enter");
    const confirmation = page.locator("#ms-confirmation");
    await expect(confirmation.getByRole("heading", { name: "Claim submitted" })).toBeFocused();
    await expect(confirmation.locator("[data-reference]")).toHaveText(/^WI-\d{6}$/);
  });
});
