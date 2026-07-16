import { createFileRoute } from "@tanstack/solid-router";
import { createSignal, For, onMount, Show } from "solid-js";
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
import { buildThemeTokens, DEFAULT_INPUTS, type Scheme } from "@/utils/themeGen";
import "@/components/theme/studio.css";

export const Route = createFileRoute("/theme")({
  component: ThemePage,
});

function ThemePage() {
  const [result, setResult] = createSignal<ThemeResult>({
    inputs: { ...DEFAULT_INPUTS },
    dark: buildThemeTokens(DEFAULT_INPUTS, "dark"),
    light: buildThemeTokens(DEFAULT_INPUTS, "light"),
  });
  // The preview scheme lives here on the route so the device frame's header bar
  // can carry its toggle, independent of the knob editor.
  const [scheme, setScheme] = createSignal<Scheme>("dark");
  const [copied, setCopied] = createSignal(false);
  const [mounted, setMounted] = createSignal(false);
  onMount(() => setMounted(true));

  const css = () => buildThemeCss({ dark: result().dark, light: result().light });
  const activeTokens = () => (scheme() === "dark" ? result().dark : result().light);

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
                  "font-family": FONT_BODY,
                  "font-size": "12px",
                  color: "var(--docs-text-secondary)",
                }}
              >
                Rethemes as you tune the knobs.
              </span>
            </div>

            {/* Device frame: an app-window chrome around the themed canvas. Its
                bar carries the dark/light scheme toggle; the body clips the
                edge-to-edge preview to the frame's rounding. */}
            <div class="pv-frame">
              <div class="pv-frame__bar">
                <span class="pv-frame__dots" aria-hidden="true">
                  <span />
                  <span />
                  <span />
                </span>
                <span class="pv-frame__title">@proyecto-viviana/ui</span>
                <div class="pv-frame__seg" role="group" aria-label="Preview color scheme">
                  <For each={["dark", "light"] as Scheme[]}>
                    {(s) => (
                      <button
                        type="button"
                        onClick={() => setScheme(s)}
                        data-active={scheme() === s ? "true" : "false"}
                      >
                        {s}
                      </button>
                    )}
                  </For>
                </div>
              </div>
              <div class="pv-frame__body">
                <Show
                  when={mounted()}
                  fallback={
                    <div
                      class="flex items-center justify-center text-sm"
                      style={{
                        "min-height": "24rem",
                        color: "var(--docs-text-secondary)",
                      }}
                    >
                      Loading preview…
                    </div>
                  }
                >
                  <ThemePreviewGallery tokens={activeTokens()} scheme={scheme()} framed />
                </Show>
              </div>
            </div>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
