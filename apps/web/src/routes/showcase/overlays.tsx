/* Panel — overlays. Scaffold: lists the components this panel owes until the
   real demos land. Replaced panel-by-panel as the showcase fills in. */
import { createFileRoute } from "@tanstack/solid-router";
import { For } from "solid-js";
import { Demo, Panel, Row } from "@/components/showcase/chrome";
import { panelBySlug } from "@/components/showcase/registry";

export const Route = createFileRoute("/showcase/overlays")({
  component: Page,
});

function Page() {
  const def = panelBySlug("overlays")!;
  return (
    <Panel def={def}>
      <Demo label="scaffold — demos land here next">
        <Row>
          <For each={def.components}>{(name) => <span class="gls-demo-label">{name}</span>}</For>
        </Row>
      </Demo>
    </Panel>
  );
}
