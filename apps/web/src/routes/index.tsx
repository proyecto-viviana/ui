import { createFileRoute, Link } from "@tanstack/solid-router";
import { Button, Badge, Flex, TextField, ToggleSwitch, typeRoles } from "@proyecto-viviana/ui";
import { Header, SiteBackdrop } from "@/components";
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

export const Route = createFileRoute("/")({
  component: LandingPage,
});

/** One of the two styled registers, presented as a peer on the landing: name,
 *  register tagline, one-line pitch, its own install string, and the CTA into
 *  that register's surface. */
function RegisterCard(props: {
  name: string;
  tagline: string;
  blurb: string;
  pkg: string;
  ctaHref: string;
  ctaLabel: string;
}) {
  return (
    <div
      class="pv-card"
      style={{
        flex: "1 1 260px",
        display: "flex",
        "flex-direction": "column",
        gap: "14px",
        padding: "28px",
      }}
    >
      <div style={{ display: "flex", "flex-direction": "column", gap: "4px" }}>
        <span
          style={{
            "font-family": FONT_DISPLAY,
            "font-size": "20px",
            "font-weight": "700",
            "letter-spacing": "-0.01em",
            color: "var(--docs-text)",
          }}
        >
          {props.name}
        </span>
        <span
          style={{
            "font-family": FONT_BODY,
            "font-size": "12px",
            "font-weight": "600",
            "letter-spacing": "0.04em",
            "text-transform": "uppercase",
            color: ACCENT,
          }}
        >
          {props.tagline}
        </span>
      </div>
      <p
        style={{
          flex: "1",
          "font-family": FONT_BODY,
          "font-size": "13.5px",
          "line-height": "1.6",
          color: "var(--docs-text-secondary)",
          margin: "0",
        }}
      >
        {props.blurb}
      </p>
      <a
        href={`https://www.npmjs.com/package/${props.pkg}`}
        target="_blank"
        rel="noopener noreferrer"
        class={typeRoles.terminal}
        style={{ color: "var(--docs-text-secondary)", "text-decoration": "none" }}
      >
        npm i {props.pkg}
      </a>
      <CtaButton href={props.ctaHref} tone="primary">
        {props.ctaLabel}
      </CtaButton>
    </div>
  );
}

function LandingPage() {
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
      <SiteBackdrop variant="scene" />
      <Header />

      <main
        id="main-content"
        class="pv-wrap pv-wrap--narrow"
        style={{ flex: "1", "padding-inline": "1.5rem" }}
      >
        {/* Hero */}
        <section
          class="pv-hero"
          style={{
            display: "flex",
            "flex-direction": "column",
            "align-items": "center",
            gap: "24px",
            "text-align": "center",
          }}
        >
          <PillTag>Two styled systems · One Solid foundation</PillTag>

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
            Two styled component systems, one{" "}
            <span style={{ color: ACCENT }}>Solid foundation</span>.
          </h1>

          <p
            style={{
              "max-width": "520px",
              "font-size": "15px",
              "line-height": "1.65",
              color: "var(--docs-text-secondary)",
            }}
          >
            Accessible SolidJS components, faithfully ported from Adobe&rsquo;s React Aria. Pick the
            look — the Glasselated <strong>viviana-ui</strong> or pixel-faithful{" "}
            <strong>solid-spectrum</strong> — both share the same certified-accessible core.
          </p>
        </section>

        {/* The two registers, side by side as peers */}
        <section
          class="pv-registers"
          style={{
            display: "flex",
            "flex-wrap": "wrap",
            gap: "20px",
            "margin-top": "8px",
          }}
        >
          <RegisterCard
            name="viviana-ui"
            tagline="Glasselated"
            blurb="Our expressive register — frosted glass, pixel accents, the Geist trio. The house design system, live in the showcase."
            pkg="@proyecto-viviana/ui"
            ctaHref="/showcase"
            ctaLabel="Explore the showcase →"
          />
          <RegisterCard
            name="solid-spectrum"
            tagline="Spectrum 2 parity"
            blurb="Adobe Spectrum 2 for Solid — pixel-faithful to React Spectrum and certified cell-by-cell against the upstream pin."
            pkg="@proyecto-viviana/solid-spectrum"
            ctaHref="/solid-spectrum/docs"
            ctaLabel="Read the docs →"
          />
        </section>

        {/* Shared foundation */}
        <section
          style={{
            display: "flex",
            "flex-wrap": "wrap",
            "align-items": "center",
            "justify-content": "center",
            gap: "8px 16px",
            "padding-block": "1.75rem",
            "text-align": "center",
          }}
        >
          <SectionLabel>Both built on</SectionLabel>
          <Link
            to="/solid-spectrum/ecosystem"
            class={typeRoles.terminal}
            style={{ color: "var(--docs-text-secondary)", "text-decoration": "none" }}
          >
            solidaria · solid-stately · solidaria-components
          </Link>
        </section>

        {/* Feature blocks */}
        <section
          class="pv-features"
          style={{ "border-top": "1px solid var(--docs-border)", "padding-block": "2.5rem" }}
        >
          <FeatureBlock title="Token-driven">
            Components read every color from{" "}
            <code style={{ "font-family": "monospace" }}>--color-*</code> custom properties.
            Override the vars and the whole library adopts your palette — no forks, no per-component
            overrides.
          </FeatureBlock>
          <FeatureBlock title="Accessible">
            Keyboard navigation, focus management, and screen-reader semantics are built in and
            contrast-certified — the same behavior React Spectrum ships, ported faithfully to
            SolidJS.
          </FeatureBlock>
          <FeatureBlock title="Copy-paste">
            The Theme Studio generates the exact{" "}
            <code style={{ "font-family": "monospace" }}>:root</code> and light-scheme blocks. Paste
            them after the library&rsquo;s stylesheet and you&rsquo;re done.
          </FeatureBlock>
        </section>

        {/* Live sample strip */}
        <section
          class="pv-card"
          style={{
            display: "flex",
            "flex-direction": "column",
            gap: "24px",
            "margin-bottom": "2.5rem",
            padding: "28px",
          }}
        >
          <SectionLabel>Real components, live</SectionLabel>
          <Flex wrap alignItems="center" gap={6}>
            <Flex wrap alignItems="center" gap={3}>
              <Button variant="primary">Primary</Button>
              <Button variant="accent">Accent</Button>
              <Badge count={3} variant="success" />
              <Badge count={7} variant="accent" />
            </Flex>
            <Flex direction="column" gap={3} style={{ width: "100%", "max-width": "20rem" }}>
              <TextField label="Email" placeholder="you@example.com" />
              <ToggleSwitch defaultSelected>Notifications</ToggleSwitch>
            </Flex>
          </Flex>
        </section>

        {/* Bottom CTA */}
        <section
          style={{
            display: "flex",
            "flex-direction": "column",
            "align-items": "center",
            gap: "20px",
            "text-align": "center",
            "padding-block": "3rem 3.5rem",
          }}
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
