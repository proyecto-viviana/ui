import { createFileRoute } from "@tanstack/solid-router";
import { DocPage } from "@/components/docs";

export const Route = createFileRoute("/solid-spectrum/docs/components/picker")({
  component: PickerPage,
});

function PickerPage() {
  return (
    <DocPage
      title="Picker"
      description="Pickers combine a trigger, selected value, and listbox into a styled single-selection control."
      importCode={`import { Picker, PickerTrigger, PickerValue, PickerListBox, PickerItem } from '@proyecto-viviana/solid-spectrum';`}
    >
      <p class="text-sm text-bg-500" style={{ "max-width": "60ch" }}>
        Picker builds on the collection stack and is now listed explicitly so the styled export
        surface matches the docs navigation.
      </p>
    </DocPage>
  );
}
