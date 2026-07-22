---
"@proyecto-viviana/ui": minor
---

Register prompt wells: field `suffix` slot, SearchField `prefix`, and the tutor surface.

- New shared `FieldSuffix` slot — trailing adornment inside the field group
  (key hints, units), styled as the mirror of the prefix slot. Its id joins
  the input's `aria-labelledby` alongside the prefix id, and the labelledby
  wiring now resolves ids lazily so adornments can mount/unmount live.
- `TextField` and `SearchField` accept `prefix` and `suffix`. SearchField's
  `prefix` renders in place of the built-in magnifier icon; its `suffix`
  sits between the input and the clear button.
- `TextField` gains `surface?: "well" | "tutor"` — the tutor surface is the
  register's AI-lane fill (`--surface-well-tutor` / `--well-tutor-ink`),
  one step deeper than the search well in dark and identical to it in light.
