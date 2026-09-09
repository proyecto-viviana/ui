/* /examples/landing — placeholder. The landing screen is the one example with
   no app chrome: no command bar, no icon rail, just the shell's scene. */
import { createFileRoute } from "@tanstack/solid-router";
import { Placeholder } from "@/components/examples/Placeholder";
import { exampleSeo } from "@/components/examples/registry";

export const Route = createFileRoute("/examples/landing")({
  head: () => exampleSeo("landing"),
  component: LandingScreen,
});

function LandingScreen() {
  return (
    <div class="ex-page">
      <Placeholder slug="landing" />
    </div>
  );
}
