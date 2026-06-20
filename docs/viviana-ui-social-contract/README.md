# `@proyecto-viviana/ui` social contract plan

This plan turns the social-app review into parallelizable tickets for
`viviana-ui`. The target contract is:

- Social apps consume the design system through `@proyecto-viviana/ui` and
  `@proyecto-viviana/ui/style`.
- `@proyecto-viviana/ui` behaves like `@proyecto-viviana/solid-spectrum` from a
  public API/build standpoint, but owns the Viviana token/theme layer.
- Built UI components ship their own macro-expanded CSS, while apps that author
  `style()` calls still install the macro plugin in their Vite build.
- App configs should not need to know about `solid-spectrum` or `solidaria`
  internals except while we are intentionally debugging a lower layer.

## Ticket Map

| id | title | repo | deps | parallel notes |
| --- | --- | --- | --- | --- |
| `ui-export-parity` | Match `solid-spectrum` public exports from `@proyecto-viviana/ui` | `viviana-ui` | none | Can run immediately. |
| `ui-viviana-style-tokens` | Make `@proyecto-viviana/ui/style` own Viviana tokens | `viviana-ui` | none | Can run immediately, but coordinate with export parity on new `./style/runtime` paths. |
| `ui-css-provider-contract` | Document and test CSS import/provider responsibilities | `viviana-ui` + companion app edits | none | Can run immediately. |
| `ui-vite-macro-preset` | Provide one app macro setup for `@proyecto-viviana/ui/style` consumers | `viviana-ui` + companion app edits | none | Can run immediately; best paired with social-app config cleanup. |
| `ui-transitive-barrel-warning` | Remove root-barrel pulls that trigger huge JSX/Babel warnings | `viviana-ui` lower packages | none | Can run immediately; independent of token work. |
| `social-app-ui-migration` | Update social apps to the finalized UI contract | `viviana-social` | previous tickets | Downstream validation ticket after UI package changes land. |

## Suggested Waves

1. **Wave 0 - planning branch only:** land this doc set.
2. **Wave 1 - independent package tickets:** export parity, style tokens, CSS
   contract, Vite macro preset, transitive barrel warning.
3. **Wave 2 - downstream adoption:** update `viviana-social` apps after the UI
   package branch can be packed or published.
4. **Wave 3 - cleanup/ratchet:** remove temporary config leakage from app Vite
   files and add guards so future apps import through `@proyecto-viviana/ui`.

## Review Notes Captured

- `@proyecto-viviana/ui/style` currently re-exports
  `@proyecto-viviana/solid-spectrum/style`, so named macro tokens still compile
  through the Spectrum token map.
- Viviana CSS variables exist and are used by native components through
  arbitrary `[var(--color-*)]` values, but that is not the same as owning the
  macro token map.
- `pokeforos` and `bord` correctly run the macro plugin because app source files
  import `@proyecto-viviana/ui/style` with `{ type: "macro" }`.
- `Provider` does not import stylesheets for consumers. Apps must import the UI
  stylesheet explicitly.
- The Babel `compact: true` workaround is not a fix. The fix is to stop pulling
  huge root barrels through small component subpaths.
