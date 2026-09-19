---
id: 531
type: initiative
title: "Solid 2.0 foundation upgrade vanguard"
created: 2026-09-13
status: in-progress
history:
  - {
      state: open,
      at: 2026-09-13,
      note: "opened to prepare the ui foundation as the vanguard for the ecosystem upgrade to Solid 2.0",
    }
  - {
      state: open,
      at: 2026-09-19,
      note: "Mechanical Solid 2 APIs through all seven pack packages; unit tests green; vp pack:local-chain + ui:consume-smoke (DOM+SSR, vite-plus-core CLI) green. #532 merged. #533–#537 (MaybeAccessor, SlotContext, one-read, 2118 recert) still open. @solidjs/diagnostics declared so vp dev auto-enables /__solid/diagnostics.",
    }
  - {
      state: in-progress,
      at: 2026-09-19,
      note: "bounded #542 harness slice explicitly restores hydratable Solid test compilation and corrects Disclosure/Meter assertion layers; full hydration remains red and #536/#531 completion requirements remain active",
    }
  - {
      state: in-progress,
      at: 2026-09-19,
      note: "#542's authorized test-infrastructure extension repairs the Solid 2 helper lifecycle and makes verification fail closed; fresh SSR is 48/48, while full hydration is honestly 33/50 with 17 product-owner failures awaiting named-path authorization, so initiative acceptance remains open",
    }
  - {
      state: in-progress,
      at: 2026-09-19,
      note: "#542 review corrections now pass 15 independent helper regressions; fresh full SSR is 48/48 and hydration 38/55 with 17 failures. Earlier direct-product-owner attribution is superseded by shared-hook/Breadcrumbs source evidence; static ListView and Tabs remain unresolved. Product-source extension, #536 scope, and all initiative acceptance requirements remain open",
    }
  - {
      state: in-progress,
      at: 2026-09-19,
      note: "owner adopted foundation-first sequencing and approved #542's four-path shared-hook/Breadcrumbs product repair. #139 precedes packaging and #194/#537 retain fail-closed same-revision proof; all explicit foundation requirements, #536's separate inventory/removal and conditional/render-prop coverage, and the live 2177-case zero-waiver bar remain active",
    }
  - {
      state: in-progress,
      at: 2026-09-19,
      note: "#542 four-path repair now has fresh focused SSR 18/18 plus refreshed Breadcrumbs 1/1 and focused hydration 18/22, down to four failures with all assertions retained; complete fresh lanes remain pending focused success. No foundation acceptance, workaround retirement, certified run, or held-task authorization is inferred",
    }
  - {
      state: in-progress,
      at: 2026-09-19,
      note: "#542's subsequent owner-approved bounded extension passes focused SSR 5/5 and hydration 14/14, followed by fresh complete SSR 48/48 then hydration 56/56. This is source-worktree proof, not committed acceptance. All explicit child/build requirements, #536 inventory/removal, #139 packaging safety, and #194/#537 fail-closed same-revision live 2177-case zero-waiver proof remain active",
    }
  - {
      state: in-progress,
      at: 2026-09-19,
      note: "#542's authorized two-test cleanup extension resolves the remaining owning ordinary proof: 11/11 complete affected tests and 171/171 affected suite, then fresh complete SSR 48/48 and hydration 56/56 with one worker. Source-worktree evidence awaits conductor acceptance; all child/build requirements, #536 inventory/removal, #139 packaging safety and #194/#537 live 2177-case zero-waiver same-revision proof remain",
    }
  - {
      state: in-progress,
      at: 2026-09-19,
      note: "owner authorized #542's bounded green repair for commit/push: SSR 48/48, hydration 56/56, owning ordinary 171/171 and ecosystem gate 38/38. #542 is merged, not verified: final review retains its all-migrated-test node-identity coverage obligation. This initiative remains in-progress with every child/build requirement, #536 inventory/removal and #194/#537 live 2177-case same-revision zero-waiver acceptance intact",
    }
---

Upgrade the shared foundation (`solid-stately`, `solidaria`, `solidaria-components`)
and styled libraries to Solid 2.0.

## Done when

All four layers build, pass SSR/hydration, and satisfy the live 2,177 certified
interaction parity tests on the Solid 2.0 reactive runtime without Solid 1.x
hydration context counter workarounds.

## Relationship

Orchestrates #532 through #537. Prepares the vanguard foundation before rolling
out changes across the broader Viviana ecosystem.
