---
id: 633
type: task
title: "Ship component styles without font faces"
created: 2026-10-08
parent: 32
priority: high
status: next
history:
  - {
      state: open,
      at: 2026-10-08,
      note: "Owner requested reproduction, tested repair, and release reporting for Visualmode's October requests.",
    }
  - {
      state: next,
      at: 2026-10-08,
      note: "Queued with the top Visualmode consumer work before the next RC, following active source work and qualification blockers.",
    }
---

## Scope

UI owns Visualmode G17: an additive CSS entry in both styled Adobe-family
packages, importing theme.css then styles.css without font-faces.css. Confirm
source, build/copy, exports, packed artifacts, and installed upstream S2.
Owner-approved public name (2026-10-08): components-no-fonts.css in both packages,
containing theme.css and styles.css only. Existing separate theme.css and styles.css
exports are the supported interim composition. Name exact source, export,
build/test, documentation, and styled-twin paths before dispatch. Preserve
existing components.css; no dependencies, font changes, or consumer edits.

## Done when

The approved entry resolves from both packed packages and includes their
theme and component styles with no transitive font-faces import. A fresh
browser page using only that entry attempts no requests to fonts.googleapis.com
or use.typekit.net. Existing full CSS entry remains usable.

## Proof

Test actual copied/generated CSS, packed export resolution, and recursive
local imports. Prove the current components.css external-font dependency and
observe a fresh packed-consumer browser from before navigation through
document.fonts.ready and interactions. Fail on attempted external font requests,
even if blocked. Confirm visible component styling and theme tokens. Run package
artifact/sourcemap, layer-boundary, and out-of-workspace consumer checks as
part of qualification. Report published versions and the exact consumer import.

## Relationship

Child of #32; prioritized by #87 after consumer correctness defects and before
next-RC publication. Producer for Visualmode #10187 and owner ruling 281.
Source request in the hub:
visualmode/visualmode/.agents/ui-requests-2026-10-07/G17-components-sheet-without-font-faces.md.
Visualmode supplies Geist Mono and currently imports components.css in
src/styles/design-system.css. Patch Changesets cover both styled packages;
rollback preserves the existing components.css contract.
