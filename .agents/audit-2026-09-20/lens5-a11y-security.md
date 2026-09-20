# Lens 5 — Accessibility and security spot check

Audit of `/home/emoporemilio/projects/viviana-hub/ui` against brief
`.agents/audit-2026-09-20/BRIEF.md`. Source-level only. Upstream oracle:
`react-spectrum/`. Working-tree Hover diffs (#534) ignored.

## Coverage

- Overlays: `packages/solidaria/src/overlays/` (`ariaHideOutside`,
  `createModal`, `createOverlay`, `createPreventScroll`,
  `createOverlayTrigger`, `createDismissButton`, `DismissButton`,
  `usePopover`, `OverlayContainer`, `Portal`) vs
  `react-spectrum/packages/react-aria/src/overlays/` and RAC
  `react-aria-components`. Headless `Modal`/`Popover`/`Dialog`/`Tray`/
  `Menu`/`ComboBox`/`Picker`/`Tooltip` in `packages/solidaria-components`.
  Popover FocusScope contain
  `(shouldContainFocus() || overlayContain()) && !isExiting()` matches RAC
  `Overlay.tsx:76-81`. Tray (`solid-spectrum` / `viviana-ui`
  `src/overlays/Tray.tsx`) is a thin `HeadlessModalOverlay` wrapper and
  inherits Modal scroll-lock. Tooltip has no FocusScope (correct).
  ComboBox `ariaHideOutside` omits `shouldUseInert` — matches
  `useComboBox.ts:469-475`. `ariaHideOutside` itself is a close port;
  owner-document `body` is actually better for iframes.
- OverlayContainer / Tooltip SSR: both `isServer`-return before portal
  trees (`createModal.tsx:175-177`, `Tooltip.tsx:546-548`). ModalOverlay
  and Popover were rewritten to `useIsHydrated()` instead. Not reported:
  `Tooltip.hydrate.test.tsx` hydrates `defaultOpen` / `isOpen` routes and
  sibling `createUniqueId` identity holds (`expect(id).toBe(serverId)`).
  OverlayContainer SSR tests
  (`hydrationHooks.ssr.test.tsx:159-197`) intentionally omit portal
  children. `useAnnouncer` (`announce.ts:284`) has the same early return
  but is unused outside its module.
- Live regions: `packages/solidaria/src/live-announcer/announce.ts` vs
  `react-spectrum/packages/react-aria/src/live-announcer/`. Singleton,
  `innerHTML` only clears logs, not auto-removed, `destroyAnnouncer`
  exists. Matches upstream.
- Id generation: `createId`/`createSlotId` in solidaria/solid-stately vs
  React Aria `useId`/`useSlotId`. `createSlotId` probes
  `document.getElementById` in `createTrackedEffect`; matches `useSlotId`.
  `createDescription` registers the effect on both sides then returns `{}`
  on the server (serialized HTML has no `aria-describedby` until the
  client effect; matches `useDescription`). `createAutoFocus` /
  `createFocusRestore` register `onSettled` on both sides and skip
  `onOwnedCleanup` only on the server — cleanup does not allocate
  hydration ids. `createVirtualFocus` skips `createSignal` on the server
  (`createVirtualFocus.ts:194-213`) but is only used from tests/fixtures.
- Focus-visible / modality: `createFocusVisible` /
  `createInteractionModality` vs `useFocusVisible` /
  `useInteractionModality`. Module-load listeners, teardown on
  `beforeunload`; `addWindowFocusTracking` for iframes; both
  focus-visible and iOS preventScroll patch `HTMLElement.prototype.focus`.
  Matches upstream.
- Focus restore: FocusScope `onOwnedCleanup` + rAF. DialogTrigger
  restoreFocus is double rAF (`Dialog.tsx:121-133`).
- XSS sinks: published `innerHTML` is LiveAnnouncer log-clear only.
  Admin Markdown (`apps/web/src/app/admin/Markdown.tsx:223`) is
  `apply: "serve"` / vite-dev-only, escaped, `safeAdminLinkTarget`
  rejects `javascript:` / `//`. Image/Avatar `src` and Link `href` pass
  through (matches upstream; no `javascript:` filter in either tree).
  `createLink`/`filterDOMProps` do not filter `javascript:` — same as
  Adobe. See openLink finding for the keyboard path divergence.
- `apps/web` Worker/server headers, locale rewrite, reflection. Admin
  GET redirects to `/` when not DEV (`admin.tsx:16`). Static redirect
  `viviana-ui/index.tsx` → `/viviana-ui/docs`. No locale-prefixed rewrite,
  no open-redirect. Admin `isReadablePath`/`isWritablePath` block `..`
  and use `realpath`. Plugin `apply: "serve"`.
- Destructive scripts (`rm -rf`, `rmSync` recursive) excluding known
  #139 (`pack-local-chain.mjs`, `consume-pack-smoke.mjs` env-derived
  dirs). Other recursive deletes: `macro-preset-smoke.mjs` hardcoded
  `packages/viviana-ui/test/macro-preset/node_modules`;
  `extract-api-reference.ts` repo-relative `PAGES_DIR`/`ROUTES_DIR`;
  test fixtures under `apps/web/tests`.
