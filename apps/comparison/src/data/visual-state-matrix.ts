import {
  comparisonEntries,
  officialComparisonEntries,
  type CatalogueSource,
  type ComparisonEntry,
  type ComparisonSlug,
} from "./comparison-manifest";

export type VisualStateKind = "static" | "overlay" | "interaction" | "keyboard";
export type VisualStateSideStatus = "snapshotted" | "asserted" | "planned" | "missing" | "na";
export type PairDiffStatus = "strict" | "asserted" | "planned" | "blocked" | "na";

export interface VisualStateTarget {
  id: string;
  label: string;
  kind: VisualStateKind;
  react: VisualStateSideStatus;
  solid: VisualStateSideStatus;
  pairDiff: PairDiffStatus;
  spec?: string;
  snapshots?: readonly string[];
  note: string;
}

export interface VisualStateCoverage {
  slug: ComparisonSlug;
  title: string;
  source: CatalogueSource;
  states: readonly VisualStateTarget[];
}

function plannedState(entry: ComparisonEntry): VisualStateTarget {
  const reactLive = entry.layers.styled.react === "live";
  const solidLive = entry.layers.styled.solid === "live";

  return {
    id: "styled.default",
    label: "Styled default",
    kind: "static",
    react: reactLive ? "planned" : "missing",
    solid: solidLive ? "planned" : "missing",
    pairDiff: reactLive && solidLive ? "planned" : "blocked",
    note:
      reactLive && solidLive
        ? "Route is live, but committed screenshots and strict pair diff are still missing."
        : "Blocked until both the exact React Spectrum reference and Solid styled implementation are live.",
  };
}

function snapshottedDefaultState(input: {
  slug: string;
  label?: string;
  note?: string;
}): VisualStateTarget {
  const label = input.label ?? "Styled default";

  return {
    id: "styled.default",
    label,
    kind: "static",
    react: "snapshotted",
    solid: "snapshotted",
    pairDiff: "asserted",
    spec: "e2e/default-state-visual.spec.ts + e2e/default-state-pair-diff.spec.ts",
    snapshots: [
      `e2e/default-state-visual.spec.ts-snapshots/${input.slug}-default-react-chromium-linux.png`,
      `e2e/default-state-visual.spec.ts-snapshots/${input.slug}-default-solid-chromium-linux.png`,
    ],
    note:
      input.note ??
      "Committed default-state screenshots exist for both sides, and React-vs-Solid pair diff is guarded by an explicit asserted threshold.",
  };
}

function assertedDefaultState(input: {
  slug: string;
  label?: string;
  note: string;
}): VisualStateTarget {
  const label = input.label ?? "Styled default";

  return {
    id: "styled.default",
    label,
    kind: "static",
    react: "snapshotted",
    solid: "snapshotted",
    pairDiff: "asserted",
    spec: "e2e/live-styled-visual.spec.ts",
    snapshots: [
      `e2e/live-styled-visual.spec.ts-snapshots/${input.slug}-default-react-chromium-linux.png`,
      `e2e/live-styled-visual.spec.ts-snapshots/${input.slug}-default-solid-chromium-linux.png`,
    ],
    note: input.note,
  };
}

