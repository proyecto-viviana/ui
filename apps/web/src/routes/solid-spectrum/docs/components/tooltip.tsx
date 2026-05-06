import { createFileRoute } from "@tanstack/solid-router";
import { DocPage } from "@/components/docs";

export const Route = createFileRoute("/solid-spectrum/docs/components/tooltip")({
  component: TooltipPage,
});

function TooltipPage() {
  return (
    <DocPage
      title="Tooltip"
      description="Tooltips provide short, contextual explanations for controls and content."
      importCode={`import { Tooltip, TooltipTrigger, SimpleTooltip } from '@proyecto-viviana/solid-spectrum';`}
    >
      <p class="text-sm text-bg-500" style={{ "max-width": "60ch" }}>
        This route documents the exported tooltip surface. Richer examples can be expanded alongside
        the overlay documentation set.
      </p>
    </DocPage>
  );
}