- Supply chain: no `postinstall` in any `package.json`. No `npx` /
  `pnpm dlx` in `.github`. No `pull_request_target`. Workflows SHA-pin
  actions. `permissions: contents: read` except `release.yml`
  (`contents: write`, `pull-requests: write`, `id-token: write`;
  `changesets/action` pinned `a45c4d59…` v1.9.0).
- Skipped: runtime/browser verification (brief forbids). Skipped
  uncommitted Hover files. Skipped test-only `innerHTML` snapshot usage
  unless it is a published sink.

## Findings

### HIGH FocusScope still keys off `data-react-aria-top-layer`, so toasts are trapped out of a modal
- where: `packages/solidaria/src/focus/FocusScope.tsx:395`; twins: toast region writes `data-solidaria-top-layer` in `packages/solidaria/src/toast/createToastRegion.ts:234`; `ariaHideOutside.ts:27,122` and `createInteractOutside.ts:166` already use the renamed attribute
- what: `isElementInChildScope` allows focus into a top-layer node via `element.closest("[data-react-aria-top-layer]")`. The port renamed the attribute everywhere else. A toast region is therefore treated as outside the modal FocusScope: Tab/focusin into a toast is yanked back into the dialog.
- proof: `rg -n 'data-(react-aria|solidaria)-top-layer' packages/solidaria/src`. Upstream `react-spectrum/packages/react-aria/src/focus/FocusScope.tsx:494` uses `[data-react-aria-top-layer]` because that is also what RAC toast sets.
- expected: one attribute. Either keep Adobe's name in FocusScope *and* the toast region, or switch FocusScope to `[data-solidaria-top-layer]`.
- blast radius: any Modal/Dialog/Popover-with-contain open at the same time as `ToastRegion`; keyboard users cannot reach toasts.

### HIGH Modal scroll lock is a one-off `overflow: hidden`, not `createPreventScroll`
- where: `packages/solidaria-components/src/Modal.tsx:490-507`
- what: open Modal sets `document.documentElement.style.overflow = "hidden"` and restores the previous string on cleanup. No ref-count, no scrollbar-gutter/padding compensation, no iOS WebKit `touchmove` lock, no `HTMLElement.prototype.focus` patch, no CSP nonce on the iOS style tag. Nested modals clobber each other: the inner close restores `""` while the outer is still open, unlocking background scroll. Popover already calls `createPreventScroll` correctly (`createPopover.ts:220-224`).
- proof: compare with RAC `react-spectrum/packages/react-aria-components/src/Modal.tsx` → `useModalOverlay` → `react-spectrum/packages/react-aria/src/overlays/useModalOverlay.ts:65-67` (`usePreventScroll({ isDisabled: !state.isOpen })`) and `usePreventScroll.ts:40-64`.
- expected: Modal must call `createPreventScroll({ get isDisabled() { return !isOpen(); } })` like the popover path.
- blast radius: every `Modal` / `Dialog` / `Tray` that uses this overlay; iOS Safari page scroll under a dialog; nested dialogs; layout shift when the scrollbar disappears.

