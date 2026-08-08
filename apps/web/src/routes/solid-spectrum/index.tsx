import { createFileRoute } from "@tanstack/solid-router";
import { GitHubIcon } from "@proyecto-viviana/solid-spectrum/GitHubIcon";
import { Header, SiteBackdrop } from "@/components";
import {
  ACCENT_INK,
  CtaButton,
  FONT_BODY,
  FONT_DISPLAY,
  PillTag,
  SiteFooter,
} from "@/components/theme/primitives";
import { REPO_URL } from "@/lib/site";
import { seo } from "@/seo";
import "@/components/theme/studio.css";

export const Route = createFileRoute("/solid-spectrum/")({
  head: () =>
    seo({
      title: "solid-spectrum",
      description:
        "An accessible UI library for SolidJS — an unofficial port of Adobe's React Spectrum 2, with compiled styles, SSR support, and full keyboard interaction.",
      path: "/solid-spectrum",
    }),
  component: Landing,
});

/** A glass stat card — pixel headline, Geist caption, register-blue accent tick. */
function StatCard(props: { title: string; desc: string }) {
  return (
    <div
      class="pv-card"
      style={{
        display: "flex",
        "align-items": "flex-start",
        gap: "12px",
        padding: "18px",
        "text-align": "left",
      }}
    >
      <div
        style={{
          width: "3px",
          height: "36px",
          background: "var(--accent-primary)",
          "border-radius": "2px",
          "flex-shrink": "0",
        }}
      />
      <div>
        <div
          style={{
            "font-family": FONT_DISPLAY,
            "font-weight": "700",
            "font-size": "15px",
            "letter-spacing": "0.01em",
            "margin-bottom": "3px",
            color: "var(--docs-text)",
          }}
        >
          {props.title}
        </div>
        <div style={{ "font-size": "12px", color: "var(--docs-text-secondary)" }}>{props.desc}</div>
      </div>
    </div>
  );
}

function Landing() {
  return (
    <div
      style={{
        "min-height": "100vh",
        background: "transparent",
        display: "flex",
        "flex-direction": "column",
        "font-family": FONT_BODY,
        color: "var(--docs-text)",
      }}
    >
      <SiteBackdrop variant="scene" />
      <Header />

      <main
        id="main-content"
        style={{
          flex: "1",
          display: "flex",
          "flex-direction": "column",
          "align-items": "center",
          "justify-content": "center",
          padding: "4rem 2rem",
          "text-align": "center",
          gap: "20px",
        }}
      >
        <PillTag>Accessible UI library for SolidJS</PillTag>

        <h1
          style={{
            "font-family": FONT_DISPLAY,
            "font-size": "clamp(2.5rem, 8vw, 4.75rem)",
            "font-weight": "700",
            "line-height": "1.02",
            margin: "0",
            "letter-spacing": "-0.02em",
            "max-width": "16ch",
          }}
        >
          Accessibility at <span style={{ color: ACCENT_INK }}>Solid speed</span>.
        </h1>

        <p
          style={{
            "font-size": "15px",
            "max-width": "480px",
            "line-height": "1.65",
            margin: "0",
            color: "var(--docs-text-secondary)",
          }}
        >
          A meticulously crafted port of Adobe&rsquo;s React Spectrum — 60+ accessible components,
          certified cell-by-cell against the upstream pin, zero compromises.
        </p>

        {/* CTA Buttons */}
        <div
          style={{
            display: "flex",
            gap: "12px",
            "flex-wrap": "wrap",
            "justify-content": "center",
            "margin-top": "4px",
          }}
        >
          <CtaButton href="/solid-spectrum/docs" tone="primary">
            Read the docs →
          </CtaButton>
          <a
            href={REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
            class="pv-cta pv-cta--secondary"
            style={{ display: "inline-flex", "align-items": "center", gap: "8px" }}
          >
            <GitHubIcon size={16} />
            GitHub
          </a>
        </div>

        {/* Stat cards */}
        <div
          style={{
            display: "grid",
            "grid-template-columns": "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "12px",
            "margin-top": "2rem",
            "max-width": "620px",
            width: "100%",
          }}
        >
          <StatCard title="3,680 tests" desc="World-class a11y coverage" />
          <StatCard title="60+ components" desc="Forms, data, overlays, dates" />
          <StatCard title="4-layer arch" desc="State → ARIA → Headless → UI" />
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
