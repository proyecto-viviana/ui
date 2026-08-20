---
id: 108
type: task
title: "Port createKeyboard shortcut support"
created: 2026-08-20
parent: 31
status: open
history:
  - { state: open, at: 2026-08-20, note: "migrated from upstream Train 8 item T-61" }
---

Port the pinned `createKeyboard` shortcut contract: `shortcuts`,
`allowRepeats`, `allowComposing`, and `createKeyboardShortcutHandler`.

Prove platform modifier text, announced shortcuts, composition, repeated keys,
disabled handling, and form behavior against upstream source and tests.

## Relationship

Blocks repeated collection navigation in #122. Part of Train 8 ticket #82.
