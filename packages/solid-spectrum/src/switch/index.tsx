import { type JSX, createContext, createMemo } from "solid-js";
import type { Key } from "@proyecto-viviana/solid-stately";
import {
  ToggleButtonGroup as HeadlessToggleButtonGroup,
  ToggleButton as HeadlessToggleButton,
} from "@proyecto-viviana/solidaria-components";
import { type SpectrumContextValue } from "../button/spectrum-context";
import { type ToggleSwitchProps } from "./ToggleSwitch";
import { style } from "../style" with { type: "macro" };

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

export interface TabSwitchProps {
  options: SwitchOption[];
  value?: string;
  onChange?: (value: string) => void;
  class?: string;
}

// Static styling flows through the build-time S2 style() macro so the atomic CSS
// ships in the package bundle. Only the sliding indicator's transform/width and
// the button grid's column template are runtime-computed, so those stay inline.
// TabSwitch has no S2 upstream — it's a segmented control styled with S2 tokens:
// a subtle track, an accent pill that slides under the active label.

const trackStyles = style({
  position: "relative",
  // Match the current S2 SegmentedControl track exactly. The generic gray-100
  // semantic resolved much lighter in dark mode and left the unselected label
  // below WCAG AA.
  backgroundColor: "[light-dark(rgb(233, 233, 233), rgb(44, 44, 44))]",
  borderRadius: "full",
  width: "[250px]",
});

const indicatorStyles = style({
  position: "absolute",
  top: 0,
  height: 32,
  zIndex: 0,
  backgroundColor: "accent",
  borderRadius: "full",
  transition: "default",
});

const groupStyles = style({
  position: "relative",
  zIndex: 10,
  display: "grid",
  height: 32,
});

const buttonStyles = style<{ isSelected?: boolean }>({
  position: "relative",
  zIndex: 10,
  display: "flex",
  // ToggleButton renders a native button. Reset its UA ButtonFace so the S2
  // track remains the actual text background, as SegmentedControl does.
  backgroundColor: "transparent",
  borderStyle: "none",
  forcedColorAdjust: "none",
  justifyContent: "center",
  alignItems: "center",
  borderRadius: "full",
  transition: "default",
  font: "ui-lg",
  fontWeight: { default: "medium", isSelected: "extra-bold" },
  color: { default: "neutral", isSelected: "white" },
});

/**
 * A tab-style switch that allows users to select between two options.
 * Behavior is delegated to headless ToggleButtonGroup/ToggleButton primitives.
 */
export function TabSwitch(props: TabSwitchProps): JSX.Element {
  const options = createMemo(() => props.options.slice(0, 2));
  const selectedValue = createMemo(() => {
    const match = options().find((option) => option.value === props.value);
    return match?.value ?? options()[0]?.value;
  });
  const selectedIndex = createMemo(() => {
    const index = options().findIndex((option) => option.value === selectedValue());
    return index >= 0 ? index : 0;
  });
  const selectedKeys = createMemo<Set<Key>>(() => {
    const value = selectedValue();
    return value ? new Set<Key>([value]) : new Set<Key>();
  });

  const optionCount = createMemo(() => Math.max(options().length, 1));
  const indicatorStyle = createMemo(() => ({
    left: "0",
    width: `calc(100% / ${optionCount()})`,
    transform: `translateX(${selectedIndex() * 100}%)`,
  }));
  const layoutStyle = createMemo(() => ({
    "grid-template-columns": `repeat(${optionCount()}, minmax(0, 1fr))`,
  }));

  return (
    <div class={[trackStyles, props.class].filter(Boolean).join(" ")}>
      <div class={indicatorStyles} style={indicatorStyle()} />
      <HeadlessToggleButtonGroup
        selectionMode="single"
        selectedKeys={selectedKeys()}
        class={groupStyles}
        style={layoutStyle()}
        aria-label="View mode"
      >
        {options().map((option) => (
          <HeadlessToggleButton
            toggleKey={option.value}
            onClick={() => props.onChange?.(option.value)}
            class={() => buttonStyles({ isSelected: selectedValue() === option.value })}
          >
            <span>{option.label}</span>
          </HeadlessToggleButton>
        ))}
      </HeadlessToggleButtonGroup>
    </div>
  );
}
