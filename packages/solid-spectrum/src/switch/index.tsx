import { type JSX, createContext, createMemo } from "solid-js";
import type { Key } from "@proyecto-viviana/solid-stately";
import {
  ToggleButtonGroup as HeadlessToggleButtonGroup,
  ToggleButton as HeadlessToggleButton,
} from "@proyecto-viviana/solidaria-components";
import { type SpectrumContextValue } from "../button/spectrum-context";
import { type ToggleSwitchProps } from "./ToggleSwitch";

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

  const textSelected = "font-extrabold text-primary-100 tracking-wider";
  const textUnselected = "font-medium text-primary-300 tracking-wider";
  const optionCount = createMemo(() => Math.max(options().length, 1));
  const indicatorStyle = createMemo(() => ({
    width: `calc(100% / ${optionCount()})`,
    transform: `translateX(${selectedIndex() * 100}%)`,
  }));
  const layoutStyle = createMemo(() => ({
    "grid-template-columns": `repeat(${optionCount()}, minmax(0, 1fr))`,
  }));

  return (
    <div class={`relative bg-bg-400 rounded-full w-[250px] ${props.class ?? ""}`}>
      <div
        class="left-0 top-0 transition-all duration-300 ease-in-out z-0 absolute bg-primary-700 rounded-full h-8 border-l-2 border-r-2 border-accent-300"
        style={indicatorStyle()}
      />
      <HeadlessToggleButtonGroup
        selectionMode="single"
        selectedKeys={selectedKeys()}
        class="relative z-10 grid h-8"
        style={layoutStyle()}
        aria-label="View mode"
      >
        {options().map((option) => (
          <HeadlessToggleButton
            toggleKey={option.value}
            onClick={() => props.onChange?.(option.value)}
            class={() =>
              `transition-all ease-in-out duration-300 z-10 text-lg flex justify-center items-center rounded-full ${
                selectedValue() === option.value ? textSelected : textUnselected
              }`
            }
          >
            <span>{option.label}</span>
          </HeadlessToggleButton>
        ))}
      </HeadlessToggleButtonGroup>
    </div>
  );
}
