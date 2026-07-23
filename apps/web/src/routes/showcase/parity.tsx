/* /showcase/parity — the side-by-side.
   Each register panel is shown twice in its own aligned row: the hand-built
   Glasselated SPEC on the left (../parity/spec-panels), and its twin built from
   real @proyecto-viviana/ui components on the right (../parity/mirror). Both
   sides render in the SAME <Panel>/<MeshCard> chrome, so any difference within a
   pair is attributable to the components inside it, not the container — which is
   the whole point: read down a row and ask "does pair N look the same?".

   Every pair server-renders. Panels 04 (Tab with badge/icon children) and 08
   (ListView items + render-function) used to be deferred past hydration behind a
   ClientOnly, because a collection SSR defect in the library rendered them empty
   on the server; that was fixed (render-effect item registration + a non-frozen
   collection accessor — see packages/viviana-ui/test/Collections.{ssr,hydrate}.test),
   so both twins now paint on first byte alongside the rest. */
import { createFileRoute } from "@tanstack/solid-router";
import { For } from "solid-js";
import { SPEC_PANELS } from "@/components/parity/spec-panels";
import { MIRROR_PANELS } from "@/components/parity/mirror";

export const Route = createFileRoute("/showcase/parity")({
  component: ParityPanel,
});

/* Zip spec ⟷ mirror by register number. Both arrays are authored 01..09 in
   order, so index alignment is enough; keying on `num` keeps it honest. */
const PAIRS = SPEC_PANELS.map((s) => ({
  num: s.num,
  Spec: s.Spec,
  Mirror: MIRROR_PANELS.find((m) => m.num === s.num)?.Mirror,
}));

function ParityPanel() {
  return (
    <>
      <section class="gls-panel" aria-labelledby="parity-title">
        <div class="gls-panel-head">
          <span class="gls-panel-num">≡≡</span>
          <h1 class="gls-panel-title" id="parity-title">
            Parity
          </h1>
          <p class="gls-panel-blurb">
            The hand-built Glasselated spec beside its twin built from real
            @proyecto-viviana/ui components — one pair per row, so every divergence is the
            component's, not the container's.
          </p>
        </div>
        <div class="gls-parity-cols" aria-hidden="true">
          <span class="gls-parity-colhead">SPEC · hand-built</span>
          <span class="gls-parity-colhead">MIRROR · @proyecto-viviana/ui</span>
        </div>
      </section>

      <For each={PAIRS}>
        {(pair) => (
          <div class="gls-parity-cols" data-pair={pair.num}>
            <pair.Spec />
            {pair.Mirror ? <pair.Mirror /> : null}
          </div>
        )}
      </For>
    </>
  );
}
