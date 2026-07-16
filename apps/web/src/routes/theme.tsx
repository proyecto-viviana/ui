import { createFileRoute } from "@tanstack/solid-router";
import { createSignal, onMount, Show } from "solid-js";
import { Header } from "@/components";
import { ThemeStudio, type ThemeResult } from "@/components/theme/ThemeStudio";
import { ThemePreviewGallery } from "@/components/theme/ThemePreviewGallery";
import {
  ACCENT,
  FONT_BODY,
  FONT_DISPLAY,
  Panel,
  PillTag,
  SectionLabel,
  SiteFooter,
} from "@/components/theme/primitives";
import { buildThemeCss, THEME_HOWTO } from "@/utils/themeExport";
import { buildThemeTokens, DEFAULT_INPUTS } from "@/utils/themeGen";
import "@/components/theme/studio.css";

export const Route = createFileRoute("/theme")({
  component: ThemePage,
});

function ThemePage() {
  const [result, setResult] = createSignal<ThemeResult>({
    inputs: { ...DEFAULT_INPUTS },
    scheme: "dark",
    dark: buildThemeTokens(DEFAULT_INPUTS, "dark"),
    light: buildThemeTokens(DEFAULT_INPUTS, "light"),
  });
  const [copied, setCopied] = createSignal(false);
  const [mounted, setMounted] = createSignal(false);
  onMount(() => setMounted(true));

  const css = () => buildThemeCss({ dark: result().dark, light: result().light });
  const activeTokens = () => (result().scheme === "dark" ? result().dark : result().light);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(css());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard blocked (insecure context / permissions) — leave state unchanged.
    }
  };

  return (
    <div
      style={{
        "min-height": "100vh",
        background: "var(--docs-bg)",
        color: "var(--docs-text)",
        display: "flex",
        "flex-direction": "column",
        "font-family": FONT_BODY,
      }}
    >
      <Header />

      <main id="main-content" class="pv-wrap pv-wrap--wide flex-1 px-6 py-10">
        {/* Title */}
        <div class="flex flex-col items-start gap-4" style={{ "margin-bottom": "2.5rem" }}>
          <PillTag>Theme studio</PillTag>
          <h1
            style={{
              "font-family": FONT_DISPLAY,
              "font-size": "clamp(2rem, 5vw, 3rem)",
              "font-weight": "700",
              "line-height": "1.08",
              "letter-spacing": "-0.02em",
            }}
          >
            Tune it. <span style={{ color: ACCENT }}>Preview it.</span> Ship it.
          </h1>
          <p
            style={{
              "max-width": "600px",
              "font-size": "15px",
              "line-height": "1.65",
              color: "var(--docs-text-secondary)",
            }}
          >
            Adjust the color families and watch a live slice of{" "}
            <code style={{ "font-family": "monospace", "font-size": "13px" }}>@proyecto-viviana/ui</code>{" "}
            react instantly. When it looks right, copy the CSS and paste it into your app to re-skin the whole
            library.
          </p>
        </div>

        <div class="pv-studio">
          {/* Controls + export */}
          <div class="pv-studio__aside flex flex-col gap-6">
            <Panel title="Create theme">
              <ThemeStudio onChange={setResult} />
            </Panel>

            {/* Copy panel */}
            <Panel
              title="Copy your theme"
              trailing={
                <button
                  type="button"
                  onClick={copy}
                  class="pv-cta pv-cta--primary"
                  style={{
                    padding: "8px 18px",
                    "font-size": "13px",
                    ...(copied()
                      ? { background: "var(--color-success)", "box-shadow": "none" }
                      : {}),
                  }}
                >
                  {copied() ? "Copied!" : "Copy CSS"}
                </button>
              }
            >
              <p
                style={{
                  "margin-bottom": "12px",
                  "font-size": "12px",
                  "line-height": "1.6",
                  color: "var(--docs-text-secondary)",
                }}
              >
                {THEME_HOWTO}
              </p>
              <pre
                class="custom-scrollbar pv-copy-pre p-3"
                style={{
                  background: "var(--docs-bg)",
                  color: "var(--docs-text-secondary)",
                  border: "1px solid var(--docs-border)",
                  "border-radius": "var(--pv-radius-md)",
                  "font-family": "'JetBrains Mono', ui-monospace, monospace",
                  "font-size": "11px",
                  "line-height": "1.65",
                }}
              >
                {css()}
              </pre>
            </Panel>
          </div>

          {/* Live preview */}
          <div class="pv-studio__main">
            <div class="mb-4 flex items-center justify-between gap-3">
              <SectionLabel>Live preview</SectionLabel>
              <span
                style={{
                  "font-family": FONT_DISPLAY,
                  "font-size": "11px",
                  "font-weight": "700",
                  "letter-spacing": "0.06em",
                  "text-transform": "uppercase",
                  padding: "5px 12px",
                  "border-radius": "999px",
                  color: ACCENT,
                  background: "var(--pv-accent-tint)",
                }}
              >
                {result().scheme} scheme
              </span>
            </div>
            <Show
              when={mounted()}
              fallback={
                <div
                  class="flex items-center justify-center text-sm"
                  style={{
                    "min-height": "24rem",
                    border: "1px dashed var(--docs-border)",
                    "border-radius": "var(--pv-radius-lg)",
                    color: "var(--docs-text-secondary)",
                  }}
                >
                  Loading preview…
                </div>
              }
            >
              <ThemePreviewGallery tokens={activeTokens()} scheme={result().scheme} />
            </Show>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
