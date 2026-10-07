---
id: 601
type: task
title: "The low residues the 2026-09-21 audit left without a stage"
created: 2026-09-21
parent: 544
status: verified
history:
  - {
      state: open,
      at: 2026-09-21,
      note: "opened from the 2026-09-21 round-1 audit, receipt `.agents/audit-2026-09-21/round-1-results.md`. The stages S0-S6 claim 69 of the 76 findings. These seven belong to no stage, are each small, and are each real. Filing seven tickets would bury the board; leaving them unowned would break the rule the receipt's OWNERS table exists to keep - no finding without an owner. So one sweep ticket, with the seven named, and each item closable on its own. This is a deviation from the conductor's mapping and the receipt records it as one",
    }
  - {
      state: open,
      at: 2026-09-21,
      note: "2026-09-21 round-2 audit, receipt `.agents/audit-2026-09-21/round-2-results.md`: three more stageless lows, items 8-10, and the title drops its count so the next sweep does not need a rename. Item 8 `r2-certified-a/r2a-6` is pre-existing oracle hygiene and belongs to no commit in either range. Items 9 and 10 are `r2-guards/r2-guards-5` and `r2-guards/r2-guards-6`, the two residues of #139, which is merged and so cannot carry live work; #139 carries the dated note that names them and points here. Same rule as before - one sweep row rather than three board rows, each item closable on its own",
    }
  - {
      state: open,
      at: 2026-09-21,
      note: "deferred to the release after the RC by the owner's soft-launch cut, see #544; the ticket keeps its owner and nothing here is waived or closed",
    }
  - {
      state: verified,
      at: 2026-10-07,
      note: "all ten closed. 1: both ButtonGroup twins re-measure when a child changes size in place, and ignore the group's own attribute records; ButtonGroup.test.tsx 3 passed in solid-spectrum and 3 passed in viviana-ui. 2 and 3: the cleanup guard counts function bodies and reports a body that is still armed when the walk ends; check-s2-cleanups-strand.test.ts 7 passed. A throw on the way to a later runner stays a known gap. 4: the dom.ts and focus.ts cycle is already gone, so it was not split. focus.ts reaches dom.ts and no file reaches focus.ts back; openLink imports ./dom. 5: the Popover display:contents group is still rendered beside the FocusScope comment that cites RAC Overlay.tsx:76-81, and RAC Popover.tsx:375 still uses display:contents, so the comment was left. 6: the solid-js and @solidjs/web wildcards stay. pnpm 11.22 filterPeerDependencyIssues drops a peer when semver.satisfies(foundVersion, allowedRange) with no includePrerelease. satisfies(2.0.0-rc.9, *) is false, so today's wildcard does not hide the 17 apps/web unmet solid-js rows, and satisfies(2.0.0-rc.9, >=2.0.0-rc.9 <3) is true, so narrowing the wildcards to the pinned RC range would silence those rows. check-peers fails on an unexpected unmet peer and on a stale expected entry, so those 17 rows stay. 7: the live pin documents already quote S2 1.7.0 / RAC 1.21.0 / react-aria 3.52.0 / react-stately 3.50.0 (the catalog, upstream-sync.md, upstream-pin.json, and the guard fixture). The installed-comparison-deps-lag-pin memory description already names that pin. Remaining 1.5.1 and 1.19.0 strings are dated history or the version a check was written against (#82, the changelogs, certified specs, a few source comments, and the radiogroup sd151 class hook) and were left. 8: deleted the unused ORACLE_IGNORED_DATA_ATTRIBUTES export and folded its paragraph into the RAC_STATE_DATA_ATTRIBUTES comment. 9 and 10: scratchDir refuses a last segment these scripts do not own, and an unset pack stage is deleted at exit unless --keep-stage; scratch-dir.test.ts 12 passed",
    }
---

## Scope

Ten items, seven from round 1 and three from round 2. Each is done when its own
line is done; the ticket closes when all ten are, or when the ones that are not
have a reason written here.

1. **`555-b/buttongroup-misses-attribute-changes`** — the restored children
   dependency does not cover a child that changes size in place, only one that
   is added or removed. Cover the attribute-change case.
2. **`555-b/s2-cleanups-guard-counts-files`** — the guard reports 58 bodies;
   58 is the file count and there are 81 bodies. Count bodies, or rename the
   number.
3. **`guards-a/s2-cleanups-return-only`** — the same guard fires only on a
   `return`, so falling off the end of an armed body is invisible.
4. **`solidaria-src/dom-focus-import-cycle`** — the `openLink` rewrite
   introduced a `dom.ts` ↔ `focus.ts` cycle. Break it before something
   downstream depends on the evaluation order.
5. **`components-src/popover-stale-comment`** — Popover keeps a comment
   describing the `display:contents` group the same commit deleted.
