# viviana-ui ← solid-spectrum: sync & update plan

`@proyecto-viviana/viviana-ui` is the **brand layer**: it reskins
`@proyecto-viviana/solid-spectrum` with viviana design tokens (and, where needed,
overrides components). It is downstream of solid-spectrum the way solid-spectrum
is downstream of `@react-spectrum/s2`. This doc records **what viviana-ui tracks
from solid-spectrum, which files to check, and how to update** when solid-spectrum
changes (e.g. after a new React Spectrum release is ported into solid-spectrum).

## The chain

```
react-aria / react-stately  ──port──>  solidaria / solid-stately
react-aria-components        ──port──>  solidaria-components       (parity: scripts/check-rac-*.ts)
@react-spectrum/s2           ──port──>  solid-spectrum             (vendored: solid-spectrum/src/style/UPSTREAM.md)
solid-spectrum               ──reskin─>  viviana-ui                (THIS doc)
```

The layers below solid-spectrum already have a tracked update path (the
`check-rac-parity` / `check-rac-export-gap` guards + solid-spectrum's
`src/style/UPSTREAM.md`). This doc fills the missing **solid-spectrum → viviana-ui**
hop.

## Synced-to (update this on every solid-spectrum bump)

- **solid-spectrum:** `@proyecto-viviana/solid-spectrum@0.4.2`
- **transitive S2 baseline:** `@react-spectrum/s2@1.3.0` (per solid-spectrum's
  `src/style/UPSTREAM.md`)

## What viviana-ui owns vs inherits

viviana-ui has two surfaces, and only one needs manual attention on an update:

1. **Re-exported (inherited, automatic).** Today everything:
   - `src/index.ts` → `export * from "@proyecto-viviana/solid-spectrum"`
   - `src/style.ts` → `export * from "@proyecto-viviana/solid-spectrum/style"`

   `export *` means new solid-spectrum components/exports appear automatically and
   API changes flow through. No action needed beyond a rebuild + typecheck —
   breaking changes surface as type/build errors.

2. **Overridden (owned, manual).** Not present yet; this is where viviana-ui will
   diverge:
   - **Token theme** — a viviana variant of solid-spectrum's
     `src/style/spectrum-theme.ts` + `tokens.ts` (the brand palette/scale).
   - **Shadowed components** — viviana-specific versions of individual
     solid-spectrum components, re-exported in place of the upstream one.

   Every override must be listed in the table below and re-checked on each bump.

## Overrides registry (the files we're checking)

| viviana-ui file               | shadows (solid-spectrum) | why it diverges | last synced |
| ----------------------------- | ------------------------ | --------------- | ----------- |
| _(none yet — pure re-export)_ | —                        | —               | —           |

> When you add an override, add a row here pointing at the solid-spectrum
> file(s) it is based on. On a solid-spectrum bump, those are exactly the files
> to diff.

## Update plan

When solid-spectrum changes (a fix, an API change, or a freshly-ported
`@react-spectrum/s2` release):

1. **Bump + record.** Update solid-spectrum, then bump the "Synced-to" versions
   above. Read solid-spectrum's changelog + its `src/style/UPSTREAM.md` (did the
   S2 baseline move? did `spectrum-theme.ts`/`tokens.ts` change?).
2. **Re-exported surface — automatic.** Build viviana-ui + typecheck. New exports
   are picked up by `export *`; breaking changes show up as type/build errors to
   fix. Nothing to copy.
3. **Overridden surface — manual.** For each row in the registry above, `git diff`
   the shadowed solid-spectrum file(s) between the old and new solid-spectrum
   commit. Re-apply the upstream structural change on top of viviana's delta
   (keep style declarations structurally matching S2, per solid-spectrum's own
   rule), then update the row's "last synced".
4. **Export-gap check.** Once viviana-ui stops using bare `export *` for any
   subpath, mirror the `check-rac-parity` pattern: a small script comparing
   viviana-ui's exported symbols to solid-spectrum's `src/index.ts` so a new
   upstream component isn't silently dropped.
5. **Token check.** If the override is the theme, diff solid-spectrum's
   `style/tokens.ts` + `spectrum-theme.ts` for new/renamed token names that the
   viviana theme must map.

## How we know solid-spectrum changed

- **Now (pre-publish):** viviana-ui + the consuming apps point at the sibling
  `../viviana-ui/packages/solid-spectrum` source; "a change" = a new commit there.
  Treat a solid-spectrum commit that touches `src/style/*` or a shadowed
  component as a trigger to run the update plan.
- **Later (published):** pin solid-spectrum as a normal dependency; a version bump
  (changesets) is the trigger. The "Synced-to" line is the source of truth for
  what viviana-ui has reconciled against.

## Build note

viviana-ui carries no macro build of its own while it is a pure re-export — the
`style()` macro is compiled by the **consumer's** toolchain (see the consuming
app's `s2Macros()` vite wrapper). When viviana-ui gains its own theme/components
that call the macro, it will need solid-spectrum's `vp pack` + `s2Macros` build
to ship a compiled `dist` + `styles.css`.