const officialStateOverrides: Record<string, readonly VisualStateTarget[]> = {
  provider: [
    snapshottedDefaultState({
      slug: "provider",
      note: "Provider nesting screenshots are committed for both sides, and React-vs-Solid pair diff is guarded by an explicit asserted threshold.",
    }),
  ],
  button: [
    snapshottedDefaultState({
      slug: "button",
      note: "Button row screenshots are committed for both sides; default React-vs-Solid pair diff is guarded by an explicit asserted threshold while component-specific Button states remain strict.",
    }),
    {
      id: "styled.default.control",
      label: "Styled default control",
      kind: "static",
      react: "snapshotted",
      solid: "snapshotted",
      pairDiff: "strict",
      spec: "e2e/button-visual.spec.ts",
      snapshots: [
        "e2e/button-visual.spec.ts-snapshots/button-default-control-react-chromium-linux.png",
        "e2e/button-visual.spec.ts-snapshots/button-default-control-solid-chromium-linux.png",
      ],
      note: "Button-specific screenshots compare the controlled React Spectrum S2 fixture against the Solid S2 skin.",
    },
    {
      id: "styled.hover",
      label: "Hover",
      kind: "interaction",
      react: "snapshotted",
      solid: "snapshotted",
      pairDiff: "strict",
      spec: "e2e/button-visual.spec.ts",
      snapshots: [
        "e2e/button-visual.spec.ts-snapshots/button-hover-react-chromium-linux.png",
        "e2e/button-visual.spec.ts-snapshots/button-hover-solid-chromium-linux.png",
      ],
      note: "Hover is snapshotted on both implementations and compared with zero pixel tolerance.",
    },
    {
      id: "styled.focus-visible",
      label: "Focus-visible",
      kind: "keyboard",
      react: "snapshotted",
      solid: "snapshotted",
      pairDiff: "strict",
      spec: "e2e/button-visual.spec.ts",
      snapshots: [
        "e2e/button-visual.spec.ts-snapshots/button-focus-visible-react-chromium-linux.png",
        "e2e/button-visual.spec.ts-snapshots/button-focus-visible-solid-chromium-linux.png",
      ],
      note: "Keyboard focus ring is snapshotted on the full canvas so the outside outline is not clipped.",
    },
    {
      id: "styled.pressed",
      label: "Pressed",
      kind: "interaction",
      react: "snapshotted",
      solid: "snapshotted",
      pairDiff: "strict",
      spec: "e2e/button-visual.spec.ts",
      snapshots: [
        "e2e/button-visual.spec.ts-snapshots/button-pressed-react-chromium-linux.png",
        "e2e/button-visual.spec.ts-snapshots/button-pressed-solid-chromium-linux.png",
      ],
      note: "Pressed state includes the S2 press-scale transform and is compared with zero pixel tolerance.",
    },
    {
      id: "styled.press-action",
      label: "Press action",
      kind: "interaction",
      react: "asserted",
      solid: "asserted",
      pairDiff: "na",
      spec: "e2e/button-family-contract.spec.ts",
      note: "Pressing the controlled Button increments the same comparison action counter on both stacks.",
    },
    {
      id: "styled.props.controls",
      label: "Interactive prop controls",
      kind: "interaction",
      react: "asserted",
      solid: "asserted",
      pairDiff: "na",
      spec: "e2e/button-visual.spec.ts",
      note: "The docs-style prop controls drive the same children, variant, fillStyle, size, staticColor, disabled, and pending props into both stacks.",
    },
    {
      id: "styled.props.visual-matrix",
      label: "Documented visual prop matrix",
      kind: "static",
      react: "snapshotted",
      solid: "snapshotted",
      pairDiff: "strict",
      spec: "e2e/button-visual.spec.ts",
      note: "Strict screenshots cover all documented Button variants in fill and outline, all sizes, staticColor white/black/auto in fill and outline, disabled, and the immediate pending state.",
    },
    {
      id: "styled.pending.spinner",
      label: "Delayed pending spinner",
      kind: "interaction",
      react: "snapshotted",
      solid: "snapshotted",
      pairDiff: "strict",
      spec: "e2e/button-visual.spec.ts",
      snapshots: [
        "e2e/button-visual.spec.ts-snapshots/button-pending-spinner-react-chromium-linux.png",
        "e2e/button-visual.spec.ts-snapshots/button-pending-spinner-solid-chromium-linux.png",
      ],
      note: "The delayed S2 pending spinner is waited for, snapshotted on both sides, and compared with zero pixel tolerance.",
    },
    {
      id: "styled.pending.behavior",
      label: "Pending focus and press suppression",
      kind: "interaction",
      react: "asserted",
      solid: "asserted",
      pairDiff: "na",
      spec: "e2e/button-family-contract.spec.ts",
      note: "Pending buttons remain focusable and suppress press actions on both React Spectrum and Solid.",
    },
  ],
  actionbutton: [
    snapshottedDefaultState({
      slug: "actionbutton",
      note: "ActionButton default screenshots are committed for both sides; the broad default pair diff is asserted while exact computed S2 parity covers light/dark default, size, quiet, static-color, disabled, and pending states.",
    }),
    {
      id: "styled.props.screenshot-matrix",
      label: "Committed screenshot prop matrix",
      kind: "static",
      react: "snapshotted",
      solid: "snapshotted",
      pairDiff: "asserted",
      spec: "e2e/actionbutton-visual.spec.ts",
      note: "Committed React/Solid screenshots cover default, XS/S/M/L/XL sizes, quiet, staticColor black/white/auto, disabled, pending, icon-leading, icon-only, hover, focus-visible, and pressed states. The dedicated threshold remains until staticColor, pressed, and residual text/background raster differences become strict.",
    },
    {
      id: "styled.icon.geometry",
      label: "Icon geometry",
      kind: "static",
      react: "asserted",
      solid: "asserted",
      pairDiff: "na",
      spec: "e2e/actionbutton-visual.spec.ts",
      note: "Icon-leading and icon-only ActionButton states compare root, icon, text, gap, and centerline geometry across XS/M/XL sizes, plus the delayed pending spinner with icon content.",
    },
    {
      id: "styled.props.computed-matrix",
      label: "Computed visual prop matrix",
      kind: "static",
      react: "asserted",
      solid: "asserted",
      pairDiff: "na",
      spec: "e2e/actionbutton-visual.spec.ts",
      note: "React Spectrum and Solid Spectrum computed styles and rendered geometry are matched across light/dark themes, XS/S/M/L/XL sizes, quiet, staticColor black/white/auto, disabled, and pending states.",
    },
    {
      id: "styled.action.press",
      label: "Press action",
      kind: "interaction",
      react: "asserted",
      solid: "asserted",
      pairDiff: "na",
      spec: "e2e/button-family-contract.spec.ts",
      note: "Press behavior updates the comparison action counter on both React Spectrum and Solid.",
    },
    {
      id: "styled.props.controls",
      label: "Interactive prop controls",
      kind: "interaction",
      react: "asserted",
      solid: "asserted",
      pairDiff: "na",
      spec: "e2e/actionbutton-visual.spec.ts",
      note: "The docs-style prop controls drive the same children, size, staticColor, icon placement, quiet, disabled, and pending props into both stacks.",
    },
    {
      id: "styled.pending.behavior",
      label: "Pending focus and press suppression",
      kind: "interaction",
      react: "asserted",
      solid: "asserted",
      pairDiff: "na",
      spec: "e2e/button-family-contract.spec.ts",
      note: "Pending ActionButtons remain focusable and suppress press actions on both React Spectrum and Solid.",
    },
    {
      id: "styled.test-plan",
      label: "Component-specific test plan",
      kind: "static",
      react: "planned",
      solid: "planned",
      pairDiff: "planned",
      note: "Remaining ActionButton plan covers icon/avatar/badge content, light-theme screenshot baselines, and strict pair-diff work for staticColor, pressed, and residual raster differences.",
    },
  ],
  actionbuttongroup: [
    snapshottedDefaultState({
      slug: "actionbuttongroup",
      note: "ActionButtonGroup default screenshots are committed for both sides and guarded by an asserted threshold; keyboard and stricter visual parity remain planned.",
    }),
    {
      id: "styled.selection.single-action",
      label: "Single action selection",
      kind: "interaction",
      react: "asserted",
      solid: "asserted",
      pairDiff: "na",
      spec: "e2e/button-family-contract.spec.ts",
      note: "Pressing an action updates both the selected key and action callback data on both stacks.",
    },
    {
      id: "styled.group.props-icon",
      label: "Group props and icon geometry",
      kind: "static",
      react: "snapshotted",
      solid: "snapshotted",
      pairDiff: "asserted",
      spec: "e2e/grouped-button-controls-visual.spec.ts",
      snapshots: [
        "e2e/grouped-button-controls-visual.spec.ts-snapshots/actionbuttongroup-compact-vertical-icon-start-react-chromium-linux.png",
        "e2e/grouped-button-controls-visual.spec.ts-snapshots/actionbuttongroup-compact-vertical-icon-start-solid-chromium-linux.png",
      ],
      note: "Compact vertical XL icon-leading ActionButtonGroup state is snapshotted, compares toolbar orientation and planned group props, and asserts child icon/text centerline geometry against React Spectrum.",
    },
    {
      id: "styled.props.controls",
      label: "Interactive prop controls",
      kind: "interaction",
      react: "asserted",
      solid: "asserted",
      pairDiff: "na",
      spec: "e2e/grouped-button-controls-visual.spec.ts",
      note: "The docs-style prop controls drive size, density, orientation, staticColor, icon placement, quiet, justified, and disabled props into both stacks.",
    },
  ],
  buttongroup: [
    snapshottedDefaultState({
      slug: "buttongroup",
      note: "ButtonGroup default screenshots are committed for both sides and guarded by an asserted threshold; disabled state, stricter visual parity, and grouped interaction states remain planned.",
    }),
    {
      id: "styled.grouped-actions.press",
      label: "Grouped button actions",
      kind: "interaction",
      react: "asserted",
      solid: "asserted",
      pairDiff: "na",
      spec: "e2e/button-family-contract.spec.ts",
      note: "Grouped Save and Cancel actions update state on both stacks.",
    },
    {
      id: "styled.overflow.icon",
      label: "Overflow layout and icon geometry",
      kind: "static",
      react: "snapshotted",
      solid: "snapshotted",
      pairDiff: "asserted",
      spec: "e2e/grouped-button-controls-visual.spec.ts",
      snapshots: [
        "e2e/grouped-button-controls-visual.spec.ts-snapshots/buttongroup-overflow-icon-start-react-chromium-linux.png",
        "e2e/grouped-button-controls-visual.spec.ts-snapshots/buttongroup-overflow-icon-start-solid-chromium-linux.png",
      ],
      note: "Constrained XL ButtonGroup state is snapshotted and asserts S2 overflow switching from horizontal to vertical, propagated size, wrapped width, and child icon/text centerline geometry.",
    },
    {
      id: "styled.props.controls",
      label: "Interactive prop controls",
      kind: "interaction",
      react: "asserted",
      solid: "asserted",
      pairDiff: "na",
      spec: "e2e/grouped-button-controls-visual.spec.ts",
      note: "The docs-style prop controls drive orientation, alignment, size, icon placement, disabled state, and the comparison overflow width into both stacks.",
    },
  ],
  togglebutton: [
    snapshottedDefaultState({
      slug: "togglebutton",
      note: "ToggleButton default unselected screenshots are committed for both sides and guarded by an asserted threshold; selected, hover, pressed, focus-visible, emphasized, disabled, keyboard, and stricter visual states remain planned.",
    }),
    {
      id: "styled.icon.matrix",
      label: "Icon content",
      kind: "static",
      react: "snapshotted",
      solid: "snapshotted",
      pairDiff: "asserted",
      spec: "e2e/single-button-controls-visual.spec.ts",
      snapshots: [
        "e2e/single-button-controls-visual.spec.ts-snapshots/togglebutton-icon-start-react-chromium-linux.png",
        "e2e/single-button-controls-visual.spec.ts-snapshots/togglebutton-icon-start-solid-chromium-linux.png",
        "e2e/single-button-controls-visual.spec.ts-snapshots/togglebutton-icon-start-selected-react-chromium-linux.png",
        "e2e/single-button-controls-visual.spec.ts-snapshots/togglebutton-icon-start-selected-solid-chromium-linux.png",
        "e2e/single-button-controls-visual.spec.ts-snapshots/togglebutton-icon-only-react-chromium-linux.png",
        "e2e/single-button-controls-visual.spec.ts-snapshots/togglebutton-icon-only-solid-chromium-linux.png",
      ],
      note: "Icon-leading, selected icon-leading, and icon-only ToggleButton states are snapshotted and guarded by root/icon/text centerline geometry.",
    },
    {
      id: "styled.toggle.selected",
      label: "Toggle selected state",
      kind: "interaction",
      react: "asserted",
      solid: "asserted",
      pairDiff: "na",
      spec: "e2e/button-family-contract.spec.ts",
      note: "Clicking the ToggleButton toggles selected-state data on both stacks.",
    },
    {
      id: "styled.props.controls",
      label: "Interactive prop controls",
      kind: "interaction",
      react: "asserted",
      solid: "asserted",
      pairDiff: "na",
      spec: "e2e/single-button-controls-visual.spec.ts",
      note: "The docs-style prop controls drive children, size, staticColor, icon placement, quiet, emphasized, selected, and disabled props into both stacks.",
    },
  ],
  linkbutton: [
    assertedDefaultState({
      slug: "linkbutton",
      note: "LinkButton default screenshots are committed for both sides and compared with an asserted threshold while strict styling parity remains open.",
    }),
    {
      id: "styled.icon.matrix",
      label: "Icon content and link semantics",
      kind: "static",
      react: "snapshotted",
      solid: "snapshotted",
      pairDiff: "asserted",
      spec: "e2e/single-button-controls-visual.spec.ts",
      snapshots: [
        "e2e/single-button-controls-visual.spec.ts-snapshots/linkbutton-icon-start-react-chromium-linux.png",
        "e2e/single-button-controls-visual.spec.ts-snapshots/linkbutton-icon-start-solid-chromium-linux.png",
        "e2e/single-button-controls-visual.spec.ts-snapshots/linkbutton-icon-only-react-chromium-linux.png",
        "e2e/single-button-controls-visual.spec.ts-snapshots/linkbutton-icon-only-solid-chromium-linux.png",
      ],
      note: "Icon-leading and icon-only LinkButton states are snapshotted, root/icon/text geometry is compared, and both stacks assert the same href link semantics.",
    },
    {
      id: "styled.props.controls",
      label: "Interactive prop controls",
      kind: "interaction",
      react: "asserted",
      solid: "asserted",
      pairDiff: "na",
      spec: "e2e/single-button-controls-visual.spec.ts",
      note: "The docs-style prop controls drive children, href, variant, fillStyle, size, staticColor, icon placement, and disabled props into both stacks.",
    },
    {
      id: "styled.primary-fill-colors",
      label: "Primary fill colors",
      kind: "static",
      react: "asserted",
      solid: "asserted",
      pairDiff: "na",
      spec: "e2e/single-button-controls-visual.spec.ts",
      note: "Primary filled LinkButton computed background, border, root text, and label text colors are asserted against React Spectrum in light and dark themes, and are guarded against comparison-page anchor resets.",
    },
  ],
  togglebuttongroup: [
    assertedDefaultState({
      slug: "togglebuttongroup",
      note: "ToggleButtonGroup default screenshots are committed for both sides and compared with an asserted threshold; keyboard, disabled, and strict pair-diff coverage remain open.",
    }),
    {
      id: "styled.selection.single",
      label: "Single selection",
      kind: "interaction",
      react: "asserted",
      solid: "asserted",
      pairDiff: "na",
      spec: "e2e/button-family-contract.spec.ts",
      note: "Clicking Center moves the controlled selected key from left to center on both stacks.",
    },
    {
      id: "styled.group.props-icon",
      label: "Group props, selection, and icon geometry",
      kind: "static",
      react: "snapshotted",
      solid: "snapshotted",
      pairDiff: "asserted",
      spec: "e2e/grouped-button-controls-visual.spec.ts",
      snapshots: [
        "e2e/grouped-button-controls-visual.spec.ts-snapshots/togglebuttongroup-compact-vertical-selected-icon-start-react-chromium-linux.png",
        "e2e/grouped-button-controls-visual.spec.ts-snapshots/togglebuttongroup-compact-vertical-selected-icon-start-solid-chromium-linux.png",
      ],
      note: "Compact vertical XL emphasized icon-leading ToggleButtonGroup state is snapshotted, compares radiogroup orientation and planned group props, asserts selected key, and checks selected child icon/text centerline geometry.",
    },
    {
      id: "styled.props.controls",
      label: "Interactive prop controls",
      kind: "interaction",
      react: "asserted",
      solid: "asserted",
      pairDiff: "na",
      spec: "e2e/grouped-button-controls-visual.spec.ts",
      note: "The docs-style prop controls drive selectionMode, selectedKeys, size, density, orientation, staticColor, icon placement, quiet, emphasized, justified, and disabled props into both stacks.",
    },
  ],
  segmentedcontrol: [
    assertedDefaultState({
      slug: "segmentedcontrol",
      note: "SegmentedControl default screenshots are committed for both sides and compared with an asserted threshold; icon slots and strict pair-diff coverage remain open.",
    }),
    {
      id: "styled.selection.single",
      label: "Single selection",
      kind: "interaction",
      react: "asserted",
      solid: "asserted",
      pairDiff: "na",
      spec: "e2e/button-family-contract.spec.ts",
      note: "Clicking Grid moves the controlled selected key from list to grid on both stacks.",
    },
    {
      id: "styled.selection-indicator.justified",
      label: "Justified selected indicator",
      kind: "static",
      react: "snapshotted",
      solid: "snapshotted",
      pairDiff: "asserted",
      spec: "e2e/collection-button-controls-visual.spec.ts",
      snapshots: [
        "e2e/collection-button-controls-visual.spec.ts-snapshots/segmentedcontrol-justified-selected-react-chromium-linux.png",
        "e2e/collection-button-controls-visual.spec.ts-snapshots/segmentedcontrol-justified-selected-solid-chromium-linux.png",
      ],
      note: "Justified Grid-selected SegmentedControl state is snapshotted and asserts radiogroup semantics, selected key, root background, equal item widths, and selection-indicator geometry against React Spectrum.",
    },
    {
      id: "styled.props.controls",
      label: "Interactive prop controls",
      kind: "interaction",
      react: "asserted",
      solid: "asserted",
      pairDiff: "na",
      spec: "e2e/collection-button-controls-visual.spec.ts",
      note: "The docs-style prop controls drive selectedKey, isJustified, and isDisabled into both stacks.",
    },
    {
      id: "styled.keyboard.selection",
      label: "Keyboard selection",
      kind: "interaction",
      react: "asserted",
      solid: "asserted",
      pairDiff: "na",
      spec: "e2e/collection-button-controls-visual.spec.ts",
      note: "Focusing the Grid radio and pressing Space selects it on both stacks and updates the controlled selected-key marker.",
    },
  ],
  selectboxgroup: [
    assertedDefaultState({
      slug: "selectboxgroup",
      note: "SelectBoxGroup default screenshots are committed for both sides and compared with an asserted threshold; strict pair-diff coverage remains open.",
    }),
    {
      id: "styled.selection.single",
      label: "Single selection",
      kind: "interaction",
      react: "asserted",
      solid: "asserted",
      pairDiff: "na",
      spec: "e2e/button-family-contract.spec.ts",
      note: "Clicking Pro moves the controlled selected key from starter to pro on both stacks.",
    },
    {
      id: "styled.selection.multiple-slots",
      label: "Multiple selection and text slots",
      kind: "static",
      react: "snapshotted",
      solid: "snapshotted",
      pairDiff: "asserted",
      spec: "e2e/collection-button-controls-visual.spec.ts",
      snapshots: [
        "e2e/collection-button-controls-visual.spec.ts-snapshots/selectboxgroup-horizontal-multiple-react-chromium-linux.png",
        "e2e/collection-button-controls-visual.spec.ts-snapshots/selectboxgroup-horizontal-multiple-solid-chromium-linux.png",
      ],
      note: "Horizontal multiple-selection SelectBoxGroup state is snapshotted and asserts listbox semantics, selected key set, checkbox indicator geometry, option dimensions, and label/description slot alignment.",
    },
    {
      id: "styled.hover.text-color",
      label: "Hover text color",
      kind: "interaction",
      react: "asserted",
      solid: "asserted",
      pairDiff: "na",
      spec: "e2e/collection-button-controls-visual.spec.ts",
      note: "Hovering the unselected Pro option asserts that Solid follows React Spectrum's baseColor neutral hover text ramp.",
    },
    {
      id: "styled.props.controls",
      label: "Interactive prop controls",
      kind: "interaction",
      react: "asserted",
      solid: "asserted",
      pairDiff: "na",
      spec: "e2e/collection-button-controls-visual.spec.ts",
      note: "The docs-style prop controls drive orientation, selectionMode, selectedKeys, isDisabled, illustration slots, and the disabled Pro option into both stacks and assert real rendered slot/disabled DOM changes.",
    },
    {
      id: "styled.keyboard.selection",
      label: "Keyboard multi-selection",
      kind: "interaction",
      react: "asserted",
      solid: "asserted",
      pairDiff: "na",
      spec: "e2e/collection-button-controls-visual.spec.ts",
      note: "Focusing the Pro option and pressing Space adds it to the selected key set on both stacks and updates the controlled selection marker.",
    },
    {
      id: "styled.disabled-item.illustration",
      label: "Illustrated disabled item",
      kind: "static",
      react: "snapshotted",
      solid: "snapshotted",
      pairDiff: "asserted",
      spec: "e2e/collection-button-controls-visual.spec.ts",
      snapshots: [
        "e2e/collection-button-controls-visual.spec.ts-snapshots/selectboxgroup-illustrated-disabled-react-chromium-linux.png",
        "e2e/collection-button-controls-visual.spec.ts-snapshots/selectboxgroup-illustrated-disabled-solid-chromium-linux.png",
      ],
      note: "Horizontal multiple SelectBoxGroup with illustration slots and a disabled Pro option is snapshotted and asserts illustration geometry, disabled-item label color, and disabled option state against React Spectrum.",
    },
    {
      id: "styled.disabled-item.behavior",
      label: "Disabled item behavior",
      kind: "interaction",
      react: "asserted",
      solid: "asserted",
      pairDiff: "na",
      spec: "e2e/collection-button-controls-visual.spec.ts",
      note: "Attempting to click the disabled Pro option leaves the controlled selected key set unchanged on both stacks.",
    },
  ],
  cardview: [
    assertedDefaultState({
      slug: "cardview",
      note: "CardView default screenshots are committed for both sides and compared with an asserted threshold; virtualization, selection styles, loading, keyboard, and strict pair-diff coverage remain open.",
    }),
    {
      id: "styled.selection.single",
      label: "Single selection",
      kind: "interaction",
      react: "asserted",
      solid: "asserted",
      pairDiff: "na",
      spec: "e2e/button-family-contract.spec.ts",
      note: "Clicking Zephyr moves the controlled selected key from apollo to zephyr on both stacks.",
    },
  ],
  checkbox: [
    {
      id: "styled.default",
      label: "Styled default",
      kind: "static",
      react: "planned",
      solid: "planned",
      pairDiff: "planned",
      note: "Checkbox is live on both styled stacks, but committed default screenshots and pair-diff thresholds are still part of the first visual tightening pass.",
    },
    {
      id: "styled.selected-emphasized-xl",
      label: "Selected emphasized XL",
      kind: "static",
      react: "snapshotted",
      solid: "snapshotted",
      pairDiff: "asserted",
      spec: "e2e/checkbox-visual.spec.ts",
      snapshots: [
        "e2e/checkbox-visual.spec.ts-snapshots/checkbox-selected-emphasized-xl-react-chromium-linux.png",
        "e2e/checkbox-visual.spec.ts-snapshots/checkbox-selected-emphasized-xl-solid-chromium-linux.png",
      ],
      note: "Selected emphasized XL Checkbox state is snapshotted and asserts checked semantics, S2 box/icon sizing, box color, and icon centerline geometry against React Spectrum.",
    },
    {
      id: "styled.props.controls",
      label: "Interactive prop controls",
      kind: "interaction",
      react: "asserted",
      solid: "asserted",
      pairDiff: "na",
      spec: "e2e/modeled-controls-contract.spec.ts",
      note: "The docs-style prop controls drive label text, size, selected, indeterminate, emphasized, disabled, read-only, and invalid state into both stacks.",
    },
    {
      id: "styled.dynamic-inactive-states",
      label: "Dynamic inactive states",
      kind: "interaction",
      react: "asserted",
      solid: "asserted",
      pairDiff: "na",
      spec: "e2e/checkbox-visual.spec.ts",
      note: "Side-panel invalid, read-only, and disabled states compare box/text colors against React Spectrum, and read-only/disabled hover and press affordances are suppressed on both stacks.",
    },
  ],
  textfield: [
    {
      id: "styled.default",
      label: "Styled default",
      kind: "static",
      react: "planned",
      solid: "planned",
      pairDiff: "planned",
      note: "TextField is live on both styled stacks, but committed default screenshots and pair-diff thresholds are still part of the form/input visual tightening pass.",
    },
    {
      id: "styled.invalid-required-xl",
      label: "Invalid required XL",
      kind: "static",
      react: "snapshotted",
      solid: "snapshotted",
      pairDiff: "asserted",
      spec: "e2e/textfield-visual.spec.ts",
      snapshots: [
        "e2e/textfield-visual.spec.ts-snapshots/textfield-invalid-required-xl-react-chromium-linux.png",
        "e2e/textfield-visual.spec.ts-snapshots/textfield-invalid-required-xl-solid-chromium-linux.png",
      ],
      note: "Invalid required XL TextField state is snapshotted and asserts controlled value, label/input/help-text geometry, invalid icon placement, border/background color, and aria state against React Spectrum.",
    },
    {
      id: "styled.value.change",
      label: "Controlled value change",
      kind: "interaction",
      react: "asserted",
      solid: "asserted",
      pairDiff: "na",
      spec: "e2e/textfield-visual.spec.ts",
      note: "Typing in the controlled TextField updates the comparison value marker on both React Spectrum and Solid.",
    },
    {
      id: "styled.props.controls",
      label: "Interactive prop controls",
      kind: "interaction",
      react: "asserted",
      solid: "asserted",
      pairDiff: "na",
      spec: "e2e/modeled-controls-contract.spec.ts",
      note: "The docs-style prop controls drive label, value, placeholder, size, description, error message, disabled, read-only, required, and invalid state into both stacks.",
    },
  ],
  textarea: [
    {
      id: "styled.default",
      label: "Styled default",
      kind: "static",
      react: "planned",
      solid: "planned",
      pairDiff: "planned",
      note: "TextArea is live on both styled stacks, but committed default screenshots and pair-diff thresholds are still part of the form/input visual tightening pass.",
    },
    {
      id: "styled.invalid-required-xl",
      label: "Invalid required XL",
      kind: "static",
      react: "snapshotted",
      solid: "snapshotted",
      pairDiff: "asserted",
      spec: "e2e/textarea-visual.spec.ts",
      snapshots: [
        "e2e/textarea-visual.spec.ts-snapshots/textarea-invalid-required-xl-react-chromium-linux.png",
        "e2e/textarea-visual.spec.ts-snapshots/textarea-invalid-required-xl-solid-chromium-linux.png",
      ],
      note: "Invalid required XL TextArea state is snapshotted and asserts controlled multiline value, label/textarea/help-text geometry, auto-height, invalid icon placement, border/background color, and aria state against React Spectrum.",
    },
    {
      id: "styled.value.change",
      label: "Controlled multiline value change",
      kind: "interaction",
      react: "asserted",
      solid: "asserted",
      pairDiff: "na",
      spec: "e2e/textarea-visual.spec.ts",
      note: "Typing in the controlled TextArea updates the comparison value marker and textarea height on both React Spectrum and Solid.",
    },
    {
      id: "styled.props.controls",
      label: "Interactive prop controls",
      kind: "interaction",
      react: "asserted",
      solid: "asserted",
      pairDiff: "na",
      spec: "e2e/modeled-controls-contract.spec.ts",
      note: "The docs-style prop controls drive label, multiline value, placeholder, size, description, error message, disabled, read-only, required, and invalid state into both stacks.",
    },
  ],
  searchfield: [
    {
      id: "styled.default",
      label: "Styled default",
      kind: "static",
      react: "planned",
      solid: "planned",
      pairDiff: "planned",
      note: "SearchField is live on both styled stacks, but committed default screenshots and pair-diff thresholds are still part of the form/input visual tightening pass.",
    },
    {
      id: "styled.invalid-required-xl",
      label: "Invalid required XL",
      kind: "static",
      react: "snapshotted",
      solid: "snapshotted",
      pairDiff: "asserted",
      spec: "e2e/searchfield-visual.spec.ts",
      snapshots: [
        "e2e/searchfield-visual.spec.ts-snapshots/searchfield-invalid-required-xl-react-chromium-linux.png",
        "e2e/searchfield-visual.spec.ts-snapshots/searchfield-invalid-required-xl-solid-chromium-linux.png",
      ],
      note: "Invalid required XL SearchField state is snapshotted and asserts controlled value, pill group geometry, search icon placement, clear-button visibility, border/background color, and aria state against React Spectrum.",
    },
    {
      id: "styled.value.change",
      label: "Controlled value and clear",
      kind: "interaction",
      react: "asserted",
      solid: "asserted",
      pairDiff: "na",
      spec: "e2e/searchfield-visual.spec.ts",
      note: "Typing in the controlled SearchField updates the comparison value marker on both stacks, and the clear button resets the value without leaving focus.",
    },
    {
      id: "styled.props.controls",
      label: "Interactive prop controls",
      kind: "interaction",
      react: "asserted",
      solid: "asserted",
      pairDiff: "na",
      spec: "e2e/modeled-controls-contract.spec.ts",
      note: "The docs-style prop controls drive label, value, placeholder, size, description, error message, disabled, read-only, required, and invalid state into both stacks.",
    },
  ],
  switch: [
    {
      id: "styled.default",
      label: "Styled default",
      kind: "static",
      react: "planned",
      solid: "planned",
      pairDiff: "planned",
      note: "Switch is live on both styled stacks, but committed default screenshots and strict pair-diff thresholds are still part of the broader form/input tightening pass.",
    },
    {
      id: "styled.selected-emphasized-xl",
      label: "Selected emphasized XL",
      kind: "static",
      react: "snapshotted",
      solid: "snapshotted",
      pairDiff: "asserted",
      spec: "e2e/switch-visual.spec.ts",
      snapshots: [
        "e2e/switch-visual.spec.ts-snapshots/switch-selected-emphasized-xl-react-chromium-linux.png",
        "e2e/switch-visual.spec.ts-snapshots/switch-selected-emphasized-xl-solid-chromium-linux.png",
      ],
      note: "Selected emphasized XL Switch state is snapshotted and asserts controlled selection, track/handle geometry, handle transform, and label color parity against React Spectrum.",
    },
    {
      id: "styled.selection.change",
      label: "Click selection change",
      kind: "interaction",
      react: "asserted",
      solid: "asserted",
      pairDiff: "na",
      spec: "e2e/switch-visual.spec.ts",
      note: "Clicking the visible Switch label toggles the controlled selected-state marker on both React Spectrum and Solid, and the transition-carrying thumb DOM node stays mounted through the state change.",
    },
    {
      id: "styled.props.controls",
      label: "Interactive prop controls",
      kind: "interaction",
      react: "asserted",
      solid: "asserted",
      pairDiff: "na",
      spec: "e2e/modeled-controls-contract.spec.ts + e2e/switch-visual.spec.ts",
      note: "The docs-style prop controls drive label text, size, selected, emphasized, disabled, and read-only state into both stacks and assert mounted DOM state changes rather than serialized props alone.",
    },
  ],
  dialog: [
    {
      id: "styled.trigger.default",
      label: "Trigger button",
      kind: "static",
      react: "snapshotted",
      solid: "snapshotted",
      pairDiff: "strict",
      spec: "e2e/dialog-visual.spec.ts",
      snapshots: [
        "e2e/dialog-visual.spec.ts-snapshots/dialog-trigger-react-chromium-linux.png",
        "e2e/dialog-visual.spec.ts-snapshots/dialog-trigger-solid-chromium-linux.png",
      ],
      note: "Committed screenshots exist for both triggers; React-vs-Solid pair diff is strict zero-tolerance.",
    },
    {
      id: "styled.dialog.open",
      label: "Open modal surface",
      kind: "overlay",
      react: "snapshotted",
      solid: "snapshotted",
      pairDiff: "strict",
      spec: "e2e/dialog-visual.spec.ts",
      snapshots: [
        "e2e/dialog-visual.spec.ts-snapshots/dialog-surface-react-chromium-linux.png",
        "e2e/dialog-visual.spec.ts-snapshots/dialog-surface-solid-chromium-linux.png",
      ],
      note: "Covers visible open state, viewport placement, occlusion, committed screenshots, and strict zero-tolerance pair diff.",
    },
    {
      id: "styled.dialog.dismiss.outside",
      label: "Outside click dismissal",
      kind: "interaction",
      react: "asserted",
      solid: "asserted",
      pairDiff: "na",
      spec: "e2e/dialog-visual.spec.ts",
      note: "Behavior assertion verifies both React Spectrum and Solid close on outside click.",
    },
    {
      id: "styled.dialog.keyboard.escape-focus",
      label: "Keyboard focus and Escape",
      kind: "keyboard",
      react: "asserted",
      solid: "asserted",
      pairDiff: "na",
      spec: "e2e/dialog-visual.spec.ts",
      note: "Focus containment, Escape dismissal, and Solid focus return are asserted.",
    },
  ],
  datepicker: [
    {
      id: "styled.field.default",
      label: "Closed field",
      kind: "static",
      react: "snapshotted",
      solid: "snapshotted",
      pairDiff: "strict",
      spec: "e2e/datepicker-visual.spec.ts",
      snapshots: [
        "e2e/datepicker-visual.spec.ts-snapshots/datepicker-field-react-chromium-linux.png",
        "e2e/datepicker-visual.spec.ts-snapshots/datepicker-field-solid-chromium-linux.png",
      ],
      note: "Committed screenshots exist for the closed field; React-vs-Solid pair diff is strict zero-tolerance.",
    },
    {
      id: "styled.calendar.open",
      label: "Open calendar popover",
      kind: "overlay",
      react: "snapshotted",
      solid: "snapshotted",
      pairDiff: "strict",
      spec: "e2e/datepicker-visual.spec.ts",
      snapshots: [
        "e2e/datepicker-visual.spec.ts-snapshots/datepicker-popover-react-chromium-linux.png",
        "e2e/datepicker-visual.spec.ts-snapshots/datepicker-popover-solid-chromium-linux.png",
      ],
      note: "Covers open calendar geometry, committed screenshots for both sides, and strict zero-tolerance pair diff.",
    },
    {
      id: "styled.calendar.select-date",
      label: "Select date",
      kind: "interaction",
      react: "asserted",
      solid: "asserted",
      pairDiff: "na",
      spec: "e2e/datepicker-visual.spec.ts",
      note: "Selection closes the popover and updates component value on both sides.",
    },
    {
      id: "styled.calendar.dismiss.outside",
      label: "Outside click dismissal",
      kind: "interaction",
      react: "asserted",
      solid: "asserted",
      pairDiff: "na",
      spec: "e2e/datepicker-visual.spec.ts",
      note: "Outside click dismissal is asserted for both implementations.",
    },
  ],
};

