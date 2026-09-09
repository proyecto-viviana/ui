/* /examples/profile — placeholder. The screen's composition lands in a later
   batch; this exists so the route, its head tags and its shell are real. */
import { createFileRoute } from "@tanstack/solid-router";
import { AppShell } from "@/components/examples/AppShell";
import { Placeholder } from "@/components/examples/Placeholder";
import { CMDS, CWDS } from "@/components/examples/data";
import { exampleSeo } from "@/components/examples/registry";

export const Route = createFileRoute("/examples/profile")({
  head: () => exampleSeo("profile"),
  component: ProfileScreen,
});

function ProfileScreen() {
  return (
    <AppShell cwd={CWDS["profile"]} cmd={CMDS["profile"]} active="profile" askFilled={true}>
      <div class="ex-screen">
        <Placeholder slug="profile" />
      </div>
    </AppShell>
  );
}
