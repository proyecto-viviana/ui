import { createFileRoute } from "@tanstack/solid-router";
import { DocPage } from "@/components/docs";

export const Route = createFileRoute("/solid-spectrum/docs/components/toolbar")({
  component: ToolbarPage,
});

function ToolbarPage() {
  return (
    <DocPage
      title="Toolbar"
      description="Toolbars group related actions into a compact horizontal command surface."
      importCode={`import { Toolbar } from '@proyecto-viviana/solid-spectrum';`}
    >
      <p class="text-sm text-bg-500" style={{ "max-width": "60ch" }}>
        Toolbar is part of the public styled surface and is now discoverable directly from the docs
        navigation.
      </p>
    </DocPage>
  );
}
