import { createFileRoute } from "@tanstack/solid-router";
import { DocPage } from "@/components/docs";

export const Route = createFileRoute("/solid-spectrum/docs/components/accordion")({
  component: AccordionPage,
});

function AccordionPage() {
  return (
    <DocPage
      title="Accordion"
      description="Accordions present related sections of collapsible content using grouped disclosure behavior."
      importCode={`import { Accordion } from '@proyecto-viviana/solid-spectrum';`}
    >
      <p class="text-sm text-bg-500" style={{ "max-width": "60ch" }}>
        Accordion is exported as a first-class styled component and now has a dedicated
        documentation route.
      </p>
    </DocPage>
  );
}
