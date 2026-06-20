# Ticket: `ui-transitive-barrel-warning`

## Goal

Remove the root-barrel dependency path that makes small UI imports compile huge
generated JSX files and triggers Babel's 500KB deoptimization warning.

## Problem

The warning is not caused by the React Spectrum/S2 macro setup. It is caused by
Solid's compiler processing large JSX-preserved barrels from transitive packages
such as `solidaria` and `solidaria-components`. Adding `babel.compact = true` in
an app only hides the warning; it does not improve the import graph or package
boundary.

## Scope

- Add or complete subpath exports in lower packages where small consumers need
  only one primitive.
- Update `solid-spectrum` and `viviana-ui` imports to use those subpaths instead
  of root package barrels where practical.
- Add a guard or smoke test that importing `@proyecto-viviana/ui/Provider` does
  not pull the large root barrels into the app compiler path.
- Remove any docs or local advice recommending app-level Babel compacting as the
  primary fix.

## Out Of Scope

- Changing macro plugin behavior.
- Changing component APIs.
- App-level log suppression.

## Acceptance Criteria

- `tortafritapp` can run dev without the Babel 500KB warning from
  `solidaria/dist/index.jsx` or `solidaria-components/dist/index.jsx`.
- No app-level `vite-plugin-solid` Babel `compact` workaround is needed.
- Package tests or build analysis identify accidental root-barrel regressions.
- The fix lives in package exports/imports, not in social app Vite config.
