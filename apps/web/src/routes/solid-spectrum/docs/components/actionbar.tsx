import { createFileRoute } from "@tanstack/solid-router";
import { DocPage } from "@/components/docs";

export const Route = createFileRoute("/solid-spectrum/docs/components/actionbar")({
  component: ActionBarPage,
});

function ActionBarPage() {
  return (
    <DocPage
      title="ActionBar"
      description="Action bars expose contextual actions for the current selection or page state."
      importCode={`import { ActionBar, ActionBarContainer } from '@proyecto-viviana/solid-spectrum';`}
    >
      <p class="text-sm text-bg-500" style={{ "max-width": "60ch" }}>
        ActionBar and ActionBarContainer are exported and available even though the deeper design
        examples are still being expanded.
      </p>
    </DocPage>
  );
}
