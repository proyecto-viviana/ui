# @proyecto-viviana/solidaria-components

SolidJS port of React Aria Components: unstyled, accessible components built on
`@proyecto-viviana/solidaria` and `@proyecto-viviana/solid-stately`.

This package is still part of a parity port. Do not treat export coverage as a
production readiness guarantee.

## Install

```bash
npm install @proyecto-viviana/solidaria-components solid-js
```

## Usage

```tsx
import { Button } from "@proyecto-viviana/solidaria-components";

export function SaveButton() {
  return <Button onPress={() => save()}>Save</Button>;
}
```

Components are headless. Style them with classes, data attributes, and render
props.

```tsx
import { Button } from "@proyecto-viviana/solidaria-components";

export function ToolbarButton() {
  return (
    <Button class="button">
      {({ isPressed, isFocusVisible }) => (
        <span
          data-pressed={isPressed() || undefined}
          data-focus-visible={isFocusVisible() || undefined}
        >
          Save
        </span>
      )}
    </Button>
  );
}
```

## Current Parity Evidence

As of the 2026-05-12 local report:

- `vp run guard:rac-export-gap` reports `0` missing React Aria Components named
  exports.
- `vp run guard:rac-parity` reports no missing required tracked symbols.
- The package has extra Solid exports and aliases compared with upstream RAC.
  Treat those as local API and document intentional additions in changesets.

The barrel in [`src/index.ts`](src/index.ts) is the source of truth for the
current public surface. This README intentionally does not duplicate the full
export list.

## Verification

```bash
vp run guard:rac-parity
vp run guard:rac-export-gap
vp run --filter @proyecto-viviana/solidaria-components build
vp test run packages
```

When changing behavior, add focused tests under `test/` that use semantic
queries and user-like interactions rather than implementation markers alone.
