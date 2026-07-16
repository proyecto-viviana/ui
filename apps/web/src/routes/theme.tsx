import { createFileRoute } from "@tanstack/solid-router";
import { createSignal, onMount, Show, type JSX } from "solid-js";
import { Header } from "@/components";
import { ThemeStudio, type ThemeResult } from "@/components/theme/ThemeStudio";
import { ThemePreviewGallery } from "@/components/theme/ThemePreviewGallery";
import {
  AccentBar,
  BLUE,
  FONT_BODY,
  FONT_DISPLAY,
  PillTag,
  PINK,
  PINK_GLOW,
  SiteFooter,
} from "@/components/theme/primitives";
import { buildThemeCss, THEME_HOWTO } from "@/utils/themeExport";
import { buildThemeTokens, DEFAULT_INPUTS } from "@/utils/themeGen";
import "@/components/theme/studio.css";

export const Route = createFileRoute("/theme")({
  component: ThemePage,
});

// A titled chrome panel: sharp corners, 2px border, left accent bar on the heading.
function Panel(props: {
  tone: "blue" | "pink";
  title: string;
  children: JSX.Element;
  trailing?: JSX.Element;
}) {
  return (
    <section
      style={{
        background: "var(--docs-bg-elevated)",
        border: "2px solid var(--docs-border)",
        padding: "20px",
      }}
    >
      <div class="mb-4 flex items-center justify-between gap-3">
        <div style={{ display: "flex", "align-items": "center", gap: "10px" }}>
          <AccentBar tone={props.tone} height="20px" />
          <h2
            style={{
              "font-family": FONT_DISPLAY,
              "font-size": "13px",
              "font-weight": "600",
              "letter-spacing": "0.12em",
              "text-transform": "uppercase",
              color: "var(--docs-text)",
            }}
          >
            {props.title}
          </h2>
        </div>
        {props.trailing}
      </div>
      {props.children}
    </section>
  );
}

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
        <div class="flex flex-col items-start gap-4" style={{ "margin-bottom": "2rem" }}>
          <PillTag tone="blue">Theme studio</PillTag>
          <h1
            style={{
              "font-family": FONT_DISPLAY,
              "font-size": "clamp(2rem, 5vw, 3rem)",
              "font-weight": "700",
              "line-height": "1.05",
              "letter-spacing": "-0.02em",
            }}
          >
            Tune it. <span style={{ color: BLUE }}>Preview it.</span>{" "}
            <span style={{ color: PINK }}>Ship it.</span>
          </h1>
          <p
            style={{
              "max-width": "560px",
              "border-left": `3px solid ${PINK}`,
              "padding-left": "14px",
              "font-size": "14px",
              "line-height": "1.6",
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
            <Panel tone="blue" title="Create theme">
              <ThemeStudio onChange={setResult} />
            </Panel>

            {/* Copy panel */}
            <Panel
              tone="pink"
              title="Copy your theme"
              trailing={
                <button
                  type="button"
                  onClick={copy}
                  style={{
                    "font-family": FONT_DISPLAY,
                    "font-size": "12px",
                    "font-weight": "600",
                    "letter-spacing": "0.04em",
                    padding: "7px 16px",
                    cursor: "pointer",
                    color: "#141414",
                    background: copied() ? "var(--color-success)" : PINK,
                    border: `2px solid ${copied() ? "var(--color-success)" : PINK}`,
                    filter: copied() ? "none" : `drop-shadow(0 0 8px ${PINK_GLOW})`,
                    transition: "background 0.2s ease",
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
              <div style={{ display: "flex", "align-items": "center", gap: "10px" }}>
                <AccentBar tone="pink" height="20px" />
                <h2
                  style={{
                    "font-family": FONT_DISPLAY,
                    "font-size": "13px",
                    "font-weight": "600",
                    "letter-spacing": "0.12em",
                    "text-transform": "uppercase",
                    color: "var(--docs-text)",
                  }}
                >
                  Live preview
                </h2>
              </div>
              <span
                style={{
                  "font-family": FONT_DISPLAY,
                  "font-size": "11px",
                  "font-weight": "600",
                  "letter-spacing": "0.08em",
                  "text-transform": "uppercase",
                  padding: "4px 10px",
                  color: BLUE,
                  border: `2px solid ${BLUE}`,
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
