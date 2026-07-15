import { createFileRoute, Link } from "@tanstack/solid-router";
import { type JSX } from "solid-js";
import { Button, Badge, TextField, ToggleSwitch } from "@proyecto-viviana/ui";
import { Chip } from "@proyecto-viviana/ui/Chip";
import { Logo } from "@proyecto-viviana/ui/Logo";
import { Header } from "@/components";

export const Route = createFileRoute("/home")({
  component: HomePage,
});

function Section(props: { eyebrow: string; title: string; children: JSX.Element; sample: JSX.Element }) {
  return (
    <section class="grid items-center gap-8 py-12 md:grid-cols-2">
      <div>
        <span
          class="font-jost text-[11px] font-bold uppercase tracking-[0.15em]"
          style={{ color: "var(--color-accent)" }}
        >
          {props.eyebrow}
        </span>
        <h2 class="mt-2 font-jost text-2xl font-bold" style={{ color: "var(--docs-text)" }}>
          {props.title}
        </h2>
        <p class="mt-3 max-w-md text-sm leading-relaxed" style={{ color: "var(--docs-text-secondary)" }}>
          {props.children}
        </p>
      </div>
      <div
        class="flex min-h-[180px] items-center justify-center rounded-2xl p-6"
        style={{ background: "var(--docs-bg-elevated)", border: "1px solid var(--docs-border)" }}
      >
        {props.sample}
      </div>
    </section>
  );
}

function HomePage() {
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

      <main id="main-content" class="mx-auto w-full max-w-[1100px] flex-1 px-4 sm:px-6">
        {/* Hero */}
        <section class="flex flex-col items-center py-16 text-center sm:py-24">
          <span
            class="mb-6 inline-flex items-center gap-2 rounded-full px-3 py-1 font-jost text-[11px] font-bold uppercase tracking-[0.15em]"
            style={{ background: "var(--docs-bg-elevated)", color: "var(--color-accent)" }}
          >
            Component library · Theme studio
          </span>

          <div class="mb-6 scale-[1.6] sm:scale-[2.2]">
            <Logo firstWord="PROYECTO" secondWord="VIVIANA" size="lg" />
          </div>

          <h1
            class="mt-4 max-w-3xl font-jost text-4xl font-bold leading-[1.05] sm:text-6xl"
            style={{ color: "var(--docs-text)" }}
          >
            An accessible SolidJS library that speaks{" "}
            <span style={{ color: "var(--color-accent)" }}>your</span> brand.
          </h1>

          <p
            class="mt-5 max-w-xl text-base leading-relaxed"
            style={{ color: "var(--docs-text-secondary)" }}
          >
            60+ certified-accessible components, faithfully ported from Adobe's React Spectrum. Every color
            is a design token — theme the entire library from a handful of knobs, then copy the CSS.
          </p>

          <div class="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/theme"
              class="rounded-lg px-6 py-3 font-jost text-sm font-bold text-white transition hover:opacity-90"
              style={{ background: "var(--color-accent)", "text-decoration": "none" }}
            >
              Create your theme →
            </Link>
            <Link
              to="/solid-spectrum/playground"
              class="rounded-lg px-6 py-3 font-jost text-sm font-bold transition hover:opacity-80"
              style={{
                border: "2px solid var(--color-primary-600)",
                color: "var(--color-primary-400)",
                "text-decoration": "none",
              }}
            >
              Explore components
            </Link>
            <a
              href="https://www.npmjs.com/package/@proyecto-viviana/ui"
              target="_blank"
              rel="noopener noreferrer"
              class="font-mono text-xs transition hover:opacity-80"
              style={{ color: "var(--docs-text-secondary)" }}
            >
              npm i @proyecto-viviana/ui
            </a>
          </div>
        </section>

        {/* Highlights */}
        <div style={{ "border-top": "1px solid var(--docs-border)" }}>
          <Section
            eyebrow="Design tokens"
            title="Themeable by design"
            sample={
              <div class="flex flex-wrap items-center justify-center gap-3">
                <Button variant="primary">Primary</Button>
                <Button variant="accent">Accent</Button>
                <Chip text="Themed" variant="primary" />
                <Chip text="Chip" variant="accent" />
              </div>
            }
          >
            Components read their colors from <code class="font-mono text-[13px]">--color-*</code> custom
            properties. Override those variables and the whole library adopts your palette — no forks, no
            component overrides.
          </Section>

          <div style={{ "border-top": "1px solid var(--docs-border)" }}>
            <Section
              eyebrow="WAI-ARIA"
              title="Accessible components"
              sample={
                <div class="flex w-full max-w-xs flex-col gap-4">
                  <TextField label="Email" placeholder="you@example.com" />
                  <ToggleSwitch defaultSelected>Notifications</ToggleSwitch>
                  <div class="flex items-center gap-2">
                    <Badge count={3} variant="success" />
                    <Badge count={7} variant="accent" />
                  </div>
                </div>
              }
            >
              Keyboard navigation, focus management, and screen-reader semantics are built in and
              contrast-certified — the same behavior Adobe's React Spectrum ships, ported faithfully to
              SolidJS.
            </Section>
          </div>

          <div style={{ "border-top": "1px solid var(--docs-border)" }}>
            <Section
              eyebrow="Copy-paste"
              title="Ship a theme in minutes"
              sample={
                <pre
                  class="w-full overflow-auto rounded-lg p-4 font-mono text-[11px] leading-relaxed"
                  style={{ background: "var(--color-bg-400)", color: "var(--color-text-secondary)" }}
                >{`:root {
  --color-primary: #7c5cff;
  --color-accent: #ff5c8a;
  /* …full contract… */
}`}</pre>
              }
            >
              The Theme Studio generates the exact <code class="font-mono text-[13px]">:root</code> and
              light-scheme override blocks. Paste them after the library's stylesheet and you're done.
            </Section>
          </div>
        </div>

        {/* Bottom CTA */}
        <section class="flex flex-col items-center gap-4 py-16 text-center">
          <h2 class="font-jost text-2xl font-bold" style={{ color: "var(--docs-text)" }}>
            Ready to make it yours?
          </h2>
          <Link
            to="/theme"
            class="rounded-lg px-6 py-3 font-jost text-sm font-bold text-white transition hover:opacity-90"
            style={{ background: "var(--color-accent)", "text-decoration": "none" }}
          >
            Open the Theme Studio →
          </Link>
        </section>
      </main>

      <footer
        class="flex flex-wrap items-center justify-between px-6 py-4 text-[11px]"
        style={{ "border-top": "1px solid var(--docs-border)", color: "var(--docs-text-secondary)" }}
      >
        <span style={{ "font-weight": "600", color: "var(--docs-text)" }}>Proyecto Viviana</span>
        <div class="flex gap-4 text-[10px]">
          <span style={{ color: "var(--color-primary-400)" }}>SolidJS</span>
          <span style={{ color: "var(--color-accent)" }}>Design tokens</span>
          <span style={{ color: "var(--color-primary-400)" }}>WAI-ARIA</span>
        </div>
      </footer>
    </div>
  );
}
