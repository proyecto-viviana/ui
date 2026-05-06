import { createFileRoute } from "@tanstack/solid-router";
import { DocPage } from "@/components/docs";

export const Route = createFileRoute("/solid-spectrum/docs/components/filetrigger")({
  component: FileTriggerPage,
});

function FileTriggerPage() {
  return (
    <DocPage
      title="FileTrigger"
      description="FileTrigger opens the native file picker and forwards selected files to application code."
      importCode={`import { FileTrigger } from '@proyecto-viviana/solid-spectrum';`}
    >
      <p class="text-sm text-bg-500" style={{ "max-width": "60ch" }}>
        FileTrigger is documented as part of the public upload surface even before the more detailed
        examples land.
      </p>
    </DocPage>
  );
}
