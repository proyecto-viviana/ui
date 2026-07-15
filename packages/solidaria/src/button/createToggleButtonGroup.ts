import type { JSX } from "solid-js";
import { splitProps } from "solid-js";
import type { Key, ToggleGroupProps, ToggleGroupState } from "@proyecto-viviana/solid-stately";
import { createToolbar, type Orientation } from "../toolbar";
import { mergeProps } from "../utils";
import {
  createToggleButton,
  type AriaToggleButtonProps,
  type ToggleButtonAria,
} from "./createToggleButton";

export interface AriaToggleButtonGroupProps extends ToggleGroupProps {
  /**
   * The orientation of the toggle button group.
   * @default 'horizontal'
   */
  orientation?: Orientation;
  /** Accessible label. */
  "aria-label"?: string;
  /** Labelled-by id. */
  "aria-labelledby"?: string;
}

export interface ToggleButtonGroupAria {
  /** Props for the group container. */
  groupProps: JSX.HTMLAttributes<HTMLElement>;
}

export interface AriaToggleButtonGroupItemProps extends Omit<AriaToggleButtonProps, "children"> {
  /** Key used in the group selection state. */
  id: Key;
}

function isDisabledValue(isDisabled: AriaToggleButtonProps["isDisabled"]): boolean {
  if (typeof isDisabled === "function") {
    return isDisabled();
  }
  return !!isDisabled;
}

/**
 * Provides ARIA behavior for a toggle button group container.
 */
export function createToggleButtonGroup(
  props: AriaToggleButtonGroupProps,
  state: ToggleGroupState,
): ToggleButtonGroupAria {
  const { toolbarProps } = createToolbar({
    get orientation() {
      return props.orientation;
    },
    get "aria-label"() {
      return props["aria-label"];
    },
    get "aria-labelledby"() {
      return props["aria-labelledby"];
    },
  });

  const groupProps = mergeProps(toolbarProps as Record<string, unknown>, {
    get role() {
      return state.selectionMode === "single" ? "radiogroup" : toolbarProps.role;
    },
    get "aria-disabled"() {
      return props.isDisabled || undefined;
    },
  }) as JSX.HTMLAttributes<HTMLElement>;

  return { groupProps };
}

/**
 * Provides ARIA behavior for an item within a toggle button group.
 */
export function createToggleButtonGroupItem(
  props: AriaToggleButtonGroupItemProps,
  state: ToggleGroupState,
): ToggleButtonAria {
  // splitProps keeps `toggleProps` a reactive proxy; an object-rest destructure
  // (`{ id, ...toggleProps }`) eagerly reads and freezes every key. `id` is
  // dropped here and re-read live via props.id below. guard:idiomatic-solid.
  const [, toggleProps] = splitProps(props, ["id"]);

  const toggleButton = createToggleButton(
    mergeProps(toggleProps, {
      get isSelected() {
        return state.selectedKeys.has(props.id);
      },
      onChange(isSelected: boolean) {
        state.setSelected(props.id, isSelected);
        props.onChange?.(isSelected);
      },
      get isDisabled() {
        return isDisabledValue(props.isDisabled) || state.isDisabled;
      },
    }) as AriaToggleButtonProps,
  );

  const baseButtonProps = toggleButton.buttonProps as Record<string, unknown>;
  const buttonProps: Record<string, unknown> = {
    ...baseButtonProps,
    get role() {
      if (state.selectionMode === "single") {
        return "radio";
      }
      return baseButtonProps.role as string | undefined;
    },
    get "aria-checked"() {
      if (state.selectionMode !== "single") {
        return undefined;
      }
      return state.selectedKeys.has(props.id);
    },
    get "aria-pressed"() {
      if (state.selectionMode === "single") {
        return undefined;
      }
      return baseButtonProps["aria-pressed"];
    },
  };

  return {
    ...toggleButton,
    buttonProps,
  };
}
