/* /examples/settings — placeholder. The screen's composition lands in a later
   batch; this exists so the route, its head tags and its shell are real. */
import { createFileRoute } from "@tanstack/solid-router";
import { AppShell } from "@/components/examples/AppShell";
import { Placeholder } from "@/components/examples/Placeholder";
import { CMDS, CWDS } from "@/components/examples/data";
import { exampleSeo } from "@/components/examples/registry";

export const Route = createFileRoute("/examples/settings")({
  head: () => exampleSeo("settings"),
  component: SettingsScreen,
});

function SettingsScreen() {
  return (
    <AppShell cwd={CWDS["settings"]} cmd={CMDS["settings"]} active="" askFilled={false}>
      <div class="ex-screen">
        <Placeholder slug="settings" />
      </div>
    </AppShell>
  );
}