6. **`release-path/peers-wildcard-called-ratchet`** — narrow
   `pnpm-workspace.yaml:95-96`'s `solid-js: "*"` and `"@solidjs/web": "*"` to
   the pinned RC range, so an unmet peer on a published package still fails
   `check-peers`. The wildcard is not blinding today —
   `expected-unmet-peers.json` holds 17 unmet `solid-js` rows, all scoped to
   `apps/web` — but it accepts every version for every workspace, which is the
   form the guard's own docblock warns about. The doc sentence that called it
   "the ratcheting form" is corrected in the release-path correction block.
7. **`components-src/stale-pin sweep`** — no live document carries the stale
   S2 1.5.1 / RAC 1.19.0 pin; the two remaining mentions are dated history
   (#82's own note and `packages/solidaria/CHANGELOG.md`) and were checked and
   left. This line exists so the next reader does not re-check it. Close it by
   confirming once, or by correcting the `installed-comparison-deps-lag-pin`
   memory entry if it is still reachable.
8. **`r2-certified-a/r2a-6`** — `apps/comparison/e2e/drivers/dom-oracle.ts:1-9`
   documents a `data-*` ignore policy and exports
   `ORACLE_IGNORED_DATA_ATTRIBUTES` for it; nothing imports the constant. The
   real filter is the positive allowlist at
   `apps/comparison/e2e/drivers/journeys.ts:74-99`, applied in
   `journeys-observe.ts:400-403`, which happens to exclude `data-rac` anyway.
   Behaviour is right and the documented mechanism does not exist, so a reader
   reconciling an attribute finding against that comment reads a rule enforced
   somewhere else. Delete the constant and fold its paragraph into the
   `RAC_STATE_DATA_ATTRIBUTES` comment, where the rule lives.
9. **`r2-guards/r2-guards-5`** — `scripts/scratch-dir.mjs` anchors containment
   on `realPath(tmpdir())`, and Node reads `tmpdir()` from `TMPDIR`/`TMP`/`TEMP`,
   the same environment the override comes from, so two misconfigured variables
   put an unrelated directory inside the allowed root and the delete lands on
   it. Constrain the victim as well as the location: require the resolved path's
   last segment to be one of the names these scripts own
   (`viviana-ui-packs-chain`, `viviana-ui-consume-smoke`,
   `viviana-ui-pack-stage-*`). Residue of #139, which is merged.
10. **`r2-guards/r2-guards-6`** — with `VIVIANA_PACK_STAGE` unset the stage is
    `mkdtempSync`'d per run (`scripts/pack-local-chain.mjs:21-23`), so the
    `rmSync`/`mkdirSync` pair at `:130-133` clears a directory that is already
    new and nothing removes it at exit — `:168` only prints it. Drop the
    redundant pair and delete `stageRoot` at exit, keeping it only when
    `VIVIANA_PACK_STAGE` was supplied or a `--keep-stage` flag asks. Residue of
    #139.

## Done when

Each of the ten is either landed with its own proof or has a dated line here
saying why not.

## Proof

Per item, in the commit that closes it.

## Relationship

Child of #544. Off the RC path: nothing here gates a gate. It exists so that
"no finding without an owner" stays true without ten more board rows. Items 9
and 10 are the residue of #139, which is merged and carries the note that points
here.

## Closeout

2026-10-07.

1. Landed in both ButtonGroup twins. `vp test run packages/solid-spectrum/test/ButtonGroup.test.tsx` 3 passed. `vp test run packages/viviana-ui/test/ButtonGroup.test.tsx` 3 passed.
2. The guard counts `_s2Cleanups` function bodies. `vp test run scripts/check-s2-cleanups-strand.test.ts` 7 passed.
3. The same run reports a body that pushes and then falls off the end. A throw is still not an exit.
4. Not split. On 2026-10-07 `dom.ts` does not reach `focus.ts`, nothing imports `focus.ts` back, and `openLink` imports `./dom`.
5. Not edited. On 2026-10-07 the `display:contents` group is live in `Popover.tsx`, the comment matches RAC `Overlay.tsx:76-81`, and upstream `Popover.tsx:375` still uses `display:contents`.
6. Not narrowed. On 2026-10-07 pnpm 11.22 treats `*` as not satisfying `2.0.0-rc.9`, and the pinned RC range as satisfying it, so the edit would hide the 17 `apps/web` unmet `solid-js` rows that `check-peers` still has to keep.
7. Confirmed, not rewritten. On 2026-10-07 the catalog, `upstream-sync.md`, `scripts/upstream-pin.json`, and the guard fixture already quote the current train, and the memory description already names it. Older 1.5.1 / 1.19.0 citations stay where they record history or a class suffix.
8. Landed. The unused ignore constant is gone and the allowlist comment carries the rule.
9. Landed. A temp path whose last segment is not `viviana-ui-packs-chain`, `viviana-ui-consume-smoke`, or `viviana-ui-pack-stage-*` is refused before any delete.
10. Landed. An ephemeral stage is created once and removed at exit, and kept when `VIVIANA_PACK_STAGE` is set or `--keep-stage` is passed. `vp test run scripts/scratch-dir.test.ts` 12 passed.
