/* The Glasselated shell for the Viviana showcase: the scoped root element
   (`data-glasselated`), the fixed scene/veil backdrop, the cursor-tracked mesh
   field, and the portal host — no page chrome of its own. Ported from the
   frozen design repo's GlasselatedShell, re-keyed onto the site-wide
   `data-color-scheme` theme (via `useTheme`) instead of an island-local
   `data-theme`, and wrapping children in the library `Provider` so locale and
   color-scheme contexts reach every component. */
import { createEffect, createSignal, onMount, type Accessor, type JSX } from "solid-js";
import { UNSAFE_PortalProvider } from "@proyecto-viviana/solidaria";
import { Provider } from "@proyecto-viviana/ui";
import { createMeshField } from "@/lib/glasselated";
import { useTheme } from "@/utils/theme";

/* Module-level handle to the island root so chrome (theme wipe) can reach it
   without prop-drilling. One showcase shell per page. */
const [shellRoot, setShellRoot] = createSignal<HTMLDivElement | undefined>(undefined);
export const glasselatedRoot: Accessor<HTMLDivElement | undefined> = shellRoot;

export function GlasselatedShell(props: { readonly children: JSX.Element }): JSX.Element {
  const { theme } = useTheme();
  let root: HTMLDivElement | undefined;
  const align = createMeshField(() => root);

  onMount(() => setShellRoot(root));
  // Re-anchor the weave whenever the theme (hence each card's mesh image) changes.
  createEffect(() => {
    theme();
    requestAnimationFrame(align);
  });

  const dark = (): boolean => theme() === "dark";

  return (
    <div
      ref={(el) => (root = el)}
      data-glasselated=""
      style={{
        "min-height": "100vh",
        position: "relative",
        "font-family": "var(--font-ui)",
        color: "var(--text-primary)",
        "background-color": "var(--surface-app)",
      }}
    >
      {/* scene photograph — desaturated at night, full-colour by day */}
      <div
        aria-hidden="true"
        style={{
          position: "fixed",
          inset: 0,
          "background-image": `url('/glasselated/${dark() ? "bg-scene-night" : "bg-scene"}.png')`,
          "background-size": "cover",
          "background-position": "center",
          filter: dark() ? "saturate(0) brightness(0.62)" : "none",
          opacity: dark() ? 0.75 : 1,
          "pointer-events": "none",
        }}
      />
      {/* readability veil */}
      <div
        aria-hidden="true"
        style={{
          position: "fixed",
          inset: 0,
          background: dark()
            ? "linear-gradient(180deg, rgba(12,13,16,0.3), rgba(12,13,16,0.58))"
            : "linear-gradient(180deg, rgba(236,242,249,0.12), rgba(236,242,249,0.28))",
          "pointer-events": "none",
        }}
      />
      {/* The content plane sits above the fixed backdrop. Portal overlays
          (Menu/Popover/Tooltip) mount into the themed island root rather than
          <body>, so they stay inside the `[data-glasselated]` scope and keep
          the Geist font bridge. `root` is undefined until the ref binds;
          returning null before mount is the documented "portal to <body>"
          fallback. */}
      <div style={{ position: "relative" }}>
        <UNSAFE_PortalProvider getContainer={() => root ?? null}>
          <Provider locale="en-US" colorScheme={theme()}>
            {props.children}
          </Provider>
        </UNSAFE_PortalProvider>
      </div>
    </div>
  );
}
