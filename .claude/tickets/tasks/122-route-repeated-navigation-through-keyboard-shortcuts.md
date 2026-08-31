---
id: 122
type: task
title: "Route repeated navigation through keyboard shortcuts"
created: 2026-08-20
parent: 31
status: verified
history:
  - { state: open, at: 2026-08-20, note: "migrated from upstream Train 8 item T-90" }
  - {
      state: in-progress,
      at: 2026-08-20,
      note: "confirmed the shared collection still uses one permissive raw-key switch instead of the pinned shortcut maps",
    }
  - {
      state: merged,
      at: 2026-08-20,
      note: "routed ListBox through the shared collection and added the pinned upstream shortcut maps",
    }
  - {
      state: verified,
      at: 2026-08-20,
      note: "unit, browser, type, build, layer, DnD, and upstream parity checks pass",
    }
---

Match repeated-key navigation in the shared selectable-collection spine.

Upstream routes arrows and page keys through one `useKeyboard` shortcut map with
`allowRepeats: true`. It routes Home, End, select all, Escape, and Tab through a
second map that rejects repeats. Both maps reject composing events and modifier
combinations that are not listed. The local collection uses one permissive raw
key switch, so these branches do not match.

## Source packet

- Official vendored selection documentation:
  `react-spectrum/packages/dev/s2-docs/pages/react-aria/selection.mdx`.
- Pinned implementation:
  `react-spectrum/packages/react-aria/src/selection/useSelectableCollection.ts`.
- Pinned tests:
  `react-spectrum/packages/react-aria/test/selection/useSelectableCollection.test.js`.
- Shared local implementation:
  `packages/solidaria/src/selection/createSelectableCollection.ts`.
- Existing local list-spine evidence:
  `packages/solidaria/test/createSelectableList.test.tsx`.

## Done when

The shared implementation covers repeats, shift selection, page navigation,
composition, disabled items, and focus without per-widget copies. Depends on
#108 and is part of #82.

The evidence must also hold exact modifier matching, handled and unhandled
propagation, non-repeating Home and End behavior, select all, Escape, and Tab.

## Verified evidence

- The shared collection and ListBox unit suites pass with 140 tests in four
  files. The focused coverage includes repeats, page keys, composition,
  modifiers, propagation, selection, and post-reorder focus.
- The full Solidaria suite passes with 1,556 tests in 81 files.
- The React-to-Solid browser contract passes all three keyboard pair tests. The
  ListBox, drag-and-drop ListBox, Autocomplete, ComboBox, Picker, and shared
  keyboard consumer matrix passes all 129 tests.
- The comparison build emits all 100 routes. The repository type check passes.
- The layer-boundary, DnD keyboard parity, and upstream test parity guards pass
  without new findings.
- Broad consumer validation found a post-reorder focus gap. The droppable hook
  now keeps a stable owner and uses the pinned upstream delayed focus restore.
  The focused DnD browser certificate passes all three tests.
