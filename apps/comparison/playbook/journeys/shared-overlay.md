# Shared overlay + selection machinery — journey ledger

ComboBox and Picker (RAC Select) share one set of hooks: RAC `Popover` /
`usePopover` / `useOverlayPosition` / `calculatePosition` / `useOverlay` /
`useInteractOutside` / `useOverlayTrigger` / `ariaHideOutside` /
`usePreventScroll` / `useCloseOnScroll` / `Overlay` / `PortalProvider` /
`DismissButton`, `animation.ts` (`useEnterAnimation` / `useExitAnimation`), RAC
`ListBox` / `useListBox` / `useOption` / `useSelectableCollection` /
`useSelectableItem` / `useTypeSelect` / `ListKeyboardDelegate`,
`useFocusVisible`, `usePress`. They differ only in configuration. Rule #4: this
machinery lives in `solidaria` / `solidaria-components`; a divergence proved by
a journey here is fixed there, once, never per component (#251 is the current
instance of that rule for enter/exit).

| configuration                                                                 | ComboBox                                                           | Select / S2 Picker                                   |
| ----------------------------------------------------------------------------- | ------------------------------------------------------------------ | ---------------------------------------------------- |
| `PopoverContext.placement`                                                    | `bottom start`                                                     | `bottom start`                                       |
| `isNonModal`                                                                  | `true`                                                             | unset (`false`)                                      |
| `data-trigger`                                                                | `ComboBox`                                                         | `Select`                                             |
| `role="dialog"` on the popover                                                | no                                                                 | yes (`tabindex=-1`)                                  |
| underlay / leading Dismiss button                                             | no / no (trailing only)                                            | yes / yes (two)                                      |
| `preventScroll`                                                               | off                                                                | on                                                   |
| `ariaHideOutside`                                                             | `keepVisible(popover)` + `useComboBox` hides outside input+popover | `ariaHideOutside([popover], {shouldUseInert: true})` |
| close on ancestor scroll                                                      | **yes** (`onClose = state.close`)                                  | **no** (`onClose = null`)                            |
| `isDismissable` (outside press)                                               | `false` (close is via input blur)                                  | `true`                                               |
| `FocusScope contain`                                                          | no                                                                 | yes                                                  |
| `--trigger-width`                                                             | input+button union without Group; Group otherwise                  | trigger `ResizeObserver`                             |
| list focus                                                                    | virtual (`aria-activedescendant` on the input)                     | real DOM focus (`tabindex` 0/−1)                     |
| `shouldSelectOnPressUp` / `shouldFocusOnHover` / `allowsDifferentPressOrigin` | true / true / true                                                 | true / true / true                                   |
| `linkBehavior`                                                                | `selection`                                                        | `selection`                                          |
| `disallowEmptySelection`                                                      | list default                                                       | `true`                                               |
| `autoFocus`                                                                   | `state.focusStrategy \|\| true`                                    | `state.focusStrategy \|\| true`                      |
| S2 `hideArrow` / offset (S,M,L,XL) / `shouldFlip`                             | true / 6,6,7,8 / true                                              | true / 6,6,7,8 / true                                |
| S2 mobile tray                                                                | commented TODO                                                     | commented TODO                                       |

## Geometry contract (from `calculatePosition.ts`, `useOverlayPosition.ts`)

For `bottom start` in LTR (`'bottom left'` after `translateRTL`; RTL maps
`start → right`): `top = floor(trigger.top + trigger.height + offset)`, `left =
clamp(trigger.left + crossOffset, …)`, then `getDelta` keeps the overlay inside
`[boundary + 12, boundary − 12]` (`containerPadding` 12; S2 popover
`maxWidth: calc(100vw - 24px)`). Flip when `overlay.height > spaceBelow` and
the flipped space is strictly greater; after a flip `data-placement` is the
primary axis only (`top`). `maxHeight = max(0, boundingRect.bottom − overlayTop −
(margins + padding))`, then position is recomputed once with the clamped
height. **Before the first `calculatePosition`** the style is
`position: fixed; top: 0; left: 0; z-index: 100000; max-height: 100vh` and
`placement` is `null` — RAC gates `isEntering` on `!!placement` so the
pre-placement frame is never visibly faded-in; S2 sets `zIndex: undefined` +
`isolation: isolate`. On every update, styles are written to the DOM
synchronously (`top/bottom/left/right` + `maxHeight` in px), not through a
React commit.

