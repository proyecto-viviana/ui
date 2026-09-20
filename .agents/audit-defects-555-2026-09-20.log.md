# #555 audit defects — log

Brief: conductor, 2026-09-20, queue item 3 (handoff §6). Ticket
`.claude/tickets/tasks/555-fix-the-confirmed-overlay-dialog-and-link-defects.md`,
rows in `.agents/audit-2026-09-20/VERIFIED.md`. First four defects, in the
ticket's order, one commit each: red test → fix → green → changeset. Only the
touched test files are run; the detached whole-suite run holds the heavy slot.

## 1 — Modal uses createPreventScroll

Upstream read first: `react-spectrum/packages/react-aria/src/overlays/useModalOverlay.ts:65-67`
calls `usePreventScroll({isDisabled: !state.isOpen})`. `usePreventScroll` keeps
a module-level `preventScrollCount` and one `restore`, so every open overlay is
a holder of a single document lock; it also handles the scrollbar gutter
(`scrollbar-gutter: stable`, else `padding-right`) and the mobile-Safari path.

Ours (`packages/solidaria-components/src/Modal.tsx:489-507`) set
`document.documentElement.style.overflow = "hidden"` directly and restored the
value it captured on open. We already ship the faithful port,
`createPreventScroll` in `@proyecto-viviana/solidaria` — the one-off simply did
not use it.

Red test, `Modal.test.tsx` → "should keep the page locked while open when
another scroll lock releases": an independent `createPreventScroll` holder takes
the lock, a Modal opens, the independent holder disposes. On the old source the
count drops to 0 and `restore()` gives the page back to the user while the modal
is still open — `expected '' to be 'hidden'`. With the fix the Modal is itself a
holder, the count stays at 1, and the lock holds.

Fix: `createPreventScroll({ get isDisabled() { return !isOpen(); } })`, the
getter keeping the option reactive the way upstream's dependency array does. No
other behavior touched; the two `TextArea.tsx` twins that also write
`style.overflow` are auto-resize, not scroll locks.

Green: `vp test run packages/solidaria-components/test/Modal.test.tsx` → 24/24.
`vp test run packages/solidaria/test/createPreventScroll.test.tsx packages/solidaria-components/test/Dialog.test.tsx`
→ 36/36.
Changeset `.changeset/modal-prevent-scroll.md`.
