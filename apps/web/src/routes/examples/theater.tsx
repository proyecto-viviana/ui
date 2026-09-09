/* /examples/theater — placeholder. The screen's composition lands in a later
   batch; this exists so the route, its head tags and its shell are real. */
import { createFileRoute } from "@tanstack/solid-router";
import { AppShell } from "@/components/examples/AppShell";
import { Placeholder } from "@/components/examples/Placeholder";
import { CMDS, CWDS } from "@/components/examples/data";
import { exampleSeo } from "@/components/examples/registry";

export const Route = createFileRoute("/examples/theater")({
  head: () => exampleSeo("theater"),
  component: TheaterScreen,
});

function TheaterScreen() {
  return (
    <AppShell cwd={CWDS["theater"]} cmd={CMDS["theater"]} active="lesson" askFilled={false}>
      <div class="ex-screen">
        <Placeholder slug="theater" />
      </div>
    </AppShell>
  );
}
