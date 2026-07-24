/* The site-wide fixed backdrop that gives the whole app its Glasselated
   atmosphere — the plane the frosted-glass chrome (`.pv-card`, `.pv-frame`,
   the glass Header, doc panels) blurs against.

   Two registers of the same idea, per the confirmed scope:
   - `calm`  — a QUIET, low-contrast static field for long reading (docs, theme,
     ecosystem). Just the register canvas, one soft accent bloom up top, and a
     barely-there pixel grid. Token-driven, so it flips with the scheme on its
     own — no JS.
   - `scene` — the full photographic scene + readability veil the /showcase shell
     wears, for the marketing heroes (landing, the solid-spectrum register
     landing). Needs the theme to pick the day/night plate.

   Rendered as the first child of a page root whose own `background` is
   `transparent`; it pins to the viewport at `z-index: -1` so content paints
   above it and the glass samples it. */
import { type JSX } from "solid-js";
import { useTheme } from "@/utils/theme";

export function SiteBackdrop(props: { variant?: "calm" | "scene" }): JSX.Element {
  const { isDark } = useTheme();
  const dark = () => isDark();

  if (props.variant === "scene") {
    return (
      <>
        {/* scene photograph — desaturated at night, full-colour by day */}
        <div
          aria-hidden="true"
          style={{
            position: "fixed",
            inset: "0",
            "z-index": "-1",
            "background-image": `url('/glasselated/${dark() ? "bg-scene-night" : "bg-scene"}.png')`,
            "background-size": "cover",
            "background-position": "center",
            filter: dark() ? "saturate(0) brightness(0.62)" : "none",
            opacity: dark() ? "0.75" : "1",
            "pointer-events": "none",
          }}
        />
        {/* readability veil */}
        <div
          aria-hidden="true"
          style={{
            position: "fixed",
            inset: "0",
            "z-index": "-1",
            background: dark()
              ? "linear-gradient(180deg, rgba(12,13,16,0.3), rgba(12,13,16,0.58))"
              : "linear-gradient(180deg, rgba(236,242,249,0.12), rgba(236,242,249,0.28))",
            "pointer-events": "none",
          }}
        />
      </>
    );
  }

  // calm — the reading atmosphere. Scheme-aware entirely through tokens.
  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: "0",
        "z-index": "-1",
        "pointer-events": "none",
        background:
          "radial-gradient(150% 100% at 50% -20%, color-mix(in srgb, var(--accent-primary) 8%, transparent), transparent 50%), var(--surface-app)",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: "0",
          "background-image":
            "linear-gradient(var(--border-subtle) 1px, transparent 1px), linear-gradient(90deg, var(--border-subtle) 1px, transparent 1px)",
          "background-size": "56px 56px",
          "mask-image": "radial-gradient(130% 90% at 50% 0%, #000 25%, transparent 78%)",
          "-webkit-mask-image": "radial-gradient(130% 90% at 50% 0%, #000 25%, transparent 78%)",
          opacity: "0.5",
        }}
      />
    </div>
  );
}
