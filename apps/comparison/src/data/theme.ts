export type ComparisonThemeChoice = "system" | "light" | "dark";
export type ComparisonResolvedTheme = "light" | "dark";

export const comparisonThemeChangeEvent = "comparison:theme-change";
export const comparisonThemeRequestEvent = "comparison:theme-request";

export interface ComparisonThemeChangeDetail {
  theme: ComparisonThemeChoice;
  resolvedTheme: ComparisonResolvedTheme;
}

export interface ComparisonThemeRequestDetail {
  theme: ComparisonThemeChoice;
}

export function resolveComparisonThemeChoice(
  theme: ComparisonThemeChoice,
): ComparisonResolvedTheme {
  if (theme === "light" || theme === "dark") {
    return theme;
  }

  if (
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-color-scheme: dark)").matches
  ) {
    return "dark";
  }

  return "light";
}

export function getComparisonResolvedThemeFromDocument(): ComparisonResolvedTheme {
  if (typeof document === "undefined") {
    return "light";
  }

  return document.body.dataset.resolvedTheme === "dark" ? "dark" : "light";
}
