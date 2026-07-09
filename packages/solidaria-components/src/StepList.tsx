/**
 * StepList component for solidaria-components
 *
 * A pre-wired headless step list component that combines state + aria hooks.
 * Renders an ordered list of steps with completion tracking.
 */

import { type JSX, createContext, createMemo, splitProps, useContext, For } from "solid-js";
import {
  createStepListState,
  type StepListState,
  type StepListStateProps,
  type Key,
} from "@proyecto-viviana/solid-stately";
import { createStepList, type AriaStepListProps } from "@proyecto-viviana/solidaria";
import {
  type ClassNameOrFunction,
  type StyleOrFunction,
  useRenderProps,
  filterDOMProps,
} from "./utils";

export interface StepListItemRenderProps {
  /** Whether this step is currently selected. */
  isSelected: boolean;
  /** Whether this step is completed. */
  isCompleted: boolean;
  /** Whether this step is disabled. */
  isDisabled: boolean;
  /** Whether this step can be selected. */
  isSelectable: boolean;
  /** The 1-based step number. */
  stepNumber: number;
  /** Accessible text describing the step state. */
  stepStateText: string;
}

export interface StepListRenderProps {
  /** Whether the step list is disabled. */
  isDisabled: boolean;
}

export interface StepListProps<T extends { key: Key; label: string }> extends AriaStepListProps {
  /** The step items. */
  items: T[];
  /** The currently selected step key (controlled). */
  selectedKey?: Key;
  /** The default selected step key (uncontrolled). */
  defaultSelectedKey?: Key;
  /** Called when the selected step changes. */
  onSelectionChange?: (key: Key) => void;
  /** The last completed step key (controlled). */
  lastCompletedStep?: Key;
  /** The default last completed step key (uncontrolled). */
  defaultLastCompletedStep?: Key;
  /** Called when last completed step changes. */
  onLastCompletedStepChange?: (key: Key | null) => void;
  /** Whether all steps are disabled. */
  isDisabled?: boolean;
  /** Whether all steps are read-only. */
  isReadOnly?: boolean;
  /** Keys of individually disabled steps. */
  disabledKeys?: Iterable<Key>;
  /** Render function for each step item. */
  children: (item: T, state: StepListItemRenderProps) => JSX.Element;
  /** The CSS className for the element. */
  class?: ClassNameOrFunction<StepListRenderProps>;
  /** The inline style for the element. */
  style?: StyleOrFunction<StepListRenderProps>;
}

export interface StepProps {
  /** The step item. */
  item: { key: Key; label: string };
  /** The 1-based step number. */
  stepNumber: number;
  /** The children to render inside the step. */
  children?: JSX.Element;
  /** The CSS className for the element. */
  class?: string;
  /** The inline style for the element. */
  style?: JSX.CSSProperties;
}

export const StepListStateContext = createContext<StepListState | null>(null);
export const StepListContext = createContext<{} | null>(null);

export function useStepListState(): StepListState {
  const ctx = useContext(StepListStateContext);
  if (!ctx) throw new Error("useStepListState must be used within a StepList");
  return ctx;
}

/**
 * StepList displays a sequence of steps with completion tracking and selection.
 */
export function StepList<T extends { key: Key; label: string }>(
  props: StepListProps<T>,
): JSX.Element {
  const [local, ariaProps, domRest] = splitProps(
    props,
    [
      "items",
      "selectedKey",
      "defaultSelectedKey",
      "onSelectionChange",
      "lastCompletedStep",
      "defaultLastCompletedStep",
      "onLastCompletedStepChange",
      "isDisabled",
      "isReadOnly",
      "disabledKeys",
      "children",
      "class",
      "style",
    ],
    ["aria-label", "aria-labelledby"],
  );

  const stateProps = createMemo<StepListStateProps>(() => ({
    items: local.items,
    selectedKey: local.selectedKey,
    defaultSelectedKey: local.defaultSelectedKey,
    onSelectionChange: local.onSelectionChange,
    lastCompletedStep: local.lastCompletedStep,
    defaultLastCompletedStep: local.defaultLastCompletedStep,
    onLastCompletedStepChange: local.onLastCompletedStepChange,
    isDisabled: local.isDisabled,
    isReadOnly: local.isReadOnly,
    disabledKeys: local.disabledKeys,
  }));

  const state = createStepListState(stateProps());

  // Create ARIA props
  const { stepListProps } = createStepList(
    {
      get "aria-label"() {
        return ariaProps["aria-label"];
      },
      get "aria-labelledby"() {
        return ariaProps["aria-labelledby"];
      },
    },
    state,
  );

  const renderValues = createMemo<StepListRenderProps>(() => ({
    isDisabled: state.isDisabled(),
  }));

  const renderProps = useRenderProps(
    {
      class: local.class,
      style: local.style,
      defaultClassName: "solidaria-StepList",
    },
    renderValues,
  );

  const domProps = createMemo(() =>
    filterDOMProps(domRest as Record<string, unknown>, { global: true }),
  );

  return (
    <StepListStateContext.Provider value={state}>
      <ol
        {...stepListProps}
        {...domProps()}
        class={renderProps.class()}
        style={renderProps.style()}
        data-disabled={state.isDisabled() || undefined}
      >
        <For each={local.items}>
          {(item, index) => {
            const stepNumber = () => index() + 1;

            // Build render props as a static snapshot for the initial render.
            const renderProps: StepListItemRenderProps = {
              get isSelected() {
                return state.selectedKey() === item.key;
              },
              get isCompleted() {
                return state.isCompleted(item.key);
              },
              get isDisabled() {
                return state.isDisabled() || !state.isSelectable(item.key);
              },
              get isSelectable() {
                return state.isSelectable(item.key);
              },
              get stepNumber() {
                return stepNumber();
              },
              get stepStateText() {
                if (state.selectedKey() === item.key) return "Current";
                if (state.isCompleted(item.key)) return "Completed";
                return "Not completed";
              },
            };

            return local.children(item, renderProps);
          }}
        </For>
      </ol>
    </StepListStateContext.Provider>
  );
}

/**
 * Step represents an individual step within a StepList.
 * Renders as an `<li>` wrapping an `<a>` with accessible step props.
 */
export function Step(props: StepProps): JSX.Element {
  const [local, domProps] = splitProps(props, ["item", "stepNumber", "children", "class", "style"]);

  const state = useStepListState();

  const isSelected = () => state.selectedKey() === local.item.key;
  const isCompleted = () => state.isCompleted(local.item.key);
  const selectable = () => state.isSelectable(local.item.key);

  const handleClick = (e: MouseEvent) => {
    e.preventDefault();
    if (selectable()) {
      state.setSelectedKey(local.item.key);
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "ArrowUp" || e.key === "ArrowDown") {
      e.preventDefault();
      return;
    }
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (selectable()) {
        state.setSelectedKey(local.item.key);
      }
    }
  };

  return (
    <li
      {...domProps}
      class={local.class}
      style={local.style}
      data-selected={isSelected() || undefined}
      data-completed={isCompleted() || undefined}
      data-disabled={!selectable() || undefined}
      data-selectable={selectable() || undefined}
    >
      <a
        role="link"
        aria-current={isSelected() ? "step" : undefined}
        aria-disabled={!selectable() ? true : undefined}
        tabIndex={selectable() ? 0 : undefined}
        onClick={handleClick}
        on:keydown={handleKeyDown}
      >
        {local.children}
      </a>
    </li>
  );
}
