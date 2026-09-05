---
id: 443
type: initiative
title: "Ship the 2026-09 release train"
created: 2026-09-03
status: open
history:
  - {
      state: open,
      at: 2026-09-03,
      note: "opened to publish the pending 83 changesets after PR #33; scheme forbids initiative→initiative parent, so #32 is Relationship not parent",
    }
  - {
      state: open,
      at: 2026-09-05,
      note: "No publish tonight. Counted 112 unpublished changesets on HEAD 030c200b (211 ahead of origin/main). guard:release-prerequisites PASS; Kumo 0.0.0 is not a publish candidate. Certified postcard still 0f1e1198 (#194). Do not ship the pile.",
    }
  - {
      state: open,
      at: 2026-09-05,
      note: "Honest form-validation/Radio slice prepared on local main (HEAD db66c830+). #472 SSR Form inherit, #475 CheckboxGroup aria, #351/#376 D14 walks. Did not version or publish: postcard still 0f1e1198, D14 subset is not the certified suite, 112 unpublished changesets remain, do not bump Kumo 0.0.0. Do not push this train until Certification Gates can fail closed without firing Release on the pile.",
    }
---

Publish the pending changesets for the six public packages from PR #33
`audit-2026-09-round-2` head `87da0f75`, via merge → same-SHA gates →
regenerated version PR #32 → publish.

2026-09-05 count on `030c200b`: **112** unpublished changesets, not 83.
Workspace Kumo stays `0.0.0` (name-reservation only). That pile is not one
honest product slice. Certified-suite postcard is still `0f1e1198` (#194).
No npm publish and no push on 2026-09-05.

## Ordered work

1. #444 Make the dependency audit survive registry slowness
2. #445 Restore the ListView row selection checkbox name (parent #24)
3. #446 Re-sync cardview and HelpText into viviana-ui (related #1; a task cannot parent a task)
4. #447 Record Kumo npm and trusted-publisher evidence (related #37; a task cannot parent a task)
5. #448 Merge PR #33 and publish the six packages
6. #449 Open the VIVIANA UI docs page from the landing (parent #26; not bound — #40 / #45 / #88 Done-when differ)
7. #450 Stop the comparison app loading every component per page (parent #26; not bound — #250 / #255 / #261 / #262 Done-when differ)

No open or in-progress ticket already had the same Done-when. Related
tickets stay linked; they are not this train.

## Done when

The six public packages are published at the versions the regenerated #32
records. The Release workflow run is green. Evidence is recorded on this
ticket.

## Relationship

Parent intent is #32 (scheme: an initiative parent must be a milestone;
none exists). Siblings #81, #37, #1, #24, #26.
