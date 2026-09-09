/* /examples/lesson — placeholder. The screen's composition lands in a later
   batch; this exists so the route, its head tags and its shell are real. */
import { createFileRoute } from "@tanstack/solid-router";
import { AppShell } from "@/components/examples/AppShell";
import { Placeholder } from "@/components/examples/Placeholder";
import { CMDS, CWDS } from "@/components/examples/data";
import { exampleSeo } from "@/components/examples/registry";

export const Route = createFileRoute("/examples/lesson")({
  head: () => exampleSeo("lesson"),
  component: LessonScreen,
});

function LessonScreen() {
  return (
    <AppShell cwd={CWDS["lesson"]} cmd={CMDS["lesson"]} active="lesson" askFilled={true}>
      <div class="ex-screen">
        <Placeholder slug="lesson" />
      </div>
    </AppShell>
  );
}
