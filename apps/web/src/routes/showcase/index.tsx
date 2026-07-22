/* /showcase — the register overview: the nine type roles as living specimens,
   the accent discipline, and the directory of panels. This page is chrome +
   tokens only; the component demos live in the numbered panel routes. */
import { createFileRoute, Link } from "@tanstack/solid-router";
import { For } from "solid-js";
import { PANELS } from "@/components/showcase/registry";

export const Route = createFileRoute("/showcase/")({
  component: Overview,
});

const TYPE_ROLES = [
  { role: "display", face: "Geist Pixel", sample: "Glasselated" },
  { role: "title", face: "Geist Pixel", sample: "Terminal glass, pixel craft" },
  { role: "headline", face: "Geist Pixel", sample: "Panels are glass; wells are matte" },
  { role: "label", face: "Geist Pixel", sample: "Component identity" },
  { role: "body", face: "Geist", sample: "Body copy sits on the humanist face for long reading." },
  { role: "meta", face: "Geist", sample: "Secondary annotations and helper copy." },
  { role: "micro", face: "Geist Mono", sample: "EYEBROWS · COUNTERS · UNITS" },
  { role: "terminal", face: "Geist Mono", sample: "$ vp run showcase --register glasselated" },
  { role: "button", face: "Geist Mono", sample: "CONFIRM ACTION" },
] as const;

function Overview() {
  return (
    <>
      <section class="gls-panel" aria-labelledby="overview-title">
        <div class="gls-panel-head">
          <span class="gls-panel-num">00</span>
          <h1 class="gls-panel-title" id="overview-title">
            The Glasselated register
          </h1>
          <p class="gls-panel-blurb">
            Real @proyecto-viviana/ui components over a photographed scene: frosted glass
            surfaces, matte terminal wells, and a strict three-face type system.
          </p>
        </div>
        <div>
          <For each={TYPE_ROLES}>
            {(spec) => (
              <div class="gls-typerole">
                <span class="gls-demo-label">
                  {spec.role} · {spec.face}
                </span>
                <span
                  style={{
                    font: `var(--type-${spec.role})`,
                    "letter-spacing": `var(--type-${spec.role}-track, normal)`,
                    "font-family":
                      spec.face === "Geist Pixel"
                        ? "var(--font-display)"
                        : spec.face === "Geist Mono"
                          ? "var(--font-mono)"
                          : "var(--font-ui)",
                  }}
                >
                  {spec.sample}
                </span>
              </div>
            )}
          </For>
        </div>
      </section>

      <section class="gls-panel" aria-labelledby="panel-directory">
        <div class="gls-panel-head">
          <span class="gls-panel-num">##</span>
          <h2 class="gls-panel-title" id="panel-directory">
            Panels
          </h2>
          <p class="gls-panel-blurb">
            Every public component has a home in one of the {PANELS.length} panels.
          </p>
        </div>
        <div class="gls-grid">
          <For each={PANELS}>
            {(panel) => (
              <Link to={`/showcase/${panel.slug}` as "/showcase"} class="gls-navcard">
                <span class="gls-navcard-meta">
                  {panel.num} · {panel.components.length} components
                </span>
                <span class="gls-navcard-title">{panel.title}</span>
                <span style={{ font: "var(--type-meta)", color: "var(--text-secondary)" }}>
                  {panel.blurb}
                </span>
              </Link>
            )}
          </For>
        </div>
      </section>
    </>
  );
}