function stateTargetsFor(entry: ComparisonEntry): readonly VisualStateTarget[] {
  return officialStateOverrides[entry.slug] ?? [plannedState(entry)];
}

export function getVisualStateTargets(entry: ComparisonEntry): readonly VisualStateTarget[] {
  return stateTargetsFor(entry);
}

export const visualStateCoverage: readonly VisualStateCoverage[] = comparisonEntries.map(
  (entry) => ({
    slug: entry.slug,
    title: entry.title,
    source: entry.catalogueSource,
    states: stateTargetsFor(entry),
  }),
);

export const officialVisualStateCoverage: readonly VisualStateCoverage[] =
  officialComparisonEntries.map((entry) => ({
    slug: entry.slug,
    title: entry.title,
    source: entry.catalogueSource,
    states: stateTargetsFor(entry),
  }));

export const officialVisualStateSummary = {
  components: officialVisualStateCoverage.length,
  states: officialVisualStateCoverage.reduce((count, entry) => count + entry.states.length, 0),
  snapshottedStates: officialVisualStateCoverage.reduce(
    (count, entry) =>
      count +
      entry.states.filter((state) => state.react === "snapshotted" && state.solid === "snapshotted")
        .length,
    0,
  ),
  strictPairDiffStates: officialVisualStateCoverage.reduce(
    (count, entry) => count + entry.states.filter((state) => state.pairDiff === "strict").length,
    0,
  ),
  blockedStates: officialVisualStateCoverage.reduce(
    (count, entry) => count + entry.states.filter((state) => state.pairDiff === "blocked").length,
    0,
  ),
} as const;
