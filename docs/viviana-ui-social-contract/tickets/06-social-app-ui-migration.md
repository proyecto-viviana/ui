# Ticket: `social-app-ui-migration`

## Goal

Update `viviana-social` apps to consume the finalized `@proyecto-viviana/ui`
contract after the UI package tickets land.

## Problem

The social apps mostly use `@proyecto-viviana/ui`, but app configs still know
about internal packages and `tortafritapp` is missing the explicit UI stylesheet
import. We should clean this after the UI package exposes the right API and helper
surface.

## Scope

- Update `pokeforos`, `bord`, and `tortafritapp` to the packed or published UI
  package containing the new contract.
- Import `@proyecto-viviana/ui/styles.css` wherever UI components render.
- Replace copied macro wrappers with the UI-provided Vite helper if
  `ui-vite-macro-preset` lands.
- Remove direct `solid-spectrum`/`solidaria` config entries if the package changes
  make them unnecessary.
- Keep app source imports on `@proyecto-viviana/ui` and
  `@proyecto-viviana/ui/style`.

## Out Of Scope

- New forums/games/achievements product work.
- Re-skinning pages beyond proving the new token route.
- Changing auth/persona behavior.

## Acceptance Criteria

- `pokeforos`, `bord`, and `tortafritapp` dev builds start locally.
- App-authored `style()` macro calls still compile in DOM and SSR.
- `tortafritapp` has the explicit UI CSS import and renders provider-based UI
  without relying on implicit stylesheet injection.
- No social app source imports `@proyecto-viviana/solid-spectrum` directly.
- Any remaining config-level internal package references are documented with a
  reason and a removal condition.
