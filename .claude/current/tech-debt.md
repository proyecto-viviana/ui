---
kind: reference
status: current
tasks:
  - id: invented-tailwind-utility-styling
    title: Invented Tailwind-vocabulary utility styling leaks a styling dependency on apps/web's local-utilities.css
    state: in-progress
    filed: 2026-07-09
    priority: P2
    roadmap: recertification
    note: >-
      No Tailwind build exists in the repo (no tailwindcss dep, no config, no
      @tailwind/@apply). Instead, apps/web/src/local-utilities.css (1878 lines)
      hand-rolls Tailwind's utility vocabulary as plain CSS (.bg-accent,
      .text-primary-600, .inline-flex, .gap-N, …), and several library components
      emit those class strings — so they are styled ONLY inside apps/web and render
      unstyled in the comparison app or an external consumer. Violates "mirror
      react-spectrum, don't invent" and the ui-client-contract self-containment
      goal. The faithful mechanism (S2 style macro) already backs 59 solid-spectrum
      files. Invented-token library files: actiongroup, select, menu, listbox,
      steplist, landmark, LogicButton, switch (wrapper); plus viviana-ui custom
      (chip/logo/timeline-item), solidaria-components Breadcrumbs, apps/web (35 src
      + the css itself), apps/comparison chrome.
    exit: >-
      Convert each library styled layer to the S2 style macro (as part of its
      recertification cert), re-style apps/web off local-utilities.css and delete
      it, then add a CI grep-gate that fails if an invented utility token reappears
      in library source. Plan of record: .claude/current/tailwind-removal.md.
      Phase 0 = ActionGroup (CP9.51).
  - id: release-oidc-trusted-publisher-unregistered
    title: npm publish blocked — no OIDC trusted publisher registered for the 5 packages
    state: done
    finished: 2026-07-06
    priority: P0
    filed: 2026-07-06
    roadmap: release-train
    resolution: >-
      RESOLVED via OIDC (path a). Two fixes: (1) owner registered a GitHub Actions
      trusted publisher on all 5 packages (org proyecto-viviana, repo ui, workflow
      release.yml) — cleared the E404. (2) Then hit E422 "Unsupported GitHub Actions
      runner environment: self-hosted" because OIDC auto-enables sigstore provenance,
      which npm only accepts from github-hosted runners; the release job ran on a
      Blacksmith runner. Fixed by switching the release job to ubuntu-latest (commit
      e43d29f0). Run 28836083269 published all 5 at solidaria/-components/solid-stately/
      ui 0.4.0 + solid-spectrum 0.6.0, with signed provenance. Design lesson for
      future release-infra: trusted publishing REQUIRES a github-hosted runner.
    note: >-
      PR #7 (version packages) merged to main (repo now solidaria/solidaria-components/
      solid-stately/ui @0.4.0, solid-spectrum @0.6.0) but the publish step of Release
      run 28834107097 FAILED E404-on-PUT for all 5 packages. Log confirms the workflow
      chose OIDC ("No NPM_TOKEN found, but OIDC is available - using npm trusted
      publishing"); the 404 is npm's unauthorized-publish response because npmjs.com
      has NO trusted publisher registered for these packages. Workflow side is correct
      (id-token: write, npm>=11.5.1). npm still serves the OLD versions (0.3.x / 0.5.3),
      so the version gap is now WIDER than before the merge. Fix = an npm-account action
      (cannot be done from CI/sandbox): EITHER (a) register a GitHub Actions trusted
      publisher on each of the 5 packages (org proyecto-viviana, repo ui, workflow
      release.yml) — zero workflow change, keeps the tokenless design; OR (b) create a
      granular/automation npm token with publish rights to the @proyecto-viviana scope,
      add it as repo secret NPM_TOKEN, and add NPM_TOKEN to the changesets step env.
      Then re-attempt via `gh workflow run release.yml` (workflow_dispatch is enabled;
      changesets are already consumed, so it re-publishes any package not yet on npm).
      DECISION 2026-07-06 (final): path (a) OIDC chosen — better end state (no stored
      credential to rotate/leak, automatic provenance, zero maintenance). The
      NPM_TOKEN env line briefly added in 345df316 was REVERTED; the workflow is back
      to pure tokenless OIDC (it was already built for it: id-token: write + npm
      >=11.5.1). @proyecto-viviana is an npm ORG owned by account `emoporemilio` (sole
      maintainer), who can register the publisher on all 5 packages. Remaining
      (npm-account action, cannot be done from CI): for EACH of the 5 packages on
      npmjs.com → Settings → Trusted Publisher → add GitHub Actions publisher (org
      proyecto-viviana, repo ui, workflow release.yml, environment blank). Then
      re-trigger `gh workflow run release.yml`.
  - id: pkg-build-spectrum-dts
    title: Move solid-spectrum dts to Vite Plus packaging
    state: in-progress
    roadmap: package-build-migration
    planned: { start: 2026-05-12, target: 2026-06-20 }
  - id: pkg-build-remaining
    title: Migrate remaining packages off tsup
    state: open
    depends: [pkg-build-spectrum-dts]
    roadmap: package-build-migration
  - id: support-export-audit
    title: Audit the 22 missing S2 support exports
    state: done
    finished: 2026-06-21
    roadmap: support-export-parity
  - id: ci-gates-report-only
    title: Run the full evidence checks in CI as a non-blocking report
    state: done
    finished: 2026-06-16
    roadmap: certification-enforcement
    note: Landed as ticket/audit-scaffolding (certification-gates.yml)
  - id: ts-nocheck-style
    title: Remove @ts-nocheck from the 6 style/ files and fix surfaced errors
    state: done
    finished: 2026-06-21
    roadmap: certification-enforcement
    note: >-
      21 strict-mode errors (20× TS7053 string-index implicit-any, 1× TS7006
      param) reconciled with minimal null-checked loose-lookup casts mirroring
      upstream's noImplicitAny:false semantics; tokens.ts strip-default fix for
      the synthetic esModuleInterop `default` key. typecheck + 5384 package
      tests green. Changeset style-layer-typecheck.md.
  - id: ts-nocheck-components
    title: Remove @ts-nocheck from the ~29 component files (batched)
    state: open
    roadmap: certification-enforcement
  - id: lint-rules-reenable
    title: Re-enable the 13 disabled lint rules (or justify each inline)
    state: open
    roadmap: certification-enforcement
  - id: replace-tautological-tests
    title: Replace the tautological live-region and private-component tests
    state: done
    finished: 2026-06-15
    roadmap: certification-enforcement
    note: Landed in proof-batch PR #4
  - id: ci-gates-required
    title: Flip the evidence checks from report-only to required
    state: open
    depends: [ci-gates-report-only, ts-nocheck-style, ts-nocheck-components, lint-rules-reenable]
    roadmap: certification-enforcement
  - id: contract-spec-burndown
    title: Keyboard/focus/announcement contract specs for the 59 visual-only components
    state: open
    depends: [port-selection-manager, port-list-keyboard-delegate, port-context-slots]
    roadmap: certification-enforcement
  - id: port-selection-manager
    title: Port SelectionManager/Selection to the upstream anchor+current model
    state: done
    finished: 2026-06-21
    roadmap: headless-spine-port
    note: >-
      Two-layer port landed. createMultipleSelectionState (raw) + SelectionManager
      (collection-aware, anchor+current) now back createListState, exposed as
      ListState/ComboBoxState/SelectState.selectionManager. onSelectionChange emits
      a Selection (Set subclass) faithfully. Next keystone: port-list-keyboard-delegate.
  - id: port-list-keyboard-delegate
    title: Port ListKeyboardDelegate + useSelectableCollection/List/Item (with RTL)
    state: done
    finished: 2026-06-21
    roadmap: headless-spine-port
    note: >-
      Commit 4b3d6592. ListKeyboardDelegate (+ DOMLayoutDelegate/LayoutDelegate/
      Rect/Size), createSelectableCollection, createSelectableList ported into
      solidaria src/selection/. Additive — no widget consumes them yet; migrations
      delete the per-widget copies. data-collection id is manager-keyed + dormant
      until a container registers. Gaps: moveVirtualFocus/dispatchVirtualFocus
      (AT cursor) still absent. Next keystone: port-context-slots.
  - id: port-context-slots
    title: Make useContextProps/useSlottedContext/composeRenderProps live and slot-capable
    state: done
    finished: 2026-06-21
    roadmap: headless-spine-port
    note: >-
      Faithful port of solidaria-components/utils.tsx context machinery: Provider
      nests [Context, value] pairs (last outermost) with lazy children;
      useSlottedContext resolves a slots record (DEFAULT_SLOT fallback, throws on
      unknown, null opts out); useContextProps(props, ref, ctx) resolves props.slot,
      merges context props under the component's own via the reactive handler-
      chaining mergeProps, and merges component+context refs; + useSlot, RefLike/
      WithRef/SlottedValue/SlottedContextValue, assignRef/mergeRefs. Additive (zero
      functional consumers; 40 components keep native .Provider). DEFAULT_SLOT stays
      the string "default" to match the styled SpectrumContextValue record contract.
  - id: port-submenu-state
    title: Add submenu state to createMenuState
    state: open
    roadmap: headless-spine-port
  - id: menu-focus-roving
    title: Move real focus on focusedKey change in Menu
    state: done
    finished: 2026-06-15
    roadmap: headless-spine-port
    note: Landed in proof-batch PR #6
  - id: migrate-menu-spine
    title: Re-route Menu onto the ported manager+delegate; delete per-widget copy
    state: open
    depends: [port-selection-manager, port-list-keyboard-delegate]
    roadmap: headless-spine-port
  - id: migrate-listbox-spine
    title: Re-route ListBox onto the ported spine; switch ul/li to div[role]
    state: open
    depends: [port-selection-manager, port-list-keyboard-delegate]
    roadmap: headless-spine-port
  - id: migrate-taggroup-spine
    title: Re-route TagGroup onto the ported createSelectableCollection + ListKeyboardDelegate
    state: open
    depends: [port-selection-manager, port-list-keyboard-delegate]
    roadmap: headless-spine-port
    note: >-
      CP9.44b (2026-07-08) certified TagGroup behavior but createTag/createTagGroup
      still reimplement the horizontal delegate INLINE (per-key Arrow/Home/End nav,
      a hand-rolled container-focus trampoline via compareDocumentPosition + a
      post-commit [data-key] focus effect, and the useTag tabIndex expression) rather
      than composing the shared createSelectableCollection + ListKeyboardDelegate
      ({orientation:'horizontal', direction}) the way useTagGroup→useGridList does
      upstream. Same inline-nav shortcut ListBox/Select took. Faithful target = build
      createTagGroup on createGridList (useTag = thin useGridListItem wrapper whose
      only extra keydown is Delete/Backspace removal). Direction is already threaded
      (useLocale → TagList → tagGroupData); the trampoline logic is a copy of
      createListBox's and should collapse into the shared collection hook.
  - id: migrate-combobox-nav
    title: Fix ComboBox filtered-list nav onto the ported delegate
    state: open
    depends: [port-list-keyboard-delegate]
    roadmap: headless-spine-port
  - id: migrate-describedby-slots
    title: Wire aria-describedby across components onto the ported slot path
    state: in-progress # foundational slice done; the 2 remaining parity closures split out below
    depends: [port-context-slots]
    roadmap: headless-spine-port
    note: Done = the 10 field/toggle *Field components (7 hybrid keep props + add slots; SwitchField/CheckboxField/RadioField pure-slot, props dropped). Remaining work is the two parity divergences tracked as describedby-slots-group-redesign + rac-field-prop-divergence. The shared createField hook must stay prop-conditional (a createSlotId swap dangles ~9 non-reactive consumers — see memory).
  - id: describedby-slots-group-redesign
    title: Drop description/errorMessage props from RadioGroup/CheckboxGroup/Select/ColorField; wire TextContext + FieldErrorContext slots
    state: open
    depends: [migrate-describedby-slots]
    roadmap: headless-spine-port
    note: Owner-authorized breaking (parity > breaking, no real users yet). These 4 are the last prop-based holdouts in our RAC layer (solidaria-components). Faithful target = react-aria-components RadioGroup (Omit description/errorMessage; provide [TextContext,{slots}] + [FieldErrorContext, validation]). Bounded path = mint createSlotId in EACH group hook (createRadioGroup/createCheckboxGroup/createSelect — one consumer each) + bind the group aria-describedby reactively; do NOT touch shared createField. One component at a time, gate each, revert red.
  - id: rac-field-prop-divergence
    title: Drop description/errorMessage props from the 7 hybrid field components for full RAC slot parity
    state: open
    depends: [migrate-describedby-slots]
    roadmap: headless-spine-port
    note: Parity divergence (ours, not upstream's). react-aria-components is uniformly slot-based — TextField/SearchField/NumberField/DateField/TimeField/ComboBox/DatePicker all Omit description/errorMessage and expose TextContext slots; the props belong only to the S2/solid-spectrum layer (extends HelpTextProps). Our versions are hybrid (kept the props AND added the slots — green but divergent). Full parity = drop the props via the same per-hook createSlotId + reactive-binding technique. Breaking, owner-authorized.
  - id: macro-route-styled
    title: Route the 14 hand-authored components through style(); delete local-utilities.css
    state: open
    roadmap: consumer-delivery
    note: >-
      Director pass 2026-07-06: raised to consumer-delivery priority alongside the
      Picker fixes — these 14 components (ListBox, Select, Toolbar, Well, StepList,
      Separator, …) ship UNSTYLED to installed consumers; the apps/web
      local-utilities.css backfill masks it in-repo and in the comparison harness.
  - id: viviana-ui-subpath-exports
    title: Add the 19 missing solid-spectrum sub-path exports to viviana-ui
    state: open
    roadmap: consumer-delivery
  - id: viviana-ui-button-passthrough
    title: Add an unstyled Button passthrough in solid-spectrum; re-route the 4 natives
    state: open
    roadmap: consumer-delivery
  - id: dead-natives
    title: Delete or wire Header/NavHeader/LateralNav
    state: open
    roadmap: consumer-delivery
  - id: picker-api-upstream
    title: Drop invented Picker value/defaultValue/onChange aliases (keep real renderValue)
    state: done
    finished: 2026-06-21
    roadmap: upstream-api-parity
    note: Removed value/defaultValue/onChange + PickerValue + translation helpers; renderValue is real S2 and stays. Consumers use selectedKey/onSelectionChange (single) + selectedKeys/onSelectionChangeKeys (multiple).
  - id: treeview-api-upstream
    title: Drop invented TreeView overflowMode (keep real onAction/renderActionBar/selectionStyle)
    state: done
    finished: 2026-06-21
    roadmap: upstream-api-parity
    note: Only overflowMode was invented (absent from S2 TreeView + RAC Tree). onAction/renderActionBar/selectionStyle are all real S2 and stay.
  - id: calendar-default-alignment
    title: Fix calendar start-vs-center default and rewrite the bug-asserting test
    state: done
    finished: 2026-06-15
    roadmap: upstream-api-parity
    note: Landed in proof-batch PR #3
  - id: calendar-i18n-strings
    title: Route calendar cell/grid strings through createStringFormatter
    state: done
    finished: 2026-06-21
    roadmap: upstream-api-parity
    note: Cell today/selected suffix + grid accessible name now localized; segment label split out to calendar-segment-i18n
  - id: calendar-segment-i18n
    title: Route the date/time segment field label through the i18n layer
    state: done
    finished: 2026-07-15
    roadmap: upstream-api-parity
    note: >-
      DONE 2026-07-15 — entry was STALE; the implementation already landed with the
      DateField cert (commit 81693117 / CP9.60, 2026-07-11), long after this was filed
      2026-06-21. createDateSegment builds each segment's aria-label from
      `displayNames().of(seg.type)` — a faithful createDisplayNames port over
      Intl.DisplayNames(type:"dateTimeField") with a datePickerDictionary polyfill
      fallback — so part names ("day"/"Tag"/"jour"/يوم) localize with NO hardcoded
      English table; and it composes the field's own aria-label (threaded from
      createDateField via the hookData WeakMap, `hd?.ariaLabel`) after the part name
      → "day, <field label>" (createDateSegment.ts:401-413). The only real gap was
      exit-criteria contract coverage: createDateSegment.test.tsx asserted only
      /day/i in en-US. Closed here by adding (a) a field-label-threading test
      (hookData ariaLabel "Birth date" → aria-label === "day, Birth date") and (b) an
      it.each over the Calendar contract locales en-US/fr-FR/ar-AE (RTL) that derives
      the expected localized name the same way the code does and asserts non-English
      no longer contains the English "day". Full suite green: 5537 passed. No source
      change needed — implementation was already parity-faithful.
  - id: picker-popover-anchor
    title: Anchor Popover to its trigger — make popoverRef a signal so position computes
    state: done
    finished: 2026-07-15
    roadmap: consumer-delivery
    note: >-
      DONE 2026-07-15. Found consuming Picker in Tortafritapp (admin role picker). The
      popover rendered at the createOverlayPosition fallback (position:fixed; top:0;
      left:0; z-index:100000; max-height:100vh), never the anchored result. Root cause
      confirmed against source: Popover.tsx held `let popoverRef!: HTMLDivElement` and
      passed `popoverRef: () => popoverRef ?? null` to createPopover — a non-reactive
      local ref, while the sibling groupRef was already a createSignal. A Solid
      local-var ref assignment notifies no reactive scope, so createOverlayPosition's
      main effect (createOverlayPosition.ts:226-245, which tracks overlayRef()) first
      ran with a null ref before the lazy portal node mounted and never re-ran →
      position() stayed null → the fallback style. Whether it anchored at all was pure
      timing luck (a stray ResizeObserver/isOpen re-run catching the assignment), which
      is why the comparison harness cert stayed green while the external consumer broke
      at 0,0. FIX = convert popoverRef to createSignal(setPopoverRef), mirroring the
      sibling groupRef; the position effect now re-runs once the node mounts. This is
      the faithful parity of React Aria useOverlayPosition, which gets correct timing
      free from useLayoutEffect (ref populated before the effect fires). Solid does not
      null refs on unmount, but every consumer gates on isOpen() so the retained
      detached node is harmless (same as groupRef). Verified: build:components +
      tsc-p clean; ALL overlay certs green with zero regression — popover+picker 85,
      combobox+datepicker+daterangepicker+menu+actionmenu 218 (2 skipped); full unit
      suite 5533 passed. Build-graph gotcha: comparison aliases solidaria-components to
      dist/index.js, so build:components must precede comparison:build.
  - id: picker-item-checkmark
    title: Show the PickerItem checkmark only on the selected option
    state: done
    finished: 2026-07-07
    roadmap: consumer-delivery
    note: >-
      DONE 2026-07-07 (commit 094ca40e); confirmed stale-and-certified 2026-07-15.
      Found consuming Picker in Tortafritapp. ARIA was correct (one aria-selected) but
      the SVG checkmark showed on every row. Root cause was NOT the base style —
      pickerCheckmark already declares visibility {default:hidden, isSelected:visible}.
      The visibility toggle was routed through the icon `styles` override prop, whose
      path filters through iconAllowedOverrides, which faithfully omits `visibility`,
      so the toggle atom was silently stripped and the checkmark painted on every
      option. FIX = route the checkmark class through the raw `class` prop
      (class={pickerCheckmark({ ...renderProps, size })}), matching sibling Menu/Table
      and upstream S2 (checkmark applied via className on a hand-written ui-icon, raw
      and unfiltered). Applied to all three surfaces: Picker, ComboBox, TabsPicker.
      Static structural routing change (no timing/environment dependence), so it holds
      identically for consumers — unlike picker-popover-anchor. Certified: the picker
      cert adds `visibility` to the style allowlist and asserts it on BOTH a selected
      checkmark part (visible) and an unselected one (hidden); suite green (popover+
      picker 85 passed). Filed 2026-07-06, fixed 2026-07-07 — this tracking entry was
      stale; reconciled during the picker-popover-anchor closeout.
  - id: taggroup-remove-pressscale
    title: Give the styled Tag remove button real on-press pressScale (not just the resting hint)
    state: open
    roadmap: upstream-api-parity
    note: >-
      Surfaced by the TagGroup recertification (CP9.44a/b). S2's ClearButton renders
      the remove button with `style={pressScale(domRef)}`, which contributes BOTH the
      resting `will-change:transform` layer hint AND the on-press scale transform. The
      port's headless `TagRemoveButton` (HeadlessTagRemoveButton) carries no press
      state, so solid-spectrum tag-group/index.tsx only mirrors the resting hint via
      `pressScale(undefined)({isPressed:false})`. Faithful fix = thread press state
      through the headless remove button (createPress on the button) and feed its
      domRef + isPressed into pressScale, matching S2 ClearButton. Not paint-visible
      at rest (D1/D3 green) — the gap is the missing press-down animation.
  - id: tooltip-arrow-overlayarrow
    title: Port the Tooltip arrow onto the real RAC <OverlayArrow> + arrowProps (headless-overlay realignment)
    state: open
    roadmap: upstream-api-parity
    note: >-
      Surfaced by the Tooltip recertification (CP9.28). Upstream S2 Tooltip.tsx
      (:216) renders the arrow as `<OverlayArrow className=""><svg
      className={arrowStyles(...)}/></OverlayArrow>`, positioned by React Aria's
      `useOverlayPosition` `arrowProps` (a JS-computed INTEGER pixel `top`/`left`)
      with `arrowBoundaryOffset={borderRadius}` read from the tooltip's own
      computed border-radius. The port hand-rolls the arrow instead: a
      `<div data-rsp-slot="tooltip-arrow" style={arrowFrameStyle(placement)}>`
      wrapper with PERCENT centering (`top/left:50%` + `translateX/Y(-50%)`),
      wrapping the byte-identical svg, and hardcodes `arrowBoundaryOffset={8}`
      (solid-spectrum/src/tooltip/index.tsx). Consequence certified: top/bottom
      placements are byte-exact, but left/right land the 5px-tall frame on a
      fractional half-pixel → a ~1px vertical arrow-tip shift (~19/13728 px),
      waived in tooltip.certified.spec.ts as `tooltip-arrow-overlayarrow-subpixel`.
      ROOT BLOCKER: the headless `solidaria-components/Tooltip.tsx` is a
      from-scratch positioning rewrite (`updatePosition()` + homegrown
      `maybeFlipPlacement`) that exposes NO `arrowProps`, so the styled layer
      cannot drive a real `<OverlayArrow>`. Realigning the headless layer to RAC's
      `useOverlayPosition`/`OverlayArrow` machinery is the shared fix that (a)
      makes the arrow byte-exact on all placements and (b) UNBLOCKS the deferred
      D2 motion cert (enter/exit opacity+translate, currently driven by a
      hand-rolled `getAnimations()` state machine, not RAC's `useEnterAnimation`).
      Confirm against React Aria `useOverlayPosition` first (parity rule).
      UPDATE (CP9.29, Popover): the ARROW-POSITIONING half of this is separable and
      is now DONE for the popover path — `createPopover` DOES expose real
      `arrowProps`, and the only gap was the headless `OverlayArrow`
      (solidaria-components/Popover.tsx) missing RAC's centering transform
      (`translateX(-50%)` top/bottom, `translateY(-50%)` left/right; the reported
      offset points at the arrow CENTER). Added it → the popover arrow is byte-exact
      on ALL four placements with ZERO D3 waivers. So this entry's arrow scope is now
      TOOLTIP-ONLY (its headless `createTooltip` still exposes no `arrowProps`). The
      popover's remaining realignment gap is D2 motion only — see `popover-enter-motion`.
  - id: listview-virtualizer-subpixel
    title: Port the ListView row windowing onto S2's Virtualizer + S2ListLayout (row-wrapper stacking/positioning)
    state: open
    roadmap: upstream-api-parity
    note: >-
      Surfaced by the ListView recertification (CP9.43). Upstream S2 ListView.tsx
      (:363-396) wraps the whole collection in `<Virtualizer layout={S2ListLayout}>`,
      which renders each row inside a `<div role="presentation">` that is
      `position:absolute; z-index:0` — an integer-snapped, per-row stacking context.
      The port's ListView (solid-spectrum/src/gridlist/index.tsx) has NO Virtualizer
      (only a legacy `layout` prop alias); rows are DIRECT grid children flowed by the
      grid. Two certified consequences, both worked around faithfully rather than
      papered over: (1) the `z-index:-1` selection-fill layer escaped to the grid's
      ancestor stacking context and was painted over by the grid's own white bg — fixed
      minimally by giving the (position:relative) row `zIndex:0` so it forms its own
      stacking context (substitutes for S2's row-wrapper); D3 default dropped 16% → 0.
      (2) RESIDUAL, waived: the bordered checkbox cases (default/selected/multiple/
      disabled) leave a ≤5/255 anti-aliasing residual (≤26/136320 px, ~1.9e-4) confined
      to the selection checkbox column (x≈45-60). The absolutely-positioned S2 row snaps
      the checkbox box + checkmark glyph to a slightly different sub-pixel phase than the
      port's flow-positioned row, so their edges rasterize with a 1-5/255 rounding delta
      — a measurement-layer artifact, not a paint divergence (D1 pins every computed
      style byte-identical; and `quiet` — no grid border to shift the column — and
      `highlight` — no checkbox column at all — stay byte-EXACT at zero tolerance).
      Waived in listview.certified.spec.ts as `listview-virtualizer-subpixel`
      (maxMismatchRatio 5e-4, ~2.6x the worst observed, tighter than the house
      glyphSubpixel precedents: contextualhelp 1.5e-3, toast 2e-3, tooltip 3e-3). ROOT
      FIX = port S2ListLayout + the Virtualizer row-windowing (a multi-day structural
      port, out of a paint cert's scope); this ALSO closes the residual to byte-exact.
      Confirm against S2 `Virtualizer`/`S2ListLayout` + `@react-aria/virtualizer` first
      (parity rule). Same "structural realignment blocks byte-exact, waive the sub-pixel
      residual meanwhile" shape as `tooltip-arrow-overlayarrow`.
  - id: tooltip-arrow-aria-exposed
    title: Tooltip arrow svg is exposed as role=img (upstream-faithful mirror, not an improvement)
    state: open
    roadmap: upstream-api-parity
    note: >-
      Documented during CP9.28 so it is not "fixed" back to a divergence later.
      Upstream S2 leaves the arrow `<OverlayArrow>` svg with NO `aria-hidden`, so
      it surfaces to AT as an unlabeled `role="img"` inside the tooltip subtree —
      arguably an upstream a11y quirk (a decorative arrow need not be exposed). The
      port previously hand-hid it (`aria-hidden="true"`); CP9.28 REMOVED that to
      match upstream byte-for-byte under D6 (parity rule #1 — revert self-inflicted
      divergences). If upstream later adds `aria-hidden` to the arrow, mirror it;
      do NOT re-introduce the hide unilaterally as a lone "improvement."
  - id: popover-enter-motion
    title: Popover has no internally-driven enter/exit animation (D2 deferred; isEntering is a prop, not a state machine)
    state: open
    roadmap: upstream-api-parity
    note: >-
      Surfaced by the Popover recertification (CP9.29). Upstream S2 `Popover`
      (`popover` style()) fades in over 200ms — `opacity {isEntering/isExiting:0}` +
      `translateY/X ±4` + `transition:[opacity,translate]` — where `isEntering`/
      `isExiting` are driven by React Aria's `useEnterAnimation`/exit lifecycle in
      RAC's `Popover`. The port's headless `Popover.tsx` treats `isEntering`/
      `isExiting` as plain render props that are never internally flipped, so the
      surface just appears (no default enter/exit motion). The styled `popoverStyles`
      already carries the byte-copied motion tokens (opacity/translate/transition), so
      the fix is purely headless: drive the enter/exit flags off the overlay-open
      lifecycle (mirror RAC `useEnterAnimation` against `createOverlayPosition`
      readiness), then land the D2 motion cert. Same family as the Tooltip
      `getAnimations()` gap but a smaller surface (positioning is already faithful —
      see `tooltip-arrow-overlayarrow`). Also noted while here: the port surface omits
      upstream RAC's nested-`[role=dialog]` guard
      (`shouldBeDialog && !ref.querySelector('[role=dialog]')`) — it always renders
      `role="dialog"` where upstream suppresses it if the content already has one;
      latent (harmless for plain content), fold into the trigger/Menu unit.
  - id: contextualhelp-popover-delegation
    title: ContextualHelp should delegate its popover to ContextualHelpPopover; ContextualHelpPopover hardcodes submenu-trigger/placement defaults
    state: open
    roadmap: upstream-api-parity
    note: >-
      Surfaced by the ContextualHelp recertification (CP9.34). Two structural
      divergences, orthogonal to this unit's paint cert (which is green — the frame/
      inner/heading/content/footer are byte-faithful), so filed rather than fixed:
      (a) the port's `ContextualHelp` DUPLICATES the whole popover body inline
      (`<Popover>…<div class={contextualHelpFrame}>…</div>`, contextualhelp/index.tsx
      ~330-353) instead of delegating to the sibling `ContextualHelpPopover`
      component. Upstream `@react-spectrum/s2` `ContextualHelp` renders
      `<ContextualHelpPopover>` and lets IT own the frame/contexts, so the two paths
      cannot drift; the port has two independent copies of the same Heading/Content/
      Footer context wiring to keep in sync (this unit had to apply the four reverts
      to BOTH copies). Fix = have `ContextualHelp` render `<ContextualHelpPopover>`.
      (b) the port's `ContextualHelpPopover` hardcodes `trigger="SubmenuTrigger"` +
      placement defaults (`end top`, offset -2, crossOffset -8) that upstream's plain
      `<Popover padding="none" hideArrow>` does NOT set — those submenu-anchoring
      defaults belong to the unavailable-menu-item (`SubmenuTrigger`) path, not the
      general popover. Reconcile both against upstream `ContextualHelp.tsx` before
      patching (parity rule #1). The `ContextualHelp` popover's own default placement
      (`bottom start`, containerPadding 8, offset 8) is the standalone-trigger case
      and is faithful.
  - id: helptext-fielderror-visual-port
    title: Port the faithful S2 Field composite (FieldLabel + HelpText/FieldError) so label/description/isInvalid rows match upstream
    state: open
    roadmap: upstream-api-parity
    note: >-
      Surfaced by the Checkbox recertification (CP9.15): upstream S2 renders HelpText
      UNCONDITIONALLY inside each field (Checkbox.tsx:228-289 wraps a CheckboxButton +
      <HelpText size isInvalid description showErrorIcon>). Field.tsx (~407-446) shows
      the shape: `!isInvalid && description` → description slot row; `isInvalid` → a
      FieldError row with showErrorIcon (so even a bare isInvalid with no errorMessage
      still renders an error-icon row that WIDENS/HEIGHTENS the field grid — measured
      field height 18px→52px, grid-template-rows `16px 73px`→`16px 73px 0px`, plus a
      canvas-width delta). The port only has a Tailwind stub, no faithful HelpText/
      FieldError, so the invalid + description states can't be certified — both invalid
      cases were DROPPED from checkbox.certified.spec.ts and deferred here. Cross-cutting:
      the same gap blocks certifying isInvalid/description on Checkbox, Radio, Switch,
      TextField and every other field.
      PARTIALLY RESOLVED by the CheckboxGroup recertification (CP9.16, DONE 2026-07-04):
      CheckboxGroup is now certified 43/43 (D1/D3/D5/D6/D7) — the group surface was
      realigned to upstream OUTPUT byte-for-byte IN-PLACE (the hand-roll stays; the shared
      extraction below is the remaining follow-up). The four divergences were fixed: (1)
      `checkboxGroupItems` → `flexWrap:{orientation:{horizontal:'wrap'}}` (vertical computes
      nowrap); (2) `checkboxGroupLabelWrapper` → added `contain:{isQuiet:'none'}` so the
      always-`isQuiet` wrapper computes `contain:none`; (3) description/error → RAC `<Text
      slot="description">`/`<Text slot="errorMessage">` (no `role="alert"`), dropped the
      hand-roll `margin:0`, AND made the ids single-source (see below); (4) the label was
      correctly left a `<span>` (RAC CheckboxGroup LabelContext elementType:'span' —
      NOT a divergence; an earlier "revert" to `<label>` was undone).
      DOWN PAYMENT on the shared port (the id source-of-truth): the styled CheckboxGroup now
      passes `description`/`errorMessage` DOWN to the headless `CheckboxGroup` with a new
      opt-in `renderHelpText={false}` (solidaria-components/src/Checkbox.tsx). The headless
      mints the description/error id ONCE and threads it onto the group + every item's
      `aria-describedby` (via the exported `checkboxGroupData` WeakMap — mirroring
      `useCheckboxGroup`/`useCheckboxGroupItem`), while the visible node is the styled
      `<Text>` reading the id back. This fixed a real a11y gap (child inputs had lost the
      group description) and establishes the headless as the single source of truth — the
      pattern the shared HelpText/FieldError port should generalize (RAC's TextContext slot).
      SECOND DOWN PAYMENT (the RadioGroup recertification, CP9.18, DONE 2026-07-04):
      RadioGroup is now certified 43/43 (D1/D3/D5/D6/D7) with the IDENTICAL three-divergence
      revert + single-source `renderHelpText={false}` wiring applied to the radio hand-roll
      (`solid-spectrum/src/radio/index.tsx` + `solidaria-components/src/RadioGroup.tsx`),
      threading the group descriptionId onto every radio input via the exported
      `radioGroupData` WeakMap (mirroring `useRadioGroup.ts:148` + `useRadio.ts:186-191`).
      Two of the four group holdouts named in `describedby-slots-group-redesign` (RadioGroup,
      CheckboxGroup) now realign their OUTPUT to upstream and route ids through the headless;
      Select + ColorField remain.
      THIRD DOWN PAYMENT (the TextField recertification, CP9.19, DONE 2026-07-04): TextField is
      now certified 35/35 (D1/D3/D5/D6/D7). This is the first unit on the INPUT-WRAPPING side of
      the field family (the `FieldGroup` composite, not the toggle/group hand-roll). Its id
      wiring was already single-source (the port reads description/error ids off the headless
      TextField context), so the reverts here were the help-text `<p>`→`<span slot>` + dropping a
      hand-roll-only `margin:0`, and — the reusable find — the FieldGroup wrapper `<div>` role.
      REUSABLE FINDING FOR THE WHOLE INPUT FAMILY: upstream's `FieldGroup` wrapper is
      `role="presentation"`, NOT `role="group"`. RAC's `Group` defaults to `role ?? 'group'`, but
      RAC's `TextField` seeds `GroupContext` with `{role:'presentation'}`
      (`react-aria-components/dist/private/TextField.mjs:107-113`) so the input's visual wrapper is
      marked presentation to keep the AX tree flat (textbox is a direct child of the field, no
      redundant group node). A source-read first landed `role="group"`; the D6 cert + a DOM dump
      of both stacks corrected it to `presentation`. Every remaining input-family hand-roll
      (TextArea, SearchField, NumberField, DateField, TimeField, ComboBox, Picker) wraps its input
      in the same FieldGroup and MUST render the wrapper `<div>` as `role="presentation"`.
      FOURTH DOWN PAYMENT (the TextArea recertification, CP9.20, DONE 2026-07-04): TextArea is
      now certified 35/35 (D1/D3/D5/D6/D7) — the multiline sibling of TextField, composing the
      SAME `TextFieldBase`→`AriaTextField` but with a `<textarea>` input and a
      `{alignItems:'baseline',height:'auto'}` FieldGroup override. The port's separate
      `TextArea.tsx` carried its own copies of the two divergences (help-text `<p>`+`margin:0`,
      FieldGroup no-role) — both closed identically, and this is the FIRST RE-USE of the
      `role="presentation"` finding, confirming it holds across the input family (not
      TextField-specific). Also fixed a real DRIVER blind spot exposed here (not a port change):
      D7's text-node walk could not "see" a `<textarea>`'s value when it lives only in the
      `.value` property (the idiomatic Solid binding) rather than a child text node (React's
      value→children sync). `contrast.ts` now sources a `<textarea>`'s text from `.value` on both
      stacks (guarded by `tagName === "TEXTAREA"`), measuring the perceptual text a textarea shows
      rather than its DOM representation; every non-textarea spec is byte-unchanged (TextField
      re-run 35/35).
      FIFTH DOWN PAYMENT — INVALID BRANCH CERTIFIED (the FieldError/HelpText recertification,
      CP9.26, DONE 2026-07-04): the deferred `isInvalid` composite is now certified on TextField —
      the canonical single-input FieldGroup — via `fielderror.certified.spec.ts`, 30/30
      (D1×12 / D3×12 / D6×2 / D7×4) with ZERO port fixes. It drives the shared TextField fixture
      with `?isInvalid=true` across `invalid`, the `size-*` ramp, `invalid-required`, and
      `invalid-disabled` (colors → `disabled`, group error icon SUPPRESSED via `!isDisabled` while
      the error `<span>` still renders). This PROVES part (a) below is a COVERAGE gap, not a
      correctness gap: the inline `helpTextStyles` (byte-identical to upstream Field.tsx 378-405,
      incl. the `isInvalid → negative` color branch), `fieldErrorIcon` (matches upstream
      `FieldErrorIcon` 471-503), and `TextFieldError` (`<span slot="errorMessage">`) copies render
      byte-faithful DOM/CSS/pixels AND a matching AX tree — the decorative AlertTriangle added no
      divergent AX node, and `aria-invalid` + error-description wiring matched. The shared machinery
      (helpTextStyles / fieldErrorIcon / TextFieldError, composed by every input field via
      `TextFieldBase`) is therefore certified once here.
      STILL OPEN: (a) the per-field invalid CASES for the toggle/group family (Checkbox,
      CheckboxGroup, RadioGroup) and the remaining input fields (TextArea, NumberField, SearchField)
      — same now-certified machinery, so low risk, but their own spec files don't yet exercise it;
      add the invalid cases when each is next touched. And (b) the
      shared FieldLabel + HelpText/FieldError *extraction* itself (de-duplicate the hand-rolls
      across Checkbox/CheckboxGroup/RadioGroup/the field units; byte-copy the upstream Field.tsx
      style() objects; RAC Label/Text/FieldError element types). Do (b) so the group hand-roll is
      replaced by the shared component producing the same now-certified output — the invalid
      composite is now the certified reference for that extraction.
  - id: headless-switch-ref-forwarding
    title: Headless SwitchField/SwitchButton do not accept ref/inputRef — styled Switch cannot forward either
    state: open
    roadmap: upstream-api-parity
    note: >-
      Surfaced by the Switch recertification (CP9.17): upstream S2 Switch.tsx forwards a
      DOM `ref` to the field and threads a handle ref through `pressScale`; the port's
      headless `SwitchField`/`SwitchButton` (solidaria-components/src/Switch.tsx) expose
      no `ref`/`inputRef` prop, so the styled `switch/ToggleSwitch.tsx` rebuild cannot
      forward either. This is status-quo, NOT a regression — the pre-split flex monolith
      also did not forward — and no cert or demo exercises a switch ref, so it did not
      block the (fully green) CP9.17 cert. Faithful target = add `ref` (field root) +
      `inputRef` (the visually-hidden `<input>`) forwarding to the headless
      SwitchField/SwitchButton mirroring the RAC Switch ref surface, then thread both
      through the styled Switch. Low priority; revisit when a consumer needs an imperative
      switch handle or when the shared form-field ref surface is standardized.
  - id: ui-icon-decorative-ax-node
    title: Reconcile decorative-icon AX exposure — React shows a bare img node, the port stamps aria-hidden
    state: done
    finished: 2026-07-06
    roadmap: upstream-api-parity
    note: >-
      RESOLVED by Toast CP9.35 (2026-07-06), globally. Root cause confirmed exactly as
      this ticket suspected: the port's `createUIIcon` (icon/spectrum-icon.tsx) forced
      `role="img"` + auto `aria-hidden` on every ui-icon, while upstream renders the RAW
      imported svg asset — the generated `@react-spectrum/s2` ui-icon components spread
      `{...otherProps}` onto an asset carrying NO `role` and NO `aria-hidden`. Fix: a new
      `bare` mode on `createIconForBase` (passed by `createUIIcon`) drops both — ui-icons
      now render as bare `<svg>`, exactly upstream. This also answers the ticket's open
      axe question: Chrome exposes a bare `<svg>` as an unnamed `img` (matching React's AX
      tree, so D6 passes), but axe's `svg-img-alt` only flags an *explicit* `svg[role="img"]`,
      so removing the forced role keeps a11y:smoke green (44/44 re-verified) — the previous
      auto-`aria-hidden` was NOT load-bearing for axe. Workflow icons (`createIcon`) and
      illustrations keep `role="img"`+auto-hide (upstream `Icon.tsx` does). Blast radius
      verified faithful: 5 regression snapshots regenerated (Checkbox/NumberField/SearchField/
      ComboBox/Breadcrumbs — each renders its ui-icon raw upstream), 2 ActionMenu assertions
      realigned (Menu.tsx renders link-out + submenu chevron raw), full unit suite 270 files/
      5528 green, 6 ui-icon certified specs 178 pass. The per-component D6 route-arounds noted
      below (Checkbox roots.control, SearchField read-only case) are now unnecessary but were
      left in place — they still certify correctly and can be un-scoped opportunistically on
      each component's next recert. ORIGINAL NOTE follows:
      Surfaced by the Checkbox recertification (CP9.15): upstream exposes the decorative
      Checkmark/Dash <svg> inside the box as a bare `img` accessibility node, while the
      port stamps `aria-hidden` on it so the node is absent from the AX tree. D6 (AX)
      diverged on the `selected` + `indeterminate` cases only because of this (pixels
      matched, so D3 was green for both). Worked around in checkbox.certified.spec.ts by
      rooting D6 at the <input> (roots.control) so the checkbox's own [checked]/
      [checked=mixed]/[disabled]/name/role semantics stay certified on every case,
      sidestepping the icon-node exposure — but the underlying svg-attr divergence
      (explicit-px / role / aria-hidden / focusable) is real and cross-cutting to every
      component that renders a decorative S2 icon. Diff the port's ui-icon wrapper against
      upstream's Icon rendering before changing — the right answer may be to match React's
      `img`-node exposure OR to confirm the port's aria-hidden is the more-correct WCAG
      reading and record it as an intentional, documented divergence (known-divergence
      note on the affected drivers) rather than a bug. RE-CONFIRMED cross-cutting by the
      SearchField recertification (CP9.21): the clear-button Cross ui-icon shows the SAME
      bare-`img`-vs-`aria-hidden` split; searchfield.certified.spec.ts scopes D6 to the
      `read-only` case (clear button absent) to route around it, mirroring the Checkbox/
      RadioGroup approach. When this is finally reconciled, weigh that the port's
      aria-hidden also keeps our axe (a11y:smoke) gate green — exposing nameless `img`
      nodes as upstream does would emit image-alt violations our blocking gate would fail,
      so a global flip must also decide how to satisfy axe.
  - id: s2wf-icon-shipped-path-provenance
    title: Workflow (s2wf) icons are generated from raw vendored .svg sources, not the shipped SVGO dist paths
    state: open
    roadmap: upstream-api-parity
    note: >-
      Surfaced by the SearchField recertification (CP9.21): the port's workflow icons under
      packages/solid-spectrum/src/icon/s2wf-icons/*.tsx carry the header "Auto-generated from
      vendored React Spectrum S2 icon sources" and use the RAW `.svg` path data (high decimal
      precision). But the compiled React S2 components render the SHIPPED `@react-spectrum/s2/
      icons/*.mjs` paths, which SVGO rounds to lower precision. The higher-precision raw path
      drifts sub-glyph antialiasing and fails D3 strict pixel diff (SearchIcon showed a 9-px
      glyph delta). This is the SAME principle already recorded on the Cross ui-icon: pixel
      parity requires the shipped path data, not the raw vendored sources. Fixed for SearchIcon
      only (its `d` now matches `icons/Search.mjs`, header updated). Systematic exit: the icon
      generator should source shipped `icons/*.mjs` `d` values (not the raw vendored .svg) for
      EVERY workflow icon, then re-run affected D3 certs. Until then, any workflow icon that
      lands in a D3-certified surface may carry the same drift and needs the per-icon shipped-path
      swap. (UI-icons under ui-icons/*.tsx are already generated from the shipped dist — this is
      workflow-icon-only.)
  - id: intl-roledescription-hardcodes
    title: English aria-roledescription / stepper labels are hardcoded, not routed through createStringFormatter
    state: open
    roadmap: upstream-api-parity
    note: >-
      Surfaced by the NumberField recertification (CP9.22): `createNumberField.ts` hardcodes
      the input `aria-roledescription: "Number field"` and the stepper button `aria-label`s
      `"Increase"`/`"Decrease"`, where upstream `useNumberField` reads them from
      `stringFormatter.format('numberField' | 'increase' | 'decrease', {fieldLabel})` — a
      localized dictionary. The hardcodes are deliberately kept BYTE-IDENTICAL to React's
      en-US output ("Number field", "Increase", "Decrease"), so every en-US cert (D5/D6) is
      green and this is invisible in the default locale; it only diverges under a non-English
      `I18nProvider`. Same class of debt as ColorArea/ColorSwatch's English hardcodes and the
      now-resolved `calendar-segment-i18n` (see "i18n strings hardcoded" prose section — that one
      turned out already parity-faithful; this NumberField one is a genuine hardcode). Faithful
      exit: route these through `createStringFormatter` (as `createDateField`/`createCalendar`
      already do) with the react-aria en-US/`intl/*.json` values, then extend the non-English/RTL
      contract coverage to a NumberField roledescription + stepper-label assertion. Low priority
      until localized number-field consumers exist; the en-US surface is already faithful.
  - id: slider-thumb-native-input-semantics
    title: Slider thumb inverts upstream's native-input semantics (div[role=slider] + aria-hidden input)
    state: open
    roadmap: headless-spine-port
    note: >-
      Surfaced by the Slider recertification (CP9.23): upstream RAC `useSliderThumb`
      makes the native `<input type=range tabindex=0>` the focusable, value-bearing
      slider and wraps it in `<VisuallyHidden>`, with the thumb `<div>` carrying NO
      role. The port inverts this in `packages/solidaria/src/slider/createSlider.ts`:
      `thumbProps` stamps `role="slider" + aria-valuemin/max/now/text + tabIndex:0` on
      the thumb `<div>`, and `inputProps` marks the native `<input type=range>`
      `aria-hidden + tabIndex:-1`. Consequences at cert time: (1) D6 — Chromium's AX
      tree surfaces the value ("40") for React's native range input but NOT for the
      port's `div[role=slider]` despite correct `aria-valuenow`/`aria-valuetext`, so
      the D6 snapshot diverges on the slider value only (role/name/group/output all
      match); registered as `ax.knownDivergences.default` in slider.certified.spec.ts.
      (2) D5/D8 (not yet run for Slider) — focus lands on a different element and the
      interactive target is a 1px hidden input upstream vs a sized div in the port.
      This is a SHARED spine divergence: createSlider + the headless SliderThumb, and
      by extension RangeSlider/ColorSlider/ColorArea, all ride the same inversion, so it
      is NOT a per-component fix. Faithful exit: realign createSlider to upstream —
      native `<input>` as the a11y slider inside `VisuallyHidden`, thumb `<div>`
      role-free — then re-run Slider D5/D6/D8 and the color/range sliders. Deferred to
      the headless-spine-port track; do not shim per-widget (parity argues against a
      local hack). Also note `createSlider` leaks the input id onto the group via
      `fieldProps` (`groupProps.id === inputId`) — fold that into the same realign.
  - id: slider-thumb-antialias-1lsb
    title: Slider D3 waives a single 8-bit LSB on the thumb's anti-aliased edge
    state: open
    roadmap: certification-enforcement
    note: >-
      Surfaced by the Slider recertification (CP9.23): the only sub-exact pixels in the
      Slider D3 strict-pixel diff are on the thumb's curved, high-contrast circular
      edge — a single grayscale LSB (Δ=1, e.g. React 212 vs Solid 211) that rounds
      differently between two computed-identical DOM subtrees. All D1 computed styles
      match and the thumb CSS is byte-identical to upstream, so this is irreducible
      rasterizer rounding, not a style divergence — it is dark-mode-heavy precisely
      because that edge is highest-contrast in dark. slider.certified.spec.ts carries a
      scenario-wide `pixel.waivers` entry `{maxMismatchRatio:0, maxDimensionDelta:0,
      pixelThreshold:1}`: it tolerates exactly one LSB per channel while keeping
      dimensions exact and still failing hard on any real divergence (Δ≥2, or any size
      change). This is the tightest waiver the D3 threshold supports (stricter than
      Playwright's own default). Revisit only if a future change lets the thumb edge
      rasterize byte-identically (e.g. the native-input realign above changes the thumb
      paint); otherwise it stays as the documented raster floor.
  - id: rangeslider-duplicates-slider-spine
    title: RangeSlider hand-copies Slider's styles + geometry instead of sharing the spine
    state: open
    roadmap: headless-spine-port
    note: >-
      Surfaced by the RangeSlider recertification (CP9.24): upstream S2 `RangeSlider.tsx`
      is a thin wrapper that IMPORTS the shared style atoms from `./Slider`
      (`filledTrack, SliderBase, thumb, thumbContainer, thumbHitArea, track, upperTrack`)
      and the shared `SliderBase` layout, adding only the second thumb. The port's
      `packages/solid-spectrum/src/slider/RangeSlider.tsx` (@ts-nocheck) instead
      DUPLICATES every Slider style() block and hand-rolls its own pointer/keyboard math,
      so it inherited all of Slider's self-inflicted divergences (the `align-items`
      merge-clobber, the `border→outline` upperTrack, the `baseColor` filledTrack, the
      bare-`<span>` label, the manual fill nesting) as independent copies that each had to
      be re-fixed byte-for-byte in this cert rather than fixed once. It also re-implements
      the output/reserve formatter (fixed here to route through `formatRange` via a
      faithful `getFormattedValue`). Faithful exit: collapse RangeSlider onto Slider's
      shared spine + style atoms (single source of truth for the track/thumb/fill/label),
      so a future Slider fix propagates to RangeSlider automatically. Couple this with the
      `slider-thumb-native-input-semantics` realign (both are the same headless-spine
      track) and drop the hardcoded English "Minimum"/"Maximum" thumb aria-labels in favor
      of the localized `slider.minimum`/`slider.maximum` strings upstream uses. Deferred
      to headless-spine-port; the duplicated file is certified-green in the meantime.
  - id: form-side-label-halfpixel-baseline
    title: Form D3 waives a 1px side-label baseline translation on labelPosition=side
    state: open
    roadmap: certification-enforcement
    note: >-
      Surfaced by the Form recertification (CP9.25), the first cert to pixel-test
      `labelPosition:"side"` (TextField's own cert only exercises `top`). In S2's side
      layout the field grid baseline-aligns the 18px-tall label against the 32px input
      row (`field()`: `alignItems:'baseline'`, `gridTemplateRows:["auto","1fr"]`), which
      parks the label's box at a HALF-PIXEL Y (measured label top 505.5 / wrapper 504.5,
      identical in React and Solid). Two independent Playwright probes proved the port
      reproduces upstream's geometry byte-for-byte — identical atomic class strings,
      computed font/transform surface, text ink-range (505.5→520.5), and live AND cloned
      bounding rects (label at 40.5 inside the pixel-driver clone for both frameworks. The
      residual is a deterministic 1px PURE TRANSLATION of the label glyphs (per-row ink
      histogram identical, only shifted one row) — a rasterizer baseline-rounding of the
      half-pixel Y that lands one row apart between the two frameworks' subtrees, stable
      across three `--repeat-each` runs. Nothing in the port's DOM/CSS can move it without
      diverging from upstream's baseline-alignment design (D1 independently asserts the
      exact side-layout grid template + `align-items`), so `form.certified.spec.ts` carries
      a `label-side`-only `pixel.waivers` entry `{maxMismatchRatio:0.006, maxDimensionDelta:0,
      pixelThreshold:0}` (worst observed 468/95400 = 0.49%; `maxDimensionDelta:0` still trips
      on any real size regression). Same class of irreducible raster floor as
      `slider-thumb-antialias-1lsb`, here a sub-pixel baseline rather than an anti-aliased
      edge. Revisit only if a future field-label change re-rounds the side-layout label onto
      a whole pixel; otherwise it stays as the documented raster floor.
  - id: ci-main-gate-wiring
    title: Push main and run the gate ladder on main pushes; wire the orphaned checks
    state: done
    finished: 2026-07-06
    roadmap: certification-enforcement
    note: >-
      DONE 2026-07-06. certification-gates.yml + release-readiness.yml now both trigger on
      push-to-main; the three previously-orphaned checks (comparison:test:certified,
      guard:jsx-deopt-size, guard:upstream-test-parity) are wired into the report-only
      ladder. VALIDATED END-TO-END: the first main pushes fired the gates for real —
      release-readiness caught 5 latent typecheck:apps errors (solid-h createComponent cast +
      labeledvalue-demo strict-input) that had accumulated unseen while CI was dark, they
      were fixed faithfully (commit 73903a5b), and the re-run went green (run 28825943495).
      This is exactly the rot the wiring exists to catch. certification-gates stays
      report-only (continue-on-error) — flipping the certified suite to blocking is the
      separate ci-gates-required task, gated on the D4 event-ordering policy. Follow-on:
      release-train-unjam (still owner-gated).
  - id: release-train-unjam
    title: Unjam the release train — version PR #7, 101 changesets, npm one patch behind
    state: next
    roadmap: ui-release-promotion
    note: >-
      Director pass 2026-07-06: the changesets version PR #7 has been stuck ~20 days;
      101 changesets pending; npm lags the repo one patch on solid-spectrum,
      solidaria-components and viviana-ui — the SSR hydration fix has never been
      published to installed consumers. Exit criteria in the prose section.
  - id: main-rot-burndown-2026-07
    title: Burn down live rot on main — 7 unit fails, 2 a11y-smoke fails, format drift
    state: done
    finished: 2026-07-06
    roadmap: recertification
    note: >-
      DONE 2026-07-06. All three parts were STALE TESTS, not source bugs — the port
      was faithful in every case. (1) The 7 unit fails (ContextualHelpTrigger ×5,
      Menu ×1, ActionMenu ×1) all asserted the pre-CP9.34 divergence where the
      HeadingContext DEFAULT slot minted the dialog title id; CP9.34 (7a13361f)
      correctly reverted that to match S2 ContextualHelp (default slot = styles only,
      only `slot="title"` names the dialog). Fixed by adding `slot="title"` to the
      test headings (Menu/ActionMenu, matching upstream stories exactly) and dropping
      incidental `{ name }` dialog filters where the trigger label names the button,
      not the dialog (commit 999f70a9, test-only). (2) The 2 a11y-smoke fails (Toolbar
      `End`, ActionBar `Home`) asserted Home/End roving focus that CP9.3 (0ae50edf)
      deliberately removed from createToolbar — upstream useToolbar binds neither, only
      arrows + Tab. Realigned both e2e tests to arrow-nav and renamed the toolbar test
      to drop the Home/End claim. (3) 26-file oxfmt drift (accumulated while CI dark)
      fixed via `vp check --fix` — pure formatting, no semantic change. Verified green:
      check (0 errors), test:run (5524 passed), a11y:check (44/44).
  - id: menu-actionmenu-d5-d6-backfill
    title: Backfill D5 focus-trail + D6 AX-tree evidence on the Menu and ActionMenu certifications
    state: done
    roadmap: recertification
    note: >-
      DONE 2026-07-06 (CP9.37 ul→div, CP9.38 D5, CP9.39 D6). Menu (CP9.32) and
      ActionMenu (CP9.33) certified without D5/D6 coverage — for keyboard composites
      those are exactly the drivers that would catch an SR-operability regression
      (the menu-focus-roving class of bug). Both phases each surfaced a REAL port
      bug: D5 caught the menu container roving tabindex (hard-coded 0 vs upstream
      `focusedKey==null ? 0 : -1`, fixed as a getter that survives mergeProps);
      D6 caught the stripped item `aria-describedby` + unassigned description/
      keyboard ids (restored via createSlotId in createMenuItem + id-props threaded
      through MenuItemRenderProps into the S2 TextContext/KeyboardContext slots;
      shared Text/Keyboard source untouched, so no field regression). Both certs
      green including D5/D6 (48/48 across both units), 215 menu unit + 580 field/
      text unit + 72 axe smoke green. Rule "D5+D6 mandatory for keyboard-heavy
      composites" adopted into certification.md ("Driver applicability").
  - id: recert-drivers-d9-d12
    title: Land the remaining pair-oracle drivers — D9 forced-colors, D10 RTL, D11 timing, D12 SSR
    state: next
    roadmap: recertification
    note: >-
      D1–D8 are landed and calibrated; D9–D12 exist only as plan text, so
      forced-colors and RTL have zero coverage repo-wide. SEQUENCING RESOLVED
      2026-07-06 (owner call): land D9+D10 BEFORE the Tier 4 march and re-run the
      certified set against them (certifying Tier 4 first means re-marching Tiers
      1–3 later); D11/D12 can follow. D9 = D1 re-run under `forcedColors: 'active'`
      comparing resolved system-color keywords; D10 = D1+D5 re-run under `dir=rtl`
      + `ar-AE` (icon mirroring, arrow inversion, date/number formatting equality)
      — both are re-run modes over the existing pixel/state-matrix/focus oracles,
      not new oracles. This is Track A of the parallel Tier-4 program (steering.md
      Next); independent of the port source, so it runs concurrently with Track B
      (`d4-microtask-defer`). Blocks Track C (Picker certifies against the full
      driver set incl. D9/D10). Exit: drivers land with the same calibration
      discipline as D4/D5 (a pilot component red→green each — ToggleButton), and
      the certified suite runs them across Tiers 1–3.
  - id: d4-event-ordering-decision
    title: Decide the D4 event-ordering policy before Tier 4 (microtask deferral vs oracle normalization)
    state: done
    finished: 2026-07-06
    roadmap: recertification
    note: >-
      RESOLVED 2026-07-06 (owner call) → policy (a): microtask-defer the ports.
      The 5 deferred D4 reds (Tabs ×2, Dialog ×2) trace to React batched-effects
      vs Solid synchronous updates interleaving callback/focus events differently
      intra-gesture; Tier 4 collections multiply the exposure. Decision: defer
      Solid callbacks to match React's batched-effect ordering so consumers see
      the faithful upstream event order, keeping the parity rule (oracle
      normalization was rejected as a standing divergence that compounds across
      collections). Implementation is `d4-microtask-defer`.
  - id: d4-microtask-defer
    title: Clear the deferred D4 event-ordering reds
    state: done
    roadmap: recertification
    note: >-
      CLOSED 2026-07-15. Triage first (parity rule) collapsed the historically
      cited "5 reds" to ONE real port-ordering bug — `Tabs touch-tap`; the rest
      were already green or reclassified (Tabs arrow-next + D5 pass; Dialog's
      residual waiver is D6 aria-hidden, not D4; ActionButton-class was fixture
      memo-rebuilds per CP9.1). The one red was NOT a callback-defer problem: the
      port set `focusedKey` in the item's `onFocus` (native `focus`) handler, and
      Solid reflects that into the roving `tabIndex` before the D4 oracle's
      document capture-phase read at `focusin` (browser-console ordering probes
      proved the microtask queue drains in the single checkpoint *between* `focus`
      and `focusin`, so a microtask-defer — the primitive this ticket assumed —
      cannot escape it; only a rejected timer-macrotask could). Faithful fix:
      React's `onFocus` is a `focusin`-delegated root listener, so bind the roving
      commit to `focusin` (createTabs.ts `handleFocusIn`). tabs.certified 23/23
      with ZERO waivers; unit suite 5528 green. See recertification.md
      2026-07-15 entry. No D4 reds remain anywhere.
  - id: d6-announcement-calibration
    title: Live-transcript announcement oracle over a body-portaled toast (structural live-region done)
    state: open
    roadmap: recertification
    note: >-
      PARTIALLY CLOSED by Toast CP9.35 (2026-07-06). The structural half is done:
      the D6 AX driver certifies the `role="alert"` live region appearing in the
      Toast alertdialog subtree (the announce-on-appear surface), green in
      toast.certified.spec.ts. What remains is the *transcript* oracle — asserting
      the announced string is spoken into the live region on add/remove — over a
      body-portaled toast whose queue lives in a separate module instance per panel.
      That is an announcement-mechanism assertion, not a live-region-structure one,
      and needs its own harness; deferred as its own follow-up rather than blocking
      the paint/AX cert.
  - id: combobox-d6-announcements
    title: ComboBox filter live-region transcript (CP9.45b — structural combobox paint/focus cert done)
    state: open
    depends: [d6-announcement-calibration]
    roadmap: recertification
    note: >-
      ComboBox certified 2026-07-08 (CP9.45a) across D1/D3/D5/D6/D7/D8/D9/D10 — the
      paint, the virtual-focus `aria-activedescendant` walk, and the `role=listbox`
      AX subtree are all green. Split out here as CP9.45b: the live-region "N options
      available" filter transcript — the `focusAnnouncement`/`countAnnouncement`/
      `selectedAnnouncement` strings spoken into the combobox's `aria-live` region as
      the user types and filters. Never before exercised by a driver; needs the same
      transcript oracle harness as `d6-announcement-calibration` (assert the SPOKEN
      string, not just the live-region structure). The full upstream 32-locale
      announcement table is already ported, so this is harness-only. Deferred so a
      driver-calibration surprise can't block the shipped paint/focus cert.
  - id: dnd-subsystem-port
    title: Port the drag-and-drop subsystem (6 missing S2 exports; TableView/TreeView/GridList DnD)
    state: open
    roadmap: upstream-api-parity
    note: >-
      The last un-ported subsystem. useDragAndDrop, DragPreview, DIRECTORY_DRAG_TYPE
      and isTextDropItem/isFileDropItem/isDirectoryDropItem are 6 of the 7 remaining
      missing S2 exports (comparison:report:exports), and TableView/TreeView ship
      without DnD rows. Epic — scope against upstream @react-aria/dnd + RAC
      useDragAndDrop before the Tier 4/5 collection marches reach DnD states.
  - id: labeledvalue-strict-parity
    title: Close the LabeledValue strict-parity gap (validation note + evidence + LabeledValueContext)
    state: open
    roadmap: component-certification
    note: >-
      The single comparison:report:parity:strict failure: LabeledValue lacks
      labeledvalue-validation-notes.md and current visual/asserted evidence; its
      LabeledValueContext is also the one non-DnD missing S2 export. Exit: strict
      report fully green, and the exports report shows only the 6 DnD names.
---

# Tech Debt

Status: live debt log.
Update when: a debt is added, paid down, or its exit changes.

Known debt and temporary bridges. Each entry names its exit so it does not become
permanent.

## Evidence checks exist but nothing runs all of them

The check set (`vp run check`, `guard:*`, `comparison:report:parity:strict`,
`comparison:test:pair`/`test:contract`, `docs:check`) is defined in `package.json`
but no CI workflow invokes it, so any drift these guards and the pair/contract
suites would catch can merge green. `vp run typecheck` _does_ run in CI (via
`build` in `release-readiness`), but it passes only because the remaining
`solid-spectrum` component files carry `@ts-nocheck` and `tsc` skips them — the
`style/` subsystem is now checked (`ts-nocheck-style` paid down 2026-06-21), but
the ~29 components still are not. This is the root enabler beneath the type-check, axe, and
visual-coverage debts below (Rule #1/#7). A non-blocking `certification-gates.yml`
workflow now projects the full check set's status on every PR as the first step
toward enforcement.

Sharpened by the 2026-07-06 director pass (`ci-main-gate-wiring`): "on every PR"
is the wrong trigger for this repo. Work lands direct-to-main, so the PR-only
ladder structurally never fires — CI had been dark since 2026-06-24 with main 67
commits ahead of origin unpushed, and rot accumulated unseen
(`main-rot-burndown-2026-07`). Additionally `comparison:test:certified` — the
suite that actually enforces the recertification bar — is wired into no workflow
at all, and `guard:jsx-deopt-size` / `guard:upstream-test-parity` are wired into
no gate.

**Exit:** main is pushed; a CI job runs the full check set (typecheck + `vp run
check` + `comparison:test:contract` + `comparison:test:certified` + ungated axe +
`guard:*` including jsx-deopt-size and upstream-test-parity + `docs:check`) **on
push to main** as well as on PRs, so "green" means the documented bar passed on
the branch people actually commit to. Validate by pushing a commit and watching
the run fire.

**DONE 2026-07-06.** `release-readiness.yml` (blocking: `build` +
`typecheck:apps` + `test:run`) and `certification-gates.yml` (report-only, now
carrying `comparison:test:certified`, `guard:jsx-deopt-size`,
`guard:upstream-test-parity` alongside typecheck + `vp check` + contract +
`a11y:full` + the rest of the guards + `docs:check`) both trigger on
push-to-main. Between the two, the full check set fires on the branch people
actually commit to. **Validated end-to-end:** the first main pushes fired the
gates and immediately earned their keep — `release-readiness` failed on 5 latent
`typecheck:apps` errors that had accumulated while CI was dark (a `createComponent`
cast in `solid-h.ts` and the strict `Partial` input to
`normalizeLabeledValueDemoProps`), they were fixed faithfully (commit `73903a5b`),
and the re-run went green (run `28825943495`). It stays report-only until
`ci-gates-required` (the D4 event-ordering policy gates flipping the certified
suite to blocking). Remaining pipeline work is `release-train-unjam`, still
owner-gated on a merge + npm publish.

## Release train jammed — published packages lag the repo

Found 2026-07-06 (`release-train-unjam`): the changesets version PR #7 has been
stuck ~20 days, `101` changesets are pending, and npm is one patch behind the
repo on `solid-spectrum`, `solidaria-components`, and `viviana-ui` — the SSR
hydration fix has never reached installed consumers. The release pipeline exists
(`release-policy.md`) but nothing moves it while commits bypass PRs.

**Exit:** version PR merged (or the changesets flow re-run), pending changesets
drained, npm versions match the repo's package versions, and a stated cadence in
`release-policy.md` for when the train ships (e.g. on every certified-tier
completion). Validate with `npm view <pkg> version` against the workspace
manifests.

## Shared headless spine is re-implemented per widget

Upstream's shared machinery was missing or inert and hand-rolled inside each widget,
so one bug recurs across many. Keystones 1–3 have now ported the lower layers (see
**Spine progress** below), but they are not yet consumed, so the duplication is
still live: `SelectionManager` had been rewritten with a different anchor/current
model (`createSelectionState.ts:241-269`, now superseded by the port); the shared
`createSelectableCollection` exists but each widget still inlines arrow/Home/End
(`createMenu.ts:201-406`); the collection widgets do not yet consume
`useContextProps`/`useSlottedContext`. `migrate-describedby-slots` is now IN PROGRESS,
though, and the field/toggle components DO wire description/error slots through the
faithful nested `Provider` (`<Provider values={[[TextContext, {slots}]]}>`) — TextField/
SearchField/NumberField/DateField/TimeField/ComboBox/DatePicker keep their props and
add slots (hybrid), while SwitchField/CheckboxField/RadioField dropped the props for
the pure upstream slot path (DOM-probed `createSlotId` + reactive binding). Upstream
`react-aria-components` is UNIFORMLY slot-based at this layer (every field hook `Omit`s
description/errorMessage and exposes `TextContext` slots; the props live only in the S2
layer), so two of our states are parity divergences — now tracked as tasks: the 7 hybrids
still CARRY the props (`rac-field-prop-divergence`), and RadioGroup/CheckboxGroup/Select/
ColorField are still fully prop-based (`describedby-slots-group-redesign`). Both are
owner-authorized breaking closures (parity > breaking; no real users yet). NOTE: the
shared `createField` hook must stay prop-conditional — swapping it to emit `createSlotId`
ids unconditionally dangles refs in its ~9 non-reactive consumers (see the
migrate-describedby-slots memory). Rule #4/#5.

A live instance of "one bug recurs across many": both the collection hook and the
item hook handle the selection key, so a focused-row Space toggles selection twice
and nets no change. Now fixed per-widget in both Table (grid-level Space/Enter
block removed, selection left to `createTableRow.ts`, 2026-06-19) and GridList
(same removal from `createGridList.ts`, selection/activation left to
`createGridListItem.ts`, plus a Table-style focus-following effect that carries
browser focus onto the focused row by a stable `data-key` so the row's own
handlers receive the keypress, 2026-06-21). Upstream `useSelectableCollection` has
no Space/Enter case; the item owns selection. These remain stopgaps — the spine
port should delete the duplication at its source instead of fixing it widget by
widget.

**Spine progress.** All three keystones have landed: keystone 1
(`port-selection-manager`, commit 7c1708c4), keystone 2
(`port-list-keyboard-delegate`, 2026-06-21), and keystone 3
(`port-context-slots`, 2026-06-21). The shared `SelectionManager`,
`ListKeyboardDelegate` / `DOMLayoutDelegate`, `createSelectableCollection`,
`createSelectableList`, and now the faithful `solidaria-components/utils.tsx`
context machinery (`Provider` nests `[Context, value]` pairs with lazy children;
`useSlottedContext` resolves a `slots` record with the `DEFAULT_SLOT` fallback /
throws on unknown / `null` opts out; `useContextProps(props, ref, ctx)` resolves
`props.slot`, merges context props under the component's own via the reactive
handler-chaining `mergeProps`, and merges the component+context refs; plus
`useSlot`, `RefLike`/`SlottedValue`/`SlottedContextValue`, `assignRef`/`mergeRefs`)
all exist. They are _additive_ so far — no widget consumes them yet; the per-widget
arrow/Home/End copies in `createMenu.ts` / `createListBox.ts` are still live and get
deleted in the `migrate-*-spine` tasks, which are the next step now the spine is
complete. Three caveats carried by keystone 2:

- **`data-collection` is dormant until a container registers it.** Items stamp a
  `data-collection` id only when their `SelectionManager` has been registered by a
  `createSelectableCollection` container (`getCollectionId` returns `undefined`
  otherwise, and a `undefined` Solid attribute is omitted). So in today's
  unmigrated widgets the attribute is absent and `getItemElement` falls back to an
  unscoped `[data-key]` lookup — identical to before. The scoping activates per
  widget as each migrates onto `createSelectableCollection`; until then no
  snapshots change.
- **Virtual-focus AT-cursor movement is a documented gap.** `createSelectableCollection`
  preserves the focused-key bookkeeping around virtual focus (the FOCUS/CLEAR-FOCUS
  listeners, `shouldVirtualFocusFirst`) but does **not** yet port upstream's
  `moveVirtualFocus` / `dispatchVirtualFocus`, which move the actual AT cursor.
  Consistent with the same gap in `createSelectableItem`; needed by the
  autocomplete bridge's virtual-focus mode.
- **`createTypeSelect` does its own collator search (focus-only).** It does not
  route through the `ListKeyboardDelegate.getKeyForSearch`; this matches upstream
  `useTypeSelect` (which also searches independently) and is a pre-existing
  divergence kept as-is — the delegate's `getKeyForSearch` is exercised directly
  by `ListKeyboardDelegate.test.ts`.

**Downstream blocked here: `autocomplete-collection-bridge` (Bucket D).** Our
`createAutocomplete` controller is a faithful port — it already dispatches
`AUTOCOMPLETE_FOCUS_EVENT` / `AUTOCOMPLETE_CLEAR_FOCUS_EVENT` and emits
`collectionProps` (`filter`, `autoFocus`, `shouldUseVirtualFocus`,
`disallowTypeAhead`) — and `Autocomplete.tsx` provides the
`AutocompleteContext` / `AutocompleteCollectionContext` / `AutocompleteStateContext`
providers. But **no collection consumer can receive any of it**: upstream wires the
FOCUS/CLEAR-FOCUS listeners + `autoFocus`-on-mount + virtual-focus nav inside
`useSelectableCollection`, and consumes the contexts via
`useContextProps(props, ref, FieldInputContext / SelectableCollectionContext)` plus
a filtered-list state (`UNSTABLE_useFilteredListState`). Two of those three now
exist: the shared selectable-collection hook (`port-list-keyboard-delegate`, DONE)
and a faithful slot-resolving `useContextProps` + nested `Provider`
(`port-context-slots`, DONE). What remains is (a) `createListState.ts` has no
`filter` (the filtered-list-state item, still a `headless-spine-port` task), and
(b) the actual consumer wiring — no collection widget yet _reads_
`SelectableCollectionContext` / the autocomplete contexts through `useContextProps`
(that happens in the `migrate-*-spine` tasks). So the bridge is still not a
consumer tweak; resume `autocomplete-collection-bridge` after the filtered-list
state lands and the menu/listbox migrations wire the contexts — and don't fake it
with bespoke per-widget consumers (which would re-create the very duplication this
section exists to remove).

**Exit:** the three keystones (`SelectionManager`, `ListKeyboardDelegate`/
`useSelectable*`, `useContextProps` + slot plumbing) are ported to their lowest
layer and the per-widget copies deleted; `aria-describedby` is emitted via the
shared slot path; `autocomplete-collection-bridge` then wires onto them.

## Menu screen-reader operability — RESOLVED 2026-06-15; certification backfill open

The original debt: arrow keys updated `state.setFocusedKey` and flipped `tabIndex`
0/-1 but nothing moved real DOM focus, so the AT cursor never followed. Resolved
by `menu-focus-roving` (proof-batch PR #6): the spine's `createSelectableItem`
focuses the element whenever it becomes the collection's `focusedKey`
(`createSelectableItem.ts:300-304`, mirroring upstream `useSelectableItem`), and
the exit's Playwright contract exists and passes —
`apps/web/e2e/menu-focus.spec.ts` asserts Arrow/Home/End land real focus
(`toBeFocused()`), green in the 2026-07-06 a11y-smoke run. Adjudicated against
code + the passing contract on 2026-07-06; this section previously still
described the pre-fix state.

What remained was certification-level, not operability-level: Menu and ActionMenu
were recertified (CP9.32/9.33) without D5 focus-trail or D6 AX-tree drivers, so
the certified suite would not catch a regression of exactly this bug. Tracked as
`menu-actionmenu-d5-d6-backfill` — **DONE 2026-07-06 (CP9.38 D5, CP9.39 D6).**

**Exit (backfill) — met:** Menu and ActionMenu certified specs now include D5+D6
sections and pass (48/48 across both units); `certification.md` ("Driver
applicability") states that keyboard-heavy composites do not certify on the paint
drivers alone. Registering the drivers surfaced two real port bugs (D5 container
roving tabindex; D6 stripped item `aria-describedby`), both fixed faithfully.

## Pair-oracle drivers D9–D12 unlanded; D4 policy undecided; D6 announcements never green

The recertification harness runs D1–D8 only. Consequences, found 2026-07-06:

- **D9 forced-colors and D10 RTL have zero coverage repo-wide** — no test
  anywhere renders a component under `forced-colors: active` or `dir="rtl"`.
  Tracked as `recert-drivers-d9-d12`; the sequencing question (land before the
  Tier 4 march and re-run the certified set, or after) is an owner decision in
  `steering.md`. D11 timing / D12 SSR follow the same ticket.
- **The D4 event-ordering epic needs a policy before Tier 4**
  (`d4-event-ordering-decision`): 5 deferred reds on Tabs/Dialog trace to React
  batched-effects vs Solid synchronous updates; collections multiply the
  exposure, and per-component waivers would rot into noise.
- **Live-region announcements — structure certified, transcript oracle deferred**
  (`d6-announcement-calibration`): Toast CP9.35 (done 2026-07-06) certifies the
  `role="alert"` live region in the AX tree (structural). The transcript oracle
  (asserting the spoken string on add/remove over a body-portaled toast) remains.

**Exit:** each per the task notes above; collectively, the certified suite runs
D1–D10 and at least one announcement pair assertion is green.

## DnD subsystem is un-ported

`useDragAndDrop`, `DragPreview`, `DIRECTORY_DRAG_TYPE`, and
`isTextDropItem`/`isFileDropItem`/`isDirectoryDropItem` are 6 of the 7 remaining
missing S2 exports, and TableView/TreeView ship without DnD rows — this is the
one whole subsystem with no port. Tracked as `dnd-subsystem-port`; an epic to
scope against upstream `@react-aria/dnd` + RAC `useDragAndDrop` before the
Tier 4/5 collection marches reach DnD-dependent states.

**Exit:** the exports report shows 0 missing; TableView/TreeView/GridList DnD
states have pair-oracle evidence in their certified specs.

## LabeledValue is the last strict-parity gap

The single `comparison:report:parity:strict` failure: LabeledValue lacks a
validation note and current evidence, and `LabeledValueContext` is the one
non-DnD missing S2 export. Tracked as `labeledvalue-strict-parity`.

**Exit:** `comparison:report:parity:strict` fully green;
`comparison:report:exports` shows only the 6 DnD names missing.

## Styled components bypass the style macro (ship unstyled)

The macro engine is byte-identical to S2, but `14` public components (ListBox,
Select, Toolbar, Well, StepList, Separator, …) hand-author utility classes against
tokens that do not exist (`text-primary-200`, `bg-bg-400`) with no Tailwind/UnoCSS
build to resolve them (`select/index.tsx:167-223`, `listbox/index.tsx:96-189`).
They render only because `apps/web` ships a `local-utilities.css` backfill; an
installed consumer gets them unstyled, and the comparison harness masks this by
running in the same app scaffolding. Rule #4 / ADR-0001.

**Exit:** every styled component derives its classes from the `style()` macro; the
`local-utilities.css` backfill is deleted; the comparison harness renders the built
package, not in-repo source.

## Styled layer ships type-unchecked

`solid-spectrum` carries `@ts-nocheck` on ~`29` source files (the components;
`0` such files in the three lower packages, and the `style/` subsystem cleared
2026-06-21 — `ts-nocheck-style`, with its 21 strict-mode errors reconciled by
minimal null-checked loose-lookup casts mirroring upstream's
`noImplicitAny:false` semantics). `vite.config.ts:36-48` still sets `13` lint
rules to `"off"` (incl. `typescript/no-floating-promises`,
`eslint/no-unused-vars`). With typecheck also absent from CI (above),
prop/generic/variant drift in the remaining unchecked components is invisible.
`TableView` and `Menu` compile clean without the pragma, so it is removable, not
load-bearing. Distinct from "Lint type-checking runs separately" below, which is
about the `tsgolint` contract, not blanket suppression.

**Exit:** no `@ts-nocheck` under `packages/*/src`; the `13` disabled rules are
re-enabled or each justified inline; typecheck is green in CI.

## Tests do not enforce the evidence bar

Coverage is visual-shaped, not behavior-shaped: `59` of `69` components have
visual-only e2e (no keyboard/focus/announcement contract); `5` WCAG axe scans
`test.skip` unless `RUN_AXE=1`, so `test:e2e` passes with zero axe assertions; the
sole live-region test is tautological (permits zero announcements,
`Toast.test.tsx:407-411`); and a calendar test asserts the known-wrong default
alignment (`createCalendarState.test.ts:758-769`). Extends "Visual-state coverage
debt" below from quantity (pair-diffs) to integrity (Rule #7).

**Exit:** each of the `59` gets a keyboard/focus/announcement contract spec; axe is
ungated in the blocking job; the tautological and bug-asserting tests are replaced
with ones that fail on the real defect.

## Component APIs invented beyond upstream

Upper-layer components added a few props upstream does not have, so those props
were judged against nothing. `viviana-ui` also minted public names (`Header`/`NavHeader`/
`LateralNav`) without owner sign-off (Rule #2/#3) — still open.

**Exit:** invented props are removed or documented as explicit local additions;
public names-with-reach are owner-confirmed; `guard:rac-parity` covers the props.

> **DONE — Picker/TreeView invented props removed 2026-06-21 (commit pending).**
> The owner authorized the breaking removal ("we don't have real users yet so
> breaking doesn't matter, parity is priority"). What was actually invented was
> _narrower_ than this section previously claimed — the audit had over-counted:
>
> - **Picker:** only the legacy controlled-value aliases `value`/`defaultValue`/
>   `onChange` (plus the `PickerValue` type and the value⇄key translation helpers)
>   were invented; **removed**. Consumers use the real S2 props
>   `selectedKey`/`defaultSelectedKey`/`onSelectionChange` (single) and
>   `selectedKeys`/`defaultSelectedKeys`/`onSelectionChangeKeys` (multiple).
>   `renderValue` is **real S2** (S2 `Picker.tsx:161-166`) and was **kept** — the
>   earlier "invents … `renderValue`" claim was wrong.
> - **TreeView:** only `overflowMode` (plus the `TreeOverflowMode` type and the
>   `data-overflow-mode` attribute) was invented — absent from S2 `TreeView.tsx`
>   and RAC `Tree.tsx`; **removed**, the tree label/description now always
>   truncate. `onAction`, `renderActionBar`, and `selectionStyle` are **all real
>   S2** (S2 `TreeView.tsx:80/82/93`) and were **kept** — the earlier "grafts
>   CardView's `selectionStyle`/`renderActionBar`/`overflowMode` … whose only S2
>   prop is `onAction`" claim was wrong. `GridList`/`ListView`/`Table` keep their
>   own legitimate `overflowMode`; only the tree's invented copy is gone.
>
> Tracked as `picker-api-upstream` + `treeview-api-upstream` (both done). The
> `viviana-ui` public-names half of this item remains **open**.

## Form-field split: monoliths kept primary, no `@deprecated` tags

RAC 1.19 split Switch/Checkbox/Radio into a `*Field` wrapper + `*Button` control
and marked the monolith wrappers deprecated. We added the nine split names
(`rac-form-field-wrappers`, done 2026-06-21) but the monolith wrappers
(`ToggleSwitch`, `Checkbox`, `Radio`) remain the **styled primaries** and carry
**no hard `@deprecated` JSDoc tags** — two conscious divergences from upstream.
Reason: our styled layer (`solid-spectrum`) still composes the monoliths, so
deprecating them would cascade a refactor that is out of scope for an additive
parity-absorption item. The field→button STATE handoff uses a native
`Internal*Context` (read inside the provider via `Show … keyed`). The description /
errorMessage handoff, however, now DOES use upstream's nested
`Provider values={[[…],[TextContext,{slots}]]}` — `port-context-slots` made the
`Provider` a real nested-provider (2026-06-21), and SwitchField/CheckboxField/
RadioField now drop the description/errorMessage props and wire those ids through it
(`migrate-describedby-slots`, IN PROGRESS, commits ff17912a/e2a8850c/374d3ad8). No
`createSlottedContext` migration was needed — the nested Provider carries the slots
record directly.

**Exit:** the `*Field` components already carry description / errorMessage via
`Provider values={[[…],[TextContext,{slots}]]}` (the now-functional `Provider`); what
remains is the styled layer migrating onto the `*Field`/`*Button` split and the
monoliths getting `@deprecated` tags (or are
removed).

## i18n strings hardcoded in the data/spectrum layers

**Cell + grid facets DONE 2026-06-21 (`calendar-i18n-strings`).** The calendar
cell label now routes the today/selected suffix through `formatCalendarLabel`
(`createCalendarCell.ts` buttonProps) — mirroring `@react-aria/calendar`
useCalendarCell, so today gains the "Today, …" prefix and the suffix localizes
(en-US `… selected`, fr-FR `… sélectionné`, ar-AE `… المحدد`) instead of a
hardcoded English `" selected"`. The calendar grid now carries a localized
accessible name: `createCalendar`/`createRangeCalendar` publish `ariaLabel`/
`ariaLabelledBy` into the shared `CalendarHookData`, and `createCalendarGrid`
joins `[ariaLabel, visibleRangeDescription]` per-grid (each month names itself),
matching useCalendarGrid. `Calendar.test.tsx` adds the contract test across en-US,
fr-FR, and the RTL ar-AE locale plus the per-grid name assertion.

**Resolved (`calendar-segment-i18n`), 2026-07-15 — entry was STALE:** the prose
above described a state the code had already moved past. When filed (2026-06-21)
the plan feared a hardcoded `SEGMENT_LABELS` table and a dropped field label
across 5+ files. But the DateField cert (commit `81693117` / CP9.60, 2026-07-11)
already landed the faithful port: `createDateSegment.ts:401-413` builds each
segment name from `displayNames().of(seg.type)` — `createDisplayNames` wraps
`Intl.DisplayNames(type:"dateTimeField")` with a `datePickerDictionary` polyfill
fallback, so part names localize (`day`/`Tag`/`jour`/يوم) with **no** hardcoded
table and no `getSegmentLabel` — and composes the field's own aria-label
(threaded from `createDateField` through the `hookData` WeakMap, `hd?.ariaLabel`)
after the part name: `${name}${ariaLabel ? ', ' + ariaLabel : ''}${ariaLabelledBy ? ', ' : ''}`,
exactly upstream useDateSegment. The only genuine gap was contract coverage:
`createDateSegment.test.tsx` asserted only `/day/i` in en-US.

**Exit — MET 2026-07-15:** `createDateSegment.test.tsx` now pins (a) field-label
threading (`hookData` ariaLabel `"Birth date"` → `aria-label === "day, Birth date"`)
and (b) an `it.each` over the Calendar contract locales en-US/fr-FR/ar-AE (RTL)
that derives the expected localized part name the same way the code does and
asserts the non-English cases no longer contain the English `day`. Full suite
green (5537 passed). No source change needed.

**Still open (`color-i18n-rtl-parity`), filed 2026-07-07:** two pre-existing
color visual-spec reds, both ar-AE (RTL) locale parity gaps — NOT introduced by
the 2026-07-07 drag fix (`8cf9e084`); proven pre-existing because the untouched
`createColorSlider` fails identically. Facets:
  - **A — hardcoded ColorArea aria strings.** `createColorArea.ts:35` sets
    `colorPickerLabel = () => "Color picker"` and `aria-roledescription: "2D slider"`
    as English literals. Upstream `useColorArea` routes both through
    `useLocalizedStringFormatter(intlMessages, '@react-aria/color')` — `colorPicker`
    and `twoDimensionalSlider` keys carry 30+ locales (ar-AE `أداة انتقاء اللون`).
    `colorarea-visual.spec.ts:360` asserts `solid.ariaLabel === react.ariaLabel`
    and gets `"Color, Color picker"` vs `"Color, أداة انتقاء اللون"`. Fix = feed the
    color hooks a string formatter over a color intl catalog (reuse the shipped
    `createStringFormatter`/i18n stack in `@proyecto-viviana/ui` — do NOT hardcode;
    see the calendar-i18n cell/grid pass for the pattern) and format `colorPicker`
    + `colorInputLabel` + the `twoDimensionalSlider` roledescription. Likely also
    covers ColorWheel/ColorSlider channel roledescriptions that are hardcoded.
  - **B — ColorSlider RTL output column width.** `colorslider-visual.spec.ts:445`
    fails on `gridTemplateColumns` — React `"155px 37px"` vs Solid `"177px 15px"`.
    The `"label output"` grid's `output` column is `auto`, so it sizes to the
    rendered value-label text; in ar-AE the Solid output renders a narrower/
    differently-formatted value than React (15px vs 37px), i.e. the thumb value
    label is not localized to the same string under RTL. Root-cause the value
    formatting (`getThumbValueLabel`/channel-value format) in the Arabic locale
    before adjusting any CSS — the grid template itself matches (`"1fr auto"`).

**Exit:** both color visual specs pass at ar-AE; color aria strings + the slider
output value label localize through the i18n dictionary (no English literals),
with the existing RTL contract assertions green.

## viviana-ui boundary skips and dead natives

`viviana-ui` reaches two layers down: `4` natives import `Button as HeadlessButton`
from `@proyecto-viviana/solidaria-components`, skipping `solid-spectrum`
(conversation/chip/nav-header/event-card) — not a behavior fork, but a layer-skip.
`19` `solid-spectrum` sub-path exports are absent from `viviana-ui`'s exports map,
so `import … from "@proyecto-viviana/ui/Tabs"` throws for an installed consumer
(distinct from the S2 support-export gap below). Three natives
(`Header`/`NavHeader`/`LateralNav`) are dead code.

**Exit:** an unstyled Button passthrough exists in `solid-spectrum` and natives
import from there; the `19` sub-paths are exported (or intentionally private); dead
natives are deleted or wired to a consumer.

## ~~Picker ships broken to installed consumers (popover unanchored + checkmark on every row)~~ — BOTH RESOLVED (checkmark 2026-07-07 `094ca40e`; popover 2026-07-15)

Two consumer-facing Picker defects found consuming `@proyecto-viviana/ui` in
Tortafritapp (admin role picker). An app-level workaround was applied there, but both
fixes belong upstream in `solidaria-components` `Popover` and `solid-spectrum`
`PickerItem`. Tracked as `picker-popover-anchor` and `picker-item-checkmark`. **Both
are now DONE:** `picker-item-checkmark` was fixed 2026-07-07 (commit `094ca40e`) and
verified stale-and-certified here 2026-07-15; `picker-popover-anchor` was fixed
2026-07-15 (see below).

**Popover never received the computed anchored position. — FIXED 2026-07-15.** The
popover rendered with the `createOverlayPosition` fallback (`position: fixed; top: 0;
left: 0; z-index: 100000; max-height: 100vh`) at the viewport origin instead of
anchored to the trigger; the trigger itself rendered correctly elsewhere. Root cause
(confirmed against source): `Popover.tsx` held the ref as a plain local (`let
popoverRef!: HTMLDivElement`) and passed `popoverRef: () => popoverRef ?? null` into
`createPopover`, whereas the sibling `groupRef` was already a `createSignal`. A Solid
local-variable ref assignment is not reactive, so `createOverlayPosition`'s main
effect (`:226-245`, tracks `overlayRef()`) read the ref before the lazy portal node
existed and never re-ran when `ref={popoverRef}` assigned it — the `current ?
"absolute" : "fixed"` / `top/left: 0` fallback stayed latched. Whether it ever
anchored was timing luck (a stray ResizeObserver/`isOpen` re-run), which is why the
comparison cert stayed green while the external consumer broke. This is the same
local/destructured-ref reactivity freeze already recorded for the spine port. **Fix:**
made the ref a signal (`const [popoverRef, setPopoverRef] = createSignal<HTMLDivElement
| null>(null)`), fed `() => popoverRef()` into `createPopover`, and bound `ref={
setPopoverRef}` — mirroring the sibling `groupRef` and faithfully matching React Aria
`useOverlayPosition`, which gets correct timing free from `useLayoutEffect`. Verified:
build + typecheck clean; all overlay certs green with zero regression (popover+picker
85; combobox/datepicker/daterangepicker/menu/actionmenu 218, 2 skipped); unit suite
5533 passed.

**Checkmark shows on every option. — FIXED 2026-07-07 (commit `094ca40e`), verified
stale here 2026-07-15.** ARIA was correct — only the selected option carried
`aria-selected` / `data-selected="true"` — but the SVG checkmark was visible on every
row. The base style was _not_ the cause: the macro `pickerCheckmark` already declared
`visibility { default: hidden, isSelected: visible }`. The real defect was that the
`visibility` toggle was routed through the icon `styles` override prop, whose path
filters overrides through `iconAllowedOverrides`, which faithfully omits `visibility`
— so the toggle atom was silently stripped and the checkmark painted on every option.
**Fix:** route the checkmark class through the raw `class` prop
(`class={pickerCheckmark({ ...renderProps, size })}`), matching the sibling Menu/Table
usage and upstream S2, where the checkmark is applied via `className` on a hand-written
ui-icon (raw, unfiltered). Applied to all three surfaces — Picker, ComboBox, TabsPicker.
Unlike the popover, this is a static structural routing change with no timing/environment
dependence, so it holds identically for consumers. **Certified:** the picker cert
adds `visibility` to the style allowlist and asserts it on BOTH a selected checkmark
part (visible) and an unselected one (hidden) — the exact consumer-visible symptom —
and the suite is green (popover+picker 85 passed this session). This entry was filed
2026-07-06 and the fix landed 2026-07-07; it was stale.

**Exit — MET.** The popover opens anchored to its trigger (not viewport `0,0`),
including portal-mounted popovers, and updates on resize/scroll; only the selected
option shows the checkmark (unselected `visibility: hidden`, selected `visibility:
visible`) with no layout shift; ARIA state is unchanged; both stay consistent with
React Aria / S2 Picker parity. Both defects are now resolved.

## ~~createToolbar keeps an invented text-input arrow guard (`toolbar-text-input-guard`)~~ — RESOLVED 2026-07-09 (CP9.52)

**RESOLVED** by the Toolbar cert (CP9.52, 2026-07-09). The dedicated toolbar cert
with a native text-input child case (`toolbar.certified.spec.ts`, flat walk that
drives real `document.activeElement` onto a "Size" `<input>` and presses an
arrow) confirmed against the RAC/`useToolbar` oracle that **upstream steals the
arrows** — no guard. The `isTextInputLikeElement` / `TEXT_INPUT_TYPES` guard was
deleted from `createToolbar.ts`; the wrong-oracle `createToolbar` unit was
inverted to assert arrows move focus off the input. (ActionBar's path had already
been cleared in CP9.50 by dropping `createToolbar` from its base root.) Original
entry preserved below for history.

`packages/solidaria/src/toolbar/createToolbar.ts` guards arrow keys when the
focused descendant is a text-entry control (`isTextInputLikeElement`): inputs of
a text-ish type, `role="textbox"`, `contenteditable`, `<textarea>`, `<select>`
retain ArrowLeft/Right/Up/Down for caret/value movement instead of the toolbar
consuming them for roving focus. **Upstream `useToolbar` (react-aria 3.50.0) has
no such guard.** During the ToggleButtonGroup cert (CP9.3, 2026-07-04) the guard
was _narrowed_ to arrows only — the invented `Home`/`End` handling it also
covered was removed as a self-inflicted parity divergence (Rule #1) — but the
arrow guard itself was **kept**, because ToggleButtonGroup contains no text input
so its D5 focus-trail driver never exercises it, and removing it unverified could
regress a real ActionBar/Toolbar text-input surface (e.g. a search field in a
toolbar) with no cert to catch the break.

This is a suspected divergence, not a confirmed-correct one: upstream may rely on
the text input's own `stopPropagation`, or may genuinely let the toolbar steal
the arrows. Resolve it in a dedicated ActionBar/Toolbar Phase-2 cert unit that
includes a text-input child case: diff the port against upstream `useToolbar` +
the real S2 ActionBar/Toolbar behaviour, then either delete the guard (if
upstream steals the arrows) or keep it with a validation note proving the
divergence is forced. Until then the guard is live and the comment in
`createToolbar.ts` (`onKeyDown`) points here.

**Exit:** a toolbar cert with a text-input child case decides the guard's fate
against upstream evidence; `createToolbar` either drops the guard or documents it
as a forced React→Solid divergence in a validation note.

## Meter emits single-token `role="meter"` instead of upstream's `"meter progressbar"` (`meter-role-fallback-token`)

Upstream `useMeter` (react-aria 3.50.0) deliberately emits the ARIA **fallback
token list** `role="meter progressbar"`, with an in-source rationale: Chrome/
Firefox historically fall back from the `meter` role (Chromium #944542, Bugzilla
#1460378), so the trailing `progressbar` token is a safety net for assistive tech
that does not support `meter`. The port diverges in two places:

- `packages/solidaria/src/meter/createMeter.ts` returns `role: "meter"` (single
  token), and
- `packages/solid-spectrum/src/meter/index.tsx` **hardcodes** `role="meter"` on
  the wrapper div _after_ spreading `meterProps`, so even a fixed `createMeter`
  would be overridden.

The comparison's React fixture (`apps/comparison/src/components/react/fixtures/
styled.js`, `ReactMeterDemo`) then patches upstream's native `"meter progressbar"`
DOM attribute _down_ to `"meter"` via a `useEffect`, so the two panels match. That
normalization **masks** the divergence: the Meter cert (CP9.10) is green because
both token lists resolve to the same `meter` role in the accessibility tree
(`ariaSnapshot()` reports `meter` either way), so D6 cannot see it. This is a
self-inflicted divergence (Rule #1), not a forced one — upstream ships
`"meter progressbar"` and passes its own axe.

**Why deferred, not fixed in CP9.10:** the faithful fix is three coordinated
edits — `createMeter` → `"meter progressbar"`, drop the hardcoded `role="meter"`
in the Meter component so `meterProps.role` flows through (mirroring upstream S2,
which spreads and never hardcodes), and delete the React fixture's normalization
`useEffect` — and it touches **solidaria**, which the comparison app consumes from
`dist` (a package rebuild), _and_ it must be re-validated against the blocking web
a11y/axe gate (`aria-allowed-role` on a multi-token role), which is outside the
Meter cert's harness. Low-risk (multi-token roles are valid ARIA and upstream
passes axe), but it is a build+gate change, not an e2e-only cert edit, so it is
filed rather than force-landed in an autonomous session.

**Exit:** flip `createMeter` to `"meter progressbar"`, remove the port's hardcoded
`role="meter"`, delete the React fixture normalization, rebuild solidaria + the
comparison app, and confirm (a) the Meter cert D6 stays green (both panels now
carry the native token list, both resolve to `meter`) and (b) `a11y:smoke` stays
green on the web Meter route. Then the fixture no longer masks anything and the
role is faithful.

## Package-build migration incomplete

Package builds are mid-migration to native Vite Plus packaging. Only
`@proyecto-viviana/solid-spectrum` has moved its JS/CSS build to `vp pack`/tsdown;
its declaration files still build through `tsc -p tsconfig.build.json`, and other
packages still use `tsup`.

**Exit:** every package builds through Vite Plus packaging (including dts);
`rg "tsup" package.json packages -g package.json` returns nothing, then `tsup` is
removed from the workspace.

## Lint type-checking runs separately

`typeCheck` is off in the Vite Plus lint block because the `tsgolint` path checks
files outside the `tsconfig.typecheck.json` contract (including mixed JSX test
files). Type errors are caught by a separate `vp run typecheck` after `vp check`,
not inside the lint pass.

**Exit:** the `tsgolint` path honors the `tsconfig.typecheck.json` contract;
re-enable `typeCheck` in the lint block and drop the separate step from `check`.

## axe color-contrast excluded from the blocking gate

`ci:a11y` (the blocking accessibility bar) temporarily excludes axe
`color-contrast`. `a11y:full` still runs contrast and stricter audits, but they do
not block PRs.

**Exit:** resolve the outstanding contrast findings, then remove the exclusion so
`color-contrast` blocks in `ci:a11y`.

## Visual-state coverage debt

The strict audit is green while visual-state coverage is partial: of `349`
tracked states, `113` have current React/Solid visual evidence and `56` have
strict pair-diff tests (`status.md`). No rows are _blocked_, but most are not yet
covered by visual evidence.

**Exit:** every rendering-affecting state row has a computed contract or strict
pair-diff test; screenshots remain review evidence only.

## Support-export gap — RESOLVED 2026-06-21

Root catalogue export parity and support-export parity are now both complete:
`comparison:report:exports` reports `0` missing S2 value exports, `0` missing
catalogue root exports, and `0` missing non-root/support exports against pinned
S2 1.5.0. The closed surface added the slotted-props contexts (each defining +
consuming its own `SpectrumContextValue`, additive by default via
`getSlottedContextProps(null, …)`), `PickerSection` / `ComboBoxSection`, and the
helper/hook re-exports under their upstream `use*` names.

Two parity-restoring fixes landed alongside: the form fields that apply the
Skeleton disabled-force (`TextField`/`DateField`/`TimeField`) merge the slotted
context **below** explicit props so the force stays outermost (mirrors upstream's
`useSpectrumContextProps` → `useFormProps` order); and `slot` was restored on
`ToggleSwitchProps` (our redefinition had dropped the `SlotProps` the headless
type carries). The public `TableContext` is distinct from the table's internal
row/density state, now renamed `InternalTableContext`.

Still genuinely unported (tracked as their own components/subsystems, not part of
this gap): `DragPreview`, the drag-and-drop helpers (`useDragAndDrop`,
`isFileDropItem`, …), and the `Collection` / `EditableCell` support values.

`LabeledValue` itself is now ported and certified (recert CP9.27, 2026-07-04 — the
faithful field-grid rebuild replacing the Tailwind stub). Two LabeledValue-scoped
follow-ups remain, tracked here rather than blocking the cert (which covers the
string/number/list value matrix byte-for-byte): (1) `LabeledValueContext` — the RAC
slotted-props context is not yet defined/consumed (the port reads only `FormContext`
via `useFormProps`; upstream additionally threads `LabeledValueContext`); (2) the
`RangeValue<number>` and `date` / `RangeValue<DateValue>` value branches — the port
currently formats only strings, numbers (via `NumberFormatter`), and string lists (via
`Intl.ListFormat`); upstream additionally formats a numeric range (two `FormattedNumber`s)
and dates/date-ranges (`FormattedDate`, needing `@internationalized/date` conversion).
Neither is a rendered-output divergence for the certified value types; both are additive.

**Exit:** met — `comparison:report:exports` shows no missing S2 support exports;
Solid-only extras remain documented as local additions in the report output.

## License attribution incomplete (per-file headers)

The packages are SolidJS ports (derivative works) of Adobe's Apache-2.0 React
Spectrum stack, but only `12` of `989` source files retain the required per-file
copyright/license notice (Apache-2.0 §4(d)). Repo-level attribution is in place
(`LICENSE-APACHE-2.0`, `NOTICE`, `CREDITS.md`); the per-file pass is mapped in
[`docs/license-compliance-plan.md`](../../docs/license-compliance-plan.md).

**Exit:** every derivative source file retains its upstream Adobe header plus a
React→Solid change note (generated icons via the generator); genuinely original
files stay MIT without an Adobe notice.
