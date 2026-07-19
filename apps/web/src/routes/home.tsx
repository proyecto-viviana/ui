import { createFileRoute } from "@tanstack/solid-router";
import { Button, Badge, TextField, ToggleSwitch } from "@proyecto-viviana/ui";
import { Header } from "@/components";
import {
  ACCENT,
  CtaButton,
  FeatureBlock,
  FONT_BODY,
  FONT_DISPLAY,
  PillTag,
  SectionLabel,
  SiteFooter,
} from "@/components/theme/primitives";
import "@/components/theme/studio.css";

export const Route = createFileRoute("/home")({
  component: HomePage,
});

function HomePage() {
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

      <main id="main-content" class="pv-wrap pv-wrap--narrow flex-1 px-6">
        {/* Hero */}
        <section class="pv-hero flex flex-col items-center gap-6 text-center">
          <PillTag>Component library · Theme studio</PillTag>

          <h1
            style={{
              "font-family": FONT_DISPLAY,
              "font-size": "clamp(2.25rem, 7vw, 4.25rem)",
              "font-weight": "700",
              "line-height": "1.05",
              "letter-spacing": "-0.02em",
              "max-width": "18ch",
              "margin-top": "0.25rem",
            }}
          >
            Theme the <span style={{ color: ACCENT }}>whole library</span> from a handful of knobs.
          </h1>

          <p
            style={{
              "max-width": "480px",
              "font-size": "15px",
              "line-height": "1.65",
              color: "var(--docs-text-secondary)",
            }}
          >
            60+ certified-accessible components, faithfully ported from Adobe&rsquo;s React Spectrum. Every
            color is a design token — tune a few, watch the whole library re-skin, then copy the CSS.
          </p>

          <div class="mt-2 flex flex-wrap items-center justify-center gap-4">
            <CtaButton href="/theme" tone="primary">
              Create your theme →
            </CtaButton>
            <CtaButton href="/solid-spectrum/playground" tone="secondary">
              Explore components
            </CtaButton>
          </div>

          <a
            href="https://www.npmjs.com/package/@proyecto-viviana/ui"
            target="_blank"
            rel="noopener noreferrer"
            class="text-xs transition-opacity hover:opacity-70"
            style={{
              "font-family": "'JetBrains Mono', ui-monospace, monospace",
              color: "var(--docs-text-secondary)",
            }}
          >
            npm i @proyecto-viviana/ui
          </a>
        </section>

        {/* Feature blocks */}
        <section
          class="pv-features"
          style={{ "border-top": "1px solid var(--docs-border)", "padding-block": "2.5rem" }}
        >
          <FeatureBlock title="Token-driven">
            Components read every color from <code style={{ "font-family": "monospace" }}>--color-*</code>{" "}
            custom properties. Override the vars and the whole library adopts your palette — no forks, no
            per-component overrides.
          </FeatureBlock>
          <FeatureBlock title="Accessible">
            Keyboard navigation, focus management, and screen-reader semantics are built in and
            contrast-certified — the same behavior React Spectrum ships, ported faithfully to SolidJS.
          </FeatureBlock>
          <FeatureBlock title="Copy-paste">
            The Theme Studio generates the exact <code style={{ "font-family": "monospace" }}>:root</code>{" "}
            and light-scheme blocks. Paste them after the library&rsquo;s stylesheet and you&rsquo;re done.
          </FeatureBlock>
        </section>

        {/* Live sample strip */}
        <section
          class="pv-card flex flex-col gap-6"
          style={{ "margin-bottom": "2.5rem", padding: "28px" }}
        >
          <SectionLabel>Real components, live</SectionLabel>
          <div class="flex flex-wrap items-center gap-6">
            <div class="flex flex-wrap items-center gap-3">
              <Button variant="primary">Primary</Button>
              <Button variant="accent">Accent</Button>
              <Badge count={3} variant="success" />
              <Badge count={7} variant="accent" />
            </div>
            <div class="flex w-full max-w-xs flex-col gap-3">
              <TextField label="Email" placeholder="you@example.com" />
              <ToggleSwitch defaultSelected>Notifications</ToggleSwitch>
            </div>
          </div>
        </section>

        {/* Bottom CTA */}
        <section
          class="flex flex-col items-center gap-5 text-center"
          style={{ "padding-block": "3rem 3.5rem" }}
        >
          <h2
            style={{
              "font-family": FONT_DISPLAY,
              "font-size": "clamp(1.5rem, 4vw, 2.25rem)",
              "font-weight": "700",
              "letter-spacing": "-0.01em",
              margin: "0",
            }}
          >
            Ready to make it yours?
          </h2>
          <CtaButton href="/theme" tone="primary">
            Open the Theme Studio →
          </CtaButton>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
