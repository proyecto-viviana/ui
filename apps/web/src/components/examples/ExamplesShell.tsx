/* The host layer for the /examples screens.
 *
 * Deliberately NOT `GlasselatedShell`: that shell hard-codes one scene
 * photograph and one veil for every route under it, which fights screens that
 * bring their own scene (profile's city, theater's full-bleed frame). This one
 * keeps only what every screen needs — the `data-glasselated` scope (so the
 * register's font bridge and mesh rules apply), the `data-examples` scope (so
 * `styles/examples.css` layout rules apply and nothing else on the site sees
 * them), the portal host, and the library `Provider` carrying locale and the
 * site-wide colour scheme.
 *
 * The backdrop is the library's `SceneBackdrop`, not a hand-rolled pair of
 * fixed divs: it owns the scene grade, the dithered veil and the pixel skyline,
 * which is paint and therefore the library's job.
 *
 * Note (verified against `packages/viviana-ui/src/index.ts`): the package does
 * NOT export a `createMeshField`. The primitive lives in `card/mesh-field.ts`
 * and each `Card` runs its own instance, so there is nothing for a shell to
 * call — the app-level helper in `@/lib/glasselated` drives `.mesh-card`
 * classes the examples are not allowed to author. */
import { type JSX } from "solid-js";
import { UNSAFE_PortalProvider } from "@proyecto-viviana/solidaria";
import { Provider, SceneBackdrop } from "@proyecto-viviana/ui";
import { useTheme } from "@/utils/theme";

export function ExamplesShell(props: { readonly children: JSX.Element }): JSX.Element {
  const { theme } = useTheme();
  let root: HTMLDivElement | undefined;

  const scene = (): string =>
    theme() === "dark" ? "/examples/bg-scene-night.png" : "/examples/bg-scene.png";

  return (
    <div ref={(el) => (root = el)} data-glasselated="" data-examples="" class="ex-root">
      <SceneBackdrop src={scene()} />
      {/* The content plane sits above the backdrop. Portal overlays (Menu,
          Popover, Tooltip) mount into this themed root rather than <body>, so
          they stay inside the `[data-glasselated]` scope; `root` is undefined
          until the ref binds, and null is the documented "portal to <body>"
          fallback. */}
      <div class="ex-plane">
        <UNSAFE_PortalProvider getContainer={() => root ?? null}>
          <Provider locale="en-US" colorScheme={theme()}>
            {props.children}
          </Provider>
        </UNSAFE_PortalProvider>
      </div>
    </div>
  );
}
