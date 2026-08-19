# `@proyecto-viviana/kumo`

This package is an experiment. It brings the Cloudflare Kumo API to Solid.

Do not trust parity claims for this package yet. The package has rough edges and an incomplete API.

## Architecture

The package is a styled layer. It is a sibling of `solid-spectrum` and `@proyecto-viviana/ui`.

The package uses `solidaria-components` for headless behavior. It does not copy press, focus, keyboard, or disabled logic.

```text
solid-stately → solidaria → solidaria-components
                                     ├─ solid-spectrum
                                     ├─ @proyecto-viviana/ui
                                     └─ @proyecto-viviana/kumo
```

## Install

Install the package and Solid.

```bash
npm install @proyecto-viviana/kumo solid-js
```

Import the CSS once at the application entry.

```tsx
import { Button } from "@proyecto-viviana/kumo";
import "@proyecto-viviana/kumo/styles.css";

export function SaveButton() {
  return (
    <Button variant="primary" loading={false} onClick={() => save()}>
      Save
    </Button>
  );
}
```

Wrap each Kumo surface in `data-theme="kumo"`. This scopes the Kumo tokens so
they do not change another styled library on the same page.

```tsx
<div data-theme="kumo">
  <SaveButton />
</div>
```

You can also use the Kumo deep import.

```tsx
import { Button } from "@proyecto-viviana/kumo/components/button";
```

Set `data-mode="dark"` on the Kumo surface, or on an ancestor, to use the dark
tokens.

## Initial Button contract

The first slice uses these Kumo props:

- `variant`: `primary`, `secondary`, `ghost`, `destructive`, `secondary-destructive`, or `outline`.
- `size`: `xs`, `sm`, `base`, or `lg`.
- `shape`: `base`, `square`, or `circle`.
- `loading`: Show a loader and disable the button.
- `icon`: Give an icon component or a Solid element.
- `onClick`: Use the native Kumo event name.
- `className`: Add CSS classes after the package classes.
- `ref`: Use a Solid callback ref. React mutable ref objects are not supported.

A square or circle button requires `aria-label` or `aria-labelledby`.

Use `solidaria-components` directly when you need the headless API. That API includes `onPress`, render props, slots, and data attributes.

## Evidence and limits

The current source reference is `@cloudflare/kumo@2.11.0`. Kumo 2.11.0 leaves
Button unchanged from 2.10.0; its Badge, LinkButton, Table, and Sidebar changes
are outside this one-component experiment.

The tests cover native props, pointer input, keyboard input, disabled behavior, loading behavior, form participation, icons, variants, sizes, shapes, callback refs, and styles. The comparison experiment at `/experiments/kumo-button/` runs a paired Playwright spec against `@cloudflare/kumo@2.11.0` for names, click, keyboard, disabled/loading, form submit, tab order, SSR/hydration, and rest computed paint.

This evidence does not prove Kumo parity. Hover, pressed, and keyboard-focus visual branches are still open. Token fallbacks for `--color-neutral-900` are a classified rest-paint difference, not a silent pass.

The first slice does not include:

- `buttonVariants`
- the `title` tooltip API
- `LinkButton`
- `RefreshButton`
- the public `Loader`
- other Kumo components

Do not call this component ported or certified. Add the missing evidence before you change that status.

## License

Proyecto Viviana code uses the MIT license. Kumo-derived code and values keep the Cloudflare MIT notice in `LICENSE-CLOUDFLARE`.
