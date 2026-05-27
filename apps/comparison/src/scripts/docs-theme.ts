import {
  comparisonThemeChangeEvent,
  comparisonThemeRequestEvent,
  resolveComparisonThemeChoice,
  type ComparisonThemeChoice,
} from "@comparison/data/theme";

const root = document.body;
const savedTheme =
  (window.localStorage.getItem("solid-spectrum-theme") as ComparisonThemeChoice | null) ?? "system";
const themeOrder: ComparisonThemeChoice[] = ["system", "light", "dark"];
const mediaQuery = window.matchMedia?.("(prefers-color-scheme: dark)");

function isComparisonThemeChoice(value: unknown): value is ComparisonThemeChoice {
  return value === "system" || value === "light" || value === "dark";
}

function updateThemeIcons(theme: ComparisonThemeChoice) {
  for (const themeIcon of document.querySelectorAll("[data-theme-toggle-icon]")) {
    themeIcon.textContent = theme;
  }
}

function syncThemeControls(theme: ComparisonThemeChoice) {
  for (const control of document.querySelectorAll<HTMLInputElement>('[name="comparisonTheme"]')) {
    control.checked = control.value === theme;
  }
}

function applyTheme(theme: ComparisonThemeChoice) {
  const resolvedTheme = resolveComparisonThemeChoice(theme);
  root.dataset.theme = theme;
  root.dataset.resolvedTheme = resolvedTheme;

  updateThemeIcons(theme);
  syncThemeControls(theme);

  window.localStorage.setItem("solid-spectrum-theme", theme);
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

  const current = (root.dataset.theme as ComparisonThemeChoice | undefined) ?? "system";
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
  syncThemeControls((root.dataset.theme as ComparisonThemeChoice | undefined) ?? savedTheme);
});

mediaQuery?.addEventListener("change", () => {
  if (root.dataset.theme === "system") {
    applyTheme("system");
  }
});

applyTheme(savedTheme);
