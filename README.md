# Viviana UI

Accessible UI components for [Solid](https://solidjs.com) 2.

The behavior is a port of Adobe's React Aria family: the state, ARIA, keyboard,
focus, and internationalization work those libraries are known for, rebuilt on
Solid's signals. Styled libraries sit on top. Take one of them, or take the
headless layers and bring your own look.

If you know React Aria, you already know the shape. `useButton` is
`createButton`, and hooks return accessors where React's return values.

Not affiliated with Adobe, Cloudflare, or Vercel.

## Quick start

```bash
npm install @proyecto-viviana/ui@rc solid-js@next @solidjs/web@next
```

```tsx
import { Provider, Button } from "@proyecto-viviana/ui";
import { TextField } from "@proyecto-viviana/ui/TextField";

import "@proyecto-viviana/ui/components.css";

export function App() {
  return (
    <Provider colorScheme="dark">
      <TextField label="Name" />
      <Button variant="accent">Save</Button>
    </Provider>
  );
}
```

Every package needs **Solid 2**: `solid-js` and `@solidjs/web` are peer
dependencies at `>=2.0.0-rc.9 <3`, and Solid publishes those on its `next` tag.
Keep `@next` on both: without it npm resolves a version below that floor. Our
release candidate is on the `rc` tag, and our `latest` is still the Solid 1
line.

## Pick a package

| You want                                     | Install                                  |
| -------------------------------------------- | ---------------------------------------- |
| Components that look finished out of the box | `@proyecto-viviana/ui`                   |
| Adobe Spectrum 2, in Solid                   | `@proyecto-viviana/solid-spectrum`       |
| Accessible components with no styling at all | `@proyecto-viviana/solidaria-components` |
| Hooks, to build your own components          | `@proyecto-viviana/solidaria`            |
| State only, no DOM                           | `@proyecto-viviana/solid-stately`        |
| The Kumo or Geist look                       | not published yet, see [Status](#status) |

Start at the top of the table. Go lower only when you need to.

## How it fits together

```text
solid-stately          state: collections, selection, dates, validation
      ↓
solidaria              behavior: ARIA, press, focus, keyboard, i18n
      ↓
solidaria-components   headless components, no styling
      ↓
      ├─ solid-spectrum          Spectrum 2 look
      ├─ @proyecto-viviana/ui    the Viviana design system
      ├─ kumo                    Cloudflare Kumo look (experiment)
      └─ geist                   Vercel Geist look (experiment)
```

Each layer depends only on the ones above it. A styled library never
reimplements press, focus, or keyboard behavior. It themes and composes.

## Styling

Component styling ships as CSS, not as JavaScript. Every styled package has a
CSS entry point you import once, at your app entry, before your own
stylesheets:

```ts
import "@proyecto-viviana/ui/components.css";
```

`components.css` is `font-faces.css` + `theme.css` + `styles.css`. Import
those three separately if your app loads its own fonts. `font-faces.css`
opens with an `@import`, and CSS drops an `@import` that any rule precedes.
Load it first, or the fonts silently fall back.

`solid-spectrum` has a `components.css` too: `font-faces.css` + `styles.css`.
Its font file declares `@font-face` directly, with no `@import`, so the
ordering rule above does not apply to it. Its rules are generated from Adobe's
tokens by the style macro, never handwritten:
[ADR 0001](docs/adr/0001-s2-styling-source-of-truth.md).

A few components still add a small `<style>` element at runtime: press
handling, scroll locking, the table's selection outline, toast animations, and
the theme transition. Only the scroll lock carries a nonce today, so a strict
Content-Security-Policy blocks the rest. See [known gaps](#known-gaps-in-this-release-candidate).

## Server rendering

Every package that contains JSX ships two builds: compiled DOM output for a
plain `import`, and preserved JSX under the `solid` export condition, which
your bundler compiles for the server. `solid-stately` has no JSX and ships
one. A server that loads the DOM build cannot render it. With Vite,
keep the family inside the bundle:

```ts
import { defineConfig } from "vite";
import solid from "@solidjs/vite-plugin";

const packages = [
  "@proyecto-viviana/ui",
  "@proyecto-viviana/solid-spectrum",
  "@proyecto-viviana/solidaria-components",
  "@proyecto-viviana/solidaria",
  "@proyecto-viviana/solid-stately",
];

export default defineConfig({
  plugins: [solid({ ssr: true })],
  optimizeDeps: { exclude: packages },
  ssr: { noExternal: [/@proyecto-viviana\/.*/] },
});
```

`@solidjs/vite-plugin` is the Solid 2 plugin (this repository pins
`3.0.0-next.44`); `vite-plugin-solid` targets Solid 1. This repository's docs
site server-renders with the same `noExternal` line, and its route sweep
(`vp run test:routes`) hydrates every page without a console error.

## Status

Active, experimental, and incomplete. APIs and package boundaries change.

| Package                                  | npm           | State                                                                                |
| ---------------------------------------- | ------------- | ------------------------------------------------------------------------------------ |
| `@proyecto-viviana/ui`                   | `rc`          | Published. The client-facing entry point.                                            |
| `@proyecto-viviana/solid-spectrum`       | `rc`          | Published. Spectrum 2 parity is in progress.                                         |
| `@proyecto-viviana/solidaria-components` | `rc`          | Published.                                                                           |
| `@proyecto-viviana/solidaria`            | `rc`          | Published.                                                                           |
| `@proyecto-viviana/solid-stately`        | `rc`          | Published.                                                                           |
| `@proyecto-viviana/kumo`                 | not published | One Button. The npm name holds a reserved `0.0.0-bootstrap.0` that is not this code. |
| `@proyecto-viviana/geist`                | not published | One Button. The npm name is not registered.                                          |

**An export is a floor, not proof.** A name in the barrel says nothing about
whether a component matches upstream. [The evidence bar](.claude/current/certification.md)
says what "ported" means here and what a component must carry before it
counts. Until a component carries it, treat its parity as unproved.

## Known gaps in this release candidate

This is a release candidate, cut early on purpose. Each defect below has a
ticket. If one of them matters to your app, wait for the next release or pin
and test.

- **Link items bypass your router.** In a menu, list, or table, clicking an
  item that is a link does a full page load instead of a client-side
  navigation. [#592](.claude/tickets/tasks/592-link-items-bypass-the-router-at-four-call-sites.md)
- **Focus can return to the wrong element.** When overlays are nested, or one
  opens from another, closing the inner one may restore focus to the wrong
  place. [#593](.claude/tickets/tasks/593-focusscope-restores-focus-without-asking-which-scope-is-active.md)
- **A strict Content-Security-Policy blocks the press style.** Touch users keep
  the double-tap-zoom delay on pressable elements, and the page reports a CSP
  violation. [#594](.claude/tickets/tasks/594-createpress-injects-an-un-nonced-style-element.md)
- **Some dialogs lose their accessible name.** A dialog opened from an
  `ActionButton`, `ToggleButton`, or `LinkButton` labels itself with an id no
  element carries. [#595](.claude/tickets/tasks/595-dialog-labels-itself-with-an-id-no-element-carries.md)
- **Generated ids can collide.** An `id` you pass to a field can still be
  replaced by a generated one, and under `NoHydration` two elements can share
  an id. [#596](.claude/tickets/tasks/596-createid-throws-without-an-owner-and-one-call-site-was-bypassed.md)
- **A flipped popover may flash in the wrong place.** A popover that has to
  flip away from its requested side can animate in before it is positioned.
  [#603](.claude/tickets/tasks/603-no-test-can-tell-the-popovers-two-enter-placements-apart.md)
- **Badge size inside a sized `ActionGroup`.** An `ActionButton`'s notification
  badge takes the group's size instead of the button's own.
  [#605](.claude/tickets/tasks/605-actionbuttons-notificationbadge-takes-the-group-resolved-size.md)
- **`ButtonGroup` misses an in-place size change.** It reacts when children are
  added or removed, not when one changes size where it stands.
  [#601](.claude/tickets/tasks/601-the-low-residues-the-audit-left-without-a-stage.md)
- **The certified suite has zero un-waived failures.** In CI run
  `37176592599` at `08793320`, 2,175 of its 2,181 comparisons against the React
  original pass, 0 fail, 4 are skipped, and 2 are waived by name until
  2026-10-21 against open ticket
  [#584](.claude/tickets/tasks/584-the-picker-trigger-state-attributes-are-on-the-wrong-element.md)
  in [`certified-waivers.json`](apps/comparison/e2e/certified-waivers.json).
  [#578](.claude/tickets/tasks/578-the-certified-suite-is-27-red-and-it-is-the-release-bar.md)

Three more are internal and change nothing you install: how the parity tooling
counts and attributes upstream test facts
([#597](.claude/tickets/tasks/597-the-parity-ratchet-absorbed-thirty-facts-its-own-receipt-refused.md),
[#579](.claude/tickets/tasks/579-the-parity-oracle-attributes-facts-by-filename.md)),
and a board view that can go stale between commits
([#604](.claude/tickets/tasks/604-a-rendered-field-edited-after-docs-generate-still-ships-a-stale-board-view.md)).

## Links

- Documentation and component pages: <https://ui.proyectoviviana.org>
- The React-vs-Solid parity harness runs locally: `vp run comparison:dev`
- Repository: <https://github.com/proyecto-viviana/ui>

## Development

```bash
vp install
vp run dev              # apps/web, the docs and playground app
vp run comparison:dev   # apps/comparison, the parity harness
vp run check            # format, lint, typecheck
vp run test:run         # package suites
```

[CONTRIBUTING.md](CONTRIBUTING.md) has the rest: how a port is certified, the
changeset rule, and the upstream pins.

## Repo layout

```text
packages/        the seven packages above, plus private test utilities
apps/web         the docs and playground app
apps/comparison  the React-vs-Solid parity harness
docs/adr/        architecture decision records
```

## License & attribution

- Our own work is [MIT](LICENSE).
- The Adobe port project uses code under Apache-2.0. That direct-license
  attribution is in [`NOTICE`](NOTICE) and
  [`LICENSE-APACHE-2.0`](LICENSE-APACHE-2.0). Each Adobe-derived package ships
  copies of those files. Per-file mappings are guarded by
  `guard:attribution-headers`.
- [`CREDITS.md`](CREDITS.md) credits everything sourced, referenced, or
  inspired-by. Add to it in the change that introduces new such material.
- Kumo-derived material keeps the Cloudflare MIT notice in
  [`packages/kumo/LICENSE-CLOUDFLARE`](packages/kumo/LICENSE-CLOUDFLARE).
- Geist visual rest values follow the public docs at
  https://vercel.com/geist. The package does not copy `@vercel/geistcn`.
