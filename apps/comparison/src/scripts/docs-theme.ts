import {
  comparisonThemeChangeEvent,
  resolveComparisonThemeChoice,
  type ComparisonThemeChoice,
} from "@comparison/data/theme";

const root = document.body;
const themeControls = document.querySelectorAll<HTMLInputElement>('[name="comparisonTheme"]');
const savedTheme =
  (window.localStorage.getItem("solid-spectrum-theme") as ComparisonThemeChoice | null) ?? "system";
const themeOrder: ComparisonThemeChoice[] = ["system", "light", "dark"];
const mediaQuery = window.matchMedia?.("(prefers-color-scheme: dark)");

function updateThemeIcons(theme: ComparisonThemeChoice) {
  for (const themeIcon of document.querySelectorAll("[data-theme-toggle-icon]")) {
    themeIcon.textContent = theme;
  }
}

function applyTheme(theme: ComparisonThemeChoice) {
  const resolvedTheme = resolveComparisonThemeChoice(theme);
  root.dataset.theme = theme;
  root.dataset.resolvedTheme = resolvedTheme;

  updateThemeIcons(theme);

  for (const control of themeControls) {
    control.checked = control.value === theme;
  }

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

for (const control of themeControls) {
  control.addEventListener("change", () => {
    if (control.checked) {
      applyTheme(control.value as ComparisonThemeChoice);
    }
  });
}

mediaQuery?.addEventListener("change", () => {
  if (root.dataset.theme === "system") {
    applyTheme("system");
  }
});

applyTheme(savedTheme);
