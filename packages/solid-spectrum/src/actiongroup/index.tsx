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

// Ported to SolidJS for Proyecto Viviana; based on packages/@adobe/react-spectrum/src/actiongroup/ActionGroup.tsx
// Ported to SolidJS for Proyecto Viviana; based on packages/@react-spectrum/s2/src/ActionButtonGroup.tsx
// Ported to SolidJS for Proyecto Viviana; based on packages/@react-spectrum/s2/src/SegmentedControl.tsx
// Ported to SolidJS for Proyecto Viviana; based on packages/@react-spectrum/s2/src/ToggleButtonGroup.tsx

// Port of @react-spectrum source: https://github.com/adobe/react-spectrum/blob/5ecb3333001313e83898cd07644227897e3bae1f/packages/@adobe/react-spectrum/src/actiongroup/ActionGroup.tsx.
// Port of packages/@react-spectrum/s2/src/ActionButtonGroup.tsx.
// Port of packages/@react-spectrum/s2/src/SegmentedControl.tsx.
// Port of packages/@react-spectrum/s2/src/ToggleButtonGroup.tsx.
import { type JSX, splitProps } from "solid-js";
import {
  ActionGroup as HeadlessActionGroup,
  type ActionGroupProps as HeadlessActionGroupProps,
  type ActionGroupRenderProps,
  type ActionGroupItemRenderProps,
  type ActionGroupItem,
} from "@proyecto-viviana/solidaria-components";
import type { Key, SelectionMode } from "@proyecto-viviana/solid-stately";
import type { StyleString } from "../style";
import { baseColor, css, focusRing, style } from "../style" with { type: "macro" };
import { mergeStyles } from "../style/runtime";
import { useProviderProps } from "../provider";

export interface ActionGroupProps<T extends ActionGroupItem = ActionGroupItem> {
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
  /** Optional render function for action items. */
  children?: (item: T, renderProps: ActionGroupItemRenderProps) => JSX.Element;
  /** Custom render function for items. If not provided, uses item.label. */
  renderItem?: (item: T, renderProps: ActionGroupItemRenderProps) => JSX.Element;
  /** Spectrum-defined generated classes. */
  styles?: StyleString;
  /** Additional CSS class name. Use only as a last resort. */
  class?: string;
}

// S2 style macro (Tailwind-removal Phase 0). S2 1.5.x ships no ActionGroup
// component (it was split into ActionButtonGroup / ToggleButtonGroup /
// SegmentedControl), so there is no upstream ActionGroup paint to mirror
// verbatim; these styles reuse the shared S2 idiom of those siblings — a
// bordered pill container of ActionButton-like items — expressed through the
// same `style` macro tokens rather than the invented Tailwind vocabulary.
const actionGroupContainer = style<{ orientation: "horizontal" | "vertical" }>({
  display: "inline-flex",
  alignItems: "center",
  gap: 4,
  flexDirection: {
    orientation: {
      horizontal: "row",
      vertical: "column",
    },
  },
  borderRadius: "lg",
  borderWidth: 1,
  borderStyle: "solid",
  borderColor: "gray-300",
  backgroundColor: "base",
  padding: 4,
});

// The headless collection owns the native buttons and exposes only a root
// class hook. Reset their user-agent paint through the style macro's
// descendant escape hatch so the item spans below remain the sole S2 paint
// source. Without this, Chromium's dark ButtonFace sits behind the item text.
const actionGroupNativeButtons = css(`
  & > button {
    appearance: none;
    margin: 0;
    padding: 0;
    border: 0;
    background: transparent;
    color: inherit;
    font: inherit;
  }
`) as StyleString;

const actionGroupItem = style<ActionGroupItemRenderProps>({
  ...focusRing(),
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  whiteSpace: "nowrap",
  userSelect: "none",
  paddingX: 12,
  paddingY: 4,
  borderRadius: "default",
  fontSize: "ui-sm",
  transition: "default",
  cursor: {
    default: "default",
    isDisabled: "not-allowed",
  },
  color: {
    default: baseColor("neutral-subdued"),
    isSelected: "white",
    isDisabled: "disabled",
  },
  backgroundColor: {
    default: "transparent",
    isSelected: "accent",
  },
});

export function ActionGroup<T extends ActionGroupItem = ActionGroupItem>(
  props: ActionGroupProps<T>,
): JSX.Element {
  const mergedProps = useProviderProps(props);
  const [local, headlessProps] = splitProps(mergedProps, [
    "class",
    "styles",
    "renderItem",
    "children",
  ]);

  const containerClass = (rp: ActionGroupRenderProps): string =>
    [
      local.class,
      mergeStyles(
        actionGroupContainer({ orientation: rp.orientation }) as StyleString,
        actionGroupNativeButtons,
        local.styles,
      ),
    ]
      .filter(Boolean)
      .join(" ");

  return (
    <HeadlessActionGroup<T>
      {...(headlessProps as HeadlessActionGroupProps<T>)}
      class={containerClass}
    >
      {(item: T, renderProps: ActionGroupItemRenderProps) => (
        <span class={actionGroupItem(renderProps)}>
          {local.renderItem
            ? local.renderItem(item, renderProps)
            : local.children
              ? local.children(item, renderProps)
              : item.label}
        </span>
      )}
    </HeadlessActionGroup>
  );
}
