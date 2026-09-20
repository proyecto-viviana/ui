Read `/home/emoporemilio/projects/viviana-hub/ui/.agents/audit-2026-09-20/BRIEF.md` first and obey it.

# Lens 5 — Accessibility and security spot check

Artifact: `/home/emoporemilio/projects/viviana-hub/ui/.agents/audit-2026-09-20/lens5-a11y-security.md`

Source-level only. Compare against the upstream implementation under
`react-spectrum/` for every accessibility claim.

Accessibility, in the headless chain first:
1. Overlays (`Modal`, `Popover`, `Dialog`, `Tray`, `Menu`, `ComboBox`, `Picker`,
   `Tooltip`): focus containment and restore, `aria-hidden`/`inert` of the rest
   of the page (`ariaHideOutside` port), Escape and outside-press dismissal,
   scroll lock, and cleanup of all of these when the owner is disposed
   mid-transition under Solid 2.
2. Live regions and announcements (`LiveAnnouncer` port): created once, removed
   on cleanup, SSR-safe.
3. Id generation (`createId`/`useId` port) under SSR, hydration, and streaming:
   collisions, mismatch between server and client, ids referenced by
   `aria-labelledby`/`aria-describedby` that never render.
4. Focus-visible and modality tracking: global listeners added once and removed,
   behavior with multiple documents/iframes and with shadow DOM.

Security:
5. Every `innerHTML`, `outerHTML`, `insertAdjacentHTML`, `dangerouslySet*`,
   `new Function`, `eval`, `document.write`, and `href`/`src` sink fed by a
   prop. Is `javascript:` filtered on links, as upstream does or does not?
6. `apps/web` server code and the Worker config: response headers (CSP, frame,
   referrer, nosniff), any route that reflects input, open redirects in the
   locale rewrite.
7. Scripts that delete or write using a path from an environment variable or
   an argument (`rm -rf`, `rmSync` with `recursive`) — ticket #139 already
   names one; find the rest.
8. Supply chain: `postinstall` scripts, unpinned `npx`/`pnpm dlx` in CI,
   `pull_request_target`, and token scopes in workflows.
