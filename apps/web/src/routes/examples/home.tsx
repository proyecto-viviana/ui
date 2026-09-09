/* /examples/home — placeholder. The screen's composition lands in a later
   batch; this exists so the route, its head tags and its shell are real. */
import { createFileRoute } from "@tanstack/solid-router";
import { AppShell } from "@/components/examples/AppShell";
import { Placeholder } from "@/components/examples/Placeholder";
import { CMDS, CWDS } from "@/components/examples/data";
import { exampleSeo } from "@/components/examples/registry";

export const Route = createFileRoute("/examples/home")({
  head: () => exampleSeo("home"),
  component: HomeScreen,
});

function HomeScreen() {
  return (
    <AppShell cwd={CWDS["home"]} cmd={CMDS["home"]} active="home" askFilled={false}>
      <div class="ex-screen">
        <Placeholder slug="home" />
      </div>
    </AppShell>
  );
}
