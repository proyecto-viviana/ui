---
"@proyecto-viviana/solid-spectrum": minor
---

Remove invented Picker/TreeView props to restore upstream parity (breaking)

`Picker` and `TreeView` each carried a small set of props that have no
counterpart in React Spectrum S2. They are removed so the public API matches
upstream exactly (parity is the rule):

- **Picker** — dropped the legacy controlled-value aliases `value`,
  `defaultValue`, and `onChange`, along with the `PickerValue` type and the
  internal `value`⇄key translation helpers. Use the real S2 selection props
  instead: `selectedKey`/`defaultSelectedKey`/`onSelectionChange` for single
  selection and `selectedKeys`/`defaultSelectedKeys`/`onSelectionChangeKeys` for
  `selectionMode="multiple"`. The real S2 `renderValue` prop is unchanged.
- **TreeView** — dropped the invented `overflowMode` prop (and the
  `TreeOverflowMode` type and `data-overflow-mode` attribute). S2's TreeView has
  no overflow mode; the tree label/description now always truncate, matching
  upstream. The real S2 props `onAction`, `renderActionBar`, and `selectionStyle`
  are unchanged. (`GridList`/`ListView`/`Table` keep their own legitimate
  `overflowMode` — only the tree's invented copy is gone.)

Migration: replace `value`/`defaultValue`/`onChange` on `Picker` with the
matching `selectedKey*`/`onSelectionChange*` props, and remove `overflowMode`
from any `TreeView` usage.
