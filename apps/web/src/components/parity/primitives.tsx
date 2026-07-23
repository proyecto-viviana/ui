/* Glasselated primitives shared by the showcase (and, later, the real screens). */
import { type JSX } from "solid-js";
import { meshStrip } from "@/lib/glasselated";
import { useGlasselatedTheme } from "./glasselated-theme";

type MeshVariant = "ambient" | "signal";

/* A frosted panel/card carrying the woven hex-mesh background + the signature
   cursor scan-band and spreading border-ring (driven by the `.mesh-card` CSS +
   the island's mesh field). `amber` swaps the ring/weave to the signal channel. */
export function MeshCard(props: {
  readonly variant?: MeshVariant;
  readonly seed?: number;
  readonly surface?: "panel" | "card";
  readonly amber?: boolean;
  readonly appear?: boolean;
  readonly class?: string;
  /** Emits `data-panel` — the anchor the spec/mirror side-by-side diffs on. */
  readonly panelId?: string;
  readonly style?: JSX.CSSProperties;
  readonly children: JSX.Element;
}): JSX.Element {
  const { theme } = useGlasselatedTheme();
  const isCard = () => props.surface === "card";
  const mesh = () =>
    meshStrip({ dark: theme() === "dark", variant: props.variant ?? "ambient", seed: props.seed });
  return (
    <div
      class={`mesh-card${props.amber ? " mesh-amber" : ""}${props.class ? ` ${props.class}` : ""}`}
      data-appear={props.appear === false ? undefined : ""}
      data-panel={props.panelId}
      style={{
        "background-color": isCard() ? "var(--surface-card)" : "var(--surface-panel)",
        "background-image": mesh(),
        "backdrop-filter": isCard() ? "var(--blur-card)" : "var(--blur-panel)",
        "-webkit-backdrop-filter": isCard() ? "var(--blur-card)" : "var(--blur-panel)",
        border: "1px solid var(--border-subtle)",
        "border-radius": isCard() ? "12px" : "14px",
        "box-shadow": "var(--edge-glass-surface)",
        ...props.style,
      }}
    >
      {props.children}
    </div>
  );
}

/* Pixel-art icon: a monochrome SVG mask filled with `color` (currentColor default).
   Sources live in /public/glasselated/icons/{name}.svg. */
export function PixelIcon(props: {
  readonly name: string;
  readonly color?: string;
  readonly size?: number;
}): JSX.Element {
  const size = () => `${props.size ?? 17}px`;
  const url = () => `url('/glasselated/icons/${props.name}.svg')`;
  return (
    <span
      aria-hidden="true"
      style={{
        display: "inline-block",
        width: size(),
        height: size(),
        "background-color": props.color ?? "currentColor",
        "-webkit-mask-image": url(),
        "mask-image": url(),
        "-webkit-mask-size": "contain",
        "mask-size": "contain",
        "-webkit-mask-repeat": "no-repeat",
        "mask-repeat": "no-repeat",
        "-webkit-mask-position": "center",
        "mask-position": "center",
      }}
    />
  );
}

/* The 4px pixel scan-grid that overlays every terminal well. */
export function ScanOverlay(): JSX.Element {
  return (
    <div
      aria-hidden="true"
      style={{
        position: "absolute",
        inset: 0,
        "pointer-events": "none",
        "background-image": "repeating-conic-gradient(var(--well-scan) 0% 25%, transparent 0% 50%)",
        "background-size": "4px 4px",
      }}
    />
  );
}
