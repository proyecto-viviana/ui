/*
 * Copyright 2023 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

// Ported to SolidJS for Proyecto Viviana; based on packages/react-aria/src/steplist/useStepList.ts
// Ported to SolidJS for Proyecto Viviana; based on packages/react-aria/src/steplist/useStepListItem.ts

/**
 * ARIA hooks for StepList components.
 * Provides accessible step list and step item props with container key navigation.
 */

import type { JSX } from "@solidjs/web";
import type { StepListState, Key } from "@proyecto-viviana/solid-stately";
import { createSelectableList } from "../selection/createSelectableList";
import { createSelectableItem, type SelectableItemState } from "../selection/createSelectableItem";
import { filterDOMProps } from "../utils/filterDOMProps";
import { mergeProps } from "../utils/mergeProps";

export interface AriaStepListProps {
  /** Accessible label for the step list. */
  "aria-label"?: string;
  /** ID of element that labels the step list. */
  "aria-labelledby"?: string;
  /** Primary orientation of the step list items. @default "vertical" */
  orientation?: "vertical" | "horizontal";
  /** Whether typeahead navigation is disabled. @default false */
  disallowTypeAhead?: boolean;
  /** Ref accessor for the step list container element. */
  ref?: () => HTMLElement | null;
}

export interface StepListAria {
  /** Props for the step list container element. */
  stepListProps: JSX.HTMLAttributes<HTMLOListElement>;
  /** Props for the step list container element (matching upstream listProps). */
  listProps: JSX.HTMLAttributes<HTMLOListElement>;
}

/**
 * Creates ARIA props for a step list container with keyboard navigation.
 */
export function createStepList(
  props: AriaStepListProps,
  state: StepListState,
  ref?: () => HTMLElement | null,
): StepListAria {
  const listRef = () => ref?.() ?? props.ref?.() ?? null;

  const selectableList = createSelectableList({
    selectionManager: state.selectionManager,
    ref: listRef,
    allowsTabNavigation: true,
    orientation: props.orientation ?? "vertical",
    disallowTypeAhead: props.disallowTypeAhead ?? false,
  });

  const domProps = () =>
    filterDOMProps(props as unknown as Record<string, unknown>, { labelable: true });

  const mergedProps = mergeProps(selectableList.listProps as Record<string, unknown>, domProps(), {
    get "aria-label"() {
      return props["aria-label"] ?? "Step List";
    },
    get "aria-labelledby"() {
      return props["aria-labelledby"];
    },
  }) as JSX.HTMLAttributes<HTMLOListElement>;

  Object.defineProperty(mergedProps, "tabIndex", {
    enumerable: true,
    configurable: true,
    get: () => undefined,
  });

  return {
    get stepListProps() {
      return mergedProps;
    },
    get listProps() {
      return mergedProps;
    },
  };
}

export interface AriaStepProps {
  /** The key of this step. */
  key: Key;
  /** Ref accessor for the step link element. */
  ref?: () => HTMLElement | null;
}

export interface StepAria {
  /** Props for the step element (anchor/link). */
  stepProps: JSX.HTMLAttributes<HTMLAnchorElement>;
  /** Accessible text describing the step state. */
  stepStateText: string;
}

export type AriaStepListItemProps = AriaStepProps;
export type StepListItemAria = StepAria;

/**
 * Creates ARIA props for an individual step within a step list.
 */
export function createStep(
  props: AriaStepProps,
  state: StepListState,
  ref?: () => HTMLElement | null,
): StepAria {
  const itemRef = () => ref?.() ?? props.ref?.() ?? null;
  const isSelected = () => state.selectedKey() === props.key;
  const isCompleted = () => state.isCompleted(props.key);
  const selectable = () => state.isSelectable(props.key);
  const isDisabled = () => !selectable();

  const { itemProps } = createSelectableItem(
    {
      get key() {
        return props.key;
      },
      get isDisabled() {
        return isDisabled();
      },
    },
    state as unknown as SelectableItemState<unknown>,
    itemRef,
  );

  const getStepStateText = (): string => {
    if (isSelected()) return "Current";
    if (isCompleted()) return "Completed";
    return "Not completed";
  };

  const stepProps = mergeProps(itemProps as Record<string, unknown>, {
    role: "link" as const,
    get "aria-current"() {
      return isSelected() ? ("step" as const) : undefined;
    },
    get "aria-disabled"() {
      return isDisabled() ? ("true" as const) : undefined;
    },
    get tabIndex() {
      return selectable() ? 0 : undefined;
    },
  }) as JSX.HTMLAttributes<HTMLAnchorElement>;

  return {
    get stepProps() {
      return stepProps;
    },
    get stepStateText() {
      return getStepStateText();
    },
  };
}

export const createStepListItem = createStep;
