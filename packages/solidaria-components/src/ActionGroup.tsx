/*
 * Copyright 2020 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

// Ported to SolidJS for Proyecto Viviana; based on packages/react-aria/src/actiongroup/useActionGroup.ts
// Ported to SolidJS for Proyecto Viviana; based on packages/react-aria/src/actiongroup/useActionGroupItem.ts

/**
 * ActionGroup component for solidaria-components
 *
 * Pre-wired headless action group component that combines
 * createListState + createActionGroup/createActionGroupItem.
 * Provides proper dynamic roles (toolbar/radiogroup), keyboard
 * navigation, and ARIA attributes.
 *
 * Based on packages/react-aria/src/actiongroup/useActionGroup.ts and
 * packages/react-aria/src/actiongroup/useActionGroupItem.ts. React Aria
 * Components has no ActionGroup component, so this file wires the two hooks.
 */

import {
  type JSX,
  type ParentProps,
  createContext,
  createMemo,
  splitProps,
  useContext,
  For,
} from "solid-js";
import {
  createActionGroup,
  createActionGroupItem,
  type AriaActionGroupProps,
} from "@proyecto-viviana/solidaria";
import {
  createListState,
  type ListState,
  type Key,
  type SelectionMode,
} from "@proyecto-viviana/solid-stately";
import {
  type ClassNameOrFunction,
  type StyleOrFunction,
  type SlotProps,
  useRenderProps,
  filterDOMProps,
} from "./utils";

export interface ActionGroupRenderProps {
  /** The orientation of the action group. */
  orientation: "horizontal" | "vertical";
  /** Whether the entire group is disabled. */
  isDisabled: boolean;
  /** The selection mode. */
  selectionMode: SelectionMode;
}

export interface ActionGroupItemRenderProps {
  /** Whether the item is selected. */
  isSelected: boolean;
  /** Whether the item is disabled. */
  isDisabled: boolean;
  /** Whether the item is focused. */
  isFocused: boolean;
}

export interface ActionGroupItem {
  id: string;
  label: string;
  isDisabled?: boolean;
  [key: string]: unknown;
}

export interface ActionGroupProps<T extends ActionGroupItem = ActionGroupItem> extends SlotProps {
  /** The items in the action group. */
  items: T[];
  /** The selection mode. @default 'none' */
  selectionMode?: SelectionMode;
  /** Orientation of the group. @default 'horizontal' */
  orientation?: "horizontal" | "vertical";
  /** Whether the entire group is disabled. */
  isDisabled?: boolean;
  /** Accessible label. */
  "aria-label"?: string;
  /** Labelled-by id. */
  "aria-labelledby"?: string;
  /** Currently selected keys (controlled). */
  selectedKeys?: Iterable<Key>;
  /** Default selected keys (uncontrolled). */
  defaultSelectedKeys?: Iterable<Key>;
  /** Handler called when selection changes. */
  onSelectionChange?: (keys: "all" | Set<Key>) => void;
  /** Handler called when an item action is triggered. */
  onAction?: (key: Key) => void;
  /** Keys of disabled items. */
  disabledKeys?: Iterable<Key>;
  /** Render function for each item. */
  children: (item: T, renderProps: ActionGroupItemRenderProps) => JSX.Element;
  /** CSS class for the container. */
  class?: ClassNameOrFunction<ActionGroupRenderProps>;
  /** Inline style for the container. */
  style?: StyleOrFunction<ActionGroupRenderProps>;
}

export interface ActionGroupContextValue<T extends ActionGroupItem = ActionGroupItem> {
  state: ListState<T>;
}

export const ActionGroupContext = createContext<ActionGroupContextValue | null>(null);
export const ActionGroupStateContext = createContext<ListState<ActionGroupItem> | null>(null);

