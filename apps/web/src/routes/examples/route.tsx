/* /examples layout route: loads the Glasselated host layer and the layout-only
   examples stylesheet, then wraps every screen route in the shell (scene,
   portal host, Provider). Screen content arrives through the Outlet. */
import { createFileRoute, Outlet } from "@tanstack/solid-router";
import glasselatedStyles from "@/styles/glasselated.css?url";
import examplesStyles from "@/styles/examples.css?url";
import { ExamplesShell } from "@/components/examples/ExamplesShell";

export const Route = createFileRoute("/examples")({
  head: () => ({
    /* No meta here: each screen route sets its own from the registry
       (`exampleSeo`), and the gallery at /examples owns the overview. The
       Geist trio is loaded site-wide from the root route; this layer adds the
       Glasselated host styles and the examples layout on top. */
    links: [
      { rel: "stylesheet", href: glasselatedStyles },
      { rel: "stylesheet", href: examplesStyles },
    ],
  }),
  component: ExamplesLayout,
});

function ExamplesLayout() {
  return (
    <ExamplesShell>
      {/* The id is the shared Header's skip-link target, and the landmark the
          route sweep asserts on every page. */}
      <main id="main-content">
        <Outlet />
      </main>
    </ExamplesShell>
  );
}
