import { createFileRoute } from "@tanstack/solid-router";
import { createSignal, For, onMount, Show } from "solid-js";
import { Button, Flex, typeRoles } from "@proyecto-viviana/ui";
import { Header, SiteBackdrop } from "@/components";
import { ThemeStudio, type ThemeResult } from "@/components/theme/ThemeStudio";
import { ThemePreviewGallery } from "@/components/theme/ThemePreviewGallery";
import { SpectrumPreviewGallery } from "@/components/theme/SpectrumPreviewGallery";
import spectrumStyles from "@proyecto-viviana/solid-spectrum/styles.css?url";
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

// The solid-spectrum register preview needs the package's own stylesheet, which is
// otherwise only loaded on the /solid-spectrum layout. Its atoms are hashed classes
// (plus a harmless `:where(:root,:host)` of --s2-* vars), so it can't bleed onto the
// viviana-ui gallery that shares this page — only S2 components carry those classes.
export const Route = createFileRoute("/theme")({
  head: () => ({
    links: [{ rel: "stylesheet", href: spectrumStyles }],
  }),
  component: ThemePage,
});

type Register = "viviana-ui" | "solid-spectrum";
const REGISTERS: { id: Register; label: string; pkg: string }[] = [
  { id: "viviana-ui", label: "viviana-ui", pkg: "@proyecto-viviana/ui" },
  { id: "solid-spectrum", label: "solid-spectrum", pkg: "@proyecto-viviana/solid-spectrum" },
];

function ThemePage() {
  const [result, setResult] = createSignal<ThemeResult>({
    inputs: { ...DEFAULT_INPUTS },
    dark: buildThemeTokens(DEFAULT_INPUTS, "dark"),
    light: buildThemeTokens(DEFAULT_INPUTS, "light"),
  });
  // The preview scheme lives here on the route so the device frame's header bar
  // can carry its toggle, independent of the knob editor.
  const [scheme, setScheme] = createSignal<Scheme>("dark");
  // Which styled register the live preview shows. The knobs drive viviana-ui only;
  // solid-spectrum wears its own fixed Spectrum palette, so this is a preview flip.
  const [register, setRegister] = createSignal<Register>("viviana-ui");
  const activePkg = () => REGISTERS.find((r) => r.id === register())!.pkg;
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
        background: "transparent",
        color: "var(--docs-text)",
        display: "flex",
        "flex-direction": "column",
        "font-family": FONT_BODY,
      }}
    >
      <SiteBackdrop variant="calm" />
      <Header />

      <main
        id="main-content"
        class="pv-wrap pv-wrap--wide"
        style={{ flex: "1", padding: "2.5rem 1.5rem" }}
      >
        {/* Title */}
        <Flex direction="column" alignItems="start" gap={4} style={{ "margin-bottom": "2.5rem" }}>
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
        </Flex>

        <div class="pv-studio">
          {/* Controls + export */}
          <Flex direction="column" gap={6} class="pv-studio__aside">
            <Panel title="Create theme">
              <ThemeStudio onChange={setResult} />
            </Panel>

            {/* Copy panel */}
            <Panel
              title="Copy your theme"
              trailing={
                <Button size="S" variant={copied() ? "success" : "accent"} onPress={copy}>
                  {copied() ? "Copied!" : "Copy CSS"}
                </Button>
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
                class="custom-scrollbar pv-copy-pre"
                style={{
                  padding: "12px",
                  background: "var(--docs-bg)",
                  color: "var(--docs-text-secondary)",
                  border: "1px solid var(--docs-border)",
                  "border-radius": "var(--pv-radius-md)",
                  "font-family": "var(--font-mono)",
                  "font-size": "11px",
                  "line-height": "1.65",
                }}
              >
                {css()}
              </pre>
            </Panel>
          </Flex>

          {/* Live preview */}
          <div class="pv-studio__main">
            <Flex
              alignItems="center"
              justifyContent="between"
              gap={3}
              wrap
              style={{ "margin-bottom": "16px" }}
            >
              <SectionLabel>Live preview</SectionLabel>
              <Flex alignItems="center" gap={3}>
                <span
                  style={{
                    "font-family": FONT_BODY,
                    "font-size": "12px",
                    color: "var(--docs-text-secondary)",
                  }}
                >
                  {register() === "viviana-ui"
                    ? "Rethemes as you tune the knobs."
                    : "Spectrum's own palette — knobs drive viviana-ui."}
                </span>
                {/* Register selector: flips the previewed styled register. */}
                <div class="pv-frame__seg" role="group" aria-label="Preview register">
                  <For each={REGISTERS}>
                    {(r) => (
                      <button
                        type="button"
                        onClick={() => setRegister(r.id)}
                        data-active={register() === r.id ? "true" : "false"}
                        style={{ "text-transform": "none" }}
                      >
                        {r.label}
                      </button>
                    )}
                  </For>
                </div>
              </Flex>
            </Flex>

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
                <span class="pv-frame__title">{activePkg()}</span>
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
              {/* The frame's own `overflow: hidden` is what clips this to the rounding. */}
              <div>
                <Show
                  when={mounted()}
                  fallback={
                    <Flex
                      alignItems="center"
                      justifyContent="center"
                      class={typeRoles.body}
                      style={{ "min-height": "24rem", color: "var(--docs-text-secondary)" }}
                    >
                      Loading preview…
                    </Flex>
                  }
                >
                  <Show
                    when={register() === "solid-spectrum"}
                    fallback={<ThemePreviewGallery tokens={activeTokens()} scheme={scheme()} framed />}
                  >
                    <SpectrumPreviewGallery scheme={scheme()} framed />
                  </Show>
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
