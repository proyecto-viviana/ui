/* /examples/explore — placeholder. The screen's composition lands in a later
   batch; this exists so the route, its head tags and its shell are real. */
import { createFileRoute } from "@tanstack/solid-router";
import { AppShell } from "@/components/examples/AppShell";
import { Placeholder } from "@/components/examples/Placeholder";
import { CMDS, CWDS } from "@/components/examples/data";
import { exampleSeo } from "@/components/examples/registry";

export const Route = createFileRoute("/examples/explore")({
  head: () => exampleSeo("explore"),
  component: ExploreScreen,
});

function ExploreScreen() {
  return (
    <AppShell cwd={CWDS["explore"]} cmd={CMDS["explore"]} active="explore" askFilled={true}>
      <div class="ex-screen">
        <Placeholder slug="explore" />
      </div>
    </AppShell>
  );
}
