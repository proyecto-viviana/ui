import { overlay, performStep, targets, type Step } from "../drivers/journeys-steps";
import type { Journey } from "../drivers/journeys";
import type { PanelContext, TargetResolver } from "../drivers/scenario";

/**
 * ComboBox D13 journeys from `playbook/journeys/combobox.md`.
 *
 * Inventory "default" is uncontrolled / selectedKey=none / itemsSource=defaultItems
 * / sentinels / eventLog. Certified D1–D12 defaults stay selectedKey=pro /
 * itemsSource=items and are not changed here.
 *
 * Tree vs inventory (named, not silently skipped):
 * - `itemsPreset=relabel` is not in `comboBoxItemsPresetOptions` (CB-FIL-05).
 * - `data-comparison-load-more-count` is not on either fixture (CB-NAV-10).
 * - driver `mouseDown`/`mouseUp` take coordinates, not a target (CB-OC-09).
 * - there is no `observe` step; inventory observe rows are `settle(0)`.
 * - ComboBox.Section is not wired until a sections journey needs it.
 */

export interface ComboBoxJourneyTargets {
  trigger: TargetResolver;
  input: TargetResolver;
}

const authoringControls: ReadonlyArray<readonly [string, unknown]> = [
  ["selectionSource", "defaultSelectedKey"],
  ["inputSource", "defaultInputValue"],
  ["selectedKey", "none"],
  ["inputValue", ""],
  ["itemsSource", "defaultItems"],
  ["itemsPreset", "three"],
  ["layout", "default"],
  ["sentinels", true],
  ["eventLog", true],
  ["menuTrigger", "input"],
  ["isReadOnly", false],
  ["isDisabled", false],
];

async function setControls(
  ctx: PanelContext,
  pairs: ReadonlyArray<readonly [string, unknown]>,
): Promise<void> {
  for (const [name, value] of pairs) {
    await performStep(ctx, {
      type: "control",
      name,
      value,
      label: `control ${name}`,
    });
  }
}

function authoringSetup(
  extra: ReadonlyArray<readonly [string, unknown]> = [],
): (ctx: PanelContext) => Promise<void> {
  return async (ctx) => {
    await setControls(ctx, [...authoringControls, ...extra]);
  };
}

