---
id: 612
type: task
title: "Give a virtual click the virtual modality upstream gives it"
created: 2026-09-22
parent: 31
status: merged
history:
  - {
      state: open,
      at: 2026-09-22,
      note: 'opened from the review of #497''s commit `d997d01f`, which corrected the paint in the styled layer and named this as the cause. `packages/solidaria/src/interactions/createInteractionModality.ts:113-115` opens `handleClickEvent` with `if (!e.isTrusted) return;`, added by `61b7b7f4` with no comment. react-aria 3.52.0 `useFocusVisible.ts` has no such guard — read from the pinned source map, `node_modules/.pnpm/react-aria@3.52.0…/dist/private/interactions/useFocusVisible.js.map`: `function handleClickEvent(e) { if (!openLink.isOpening && isVirtualClick(e)) { hasEventBeforeFocus = true; currentModality = ''virtual''; currentPointerType = ''virtual''; } }`. Upstream checks `isTrusted` in `handleFocusEvent` and deliberately not in `handleWindowBlur`, so the placement is considered, not accidental. `isVirtualClick` is upstream''s inference for `detail === 0`, and its own comment says what that covers: `Keyboards, Assistive Technologies, and element.click() all produce a "virtual" click event`. So an AT click puts upstream in `virtual` modality and focus-visible, and leaves ours in `pointer`. That single difference is all of the #497 ComboBox miss: our `createOption` computes the same expression as `useOption` (`createOption.ts:242`, `isFocused && isFocusVisible()`), and under a keyboard open it reaches the same answer because `ListBox` mirrors the focused key onto the option with `moveVirtualFocus` (`packages/solidaria-components/src/ListBox.tsx:676`), whose synthetic focus event arms the option''s ring. Measured in jsdom on this tree: with the styled remap removed, a keyboard-opened option still carries `data-focus-visible`, while a pointer-opened one does not.',
    }
  - {
      state: open,
      at: 2026-09-22,
      note: "Implementation is in the working tree and is not committed. Proof 4 turned 22 picker-list rows red that run 35713265002 left green, and those rows are not fixed inside this ticket's write paths. Stopped there; nothing reverted. Upstream handleClickEvent, quoted from the pinned source map packages/react-aria/src/interactions/useFocusVisible.ts lines 105-111: function handleClickEvent(e: MouseEvent) { if (!(openLink as any).isOpening && isVirtualClick(e)) { hasEventBeforeFocus = true; currentModality = 'virtual'; currentPointerType = 'virtual'; } }. No isTrusted check, and no call to the change handlers. 61b7b7f4 added if (!e.isTrusted) return with no comment; that guard is real and is deleted. Our handler keeps the typed isOpening cast already used by handleKeyboardEvent in the same file. option-focus-visible.ts is deleted, both ComboBoxOption atoms and pickerOption spread the option render props, and pickerCheckmark drops the isFocused color override. The call still spreads render props into color: baseColor('accent'), matching S2 Menu.tsx checkmark. PROOF, cwd /home/emoporemilio/projects/viviana-hub/ui. vp run check exit 0. vp test run packages/solidaria --maxWorkers=2 exit 0 (169 files, 4244 passed, 6 skipped) after the FocusScope pin. Earlier, with the same product sources: vp test run packages/solidaria-components --maxWorkers=2 exit 0 (76 files, 2457 passed, 6 skipped); vp test run packages/solid-spectrum --maxWorkers=2 exit 0 (85 files, 1135 passed, 1 expected fail); vp test run packages/viviana-ui --maxWorkers=2 exit 0 (37 files, 232 passed). vp run guard:layer-boundary exit 0 (524 identical, 84 diverged, 0 new forks). Heavy lock taken and released around each heavy command. cd apps/comparison && VIVIANA_GATE=1 vp run build exit 0 (0/33 cache hit). PLAYWRIGHT_BROWSERS_PATH=/home/emoporemilio/.cache/ms-playwright vp exec playwright test e2e/certified/combobox.certified.spec.ts e2e/certified/picker.certified.spec.ts --workers=2 exit 1: certified summary 102 passed, 22 failed, 0 skipped, 2 waived. combobox-field D13 is 4 passed, including open-arrow-enter-reopen-scroll-escape. combobox-list and combobox-field and combobox-motion are all green. picker-trigger D13 open-arrow-enter-reopen-scroll-escape and keyboard-only are the two #584 waivers (raw failures match the waiver text; waiver file untouched). The 22 unwaived failures are all picker-list: D1 6, D3 6, D7 2, D9 6, D10 2. Representative D1: picker size-s dark default checkmarkSelected, React rgb(105, 149, 254) vs Solid rgb(86, 129, 255). Representative D7: span:Pro dark fg rgb(242, 242, 242) ratio 11.45 vs rgb(219, 219, 219) ratio 9.26. Representative D3: picker size-m dark default screenshot mismatch ratio 0.023917947860962567 (1145/47872, bounds left 36 top 68 right 235 bottom 107); shots at apps/comparison/test-results/certified-picker.certified-b7bcb-—-Picker-list-size-m-·-dark-chromium/attachments/. CAUSE. clickLocator fires pointerdown, pointerup, then element.click() (detail 0). createPress onPress opens the picker and focuses the selected option on pointerup, while modality is still pointer, so createFocusRing samples not-visible. The detail-0 click then sets virtual and, matching upstream, does not notify listeners, so the ring stays false. useOption.ts:182 is a live read, isFocused && selectionManager.isFocused && isFocusVisible(), so the React frame paints the focus stop. createOption.ts:242 ANDs the per-element ring instead. ComboBox list stays green because its virtual focus is applied after that click. createOption is outside the write paths and a stated non-goal, so it was not changed. Tests: ComboBox.test.tsx now expects data-focus-visible and the focus-stop atoms on a detail-0 click, and neither on pointerdown plus detail 1. createInteractionModality.test.ts adds the same two modality answers. createMenu.test.tsx pins pointer before the autoFocus paint test, because a prior detail-0 click leaves virtual and focusSafely defers. FocusScope.test.tsx useFocusManager beforeEach pins pointer; that file was not in the 11-file list, and the full solidaria suite failed those 8 tests until the pin (worker-global modality). The other nine focus-visible files kept their assertions; they passed. PreviewTrigger.test.tsx comment only: the dismiss click stays detail 0 so restored focus stays focus-visible. .changeset/virtual-click-modality.md names both patches. The pointer-modality paragraph #497 added to certification-debt.md is removed. Left in place, outside the write paths: .changeset/combobox-option-focus-visible.md still says a real mouse click takes the ring until #612, which this change makes false. vp fmt --check and vp lint on the write paths exit 0. docs:generate and docs:check were not run. Status stays open. merged is not claimed.",
    }
  - {
      state: open,
      at: 2026-09-22,
      note: "Addendum is in the working tree and is not committed. The 22 picker-list paint rows from the stop above are green. Two picker-list rows that run left green are now red. Stopped; nothing reverted; status stays open. createOption now matches useOption.ts:182: drop createFocusRing, read the global isFocusVisible, keep the shouldFocusOnHover gate, and return selectableItem.isFocused() && selectionManager.isFocused && isFocusVisible(). selectionManager.isFocused is the boolean getter, not a call. optionProps no longer merges focusProps. Link props stay inside createSelectableItem itemProps. currentModality is a synchronous let plus a module signal (ownedWrite). setCurrentModality writes both. readCurrentModality touches the signal then returns the let. handleClickEvent still does not call triggerChangeHandlers. createFocusRing seeds its flag with untrack(isGlobalFocusVisible) so a Button body read does not warn. Same-turn unit asserts see the let; tracked render memos see the flush. PROOF on this tree, cwd /home/emoporemilio/projects/viviana-hub/ui. vp run check exit 0 before the createFocusRing untrack (vp check --fix had only reformatted the previous stop note). After the untrack: vp test run packages/solidaria --maxWorkers=2 exit 0 (169 files, 4245 passed, 6 skipped); vp test run packages/solidaria-components --maxWorkers=2 exit 0 (76 files, 2457 passed, 6 skipped); vp test run packages/solid-spectrum --maxWorkers=2 exit 0 (85 files, 1135 passed, 1 expected fail); vp test run packages/viviana-ui --maxWorkers=2 exit 0 (37 files, 232 passed); vp run guard:layer-boundary exit 0 (524 identical, 84 diverged, 0 new forks). Heavy lock owner w-612 around cd apps/comparison && VIVIANA_GATE=1 vp run build exit 0 (0/33 cache hit, 91 pages), then released. Same lock around PLAYWRIGHT_BROWSERS_PATH=/home/emoporemilio/.cache/ms-playwright vp exec playwright test e2e/certified/combobox.certified.spec.ts e2e/certified/picker.certified.spec.ts --workers=2 exit 1 (5.4m). Certified summary 122 passed, 2 failed, 0 skipped, 2 waived, 0 flaky. combobox-field D13 is 4 passed, including open-arrow-enter-reopen-scroll-escape. combobox-list, combobox-motion, and picker-motion are green. picker-list D1 6, D3 6, D6 1, D7 2, D8 1, D9 6 are green, and D10 state-matrix size-m-rtl dark and light are the 2 passes. Unwaived red: picker-list D5 size-m arrow-roving, and picker-list D10 size-m-rtl arrow-roving. The (start) snapshot matches. From ArrowUp on, React active stays the dialog named Plan, tabindex -1. Solid active becomes the option (Pro after ArrowUp, then the roving option), tabindex 0. Context: apps/comparison/test-results/certified-picker.certified-bca40--list-size-m-·-arrow-roving-chromium/error-context.md and apps/comparison/test-results/certified-picker.certified-60dac-t-size-m-rtl-·-arrow-roving-chromium/error-context.md. picker-trigger D13 stays the two #584 waivers; waiver file untouched. Raw waiver diffs moved: open-arrow-enter step 0 now has Solid data-focus-visible true on the option where React has none, and keyboard-only still lacks the dialog focusin/focusout pair. CAUSE. SelectListBox tracked effect at packages/solidaria-components/src/Select.tsx:1202 reads getInteractionModality() and returns before focusSafely unless the modality is keyboard (popover open). That read now subscribes the effect to the modality signal. Arrow capture sets keyboard, the effect re-runs, and the microtask focusSafely moves document.activeElement onto the option. Before the signal the same read was a let, so the effect did not re-run on the modality flip and focus stayed on the dialog. createSelectableItem focus effect calls focusSafely, which reads getInteractionModality and now subscribes the same way. The paint that went green is the other path: option isFocusVisible is the live three-term read, and Select renderValues tracks it. Styled override stays deleted. Not edited, and now current when the signal flushes: ComboBox.tsx:1378 still re-derives isFocused() && isGlobalFocusVisible(), and its comment still calls that a non-reactive snapshot. Table.tsx:1970 reads isGlobalFocusVisible() in the row render. Followups, not fixed: createMenuItem.ts:346 samples createFocusRing and :424 returns isFocused() && that sample; useMenuItem.ts:394 is isFocused && selectionManager.isFocused && global isFocusVisible() && !isTriggerExpanded. createGridListItem and createGridCell do not call createFocusRing. createGridCell.ts:131 onFocus always setFocusedKey. useGridListItem.ts:323 and useGridCell.ts:321 skip setFocusedKey when global isFocusVisible() is true. fmt, lint, docs:generate, and docs:check were not re-run after this playwright. merged is not claimed.",
    }
  - {
      state: merged,
      at: 2026-09-22,
      note: "Supersedes the two open stops above. The isTrusted guard is gone, option-focus-visible.ts is deleted, and createOption matches useOption.ts:182 (selectionManager.isFocused is the boolean getter). handleClickEvent still does not call triggerChangeHandlers. The modality signal stays, and only isFocusVisible() reads it. getInteractionModality() returns the let currentModalityValue and does not touch the signal, so an effect that calls it does not re-run when modality flips. getPointerType() reads currentPointerType, a separate let, and never the modality signal. Select.tsx was not edited. The pin is in createInteractionModality.test.ts: a createTrackedEffect that reads getInteractionModality runs once across a keydown, and one that reads isFocusVisible re-runs. Audit of the global isFocusVisible, alias isGlobalFocusVisible, in packages/*/src. Render-time, tracked on purpose: createOption.ts optionIsFocusVisible and its data-focus-visible; ComboBox.tsx:1378 inside renderValues; Table.tsx:1970 data-focus-visible-within. Handler, not an effect body: createOption.ts:165 onHoverStart; createFocusVisibleListener in createInteractionModality.ts; createFocusRing.ts:84 onFocusChange. Initial value, already untracked: the createFocusVisible seed and createFocusRing.ts:55. Initial value, not an effect body, left alone because those files are outside the write paths: solid-spectrum DateField.tsx:372, TimeField.tsx:366, combobox/index.tsx:661, viviana-ui DateField.tsx:370, TimeField.tsx:364, combobox/index.tsx:674. No effect-body read of the global predicate sits outside the write paths. Imperative getInteractionModality reads, one-shot again with no edit: focus.ts:283 focusSafely; Select.tsx:1209; createSelectableItem.ts:321-345 through focusSafely; createTable.ts:635; createGridList.ts:427; createTree.ts:345; createCalendarCell.ts:240 inside the frame callback; createScrollIntoViewOnFocus.ts:66; createToastRegion.ts:122 and :189; createPreviewTrigger.ts:135 onHoverStart. PROOF, cwd the ui repo. vp run check exit 0. vp test run packages/solidaria --maxWorkers=2 exit 0 (169 files, 4246 passed, 6 skipped). vp test run packages/solidaria-components --maxWorkers=2 exit 0 (76 files, 2457 passed, 6 skipped). vp run guard:layer-boundary exit 0 (524 identical, 84 diverged, 0 new forks). Heavy lock w-612: cd apps/comparison && VIVIANA_GATE=1 vp run build exit 0 (0/33 cache hit, 91 pages), released. Same lock: PLAYWRIGHT_BROWSERS_PATH=/home/emoporemilio/.cache/ms-playwright vp exec playwright test e2e/certified/combobox.certified.spec.ts e2e/certified/picker.certified.spec.ts --workers=2. The runner exit is 1 because the two waived tests still fail; the certified summary is 124 passed, 0 failed, 0 skipped, 2 waived, 0 flaky. combobox-field D13 is 4 passed, including open-arrow-enter-reopen-scroll-escape. picker-list D5 size-m arrow-roving passed. picker-list D10 is 3 passed, including size-m-rtl arrow-roving. vp fmt --check and vp lint on the write paths exit 0. The two #584 waived rows raw diffs moved with this change: picker-trigger D13 open-arrow-enter step 0 now shows Solid data-focus-visible true on the option where React has none, and keyboard-only still lacks the dialog focusin/focusout pair. That is #584 evidence, not this ticket. Waiver file untouched. Followups, not fixed: createMenuItem.ts:346 samples createFocusRing and :424 returns isFocused() && that sample; useMenuItem.ts:394 is isFocused && selectionManager.isFocused && global isFocusVisible() && !isTriggerExpanded. createGridListItem and createGridCell do not call createFocusRing. createGridCell.ts:131 onFocus always setFocusedKey. useGridListItem.ts:323 and useGridCell.ts:321 skip setFocusedKey when global isFocusVisible() is true. ComboBox.tsx:1378 still re-derives isFocused() && isGlobalFocusVisible(), and the comment at 1366-1377 still calls that read a non-reactive snapshot.",
    }
  - state: merged
    at: 2026-09-22
    note: >-
      Follow-up w-612b on 3065bde5. The modality signal is a notification
      counter, createSignal(0, { equals: false, ownedWrite: true }) at
      createInteractionModality.ts:70. ownedWrite stays because a module DOM
      listener and setInteractionModality can write re-entrantly from an owned
      scope, and untrack does not exempt a write. currentModalityValue is the
      source of truth. writeModality sets the let. publishModality sets the let
      and bumps, including a second publish of the same word. pointermove and
      pointerup call writeModality only (createInteractionModality.ts:144-146).
      The counter bumps where upstream calls triggerChangeHandlers: keyboard
      (:131), pointerdown and mousedown (:140-143), virtual focus (:192),
      setInteractionModality (:359), plus handleClickEvent's virtual write
      (:157). That click still does not call triggerChangeHandlers. React
      re-renders after the click, so upstream useFocusVisible.ts:105-111 stays
      silent; Solid must notify tracked readers instead, which is why #612
      exists. isFocusVisible is the one tracked read (:85-87).
      getInteractionModality and getPointerType stay untracked.
      createFocusRing.ts:81 sets the flag from untrack(isGlobalFocusVisible)
      because the focus event can be dispatched from an effect body. The six
      seeds use untrack(isGlobalFocusVisible): solid-spectrum
      DateField.tsx:374, TimeField.tsx:368, combobox/index.tsx:663, viviana-ui
      DateField.tsx:372, TimeField.tsx:366, combobox/index.tsx:676.
      ComboBox.tsx:1366-1372 now says the option read is the live global
      modality, not a non-reactive snapshot. createListBox.test.tsx:1082
      restores pointer after the detail-0 click. The brief named
      packages/solidaria-components/test/ComboBox.test.tsx:598 for the
      pointer-first nit. That file has no such assertion. The assertion is
      packages/solid-spectrum/test/ComboBox.test.tsx:598, which now sets
      pointer and flushes before the detail-0 click, so that spectrum test is
      in the commit. createOption.ts:159-162 still passes only isDisabled to
      createHover. useOption.ts:155-156 passes isDisabled or not
      shouldFocusOnHover. Applying that here disables hover on ListBox, which
      leaves shouldFocusOnHover unset so the getter is false. Spectrum
      ListBoxOption adds a second useHover when shouldFocusOnHover is false,
      and that lives in ListBox.tsx, which this ticket does not touch. The
      getter was tried and reverted. Hydrate mechanism: hydrating
      createFocusVisible reads the module modality signal while
      setInteractionModality("pointer") is still an unflushed staged write
      (_value null, _pendingValue pointer), so Solid serve calls markLateLinker
      and sets REACTIVE_MISSED_WAKE (flag 4096) on the surrounding Show value
      memo even though the read is untracked and the memo's only dependency is
      condition; the memo re-runs and the later spans miss hydration key 32.
      The seed now reads the let (createInteractionModality.ts:449-451). The
      listener effect stays. Dropping it did not clear the miss, and the effect
      reserves the SSR child id so the span stays key 32. The hydrate test and
      the fixture were not edited. Review findings fixed: a bare move no longer
      publishes (createInteractionModality.ts:144-146); createFocusRing
      onFocusChange is untracked (createFocusRing.ts:81); hydration key 32
      passes because the seed reads the let (createInteractionModality.ts:449-451).
      Bisect, light filter "adopts focus-visible|adopts keyboard-focused", on
      the pre-fix file, then restored: seed createFocusVisible with false, key
      miss off (10:44, exit 0, 2 passed, 14 skipped); restore the
      untrack(isFocusVisible) seed, key miss on (10:44, exit 1); drop
      ownedWrite with the seed read kept, key miss on (10:45, exit 1); drop
      createFocusVisibleListener with the effect node kept and the seed read
      kept, key miss on (10:46, exit 1). PROOF, cwd the ui repo. 10:33 vp test
      run --config vitest.hydrate.config.ts
      packages/solidaria/test/hydrationHooks.hydrate.test.tsx --maxWorkers=2
      exit 1, 1 failed, 15 passed, Hydration key miss for 32 on the
      focus-visible case. 10:56 focused modality and focus-ring tests exit 0,
      2 files, 5 passed, 42 skipped. 10:56 the same hydrate filter exit 0, 2
      passed, 14 skipped, key miss off on the let seed. 10:57 vp fmt --check
      on the write paths exit 0. 10:57 vp lint on the write paths exit 0, 0
      warnings. 10:57 vp test run packages/solidaria --maxWorkers=2 exit 1,
      169 files, 3 failed, 4245 passed, 6 skipped, all three in
      ListBox.test.tsx hover (data-hovered null) from the tried getter; the
      getter was reverted and createOption.ts matches HEAD. 11:00 vp test run
      packages/solidaria --maxWorkers=2 exit 0, 169 files, 4248 passed, 6
      skipped (4254). 11:00 vp test run packages/solidaria-components
      --maxWorkers=2 exit 0, 76 files, 2457 passed, 6 skipped (2463). 11:00 vp
      test run packages/solid-spectrum --maxWorkers=2 exit 0, 85 files, 1135
      passed, 1 expected fail (1136). 11:00 vp test run packages/viviana-ui
      --maxWorkers=2 exit 0, 37 files, 232 passed. 11:00 vp run check exit 0,
      4467 files formatted, 3208 lint-clean, tsc --noEmit pass. 11:00 vp run
      guard:layer-boundary exit 0, 524 identical, 84 diverged, 0 new forks.
      Heavy lock owner w-612b, one command per hold. 11:04 vp run test:ssr
      exit 0, 35 files, 93 passed, 11.92s. 11:05 vp run test:hydrate exit 0,
      31 files, 107 passed, including hydrationHooks.hydrate.test.tsx 16
      passed, 13.51s. 11:05 cd apps/comparison && VIVIANA_GATE=1 vp run build
      exit 0, 0/33 cache hit, 91 pages. 11:07 from apps/comparison,
      PLAYWRIGHT_BROWSERS_PATH=/home/emoporemilio/.cache/ms-playwright
      VIVIANA_GATE=1 vp exec playwright test
      e2e/certified/combobox.certified.spec.ts
      e2e/certified/picker.certified.spec.ts
      e2e/certified/listbox.certified.spec.ts
      e2e/certified/tableview.certified.spec.ts --workers=2 --retries=0.
      Runner exit 1 because the two waived tests still fail. Certified summary
      131 passed, 0 failed, 1 skipped, 2 waived, 0 flaky, 5.6m, 134 tests.
      combobox-field D13 is 4 passed. picker-list D5 is 1 passed (size-m
      arrow-roving). picker-list D10 is 3 passed, including size-m-rtl.
      listbox D5 is 2 passed and D6 is 1 passed. tableview D6 is 4 passed and
      1 skipped (the sorted known divergence), 0 failed. The two raw failures
      are the #584 picker-trigger D13 rows: open-arrow-enter step 0 has Solid
      data-focus-visible true on the option where React has none, and
      keyboard-only step 1 lacks the dialog focusin/focusout pair. Waiver file
      untouched. Followups, not fixed: createMenuItem.ts:346 samples
      createFocusRing and :424 returns isFocused() && that sample;
      useMenuItem.ts:394 is isFocused && selectionManager.isFocused && global
      isFocusVisible() && !isTriggerExpanded. createGridListItem and
      createGridCell do not call createFocusRing. createGridCell.ts:131
      onFocus always setFocusedKey. useGridListItem.ts:323 and
      useGridCell.ts:321 skip setFocusedKey when global isFocusVisible() is
      true. createOption hover stays isDisabled only until ListBox grows
      Spectrum's second useHover for the shouldFocusOnHover false case, and
      then the getter can match useOption.ts:155-156.
  - state: merged
    at: 2026-09-22
    note: >-
      Follow-up w-612c on 60166e22. focusVisibleSnapshot is module-private
      (createInteractionModality.ts:331-333) and is not exported; index.ts is
      untouched. isFocusVisible is modalityEpoch() then focusVisibleSnapshot()
      (:339-342). The listener calls handler(focusVisibleSnapshot()) (:428).
      The createFocusVisible seed is isServer ? false : props.autoFocus ||
      focusVisibleSnapshot() (:449). equals: false is off the counter
      (:68-70). A counter that always increments never repeats a value, so
      the option was dead config. ownedWrite: true stays, with its sentence.
      createFocusRing seeds autoFocus || getInteractionModality() !== "pointer"
      (:57). onFocusChange still re-samples through untrack(isGlobalFocusVisible)
      (:86): useFocusRing.ts:57-61 re-samples isFocusVisible() in its own
      onFocusChange, pointermove writes the let without notifying, and the
      focus event can be dispatched from an effect body. The six styled seeds
      are getInteractionModality() !== "pointer": solid-spectrum
      DateField.tsx:373, TimeField.tsx:367, combobox/index.tsx:662, viviana-ui
      DateField.tsx:371, TimeField.tsx:365, combobox/index.tsx:675. SSR answer
      is unchanged. getInteractionModality() returns null on the server, so
      null !== "pointer" is true. The old isFocusVisible() read was the same
      let comparison, also true when the let is null. createFocusVisible still
      forces false through isServer. The ring accessor is isFocused() && flag
      and isFocused starts false, so the focus-ring span text stays false.
      The SSR writer is packages/solidaria/test/hydrationHooks.ssr.test.tsx
      (writeFileSync of output/hook-${kind}-ssr.html). output/ is gitignored
      (.gitignore:51). output/hook-focus-ring-ssr.html is
      <section _hk=0><span _hk=33 id="32" data-hook="focus-ring">false</span></section>
      before the seed fix (12:09, 81 bytes) and after it (12:21 cat). The
      focus-visible span, cat at 12:21, is
      <section _hk=0><span _hk=32 id="31" data-hook="focus-visible">false</span></section>.
      Red first, fixture and hydrate branch only, before createFocusRing.ts:55
      changed. 12:09 mkdir heavy.lock and echo w-612c exit 0, LOCK_OK, then
      vp run test:ssr exit 0, Test Files 35 passed (35), Tests 94 passed (94),
      Start at 12:09:28, Duration 12.28s, hydrationHooks.ssr.test.tsx 17 tests,
      then rm of that lock, LOCK_RELEASED. 12:09 vp test run --config
      vitest.hydrate.config.ts
      packages/solidaria/test/hydrationHooks.hydrate.test.tsx --maxWorkers=2
      exit 1. Test Files 1 failed (1). Tests 1 failed | 16 passed (17).
      Start at 12:09:59. Duration 1.91s. FAIL hook owner hydration parity >
      adopts focus-ring's following ID and retains its client behavior.
      Hydration key miss for "33": no server-rendered element carries this
      key (template: <span>), printed twice, thrown at hydrateOverSsr
      packages/solidaria/test-utils/hydrate.ts:337:34 from
      hydrationHooks.hydrate.test.tsx:416:25. git diff --stat was the two
      fixture files, 10 insertions. After the let seed, 12:12 the same
      hydrate command exit 0, Test Files 1 passed (1), Tests 17 passed (17),
      Start at 12:12:09, Duration 2.23s. 12:12 vp test run
      packages/solidaria/test/createFocusRing.test.tsx
      packages/solidaria/test/createInteractionModality.test.ts
      packages/solidaria/test/createListBox.test.tsx --maxWorkers=2 exit 0,
      Test Files 3 passed (3), Tests 119 passed (119), Start at 12:12:09,
      Duration 2.25s. The effect test also asserts the ring isFocused() true
      and isFocusVisible() true under the keyboard modality beforeEach pins.
      The detail-0 expects sit in try, and setInteractionModality("pointer")
      is only in finally. The same-word comment now says a same-word publish
      still bumps the counter. 12:12 vp test run
      packages/solid-spectrum/test/ComboBox.test.tsx --maxWorkers=2 -t
      "paints a synthetic detail-0" exit 0, Tests 1 passed | 32 skipped (33),
      Start at 12:12:09, Duration 9.07s. That test opens with a pointer click,
      asserts the selected option has no data-focus-visible, closes, then
      does the detail-0 click. 12:13 vp fmt --write then vp fmt --check on
      the 15 source, test, and changeset paths exit 0, all matched files use
      the correct format, 15 files. 12:13 vp lint on the 14 source and test
      paths exit 0, Found 0 warnings and 0 errors, 14 files, 98 rules.
      12:13 vp run check exit 0, All 4467 files are correctly formatted, no
      warnings or lint errors in 3208 files, tsc --noEmit pass, Duration
      39.13s. 12:13 vp test run packages/solidaria --maxWorkers=2 exit 0,
      Test Files 169 passed (169), Tests 4248 passed | 6 skipped (4254),
      Start at 12:13:30, Duration 59.22s. 12:14 vp run guard:layer-boundary
      exit 0, identical 524, diverged 84, new forks 0, unbaselined 0, PASS.
      12:14 vp test run packages/solid-spectrum --maxWorkers=2 exit 0,
      Test Files 85 passed (85), Tests 1135 passed | 1 expected fail (1136),
      Start at 12:14:58, Duration 57.58s. 12:14 vp test run packages/viviana-ui
      --maxWorkers=2 exit 0, Test Files 37 passed (37), Tests 232 passed (232),
      Start at 12:14:58, Duration 21.62s. 12:16 heavy lock owner w-612c, then
      vp run test:ssr exit 0, Test Files 35 passed (35), Tests 94 passed (94),
      Start at 12:16:35, Duration 11.02s, lock released. 12:16 heavy lock
      owner w-612c, then vp run test:hydrate exit 0, Test Files 31 passed
      (31), Tests 108 passed (108), Start at 12:16:56, Duration 12.78s,
      hydrationHooks.hydrate.test.tsx 17 tests. That lock was released at
      12:19, LOCK_RELEASED. .changeset/virtual-click-modality.md adds
      "@proyecto-viviana/ui": patch. The body is unchanged. Corrections to
      the 60166e22 entry, which is not rewritten. The second useHover that
      entry's dropped-item text cites is not in Spectrum's ListBox.tsx. It
      is react-spectrum/packages/react-aria-components/src/ListBox.tsx:552-557
      inside ListBoxItem (:538), and it is unconditional (isDisabled:
      !states.allowsSelection && !states.hasAction && !isDraggable), never
      keyed on shouldFocusOnHover. @react-spectrum/s2/src/ListBox.tsx has no
      useHover. createOption.ts:159 can pass isDisabled || !shouldFocusOnHover
      once packages/solidaria-components/src/ListBox.tsx grows RAC
      ListBoxItem's own createHover (it has none today; isHovered comes from
      optionAria.isHovered() at :1181 and :1292). The
      getInteractionModality/getPointerType audit omitted four sites, all
      read the lets, none a defect: packages/solidaria/src/dnd/utils.ts:128,
      packages/solidaria/src/selection/createSelectableCollection.ts:415 and
      :640, packages/solidaria/src/autocomplete/createAutocomplete.ts:444.
      The 60166e22 entry's lines "10:56 focused modality and focus-ring tests
      exit 0, 2 files, 5 passed, 42 skipped" and its hydrate filter line name
      no command. This entry's proof lines all name the command. Every
      changed read returns the same value it returned before (the let behind
      the counter), only what the read subscribes or marks changes. No
      certified run. 12:25 vp run docs:generate exit 0, generated
      .claude/current/roadmap.md and .claude/current/status.md, and git diff
      --stat on those two views was empty. 12:25 vp run docs:check exit 0,
      docs:check passed. Followup: createFocusVisible's seed isServer ? false
      (:449) has no upstream counterpart. useFocusVisible.ts:391-393 seeds
      autoFocus || isFocusVisible(), which is true on the server
      (currentModality starts null; isFocusVisible is currentModality !==
      'pointer' at :304-305). An undocumented pre-existing divergence,
      owner's call because changing it changes SSR markup. Followup: the
      predicate !== "pointer" is inlined at seven sites outside the module
      because the untracked predicate has no public name; an owner-steered
      export would fold them.
