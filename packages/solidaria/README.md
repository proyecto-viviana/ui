# @proyecto-viviana/solidaria

SolidJS port of React Aria hooks and accessibility behavior primitives.

This package is the behavior layer below `solidaria-components`. It provides
hooks such as `createButton`, `createPress`, `createListBox`, `createSelect`,
`createDatePicker`, `createCalendar`, `createTable`, and drag-and-drop helpers.

## Install

```bash
npm install @proyecto-viviana/solidaria @proyecto-viviana/solid-stately solid-js
```

## Usage

```tsx
import { createButton } from "@proyecto-viviana/solidaria";

export function Button(props) {
  let ref!: HTMLButtonElement;
  const { buttonProps, isPressed } = createButton(props, () => ref);

  return (
    <button {...buttonProps} ref={ref} data-pressed={isPressed() || undefined}>
      {props.children}
    </button>
  );
}
```

Most hooks return prop objects and reactive state accessors. Spread the returned
props onto the exact element that owns the ARIA role or interaction.

## Public Surface

The source of truth is [`src/index.ts`](src/index.ts). Keep README examples
small; use tests and the barrel for the actual export inventory.

Major areas currently covered:

- interactions: press, hover, focus, long press, move, keyboard;
- labels and fields;
- overlays, modal behavior, popovers, and focus scope;
- buttons, toggles, links, forms, and validation;
- collection widgets: listbox, menu, select, combo box, grid, table, tree;
- date, time, calendar, and date picker primitives;
- color, drag-and-drop, landmarks, i18n, SSR, and visually hidden utilities.

## Verification

```bash
vp run --filter @proyecto-viviana/solidaria build
vp test run packages
vp run guard:rac-export-gap
```

Behavior changes need tests that assert ARIA attributes, focus movement,
keyboard behavior, and user-visible event semantics.
