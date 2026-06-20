# Ticket: `ui-css-provider-contract`

## Goal

Make the relationship between `Provider`, `theme.css`, `styles.css`, and app CSS
imports explicit and testable.

## Problem

`Provider` sets context, attributes, and generated classes; it does not load CSS
for consumers. `pokeforos` and `bord` import `@proyecto-viviana/ui/styles.css`
explicitly, while `tortafritapp` currently implies the design system comes only
from mounting `<Provider>`. That is an incorrect consumption contract.

## Scope

- Document the required app import in `packages/viviana-ui/README.md`.
- Clarify the roles of:
  - `styles.css`: macro/atomic rules without font faces.
  - `components.css`: font faces plus styles.
  - `theme.css`: theme variables and Viviana token variables.
  - `Provider`: runtime context/attributes, not CSS injection.
- Add a package-level import smoke test for CSS export-map entries.
- Add a downstream note for `viviana-social` to import
  `@proyecto-viviana/ui/styles.css` in `tortafritapp`.

## Out Of Scope

- Implementing automatic stylesheet injection.
- Changing app theming defaults.

## Acceptance Criteria

- README instructions are unambiguous: apps using UI components import the UI CSS
  explicitly.
- Package export-map tests cover `styles.css`, `components.css`, `theme.css`, and
  `font-faces.css`.
- `Provider` docs/comments no longer imply it supplies CSS by itself.
- Companion social-app migration adds the missing `tortafritapp` UI stylesheet
  import and verifies the app still boots.
