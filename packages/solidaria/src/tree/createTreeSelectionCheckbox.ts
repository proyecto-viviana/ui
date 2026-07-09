/**
 * createTreeSelectionCheckbox - Provides accessibility for a tree item's selection checkbox.
 * Based on @react-aria/gridlist/useGridListSelectionCheckbox.
 */

import { createMemo, type Accessor } from "solid-js";
import type { JSX } from "solid-js";
import { createId } from "@proyecto-viviana/solid-stately";
import type { TreeState, TreeCollection } from "@proyecto-viviana/solid-stately";
import type { AriaTreeSelectionCheckboxProps, TreeSelectionCheckboxAria } from "./types";
import { getTreeData } from "./createTree";

/**
 * Creates accessibility props for a tree selection checkbox.
 */
export function createTreeSelectionCheckbox<
  T extends object,
  C extends TreeCollection<T> = TreeCollection<T>,
>(
  props: Accessor<AriaTreeSelectionCheckboxProps>,
  state: Accessor<TreeState<T, C>>,
): TreeSelectionCheckboxAria {
  const fallbackRowId = createId();
  const checkboxId = createId();

  // Mirror @react-aria/tree getRowId: the checkbox's aria-labelledby folds its own
  // "Select" label with the row's id so the SR announces "Select <row text>".
  const rowId = createMemo(() => {
    const treeData = getTreeData(state());
    return treeData ? `${treeData.treeId}-row-${String(props().key)}` : fallbackRowId;
  });

  const isSelected = createMemo(() => {
    const s = state();
    const p = props();
    return s.isSelected(p.key);
  });

  const isDisabled = createMemo(() => {
    const s = state();
    const p = props();
    return s.isDisabled(p.key);
  });

  const onChange = (e: Event) => {
    const s = state();
    const p = props();
    const target = e.target as HTMLInputElement;

    if (isDisabled()) return;

    if (target.checked) {
      s.toggleSelection(p.key);
    } else {
      s.toggleSelection(p.key);
    }
  };

  const onClick = (e: MouseEvent) => {
    // Stop propagation to prevent row click from also firing
    e.stopPropagation();
  };

  const checkboxProps = createMemo(() => {
    const baseProps: Record<string, unknown> = {
      type: "checkbox",
      id: checkboxId,
      "aria-label": "Select",
      "aria-labelledby": `${checkboxId} ${rowId()}`,
      checked: isSelected(),
      disabled: isDisabled(),
      onChange,
      onClick,
    };

    return baseProps as JSX.InputHTMLAttributes<HTMLInputElement>;
  });

  return {
    get checkboxProps() {
      return checkboxProps();
    },
  };
}
