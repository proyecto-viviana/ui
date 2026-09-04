---
id: 455
type: task
title: "Export remaining solid-spectrum subpaths"
created: 2026-09-04
parent: 136
status: open
history:
  - {
      state: open,
      at: 2026-09-04,
      note: "filed as #255 export-subpaths child; owner-confirmed title after grill listed 89 missing keys. Parent is #136 (a task cannot parent a task).",
    }
---

Comparison already imports 89 named symbols from the
`@proyecto-viviana/solid-spectrum` barrel that have no `exports` subpath
key. Names already exist on the barrel; this ticket adds
`exports["./Accordion"]` and the rest, plus a Changeset. Compound members
reuse an existing parent key (`PickerItem` → `./Picker`). Do not invent
new public names.

Chrome/controls/D12 subset that blocks #451 even if fixtures wait: Badge,
CloseIcon, Content, ContextualHelp, Divider, Heading, Keyboard, Link,
MenuHamburgerIcon, Meter, Radio, RadioGroup, SearchIcon, createIcon.

Distinct from #227 (generate S2-shaped per-file export modules). This
slice only publishes keys for names the harness already imports.

## Done when

`package.json` `exports` keys exist for the symbols #451 will import.
Compound members use parent keys. Changeset on `solid-spectrum`. Packed
package exposes the new subpaths. No new public name that is not already
on the barrel.

## Relationship

Child of #136. Slice of #255. Blocks #451. Distinct from #227.
