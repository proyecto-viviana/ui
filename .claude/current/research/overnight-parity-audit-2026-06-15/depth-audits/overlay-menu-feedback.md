# Depth audit slice: overlays, menus, and feedback

## Scope and authority

This slice records the first xhigh read-only pass for `Accordion`, `Disclosure`, `ActionBar`, `ActionMenu`, `Menu`, `Popover`, `Tooltip`, `Dialog`, `ContextualHelp`, and `Toast`. It is not certification: each finding below still needs a failing test or a React-vs-Solid computed contract before the component can be marked ported.

Authorities consulted: installed `@react-spectrum/s2@1.3.0`, `react-aria-components@1.17.0`, `react-aria@3.48.0`, `react-stately@3.46.0`, APG accordion/disclosure/menu/menu-button/toolbar/dialog/tooltip patterns, WAI-ARIA live-region roles, and WCAG 2.2 hover/focus/timing guidance.

## Findings

### OMF-001 — Accordion and Disclosure panel role is an upstream runtime/API ambiguity

Upstream S2 exposes `AccordionItemPanelProps.role?: "group" | "region"`, but the installed S2 runtime forwards the panel through `filterDOMProps`, whose default allowlist does not include `role`. Local styled `DisclosurePanel` explicitly strips `role`, while the lower headless panel can honor a role and defaults to `group`.

Implementation follow-up started: Solid Spectrum `DisclosurePanel` no longer strips the explicit `role` prop before calling the headless panel, so both `DisclosurePanel role="region"` and `AccordionItemPanel role="region"` now preserve the public S2 role API with package-level `aria-labelledby`/`aria-controls` proof. Remaining proof: run the React-vs-Solid Disclosure comparison route in a fully installed browser environment (local Playwright was blocked by missing `@vitejs/plugin-react`) and decide whether to certify upstream runtime parity or keep the styled-layer role forwarding as the public API contract.

### OMF-002 — Menu and ActionMenu keyboard activation bypasses `shouldCloseOnSelect={false}`

Pointer/click item selection respects item/section `closeOnSelect`, but the root menu keyboard handler activates the focused key and calls close from the `Enter`/`Space` path without threading `shouldCloseOnSelect`. Existing coverage proves pointer remain-open behavior, not keyboard remain-open behavior.

Implementation follow-up advanced: menu-level `shouldCloseOnSelect={false}` is threaded into the root keyboard activation branch, and component-layer root keyboard activation now consults the focused item close policy so item-level and section-level `closeOnSelect={false}` remain open while default items close. Hook/component tests cover menu-level `Enter`/`Space`, item-level focused-key `Enter`, section-level focused-key `Enter`, and `menuitemradio`/`menuitemcheckbox` section variants. Remaining proof: React-vs-Solid comparison coverage for the close-policy matrix.

### OMF-003 — Menu section separator rendering is not line-for-line S2

Upstream S2 wraps popover menus in `Popover padding="none" hideArrow` and renders an S2 `Divider` after each `MenuSection`. Local `MenuSection` renders only the headless section, while `MenuSeparator` is a separate hand-authored `li role="separator"` utility-class element.

Required proof: generated S2 divider/separator helper parity, strict pair/computed evidence for sectioned menus, last-child hiding, forced-colors separator styling, and non-focusability.

### OMF-004 — ActionMenu composition and public surface have drifted

Upstream `ActionMenu` is a narrow composition of `MenuTrigger`, `ActionButton`, and `Menu`. Local `ActionMenuProps` extends a broad headless surface plus aliases/data/trigger styling props and custom-renders the trigger, popover frame, providers, and menu.

Implementation follow-up started: the data-driven ActionMenu fallback now renders common object-item fields (`description`, `shortcut`/`keyboardShortcut`, `icon`, `isDisabled`, and link descriptors) instead of label-only items, with package tests proving descriptions, shortcuts, fresh icon render functions, disabled suppression, and `href`/`target`/`rel` forwarding. Remaining proof: API-surface comparison against upstream S2 ActionMenu, documentation/classification of local-only trigger/menu props, and React-vs-Solid comparison routes for the rich object-item matrix.

### OMF-005 — Popover padding wrapper, public API, and portal locale differ

Upstream public Popover exposes `padding?: "default" | "none"`, renders an inner wrapper for padding/overflow/radius inheritance, resets overlay trigger state for children, and assigns `lang`/`dir` on the portal overlay. Local Popover exposes `none/sm/md/lg`, defaults to `md`, applies padding to the outer popover class, includes local header/footer helpers, and relies on Provider root locale even when the portal mounts outside that subtree.

