/* Panel — Selection. Checkbox/Radio/Switch families plus the register's own
   SelectBoxGroup and SegmentedControl. Composed from the shared
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
} from "@proyecto-viviana/ui";
import { Demo, Panel, Row } from "@/components/showcase/chrome";
import { panelBySlug, panelSeo } from "@/components/showcase/registry";

export const Route = createFileRoute("/showcase/selection")({
  head: () => panelSeo("selection"),
  component: Page,
});

const SIZES = ["S", "M", "L", "XL"] as const;

interface SelectBoxItem {
  id: string;
  label: string;
  description: string;
}

const SELECT_BOX_ITEMS: SelectBoxItem[] = [
  { id: "starter", label: "Starter", description: "For small teams" },
  { id: "pro", label: "Pro", description: "For growing teams" },
];

/* The checkpoint quiz's answer rows. The register marks a WRONG answer on the row,
   not on the box: a red wash plus a red edge behind an otherwise ordinary checkbox
   ("Terminal Glass App.dc.html":520). That wash is composition, not component state —
   the Checkbox has no "this answer was wrong" prop and should not grow one — so it is
   built here out of the fault token via color-mix rather than as a raw rgba. */
const QUIZ_ANSWERS = [
  { id: "a", label: "It compiles the styles at build time", verdict: "right" },
  { id: "b", label: "It ships a runtime CSS-in-JS engine", verdict: "wrong" },
  { id: "c", label: "It reads tokens from the theme", verdict: "neutral" },
] as const;

/* A poll's tallies. The bar fills in six visible steps, never a glide
   (`motionTiming.pollBar` = 0.3s steps(6), style/motion.ts). */
const POLL_OPTIONS = [
  { id: "yes", label: "Ship it", share: 62 },
  { id: "no", label: "Hold", share: 23 },
  { id: "maybe", label: "Abstain", share: 15 },
] as const;

function Page() {
  const def = panelBySlug("selection")!;
  const [layout, setLayout] = createSignal("list");
  const [poll, setPoll] = createSignal("yes");

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

      <Demo label="Checkpoint quiz — the 14×14 pixel checkbox in its row">
        <div style={{ display: "grid", gap: "8px", width: "100%", "max-width": "440px" }}>
          <For each={QUIZ_ANSWERS}>
            {(answer) => (
              <div
                style={{
                  display: "flex",
                  "align-items": "center",
                  gap: "12px",
                  padding: "8px 12px",
                  "border-radius": "6px",
                  border: `1px solid ${
                    answer.verdict === "wrong" ? "var(--status-fault)" : "transparent"
                  }`,
                  background:
                    answer.verdict === "wrong"
                      ? "color-mix(in srgb, var(--status-fault) 12%, transparent)"
                      : "transparent",
                }}
              >
                <Checkbox
                  size="S"
                  defaultSelected={answer.verdict !== "neutral"}
                  aria-label={answer.label}
                />
                <span style={{ font: "var(--type-body)", color: "var(--text-primary)" }}>
                  {answer.label}
                </span>
              </div>
            )}
          </For>
        </div>
      </Demo>

      <Demo label="Poll — the 12×12 pixel radio, bar filling in steps(6)">
        <div style={{ display: "grid", gap: "10px", width: "100%", "max-width": "440px" }}>
          <RadioGroup size="S" aria-label="Ship the release?" value={poll()} onChange={setPoll}>
            <For each={POLL_OPTIONS}>
              {(option) => (
                <div style={{ display: "grid", gap: "4px" }}>
                  <Radio value={option.id}>{option.label}</Radio>
                  <div
                    style={{
                      height: "5px",
                      background: "var(--surface-well)",
                      border: "1px solid var(--well-border)",
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        width: poll() === option.id ? `${option.share}%` : "0%",
                        background: "var(--status-metric)",
                        transition: "width 0.3s steps(6)",
                      }}
                    />
                  </div>
                </div>
              )}
            </For>
          </RadioGroup>
        </div>
      </Demo>

      <Demo label="Switch · size S — the 34×18 pixel toggle, knob snapping in steps(3)">
        <Row>
          <Switch size="S">Telemetry</Switch>
          <Switch size="S" defaultSelected>
            Autosave
          </Switch>
          <Switch size="S" isDisabled>
            Locked
          </Switch>
        </Row>
      </Demo>

      <Demo label="SegmentedControl — the selected segment is bracketed">
        <SegmentedControl aria-label="Range" defaultSelectedKey="week">
          <SegmentedControlItem id="day">day</SegmentedControlItem>
          <SegmentedControlItem id="week">week</SegmentedControlItem>
          <SegmentedControlItem id="month">month</SegmentedControlItem>
        </SegmentedControl>
      </Demo>

      <Demo label="SegmentedControl — fully controlled">
        <span
          style={{
            font: "var(--type-terminal)",
            "font-family": "var(--font-mono)",
            color: "var(--text-secondary)",
          }}
        >
          {layout()}
        </span>
        <SegmentedControl
          aria-label="Layout"
          selectedKey={layout()}
          onSelectionChange={(id) => setLayout(String(id))}
        >
          <SegmentedControlItem id="list">List</SegmentedControlItem>
          <SegmentedControlItem id="grid">Grid</SegmentedControlItem>
        </SegmentedControl>
      </Demo>
    </Panel>
  );
}
