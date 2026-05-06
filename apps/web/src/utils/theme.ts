import { createSignal, onMount } from "solid-js";

export type Theme = "dark" | "light";

const STORAGE_KEY = "pv-theme";

function resolveTheme(): Theme {
  if (typeof localStorage !== "undefined") {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "dark" || saved === "light") return saved;
  }
  if (
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-color-scheme: light)").matches
  ) {
    return "light";
  }
  return "dark";
}

const [globalTheme, setGlobalTheme] = createSignal<Theme>("dark");
let initialized = false;

function applyTheme(theme: Theme): void {
  if (typeof document === "undefined") return;
  document.documentElement.setAttribute("data-color-scheme", theme);
}

function initGlobalTheme(): void {
  if (initialized) return;
  if (typeof document === "undefined") return;
  initialized = true;
  const theme = resolveTheme();
  setGlobalTheme(theme);
  applyTheme(theme);
}

export function useTheme() {
  onMount(() => {
    initGlobalTheme();
  });

  const toggleTheme = () => {
    const next: Theme = globalTheme() === "dark" ? "light" : "dark";
    setGlobalTheme(next);
    applyTheme(next);
    if (typeof localStorage !== "undefined") {
      localStorage.setItem(STORAGE_KEY, next);
    }
  };

  const isDark = () => globalTheme() === "dark";

  return { theme: globalTheme, isDark, toggleTheme };
}

// Compatibility shim: same shape as the retired silapse palette, but every value
// points at a semantic CSS variable in styles.css. Lets the docs site keep
// `colors().surface`, `props.colors.blue`, etc. without rewriting every inline
// style while we live on solid-spectrum tokens.
export function useThemeColors() {
  return () => ({
    blue: "var(--docs-accent)",
    pink: "var(--docs-accent)",
    blueDim: "var(--docs-bg-elevated)",
    pinkDim: "var(--docs-bg-elevated)",
    surface: "var(--docs-bg)",
    surfaceElevated: "var(--docs-bg-elevated)",
    headerBg: "var(--docs-bg)",
    text: "var(--docs-text)",
    textSecondary: "var(--docs-text-secondary)",
    blueGlow: "transparent",
    pinkGlow: "transparent",
    muted: "var(--docs-border)",
    border: "var(--docs-border)",
  });
}
