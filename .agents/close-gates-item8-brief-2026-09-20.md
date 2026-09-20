# Brief — #555 item 8, read against upstream and against the tree

Conductor, 2026-09-20. Items 1–7 are done and pushed; `c8e9e2a9` is on
`origin/main`. Item 8 is the last one, and it is five unrelated things. Each is
below with the upstream answer and with what the tree actually holds right now,
so you start from the answer instead of hunting. Take them in this order; they
are independent, so commit each on its own.

One thing first, because it cost a leg: a scratch file
`packages/solid-spectrum/test/__dbg.test.tsx` existed in this checkout at
16:45 and was gone by your 16:46 commit. It reddened the conductor's `check`
leg on a file that is in no commit, and — worth knowing for its own sake — it
matched the suite's `packages/**/test/**/*.test.{ts,tsx}` include glob, so
while it existed it was a live test in every run. Keep debug scratch out of
`packages/**/test/`; put it under `.agents/` or the scratchpad.

## 8.1 — The `Portal` `ref` in `Popover.tsx` is dead. Delete it.

`packages/solidaria-components/src/Popover.tsx:889-895`:

```tsx
<Portal
  mount={portalContainer()}
  ref={(el: HTMLElement) => {
    // RAC Overlay uses createPortal with no wrapper. Solid Portal always
    // inserts a div; display:contents lets the overlay stack in the mount
    // the way RAC does, so the list is not painted under the page.
    el.style.display = "contents";
  }}
>
```

That comment states the opposite of what is true. Verified in the installed
runtime:

- `node_modules/@solidjs/web/types/index.d.ts:78-81` —
  `Portal(props: { mount?: Element; children: JSX.Element })`. No `ref`.
- `node_modules/@solidjs/web/dist/web.js:1980` `portalImpl` — three
  `document.createTextNode("")` markers, no `createElement`, and it never reads
  `props.ref`.

It typechecks only because `jsx.d.ts` declares `ref?: Ref<unknown>` on
`JSX.IntrinsicAttributes`, i.e. on every component. So the callback has never
run under Solid 2 and `el.style.display = "contents"` has never been applied.

Delete the `ref` prop and the comment. Do **not** replace the comment with a
new claim about layout — write what is true, which is that Solid 2's Portal
splices children into the mount between markers, so there is no wrapper to
style, and that this matches RAC's `createPortal`.

**Proof, and it is the interesting part of this item:** the assertion is "this
code was dead", so the proof is that removing it changes nothing.
`packages/solid-spectrum/test/__snapshots__/regression.test.tsx.snap` already
records the no-wrapper DOM (it was re-blessed in `163f4377`). Run the
regression suite with **no `-u`** and show it green. If a snapshot moves, the
ref was not dead and this item needs rethinking — say so rather than blessing.

## 8.2 — Re-expand the squashed `createToastRegion` header.

`packages/solidaria/src/toast/createToastRegion.ts:42` is 348 characters: a
closing brace followed by a whole JSDoc block, its paragraphs and its fenced
`@example`, run together on one line. Prettier leaves it because it is all
inside a comment, so `check` cannot see it.

This is not cosmetic. The public API reference is generated from the TS checker
and its doc comments (`vp run api:extract`, blocking `guard:api-reference`), so
the description and the example for this hook are emitted as one unparsable
run-on. Re-expand the block; proof is the emitted JSON for the
`createToastRegion` page showing the description and the `@example` as separate
lines.

## 8.3 — The dead imports, and `noUnusedLocals`. Read the measurement first.

The mechanism is the **extends target**, not a missing key:

- `packages/solidaria/tsconfig.json` extends `../../tsconfig.typecheck.json`,
  which sets `"noUnusedLocals": false`.
- `packages/solid-spectrum/tsconfig.json` extends the root `../../tsconfig.json`,
  which sets `"noUnusedLocals": true`.

That is why solidaria's own check is green and the signal only appears when a
downstream package compiles it.

The audit lens says "12 unused bindings across 8 files". That was
solid-spectrum's transitive view. Measured here, on the whole package:

```
node_modules/.bin/tsc --noEmit -p packages/solidaria/tsconfig.json --noUnusedLocals
→ 73 errors: 65 TS6133, 8 TS6196.  65 in packages/solidaria, 8 in packages/solid-stately.
  No other error class at all.
```

