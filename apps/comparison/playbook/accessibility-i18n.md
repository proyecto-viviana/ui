# Accessibility And I18n

This check covers accessibility behavior that is not visible in the DOM shape
alone.

Accessibility is a blocking gate, not a polish pass. A component is not
accepted when it only passes axe, visually resembles React, or exposes the same
ARIA-looking attributes without proving the computed browser contract.

## Checks

- Native element, role, computed accessible name, computed description,
  accessible value, and state are compared against upstream/current React.
- Keyboard model, focus order, focus-visible behavior, focus return, and
  focus-not-obscured behavior match upstream and relevant APG/spec
  expectations.
- Disabled, read-only, required, invalid, hidden, and inert behavior use the
  same native or ARIA semantics upstream uses.
- Form labels, help text, error text, required indicators, invalid state,
  hidden inputs, reset, and submit behavior match upstream.
- Live-region announcements match upstream for focus, selected item, option
  count, loading, and completion messages.
- Announcement timing matches upstream: no duplicates, no stale messages after
  cleanup, and no missing messages after async resolution.
- Localized strings come from the same message family or equivalent local
  catalog.
- Locale, direction, number/date formatting, calendar system, and hour cycle are
  inherited from provider context.
- Forced colors behavior has explicit token/class support where upstream does.
- Screen-reader-only text is present for icon-only controls, loading spinners,
  selection indicators, and remove buttons.
- Touch and screen-reader virtual click behavior matches upstream for mobile
  assistive technology paths.
- Landmarks, modal hiding, and focus scopes do not leave duplicate accessible
  regions.
- Multiple component instances do not share live regions, generated IDs,
  localized messages, or cleanup state.
- Target size and hit area are checked for interactive controls when the
  component changes pointer geometry or icon-only affordances.

## Tests

Use semantic queries, accessibility snapshots, keyboard navigation, focus
assertions, and targeted DOM assertions for live-region text, labels,
descriptions, and forced-colors-sensitive attributes.

Automated accessibility scanners are required smoke checks when practical, but
they are not acceptance proof. They cannot prove keyboard timing, focus return,
live-region ordering, provider localization, touch/virtual-click behavior, or
multiple-instance cleanup.

## Evidence

Record a row for each relevant surface:

| Surface                      | Upstream/current React | Solid | Evidence |
| ---------------------------- | ---------------------- | ----- | -------- |
| Role/name/description/value  |                        |       |          |
| Keyboard/focus               |                        |       |          |
| ARIA references/IDs          |                        |       |          |
| Forms/validation             |                        |       |          |
| Announcements                |                        |       |          |
| Forced colors/reduced motion |                        |       |          |
| Locale/RTL/formatting        |                        |       |          |
| Multiple instances           |                        |       |          |
