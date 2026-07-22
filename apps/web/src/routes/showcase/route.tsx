/* /showcase layout route: loads the Geist trio + the Glasselated host layer,
   then wraps every panel route in the shell (scene, veil, portal host) and the
   sticky top bar. Panel content arrives through the Outlet. */
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
    links: [
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Geist+Pixel:ELSH@1..80&family=Geist:wght@400;500;600;700&family=Geist+Mono:wght@400;500;700;800&display=swap",
      },
      { rel: "stylesheet", href: glasselatedStyles },
    ],
  }),
  component: ShowcaseLayout,
});

function ShowcaseLayout() {
  return (
    <GlasselatedShell>
      <ShowcaseTopbar />
      <main class="gls-main">
        <Outlet />
      </main>
    </GlasselatedShell>
  );
}
