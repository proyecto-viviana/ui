---
id: 108
type: task
title: "Port createKeyboard shortcut support"
created: 2026-08-20
parent: 31
status: verified
history:
  - { state: open, at: 2026-08-20, note: "migrated from upstream Train 8 item T-61" }
  - {
      state: in-progress,
      at: 2026-08-20,
      note: "confirmed the local hook lacks the pinned shortcut parser, matcher, and event gates",
    }
  - {
      state: merged,
      at: 2026-08-20,
      note: "ported the pinned parser, hook options, event gates, and browser contract",
    }
  - {
      state: verified,
      at: 2026-08-20,
      note: "focused unit, browser, type, build, layer, and upstream parity checks pass",
    }
---

Port the pinned `createKeyboard` shortcut contract: `shortcuts`,
`allowRepeats`, `allowComposing`, and `createKeyboardShortcutHandler`.

Prove platform modifier matching, composition, repeated keys, disabled handling,
propagation, default prevention, and form behavior against upstream source and
tests. The pinned hook does not render or announce shortcut text. Do not invent
an announcement or `aria-keyshortcuts` surface in this ticket.

## Source packet

- Official vendored documentation:
  `react-spectrum/packages/dev/s2-docs/pages/react-aria/useKeyboard.mdx`.
- Pinned implementation:
  `react-spectrum/packages/react-aria/src/interactions/useKeyboard.ts` and
  `createKeyboardShortcutHandler.ts`.
- Pinned tests: `react-spectrum/packages/react-aria/test/interactions/`.
- Local implementation and tests:
  `packages/solidaria/src/interactions/createKeyboard.ts` and
  `packages/solidaria/test/createKeyboard.test.tsx`.

## Relationship

Blocks repeated collection navigation in #122. Part of Train 8 ticket #82.

## Done when

- `createKeyboard` accepts the pinned shortcut, repeat, and composition options.
- Shortcut parsing and exact modifier matching follow the pinned implementation.
- Focused tests hold parser, dispatch, propagation, composition, repeat, keyup,
  disabled, portal-target, and composed-hook branches.
- A browser contract holds default prevention, event propagation, platform
  `Mod`, form submission, repeat, composition, and disabled behavior.
- The package and comparison app pass their focused build and type checks.

## Verified evidence

- The focused parser and hook suites pass all 54 tests.
- The Chromium contract passes all 3 tests.
- Repository and comparison application type checks pass.
- Astro reports no errors or warnings, and the comparison build emits the new
  `/keyboard-shortcuts/` route.
- The layer-boundary guard passes.
- The upstream-test-parity guard reports no new findings.
- Playwright leaves no preview server running.