### HIGH `createOverlay` drops `isElementInChildOfActiveScope`, so a nested overlay blur-closes its parent
- where: `packages/solidaria/src/overlays/createOverlay.ts:169-184`; `isElementInChildOfActiveScope` is absent from the Solid tree (`rg isElementInChildOfActiveScope packages` → 0)
- what: upstream `useOverlay` refuses to close on `onBlurWithin` when focus moved into a child focus scope (menu inside a dialog, submenu, date-picker calendar). The port only checks `!e.relatedTarget`. FocusScope itself walks the portaled child-scope tree (`isElementInChildScope`), but overlay dismissal never consults it. `createPopover` enables `shouldCloseOnBlur` for modal popovers (`createPopover.ts:132-137`), so a nested Menu/ComboBox opening from a dialog popover will blur-dismiss the parent.
- proof: `react-spectrum/packages/react-aria/src/overlays/useOverlay.ts:148-161` and `FocusScope.tsx:510-512`.
- expected: port and call `isElementInChildOfActiveScope` (needs an `activeScope` pointer, which the Solid FocusScope tree never exposes).
- blast radius: Dialog + Menu, Popover + nested overlay, DatePicker, ComboBox-in-dialog.

### MEDIUM iOS prevent-scroll injects a `<style>` with no CSP nonce
- where: `packages/solidaria/src/overlays/createPreventScroll.ts:160-167`; `rg getNonce packages` → 0
- what: `preventScrollMobileSafari` prepends a raw `<style>` for `overscroll-behavior: contain`. Upstream sets `style.nonce = getNonce()` (`usePreventScroll.ts:140-143`) so the tag survives `style-src 'nonce-…'`. The port has no nonce helper at all.
- proof: `react-spectrum/packages/react-aria/src/overlays/usePreventScroll.ts:139-150` vs Solid `createPreventScroll.ts:160-167`.
- expected: honor the same nonce the app already puts on other runtime styles, or the iOS scroll lock is a no-op under CSP.
- blast radius: iOS Safari consumers of modal Popover (and Modal once it uses this helper) behind a nonce CSP.

### MEDIUM `createOverlay` outside-press closes even if the top overlay changed mid-gesture
- where: `packages/solidaria/src/overlays/createOverlay.ts:109-126`
- what: upstream records `lastVisibleOverlay` on `onInteractOutsideStart` and only `onHide()`s if that same overlay is still the recorded one at pointer-up (`useOverlay.ts:100-126`). It also does not `preventDefault` on start. The port `preventDefault`s on start (can cancel a click that should land on the trigger) and always `onHide()`s on outside press if `allowsCloseOnOutside`, even when a nested overlay already consumed the start.
- proof: side-by-side with `react-spectrum/packages/react-aria/src/overlays/useOverlay.ts:100-126`.
- expected: last-visible tracking; no `preventDefault` on start (upstream only `stopPropagation`).
- blast radius: stacked popovers/menus; click-through to the trigger that opened the overlay.

### HIGH `createDialog` never uses `createSlotId`, so a missing Heading leaves a dangling `aria-labelledby`
- where: `packages/solidaria/src/dialog/createDialog.ts:63-75,124-132`; consumer fallback `packages/solidaria-components/src/Dialog.tsx:245-254`. Heading does stamp `id={id()}` in JSX (`Dialog.tsx:364+`) when it is rendered.
- what: title/content ids are `createUniqueId()` and `aria-labelledby` is always the generated title id unless the caller passed `aria-label` / `aria-labelledby`. Upstream `useDialog.ts:56-60` uses `useSlotId()`, which yields `undefined` when no element with that id is in the DOM, so RAC Dialog (`Dialog.tsx:148-152`) can fall back to the trigger id. The port has `createSlotId` and uses it in ListBox/Select/Menu/Field/Radio — not here. Alertdialog `contentId` is the same dangling-`aria-describedby` shape.
- proof: `rg createSlotId packages/solidaria/src/dialog` → 0. Side-by-side `react-spectrum/packages/react-aria/src/dialog/useDialog.ts:56-60` and RAC `react-aria-components/src/Dialog.tsx:135-152`. The client effect in `Dialog.tsx:245-254` rewrites to the trigger id only after probing the DOM; a Heading that mounts later (conditional slot) races it.
- expected: `createSlotId()` for title and content, then the RAC fallback (`if (!aria-label && !aria-labelledby) use trigger id`).
- blast radius: every Dialog/AlertDialog without a Heading, and alertdialogs without a description `Text` slot. Screen readers announce a labelled-by id that does not exist.