---

## Scope

Delete the `isTrusted` guard from `handleClickEvent` in
`packages/solidaria/src/interactions/createInteractionModality.ts:113-115`, so
a `detail: 0` click reaches `isVirtualClick` as it does upstream, then delete
the two styled call sites that exist only to compensate for it:

- `packages/solid-spectrum/src/utils/option-focus-visible.ts`, the whole file,
- its call in `packages/solid-spectrum/src/combobox/index.tsx` (`ComboBoxOption`,
  both atoms) and in `packages/solid-spectrum/src/picker/index.tsx`
  (`pickerOption`),
- `pickerCheckmark`'s `isFocused: baseColor("accent").isFocusVisible` override
  (`packages/solid-spectrum/src/picker/index.tsx:489`), which lifts the Picker
  checkmark by a second, non-S2 mechanism; upstream's `checkmark` reads the
  spread render props only.

The styled guard in `packages/solid-spectrum/test/ComboBox.test.tsx` ("paints a
pointer-focused option…" and "does not treat a pointer-opened selected option as
focus-visible") pins today's two answers and has to move with them: after this,
a synthetic click carries `data-focus-visible` and the paint follows it, while a
real mouse click carries neither.

Blast radius, measured on this tree today: `fireEvent.click` appears 220 times
across 51 test files in `packages/*`, and 11 of those files also assert
focus-visible or `data-focus-visible`. Every one of those synthetic clicks
currently leaves the modality at `pointer` and would move to `virtual`. The
guard sits in two published headless packages, so this is a behaviour change
for consumers and owes a changeset naming `@proyecto-viviana/solidaria`.

viviana-ui moves too, without a line changing in it: its `comboBoxCheckmark` is
plain `baseColor("accent")` (`packages/viviana-ui/src/combobox/index.tsx:543`),
so the register's checkmark sits at the default stop under today's pointer
modality and will lift to the focus stop once a synthetic click reads as
virtual. The register has no pair oracle to catch it; look at it by eye.

Non-goals: the per-element `createFocusRing()` in `createOption`, which is
faithful and already arms under virtual focus; any change to what the ComboBox
or Picker atoms declare.

## Done when

`handleClickEvent` matches react-aria 3.52.0 line for line, the three styled
compensations above are gone, and both the ComboBox and Picker certified list
shards stay green on a named run — the same
`e2e/certified/{combobox,picker}.certified.spec.ts` `list` cases #497 proved,
which pass today only because the styled remap stands in for this fix.

## Proof

The solidaria and solidaria-components suites, the solid-spectrum and viviana-ui
suites, `vp run guard:layer-boundary`, and the two certified list shards. Each
of the 11 focus-visible test files is read before it is re-run, since a
synthetic click changing modality is exactly what they assert around.

## Relationship

Child of #31, the headless spine. Cause of
[#497](./497-match-combobox-and-picker-list-selected-checkmark-accent.md), whose
styled correction is the debt this repays; the divergence it leaves standing is
the pointer-modality entry in `.claude/current/certification-debt.md`. The guard
arrived in `61b7b7f4` with the Picker/ComboBox open-menu alignment, so read that
commit before assuming it guarded nothing.
