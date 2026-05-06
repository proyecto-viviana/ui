import { createFileRoute } from "@tanstack/solid-router";
import { createSignal } from "solid-js";
import { ToggleSwitch } from "@proyecto-viviana/solid-spectrum";
import { DocPage, Example, PropsTable, AccessibilitySection } from "@/components/docs";

export const Route = createFileRoute("/solid-spectrum/docs/components/switch")({
  component: SwitchPage,
});

function SwitchPage() {
  const [isOn, setIsOn] = createSignal(false);
  const [notifications, setNotifications] = createSignal(true);

  return (
    <DocPage
      title="Switch"
      description="A toggle switch for binary on/off states. An alternative to checkboxes when the immediate effect of the change should be visually apparent."
      importCode={`import { ToggleSwitch } from '@proyecto-viviana/solid-spectrum';`}
    >
      <Example
        title="Basic Usage"
        description="A controlled toggle switch."
        code={`const [isOn, setIsOn] = createSignal(false);

<ToggleSwitch isSelected={isOn()} onChange={setIsOn} />
<span>{isOn() ? 'On' : 'Off'}</span>`}
      >
        <div class="flex items-center gap-3">
          <ToggleSwitch isSelected={isOn()} onChange={setIsOn} />
          <span class="text-sm text-primary-200">{isOn() ? "On" : "Off"}</span>
        </div>
      </Example>

      <Example
        title="With Label"
        description="Provide an accessible label for the switch."
        code={`<label class="flex items-center gap-3">
  <ToggleSwitch isSelected={notifications()} onChange={setNotifications} />
  <span>Enable notifications</span>
</label>`}
      >
        <label class="flex items-center gap-3 cursor-pointer">
          <ToggleSwitch isSelected={notifications()} onChange={setNotifications} />
          <span class="text-sm text-primary-200">Enable notifications</span>
        </label>
      </Example>

      <Example
        title="Default Selected"
        description="Uncontrolled switch with an initial value."
        code={`<ToggleSwitch defaultSelected />`}
      >
        <ToggleSwitch defaultSelected />
      </Example>

      <Example
        title="Disabled"
        description="Disabled switches cannot be toggled."
        code={`<ToggleSwitch isDisabled />
<ToggleSwitch isDisabled defaultSelected />`}
      >
        <div class="flex items-center gap-6">
          <div class="flex items-center gap-2">
            <ToggleSwitch isDisabled />
            <span class="text-sm text-primary-400">Disabled off</span>
          </div>
          <div class="flex items-center gap-2">
            <ToggleSwitch isDisabled defaultSelected />
            <span class="text-sm text-primary-400">Disabled on</span>
          </div>
        </div>
      </Example>

      <PropsTable
        props={[
          { name: "isSelected", type: "boolean", description: "Controlled on/off state" },
          { name: "defaultSelected", type: "boolean", description: "Uncontrolled initial state" },
          {
            name: "onChange",
            type: "(isSelected: boolean) => void",
            description: "Called when the switch is toggled",
          },
          {
            name: "isDisabled",
            type: "boolean",
            default: "false",
            description: "Prevents toggling",
          },
          {
            name: "aria-label",
            type: "string",
            description: "Accessible label (required if no visible label)",
          },
          {
            name: "children",
            type: "JSX.Element",
            description: "Optional label content rendered alongside the switch",
          },
        ]}
      />

      <AccessibilitySection>
        <ul class="list-disc pl-5 space-y-1 text-sm">
          <li>
            Uses <code>role="switch"</code> with <code>aria-checked</code>
          </li>
          <li>Space key toggles the switch when focused</li>
          <li>Communicates state to screen readers as "on" or "off"</li>
          <li>
            Always provide a visible or <code>aria-label</code> label
          </li>
        </ul>
      </AccessibilitySection>
    </DocPage>
  );
}
