# @proyecto-viviana/solid-stately

SolidJS port of React Stately state primitives.

This package is the state layer below `solidaria` and
`solidaria-components`. It owns controlled/uncontrolled state, collection
models, selection, date/time state, validation state, and related utilities.

## Install

```bash
npm install @proyecto-viviana/solid-stately solid-js
```

## Usage

```tsx
import { createToggleState } from "@proyecto-viviana/solid-stately";

export function Toggle(props) {
  const state = createToggleState({
    isSelected: props.isSelected,
    defaultSelected: props.defaultSelected,
    onChange: props.onChange,
  });

  return (
    <button aria-pressed={state.isSelected()} onClick={() => state.toggle()}>
      {props.children}
    </button>
  );
}
```

## Public Surface

The source of truth is [`src/index.ts`](src/index.ts). Keep this README focused
on package purpose and verification rather than duplicating the full export
list.

Major areas currently covered:

- toggles, checkbox groups, radio groups, and disclosure;
- overlays, tooltips, toasts, forms, and validation;
- collections, selection, menus, selects, combo boxes, tabs;
- grid, table, tree, list data, and async list helpers;
- date/time/calendar state and internationalized date helpers;
- number fields, search fields, sliders, and color state;
- drag-and-drop state and SSR utilities.

## Verification

```bash
vp run --filter @proyecto-viviana/solid-stately build
vp test run packages
```

State changes should include tests for controlled and uncontrolled use, default
values, callbacks, validation, and disabled/read-only behavior where applicable.
