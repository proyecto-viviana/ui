# @proyecto-viviana/kumo

Cloudflare's Kumo look for Solid. It is an experiment: one component, Button,
with the Kumo API and Kumo's visual values on top of our headless layer.

Not affiliated with Cloudflare. Do not treat it as a Kumo port.

## Install

**This package is not published.** The workspace version is `0.0.0`. The npm
name `@proyecto-viviana/kumo` holds a reserved `0.0.0-bootstrap.0` that is a
name reservation, not this code — installing it does not get you this package.

Build it from the repository instead:

```bash
vp install
vp run build:kumo
```

When it is published it will require **Solid 2**, like every package here:
`solid-js` and `@solidjs/web` at `>=2.0.0-rc.9 <3`.

## Example

```tsx
import { Button } from "@proyecto-viviana/kumo";

import "@proyecto-viviana/kumo/styles.css";

export function SaveButton(props: { onSave: () => void }) {
  return (
    <div data-theme="kumo">
      <Button variant="primary" onClick={props.onSave}>
        Save
      </Button>
    </div>
  );
}
```

Every Kumo surface is wrapped in `data-theme="kumo"`. That scopes the Kumo
tokens so they do not restyle another library on the same page. Add
`data-mode="dark"` on the surface or an ancestor for the dark tokens.

`@proyecto-viviana/kumo/components/button` is the deep import.

## The Button contract

Kumo's own prop names, not ours:

- `variant`: `primary`, `secondary`, `ghost`, `destructive`,
  `secondary-destructive`, `outline`. Defaults to `secondary`.
- `size`: `xs`, `sm`, `base`, `lg`.
- `shape`: `base`, `square`, `circle`. A square or circle button requires
  `aria-label` or `aria-labelledby` — the type enforces it.
- `loading`: show a loader and disable the button.
- `icon`: an icon component or a Solid element.
- `onClick`, `className`: the native Kumo names.
- `ref`: a Solid callback ref. React mutable ref objects are not supported.

Not in this slice: `buttonVariants`, the `title` tooltip API, `LinkButton`,
`RefreshButton`, the public `Loader`, and every other Kumo component. Use
`@proyecto-viviana/solidaria-components` directly when you want the headless
API — `onPress`, render props, slots, and data attributes.

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
      ├─ kumo                    ← you are here
      └─ geist
```

It depends on `@proyecto-viviana/solidaria-components` for behavior. It does
not reimplement press, focus, keyboard, or disabled logic.

## Status

An experiment with incomplete parity evidence. The source reference is
`@cloudflare/kumo@2.11.0`. Hover, pressed, and keyboard-focus visual branches
are open; the `--color-neutral-900` token fallback is a classified rest-paint
difference, not a silent pass. This component is not ported and not certified.

## Evidence

```bash
vp run test:run                  # native props, input, forms, variants, refs
vp run comparison:dev   # /experiments/kumo-button/, paired vs Kumo 2.11.0
```

What "ported" means here, and why none of the above reaches it, is
[the evidence bar](https://github.com/proyecto-viviana/ui/blob/main/.claude/current/certification.md).

## Links

- Documentation: <https://ui.proyectoviviana.org>
- Repository: <https://github.com/proyecto-viviana/ui>

## License

MIT. Kumo-derived code and values keep the Cloudflare MIT notice in
`LICENSE-CLOUDFLARE`.
