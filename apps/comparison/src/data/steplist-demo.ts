// StepList pair-comparison codec.
//
// StepList has no @react-spectrum/s2 component (S2 1.5.1 ships none) and no
// react-aria-components component — the only upstream is the pinned react-aria
// 3.50.0 `useStepList` / `useStepListItem` HOOKS (+ react-stately
// `useStepListState`), the direct source of our solidaria `createStepList` /
// `createStep` / `createStepListState` port. So the React oracle is those hooks
// hand-wired exactly as the vendored `@adobe/react-spectrum` StepList /
// StepListItem wire them (the ActionGroup hooks-oracle precedent), diffed
// against the Solid solid-spectrum StepList. A BEHAVIOR cert: D5 (native-Tab
// focus trail) + D6 (AX roles/name/state). Paint is scoped out (no S2 oracle).
//
// The fixed four-step wizard mirrors the vendored StepList story. The prop
// surface (defaultSelectedKey / defaultLastCompletedStep / disabledKeys /
// isDisabled / isReadOnly) drives the selectability matrix the cert certifies:
// upstream a step is selectable iff it is completed, is the first step, or its
// PREVIOUS step is completed — there is no "step after the selected step"
// clause (the invented divergence this unit reverts).

export interface StepListDemoItem {
  key: string;
  label: string;
}

export const stepListDemoItems: StepListDemoItem[] = [
  { key: "details", label: "Details" },
  { key: "select-offers", label: "Select offers" },
  { key: "fallback-offer", label: "Fallback offer" },
  { key: "summary", label: "Summary" },
];

const stepListKeys = stepListDemoItems.map((item) => item.key);

export interface StepListDemoProps {
  /** The step selected at rest (uncontrolled). */
  defaultSelectedKey: string;
  /** The last completed step at rest (uncontrolled); "" = none completed. */
  defaultLastCompletedStep: string;
  /** Comma-separated individually-disabled step keys. */
  disabledKeys: string;
  /** Whether every step is disabled. */
  isDisabled: boolean;
  /** Whether the whole list is read-only (no step selectable). */
  isReadOnly: boolean;
}

export const stepListDemoDefaults: StepListDemoProps = {
  defaultSelectedKey: "",
  defaultLastCompletedStep: "",
  disabledKeys: "",
  isDisabled: false,
  isReadOnly: false,
};

function isKnownKey(value: string | null | undefined): value is string {
  return value != null && stepListKeys.includes(value);
}

function coerceBoolean(value: string | boolean | null | undefined): boolean {
  return value === true || value === "true";
}

/** Parse a comma-separated key list into the fixed step keys (order-stable). */
export function stepListKeysFromValue(value: string | null | undefined): string[] {
  if (!value) return [];
  const requested = new Set(
    value
      .split(",")
      .map((part) => part.trim())
      .filter(Boolean),
  );
  return stepListKeys.filter((key) => requested.has(key));
}

export function normalizeStepListDemoProps(
  props: Partial<StepListDemoProps> = {},
): StepListDemoProps {
  return {
    defaultSelectedKey: isKnownKey(props.defaultSelectedKey) ? props.defaultSelectedKey : "",
    defaultLastCompletedStep: isKnownKey(props.defaultLastCompletedStep)
      ? props.defaultLastCompletedStep
      : "",
    disabledKeys: stepListKeysFromValue(props.disabledKeys).join(","),
    isDisabled: coerceBoolean(props.isDisabled),
    isReadOnly: coerceBoolean(props.isReadOnly),
  };
}

export function stepListDemoPropsFromSearch(search: string): StepListDemoProps {
  const params = new URLSearchParams(search);
  return normalizeStepListDemoProps({
    defaultSelectedKey: params.get("defaultSelectedKey") ?? undefined,
    defaultLastCompletedStep: params.get("defaultLastCompletedStep") ?? undefined,
    disabledKeys: params.get("disabledKeys") ?? undefined,
    isDisabled: params.get("isDisabled") ?? undefined,
    isReadOnly: params.get("isReadOnly") ?? undefined,
  });
}

export function stepListDemoPropsFromWindow(): StepListDemoProps {
  if (typeof window === "undefined") {
    return stepListDemoDefaults;
  }
  return stepListDemoPropsFromSearch(window.location.search);
}

export function serializeStepListDemoProps(props: StepListDemoProps): string {
  return JSON.stringify(normalizeStepListDemoProps(props));
}

export { comparisonControlsEvent } from "./button-demo";
