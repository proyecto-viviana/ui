# @proyecto-viviana/solidaria-components

A Solid port of Adobe's React Aria Components: accessible components with no
styling. Each one ships the markup, the ARIA, and the interaction; you supply
every class.

Use this when you want to own the look completely. If you want components that
already look like something, use a styled sibling instead.

## Install

Requires **Solid 2**. `solid-js` and `@solidjs/web` are peer dependencies, at
`>=2.0.0-rc.9 <3`.

```bash
npm install @proyecto-viviana/solidaria-components@rc solid-js@next @solidjs/web@next
```

The release candidate is on the `rc` tag. The `latest` tag is the Solid 1
line.

## Example

Style with classes, data attributes, or a render-prop child. Render-prop
fields are plain booleans, not accessors — read `isPressed`, do not call it.

```tsx
import { Button } from "@proyecto-viviana/solidaria-components";

export function SaveButton(props: { onSave: () => void }) {
  return (
    <Button class="button" onPress={props.onSave}>
      {(render) => (
        <span
          data-pressed={render.isPressed || undefined}
          data-focus-visible={render.isFocusVisible || undefined}
        >
          Save
        </span>
      )}
    </Button>
  );
}
```

## In the chain

```text
solid-stately
      ↓
solidaria
      ↓
solidaria-components   ← you are here
      ↓
solid-spectrum · @proyecto-viviana/ui · kumo · geist
```

It depends on `@proyecto-viviana/solidaria` and
`@proyecto-viviana/solid-stately`. Every styled package in the family is built
on this one.

## Status

Published, and part of a port that is not finished. An export is a floor, not
proof that a component matches upstream.
[`src/index.ts`](src/index.ts) is the only source of truth for the public
surface — this file does not list exports, and no README carries a count.

What this release candidate is known to get wrong is listed under
[known gaps](https://github.com/proyecto-viviana/ui#known-gaps-in-this-release-candidate).

## Evidence

```bash
vp run guard:rac-parity
vp run guard:rac-export-gap
vp run --filter @proyecto-viviana/solidaria-components build
vp run test:run
```

`guard:rac-export-gap` allows only the ticketed pending upstream names in
`scripts/rac-export-gap-pending.json`; an unlisted missing name fails. Extra
Solid exports are our own API and are declared in a changeset. What "ported"
means here is [the evidence bar](https://github.com/proyecto-viviana/ui/blob/main/.claude/current/certification.md).

## Links

- Documentation: <https://ui.proyectoviviana.org>
- Repository: <https://github.com/proyecto-viviana/ui>

## License

MIT AND Apache-2.0. Our work is MIT; the port of Adobe's React Aria Components
keeps Apache-2.0. Both licenses and the project `NOTICE` ship in this package.
