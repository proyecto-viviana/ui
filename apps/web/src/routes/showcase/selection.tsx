/* Panel — Selection. Checkbox/Radio/Switch families plus the register's own
   SelectBoxGroup, SegmentedControl, and TabSwitch. Composed from the shared
   Panel/Demo/Row chrome, following the buttons.tsx exemplar. */
import { createFileRoute } from "@tanstack/solid-router";
import { createSignal, For } from "solid-js";
import {
  Checkbox,
  CheckboxGroup,
  Radio,
  RadioGroup,
  SegmentedControl,
  SegmentedControlItem,
  SelectBox,
  SelectBoxGroup,
  Switch,
  TabSwitch,
} from "@proyecto-viviana/ui";
import { Demo, Panel, Row } from "@/components/showcase/chrome";
import { panelBySlug } from "@/components/showcase/registry";

export const Route = createFileRoute("/showcase/selection")({
  component: Page,
});

const SIZES = ["S", "M", "L", "XL"] as const;

const TAB_SWITCH_OPTIONS = [
  { label: "List", value: "list" },
  { label: "Grid", value: "grid" },
];

interface SelectBoxItem {
  id: string;
  label: string;
  description: string;
}

const SELECT_BOX_ITEMS: SelectBoxItem[] = [
  { id: "starter", label: "Starter", description: "For small teams" },
  { id: "pro", label: "Pro", description: "For growing teams" },
];

function Page() {
  const def = panelBySlug("selection")!;
  const [tabSwitchValue, setTabSwitchValue] = createSignal("list");

  return (
    <Panel def={def}>
      <Demo label="Checkbox · states">
        <Row>
          <Checkbox>Unselected</Checkbox>
          <Checkbox defaultSelected>Selected</Checkbox>
          <Checkbox isIndeterminate>Indeterminate</Checkbox>
          <Checkbox isEmphasized defaultSelected>
            Emphasized
          </Checkbox>
          <Checkbox isDisabled>Disabled</Checkbox>
        </Row>
      </Demo>

      <Demo label="Checkbox · sizes">
        <Row>
          <For each={SIZES}>
            {(size) => (
              <Checkbox size={size} defaultSelected>
                {size}
              </Checkbox>
            )}
          </For>
        </Row>
      </Demo>

      <Demo label="CheckboxGroup">
        <CheckboxGroup label="Notifications" defaultValue={["email"]}>
          <Checkbox value="email">Email</Checkbox>
          <Checkbox value="sms">SMS</Checkbox>
          <Checkbox value="push">Push</Checkbox>
        </CheckboxGroup>
      </Demo>

      <Demo label="Radio · states">
        <RadioGroup label="Plan" defaultValue="pro" orientation="horizontal">
          <Radio value="free">Free</Radio>
          <Radio value="pro">Pro</Radio>
          <Radio value="team" isDisabled>
            Team
          </Radio>
        </RadioGroup>
      </Demo>

      <Demo label="RadioGroup · sizes">
        <Row>
          <For each={SIZES}>
            {(size) => (
              <RadioGroup label={size} size={size} defaultValue="a" orientation="horizontal">
                <Radio value="a">A</Radio>
                <Radio value="b">B</Radio>
              </RadioGroup>
            )}
          </For>
        </Row>
      </Demo>

      <Demo label="Switch — ToggleSwitch aliased as Switch">
        <Row>
          <Switch>Off</Switch>
          <Switch defaultSelected>On</Switch>
          <Switch isEmphasized defaultSelected>
            Emphasized
          </Switch>
          <Switch isDisabled>Disabled</Switch>
        </Row>
      </Demo>

      <Demo label="SegmentedControl">
        <SegmentedControl aria-label="View mode" defaultSelectedKey="list">
          <SegmentedControlItem id="list">List</SegmentedControlItem>
          <SegmentedControlItem id="grid">Grid</SegmentedControlItem>
          <SegmentedControlItem id="board">Board</SegmentedControlItem>
        </SegmentedControl>
      </Demo>

      <Demo label="SegmentedControl · justified">
        <SegmentedControl aria-label="Density" defaultSelectedKey="compact" isJustified>
          <SegmentedControlItem id="compact">Compact</SegmentedControlItem>
          <SegmentedControlItem id="spacious">Spacious</SegmentedControlItem>
        </SegmentedControl>
      </Demo>

      <Demo label="SelectBoxGroup · SelectBox">
        <SelectBoxGroup
          aria-label="Plans"
          items={SELECT_BOX_ITEMS}
          getKey={(item) => item.id}
          getTextValue={(item) => item.label}
          orientation="horizontal"
          defaultSelectedKeys={["starter"]}
        >
          {(item) => (
            <SelectBox id={item.id} textValue={item.label}>
              <span slot="label">{item.label}</span>
              <span slot="description">{item.description}</span>
            </SelectBox>
          )}
        </SelectBoxGroup>
      </Demo>

      <Demo label="TabSwitch — custom Viviana control, no S2 upstream, fully controlled">
        <span
          style={{
            font: "var(--type-terminal)",
            "font-family": "var(--font-mono)",
            color: "var(--text-secondary)",
          }}
        >
          {tabSwitchValue()}
        </span>
        <TabSwitch
          options={TAB_SWITCH_OPTIONS}
          value={tabSwitchValue()}
          onChange={setTabSwitchValue}
        />
      </Demo>
    </Panel>
  );
}
