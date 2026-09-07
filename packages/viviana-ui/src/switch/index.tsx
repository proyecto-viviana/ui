import { type JSX, createContext } from "solid-js";
import { type SpectrumContextValue } from "../button/spectrum-context";
import { type ToggleSwitchProps } from "./ToggleSwitch";
import { SegmentedControl, SegmentedControlItem } from "../segmentedcontrol";

export {
  ToggleSwitch,
  ToggleSwitch as Switch,
  type ToggleSwitchProps,
  type ToggleSwitchProps as SwitchProps,
  type SwitchSize,
} from "./ToggleSwitch";

export const SwitchContext = createContext<SpectrumContextValue<ToggleSwitchProps>>(null);

interface SwitchOption {
  label: string;
  value: string;
}

/**
 * Props for the deprecated {@link TabSwitch} mapping wrapper. Prefer {@link SegmentedControl}.
 *
 * @deprecated Use {@link SegmentedControl}
 */
export interface TabSwitchProps {
  /**
   * Options rendered as {@link SegmentedControlItem} children (`value` → `id`, `label` → children).
   */
  options: SwitchOption[];
  /**
   * Selected option `value`, mapped to SegmentedControl `selectedKey`. Omit when unset so first-item register runs.
   */
  value?: string;
  /**
   * Called with the selected option `value` string. Maps to SegmentedControl `onSelectionChange`.
   */
  onChange?: (value: string) => void;
  /**
   * Class name applied to the SegmentedControl radiogroup (`class`).
   */
  class?: string;
  /**
   * Accessible name for the radiogroup. Passed through to SegmentedControl `aria-label`. Required; not defaulted.
   */
  "aria-label": string;
}

/**
 * Deprecated mapping wrapper onto {@link SegmentedControl}. Prefer SegmentedControl for new call sites.
 *
 * @deprecated Use {@link SegmentedControl}
 */
export function TabSwitch(props: TabSwitchProps): JSX.Element {
  return (
    <SegmentedControl
      aria-label={props["aria-label"]}
      class={props.class}
      {...(props.value !== undefined ? { selectedKey: props.value } : {})}
      onSelectionChange={(id) => {
        props.onChange?.(String(id));
      }}
    >
      {props.options.map((option) => (
        <SegmentedControlItem id={option.value}>{option.label}</SegmentedControlItem>
      ))}
    </SegmentedControl>
  );
}
