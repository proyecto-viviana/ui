---
"@proyecto-viviana/solid-stately": patch
"@proyecto-viviana/solid-spectrum": patch
---

Toast: animate enter/exit/restack via the View Transitions API (port of the S2 toast animations)

Previously our S2 `Toast` set `translate`/`opacity` instantly, so adding,
removing, expanding, or restacking toasts snapped into place with no animation.
Upstream `@react-spectrum/s2` animates every queue mutation through the View
Transitions API, with a `prefers-reduced-motion` fallback. This ports that
faithfully across two layers:

- **`solid-stately`** — `ToastQueue` gains a generic `wrapUpdate(fn, action)`
  hook (mirroring `@react-stately/toast`), where `action` is the `ToastAction`
  (`'add' | 'remove' | 'clear'`) that triggered the update. The new visible
  toasts are still computed synchronously; only the subscriber fan-out that
  drives the re-render runs inside `wrapUpdate`, so it can be wrapped in a view
  transition without changing what the queue resolves to. A `setWrapUpdate`
  method lets a shared queue (e.g. the global one) attach the wrapper after
  construction. With no wrapper installed the queue notifies exactly as before.

- **`solid-spectrum`** — `ToastContainer` installs a `wrapUpdate` that runs each
  global-queue mutation, plus stack expand/collapse, inside
  `document.startViewTransition()` (the queue mutation is applied via Solid's
  `batch` so the post-state is captured synchronously, the analog of upstream's
  `flushSync`). It adds a `toast-<action>` class to `<html>` so the injected CSS
  can target the transition, tracks `prefers-reduced-motion` (with a
  `PRIVATE_forceReducedMotion` test hook) into the reduced-motion path, and
  tags each toast with a `view-transition-name` / `view-transition-class`
  matching upstream — the numeric queue keys are prefixed (`toast-<key>`) so they
  are valid CSS idents, and background stack toasts gain a per-index suffix under
  reduced motion so the list cross-fades instead of sliding. The upstream
  `Toast.module.css` keyframes, `::view-transition-group()` rules, and global
  `html.toast-*` selectors — none of which the atomic `style()` macro can
  express — are injected once at runtime as a guarded `<style>`, the same idiom
  `solidaria` already uses for `createPress` / `createPreventScroll`.

Where the View Transitions API is unavailable (SSR, jsdom, older browsers) the
mutation runs synchronously, so behavior is unchanged.
