import { createFileRoute } from "@tanstack/solid-router";
import { DocPage } from "@/components/docs";

export const Route = createFileRoute("/solid-spectrum/docs/components/contextualhelp")({
  component: ContextualHelpPage,
});

function ContextualHelpPage() {
  return (
    <DocPage
      title="ContextualHelp"
      description="Contextual help surfaces lightweight explanatory content near the control it describes."
      importCode={`import { ContextualHelp } from '@proyecto-viviana/solid-spectrum';`}
    >
      <p class="text-sm text-bg-500" style={{ "max-width": "60ch" }}>
        ContextualHelp is part of the exported component set and now has a dedicated route in the
        docs application.
      </p>
    </DocPage>
  );
}
