---
id: 422
type: task
title: "Name static hidden-label tabs from labelledby ids"
created: 2026-09-03
parent: 24
status: open
history:
  - {
      state: open,
      at: 2026-09-03,
      note: "filed from the #260 tabs functional pass: URL composition=static&labelBehavior=hide (the visual-spec combo with vertical compact withIcons shouldForceMount disabledKey=testing selectedKey=parity) leaves Solid tabs unnamed in AX (`- tab`, `- tab [selected]`, `- tab [disabled]`) because aria-labelledby cl-213/214/215 are missing from the document. React resolves the same ids to display:none SPAN text Overview/Parity/Testing. Dynamic hide (no static) names match on both. Numbered 422 after Calendar #416–#418 and Disclosure #419",
    }
---

`labelBehavior="hide"` names each tab through `aria-labelledby` on a
visually hidden `Text` / content span. S2 keeps those ids in the
document for both static and dynamic collections, so
`getByRole("tab", { name: "Parity" })` works.

Solid dynamic hide already matches (labelledby `cl-206` / `cl-208` /
`cl-209` resolve to `display:none` SPAN text). Static `Tab`
collection + hide points `aria-labelledby` at ids that are not in
the document, so AX tabs have no accessible name.

`Tab` always allocates `contentId = createUniqueId()` and, when
`labelHidden()`, sets `aria-labelledby` to that id. String children
wrap a span with that id. Static hide children are
`<Icon /><Text>label</Text>`; the `Text` never mounts with that id.

This is the exact combo in
`apps/comparison/e2e/tabs-visual.spec.ts` ("labelBehavior=hide keeps
icon-only tabs accessible").

## Evidence

`http://127.0.0.1:4341/components/tabs/?orientation=vertical&density=compact&labelBehavior=hide&withIcons=true&composition=static&shouldForceMount=true&disabledKey=testing&selectedKey=parity`,
islands mounted.

| | React | Solid |
|---|---|---|
| AX | `tab "Overview"` / `"Parity" [selected]` / `"Testing" [disabled]` | `tab` / `tab [selected]` / `tab [disabled]` |
| `getByRole({name:"Overview"\|"Parity"\|"Testing"})` | count 1 | **count 0** |
| labelledby | `react-aria…-content-overview` (trailing space) | `cl-213` / `cl-214` / `cl-215` |
| labelledby target | SPAN text Overview/Parity/Testing, `display:none` | **`missing: true`** |
| geometry | 32×32 icons, vertical compact | same |

`?labelBehavior=hide&withIcons=true` (dynamic, default composition):
both AX `tab "Overview" [selected]` / `"Parity"` / `"Testing"`,
labelledby ids present as `display:none` SPAN. URL static without
hide already names tabs from visible text.

## Done when

Static `composition` + `labelBehavior=hide` keeps the labelledby
targets in the document so each tab's accessible name is Overview /
Parity / Testing like S2. A walk fails if Solid
`getByRole("tab", { name: "Parity" })` is 0 on the visual-spec combo
URL. Dynamic hide and static-with-visible-labels must keep working.
Do not start #254.

## Relationship

Child of #24. Found by #260. Wiring is
`packages/solid-spectrum/src/tabs/index.tsx` `Tab` (`contentId` /
`aria-labelledby` when `labelHidden()`, `ResolvedTabContent` string
vs `Text` children) and the static branch of
`apps/comparison/src/components/solid/fixtures/styled/tabs.tsx`
`solidTabChildren`. Not #209 (React trailing-space labelledby still
resolves). Do not start #254.
