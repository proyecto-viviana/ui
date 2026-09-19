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
  - {
      state: in-progress,
      at: 2026-09-19,
      note: "#542's owner-approved 18-file identity-proof continuation preserves all behavior expectations and exposes four previously undetected node replacements: standalone Picker, Form+Picker, DatePicker and PreviewTrigger. Fresh focused SSR is 36/36 and hydration 33/37 with one worker; product repair awaits a new named-path extension, and complete lanes remain pending focused success. #542 stays merged but unverified; #536's separate inventory/removal, every initiative build/child requirement, #139 packaging safety and #194/#537 live 2177-case same-revision zero-waiver acceptance remain",
    }
  - {
      state: in-progress,
      at: 2026-09-19,
      note: "owner's autonomous-execution instruction permits the justified #542 ref-helper repair and owning regressions. Fresh complete SSR 49/49 then hydration 57/57 pass with strict node identity; the four replacement failures share nested followRef's eager snapshot read, not a provider or DateField defect. All remaining child/build requirements, #536 inventory/removal and conditional coverage, #139 packaging safety and #194/#537 live 2177-case same-revision zero-waiver acceptance remain open",
    }
  - {
      state: in-progress,
      at: 2026-09-19,
      note: "autonomous #536 foundation slice now inventories workaround families and removes the obsolete ElementTag static-tag switch with native Solid 2 dynamic plus owning conditional/render-prop/Provider proof. Fresh complete SSR 51/51 then hydration 59/59 and affected ordinary 183/183 pass with one worker. This is bounded progress, not child/initiative acceptance: #536 still requires stale hydration-state guard migration, allocation-parity and async streaming proof; all other child/build requirements, #139 safety and #194/#537 live 2177-case same-revision zero-waiver gates remain",
    }
  - {
      state: in-progress,
      at: 2026-09-19,
      note: "#536's next bounded slice retires stale private hydration-state guards with supported Solid 2 client-source effects and owner-parity proof. Fresh complete SSR 53/53 then hydration 61/61 and owning ordinary 229/229 pass, one worker. Remaining allocation-parity and actual streaming proof, all sibling/build requirements, attribution reconciliation, #139 packaging safety and #194/#537 live 2177-case same-revision zero-waiver gates still block foundation/release acceptance",
    }
---

Upgrade the shared foundation (`solid-stately`, `solidaria`, `solidaria-components`)
and styled libraries to Solid 2.0.

## Done when

All four layers build, pass SSR/hydration, and satisfy the live 2,177 certified
interaction parity tests on the Solid 2.0 reactive runtime without Solid 1.x
hydration context counter workarounds.

## Remaining gate debt observed 2026-09-19

The bounded #536 retirement passes complete SSR 51/51, hydration 59/59 and
owning ordinary 183/183, but `guard:attribution-headers` remains red with one
exact-source and 63 reviewed-local mismatches on paths unchanged by that slice.
ElementTag's reviewed hash matches. Track separate source/header review and
reconciliation before claiming all foundation/release gates green; do not
bulk-refresh hashes to erase unreviewed drift. Receipt:
`.agents/UI-EXECUTION-536-2026-09-19.md`. This adds no waiver or held-task authority.

## Relationship

Orchestrates #532 through #537. Prepares the vanguard foundation before rolling
out changes across the broader Viviana ecosystem.
