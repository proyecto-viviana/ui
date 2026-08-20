---
id: 94
type: task
title: "Track dependency compatibility ceilings"
created: 2026-08-20
parent: 27
status: open
history:
  - { state: open, at: 2026-08-20, note: "migrated from adversarial finding A-023" }
---

Three dependencies remain below their latest releases for verified compatibility
reasons:

- `@testing-library/jest-dom@6.9.1` stays within `unplugin-solid@2` peer ranges.
- `jsdom@29.1.1` avoids the disconnected-node `getComputedStyle` crash found in
  jsdom 30.0.1.
- `typescript@6.0.3` stays within `@astrojs/check@0.9.10` peer ranges.

## Scope

- Recheck the dependent peer ranges when any related package changes.
- Remove a ceiling only after its compatibility tests pass.
- Keep the reason next to the selected version or in a generated dependency
  report.

Do not force-install a newer version and ignore peer or runtime failures.

## Done when

Compatible dependent releases permit each ceiling to move, or the active
ceilings remain explicit and executable checks hold them.
