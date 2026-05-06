import { createFileRoute } from "@tanstack/solid-router";
import { DocPage } from "@/components/docs";

export const Route = createFileRoute("/solid-spectrum/docs/components/actiongroup")({
  component: ActionGroupPage,
});

function ActionGroupPage() {
  return (
    <DocPage
      title="ActionGroup"
      description="Action groups cluster related buttons and expose shared selection and styling patterns."
      importCode={`import { ActionGroup } from '@proyecto-viviana/solid-spectrum';`}
    >
      <p class="text-sm text-bg-500" style={{ "max-width": "60ch" }}>
        This page anchors the exported ActionGroup surface in the docs until the full interactive
        examples are added.
      </p>
    </DocPage>
  );
}
