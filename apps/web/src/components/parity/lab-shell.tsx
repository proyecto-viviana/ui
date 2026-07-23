/* Shared chrome for the Glasselated lab and its Viviana UI mirror.
   These helpers were local to TerminalGlassLab until the mirror panels needed them.
   They live here so the spec panel and its mirror render in the SAME container code:
   any visual difference between a pair is then attributable to the components inside,
   which is the entire point of the side-by-side. Do not fork these per side. */
import type { JSX } from "solid-js";
import { MeshCard, ScanOverlay } from "./primitives";

export const MONO = "var(--font-mono)";

/* Chip / role accents map onto the semantic status tokens (theme-resolved in CSS). */
export const CH = {
  cy: "var(--status-info)",
  am: "var(--status-signal)",
  vi: "var(--status-metric)",
  rd: "var(--status-fault)",
} as const;

/* ── shared style fragments ── */
export const eyebrow: JSX.CSSProperties = {
  "font-family": MONO,
  "font-size": "10px",
  "letter-spacing": "0.16em",
  color: "var(--text-tertiary)",
  "margin-bottom": "14px",
};
export const btnBase: JSX.CSSProperties = {
  "border-radius": "5px",
  padding: "7px 14px",
  cursor: "pointer",
  "box-shadow": "var(--edge-glass)",
};
export const badgeBase: JSX.CSSProperties = {
  "font-family": MONO,
  "font-size": "9.5px",
  "font-weight": 700,
  "letter-spacing": "0.12em",
  "border-radius": "5px",
  padding: "4px 9px",
};

export function Eyebrow(props: { readonly children: JSX.Element }): JSX.Element {
  return <div style={eyebrow}>{props.children}</div>;
}

/* The spec panel and its mirror carry the SAME leading number ("01 // BUTTONS" vs
   "01 // BUTTONS — VIVIANA UI"), so the id derives from the label and no call site
   has to repeat it. That id is what pairs a panel with its twin when the two routes
   are diffed. Unnumbered panels (e.g. the nested "Notifications" card) get none. */
function panelIdFrom(label: string): string | undefined {
  return /^(\d+)\s*\/\//.exec(label)?.[1];
}

export function Panel(props: {
  readonly label: string;
  readonly children: JSX.Element;
  readonly style?: JSX.CSSProperties;
}): JSX.Element {
  return (
    <MeshCard
      surface="panel"
      panelId={panelIdFrom(props.label)}
      style={{ padding: "20px 24px", ...props.style }}
    >
      <Eyebrow>{props.label}</Eyebrow>
      {props.children}
    </MeshCard>
  );
}

/* A matte terminal well (never glass): solid ink background + pixel scan-grid. */
export function Well(props: {
  readonly tutor?: boolean;
  readonly style?: JSX.CSSProperties;
  readonly children: JSX.Element;
}): JSX.Element {
  return (
    <div
      style={{
        position: "relative",
        overflow: "hidden",
        "background-color": props.tutor ? "var(--surface-well-tutor)" : "var(--surface-well)",
        border: "1px solid var(--well-border)",
        "border-radius": "10px",
        "font-family": MONO,
        ...props.style,
      }}
    >
      <ScanOverlay />
      <div style={{ position: "relative" }}>{props.children}</div>
    </div>
  );
}

export function Caret(props: { readonly color: string }): JSX.Element {
  return (
    <span class="glx-caret" style={{ "background-color": props.color, "margin-left": "5px" }} />
  );
}
