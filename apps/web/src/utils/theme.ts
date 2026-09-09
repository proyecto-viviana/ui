import { createThemeTransition } from "@proyecto-viviana/ui";
import { createRoot, createSignal, onMount } from "solid-js";

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

/* One transition for the whole site, not one per `useTheme()` caller: the
   primitive listens for the pointerdown that opens the wipe, so a copy in every
   header/doc-route would stack duplicate document listeners and each would take
   its own snapshot of the page. Owned by a detached root because the theme
   signal above already outlives every component that reads it. The host is
   `<body>`, not `<html>`: the primitive clones the host, and a clone of
   `<html>` would re-mount every `<style>` in `<head>` into the live document. */
let themeTransition: ((onSwap: () => void) => void) | undefined;
function runThemeTransition(onSwap: () => void): void {
  themeTransition ??= createRoot(() => createThemeTransition(() => document.body));
  themeTransition(onSwap);
}

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
    const swap = (): void => {
      setGlobalTheme(next);
      applyTheme(next);
      if (typeof localStorage !== "undefined") {
        localStorage.setItem(STORAGE_KEY, next);
      }
    };
    if (typeof document === "undefined") {
      swap();
      return;
    }
    runThemeTransition(swap);
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
    // `--text-link`, not `--docs-accent`: almost every consumer of these two spends
    // them on `color:` (section headings, links, prose emphasis), and the accent as
    // ink is 2.80:1 on the docs background. The handful that draw a rule or an SVG
    // stroke with them only gain contrast from the darker blue.
    blue: "var(--text-link)",
    pink: "var(--text-link)",
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
