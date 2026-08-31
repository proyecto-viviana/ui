/*
 * Copyright 2024 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

// Ported to SolidJS for Proyecto Viviana; based on packages/react-aria-components/src/ToggleButtonGroup.tsx

/**
 * ToggleButtonGroup component for solidaria-components.
 *
 * Groups toggle buttons with single/multiple selection state.
 * Based on packages/react-aria-components/src/ToggleButtonGroup.tsx.
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
      get children() {
        return local.children;
      },
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
