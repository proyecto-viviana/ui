import { createFileRoute } from "@tanstack/solid-router";
import { DocPage } from "@/components/docs";

export const Route = createFileRoute("/solid-spectrum/docs/components/popover")({
  component: PopoverPage,
});

function PopoverPage() {
  return (
    <DocPage
      title="Popover"
      description="Popovers display contextual content relative to a trigger without navigating away from the current view."
      importCode={`import { Popover, PopoverTrigger, PopoverHeader, PopoverFooter } from '@proyecto-viviana/solid-spectrum';`}
    >
      <p class="text-sm text-bg-500" style={{ "max-width": "60ch" }}>
        This route keeps the exported popover API visible in the docs while the richer overlay
        examples continue to evolve.
      </p>
    </DocPage>
  );
}
