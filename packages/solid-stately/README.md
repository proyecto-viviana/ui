# @proyecto-viviana/solid-stately

A Solid port of Adobe's React Stately: the state layer, with no DOM and no
styling. It owns controlled and uncontrolled state, collections, selection,
date and time state, and validation state.

This is the bottom of the chain. Use it directly only if you are building your
own behavior layer; most apps want a styled package instead.

## Install

Requires **Solid 2**. `solid-js` and `@solidjs/web` are peer dependencies, at
`>=2.0.0-rc.9 <3`.

```bash
npm install @proyecto-viviana/solid-stately@rc solid-js@next @solidjs/web@next
```

The release candidate is on the `rc` tag. The `latest` tag is the Solid 1
line.

## Example

State hooks return accessors, not values. Call them.

```tsx
import { createToggleState } from "@proyecto-viviana/solid-stately";

export function Toggle(props: {
  isSelected?: boolean;
  defaultSelected?: boolean;
  onChange?: (isSelected: boolean) => void;
  children?: string;
}) {
  const state = createToggleState(props);

  return (
    <button aria-pressed={state.isSelected()} onClick={() => state.toggle()}>
      {props.children}
    </button>
  );
}
```

## In the chain

```text
solid-stately        ← you are here
      ↓
solidaria
      ↓
solidaria-components
      ↓
solid-spectrum · @proyecto-viviana/ui · kumo · geist
```

It depends on `@internationalized/date` and `@internationalized/number`, and on
nothing else of ours.

## Status

Published, and part of a port that is not finished. An export is a floor, not
proof that a behavior matches upstream.
[`src/index.ts`](src/index.ts) is the only source of truth for the public
surface.

What this release candidate is known to get wrong is listed under
[known gaps](https://github.com/proyecto-viviana/ui#known-gaps-in-this-release-candidate).

## Evidence

```bash
vp run --filter @proyecto-viviana/solid-stately build
vp run test:run
```

A state change carries tests for controlled and uncontrolled use, defaults,
callbacks, validation, and disabled or read-only behavior. What "ported" means
here is [the evidence bar](https://github.com/proyecto-viviana/ui/blob/main/.claude/current/certification.md).

## Links

- Documentation: <https://ui.proyectoviviana.org>
- Repository: <https://github.com/proyecto-viviana/ui>

## License

MIT AND Apache-2.0. Our work is MIT; the port of Adobe's React Stately keeps
Apache-2.0. Both licenses and the project `NOTICE` ship in this package.