Required proof: computed contracts for default padding, `padding="none"`, overflow, border-radius inheritance, trigger-state reset, portal `lang`, portal `dir`, RTL placement, and nested submenu popovers.

### OMF-006 — Tooltip behavior is strong, but local additions and arrow-boundary exactness remain

The headless Tooltip path aligns on `aria-describedby` while open, `role="tooltip"`, Escape, trigger focus, and locale on the portal element. Remaining drift: upstream places placement/geometry props on `TooltipTrigger`, derives `arrowBoundaryOffset` from rendered border radius, while local `Tooltip` accepts direct placement/control/variant/showArrow props and hardcodes `arrowBoundaryOffset={8}`.

Required decision: mark direct placement/control/variant/showArrow as local additions or remove them from the certified S2 surface. Replace hardcoded boundary offset with measured parity or a token-change regression.

### OMF-007 — Dialog has behavior coverage but S2 layout/style and portal i18n gaps

Upstream `Dialog` has S/M/L/XL sizing, exact `dialogInner` branches (`boxSizing`, `fontFamily`, `borderRadius: inherit`, `flexGrow`), short-height content overflow behavior, footer padding, modal wrapper structure, transition timing, and portal `lang`/`dir`. Local Dialog keeps legacy size aliases and title/onClose additions, with simpler content/footer/modal styling and no styled-layer portal locale assignment.

Required proof: computed contracts for footer padding, `dialogInner` style branches, short-height overflow, modal transitions, and portal locale. Legacy `title`, `onClose`, and non-S2 sizes must be explicitly local additions.

### OMF-008 — ContextualHelp misses upstream arrow hiding and dialog labelling

Upstream `ContextualHelpPopover` renders `Popover padding="none" hideArrow aria-labelledby={titleId}`. Local ContextualHelp omits `hideArrow` and labels the popover with trigger-label `aria-label`, while comparison fixtures differ in heading slot usage.

Implementation follow-up advanced: ContextualHelp and ContextualHelpPopover now pass `hideArrow`; main ContextualHelp popovers also thread `aria-labelledby={titleId}` so a rendered `Heading` names the dialog while no-heading legacy content keeps the trigger-label fallback. Unit tests assert arrow SVG absence, heading-labelled dialog names, and fallback labels for no-heading touch/controlled cases. Remaining proof: add browser comparison routes for heading/no-heading variants and resolve default Heading slot fixture asymmetry before certification.

### OMF-009 — ActionBar role tree and live-announcement timing differ

Upstream S2 `ActionBar` root is a plain div with keyboard props and contains an `ActionButtonGroup`; local headless `ActionBar` applies toolbar semantics to the root and announces whenever open transitions false-to-true. Existing tests prove toolbar behavior, but not whether the accessibility tree and live-announcer timing match upstream.

Required proof: role-tree snapshots for React and Solid, plus live-announcer timing for no `scrollRef`, with `scrollRef`, initial mount, reopen, and selected-count updates.

### OMF-010 — Toast `alertdialog` roots are missing `tabIndex=0`

React Aria `useToast` gives each toast root `role="alertdialog"`, non-modal labelling, and `tabIndex: 0`. Local `createToast` emits the role and labels but not `tabIndex`, even though local region focus recovery searches `[role="alertdialog"]` roots to move focus after removal.

Implementation follow-up started: `createToast` now adds `tabIndex: 0`, and unit/component tests assert the alertdialog root is focusable. Remaining proof: focus transfer/restoration with the real focusable toast root, plus broader browser/AT transcript coverage.

### OMF-011 — Toast timeout rules match, but exit/view-transition parity is deferred

Timeout clamping and no-autodismiss actionable toasts match the upstream model. However, local close/action handlers call close and then remove, so `hasExitAnimation: true` does not leave an observable exiting state on those paths. Certification must decide whether exact S2 view-transition choreography is in scope; if it is, tests need `data-animation="exiting"`, DOM persistence during exit, and `onClose` timing.

## Highest-priority proof queue

1. Menu/ActionMenu keyboard `shouldCloseOnSelect={false}` remain-open tests.
2. ContextualHelp no-arrow and heading-labelled dialog tests.
3. Toast root focusability and focus-recovery tests.
4. Popover/Dialog portal `lang`/`dir` tests.
5. Dialog/Popover computed-style contracts for inner wrappers, padding, overflow, footer padding, and transitions.
6. ActionBar role-tree and live-announcement timing comparison.
7. Accordion/Disclosure `panelRole=region` runtime-vs-type decision and regression.
