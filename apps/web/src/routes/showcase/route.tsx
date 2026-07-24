/* /showcase layout route: loads the Glasselated host layer, then wraps every
   panel route in the shell (scene, veil, portal host) and the sticky top bar.
   Panel content arrives through the Outlet. */
import { createFileRoute, Outlet } from "@tanstack/solid-router";
import glasselatedStyles from "@/styles/glasselated.css?url";
import { GlasselatedShell } from "@/components/showcase/GlasselatedShell";
import { ShowcaseTopbar } from "@/components/showcase/chrome";

export const Route = createFileRoute("/showcase")({
  head: () => ({
    meta: [
      { title: "Viviana UI — Glasselated Showcase" },
      {
        name: "description",
        content:
          "Every Viviana UI component on the Glasselated register: glass surfaces, Geist Pixel display type, terminal mono controls.",
      },
    ],
    /* The Geist trio itself is loaded site-wide from the root route now; this
       layer only adds the Glasselated host styles on top. */
    links: [{ rel: "stylesheet", href: glasselatedStyles }],
  }),
  component: ShowcaseLayout,
});

function ShowcaseLayout() {
  return (
    <GlasselatedShell>
      <ShowcaseTopbar />
      {/* The id is the shared Header's skip-link target. Without it, "Skip to
          main content" did nothing on any of the seventeen showcase panels. */}
      <main id="main-content" class="gls-main">
        <Outlet />
      </main>
    </GlasselatedShell>
  );
}