### MEDIUM `createId` skips `createUniqueId` when a default id is passed
- where: `packages/solidaria/src/ssr/index.tsx:90-97`; twin `packages/solid-stately/src/ssr/index.ts:49-54`. Callers that mix a maybe-id with a later generated id in the same owner include `Button.tsx:290-293` (`buttonId` then `progressId`), `createTagGroup.ts:95-97`, `createMenuTrigger.ts:73-74`, `createCalendar.ts:78-80`, `createSelect.ts:127`, `createComboBox.ts:170`, `createNumberField.ts:137`, `createSlider.ts:79`.
- what: `if (defaultId) return defaultId` never calls `createUniqueId()`. Upstream `useId` always calls `useState` + `useSSRSafeId` (`react-aria/src/utils/useId.ts:40-44`) so hook order is stable. Solid 2 hydration ids are sequential per owner — the same rule `useIsHydrated` documents at `utils.tsx:594-596`. A Button with `id` consumes one fewer unique id than a Button without, so any later `createUniqueId` in that owner shifts if the default's presence differs across server and client.
- proof: read `createId`; `rg -n 'createId\(getProps\(\)\.id\)|createId\(untrack' packages`. Not a demonstrated hydration-mismatch test failure with matching props; it is the unconditional-hook contract the rest of the SSR port claims to keep.
- expected: always call `createUniqueId()`, then prefer `defaultId` as the returned string (React Aria's pattern).
- blast radius: any hydrating component that passes an optional `id` into `createId` and then generates more ids in the same owner. Worst if streamed props make `id` appear on one side only.

### MEDIUM `apps/web` Worker stamps none of the comparison-app security headers
- where: `apps/web/src/server.ts:6-11` (bare TanStack `handler.fetch`); `apps/web/wrangler.jsonc` (name `viviana-ui-docs`, no headers). Contrast `apps/comparison/src/worker.ts:9-15,25-40` (`COMPARISON_SECURITY_HEADERS`: nosniff, referrer, `X-Frame-Options: SAMEORIGIN`, Permissions-Policy, COOP) and `withSecurityHeaders`.
- what: production docs at `ui.proyectoviviana.org` leave `X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options` / `frame-ancestors`, and CSP unset in source. No Content-Security-Policy anywhere in `apps/web`. Redirects are static only (`viviana-ui/index.tsx` → `/viviana-ui/docs`; `admin.tsx` → `/` when not DEV) — no locale rewrite, no open-redirect in this tree.
- proof: `rg -n 'Content-Security-Policy|X-Frame-Options|X-Content-Type-Options|Referrer-Policy' apps/web` → 0; same keys exist in `apps/comparison/src/worker.ts`. `rg -n 'throw redirect' apps/web/src`.
- expected: stamp at least the comparison header set on every docs response; add a CSP if the style-macro runtime `new Function` path is truly dead (see next finding).
- blast radius: the public docs Worker. Clickjacking, MIME sniffing, referrer leakage. Not a library-consumer bug.

### MEDIUM S2 style-macro compiles generated CSS JS with `new Function`
- where: `packages/solid-spectrum/src/style/style-macro.ts:527-530`; twin `packages/viviana-ui/src/style/style-macro.ts:527-530`. `apps/web/vite.config.ts:164-171` documents that skipping the Vite macro makes this path run under workerd, which forbids it.
- what: the runtime fallback of Adobe's `style()` macro does `new Function("props", "overrides", js)`. The `js` string is compiler output, not user HTML, so this is not an innerHTML XSS. It does require `script-src 'unsafe-eval'` (or a missing CSP) if a consumer ships the runtime fallback instead of the Vite/parcel macro.
- proof: those line ranges; `rg -n 'new Function' packages --glob '!**/test/**'`.
- expected: keep the macro in every app that SSRs (already true of `apps/web`); treat the runtime `new Function` as a supported-path CSP cost, or delete it from the published bundle if the macro is mandatory.
- blast radius: `solid-spectrum` and `@proyecto-viviana/ui` consumers that forget the Vite plugin. `apps/web` itself fails SSR rather than eval'ing (workerd throws).

### MEDIUM keyboard link activation assigns `window.location.href` / `window.open` instead of clicking the `<a>`
- where: `packages/solidaria/src/utils/dom.ts:572-590`; callers `createPress.ts:792-799` (Space on an `<a>`), `createSelectableItem.ts:286,312`, `createSelectableCollection.ts:153`, `createComboBox.ts:556`.
- what: neither tree filters `javascript:` on `href` (`rg javascript: packages react-spectrum/packages` → 0). Upstream `openLink` (`react-aria/src/utils/openLink.tsx:106-144`) still `dispatchEvent`s a click/keydown on the real anchor so the browser's default link handling applies. The port reads `target.href` and assigns `window.location.href` or `window.open(href, …)`. For `javascript:` / `data:` and `target=_blank`, that is a different sink than a synthetic click.
- proof: side-by-side `dom.ts:572-590` vs `openLink.tsx:106-144`. RAC `RouterProvider` in this repo (`solidaria-components/src/RouterProvider.tsx:112-123`) already uses `dispatchEvent` — only the headless `openLink` diverged.
- expected: port the upstream synthetic-event `openLink` (the RAC copy in `RouterProvider.tsx` is the template). Still no `javascript:` filter, matching Adobe.
- blast radius: Space-activation of links, collection rows with `href`, ComboBox/Select item links. Click path on a native `<a>` is unchanged.

### MEDIUM UNPROVEN Modal `ariaHideOutside` reads a non-reactive `modalRef` let
- where: `packages/solidaria-components/src/Modal.tsx:415-420,548-576`. Overlay enter-animation already uses a `overlayEl` / `modalEl` signal because "a plain closure over `overlayRef` would read `null` if the effect fired first" (`Modal.tsx:220-223,416-419`). `createInteractOutside` / `createOverlay` use `followRef` (`createInteractOutside.ts:43`, `createOverlay.ts:68`).
- what: the aria-hide `createTrackedEffect` tracks `isOpen()` and the `modalRef` let. Assigning the let in `registerModalRef` is not a signal write, so a first run that sees `!modalRef` returns and never retries. ModalContent only mounts under `Show when={isHydrated() && (isOpen() || …)}`, so the common path may set the ref before the effect — unproven without a runtime trace.
- proof: read those lines; `followRef` comment in `packages/solidaria/src/utils/refs.ts:16-18` (`createEffect(() => ref())` runs once with `null`). Brief forbids a browser run.
- expected: `followRef(modalRefAccessor)` or `modalEl()` as the hide-outside input, same as overlay enter animation.
- blast radius: if the timing hits, the rest of the page is not `aria-hidden`/`inert` while a modal is open. Screen-reader users walk the page under the dialog.

## Verdict

Do not cut an rc from this tree until the overlay HIGH trio is fixed. Keyboard and nested-overlay behavior is wrong on supported paths, and every Modal/Dialog/Tray inherits the scroll-lock bug.

Fix first:

1. Modal scroll lock — replace `document.documentElement.style.overflow = "hidden"` with `createPreventScroll` (nested modals currently unlock the page; iOS has no touch lock). Tray inherits this.
2. Overlay keyboard containment — rename FocusScope's `[data-react-aria-top-layer]` to match toast's `data-solidaria-top-layer`, and port `isElementInChildOfActiveScope` into `createOverlay` so a nested Menu/ComboBox does not blur-close its parent.
3. Dialog labelling — switch `createDialog` to `createSlotId` so a missing Heading does not leave a dangling `aria-labelledby` (alertdialog `contentId` too).

The docs Worker headers, style-macro `new Function`, and `openLink` navigation sink can land in the same rc window; they are not library-certification blockers. Supply chain and destructive-script review found nothing beyond ticket #139.


