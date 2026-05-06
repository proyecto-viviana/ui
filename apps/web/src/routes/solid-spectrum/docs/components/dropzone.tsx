import { createFileRoute } from "@tanstack/solid-router";
import { DocPage } from "@/components/docs";

export const Route = createFileRoute("/solid-spectrum/docs/components/dropzone")({
  component: DropZonePage,
});

function DropZonePage() {
  return (
    <DocPage
      title="DropZone"
      description="Drop zones provide a styled drag-and-drop target for file selection flows."
      importCode={`import { DropZone } from '@proyecto-viviana/solid-spectrum';`}
    >
      <p class="text-sm text-bg-500" style={{ "max-width": "60ch" }}>
        DropZone is exported and documented here so file-upload related primitives are discoverable
        from the docs.
      </p>
    </DocPage>
  );
}
