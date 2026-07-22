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
// TabSwitch has no S2 upstream. Its register twin is the island's segmented pill
// (`.glx-pop-kind`, glasselated.css:2503-2528): an inset glass track with a subtle
// border, and a RAISED pill under the active label — surface + primary ink + the
// edge-glass rim. Not an accent fill: the island never paints white text over
// `--accent-primary`, and in light that pairing lands well under 4.5:1 (the ramp
// pins blue-900 to the brand #2e90fa in both columns, see glasselated-ramps.ts).

const trackStyles = style({
  position: "relative",
  backgroundColor: "pasteboard",
  borderStyle: "solid",
  borderWidth: 1,
  borderColor: "border-subtle",
  boxSizing: "border-box",
  borderRadius: "full",
  width: "[250px]",
});

const indicatorStyles = style({
  position: "absolute",
  top: 0,
  height: 32,
  zIndex: 0,
  backgroundColor: "raised",
  boxShadow: "edge-glass",
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
  justifyContent: "center",
  alignItems: "center",
  /* Native <button> chrome must be reset here: the UA's opaque ButtonFace fill and
     2px outset border otherwise paint OVER the z-0 indicator, hiding the sliding
     pill entirely — the label appears to sit on a bare grey lozenge instead. */
  backgroundColor: "transparent",
  borderStyle: "none",
  padding: 0,
  cursor: "pointer",
  borderRadius: "full",
  transition: "default",
  font: "ui-lg",
  fontWeight: { default: "medium", isSelected: "extra-bold" },
  /* Island ink pair: resting labels are `--text-secondary`, the active one steps up
     to `--text-primary` on the raised pill (glasselated.css:2512-2528). The old
     `white` ink only read on the accent fill this pill no longer has. */
  color: { default: "neutral-subdued", isSelected: "neutral" },
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
