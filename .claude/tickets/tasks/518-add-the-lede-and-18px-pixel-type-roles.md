---
id: 518
type: task
title: "Add the lede and 18px pixel type roles"
created: 2026-09-09
status: open
history:
  - { state: open, at: 2026-09-09, note: "filed from the Terminal Glass port handoff on 117a2886" }
---

The register's type ladder is closed at twelve roles
(`packages/viviana-ui/src/text/type-roles.ts:50-128`). The hero tier landed with
the foundation — `display-xl` is the handoff's 66px hero verbatim
(`type-roles.ts:51-57`, handoff `screens/Terminal Glass App.dc.html:81`:
`font-family:var(--font-display);font-size:66px;line-height:.98`), and
`landing.tsx:94` uses it. Two rungs the handoff does use are still missing, and
both screens fall back to a role that is visibly wrong.

**The lede.** The handoff's landing paragraph is
`font-size:18px;line-height:1.55;color:var(--lede)`
(`Terminal Glass App.dc.html:82`), and the ink token already exists in ours:
`--text-lede` (`packages/viviana-ui/src/viviana-tokens.css:296` dark,
`:691` light). There is no role that spends it, so the landing lede renders as
`typeRoles.body` — 14px sans, neutral ink
(`apps/web/src/routes/examples/landing.tsx:98-102`, and `type-roles.ts:100-103`).

**The 18px pixel rung.** The handoff sets its tile readouts and small card titles
in the display face at 18px — `2 blocks left`, `12 days`, `360 XP to 13`,
`Spaced review` (`Terminal Glass App.dc.html:138`, `:142`, `:146`, `:166`). The
ladder jumps 20px (`title`) to 15px (`headline`), so all four render at `title`
20px/600 (`apps/web/src/routes/examples/home.tsx:61`, `:74`, `:94`, `:157`).

Not in scope: the profile month row. The handoff sets it in the display face at
15px (`Terminal Glass App.dc.html:380`), which is under the ELSH invariant's 16px
floor for the pixel face (`type-roles.ts:34-39`), so `typeRoles.micro` in
`profile.tsx` is the right call and stays.

## Scope

`packages/viviana-ui/src/text/type-roles.ts` (the ladder and its header table),
`viviana-tokens.css` only if the lede ink needs a role-level alias, the type
showcase panel (`apps/web/src/routes/showcase/type.tsx`), then `landing.tsx` and
`home.tsx`.

The API question the owner decides: the two names, and that the closed ladder
widens from twelve roles to fourteen. **Recommended default:** `lede` —
`400 18px/1.55` Geist, `--text-lede` ink, the one role besides `meta` that
restates its ink because the ink is part of the role; and `subtitle` —
`500 18px/1.2` Geist Pixel, `+0.01em`, the rung between `title` and `headline`
for tile readouts and small card titles. Veto either name; `subtitle` in
particular is a rung the handoff never named, and the alternative reading is that
it belongs to the display run (`display-xs`) rather than the title run.

Both are above the 16px pixel floor or on the sans face, so the ELSH invariant
holds unchanged. `Heading`'s level map (`text/Heading.tsx`) keeps
1 → `display`, 2 → `title`, 3 → `headline`: these are roles a caller opts into,
not new default heading sizes.

## Done when

- `typeRoles.lede` and `typeRoles.subtitle` exist, are exported, and the header
  table in `type-roles.ts` lists them with the handoff's exact values.
- `/examples/landing`'s lede is 18px in the lede ink, not `body`.
- The four `home.tsx` readouts are 18px pixel, not `title`.
- A contract test pins the computed size, weight, leading, tracking and face of
  both roles — the ladder is the register's, so a drift must fail.
- Contrast holds in both schemes for the lede ink on the register's grounds
  (`a11y:contrast`), and the type showcase panel shows both rungs.

## Proof

```
vp run build:viviana-ui
vp run build:web
vp run guard:examples-purity
vp exec --filter @proyecto-viviana/web -- playwright test e2e/examples.spec.ts
vp run a11y:axe:aa
vp run a11y:contrast
vp run api:extract && vp run guard:api-reference
```

Plus a minor Changeset on `@proyecto-viviana/ui` (additive roles).

## Relationship

One of the five library gaps the Terminal Glass port surfaced: #515, #516, #517,
#519. Sibling concern to #103 (Glasselated mirror gaps). Example routes:
`/examples/landing`, `/examples/home`.
