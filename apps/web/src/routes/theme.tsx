import { createFileRoute } from "@tanstack/solid-router";
import { createSignal, onMount, Show } from "solid-js";
import { Header } from "@/components";
import { ThemeStudio, type ThemeResult } from "@/components/theme/ThemeStudio";
import { ThemePreviewGallery } from "@/components/theme/ThemePreviewGallery";
import { buildThemeCss, THEME_HOWTO } from "@/utils/themeExport";
import { buildThemeTokens, DEFAULT_INPUTS } from "@/utils/themeGen";

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
        "font-family": "'Sen', system-ui, sans-serif",
      }}
    >
      <Header />

      <main id="main-content" class="mx-auto w-full max-w-[1400px] flex-1 px-4 py-8 sm:px-6">
        <div class="mb-8">
          <h1 class="font-jost text-3xl font-bold" style={{ color: "var(--docs-text)" }}>
            Theme Studio
          </h1>
          <p class="mt-2 max-w-2xl text-sm" style={{ color: "var(--docs-text-secondary)" }}>
            Tune the color families below and watch a live slice of{" "}
            <code class="font-mono text-[13px]">@proyecto-viviana/ui</code> react instantly. When it looks
            right, copy the CSS and paste it into your app to reskin the whole library.
          </p>
        </div>

        <div class="grid gap-8 lg:grid-cols-[minmax(300px,380px)_1fr]">
          {/* Controls + export */}
          <div class="flex flex-col gap-6 lg:sticky lg:top-6 lg:self-start">
            <div
              class="rounded-2xl p-5"
              style={{ background: "var(--docs-bg-elevated)", border: "1px solid var(--docs-border)" }}
            >
              <ThemeStudio onChange={setResult} />
            </div>

            {/* Copy panel */}
            <div
              class="rounded-2xl p-5"
              style={{ background: "var(--docs-bg-elevated)", border: "1px solid var(--docs-border)" }}
            >
              <div class="mb-3 flex items-center justify-between">
                <h2 class="font-jost text-lg font-semibold" style={{ color: "var(--docs-text)" }}>
                  Copy your theme
                </h2>
                <button
                  type="button"
                  onClick={copy}
                  class="rounded-md px-3 py-1.5 text-xs font-semibold text-white transition"
                  style={{ background: copied() ? "var(--color-success)" : "var(--color-primary-600)" }}
                >
                  {copied() ? "Copied!" : "Copy CSS"}
                </button>
              </div>
              <p class="mb-3 text-[12px] leading-relaxed" style={{ color: "var(--docs-text-secondary)" }}>
                {THEME_HOWTO}
              </p>
              <pre
                class="custom-scrollbar max-h-72 overflow-auto rounded-lg p-3 font-mono text-[11px] leading-relaxed"
                style={{
                  background: "var(--color-bg-400)",
                  color: "var(--color-text-secondary)",
                  border: "1px solid var(--docs-border)",
                }}
              >
                {css()}
              </pre>
            </div>
          </div>

          {/* Live preview */}
          <div>
            <div class="mb-3 flex items-center justify-between">
              <h2 class="font-jost text-lg font-semibold" style={{ color: "var(--docs-text)" }}>
                Live preview
              </h2>
              <span
                class="rounded-full px-2.5 py-0.5 text-[11px] font-medium capitalize"
                style={{ background: "var(--docs-bg-elevated)", color: "var(--docs-text-secondary)" }}
              >
                {result().scheme} scheme
              </span>
            </div>
            <Show
              when={mounted()}
              fallback={
                <div
                  class="flex h-96 items-center justify-center rounded-2xl text-sm"
                  style={{ border: "1px dashed var(--docs-border)", color: "var(--docs-text-secondary)" }}
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
    </div>
  );
}
