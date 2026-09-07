/**
 * Selector-scoped axe `target-size` exemptions for comparison WCAG 2.2 AA.
 * Classification (clause vs `no clause; upstream compact; both stacks`) lives
 * in `.claude/current/wcag-258-target-size.md` (ticket #492).
 */
import type { Page } from "@playwright/test";

export const COMPARISON_HARNESS_UA_TARGET_CLASS = "comparison-harness-ua-target";

export const COMPARISON_TARGET_SIZE_EXEMPTIONS: ReadonlyArray<{ selector: string; why: string }> = [
  {
    selector:
      '.s2-framework-panel[data-framework="react"] [data-comparison-control-root="actiongroup"] > button',
    why: "WCAG 2.2 SC 2.5.8 User Agent Control. React ActionGroup comparison oracle is classless native <button>s (useActionGroupItem); 40×21 UA box, size and offset fail. Solid styled ActionGroup items pass. See .claude/current/wcag-258-target-size.md (ticket #492).",
  },
  {
    selector: '[data-comparison-control-root="toolbar"] button',
    why: "WCAG 2.2 SC 2.5.8 User Agent Control. Toolbar comparison fixture paints native <button>s inside RAC/solidaria Toolbar; 40×21 UA box on both stacks, size and offset fail. See .claude/current/wcag-258-target-size.md (ticket #492).",
  },
  {
    selector: '[data-comparison-control-root="autocomplete"] input',
    why: "WCAG 2.2 SC 2.5.8 User Agent Control. Autocomplete comparison fixture uses unstyled RAC/solidaria SearchField input; 107×21 UA box on both stacks, size and offset fail. See .claude/current/wcag-258-target-size.md (ticket #492).",
  },
];

const trampolineLabels = new Set(["Before", "After"]);

export async function markComparisonHarnessUaTargets(page: Page) {
  await page.evaluate(
    ({ className, labels }) => {
      const trampolineNames = new Set(labels);
      for (const button of document.querySelectorAll(".comparison-reference-canvas button")) {
        const label = button.textContent?.trim() ?? "";
        if (!trampolineNames.has(label)) continue;
        button.classList.add(className);
      }
      for (const button of document.querySelectorAll(
        "button[data-shortcut-case], main[data-shortcut-bubble-count] button",
      )) {
        button.classList.add(className);
      }
    },
    {
      className: COMPARISON_HARNESS_UA_TARGET_CLASS,
      labels: [...trampolineLabels],
    },
  );
}
