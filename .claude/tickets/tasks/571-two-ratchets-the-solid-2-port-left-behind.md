---
id: 571
type: task
title: "Two ratchets still describe the pre-Solid-2 tree, so idiomatic-solid and examples-purity are red"
created: 2026-09-20
parent: 544
status: next
history:
  - {
      state: open,
      at: 2026-09-20,
      note: "found by the conductor's local ladder walk of 2026-09-20 evening. `vp run guard:idiomatic-solid` EXIT=1 and `vp run guard:examples-purity` EXIT=1, both in about a second, steps 169 and 185 of certification-gates.yml. Filed as one ticket because they are one cause: a ratchet and an allowlist that both describe the tree before the Solid 2 port. Evidence `.agents/chain-walk-2026-09-20/ladder-idiomatic-solid.out.txt` and `ladder-examples-purity.out.txt`",
    }
  - {
      state: next,
      at: 2026-09-20,
      note: "handed to the close-gates writer after #570 merged, as the earliest remaining red: steps 169 and 185, where the ladder now stops. Three things found while handing it over, none of which changes the work. First, every one of the six failing imports is the bare specifier `@solidjs/web` - no subpath among them - so `/^@solidjs\\/web$/` is sufficient today, while the neighbouring `/^solid-js(\\/[a-z]+)?$/` invites mirroring the subpath shape; either is defensible, so say which was taken and why rather than leaving the comment to imply it was forced. Second, `scripts/check-idiomatic-solid.ts:438` does have a `--write-baseline` the ticket forbids: the edit is deleting one line by hand, and the guard's own message already names the owning ticket #192, so `git log -- packages/viviana-ui/src/gridlist/index.tsx` is where the commit that fixed the site is. Third, the split of ownership happens to fall the right way - the repair is in `scripts/`, which is this seat's, and the six files it spares are the public-face worktree's, so nothing here needs coordination. Ladder order after this: #572 at 219, #573 at 227, #574 at 239",
    }
---

## Scope

Two gates, one shape. Neither is a defect in shipped behaviour; both are a
record that stopped matching the tree, which is the class `AGENTS.md` calls
"the tree beats the document".

### 1. `guard:idiomatic-solid` — a baselined site that is now fixed

```
FAIL: 1 baselined site(s) no longer render a children() snapshot (fixed) —
remove them from the baseline:
  packages/viviana-ui/src/gridlist/index.tsx resolved#0 (#192)
```

The baseline in `scripts/idiomatic-solid-children-baseline.json` ratchets both
ways by design: a new site fails, and a baselined site that disappears fails
too, so nobody quietly keeps an entry that stopped being true. Someone fixed
this site and left the entry. 17 other baselined sites still render the
snapshot and stay, each with its owning ticket (#168, #169, #192).

### 2. `guard:examples-purity` — the allowlist has no `@solidjs/web`

Six files fail, all for the same import:

```
apps/web/src/routes/examples/explore-empty.tsx
apps/web/src/routes/examples/explore.tsx
apps/web/src/components/examples/AppShell.tsx
apps/web/src/components/examples/ExamplesShell.tsx
apps/web/src/components/examples/Placeholder.tsx
apps/web/src/components/examples/ThemeToggle.tsx
```

`ALLOWED_IMPORTS` in `scripts/check-examples-purity.ts:31` matches
`/^solid-js(\/[a-z]+)?$/`. Solid 2 moved the DOM runtime out of `solid-js/web`
into the separate `@solidjs/web` package, so an import the allowlist used to
cover is now spelled somewhere it does not reach. The rule the guard defends —
examples compose from `@proyecto-viviana/ui`, and a missing capability is a
library gap rather than something to patch in the app — is untouched by this;
the framework runtime was always allowed.

## Work

1. Delete the `gridlist resolved#0` entry from the children baseline. Do not
   regenerate the file with `--write-baseline`: that would also absorb anything
   else that changed, and the whole point of the ratchet is that each entry was
   looked at. Say in the ticket which commit fixed the site.
2. Add `@solidjs/web` to `ALLOWED_IMPORTS` beside the `solid-js` pattern, with
   a comment naming why it is the same permission and not a new one. **Fix the
   allowlist, not the six files** — five of them are page content under
   `apps/web/src/**`, which belongs to the `public-face` worktree under the
   owner's 2026-09-20 exception, and none of them is doing anything wrong.

If the allowlist edit makes any file fail for a second, different reason, stop
and report it rather than widening further.

## Done when

`vp run guard:idiomatic-solid` and `vp run guard:examples-purity` both exit 0,
with no `--write-baseline` in the diff.

## Relationship

Child of #544, and stage 2 of `.agents/CONDUCTOR-RELEASE-PATH-2026-09-20.md`.
Sibling of #559, #569 and #570. Same family as #566: a guard whose recorded
number stopped describing what it measures.