So flipping solidaria onto the root tsconfig costs exactly those 73 and nothing
else — there is no hidden second wave. Most are the codemod residue the lens
described (`createEffect`/`onCleanup` imported beside `createTrackedEffect` and
`_s2Cleanups`), but not all: `createColorSlider.ts:315` has an unused `p`,
`createFocusRestore.ts:11` an unused `getOwnerDocument`,
`createComboBoxState.ts:556` an unused `valueOnFocus`. Read each before
deleting — an unused local can be a dropped write, which is a different bug.

Do the 73, then flip the extends so the class cannot come back. If the flip
turns out to cascade into something beyond these 73, stop, log what it
cascaded into, and leave the flip to a follow-up ticket — the 73 are worth
having either way.

## 8.4 — The `_s2Cleanups` fix has landed; the guard has not.

Check the tree before you start: `packages/solidaria-components/src/Virtualizer.tsx`
now ends that branch with `return () => { for (const c of _s2Cleanups) c(); }`
and a comment saying a bare return would strand the frame and the observer. The
CRITICAL bug itself is fixed.

What item 8 still owes is the **guard**, and there is none — nothing in
`scripts/` and no `guard:` script mentions `_s2Cleanups`. Write one: fail when a
`_s2Cleanups` body contains a `return` statement between its first
`_s2Cleanups.push` and the runner that invokes them. The audit already built
this scanner once (brace-matched, across all `packages/`) and it found exactly
one such body, so you have both the algorithm and its expected answer on a
clean tree — zero.

Wire it in beside the other guards. It needs a fixture that proves it catches
the shape: a guard that has never gone red is a claim, not a proof.

## 8.5 — The CSP nonce. Mirror upstream's names; do not mint any.

`rg getNonce packages` → 0. Still true.

Upstream `react-aria/src/overlays/usePreventScroll.ts:139-150`:

```js
let style = document.createElement('style');
let nonce = getNonce();
if (nonce) {
  style.nonce = nonce;
}
// ... overscroll-behavior: contain ...
document.head.prepend(style);
```

`react-aria/src/utils/getNonce.ts` — a `WeakMap<Document, string>` cache, filled
from `getMetaValue('csp-nonce', ownerDocument)`, plus a `resetNonceCache()`
exported **for testing only**:

```ts
let nonceCache = new WeakMap<Document, string>();
export function resetNonceCache(): void { nonceCache = new WeakMap(); }
export function getNonce(doc?: Document): string | undefined {
  let ownerDocument = getOwnerDocument(doc);
  let nonce = nonceCache.get(ownerDocument);
  nonce ??= getMetaValue('csp-nonce', ownerDocument);
  if (nonce !== undefined) { nonceCache.set(ownerDocument, nonce); }
  return nonce;
}
```

`react-aria/src/utils/getMetaValue.ts` — selector
`meta[name="${CSS.escape(key)}"], meta[property="${CSS.escape(key)}"]`, guarded
by `meta instanceof ownerWindow.HTMLMetaElement`; for the `csp-nonce` key it
prefers `meta.nonce` over `meta.content`, then falls back to
`ownerWindow.__webpack_nonce__ || globalThis.__webpack_nonce__`.

We already have both dependencies: `getOwnerDocument`
(`packages/solidaria/src/utils/dom.ts:97`) and `getOwnerWindow` (`:112`). So
this is two small files under `packages/solidaria/src/utils/` and one call site
in `createPreventScroll.ts:160-167`. No new dependency.

Two constraints. Keep upstream's names exactly — `getNonce`, `resetNonceCache`,
`getMetaValue` — this is a mirror, not a new public name, and minting one is
owner-steered. And note the `instanceof ownerWindow.HTMLMetaElement` check is
cross-realm-sensitive, which is the class of thing that behaves differently
under our two vitest pools; assert on the returned string, not on the element.

Proof: a test with a `<meta name="csp-nonce" content="…">` in the document,
asserting the injected `<style>` carries the nonce, and one without it
asserting no `nonce` attribute is set. Use `resetNonceCache()` between them or
the WeakMap will hand you the first answer twice.

## Standing

- Commit each sub-item on its own, red test → fix → green → changeset where a
  published package changes. 8.3 and 8.4 are tooling and need no changeset.
- Do not run the whole suite. It cannot finish on this box under the committed
  pool; that is #556 and it is measured. Run the packages you touch.
- `README.md`, `CONTRIBUTING.md`, `CREDITS.md` and `packages/*/README.md`
  belong to the `public-face` worktree. Do not edit them.
- Public-facing prose is Fable's. If one of these lands you in a sentence that
  ships, fix the fact and queue the wording in
  `.agents/COPY-QUEUE-2026-09-20.md`.
