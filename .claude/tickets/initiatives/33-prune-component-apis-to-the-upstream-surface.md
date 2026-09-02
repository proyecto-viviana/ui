---
id: 33
type: initiative
title: "Prune component APIs to the upstream surface"
created: 2026-08-20
status: open
history:
  - { state: open, at: 2026-08-20, note: "migrated from roadmap item upstream-api-parity" }
---

Remove unsupported local API differences or record explicit owner-approved additions.

## Done when

Each public difference from upstream is removed or documented as an approved local addition.

## Relationship

Replaces roadmap item `upstream-api-parity`.

## Round-2 owner decisions (2026-09-01)

Resulting checklist from #218 / #219: #221 (barrel equals S2 exports; relocate extras), #222 (MenuButton out of solid-spectrum and solidaria-components), #223 (viviana-native names off the ui barrel), #224 (upstream item names canonical; deprecate ListBoxOption / ComboBoxOption), #227 (per-file subpaths generated from S2 exports/). `class` is the one systematic port rule (architecture.md, "Public names").
