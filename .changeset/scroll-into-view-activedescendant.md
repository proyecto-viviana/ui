---
"@proyecto-viviana/solidaria": patch
"@proyecto-viviana/solidaria-components": patch
---

Reveal the focused option in `aria-activedescendant` collections on keyboard navigation (T-10 follow-up). Adds a shared `createScrollIntoViewOnFocus` hook (`solidaria`) — a faithful port of `@react-aria/selection`'s `useSelectableCollection` focused-key scroll effect, which upstream runs for _all_ selectable collections (it is **not** gated on virtual focus). On a keyboard-modality `focusedKey` change it `scrollIntoViewport`s the matching `[data-key]` element into the collection root, deferred one microtask so a virtualizer's force-include can commit the focused row first; pointer-driven changes and inactive (background) collections are skipped.

Wired into the three collections that don't move real DOM focus: `ListBox` and `Menu` (pure `aria-activedescendant`) and the `ComboBox` listbox (explicit virtual focus). `Select` already reveals its focused option through real `focusSafely` focus (native browser scroll), so it is intentionally left unwired. Grid / gridlist remain deferred — they move roving real focus with no programmatic row focus / `aria-activedescendant` and don't port upstream's `useGridCell` focus-mode walker, so there's no focused-row reveal to attach a scroll to yet.
