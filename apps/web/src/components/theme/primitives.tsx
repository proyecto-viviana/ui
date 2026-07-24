import { Link } from "@tanstack/solid-router";
import { type JSX } from "solid-js";

/**
 * Shared design vocabulary for the docs-site chrome (landing + Theme Studio),
 * faithful to Adobe Spectrum 2: rounded corners, calm neutral surfaces, subtle
 * 1px borders + soft shadows, a SINGLE blue accent, generous whitespace, no glow.
 * This mirrors the rounded, soft `@proyecto-viviana/ui` components the pages
 * showcase, so chrome and components read as one system. Chrome colors ride the
 * auto-theming `--docs-*` tokens; the accent is `--docs-accent` (blue).
 *
 * A few legacy export names (PINK, PINK_GLOW, AccentBar, tone props) are kept as
 * thin aliases so existing imports keep compiling — the palette is now blue-only,
 * so they resolve to the single accent.
 */

export const ACCENT = "var(--docs-accent)";
export const BLUE = ACCENT;
/** @deprecated palette is blue-only now — kept as an alias so imports compile. */
export const PINK = ACCENT;
/** @deprecated no glow in the Spectrum-2 look. */
export const PINK_GLOW = "transparent";

/* Faces come from @proyecto-viviana/ui's type tokens, not from a stack named
   here: --font-title is Geist Pixel, --font-body is Geist. */
export const FONT_DISPLAY = "var(--font-title)";
export const FONT_BODY = "var(--font-body)";

/** A soft rounded blue marker — the subtle Spectrum accent tick. */
export function AccentBar(props: { tone?: unknown; height?: string }) {
  return (
    <span
      aria-hidden="true"
      style={{
        display: "inline-block",
        width: "4px",
        height: props.height ?? "20px",
        "border-radius": "999px",
        background: ACCENT,
        "flex-shrink": "0",
      }}
    />
  );
}

/** A small uppercase section label — clean typographic eyebrow, accent-colored. */
export function SectionLabel(props: { children: JSX.Element }) {
  return (
    <span
      style={{
        "font-family": FONT_DISPLAY,
        "font-size": "12px",
        "font-weight": "700",
        "letter-spacing": "0.08em",
        "text-transform": "uppercase",
        color: "var(--docs-text-secondary)",
      }}
    >
      {props.children}
    </span>
  );
}

/** Soft rounded eyebrow pill — faint accent tint, accent text (no neon fill). */
export function PillTag(props: { tone?: unknown; children: JSX.Element }) {
  return (
    <span
      style={{
        "align-self": "center",
        display: "inline-flex",
        "align-items": "center",
        background: "var(--pv-accent-tint)",
        color: ACCENT,
        padding: "6px 14px",
        "border-radius": "999px",
        "font-family": FONT_DISPLAY,
        "font-size": "11px",
        "font-weight": "700",
        "letter-spacing": "0.08em",
        "text-transform": "uppercase",
      }}
    >
      {props.children}
    </span>
  );
}

/** A soft rounded feature card: small accent dot + title + muted body. */
export function FeatureBlock(props: { tone?: unknown; title: string; children: JSX.Element }) {
  return (
    <div
      class="pv-card"
      style={{
        padding: "22px",
        display: "flex",
        "flex-direction": "column",
        gap: "12px",
      }}
    >
      <div style={{ display: "flex", "align-items": "center", gap: "10px" }}>
        <span
          aria-hidden="true"
          style={{
            display: "inline-block",
            width: "10px",
            height: "10px",
            "border-radius": "3px",
            background: ACCENT,
            "flex-shrink": "0",
          }}
        />
        <h3
          style={{
            "font-family": FONT_DISPLAY,
            "font-size": "15px",
            "font-weight": "700",
            "letter-spacing": "-0.01em",
            color: "var(--docs-text)",
          }}
        >
          {props.title}
        </h3>
      </div>
      <p
        style={{
          "font-family": FONT_BODY,
          "font-size": "13.5px",
          "line-height": "1.6",
          color: "var(--docs-text-secondary)",
        }}
      >
        {props.children}
      </p>
    </div>
  );
}

/** A titled, soft, rounded chrome panel. Optional trailing control in the header. */
export function Panel(props: {
  title: string;
  children: JSX.Element;
  trailing?: JSX.Element;
}) {
  return (
    <section class="pv-card" style={{ padding: "24px" }}>
      <div
        style={{
          display: "flex",
          "align-items": "center",
          "justify-content": "space-between",
          gap: "12px",
          "margin-bottom": "18px",
        }}
      >
        <h2
          style={{
            "font-family": FONT_DISPLAY,
            "font-size": "13px",
            "font-weight": "700",
            "letter-spacing": "0.06em",
            "text-transform": "uppercase",
            color: "var(--docs-text-secondary)",
          }}
        >
          {props.title}
        </h2>
        {props.trailing}
      </div>
      {props.children}
    </section>
  );
}

/** Spectrum-2 pill CTA — solid blue (primary) or outlined neutral (secondary). */
export function CtaButton(props: {
  href: string;
  external?: boolean;
  tone?: "primary" | "secondary";
  children: JSX.Element;
}) {
  const cls = () => `pv-cta pv-cta--${props.tone ?? "primary"}`;

  if (props.external) {
    return (
      <a href={props.href} target="_blank" rel="noopener noreferrer" class={cls()}>
        {props.children}
      </a>
    );
  }
  return (
    <Link to={props.href} class={cls()}>
      {props.children}
    </Link>
  );
}

/** Quiet footer bar — 1px top rule, calm links. */
export function SiteFooter() {
  return (
    <footer
      style={{
        "min-height": "44px",
        display: "flex",
        "flex-wrap": "wrap",
        "align-items": "center",
        "justify-content": "space-between",
        gap: "8px",
        padding: "12px 32px",
        "border-top": "1px solid var(--docs-border)",
        "font-family": FONT_BODY,
        "font-size": "13px",
      }}
    >
      <span style={{ "font-weight": "600", color: "var(--docs-text-secondary)" }}>
        Proyecto Viviana
      </span>
      <div style={{ display: "flex", gap: "20px" }}>
        <Link to="/" style={{ color: "var(--docs-text-secondary)", "text-decoration": "none" }}>
          Home
        </Link>
        <Link to="/theme" style={{ color: "var(--docs-text-secondary)", "text-decoration": "none" }}>
          Theme
        </Link>
        <a
          href="https://www.npmjs.com/package/@proyecto-viviana/ui"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "var(--docs-text-secondary)", "text-decoration": "none" }}
        >
          npm
        </a>
      </div>
    </footer>
  );
}