export function comboBoxOpenCloseJourneys({ trigger, input }: ComboBoxJourneyTargets): Journey[] {
  const before = targets.before();
  const after = targets.after();

  const oc01: Journey = {
    id: "CB-OC-01",
    label: "click trigger, click option",
    setup: authoringSetup(),
    steps: [
      { type: "settle", ms: 0, label: "observe closed" },
      { type: "click", target: trigger, label: "click trigger", targetId: "trigger" },
      { type: "settle", ms: 300, label: "settle overlay" },
      {
        type: "click",
        target: overlay.option("Starter"),
        label: "click option Starter",
        targetId: "option:Starter",
      },
    ],
  };

  const oc02: Journey = {
    id: "CB-OC-02",
    label: "input click keeps open; trigger toggles",
    setup: authoringSetup(),
    steps: [
      { type: "click", target: trigger, label: "click trigger", targetId: "trigger" },
      { type: "click", target: input, label: "click input", targetId: "input" },
      { type: "click", target: trigger, label: "click trigger (close)", targetId: "trigger" },
      { type: "click", target: trigger, label: "click trigger (reopen)", targetId: "trigger" },
    ],
  };

  const oc03: Journey = {
    id: "CB-OC-03",
    label: "typing opens (menuTrigger=input) and filters",
    setup: authoringSetup(),
    steps: [
      { type: "focus", target: before, label: "focus before", targetId: "before" },
      { type: "press", key: "Tab", label: "Tab to input" },
      { type: "type", text: "S", label: "type S" },
      { type: "type", text: "x", label: "type x" },
      { type: "press", key: "Backspace", label: "Backspace" },
      { type: "press", key: "Escape", label: "Escape" },
    ],
  };

  const oc04: Journey = {
    id: "CB-OC-04",
    label: "menuTrigger=focus",
    setup: authoringSetup([["menuTrigger", "focus"]]),
    steps: [
      { type: "focus", target: before, label: "focus before", targetId: "before" },
      { type: "press", key: "Tab", label: "Tab opens" },
      { type: "press", key: "Tab", label: "Tab to after" },
      { type: "click", target: input, label: "click input", targetId: "input" },
      { type: "clickOutside", label: "click outside" },
    ],
  };

  const oc05: Journey = {
    id: "CB-OC-05",
    label: "menuTrigger=manual",
    setup: authoringSetup([["menuTrigger", "manual"]]),
    steps: [
      { type: "focus", target: before, label: "focus before", targetId: "before" },
      { type: "press", key: "Tab", label: "Tab stays closed" },
      { type: "type", text: "S", label: "type S stays closed" },
      { type: "press", key: "ArrowDown", label: "ArrowDown opens all" },
      { type: "press", key: "Escape", label: "Escape" },
      { type: "click", target: trigger, label: "click trigger", targetId: "trigger" },
    ],
  };

  const oc06: Journey = {
    id: "CB-OC-06",
    label: "isReadOnly",
    setup: authoringSetup([
      ["isReadOnly", true],
      ["selectedKey", "pro"],
      ["inputValue", "Pro"],
    ]),
    steps: [
      { type: "settle", ms: 0, label: "observe readonly" },
      { type: "click", target: trigger, label: "click trigger", targetId: "trigger" },
      { type: "click", target: input, label: "click input", targetId: "input" },
      { type: "type", text: "One", label: "type One" },
      { type: "press", key: "ArrowDown", label: "ArrowDown" },
      { type: "control", name: "menuTrigger", value: "focus", label: "control menuTrigger focus" },
      { type: "focus", target: after, label: "focus after", targetId: "after" },
      { type: "press", key: "Tab", label: "Tab out" },
      { type: "press", key: "Shift+Tab", label: "Tab back" },
    ],
  };

  const oc07: Journey = {
    id: "CB-OC-07",
    label: "isDisabled",
    setup: authoringSetup([["isDisabled", true]]),
    steps: [
      { type: "settle", ms: 0, label: "observe disabled" },
      { type: "click", target: trigger, label: "click trigger", targetId: "trigger" },
      { type: "click", target: input, label: "click input", targetId: "input" },
      { type: "type", text: "x", label: "type x" },
    ],
  };

  const oc08: Journey = {
    id: "CB-OC-08",
    label: "ArrowDown / ArrowUp / Alt+Arrow on the input",
    setup: authoringSetup(),
    steps: [
      { type: "focus", target: before, label: "focus before", targetId: "before" },
      { type: "press", key: "Tab", label: "Tab to input" },
      { type: "press", key: "ArrowDown", label: "ArrowDown opens first" },
      { type: "press", key: "Escape", label: "Escape" },
      { type: "press", key: "ArrowUp", label: "ArrowUp opens last" },
      { type: "press", key: "Escape", label: "Escape before Alt" },
      { type: "press", key: "Alt+ArrowDown", label: "Alt+ArrowDown" },
    ],
  };

  return [oc01, oc02, oc03, oc04, oc05, oc06, oc07, oc08];
}

export function comboBoxJourneyWaivers(): readonly {
  id: string;
  reason: string;
}[] {
  return [
    {
      id: "CB-OC-01",
      reason:
        "Solid event order on option commit differs: onInputChange before onOpenChange(false), extra onFocus. Log /tmp/grok-overlay-night/combobox-d13-oc-slice.log. Not registered; certified suite stays green.",
    },
    {
      id: "CB-OC-04",
      reason:
        "Solid onOpenChange(true, focus) precedes onFocus. React is onFocus then onOpenChange. Log /tmp/grok-overlay-night/combobox-oc-48.log.",
    },
    {
      id: "CB-OC-05",
      reason: "Solid Escape callback order adds onFocus/onFocusChange/onSelectionChange. Same log.",
    },
    {
      id: "CB-OC-06",
      reason:
        "Solid input data-readonly and trigger aria-disabled; React omits those on the input/button pair. Same log.",
    },
    {
      id: "CB-OC-07",
      reason:
        "Solid input aria-disabled and flatter field-group tree; React wraps a presentation group. Same log.",
    },
    {
      id: "CB-OC-08",
      reason: "Solid Escape callback order adds onInputChange/onFocus/onFocusChange. Same log.",
    },
    {
      id: "CB-OC-09",
      reason:
        "Inventory mouseDown(trigger)/touchDown(trigger) need a target-bearing mouse step. Driver mouseDown/mouseUp are coordinates only. #244 is owner-gated.",
    },
    {
      id: "CB-FIL-05",
      reason: "itemsPreset=relabel is not in comboBoxItemsPresetOptions.",
    },
    {
      id: "CB-NAV-10",
      reason: "Neither fixture exposes data-comparison-load-more-count.",
    },
  ];
}

export type { Step };
