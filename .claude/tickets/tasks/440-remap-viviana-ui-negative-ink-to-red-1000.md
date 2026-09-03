---
id: 440
type: task
title: "Remap viviana-ui negative ink to red-1000 against the panel"
created: 2026-09-03
parent: 32
status: merged
history:
  - {
      state: open,
      at: 2026-09-03,
      note: "filed from Wave-3 Site Gate: /showcase/inputs slot=errorMessage #db2e26 on #f2f6fa = 4.36; 900 is the fill stop",
    }
  - {
      state: merged,
      at: 2026-09-03,
      note: "color.negative → negative-1000; backgroundColor.negative stays 900/700; no 900 floor, no exemption. Contract test + rebuilt viviana-ui. /showcase/inputs contrast green in both themes.",
    }
---

Site Gate `a11y:contrast` → `/showcase/inputs` fails WCAG AA: two
`slot="errorMessage"` spans, `[light] #db2e26 on #f2f6fa = 4.36` (needs 4.5).

900 is the **fill** stop (white-on-fill ≥ 4.5 on white). Error **ink** in
this library is already 1000 (StatusLight, Badge outline/subtle, DateField /
DatePicker HelpText). Showcase `HelpText` still uses semantic `"negative"`
→ Adobe `negative-content-color-default` → `red-900`. The register's text
surface is `--surface-panel` over `--surface-app` = `#f2f6fa`, not white.

Do not floor `red-900` in `glasselated-ramps.ts` (that darkens every
negative fill). Do not add a `contrast-exemptions.ts` entry. Amber and green
900s also fail as ink on the panel and are already remapped at the theme
(notice-1100 / positive-1000) for StatusLight; they are not this CI red.

## Work

- `packages/viviana-ui/src/style/spectrum-theme.ts`: `color.negative` →
  `{ type: "ref", light: "negative-1000", dark: "negative-1000" }` (same
  shape as `neutral-subdued`). Leave `backgroundColor.negative` on 900/700.
- Header note in `glasselated-ramps.ts`: negative/notice/positive **ink** is
  remapped at the theme; do not floor 900 for HelpText.
- Changeset on `@proyecto-viviana/ui`. Rebuild viviana-ui (macro bakes
  color).
- Contract test: resolved negative ink ≥ 4.5 on the panel composite (derive
  it from `--surface-panel` over `--surface-app`, do not hardcode only
  `#f2f6fa`); 900 fills ≥ 4.5 under white; adjacent 800/900/1000 OKLCh L
  gaps ≥ 0.02.

## Done when

`/showcase/inputs` contrast is green. The contract test pins the ink against
the panel, not white.

## Relationship

Child of #32. Named in #136 Wave-3 CI follow-through. Completes the existing
ink-vs-fill split; not a new palette fork.
