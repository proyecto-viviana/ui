/* Defers a subtree past hydration.

   Two @proyecto-viviana/ui collection components cannot be server-rendered at all,
   which took mirror panels 04 and 08 down entirely until this existed. Bisected with
   one case per page load (a mismatch desyncs the hydration key stream, so co-rendered
   cases all report the first failure):

     • `Tab` hydrates only with a TEXT-ONLY child. Give it any element child — an icon,
       a NotificationBadge, static or item-derived, vertical or horizontal, container
       width irrelevant — and the server emits an empty <span></span> where the child
       belongs, then the client throws "Hydration Mismatch. Unable to find DOM nodes
       for hydration key" out of getNextElement.
     • `ListViewItem` never hydrates in the items + render-function form. Not with
       slots, not without; not with `description`, not without; four rows or two;
       inside a Well or bare. A row whose only child is a plain string still fails.

   The alternative was to delete the badge from the nav rail and the icons from the tab
   bar, which is precisely the composition panel 04 is specified to demonstrate — the
   twin would then pass by no longer being the twin. Deferring keeps the real components
   and states the cost: THESE TWO SURFACES DO NOT SERVER-RENDER. That is a parity
   finding about the library, not a property of the design, and it is worth more written
   down than worked around. */
import { createSignal, onMount, Show, type JSX } from "solid-js";

export function ClientOnly(props: { readonly children: JSX.Element }): JSX.Element {
  const [mounted, setMounted] = createSignal(false);
  onMount(() => setMounted(true));
  return <Show when={mounted()}>{props.children}</Show>;
}