export function ActionGroup<T extends ActionGroupItem = ActionGroupItem>(
  props: ActionGroupProps<T>,
): JSX.Element {
  const [local, ariaGroupProps, domProps] = splitProps(
    props,
    [
      "items",
      "selectionMode",
      "orientation",
      "isDisabled",
      "selectedKeys",
      "defaultSelectedKeys",
      "onSelectionChange",
      "onAction",
      "disabledKeys",
      "children",
      "class",
      "style",
      "slot",
    ],
    ["aria-label", "aria-labelledby"],
  );

  const state = createListState<T>({
    get items() {
      return local.items;
    },
    get selectionMode() {
      return local.selectionMode ?? "none";
    },
    get selectedKeys() {
      return local.selectedKeys;
    },
    get defaultSelectedKeys() {
      return local.defaultSelectedKeys;
    },
    get onSelectionChange() {
      return local.onSelectionChange;
    },
    get disabledKeys() {
      return local.disabledKeys;
    },
    getKey: (item) => item.id,
    getTextValue: (item) => item.label,
    getDisabled: (item) => !!item.isDisabled,
  });

  const groupAriaProps: AriaActionGroupProps<T> = {
    get items() {
      return local.items;
    },
    get isDisabled() {
      return local.isDisabled;
    },
    get orientation() {
      return local.orientation;
    },
    get "aria-label"() {
      return ariaGroupProps["aria-label"];
    },
    get "aria-labelledby"() {
      return ariaGroupProps["aria-labelledby"];
    },
    get onAction() {
      return local.onAction;
    },
  };

  const { actionGroupProps } = createActionGroup(groupAriaProps, state as ListState<T>);

  const orientation = () => local.orientation ?? "horizontal";

  const renderProps = useRenderProps(
    {
      children: undefined,
      class: local.class,
      style: local.style,
      defaultClassName: "solidaria-ActionGroup",
    },
    () => ({
      orientation: orientation(),
      isDisabled: !!local.isDisabled,
      selectionMode: (local.selectionMode ?? "none") as SelectionMode,
    }),
  );

  const filteredDOMProps = createMemo(() =>
    filterDOMProps(domProps as Record<string, unknown>, { global: true }),
  );

  return (
    <ActionGroupContext.Provider value={{ state: state as ListState<ActionGroupItem> }}>
      <ActionGroupStateContext.Provider value={state as ListState<ActionGroupItem>}>
        <div
          {...filteredDOMProps()}
          {...actionGroupProps}
          ref={(el: HTMLDivElement) => {
            const refFn = (actionGroupProps as { ref?: (el: HTMLElement) => void }).ref;
            refFn?.(el);
          }}
          class={renderProps.class()}
          style={renderProps.style()}
          slot={local.slot}
          data-orientation={orientation()}
          data-disabled={local.isDisabled || undefined}
        >
          <For each={local.items}>
            {(item) => (
              <ActionGroupItemWrapper
                item={item}
                state={state as ListState<ActionGroupItem>}
                renderChild={
                  local.children as (
                    item: ActionGroupItem,
                    rp: ActionGroupItemRenderProps,
                  ) => JSX.Element
                }
              />
            )}
          </For>
        </div>
      </ActionGroupStateContext.Provider>
    </ActionGroupContext.Provider>
  );
}

interface ActionGroupItemWrapperProps {
  item: ActionGroupItem;
  state: ListState<ActionGroupItem>;
  renderChild: (item: ActionGroupItem, renderProps: ActionGroupItemRenderProps) => JSX.Element;
}

function ActionGroupItemWrapper(props: ActionGroupItemWrapperProps): JSX.Element {
  const { buttonProps } = createActionGroupItem(
    {
      get key() {
        return props.item.id;
      },
    },
    props.state,
  );

  const isFocused = () => props.state.focusedKey() === props.item.id;
  const isSelected = () => {
    const keys = props.state.selectedKeys();
    return keys === "all" || (keys instanceof Set && keys.has(props.item.id));
  };
  const isDisabled = () => props.state.isDisabled(props.item.id);

  const renderProps = createMemo<ActionGroupItemRenderProps>(() => ({
    isSelected: isSelected(),
    isDisabled: isDisabled(),
    isFocused: isFocused(),
  }));

  // splitProps (not object destructuring) so the reactive getters on buttonProps
  // — tabIndex (roving stop), onFocus (sets the focused key), role, aria-checked
  // — stay live. A rest-spread `{ ref, ...rest }` would FREEZE them at their
  // first-render values, pinning the roving tabIndex and killing focus tracking.
  const [, restButtonProps] = splitProps(buttonProps, ["ref"]);

  return (
    <button
      {...restButtonProps}
      data-selected={isSelected() || undefined}
      data-disabled={isDisabled() || undefined}
      data-focused={isFocused() || undefined}
    >
      {props.renderChild(props.item, renderProps())}
    </button>
  );
}

export function useActionGroupContext(): ActionGroupContextValue | null {
  return useContext(ActionGroupContext);
}
