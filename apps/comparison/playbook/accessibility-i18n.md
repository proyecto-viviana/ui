# Accessibility And I18n

This check covers accessibility behavior that is not visible in the DOM shape
alone.

## Checks

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

## Tests

Use semantic queries, accessibility snapshots, and targeted DOM assertions for
live-region text, labels, descriptions, and forced-colors-sensitive attributes.
