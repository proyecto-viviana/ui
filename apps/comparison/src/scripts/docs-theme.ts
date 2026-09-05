import {
  comparisonThemeChangeEvent,
  comparisonThemeRequestEvent,
  getComparisonThemeChoiceLabel,
  resolveComparisonThemeChoice,
  type ComparisonThemeChoice,
} from "@comparison/data/theme";

const documentRoot = document.documentElement;
const themeOrder: ComparisonThemeChoice[] = ["system", "light", "dark"];
const mediaQuery = window.matchMedia?.("(prefers-color-scheme: dark)");

function isComparisonThemeChoice(value: unknown): value is ComparisonThemeChoice {
  return value === "system" || value === "light" || value === "dark";
}

function readSavedTheme(): ComparisonThemeChoice {
  try {
    const savedTheme = window.localStorage.getItem("solid-spectrum-theme");
    return isComparisonThemeChoice(savedTheme) ? savedTheme : "system";
  } catch {
    return "system";
  }
}

function getThemeToggleAriaLabel(theme: ComparisonThemeChoice, resolvedTheme: "light" | "dark") {
  const mode = theme === "system" ? `system ${resolvedTheme}` : theme;
  return `Using ${mode} mode (press to switch)`;
}

function updateThemeToggles(theme: ComparisonThemeChoice, resolvedTheme: "light" | "dark") {
  for (const themeIcon of document.querySelectorAll("[data-theme-toggle-icon]")) {
    themeIcon.textContent = getComparisonThemeChoiceLabel(theme);
  }

  for (const themeToggle of document.querySelectorAll("[data-theme-toggle]")) {
    themeToggle.setAttribute("aria-label", getThemeToggleAriaLabel(theme, resolvedTheme));
  }
}

function syncThemeControls(theme: ComparisonThemeChoice) {
  for (const control of document.querySelectorAll<HTMLInputElement>('[name="comparisonTheme"]')) {
    control.checked = control.value === theme;
  }
}

function themeBody(): HTMLElement {
  return document.body;
}

function applyTheme(theme: ComparisonThemeChoice) {
  const resolvedTheme = resolveComparisonThemeChoice(theme);
  const body = themeBody();
  documentRoot.dataset.theme = theme;
  documentRoot.dataset.resolvedTheme = resolvedTheme;
  body.dataset.theme = theme;
  body.dataset.resolvedTheme = resolvedTheme;

  updateThemeToggles(theme, resolvedTheme);
  syncThemeControls(theme);

  try {
    window.localStorage.setItem("solid-spectrum-theme", theme);
  } catch {
    // Theme selection still applies for the current page when storage is unavailable.
  }
  window.dispatchEvent(
    new CustomEvent(comparisonThemeChangeEvent, {
      detail: { theme, resolvedTheme },
    }),
  );
}

document.addEventListener("click", (event) => {
  if (!(event.target instanceof Element) || !event.target.closest("[data-theme-toggle]")) {
    return;
  }

  const current = (themeBody().dataset.theme as ComparisonThemeChoice | undefined) ?? "system";
  const nextTheme = themeOrder[(themeOrder.indexOf(current) + 1) % themeOrder.length] ?? "system";
  applyTheme(nextTheme);
});

document.addEventListener("change", (event) => {
  const control = event.target;

  if (
    control instanceof HTMLInputElement &&
    control.name === "comparisonTheme" &&
    control.checked
  ) {
    applyTheme(control.value as ComparisonThemeChoice);
  }
});

window.addEventListener(comparisonThemeRequestEvent, (event) => {
  if (!(event instanceof CustomEvent) || !isComparisonThemeChoice(event.detail?.theme)) {
    return;
  }

  applyTheme(event.detail.theme);
});

window.addEventListener("comparison:theme-controls-mounted", () => {
  const storedTheme = themeBody().dataset.theme;
  const theme = isComparisonThemeChoice(storedTheme) ? storedTheme : readSavedTheme();
  syncThemeControls(theme);
});

mediaQuery?.addEventListener("change", () => {
  if (themeBody().dataset.theme === "system") {
    applyTheme("system");
  }
});

document.addEventListener("astro:after-swap", () => {
  applyTheme(readSavedTheme());
});

applyTheme(readSavedTheme());
