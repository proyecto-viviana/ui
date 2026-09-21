---
id: 600
type: task
title: "The public install line names a dist-tag the registry does not have, and the landing page's names the Solid 1 build"
created: 2026-09-21
parent: 544
status: open
blocked: true
history:
  - {
      state: open,
      at: 2026-09-21,
      note: 'opened from the 2026-09-21 round-1 audit, receipt `.agents/audit-2026-09-21/round-1-results.md`. Two findings: `public-face/rc-tag-does-not-exist` (high, partly) and `public-face/landing-installs-solid-1` (high, confirmed). Nothing has shipped - the rewrites are three commits on the `public-face` branch, outside `main`''s audited range - so this is a gate on merging, not a defect in the tree. On the branch: six `@rc` lines and a Status table calling five packages Published, against `npm view ''@proyecto-viviana/ui@rc'' version` -> E404 and `dist-tags` -> `{"latest":"0.6.3"}`, the same shape for the other four. Five npm pages, not six; the root `package.json` is private. Meanwhile `apps/web/src/routes/index.tsx:73` renders `npm i {props.install}` with bare names at `:346` and `:353` and no tag caveat anywhere in the file, and `@proyecto-viviana/ui@0.6.3` has `peerDependencies` `{"solid-js":"^1.9.0"}` - so a visitor following the landing page gets the Solid 1 build the hero `30004ffb` added at `:314-315` says it is not. Both halves come from the same absence: no single source says which tag the public face installs from, and nothing compares it against the registry',
    }
  - {
      state: open,
      at: 2026-09-21,
      note: "blocked, and on an owner call rather than on work. Two records disagree about which dist-tag the RC lands on. `.agents/CONDUCTOR-PENDING-2026-09-20b.md:17` records the owner at 12:45 on 2026-09-20 choosing `-rc.N` on the **`rc`** dist-tag, install line `npm i <pkg>@rc`, `latest` held on the Solid 1 line, and says the #548 drafts change every `@next` to `@rc`. `1042f0fe` and #547's decision section, written by the conductor at 22:58, keep `pre enter rc` but add `npm dist-tag add <pkg>@<version> next` per package so the install line stays `@next`; initiative #544's own decision line says `next`. The guard this ticket asks for compares the README's tag against the registry, so it cannot be written until one reading is retired. The conductor's default, absent a word: **`rc` alone** - it needs no step outside Changesets and so mints no dist-tag that silently stops tracking, which is the debt #547 names. Owner decides",
    }
---

## Scope

1. One source for the install tag. The package name and the tag come from one
   place that both `packages/*/README.md` and
   `apps/web/src/routes/index.tsx` read, so the landing page and the npm pages
   cannot say different things.
2. A guard that reads `npm view <pkg> dist-tags` and fails when the tag the
   public face installs from is absent from the registry, or when `next` and
   `rc` disagree. #547 names this as an unowned debt; this is where it lands.
   It is a live provider read, so it needs the owner's permission for that
   action, or a recorded-evidence form like
   `scripts/release-prerequisites.json` uses.
3. Until #547 publishes, either gate the `public-face` merge on it, or mark
   every `@rc` line and the Status table as conditional — "once the RC
   publishes" — so no npm page carries a failing install command.
4. Say the Solid 2 peer requirement on the landing page, not only in the
   README.

## Done when

The install string on the landing page, in the five package READMEs and in the
root README all come from one source; the guard fails when that string does not
resolve on npm; and no public surface claims a package is published on a tag
the registry does not return.

## Proof

The guard's output against the registry before and after the RC publishes; the
one source and its consumers; a `npm view` read of all five dist-tags recorded
on #547.

## Relationship

Child of #544, stage S6, after #548 and #549 because it changes text they own,
and gated by #547 because it asserts something only the publish can make true.
The copy itself is Fable's under the 2026-09-20 owner rule; this ticket owns
the mechanism, not the words.
