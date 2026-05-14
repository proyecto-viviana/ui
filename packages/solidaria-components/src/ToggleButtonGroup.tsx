/**
 * ToggleButtonGroup component for solidaria-components.
 *
 * Groups toggle buttons with single/multiple selection state.
 * Parity target: react-aria-components/src/ToggleButtonGroup.tsx
 */

import { type JSX, createContext, createMemo, splitProps, useContext } from "solid-js";
import { createToggleButtonGroup, mergeProps } from "@proyecto-viviana/solidaria";
import {
  createToggleGroupState,
  type Key,
  type ToggleGroupState,
} from "@proyecto-viviana/solid-stately";
import {
  type ClassNameOrFunction,
  type StyleOrFunction,
  type RenderChildren,
  type SlotProps,
  useRenderProps,
  filterDOMProps,
} from "./utils";

export interface ToggleButtonGroupRenderProps {
  orientation: "horizontal" | "vertical";
  isDisabled: boolean;
  state: ToggleGroupState;
}

export interface ToggleButtonGroupProps
  extends
    Omit<JSX.HTMLAttributes<HTMLDivElement>, "children" | "class" | "style" | "onSelectionChange">,
    SlotProps {
  selectionMode?: "single" | "multiple";
  disallowEmptySelection?: boolean;
  selectedKeys?: Iterable<Key>;
  defaultSelectedKeys?: Iterable<Key>;
  onSelectionChange?: (keys: Set<Key>) => void;
  orientation?: "horizontal" | "vertical";
  isDisabled?: boolean;
  children?: RenderChildren<ToggleButtonGroupRenderProps>;
  class?: ClassNameOrFunction<ToggleButtonGroupRenderProps>;
  style?: StyleOrFunction<ToggleButtonGroupRenderProps>;
}

export const ToggleButtonGroupContext = createContext<ToggleButtonGroupProps | null>(null);
export const ToggleButtonGroupStateContext = createContext<ToggleGroupState | null>(null);
export const ToggleGroupStateContext = ToggleButtonGroupStateContext;
export type ToggleButtonGroupStateContextValue = ToggleGroupState;

export function ToggleButtonGroup(props: ToggleButtonGroupProps): JSX.Element {
  const [local, domProps] = splitProps(props, [
    "selectionMode",
    "disallowEmptySelection",
    "selectedKeys",
    "defaultSelectedKeys",
    "onSelectionChange",
    "orientation",
    "isDisabled",
    "children",
    "class",
    "style",
    "ref",
    "slot",
    "aria-label",
    "aria-labelledby",
  ]);

  const state = createToggleGroupState(() => ({
    selectionMode: local.selectionMode,
    disallowEmptySelection: local.disallowEmptySelection,
    selectedKeys: local.selectedKeys,
    defaultSelectedKeys: local.defaultSelectedKeys,
    onSelectionChange: local.onSelectionChange,
    isDisabled: !!local.isDisabled,
  }));

  const { groupProps } = createToggleButtonGroup(
    {
      get orientation() {
        return local.orientation;
      },
      get isDisabled() {
        return !!local.isDisabled;
      },
      get "aria-label"() {
        return local["aria-label"];
      },
      get "aria-labelledby"() {
        return local["aria-labelledby"];
      },
    },
    state,
  );

  const renderProps = useRenderProps(
    {
      children: local.children,
      class: local.class,
      style: local.style,
      defaultClassName: "solidaria-ToggleButtonGroup",
    },
    () => ({
      orientation: local.orientation ?? "horizontal",
      isDisabled: !!local.isDisabled,
      state,
    }),
  );

  const filteredDomProps = createMemo(() => filterDOMProps(domProps, { global: true }));
  const mergedGroupProps = createMemo(() =>
    mergeProps(filteredDomProps(), groupProps as Record<string, unknown>),
  );

  return (
    <div
      {...(mergedGroupProps() as JSX.HTMLAttributes<HTMLDivElement>)}
      class={renderProps.class()}
      style={renderProps.style()}
      slot={local.slot}
      data-orientation={local.orientation ?? "horizontal"}
      data-disabled={local.isDisabled || undefined}
      ref={(el) => {
        if (!local.ref) return;
        if (typeof local.ref === "function") {
          local.ref(el);
        }
      }}
    >
      <ToggleButtonGroupContext.Provider value={props}>
        <ToggleButtonGroupStateContext.Provider value={state}>
          {renderProps.renderChildren()}
        </ToggleButtonGroupStateContext.Provider>
      </ToggleButtonGroupContext.Provider>
    </div>
  );
}

export function useToggleButtonGroupStateContext(): ToggleGroupState | null {
  return useContext(ToggleButtonGroupStateContext);
}
