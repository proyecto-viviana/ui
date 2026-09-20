# @proyecto-viviana/solidaria

A Solid port of Adobe's React Aria: the behavior layer. Its hooks give you
ARIA attributes, press, hover, focus, keyboard, and internationalization, and
leave every element and every class to you.

If you know React Aria, the shape is the same: `createButton` where upstream
has `useButton`. Solid's hooks return accessors where React's return values.

## Install

Requires **Solid 2**. `solid-js` and `@solidjs/web` are peer dependencies, at
`>=2.0.0-rc.9 <3`.

```bash
npm install @proyecto-viviana/solidaria@rc solid-js@next @solidjs/web@next
```

The release candidate is on the `rc` tag. The `latest` tag is the Solid 1
line.

## Example

Spread the returned props onto the exact element that owns the role.

```tsx
import { createButton } from "@proyecto-viviana/solidaria";

export function Button(props: { onPress?: () => void; children?: string }) {
  const { buttonProps, isPressed } = createButton(props);

  return (
    <button {...buttonProps} data-pressed={isPressed() || undefined}>
      {props.children}
    </button>
  );
}
```

## In the chain

```text
solid-stately
      ↓
solidaria            ← you are here
      ↓
solidaria-components
      ↓
solid-spectrum · @proyecto-viviana/ui · kumo · geist
```

It depends on `@proyecto-viviana/solid-stately` and the
`@internationalized/*` packages.

## Status

Published, and part of a port that is not finished. An export is a floor, not
proof that a behavior matches upstream.
[`src/index.ts`](src/index.ts) is the only source of truth for the public
surface.

## Evidence

```bash
vp run --filter @proyecto-viviana/solidaria build
vp run test:run
vp run guard:rac-export-gap
```

A behavior change carries tests that assert ARIA attributes, focus movement,
keyboard behavior, and event semantics. What "ported" means here is
[the evidence bar](https://github.com/proyecto-viviana/ui/blob/main/.claude/current/certification.md).

## Links

- Documentation: <https://ui.proyectoviviana.org>
- Repository: <https://github.com/proyecto-viviana/ui>

## License

MIT AND Apache-2.0. Our work is MIT; the port of Adobe's React Aria keeps
Apache-2.0. A ported Microsoft Tabster file keeps its MIT notice. All of them
ship in this package's `NOTICE`.
