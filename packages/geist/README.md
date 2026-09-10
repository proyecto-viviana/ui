# `@proyecto-viviana/geist`

This package is an experiment. It brings a Geist-shaped Button API to Solid.

Do not trust parity claims for this package yet. The package has rough
edges and an incomplete API. `@vercel/geistcn` is not on public npm, so
this slice is not a port.

## Architecture

The package is a styled layer. It is a sibling of `solid-spectrum`,
`@proyecto-viviana/ui`, and `@proyecto-viviana/kumo`.

The package uses `solidaria-components` for headless behavior. It does not
copy press, focus, keyboard, disabled, or pending logic.

```text
solid-stately → solidaria → solidaria-components
                                     ├─ solid-spectrum
                                     ├─ @proyecto-viviana/ui
                                     ├─ @proyecto-viviana/kumo
                                     └─ @proyecto-viviana/geist
```

## Install

Install the package and Solid.

```bash
npm install @proyecto-viviana/geist solid-js
```

Import the CSS once at the application entry.

```tsx
import { Button } from "@proyecto-viviana/geist";
import "@proyecto-viviana/geist/styles.css";

export function SaveButton() {
  return (
    <Button variant="default" onClick={() => save()}>
      Save
    </Button>
  );
}
```

Wrap each Geist surface in `data-theme="geist"`. This scopes the tokens so
they do not change another styled library on the same page.

```tsx
<div data-theme="geist">
  <SaveButton />
</div>
```

Set `data-mode="dark"` on the Geist surface, or on an ancestor, to use the
dark tokens.

## Initial Button contract

The first slice uses these documented Geist props:

- `variant`: `default`, `error`, `warning`, `secondary`, or `tertiary`.
- `size`: `tiny`, `small`, `medium`, or `large`.
- `shape`: `square`, `circle`, or `rounded`.
- `svgOnly`: icon-only. Requires `aria-label`.
- `loading`: Show a spinner. The button stays focusable.
- `prefix` / `suffix`: Content around the label.
- `shadow`: Marketing shadow, usually with `shape="rounded"`.
- `onClick`: Use the native event name.
- `className`: Add CSS classes after the package classes.
- `ref`: Use a Solid callback ref.

Use `solidaria-components` directly when you need the headless API. That
API includes `onPress`, render props, slots, and data attributes.

The first slice does not include:

- `ButtonLink`
- `CustomButton`
- `typeName` (HTML `type` stays on `type`)
- `@vercel/geistcn-assets` icons
- the `geist` font package

Do not call this component ported or certified.

## License

Proyecto Viviana code uses the MIT license. Visual rest values follow the
public Geist docs. This package does not copy `@vercel/geistcn`.
