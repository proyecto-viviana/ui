import { Link } from "@tanstack/solid-router";
import { type JSX } from "solid-js";

/**
 * Shared design vocabulary for the docs-site chrome (landing + Theme Studio),
 * mirroring the solid-spectrum aesthetic: sharp corners (zero radius), 2px
 * borders, left accent bars, Jost display / Sen body, and a genuine two-tone
 * blue+pink accent. Chrome colors ride the auto-theming `--docs-*` tokens; the
 * two accents are the real brand vars (`--docs-accent` blue, `--color-accent`
 * pink) so the palette stays distinct instead of collapsing to one hue.
 */

export const BLUE = "var(--docs-accent)";
export const PINK = "var(--color-accent)";

export const PINK_GLOW = "color-mix(in srgb, var(--color-accent) 55%, transparent)";
export const BLUE_GLOW = "color-mix(in srgb, var(--docs-accent) 45%, transparent)";
export const PINK_TINT = "color-mix(in srgb, var(--color-accent) 14%, transparent)";
export const BLUE_TINT = "color-mix(in srgb, var(--docs-accent) 14%, transparent)";
export const PINK_EDGE = "color-mix(in srgb, var(--color-accent) 40%, transparent)";
export const BLUE_EDGE = "color-mix(in srgb, var(--docs-accent) 40%, transparent)";

export const FONT_DISPLAY = "'Jost', system-ui, sans-serif";
export const FONT_BODY = "'Sen', system-ui, sans-serif";

/** Dark ink used for text sitting on a solid accent fill — legible on both hues. */
const INK = "#141414";

type Tone = "blue" | "pink";
const hue = (tone: Tone) => (tone === "blue" ? BLUE : PINK);
const edge = (tone: Tone) => (tone === "blue" ? BLUE_EDGE : PINK_EDGE);

/** A 3px vertical accent bar — the recurring left-rule motif. */
export function AccentBar(props: { tone?: Tone; height?: string }) {
  return (
    <span
      aria-hidden="true"
      style={{
        display: "inline-block",
        width: "3px",
        height: props.height ?? "32px",
        background: hue(props.tone ?? "pink"),
        "flex-shrink": "0",
      }}
    />
  );
}

/** Sharp uppercase eyebrow pill on a solid accent fill. */
export function PillTag(props: { tone?: Tone; children: JSX.Element }) {
  return (
    <span
      style={{
        "align-self": "flex-start",
        background: hue(props.tone ?? "pink"),
        color: INK,
        padding: "4px 12px",
        "font-family": FONT_DISPLAY,
        "font-size": "11px",
        "font-weight": "600",
        "letter-spacing": "0.12em",
        "text-transform": "uppercase",
      }}
    >
      {props.children}
    </span>
  );
}

/** A bordered feature card with an inner accent bar + Jost title + muted body. */
export function FeatureBlock(props: { tone: Tone; title: string; children: JSX.Element }) {
  return (
    <div
      style={{
        padding: "16px",
        background: "var(--docs-bg-elevated)",
        border: `2px solid ${edge(props.tone)}`,
        display: "flex",
        "flex-direction": "column",
        gap: "10px",
      }}
    >
      <div style={{ display: "flex", "align-items": "center", gap: "10px" }}>
        <AccentBar tone={props.tone} height="28px" />
        <h3
          style={{
            "font-family": FONT_DISPLAY,
            "font-size": "13px",
            "font-weight": "600",
            "letter-spacing": "0.02em",
            color: "var(--docs-text)",
          }}
        >
          {props.title}
        </h3>
      </div>
      <p
        style={{
          "font-family": FONT_BODY,
          "font-size": "12px",
          "line-height": "1.6",
          color: "var(--docs-text-secondary)",
        }}
      >
        {props.children}
      </p>
    </div>
  );
}

/** Sharp CTA — solid pink w/ glow (primary) or outlined blue (secondary). */
export function CtaButton(props: {
  href: string;
  external?: boolean;
  tone?: "primary" | "secondary";
  children: JSX.Element;
}) {
  const primary = () => (props.tone ?? "primary") === "primary";

  const base: JSX.CSSProperties = {
    display: "inline-flex",
    "align-items": "center",
    gap: "6px",
    padding: "11px 22px",
    "font-family": FONT_DISPLAY,
    "font-size": "13px",
    "font-weight": "600",
    "letter-spacing": "0.02em",
    "text-decoration": "none",
    "white-space": "nowrap",
    transition: "filter 0.2s ease, background 0.2s ease, box-shadow 0.2s ease",
    cursor: "pointer",
  };

  const style: JSX.CSSProperties = primary()
    ? {
        ...base,
        background: PINK,
        color: INK,
        border: `2px solid ${PINK}`,
        filter: `drop-shadow(0 0 9px ${PINK_GLOW})`,
      }
    : {
        ...base,
        background: "transparent",
        color: BLUE,
        border: `2px solid ${BLUE}`,
      };

  const onEnter = (e: MouseEvent & { currentTarget: HTMLElement }) => {
    if (primary()) e.currentTarget.style.filter = `drop-shadow(0 0 16px ${PINK_GLOW})`;
    else e.currentTarget.style.background = BLUE_TINT;
  };
  const onLeave = (e: MouseEvent & { currentTarget: HTMLElement }) => {
    if (primary()) e.currentTarget.style.filter = `drop-shadow(0 0 9px ${PINK_GLOW})`;
    else e.currentTarget.style.background = "transparent";
  };

  if (props.external) {
    return (
      <a
        href={props.href}
        target="_blank"
        rel="noopener noreferrer"
        style={style}
        onMouseEnter={onEnter}
        onMouseLeave={onLeave}
      >
        {props.children}
      </a>
    );
  }

  return (
    <Link to={props.href} style={style} onMouseEnter={onEnter} onMouseLeave={onLeave}>
      {props.children}
    </Link>
  );
}

/** 32px status-bar footer, matching the solid-spectrum site. */
export function SiteFooter() {
  return (
    <footer
      style={{
        "min-height": "32px",
        display: "flex",
        "flex-wrap": "wrap",
        "align-items": "center",
        "justify-content": "space-between",
        gap: "8px",
        padding: "0 24px",
        "border-top": `1px solid var(--docs-border)`,
        background: "var(--docs-bg-elevated)",
        "font-family": FONT_DISPLAY,
        "font-size": "11px",
      }}
    >
      <span style={{ "font-weight": "600", color: "var(--docs-text)", "letter-spacing": "0.02em" }}>
        Proyecto Viviana
      </span>
      <div style={{ display: "flex", gap: "16px", padding: "8px 0" }}>
        <Link to="/home" style={{ color: BLUE, "text-decoration": "none" }}>
          Home
        </Link>
        <Link to="/theme" style={{ color: PINK, "text-decoration": "none" }}>
          Theme
        </Link>
        <a
          href="https://www.npmjs.com/package/@proyecto-viviana/ui"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: BLUE, "text-decoration": "none" }}
        >
          npm
        </a>
      </div>
    </footer>
  );
}
