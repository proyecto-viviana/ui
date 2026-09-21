---
id: 595
type: task
title: "Dialog labels itself with a trigger id no element carries, and the fix the audit prescribed is the wrong one"
created: 2026-09-21
parent: 544
status: open
history:
  - {
      state: open,
      at: 2026-09-21,
      note: "opened from the 2026-09-21 round-1 audit, receipt `.agents/audit-2026-09-21/round-1-results.md`. Two findings: `components-src/dialog-dangling-labelledby` (medium, partly) and `555-a/dialog-triggerid-dangling` (low, confirmed). `Dialog.tsx:252-261` ends `triggerContext?.triggerRef()?.id ?? triggerContext?.triggerId`; when no trigger registered, it emits the generated `triggerId`, which nothing carries, and the old effect set the attribute only `if (trigger?.id)`. The only registrant is `Button.tsx:481-486`",
    }
  - {
      state: open,
      at: 2026-09-21,
      note: "two corrections the skeptic made, and the second changes the fix. First, the audit cites the wrong commit: `40ac9573` touches no source file at all - `git show --stat` is `.agents`, roadmap, status, a ticket and `check-jsx-ref-dead-code.ts` - and `70a8d478` made the change. Second, and this is the load-bearing one: **the prescribed action would diverge further from upstream, not less.** RAC 1.21.0 `private/Dialog.mjs:59` sets `overlayProps['aria-labelledby'] = triggerProps.id` unconditionally, with no element check at all; it guarantees the id lands by spreading `triggerProps` onto the PressResponder trigger. So dropping the `??` arm is a divergence. The real gap is `Button.tsx:483` assigning `el.id` imperatively in its ref instead of declaratively, which is why the id is absent from server-rendered HTML - and it is more reachable than the audit claimed, because solid-spectrum's ActionButton, ToggleButton and LinkButton never call `dialogTriggerContext.setTriggerRef`, so `triggerRef()` stays null in plain CSR with no SSR needed",
    }
  - {
      state: open,
      at: 2026-09-21,
      note: "deferred to the release after the RC by the owner's soft-launch cut, see #544; the ticket keeps its owner and nothing here is waived or closed",
    }
---

## Scope

1. Make the trigger carry the id the way upstream guarantees it: assign it
   declaratively at `Button.tsx:483` rather than imperatively in the ref, so it
   is present in server-rendered HTML and before the ref runs.
2. Register the trigger from solid-spectrum's `ActionButton`, `ToggleButton`
   and `LinkButton` too, since those are the ones a consumer actually puts in a
   `DialogTrigger` and none of them calls `setTriggerRef`.
3. Add upstream's dev-mode warning for the case that remains — a Dialog with no
   `<Heading slot="title">`, no `aria-label` and no `aria-labelledby`. It is
   dev-only and unreachable inside a `DialogTrigger`, so it is the last item,
   not the first.
4. Leave the `?? triggerContext?.triggerId` arm alone. Say in the commit that it
   mirrors RAC 1.21.0, so the next audit does not file this again.

## Done when

A `DialogTrigger` around each of `Button`, `ActionButton`, `ToggleButton` and
`LinkButton` produces a dialog whose `aria-labelledby` resolves to a rendered
element, in CSR and in the SSR output, proved by a test that resolves the id
rather than asserting the attribute exists.

## Proof

The test run; the `Dialog.mjs:59` line quoted in the commit as the reason the
`??` arm stays.

## Relationship

Child of #544, stage S2-e. Residue of `70a8d478` and of #555. Its existing
coverage — `Dialog.test.tsx`'s `toHaveAccessibleName` — is a genuine assertion
on the solidaria CSR path and stays.
