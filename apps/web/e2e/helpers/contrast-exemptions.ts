/**
 * WCAG contrast exemptions shared by every axe entry point.
 *
 * Keep this list narrow and evidence-backed. A selector belongs here only when
 * the standard makes the rendered state exempt, not because a colour is hard
 * to repair.
 */
export const CONTRAST_EXEMPTIONS: ReadonlyArray<{ selector: string; why: string }> = [
  {
    selector: "[data-disabled]",
    why: "WCAG 2.2 SC 1.4.3 excludes text that is part of an inactive UI component; Solid Aria stamps data-disabled on the disabled component root.",
  },
];
