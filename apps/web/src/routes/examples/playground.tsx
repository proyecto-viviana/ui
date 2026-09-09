/* /examples/playground — placeholder. The screen's composition lands in a later
   batch; this exists so the route, its head tags and its shell are real. */
import { createFileRoute } from "@tanstack/solid-router";
import { AppShell } from "@/components/examples/AppShell";
import { Placeholder } from "@/components/examples/Placeholder";
import { CMDS, CWDS } from "@/components/examples/data";
import { exampleSeo } from "@/components/examples/registry";

export const Route = createFileRoute("/examples/playground")({
  head: () => exampleSeo("playground"),
  component: PlaygroundScreen,
});

function PlaygroundScreen() {
  return (
    <AppShell
      cwd={CWDS["playground"]}
      cmd={CMDS["playground"]}
      active="playground"
      askFilled={true}
    >
      <div class="ex-screen">
        <Placeholder slug="playground" />
      </div>
    </AppShell>
  );
}