The two owner-defect hypotheses (#248) fall out of this contract:

1. **Transparent list** — `isEntering` or `isExiting` stuck: `useEnterAnimation`
   returns `isEntering && isReady`, completion waits for
   `element.getAnimations().finished`; S2 styles `opacity: 0` while either flag
   is set and `pointer-events: none` while exiting. A port whose flags are not
   owned by the popover (or are timed with `setTimeout`/rAF instead of
   `getAnimations`) can leave the list mounted at opacity 0. Journeys:
   `CB-OV-05`, `PK-OV-04` (steps 1–5 and the 20× fuzz).
2. **List somewhere else** — the pre-placement `fixed; top:0; left:0` frame
   painted, or a stale position after a container/portal change. Journeys:
   `CB-OV-05` / `PK-OV-04` step 1 (never observed at the viewport origin),
   `CB-OC-12` / `PK-OC-15` (portal into a dialog container), `CB-OV-02` /
   `PK-OV-02` (resize recompute), `CB-OV-06` / `PK-OV-05` (maxHeight + scroll
   anchor).

## Ledger → journeys

| shared rows                                                                                                     | proved by                                                                                                                                                  |
| --------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| pos-src-initial-fixed, pos-src-reset-maxh, pos-src-dom-write, time-8                                            | CB-OV-05, PK-OV-04                                                                                                                                         |
| pos-src-update-open                                                                                             | implicit (no style writes while closed: overlay absent)                                                                                                    |
| pos-src-scale-freeze, pos-src-vv-resize, pos-src-webkit-pinch, pos-src-close-while-resize, time-1, time-5       | not emulatable (visualViewport / pinch) → `unit-only` in `solidaria`                                                                                       |
| pos-src-scroll-anchor                                                                                           | CB-OV-06, PK-OV-05                                                                                                                                         |
| pos-src-layout-deps, pos-src-window-resize, pos-src-resizeobserver, pos-3                                       | CB-OV-02, PK-OV-02                                                                                                                                         |
| pos-src-arrow-size, pos-s2-popover-offset-arrow                                                                 | CB-OV-01 (hideArrow → no +8)                                                                                                                               |
| pos-src-rtl                                                                                                     | CB-OV-03, PK-OV-03                                                                                                                                         |
| pos-src-getTargetRect                                                                                           | not used by ComboBox/Select                                                                                                                                |
| pos-rac-data-placement, pos-rac-trigger-width                                                                   | CB-OV-01, PK-OV-01                                                                                                                                         |
| pos-rac-combobox-width                                                                                          | CB-OV-01                                                                                                                                                   |
| pos-rac-select-cfg                                                                                              | PK-OV-01                                                                                                                                                   |
| pos-s2-combobox                                                                                                 | CB-OV-01                                                                                                                                                   |
| pos-s2-picker                                                                                                   | PK-OV-01                                                                                                                                                   |
| pos-s2-zindex                                                                                                   | CB-OV-01, PK-OV-01                                                                                                                                         |
| pos-s2-mobile-tray                                                                                              | CB-OV-07, PK-OV-06                                                                                                                                         |
| pos-rac-dialog-role                                                                                             | CB-OV-04, PK-OC-01                                                                                                                                         |
| pos-1, pos-2, pos-4–pos-8, pos-calc-_, pos-c-_ (121-row matrix)                                                 | hook unit tests (`solidaria` `useOverlayPosition` / `calculatePosition`) — port the matrix verbatim there                                                  |
| scr-1, scr-2, scr-3, scr-src-nonmodal, scr-src-inside-overlay, scr-src-input, scr-src-gate                      | CB-OC-10                                                                                                                                                   |
| scr-4, scr-5 (document / window scroll targets)                                                                 | CB-OC-10 (`scrollPage` is a window scroll)                                                                                                                 |
| scr-6, scr-popover-modal                                                                                        | PK-OC-13 (modal never closes on scroll), CB-FB-05 (non-modal never locks)                                                                                  |
| scr-7, scr-8, scr-9                                                                                             | `unit-only` (`useOverlayTrigger` back-compat map)                                                                                                          |
| scr-prevent-1, scr-prevent-src-standard                                                                         | PK-OC-13                                                                                                                                                   |
| scr-prevent-2, scr-prevent-3 (nesting counts)                                                                   | PK-OC-15 (dialog + picker both modal; overflow restored only after both close)                                                                             |
| scr-prevent-4                                                                                                   | CB-FB-05                                                                                                                                                   |
| scr-prevent-src-ios*, evt-6                                                                                     | not emulatable → `unit-only`                                                                                                                               |
| dis-1                                                                                                           | PK-OC-01 (focus goes to the list, not the popover)                                                                                                         |
| dis-2, dis-src-interact-start, dis-io-1, dis-io-3, evt-1                                                        | PK-OC-04                                                                                                                                                   |
| dis-3, dis-4 (`shouldCloseOnInteractOutside`)                                                                   | `unit-only` (not exposed by Select/ComboBox)                                                                                                               |
| dis-5, dis-io-6, dis-io-src-trigger                                                                             | CB-OC-11                                                                                                                                                   |
| dis-6                                                                                                           | CB-OC-12, PK-OC-15                                                                                                                                         |
| dis-7, dis-8                                                                                                    | PK-OC-02 (Escape closes), CB-OC-03                                                                                                                         |
| dis-src-kbd-disabled                                                                                            | `unit-only` (not exposed)                                                                                                                                  |
| dis-src-blur                                                                                                    | PK-OC-14, CB-OC-11                                                                                                                                         |
| dis-src-right-click, dis-io-2                                                                                   | PK-OC-04, CB-OC-11                                                                                                                                         |
| dis-io-4, dis-io-5 (mouse fallback / touch emulation)                                                           | PK-OC-03 (tap outside variant to add), else `unit-only`                                                                                                    |
| dis-io-src-inside, evt-io-inside                                                                                | PK-OC-01 (click option does not dismiss-by-outside)                                                                                                        |
| dis-io-src-top-layer, dis-io-src-disconnected                                                                   | `unit-only`                                                                                                                                                |
| dis-rac-click-body, dis-rac-focus-restore                                                                       | PK-OC-04                                                                                                                                                   |
| dis-dismiss-1                                                                                                   | CB-OV-04, PK-OC-13                                                                                                                                         |
| dis-dismiss-2–4                                                                                                 | `unit-only` (`DismissButton` labelling props)                                                                                                              |
| dis-rac-dismiss-btns, dis-rac-underlay                                                                          | CB-OV-04, PK-OC-13                                                                                                                                         |
| dis-trigger-aria, dis-overlay-id                                                                                | CB-OC-01, PK-OC-01                                                                                                                                         |
| hide-src-popover, hide-src-keepvisible                                                                          | CB-FB-05                                                                                                                                                   |
| hide-src-inert                                                                                                  | PK-OC-13                                                                                                                                                   |
| hide-src-live                                                                                                   | CB-AX-01 / CB-AX-02 (the live announcer is never hidden while the ComboBox is open — assert `ax.live` still receives text)                                 |
| hide-1–hide-15, hide-sd-*, hide-src-stack, hide-src-row, time-9                                                 | hook unit tests (`solidaria` `ariaHideOutside`)                                                                                                            |
| anim-src-enter, anim-src-enter-empty, anim-src-exit, anim-src-reopen, anim-s2-keyframes, time-3, time-6, time-7 | CB-OV-05, PK-OV-04                                                                                                                                         |
| anim-1, anim-src-skip, anim-rac-hidden                                                                          | `unit-only` (prop override / `PreviewTrigger` / hidden collection)                                                                                         |
| port-src-nested-dialog                                                                                          | CB-OC-12, PK-OC-15                                                                                                                                         |
| port-src-focus                                                                                                  | CB-OV-04, PK-OC-12, PK-OV-04                                                                                                                               |
| port-src-z                                                                                                      | CB-OV-01, PK-OV-01                                                                                                                                         |
| port-1, port-2, port-src-default, port-src-null-clear, port-src-sub, port-pressable                             | `unit-only`                                                                                                                                                |
| sel-1, sel-2, sel-sof-21 (autofocus selects when `selectOnFocus`)                                               | `unit-only` — ComboBox/Select lists use `toggle` behaviour (`selectOnFocus` false), asserted negatively in CB-NAV-01 / PK-NV-01 (navigation never selects) |
| sel-3                                                                                                           | CB-NAV-05, PK-OC-02                                                                                                                                        |
| sel-4, sel-replace-arrow, sel-alt, sel-shift, sel-win-ctrl, sel-mac-meta, sel-longpress                         | RAC ListBox surface (`solidaria-components` ListBox tests); not reachable through ComboBox/Picker                                                          |
| sel-5                                                                                                           | CB-NAV-01 (`shouldFocusWrap`)                                                                                                                              |
| sel-6                                                                                                           | CB-NAV-03, PK-NV-02                                                                                                                                        |
| sel-7                                                                                                           | CB-SEL-07 (`unit-only` for multi toggle)                                                                                                                   |
| sel-8, sel-scroll-restore                                                                                       | `unit-only` (standalone listbox focus-in)                                                                                                                  |
| sel-arrow-src-none                                                                                              | CB-OC-08, PK-NV-01                                                                                                                                         |
| sel-arrow-h                                                                                                     | CB-NAV-04, PK-NV-07                                                                                                                                        |
| sel-home-end, sel-page, sel-home-replace                                                                        | CB-NAV-03, PK-NV-02                                                                                                                                        |
| sel-mod-a                                                                                                       | PK-NV-07                                                                                                                                                   |
| sel-esc, sel-esc-modal                                                                                          | PK-NV-08, CB-SEL-03                                                                                                                                        |
| sel-tab, sel-tab-allow                                                                                          | CB-FB-01, PK-OC-12                                                                                                                                         |
| sel-disabled-all, sel-disabled-item-md                                                                          | CB-NAV-02, PK-NV-03                                                                                                                                        |
| sel-disabled-sel                                                                                                | `unit-only`                                                                                                                                                |
| sel-virtual                                                                                                     | CB-OC-08 (virtual), PK-NV-01 (real)                                                                                                                        |
| sel-autofocus-coll                                                                                              | PK-OC-01 (listbox focused when nothing selected)                                                                                                           |
| sel-scroll, sel-virtualized                                                                                     | CB-NAV-08, PK-NV-06, PK-NV-05                                                                                                                              |
| sel-link                                                                                                        | CB-NAV-09, PK-SV-08                                                                                                                                        |
| sel-action                                                                                                      | `unit-only`                                                                                                                                                |
| sel-press-up, sel-diff-origin, sel-virt-press                                                                   | CB-NAV-05, PK-SV-01                                                                                                                                        |
| sel-hover, sel-focus-ring                                                                                       | CB-NAV-05, PK-NV-04                                                                                                                                        |
| sel-press-data, sel-attrs                                                                                       | CB-OC-01, PK-OC-01 (`data-*` set compared by the oracle)                                                                                                   |
| sel-grid, sel-horiz, sel-falsy                                                                                  | ListBox surface; sel-falsy also PK-SV-04                                                                                                                   |
| sel-mousedown-sb, evt-5                                                                                         | PK-NV-09                                                                                                                                                   |
| sel-child                                                                                                       | `unit-only`                                                                                                                                                |
| type-src-timeout, type-src-miss                                                                                 | PK-TA-01                                                                                                                                                   |
| type-src-filter                                                                                                 | PK-TA-03                                                                                                                                                   |
| type-src-space                                                                                                  | PK-TA-02                                                                                                                                                   |
| type-src-rtl                                                                                                    | PK-TA-01 under `ar-AE` (same steps)                                                                                                                        |
| foc-1–foc-5 (window/tab visibility)                                                                             | `unit-only` (`useFocusVisible` tests)                                                                                                                      |
| foc-6, foc-7, foc-src-keys, foc-src-pointer                                                                     | CB-NAV-05, PK-FB-01 (`focusVisible` after key vs pointer)                                                                                                  |
| foc-src-virtual-click, foc-src-virtual-focus, foc-src-iframe                                                    | `unit-only`                                                                                                                                                |
| foc-press-prevent                                                                                               | CB-NAV-05 (options), CB-OC-02 (trigger)                                                                                                                    |
| foc-press-virtual                                                                                               | CB-TCH-01                                                                                                                                                  |
| foc-press-focus-default                                                                                         | PK-OC-01                                                                                                                                                   |
| evt-2                                                                                                           | PK-TA-01, PK-TA-02                                                                                                                                         |
| evt-3                                                                                                           | CB-NAV-09, PK-SV-08                                                                                                                                        |
| evt-4                                                                                                           | CB-NAV-05                                                                                                                                                  |
| evt-7                                                                                                           | `unit-only` (focus-scope restore event)                                                                                                                    |
| time-2                                                                                                          | PK-TA-01                                                                                                                                                   |
| time-4                                                                                                          | CB-NAV-08, PK-NV-06                                                                                                                                        |
| time-10                                                                                                         | `unit-only`                                                                                                                                                |
| ListBox RAC surface (40 rows)                                                                                   | `solidaria-components` ListBox certified suite (#249 decides which become journeys on the ListBox route)                                                   |

## Corrections found while composing

- ComboBox ledger **OV020** contradicts `dis-rac-dismiss-btns`; verified at
  `react-aria-components/src/Popover.tsx:353-357`: the trailing `DismissButton`
  is always rendered, the leading one only when `!isNonModal`.
- Shared ledger **hide-4** text is self-correcting mid-row; the test's
  expectation is that an author-set `aria-hidden` is left in place by
  `revert()`. Read the test (`ariaHideOutside.test.js:116-146`) before porting.
