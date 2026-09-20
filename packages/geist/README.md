# @proyecto-viviana/geist

Vercel's Geist look for Solid. It is an experiment: one component, Button,
shaped by the public Geist docs on top of our headless layer.

Not affiliated with Vercel. `@vercel/geistcn` is not on public npm, so this is
not a port of it — the API names and rest values follow
<https://vercel.com/geist/button>.

## Install

**This package is not published.** The workspace version is `0.0.0` and the
npm name `@proyecto-viviana/geist` is not registered;
`npm install @proyecto-viviana/geist` fails.

Build it from the repository instead:

```bash
vp install
vp run build:geist
```

When it is published it will require **Solid 2**, like every package here:
`solid-js` and `@solidjs/web` at `>=2.0.0-rc.9 <3`.

## Example

```tsx
import { Button } from "@proyecto-viviana/geist";

import "@proyecto-viviana/geist/styles.css";

export function SaveButton(props: { onSave: () => void }) {
  return (
    <div data-theme="geist">
      <Button variant="default" onClick={props.onSave}>
        Save
      </Button>
    </div>
  );
}
```

Every Geist surface is wrapped in `data-theme="geist"`. That scopes the tokens
so they do not restyle another library on the same page. Add
`data-mode="dark"` on the surface or an ancestor for the dark tokens.

`@proyecto-viviana/geist/components/button` is the deep import.

## The Button contract

Geist's own prop names, not ours:

- `variant`: `default`, `error`, `warning`, `secondary`, `tertiary`.
  Defaults to `default`.
- `size`: `tiny`, `small`, `medium`, `large`.
- `shape`: `square`, `circle`, `rounded`.
- `svgOnly`: icon-only. Requires `aria-label` — the type enforces it.
- `loading`: show a spinner.
- `prefix`, `suffix`: content around the label.
- `shadow`: the marketing shadow, usually with `shape="rounded"`.
- `onClick`, `className`: the native names.
- `ref`: a Solid callback ref.

Not in this slice: `ButtonLink`, `CustomButton`, `typeName` (the HTML `type`
stays on `type`), the `@vercel/geistcn-assets` icons, and the `geist` font
package. Use `@proyecto-viviana/solidaria-components` directly when you want
the headless API — `onPress`, render props, slots, and data attributes.

## In the chain

```text
solid-stately
      ↓
solidaria
      ↓
solidaria-components
      ↓
      ├─ solid-spectrum
      ├─ @proyecto-viviana/ui
      ├─ kumo
      └─ geist                   ← you are here
```

It depends on `@proyecto-viviana/solidaria-components` for behavior. It does
not reimplement press, focus, keyboard, disabled, or pending logic.

## Status

An experiment with incomplete evidence. This component is not ported and not
certified.

## Evidence

```bash
vp run test:run
```

What "ported" means here, and why that does not reach it, is
[the evidence bar](https://github.com/proyecto-viviana/ui/blob/main/.claude/current/certification.md).

## Links

- Documentation: <https://ui.proyectoviviana.org>
- Repository: <https://github.com/proyecto-viviana/ui>

## License

MIT. Visual rest values follow the public Geist docs. This package does not
copy `@vercel/geistcn`.
