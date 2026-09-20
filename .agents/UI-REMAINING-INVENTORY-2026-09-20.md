# UI remaining-board snapshot — 2026-09-20

Observed at `fd28239835394c6ac399c40924d2ca5c1e14fc05` plus the uncommitted
handoff/app slice. Generated from the repository's `collectDocs()` parser,
not a reclassification. Board problems: 0. Tasks: 191 open, 21 in-progress,
209 merged, 76 verified, 7 parked; no next/dropped tasks. The 428 unverified
tasks below are exhaustive at this checkpoint. Merged is not verified, and
parked is not admitted. Not all rows are new implementation or release blockers.

This dated receipt is not a live queue. Read the actual tickets before acting.
Execution order and exceptions remain [#87](../.claude/tickets/tasks/87-close-every-remaining-audit-item-in-order.md);
[#136](../.claude/tickets/initiatives/136-run-the-2026-09-full-repo-audit.md)
owns its separate audit program. #251/#257/#252/#256 are owner-held regardless
of their in-progress status; skip #254. Successor #245 remains unchanged.
Read [the handoff](UI-SESSION-HANDOFF-2026-09-20.md) before touching the dirty tree.

## Initiative coverage

- [#24](../.claude/tickets/initiatives/24-per-component-acceptance.md) Per-component acceptance — in-progress; 172 unverified direct tasks, 46 active.
- [#25](../.claude/tickets/initiatives/25-support-export-parity-with-react-s2.md) Support-export parity with React S2 — in-progress; 5 unverified direct tasks, 5 active.
- [#26](../.claude/tickets/initiatives/26-comparison-docs-site-rollout.md) Comparison docs-site rollout — in-progress; 17 unverified direct tasks, 10 active.
- [#27](../.claude/tickets/initiatives/27-native-vite-plus-package-builds.md) Native Vite Plus package builds — in-progress; 5 unverified direct tasks, 3 active.
- [#28](../.claude/tickets/initiatives/28-dev-only-admin-dashboard.md) Dev-only admin dashboard — verified; 0 unverified direct tasks, 0 active.
- [#29](../.claude/tickets/initiatives/29-test-kumo-as-a-standalone-styled-solid-library.md) Test Kumo as a standalone styled Solid library and share the experiment — in-progress; 5 unverified direct tasks, 4 active.
- [#30](../.claude/tickets/initiatives/30-promote-viviana-ui-releases.md) Promote @proyecto-viviana/ui releases — verified; 0 unverified direct tasks, 0 active.
- [#31](../.claude/tickets/initiatives/31-port-the-shared-headless-spine.md) Port the shared headless spine — in-progress; 31 unverified direct tasks, 26 active.
- [#32](../.claude/tickets/initiatives/32-ship-correctly-to-installed-consumers.md) Ship correctly to installed consumers — open; 9 unverified direct tasks, 6 active.
- [#33](../.claude/tickets/initiatives/33-prune-component-apis-to-the-upstream-surface.md) Prune component APIs to the upstream surface — open; 19 unverified direct tasks, 16 active.
- [#34](../.claude/tickets/initiatives/34-absorb-upstream-releases-and-hold-behavioral-parity.md) Absorb upstream releases and hold behavioral parity — in-progress; 17 unverified direct tasks, 5 active.
- [#35](../.claude/tickets/initiatives/35-per-file-apache-2-0-attribution-headers.md) Per-file Apache-2.0 attribution headers — verified; 0 unverified direct tasks, 0 active.
- [#136](../.claude/tickets/initiatives/136-run-the-2026-09-full-repo-audit.md) Run the 2026-09 full-repo audit — in-progress; 100 unverified direct tasks, 67 active.
- [#243](../.claude/tickets/initiatives/243-certify-interaction-journeys-d13.md) Certify interaction journeys (D13) — in-progress; 5 unverified direct tasks, 5 active.
- [#443](../.claude/tickets/initiatives/443-ship-the-2026-09-release-train.md) Ship the 2026-09 release train — in-progress; 10 unverified direct tasks, 1 active.
- [#526](../.claude/tickets/initiatives/526-test-geist-as-a-standalone-styled-solid-library.md) Test Geist as a standalone styled Solid library — in-progress; 3 unverified direct tasks, 1 active.
- [#531](../.claude/tickets/initiatives/531-solid-2-foundation-upgrade-vanguard.md) Solid 2.0 foundation upgrade vanguard — in-progress; 8 unverified direct tasks, 5 active.

## All unverified tasks by owning initiative

These groups cover the entire board, including tasks outside the short
foundation/audit summaries. Numeric sorting within a group is for lookup,
not permission or a new execution order. The live board owns dependencies.

### No parent

- [#2](../.claude/tickets/tasks/2-make-the-parity-gates-fail.md) Make the parity gates fail — merged.
- [#4](../.claude/tickets/tasks/4-delete-the-orphaned-agent-worktrees.md) Delete the orphaned agent worktrees — parked.
- [#5](../.claude/tickets/tasks/5-one-pnpm-version-and-settings-in-pnpm.md) One pnpm version, and settings in pnpm-workspace.yaml — open.
- [#7](../.claude/tickets/tasks/7-bind-release-to-certified-revision.md) Bind release to a fully certified revision — merged.
- [#8](../.claude/tickets/tasks/8-make-route-contrast-blocking.md) Make route-wide color contrast blocking — merged.
- [#9](../.claude/tickets/tasks/9-decide-tabswitch-segmentedcontrol-boundary.md) Decide the TabSwitch and SegmentedControl public boundary — merged.
- [#90](../.claude/tickets/tasks/90-define-response-security-header-contracts.md) Define response-security header contracts — open.
- [#103](../.claude/tickets/tasks/103-resolve-the-remaining-glasselated-mirror-gaps.md) Resolve the remaining Glasselated mirror gaps — open.
- [#133](../.claude/tickets/tasks/133-upgrade-github-actions-off-node-20.md) Upgrade GitHub Actions off the Node.js 20 runtime — open.
- [#442](../.claude/tickets/tasks/442-canonicalize-scheme-md-to-the-spec-pointer.md) Canonicalize SCHEME.md to the spec pointer — merged.
- [#491](../.claude/tickets/tasks/491-fold-tabswitch-into-segmentedcontrol-through-a-deprecated-wrapper.md) Fold TabSwitch into SegmentedControl through a deprecated wrapper — merged.
- [#509](../.claude/tickets/tasks/509-remove-tabswitch-in-the-following-breaking-release.md) Remove TabSwitch in the following breaking release — open.
- [#515](../.claude/tickets/tasks/515-give-pixelmeter-a-per-cell-heat-map.md) Give PixelMeter a per-cell heat map — open.
- [#516](../.claude/tickets/tasks/516-let-scenebackdrop-carry-a-scene-per-colour-scheme.md) Let SceneBackdrop carry a scene per colour scheme — open.
- [#517](../.claude/tickets/tasks/517-give-terminallog-a-wrap-mode.md) Give TerminalLog a wrap mode — open.
- [#518](../.claude/tickets/tasks/518-add-the-lede-and-18px-pixel-type-roles.md) Add the lede and 18px pixel type roles — open.
- [#519](../.claude/tickets/tasks/519-give-togglebutton-the-yellow-notice-channel.md) Give ToggleButton the yellow notice channel — open.
- [#520](../.claude/tickets/tasks/520-decide-the-names-minted-outside-the-terminal-glass-veto-pass.md) Decide the names minted outside the Terminal Glass veto pass — open.
- [#521](../.claude/tickets/tasks/521-restore-the-handoff-details-omitted-from-the-examples.md) Restore the handoff details omitted from the examples — open.
- [#538](../.claude/tickets/tasks/538-port-upstream-numberparser-and-numberformatter.md) Port upstream NumberParser and NumberFormatter into createNumberFieldState — merged.
- [#539](../.claude/tickets/tasks/539-purge-register-wording-and-unbacked-counts.md) Purge register wording and unbacked counts from the landing page and Button docs — merged.
- [#540](../.claude/tickets/tasks/540-repair-comparison-preview-chrome-and-dev-styles.md) Repair comparison preview chrome, canvas alignment, and dev-style persistence — merged.

### #24 Per-component acceptance

- [#3](../.claude/tickets/tasks/3-burn-down-the-ts-nocheck-surface.md) Burn down the ts-nocheck surface — open.
- [#49](../.claude/tickets/tasks/49-reenable-or-locally-justify-disabled-lint-rules.md) Re-enable or locally justify disabled lint rules — open.
- [#50](../.claude/tickets/tasks/50-complete-behavior-contract-specs.md) Complete behavior contract specs — open.
- [#75](../.claude/tickets/tasks/75-track-the-slider-thumb-one-lsb-raster-floor.md) Track the Slider thumb one-LSB raster floor — open.
- [#77](../.claude/tickets/tasks/77-track-the-form-side-label-raster-floor.md) Track the Form side-label raster floor — open.
- [#79](../.claude/tickets/tasks/79-build-a-live-announcement-transcript-oracle.md) Build a live-announcement transcript oracle — open.
- [#80](../.claude/tickets/tasks/80-prove-combobox-filter-announcements.md) Prove ComboBox filter announcements — open.
- [#85](../.claude/tickets/tasks/85-close-strict-modeled-control-gaps.md) Close strict modeled-control gaps — open.
- [#87](../.claude/tickets/tasks/87-close-every-remaining-audit-item-in-order.md) Close every remaining audit item in order — in-progress.
- [#89](../.claude/tickets/tasks/89-decide-tableview-native-table-boundary.md) Decide the TableView native-table boundary — merged.
- [#91](../.claude/tickets/tasks/91-resolve-remaining-package-test-skips.md) Resolve remaining package test skips — open.
- [#92](../.claude/tickets/tasks/92-prove-press-cleanup-browser-timing.md) Prove press-cleanup browser timing — open.
- [#93](../.claude/tickets/tasks/93-align-s2-rangeslider-disabled-state.md) Align the S2 RangeSlider disabled state — open.
- [#96](../.claude/tickets/tasks/96-remove-generated-detail-snapshot-coupling.md) Remove generated-detail snapshot coupling — open.
- [#104](../.claude/tickets/tasks/104-emit-the-meter-fallback-role-token.md) Emit the Meter fallback role token — merged.
- [#105](../.claude/tickets/tasks/105-remove-comparison-glyph-phase-waivers.md) Remove comparison glyph phase waivers — open.
- [#106](../.claude/tickets/tasks/106-compose-menu-with-the-shared-popover-surface.md) Compose Menu with the shared Popover surface — open.
- [#107](../.claude/tickets/tasks/107-certify-menu-selection-visuals.md) Certify Menu selection visuals — open.
- [#121](../.claude/tickets/tasks/121-add-switch-field-positioning-context.md) Add Switch field positioning context — open.
- [#124](../.claude/tickets/tasks/124-match-empty-textarea-height.md) Match empty TextArea height — open.
- [#131](../.claude/tickets/tasks/131-support-static-meter-labels-during-hydration.md) Support static Meter labels during hydration — open.
- [#134](../.claude/tickets/tasks/134-restore-listview-selection-after-hydration.md) Restore ListView selection after hydration — merged.
- [#135](../.claude/tickets/tasks/135-keep-direct-button-text-reactive-after-hydration.md) Keep direct Button text reactive after hydration — merged.
- [#264](../.claude/tickets/tasks/264-keep-the-picker-hidden-select-in-sync-with-the-selected-value.md) Keep the Picker hidden select in sync with the selected value — merged.
- [#265](../.claude/tickets/tasks/265-disable-the-picker-trigger-with-the-native-disabled-attribute.md) Disable the Picker trigger with the native disabled attribute — merged.
- [#266](../.claude/tickets/tasks/266-do-not-render-a-load-more-row-when-picker-loadingstate-is-loading.md) Do not render a Load more row when Picker loadingState is loading — merged.
- [#267](../.claude/tickets/tasks/267-contain-tab-inside-an-open-menu-overlay.md) Contain Tab inside an open Menu overlay — merged.
- [#268](../.claude/tickets/tasks/268-update-menu-overlay-placement-when-align-or-direction-changes.md) Update Menu overlay placement when align or direction changes — merged.
- [#269](../.claude/tickets/tasks/269-wrap-actionmenu-keyboard-focus-from-the-last-item.md) Wrap ActionMenu keyboard focus from the last item — merged.
- [#270](../.claude/tickets/tasks/270-open-the-combobox-menu-on-focus-when-menutrigger-is-focus.md) Open the ComboBox menu on focus when menuTrigger is focus — in-progress.
- [#271](../.claude/tickets/tasks/271-open-the-combobox-menu-on-arrowdown-when-menutrigger-is-manual.md) Open the ComboBox menu on ArrowDown when menuTrigger is manual — merged.
- [#272](../.claude/tickets/tasks/272-close-the-combobox-menu-on-enter-with-a-custom-value.md) Close the ComboBox menu on Enter with a custom value — merged.
- [#273](../.claude/tickets/tasks/273-set-the-native-required-attribute-on-combobox-when-validation-is-native.md) Set the native required attribute on ComboBox when validation is native — merged.
- [#274](../.claude/tickets/tasks/274-restore-focus-to-the-popover-trigger-after-dismiss.md) Restore focus to the Popover trigger after dismiss — merged.
- [#275](../.claude/tickets/tasks/275-position-a-standalone-popover-against-triggerref.md) Position a standalone Popover against triggerRef — merged.
- [#276](../.claude/tickets/tasks/276-widen-the-datepicker-calendar-popover-for-maxvisiblemonths-greater-than-1.md) Widen the DatePicker calendar popover for maxVisibleMonths greater than 1 — merged.
- [#277](../.claude/tickets/tasks/277-disable-datepicker-calendar-previous-next-when-the-next-page-is-outside-minmax.md) Disable DatePicker calendar previous/next when the next page is outside min/max — merged.
- [#278](../.claude/tickets/tasks/278-keep-datepicker-field-segments-in-the-locale-calendar-when-createcalendar-is-set.md) Keep DatePicker field segments in the locale calendar when createCalendar is set — merged.
- [#279](../.claude/tickets/tasks/279-keep-focus-on-the-datepicker-next-previous-button-and-update-the-grid-name-after-paging.md) Keep focus on the DatePicker next/previous button and update the grid name after paging — merged.
- [#280](../.claude/tickets/tasks/280-anchor-the-daterangepicker-popover-to-the-field-group.md) Anchor the DateRangePicker popover to the FieldGroup — merged.
- [#281](../.claude/tickets/tasks/281-size-the-rangecalendar-popover-with-cell-gap.md) Size the RangeCalendar popover with cell-gap — merged.
- [#282](../.claude/tickets/tasks/282-advance-daterangepicker-keyboard-focus-after-selecting-the-range-start.md) Advance DateRangePicker keyboard focus after selecting the range start — merged.
- [#283](../.claude/tickets/tasks/283-append-first-last-available-date-to-minmax-calendar-cell-names.md) Append First/Last available date to min/max calendar cell names — merged.
- [#284](../.claude/tickets/tasks/284-localize-the-popover-dismiss-button-from-the-overlays-catalog.md) Localize the Popover dismiss button from the overlays catalog — merged.
- [#285](../.claude/tickets/tasks/285-lay-out-daterangepicker-start-and-end-time-fields-in-a-row.md) Lay out DateRangePicker start and end time fields in a row — merged.
- [#286](../.claude/tickets/tasks/286-update-contextualhelp-overlay-placement-when-placement-or-shouldflip-changes.md) Update ContextualHelp overlay placement when placement or shouldFlip changes — merged.
- [#287](../.claude/tickets/tasks/287-omit-aria-haspopup-on-the-contextualhelp-trigger.md) Omit aria-haspopup on the ContextualHelp trigger to match S2 DialogTrigger — merged.
- [#290](../.claude/tickets/tasks/290-skip-a-disabled-selectbox-during-arrow-navigation.md) Skip a disabled SelectBox during arrow navigation — open.
- [#291](../.claude/tickets/tasks/291-keep-a-disabled-selectboxgroup-in-the-tab-order.md) Keep a disabled SelectBoxGroup in the tab order — open.
- [#292](../.claude/tickets/tasks/292-move-selectboxgroup-arrowright-only-to-the-next-column.md) Move SelectBoxGroup ArrowRight only to the next column — open.
- [#293](../.claude/tickets/tasks/293-give-the-dialog-footer-paddingtop-32-unless-it-is-empty.md) Give the Dialog footer paddingTop 32 unless it is empty — merged.
- [#294](../.claude/tickets/tasks/294-apply-the-dialogtrigger-overlay-id-to-the-modal-dialog.md) Apply the DialogTrigger overlay id to the modal Dialog — merged.
- [#295](../.claude/tickets/tasks/295-move-gridlist-focus-with-typeahead-letters.md) Move GridList focus with typeahead letters — merged.
- [#296](../.claude/tickets/tasks/296-toggle-gridlist-multiple-selection-without-a-modifier.md) Toggle GridList multiple selection without a modifier — merged.
- [#302](../.claude/tickets/tasks/302-move-tableview-cell-and-header-focus-with-arrows.md) Move TableView cell and header focus with arrows — merged.
- [#303](../.claude/tickets/tasks/303-apply-tableview-density-quiet-and-selectionmode-without-remount.md) Apply TableView density, quiet, and selectionMode without remount — merged.
- [#304](../.claude/tickets/tasks/304-honor-tableview-column-minwidth-and-maxwidth.md) Honor TableView Column minWidth and maxWidth — merged.
- [#305](../.claude/tickets/tasks/305-move-listview-intra-row-arrows-onto-checkbox-and-item-actions.md) Move ListView intra-row ArrowLeft and ArrowRight onto checkbox and item actions — merged.
- [#306](../.claude/tickets/tasks/306-land-tab-on-the-listview-grid-when-the-first-selected-row-is-disabled.md) Land Tab on the ListView grid when the first selected row is disabled — merged.
- [#307](../.claude/tickets/tasks/307-name-listview-checkboxes-and-rows-with-rac-labelledby.md) Name ListView checkboxes and rows with RAC labelledby — merged.
- [#308](../.claude/tickets/tasks/308-open-actionmenu-from-a-listview-item-on-pointer-press.md) Open ActionMenu from a ListView item on pointer press — merged.
- [#309](../.claude/tickets/tasks/309-keep-listview-actionbar-and-item-slots-reactive-after-live-control-changes.md) Keep ListView ActionBar and item slots reactive after live control changes — merged.
- [#310](../.claude/tickets/tasks/310-keep-tableview-rowheader-after-collection-updates.md) Keep TableView rowheader after collection updates — merged.
- [#311](../.claude/tickets/tasks/311-select-all-tableview-rows-with-ctrl-a.md) Select all TableView rows with Ctrl+A — merged.
- [#312](../.claude/tickets/tasks/312-move-tableview-focus-with-typeahead-letters.md) Move TableView focus with typeahead letters — merged.
- [#313](../.claude/tickets/tasks/313-keep-tableview-row-checkboxes-out-of-the-tab-order.md) Keep TableView row checkboxes out of the tab order — merged.
- [#314](../.claude/tickets/tasks/314-skip-a-disabled-tableview-row-on-arrowdown.md) Skip a disabled TableView row on ArrowDown — merged.
- [#315](../.claude/tickets/tasks/315-keep-virtualizer-windowing-when-a-focused-option-is-persisted-outside-the-viewport.md) Keep virtualizer windowing when a focused option is persisted outside the viewport — merged.
- [#316](../.claude/tickets/tasks/316-keep-focus-on-the-next-tag-after-remove.md) Keep focus on the next tag after remove — merged.
- [#317](../.claude/tickets/tasks/317-honor-taggroup-selectionbehavior-replace.md) Honor TagGroup selectionBehavior replace — merged.
- [#318](../.claude/tickets/tasks/318-tab-only-the-focused-tags-remove-button-then-exit.md) Tab only the focused tag's Remove button then exit — merged.
- [#319](../.claude/tickets/tasks/319-fire-taggroup-onaction-on-enter-not-on-selection-press.md) Fire TagGroup onAction on Enter, not on selection press — merged.
- [#320](../.claude/tickets/tasks/320-clear-taggroup-selection-on-escape.md) Clear TagGroup selection on Escape — merged.
- [#321](../.claude/tickets/tasks/321-select-all-taggroup-tags-with-ctrl-a.md) Select all TagGroup tags with Ctrl+A — merged.
- [#322](../.claude/tickets/tasks/322-apply-taggroup-live-allowsremoving-and-selectionmode-without-remount.md) Apply TagGroup live allowsRemoving and selectionMode without remount — merged.
- [#323](../.claude/tickets/tasks/323-show-a-keyboard-focus-ring-on-taggroup-tags.md) Show a keyboard focus ring on TagGroup tags — merged.
- [#324](../.claude/tickets/tasks/324-move-treeview-focus-with-typeahead-letters.md) Move TreeView focus with typeahead letters — merged.
- [#325](../.claude/tickets/tasks/325-keep-treeview-row-focus-after-collapse.md) Keep TreeView row focus after collapse — merged.
- [#326](../.claude/tickets/tasks/326-move-treeview-arrowright-onto-checkbox-and-item-actions.md) Move TreeView ArrowRight onto checkbox and item actions — merged.
- [#327](../.claude/tickets/tasks/327-tab-out-of-treeview-to-the-after-button.md) Tab out of TreeView to the After button — merged.
- [#328](../.claude/tickets/tasks/328-extend-treeview-selection-with-shift-arrow-and-shift-click.md) Extend TreeView selection with Shift+Arrow and Shift+click — merged.
- [#329](../.claude/tickets/tasks/329-open-actionmenu-from-a-treeview-item.md) Open ActionMenu from a TreeView item — open.
- [#330](../.claude/tickets/tasks/330-keep-treeview-actionbar-reactive-after-live-control-changes.md) Keep TreeView ActionBar reactive after live control changes — merged.
- [#331](../.claude/tickets/tasks/331-do-not-expand-treeview-siblings-on-asterisk.md) Do not expand TreeView siblings on * (match S2) — merged.
- [#332](../.claude/tickets/tasks/332-drag-all-selected-listbox-items-on-keyboard-pickup.md) Drag all selected ListBox items on keyboard pickup — merged.
- [#334](../.claude/tickets/tasks/334-keep-actionbar-scrollref-enter-on-the-200ms-translate.md) Keep ActionBar scrollRef enter on the 200ms translate — merged.
- [#335](../.claude/tickets/tasks/335-announce-actionbar-actions-only-when-scrollref-is-set.md) Announce ActionBar actions only when scrollRef is set — merged.
- [#337](../.claude/tickets/tasks/337-do-not-disable-a-standalone-href-card.md) Do not disable a standalone href Card (match S2) — merged.
- [#338](../.claude/tickets/tasks/338-switch-a-standalone-card-to-a-link-when-href-is-set-after-mount.md) Switch a standalone Card to a link when href is set after mount — merged.
- [#339](../.claude/tickets/tasks/339-apply-live-card-size-to-title-and-description-styles.md) Apply live Card size to title and description styles — merged.
- [#340](../.claude/tickets/tasks/340-pack-cardview-cards-with-s2-gridlayout-and-waterfalllayout.md) Pack CardView cards with S2 GridLayout and WaterfallLayout — merged.
- [#341](../.claude/tickets/tasks/341-honor-card-isdisabled-inside-cardview.md) Honor Card isDisabled inside CardView — merged.
- [#342](../.claude/tickets/tasks/342-select-the-focused-cardview-card-when-selectionstyle-is-highlight.md) Select the focused CardView card when selectionStyle is highlight — merged.
- [#343](../.claude/tickets/tasks/343-move-cardview-focus-with-two-dimensional-arrows.md) Move CardView focus with two-dimensional arrows — merged.
- [#344](../.claude/tickets/tasks/344-keep-cardview-actionbar-reactive-after-live-control-changes.md) Keep CardView ActionBar reactive after live control changes — merged.
- [#345](../.claude/tickets/tasks/345-swap-textarea-helptext-when-isinvalid-changes-after-mount.md) Swap TextArea HelpText when isInvalid changes after mount — merged.
- [#346](../.claude/tickets/tasks/346-map-numberfield-pageup-and-pagedown-to-one-step.md) Map NumberField PageUp and PageDown to one step — merged.
- [#347](../.claude/tickets/tasks/347-increment-a-focused-numberfield-from-the-mouse-wheel.md) Increment a focused NumberField from the mouse wheel — merged.
- [#348](../.claude/tickets/tasks/348-repeat-numberfield-stepper-presses-while-held.md) Repeat NumberField stepper presses while held — merged.
- [#349](../.claude/tickets/tasks/349-omit-numberfield-aria-required-when-validation-is-native.md) Omit NumberField aria-required when validation is native — merged.
- [#350](../.claude/tickets/tasks/350-announce-numberfield-value-changes.md) Announce NumberField value changes — merged.
- [#352](../.claude/tickets/tasks/352-open-contextualhelp-from-searchfield-on-press.md) Open ContextualHelp from SearchField on press — merged.
- [#353](../.claude/tickets/tasks/353-name-the-searchfield-contextualhelp-trigger-search-help.md) Name the SearchField ContextualHelp trigger Search Help — merged.
- [#354](../.claude/tickets/tasks/354-do-not-toggle-checkbox-on-enter.md) Do not toggle Checkbox on Enter — merged.
- [#355](../.claude/tickets/tasks/355-set-native-custom-validity-on-checkbox-when-isinvalid.md) Set native custom validity on Checkbox when isInvalid — merged.
- [#356](../.claude/tickets/tasks/356-resize-the-checkbox-checkmark-when-size-changes-after-mount.md) Resize the Checkbox checkmark when size changes after mount — merged.
- [#362](../.claude/tickets/tasks/362-set-native-custom-validity-on-timefield-when-isinvalid.md) Set native custom validity on TimeField when isInvalid — merged.
- [#363](../.claude/tickets/tasks/363-keep-timefield-contextualhelp-on-the-label-row.md) Keep TimeField ContextualHelp on the label row — open.
- [#364](../.claude/tickets/tasks/364-update-timefield-aria-valuetext-when-hourcycle-changes-after-mount.md) Update TimeField aria-valuetext when hourCycle changes after mount — open.
- [#365](../.claude/tickets/tasks/365-clear-timefield-when-the-controlled-value-is-emptied-after-mount.md) Clear TimeField when the controlled value is emptied after mount — open.
- [#366](../.claude/tickets/tasks/366-map-colorfield-pageup-and-pagedown-to-one-step.md) Map ColorField PageUp and PageDown to one step — merged.
- [#367](../.claude/tickets/tasks/367-increment-colorfield-when-scrolling-down.md) Increment ColorField when scrolling down — merged.
- [#368](../.claude/tickets/tasks/368-set-native-custom-validity-on-colorfield-when-isinvalid.md) Set native custom validity on ColorField when isInvalid — merged.
- [#369](../.claude/tickets/tasks/369-paint-the-colorfield-fieldgroup-hover-and-keyboard-focus-ring.md) Paint the ColorField FieldGroup hover and keyboard focus ring — open.
- [#370](../.claude/tickets/tasks/370-format-colorfield-hex-values-in-uppercase.md) Format ColorField hex values in uppercase — merged.
- [#371](../.claude/tickets/tasks/371-keep-switch-disabled-and-readonly-styles-reactive-after-mount.md) Keep Switch disabled and read-only styles reactive after mount — merged.
- [#372](../.claude/tickets/tasks/372-include-the-checkboxgroup-required-asterisk-in-the-accessible-name.md) Include the CheckboxGroup required asterisk in the accessible name — merged.
- [#373](../.claude/tickets/tasks/373-keep-checkboxgroup-aria-describedby-when-isinvalid-changes-live.md) Keep CheckboxGroup aria-describedby when isInvalid changes live — open.
- [#374](../.claude/tickets/tasks/374-increment-horizontal-slider-on-arrowup.md) Increment a horizontal Slider on ArrowUp — merged.
- [#375](../.claude/tickets/tasks/375-update-slider-fill-when-emphasized-or-disabled-changes-after-mount.md) Update Slider fill when emphasized or disabled changes after mount — open.
- [#377](../.claude/tickets/tasks/377-keep-radio-disabled-styles-reactive-after-mount.md) Keep Radio disabled styles reactive after mount — open.
- [#381](../.claude/tickets/tasks/381-do-not-set-aria-label-on-pending-actionbutton-string-children.md) Do not set aria-label on pending ActionButton string children — merged.
- [#382](../.claude/tickets/tasks/382-honor-form-validationbehavior-on-descendant-fields.md) Honor Form validationBehavior on descendant fields — open.
- [#383](../.claude/tickets/tasks/383-show-native-validation-helptext-after-a-blocked-form-submit.md) Show native validation HelpText after a blocked Form submit — merged.
- [#384](../.claude/tickets/tasks/384-apply-live-form-size-and-labelposition-to-the-form-grid.md) Apply live Form size and labelPosition to the form grid — open.
- [#385](../.claude/tickets/tasks/385-keep-href-on-a-disabled-linkbutton-span.md) Keep href on a disabled LinkButton span — open.
- [#389](../.claude/tickets/tasks/389-paint-the-disabled-segmentedcontrol-indicator-with-gray-25-not-graytext.md) Paint the disabled SegmentedControl indicator with gray-25, not GrayText — open.
- [#390](../.claude/tickets/tasks/390-apply-segmentedcontrol-pressscale-to-the-inner-content-not-the-radio.md) Apply SegmentedControl pressScale to the inner content, not the radio — open.
- [#391](../.claude/tickets/tasks/391-focus-colorarea-hidden-range-inputs-after-pointer-and-vertical-keys.md) Focus ColorArea's hidden range inputs after pointer and vertical keys — merged.
- [#392](../.claude/tickets/tasks/392-keep-hsl-hsb-hue-valuetext-at-the-upstream-fraction-digits.md) Keep HSL/HSB hue valuetext at the upstream fraction digits — merged.
- [#393](../.claude/tickets/tasks/393-keep-colorslider-range-input-mounted-across-value-changes.md) Keep ColorSlider's range input mounted across value changes — merged.
- [#394](../.claude/tickets/tasks/394-keep-colorslider-hue-360-at-end.md) Keep ColorSlider hue 360 at End — merged.
- [#396](../.claude/tickets/tasks/396-send-colorwheel-end-to-hue-0-like-s2.md) Send ColorWheel End to hue 0 like S2 — merged.
- [#400](../.claude/tickets/tasks/400-ease-the-indeterminate-progressbar-fill-with-s2-in-out.md) Ease the indeterminate ProgressBar fill with S2 in-out — merged.
- [#410](../.claude/tickets/tasks/410-keep-progresscircle-aria-label-reactive-after-mount.md) Keep ProgressCircle aria-label reactive after mount — merged.
- [#411](../.claude/tickets/tasks/411-move-colorswatchpicker-pagedown-and-pageup-like-s2.md) Move ColorSwatchPicker PageDown and PageUp like S2 — merged.
- [#412](../.claude/tickets/tasks/412-apply-live-colorswatchpicker-size-and-rounding-to-child-swatches.md) Apply live ColorSwatchPicker size and rounding to child swatches — merged.
- [#413](../.claude/tickets/tasks/413-keep-colorswatchpicker-aria-label-and-id-reactive-after-mount.md) Keep ColorSwatchPicker aria-label and id reactive after mount — merged.
- [#416](../.claude/tickets/tasks/416-keep-calendar-cell-focus-after-a-pointer-select.md) Keep calendar cell focus after a pointer select — merged.
- [#417](../.claude/tickets/tasks/417-disable-outside-month-calendar-cells.md) Disable outside-month calendar cells the way RAC does — merged.
- [#418](../.claude/tickets/tasks/418-keep-calendar-visiblemonths-reactive-after-mount.md) Keep calendar visibleMonths reactive after mount — merged.
- [#421](../.claude/tickets/tasks/421-size-the-tabspicker-trigger-to-the-selected-value.md) Size the TabsPicker trigger to the selected value — merged.
- [#422](../.claude/tickets/tasks/422-name-static-hidden-label-tabs-from-labelledby-ids.md) Name static hidden-label tabs from labelledby ids — merged.
- [#423](../.claude/tickets/tasks/423-extend-a-rangecalendar-drag-across-hovered-cells.md) Extend a RangeCalendar drag across hovered cells — merged.
- [#424](../.claude/tickets/tasks/424-show-rangecalendar-cell-day-numbers-from-the-formattable-calendar.md) Show RangeCalendar cell day numbers from the formattable calendar — open.
- [#425](../.claude/tickets/tasks/425-keep-an-in-progress-rangecalendar-range-when-keyboard-moving-between-cells.md) Keep an in-progress RangeCalendar range when keyboard-moving between cells — merged.
- [#430](../.claude/tickets/tasks/430-paint-disabled-breadcrumb-links-with-the-disabled-token.md) Paint disabled breadcrumb links with the disabled token — merged.
- [#431](../.claude/tickets/tasks/431-apply-live-skeleton-isloading-to-createicon-loading-styles.md) Apply live Skeleton isLoading to createIcon loading styles — open.
- [#432](../.claude/tickets/tasks/432-wrap-toast-show-all-in-text-so-the-label-participates-in-actionbutton-layout.md) Wrap Toast Show all in Text so the label participates in ActionButton layout — open.
- [#433](../.claude/tickets/tasks/433-render-the-s2-toast-list-as-an-ol-of-display-contents-li-like-rac-toastlist.md) Render the S2 Toast list as an ol of display-contents li like RAC ToastList — open.
- [#434](../.claude/tickets/tasks/434-focus-the-toast-on-show-all-and-the-region-on-collapse-like-s2.md) Focus the toast on Show all and the region on Collapse like S2 — open.
- [#435](../.claude/tickets/tasks/435-keep-toastregion-aria-label-live-after-the-region-mounts.md) Keep ToastRegion aria-label live after the region mounts — open.
- [#436](../.claude/tickets/tasks/436-match-react-aria-landmarkmanager-f6-capture-and-landmark-focus-target.md) Match React Aria LandmarkManager F6 capture and landmark focus target — open.
- [#437](../.claude/tickets/tasks/437-keep-menu-mounted-through-popover-exit-as-rac-does.md) Keep Menu mounted through popover exit as RAC MenuInner does — merged.
- [#438](../.claude/tickets/tasks/438-render-listbox-drop-indicators-in-rac-before-and-last-after-shape.md) Render ListBox drop indicators in RAC before-and-last-after shape — merged.
- [#439](../.claude/tickets/tasks/439-open-menutrigger-from-any-usepress-child.md) Open MenuTrigger from any usePress child as RAC PressResponder does — open.
- [#459](../.claude/tickets/tasks/459-mint-labelledby-when-a-slotted-label-mounts.md) Mint labelledby when a slotted Label mounts — merged.
- [#460](../.claude/tickets/tasks/460-wire-numberfield-native-validation-including-min-max-and-step.md) Wire NumberField native validation including min, max, and step — merged.
- [#461](../.claude/tickets/tasks/461-call-createformvalidation-from-createcombobox.md) Call createFormValidation from createComboBox — merged.
- [#462](../.claude/tickets/tasks/462-call-createformvalidation-at-the-top-of-createhiddenselect.md) Call createFormValidation at the top of createHiddenSelect — merged.
- [#463](../.claude/tickets/tasks/463-restore-controlled-fields-on-native-form-reset.md) Restore controlled fields on native form reset — merged.
- [#464](../.claude/tickets/tasks/464-return-searchfield-validation-errors-and-details.md) Return SearchField validationErrors and validationDetails — merged.
- [#465](../.claude/tickets/tasks/465-drop-native-required-when-form-validationbehavior-is-aria.md) Drop native required when Form validationBehavior is aria — merged.
- [#466](../.claude/tickets/tasks/466-focus-the-invalid-control-after-associated-form-submit.md) Focus the invalid control after associated-form requestSubmit — merged.
- [#467](../.claude/tickets/tasks/467-reset-controlled-fields-after-late-form-association.md) Reset controlled fields after late form association — merged.
- [#468](../.claude/tickets/tasks/468-reset-validation-state-after-late-form-association.md) Reset validation state after late form association — merged.
- [#469](../.claude/tickets/tasks/469-focus-the-first-invalid-radio-after-blocked-isinvalid-submit.md) Focus the first invalid radio after blocked isInvalid submit — merged.
- [#483](../.claude/tickets/tasks/483-stop-tab-order-escaping-to-body-after-the-panel.md) Stop tab order escaping to body after the tab panel — merged.
- [#484](../.claude/tickets/tasks/484-decide-and-honor-the-reduced-motion-budget-for-button.md) Decide and honor the reduced motion budget for Button — merged.
- [#486](../.claude/tickets/tasks/486-read-the-compound-pending-value-inside-an-owner.md) Read the compound pending value inside an owner — merged.
- [#488](../.claude/tickets/tasks/488-extend-the-reduced-motion-budget-past-the-button-family.md) Extend the reduced motion budget past the button family — open.
- [#490](../.claude/tickets/tasks/490-converge-tableview-on-the-upstream-virtualized-grid-structure.md) Converge TableView on the upstream virtualized grid structure — open.

### #25 Support-export parity with React S2

- [#84](../.claude/tickets/tasks/84-port-the-drag-and-drop-subsystem.md) Port the drag-and-drop subsystem — open.
- [#117](../.claude/tickets/tasks/117-port-previewtrigger.md) Port PreviewTrigger — in-progress.
- [#118](../.claude/tickets/tasks/118-port-tokenfield.md) Port TokenField — open.
- [#126](../.claude/tickets/tasks/126-port-s2-sidenav.md) Port S2 SideNav — open.
- [#127](../.claude/tickets/tasks/127-port-the-adobe-prose-macro-surface.md) Port the Adobe prose macro surface — open.

### #26 Comparison docs-site rollout

- [#21](../.claude/tickets/tasks/21-reject-scheme-relative-prop-table-links.md) Reject scheme-relative prop-table links — merged.
- [#45](../.claude/tickets/tasks/45-complete-launch-docs-coverage.md) Complete launch documentation coverage — open.
- [#88](../.claude/tickets/tasks/88-finish-the-comparison-docs-collection-pages.md) Finish the comparison docs collection pages — parked.
- [#263](../.claude/tickets/tasks/263-add-csp-to-the-comparison-worker.md) Add a Content-Security-Policy to the comparison worker — open.
- [#333](../.claude/tickets/tasks/333-follow-the-comparison-theme-in-the-react-actionbar-fixture.md) Follow the comparison theme in the React ActionBar fixture — open.
- [#336](../.claude/tickets/tasks/336-drive-actionbar-collection-mode-through-listview-renderactionbar.md) Drive ActionBar collection mode through ListView renderActionBar — open.
- [#379](../.claude/tickets/tasks/379-do-not-share-native-radio-name-across-comparison-radiogroup-panels.md) Do not share native radio name across comparison RadioGroup panels — open.
- [#380](../.claude/tickets/tasks/380-delay-the-comparison-button-pending-label-until-progress-is-visible.md) Delay the comparison Button pending label until progress is visible — open.
- [#387](../.claude/tickets/tasks/387-honor-useactiongroupitem-onpress-in-the-react-actiongroup-fixture.md) Honor useActionGroupItem onPress in the React ActionGroup fixture — open.
- [#395](../.claude/tickets/tasks/395-remount-the-solid-colorwheel-fixture-when-live-defaultvalue-changes.md) Remount the Solid ColorWheel fixture when live defaultValue changes — merged.
- [#414](../.claude/tickets/tasks/414-remount-the-solid-colorswatchpicker-fixture-when-live-defaultvalue-changes.md) Remount the Solid ColorSwatchPicker fixture when live defaultValue changes — merged.
- [#415](../.claude/tickets/tasks/415-stop-remounting-the-react-colorswatchpicker-fixture-on-controlled-value.md) Stop remounting the React ColorSwatchPicker fixture on controlled value — merged.
- [#419](../.claude/tickets/tasks/419-rebuild-the-solid-disclosure-fixture-header-when-withheaderaction-changes.md) Rebuild the Solid Disclosure fixture header when withHeaderAction changes — open.
- [#420](../.claude/tickets/tasks/420-keep-tabs-comparison-fixtures-live-after-mount.md) Keep Tabs comparison fixtures live after mount — open.
- [#426](../.claude/tickets/tasks/426-remount-the-solid-rangecalendar-fixture-when-live-focusedvalue-clears.md) Remount the Solid RangeCalendar fixture when live focusedValue clears — merged.
- [#429](../.claude/tickets/tasks/429-remeasure-react-breadcrumbs-overflow-after-url-remount.md) Remeasure React breadcrumbs overflow after URL remount — open.
- [#479](../.claude/tickets/tasks/479-refresh-api-reference-catalog-after-the-form-validation-barrels.md) Refresh the API reference catalog after the form-validation barrels — merged.

### #27 Native Vite Plus package builds

- [#47](../.claude/tickets/tasks/47-move-solid-spectrum-declarations-to-vite-plus.md) Move solid-spectrum declarations to Vite Plus packaging — parked.
- [#48](../.claude/tickets/tasks/48-move-the-remaining-packages-off-tsup.md) Move the remaining packages off tsup — merged.
- [#83](../.claude/tickets/tasks/83-make-local-gate-preconditions-deterministic.md) Make local gate preconditions deterministic — open.
- [#94](../.claude/tickets/tasks/94-track-dependency-compatibility-ceilings.md) Track dependency compatibility ceilings — open.
- [#95](../.claude/tickets/tasks/95-bound-vite-plus-test-discovery.md) Bound Vite Plus test discovery — open.

### #29 Test Kumo as a standalone styled Solid library and share the experiment

- [#37](../.claude/tickets/tasks/37-land-the-kumo-button-package-baseline.md) Land the experimental Kumo Button package as a releasable workspace sibling — in-progress.
- [#38](../.claude/tickets/tasks/38-mount-matched-kumo-button-fixtures.md) Mount matched React and Solid Kumo Button fixtures in the comparison app — merged.
- [#40](../.claude/tickets/tasks/40-deploy-the-kumo-aware-landing-page.md) Qualify and deploy the Kumo-aware Viviana UI landing page — open.
- [#41](../.claude/tickets/tasks/41-align-the-kumo-solidaria-proposal.md) Align the kumo-solidaria proposal with the Button pilot and repository boundary — open.
- [#42](../.claude/tickets/tasks/42-review-the-kumo-pilot.md) Review the Kumo Button evidence and decide whether the experiment continues — open.

### #31 Port the shared headless spine

- [#51](../.claude/tickets/tasks/51-port-submenu-state-into-create-menu-state.md) Port submenu state into createMenuState — open.
- [#52](../.claude/tickets/tasks/52-route-menu-through-the-shared-collection-spine.md) Route Menu through the shared collection spine — open.
- [#53](../.claude/tickets/tasks/53-route-listbox-through-the-shared-collection-spine.md) Route ListBox through the shared collection spine — open.
- [#54](../.claude/tickets/tasks/54-route-taggroup-through-the-shared-collection-spine.md) Route TagGroup through the shared collection spine — open.
- [#55](../.claude/tickets/tasks/55-route-combobox-navigation-through-the-shared-spine.md) Route ComboBox navigation through the shared spine — open.
- [#56](../.claude/tickets/tasks/56-complete-describedby-slot-migration.md) Complete the aria-describedby slot migration — in-progress.
- [#57](../.claude/tickets/tasks/57-move-group-help-text-to-rac-slots.md) Move group help text to RAC slots — open.
- [#58](../.claude/tickets/tasks/58-remove-hybrid-rac-field-help-text-props.md) Remove hybrid RAC field help-text props — open.
- [#74](../.claude/tickets/tasks/74-restore-native-slider-input-semantics.md) Restore native Slider input semantics — open.
- [#76](../.claude/tickets/tasks/76-collapse-rangeslider-onto-the-slider-spine.md) Collapse RangeSlider onto the Slider spine — open.
- [#97](../.claude/tickets/tasks/97-document-the-selectable-item-link-model-adaptation.md) Document the selectable-item link-model adaptation — open.
- [#98](../.claude/tickets/tasks/98-localize-steplist-state-prefix-names.md) Localize StepList state-prefix names — open.
- [#99](../.claude/tickets/tasks/99-port-steplist-container-key-navigation.md) Port StepList container key navigation — open.
- [#100](../.claude/tickets/tasks/100-wire-virtual-focus-into-selectable-collections.md) Wire virtual focus into selectable collections — open.
- [#101](../.claude/tickets/tasks/101-prove-selection-behavior-state-transitions.md) Prove selection-behavior state transitions — open.
- [#109](../.claude/tickets/tasks/109-align-filetrigger-and-dropzone-focus-behavior.md) Align FileTrigger and DropZone focus behavior — open.
- [#110](../.claude/tickets/tasks/110-floor-table-width-before-column-sizing.md) Floor Table width before column sizing — open.
- [#111](../.claude/tickets/tasks/111-gate-virtual-pointer-detection-on-android.md) Gate virtual pointer detection on Android — merged.
- [#112](../.claude/tickets/tasks/112-end-table-resize-through-the-move-lifecycle.md) End Table resize through the move lifecycle — open.
- [#113](../.claude/tickets/tasks/113-provide-the-dialog-overlay-id-to-popover.md) Provide the Dialog overlay id to Popover — open.
- [#114](../.claude/tickets/tasks/114-observe-only-visible-virtualizer-item-sizes.md) Observe only visible Virtualizer item sizes — in-progress.
- [#116](../.claude/tickets/tasks/116-provide-tree-default-checkbox-context.md) Provide Tree default Checkbox context — open.
- [#119](../.claude/tickets/tasks/119-prove-firefox-date-segment-selection-focus.md) Prove Firefox date-segment selection focus — open.
- [#120](../.claude/tickets/tasks/120-align-platform-and-user-agent-detection.md) Align platform and user-agent detection — open.
- [#123](../.claude/tickets/tasks/123-listen-for-global-scroll-across-shadow-roots.md) Listen for global scroll across shadow roots — open.
- [#128](../.claude/tickets/tasks/128-bind-typeahead-space-in-the-capture-phase.md) Bind typeahead Space in the capture phase — open.
- [#129](../.claude/tickets/tasks/129-port-layout-delegate-page-navigation.md) Port layout-delegate page navigation — open.
- [#494](../.claude/tickets/tasks/494-disconnect-collection-intersection-observers-on-cleanup.md) Disconnect collection IntersectionObservers on cleanup — merged.
- [#495](../.claude/tickets/tasks/495-keep-popover-icon-and-hidden-select-reads-reactive.md) Keep popover, Icon, and hidden-select reads reactive — merged.
- [#496](../.claude/tickets/tasks/496-guard-styled-mergeprops-against-the-solid-js-last-wins-merge.md) Guard styled mergeProps against the solid-js last-wins merge — merged.
- [#510](../.claude/tickets/tasks/510-type-styled-mergeprops-after-the-flags-split.md) Type styled mergeProps after the flags split — merged.

### #32 Ship correctly to installed consumers

- [#1](../.claude/tickets/tasks/1-reconcile-viviana-ui-and-solid-spectrum.md) Govern the solid-spectrum to viviana-ui derivative boundary — open.
- [#6](../.claude/tickets/tasks/6-publish-consumer-compatibility-and-migration-matrix.md) Publish the UI consumer compatibility and migration matrix — parked.
- [#44](../.claude/tickets/tasks/44-fix-tree-multi-root-production-hydration.md) Fix styled collection production hydration — open.
- [#60](../.claude/tickets/tasks/60-add-missing-viviana-ui-subpath-exports.md) Add missing viviana-ui subpath exports — open.
- [#61](../.claude/tickets/tasks/61-route-native-buttons-through-an-unstyled-passthrough.md) Route native buttons through an unstyled passthrough — open.
- [#102](../.claude/tickets/tasks/102-render-collection-slot-styles-on-the-server.md) Render collection slot styles on the server — open.
- [#440](../.claude/tickets/tasks/440-remap-viviana-ui-negative-ink-to-red-1000.md) Remap viviana-ui negative ink to red-1000 against the panel — merged.
- [#485](../.claude/tickets/tasks/485-narrow-the-provider-import-off-the-solidaria-root-barrel.md) Narrow the provider import off the solidaria root barrel — merged.
- [#487](../.claude/tickets/tasks/487-narrow-the-solidaria-components-root-barrel-imports.md) Narrow the solidaria-components root-barrel imports — open.

### #33 Prune component APIs to the upstream surface

- [#43](../.claude/tickets/tasks/43-support-picker-static-children-and-sections.md) Support Picker static children and sections — open.
- [#63](../.claude/tickets/tasks/63-port-tag-remove-button-press-scale.md) Port Tag remove-button press scale — open.
- [#64](../.claude/tickets/tasks/64-realign-tooltip-arrow-positioning-with-overlayarrow.md) Realign Tooltip arrow positioning with OverlayArrow — open.
- [#65](../.claude/tickets/tasks/65-port-treeview-windowing-to-the-s2-virtualizer.md) Port TreeView windowing to the S2 Virtualizer — open.
- [#66](../.claude/tickets/tasks/66-port-listview-windowing-to-the-s2-virtualizer.md) Port ListView windowing to the S2 Virtualizer — open.
- [#67](../.claude/tickets/tasks/67-track-upstream-tooltip-arrow-accessibility.md) Track upstream Tooltip arrow accessibility — open.
- [#68](../.claude/tickets/tasks/68-drive-popover-enter-and-exit-motion.md) Drive Popover enter and exit motion — open.
- [#69](../.claude/tickets/tasks/69-delegate-contextualhelp-popovers-to-one-component.md) Delegate ContextualHelp popovers to one component — open.
- [#70](../.claude/tickets/tasks/70-extract-the-faithful-s2-field-composite.md) Extract the faithful S2 field composite — open.
- [#71](../.claude/tickets/tasks/71-forward-switch-field-and-input-refs.md) Forward Switch field and input refs — open.
- [#72](../.claude/tickets/tasks/72-generate-workflow-icons-from-shipped-paths.md) Generate workflow icons from shipped paths — merged.
- [#73](../.claude/tickets/tasks/73-localize-numberfield-role-and-stepper-labels.md) Localize NumberField role and stepper labels — open.
- [#115](../.claude/tickets/tasks/115-align-the-multiple-combobox-value-contract.md) Align the multiple ComboBox value contract — open.
- [#125](../.claude/tickets/tasks/125-align-select-selection-mode-generics.md) Align Select selection-mode generics — open.
- [#221](../.claude/tickets/tasks/221-make-the-solid-spectrum-barrel-equal-s2-s-exports-and-relocate-the-extras.md) Make the solid-spectrum barrel equal S2's exports and relocate the extras — open.
- [#222](../.claude/tickets/tasks/222-move-menubutton-out-of-solid-spectrum-and-solidaria-components.md) Move MenuButton out of solid-spectrum and solidaria-components — merged.
- [#223](../.claude/tickets/tasks/223-remove-viviana-native-names-from-the-proyecto-viviana-ui-barrel-until-62-reopens-the-surface.md) Remove viviana-native names from the @proyecto-viviana/ui barrel until #62 reopens the surface — open.
- [#224](../.claude/tickets/tasks/224-make-upstream-item-names-canonical-and-deprecate-listboxoption-and-comboboxoption.md) Make upstream item names canonical and deprecate ListBoxOption and ComboBoxOption — merged.
- [#227](../.claude/tickets/tasks/227-generate-the-styled-per-file-subpaths-from-s2-s-exports-directory.md) Generate the styled per-file subpaths from S2's exports directory — open.

### #34 Absorb upstream releases and hold behavioral parity

- [#86](../.claude/tickets/tasks/86-wire-autocomplete-into-the-shared-collection-spine.md) Wire autocomplete into the shared collection spine — open; blocked.
- [#220](../.claude/tickets/tasks/220-absorb-the-2026-09-upstream-train.md) Absorb the 2026-09 upstream train — in-progress.
- [#228](../.claude/tickets/tasks/228-port-navigationtree.md) Port NavigationTree — open.
- [#229](../.claude/tickets/tasks/229-port-menu-async-loading-and-empty-state.md) Port Menu async loading and empty state — in-progress.
- [#230](../.claude/tickets/tasks/230-keep-tabs-arrowleft-and-arrowright-consistent-in-rtl-vertical-orientation.md) Keep Tabs ArrowLeft and ArrowRight consistent in RTL vertical orientation — merged.
- [#231](../.claude/tickets/tasks/231-keep-interaction-modality-on-window-refocus.md) Keep interaction modality on window refocus — merged.
- [#232](../.claude/tickets/tasks/232-hide-dialogtrigger-when-nested-inside-tabs.md) Hide DialogTrigger when nested inside Tabs — merged.
- [#233](../.claude/tickets/tasks/233-support-select-and-combobox-inside-a-dialog.md) Support Select and ComboBox inside a Dialog — merged.
- [#234](../.claude/tickets/tasks/234-position-overlays-with-visualviewport-pagetop-on-ios-26.md) Position overlays with visualViewport pageTop on iOS 26 — merged.
- [#235](../.claude/tickets/tasks/235-guard-focusscope-restore-against-a-null-first-in-scope-target.md) Guard FocusScope restore against a null first-in-scope target — merged.
- [#236](../.claude/tickets/tasks/236-allow-calendar-selection-outside-the-visible-range-when-isdateunavailable-is-set.md) Allow Calendar selection outside the visible range when isDateUnavailable is set — merged.
- [#237](../.claude/tickets/tasks/237-commit-colorfield-on-enter.md) Commit ColorField on Enter — merged.
- [#238](../.claude/tickets/tasks/238-select-the-autofocused-item-when-selectonfocus-is-enabled.md) Select the autofocused item when selectOnFocus is enabled — merged.
- [#239](../.claude/tickets/tasks/239-insert-at-the-end-when-dropping-past-the-last-table-row.md) Insert at the end when dropping past the last Table row — merged.
- [#240](../.claude/tickets/tasks/240-absorb-s2-1-7-0-spectrum-tokens-and-icon-1lh-sizing.md) Absorb S2 1.7.0 spectrum-tokens 14.15.0 and icon 1lh sizing — in-progress.
- [#241](../.claude/tickets/tasks/241-handle-shadow-dom-focus-events-in-preventfocus-and-rangecalendar.md) Handle shadow-DOM focus events in preventFocus and RangeCalendar — merged.
- [#242](../.claude/tickets/tasks/242-improve-usepreventscroll-setstyle-and-focus-handling.md) Improve usePreventScroll setStyle and focus handling — merged.

### #136 Run the 2026-09 full-repo audit

- [#137](../.claude/tickets/tasks/137-keep-the-admin-dashboard-out-of-the-production-asset-graph.md) Keep the admin dashboard out of the production asset graph — open.
- [#138](../.claude/tickets/tasks/138-pin-the-release-job-npm-install-to-an-exact-version.md) Pin the Release job npm install to an exact version — open.
- [#139](../.claude/tickets/tasks/139-refuse-pack-script-rmsync-outside-a-temp-directory-prefix.md) Refuse pack-script rmSync outside a temp directory prefix — open.
- [#141](../.claude/tickets/tasks/141-remove-comparison-spectrum-class-names-from-published-dialogs.md) Remove comparison-spectrum class names from published Dialogs — open.
- [#142](../.claude/tickets/tasks/142-remove-the-leftover-overlay-primitive-from-the-s2-styled-layer.md) Remove the leftover Overlay primitive from the S2 styled layer — open.
- [#144](../.claude/tickets/tasks/144-gate-rule-4-behavior-ownership-instead-of-inventorying-imports.md) Gate Rule 4 behavior ownership instead of inventorying imports — open.
- [#146](../.claude/tickets/tasks/146-run-packed-consumer-smoke-over-every-public-package-in-ci.md) Run packed-consumer smoke over every public package in CI — open.
- [#147](../.claude/tickets/tasks/147-coherence-check-package-export-targets.md) Coherence-check package export targets — open.
- [#149](../.claude/tickets/tasks/149-treat-export-map-edits-as-publish-drift.md) Treat export-map edits as publish drift — open.
- [#150](../.claude/tickets/tasks/150-publish-dist-only-tarballs-for-styled-packages.md) Publish dist-only tarballs for styled packages — open.
- [#151](../.claude/tickets/tasks/151-make-docs-check-reject-stale-packaging-and-work-state-claims.md) Make docs check reject stale packaging and work-state claims — open.
- [#153](../.claude/tickets/tasks/153-ratchet-the-ts-nocheck-allowlist-after-each-removal.md) Ratchet the ts-nocheck allowlist after each removal — open.
- [#154](../.claude/tickets/tasks/154-match-upstream-collection-children-types-on-select-listbox-gridlist-taglist.md) Match upstream collection children types on Select ListBox GridList TagList — open.
- [#155](../.claude/tickets/tasks/155-include-package-tests-in-the-typecheck-gate.md) Include package tests in the typecheck gate — open.
- [#157](../.claude/tickets/tasks/157-type-breadcrumbs-collapsed-collection-children-without-as-any.md) Type Breadcrumbs collapsed collection children without as-any — open.
- [#158](../.claude/tickets/tasks/158-type-steplist-items-without-an-any-index-signature.md) Type StepList items without an any index signature — open.
- [#159](../.claude/tickets/tasks/159-call-solid-eventhandlerunion-without-unknown-double-casts.md) Call Solid EventHandlerUnion without unknown double casts — open.
- [#161](../.claude/tickets/tasks/161-gate-certified-suite-skipped-counts-against-registered-divergences.md) Gate certified-suite skipped counts against registered divergences — open.
- [#162](../.claude/tickets/tasks/162-certify-d12-for-collection-and-label-composites.md) Certify D12 for collection and label composites — open.
- [#163](../.claude/tickets/tasks/163-cover-exported-modules-that-have-no-owning-layer-suite.md) Cover exported modules that have no owning-layer suite — open.
- [#164](../.claude/tickets/tasks/164-ssr-test-createdisclosure-through-rendertostring.md) SSR-test createDisclosure through renderToString — open.
- [#165](../.claude/tickets/tasks/165-do-not-silently-skip-playground-axe-without-run-axe.md) Do not silently skip playground axe without RUN_AXE — open.
- [#166](../.claude/tickets/tasks/166-fail-comparison-overlay-tests-if-the-solid-portal-never-opens.md) Fail comparison overlay tests if the Solid portal never opens — open.
- [#168](../.claude/tickets/tasks/168-keep-remaining-styled-children-reactive-after-hydration.md) Keep remaining styled children reactive after hydration — open.
- [#169](../.claude/tickets/tasks/169-render-selectbox-slot-styles-at-render-and-keep-item-children-reactive.md) Render SelectBox slot styles at render and keep item children reactive — open.
- [#170](../.claude/tickets/tasks/170-iterate-static-breadcrumb-children-without-children-snapshots.md) Iterate static Breadcrumb children without children snapshots — open.
- [#171](../.claude/tickets/tasks/171-use-eventpathcontains-for-remaining-solid-press-timing-ownership-checks.md) Use eventPathContains for remaining Solid press-timing ownership checks — open.
- [#172](../.claude/tickets/tasks/172-drive-both-styled-table-select-all-checkboxes-from-isselectall.md) Drive both styled Table select-all checkboxes from isSelectAll — open.
- [#173](../.claude/tickets/tasks/173-stop-restating-matte-field-chrome-after-control-spreads.md) Stop restating matte field chrome after control spreads — open.
- [#174](../.claude/tickets/tasks/174-deduplicate-unavailablemenuitemtrigger-children-handling.md) Deduplicate UnavailableMenuItemTrigger children handling — open.
- [#175](../.claude/tickets/tasks/175-split-solidaria-components-colortsx-to-match-upstream-files.md) Split solidaria-components Color.tsx to match upstream files — open.
- [#176](../.claude/tickets/tasks/176-add-validation-notes-for-the-nine-catalogue-components-that-still-have-none.md) Add validation notes for the nine catalogue components that still have none — open.
- [#178](../.claude/tickets/tasks/178-keep-keyboard-heavy-notes-partial-until-they-cite-d5-and-d6.md) Keep keyboard-heavy notes partial until they cite D5 and D6 — open.
- [#179](../.claude/tickets/tasks/179-add-d10-rtl-walks-for-menu-tabs-treeview-and-other-keyboard-heavy-composites.md) Add D10 RTL walks for Menu Tabs TreeView and other keyboard-heavy composites — open.
- [#180](../.claude/tickets/tasks/180-extend-d6-announcement-triggers-past-datefield-and-timefield.md) Extend D6 announcement triggers past DateField and TimeField — open.
- [#181](../.claude/tickets/tasks/181-scan-docs-showcase-and-api-reference-routes-with-full-wcag-22-aa-axe.md) Scan docs showcase and API-reference routes with full WCAG 2.2 AA axe — open.
- [#186](../.claude/tickets/tasks/186-apply-iconcontext-styles-reactively-in-createicon.md) Apply IconContext styles reactively in createIcon — open.
- [#187](../.claude/tickets/tasks/187-complete-button-hydration-evidence-in-both-public-packages.md) Complete Button hydration evidence in both public packages — open.
- [#188](../.claude/tickets/tasks/188-port-useisssr-through-hydration-for-disclosure-hidden-and-default-locale.md) Port useIsSSR through hydration for disclosure hidden and default locale — open.
- [#189](../.claude/tickets/tasks/189-ssr-date-and-calendar-fields-instead-of-aria-hidden-placeholders.md) SSR date and calendar fields instead of aria-hidden placeholders — merged.
- [#190](../.claude/tickets/tasks/190-gate-tooltip-overlaycontainer-focusscope-and-actionbar-like-popover.md) Gate Tooltip OverlayContainer FocusScope and ActionBar like Popover — open.
- [#192](../.claude/tickets/tasks/192-document-and-gate-the-children-snapshot-class.md) Document and gate the children snapshot class — merged.
- [#193](../.claude/tickets/tasks/193-replace-export-floor-and-did-not-throw-tautologies-with-behavior-contracts.md) Replace export-floor and did-not-throw tautologies with behavior contracts — open.
- [#194](../.claude/tickets/tasks/194-ratchet-certified-skipped-counts-and-the-strict-baseline-and-pin-the-certified-record-to-head.md) Ratchet certified skipped counts and the strict baseline and pin the certified record to HEAD — in-progress.
- [#195](../.claude/tickets/tasks/195-make-comparison-test-pair-run-certified-d3-not-the-six-slug-thresholded-floor.md) Make comparison test pair run certified D3 not the six-slug thresholded floor — parked.
- [#196](../.claude/tickets/tasks/196-put-consumed-prop-pair-assertions-on-the-contract-gate.md) Put consumed-prop pair assertions on the contract gate — parked.
- [#197](../.claude/tickets/tasks/197-photograph-actionbutton-hover-and-pressed-live-and-scope-checkcontrol-to-the-form.md) Photograph ActionButton hover and pressed live and scope checkControl to the form — open.
- [#198](../.claude/tickets/tasks/198-port-the-full-s2-intl-catalog-and-route-styled-strings-through-it.md) Port the full S2 intl catalog and route styled strings through it — merged.
- [#199](../.claude/tickets/tasks/199-port-rac-intlmessages-into-solidaria-components-and-format-selectvalue-with-the-provider-locale.md) Port RAC intlMessages into solidaria-components and format SelectValue with the provider locale — merged.
- [#200](../.claude/tickets/tasks/200-port-remaining-react-aria-intl-catalogs-for-search-table-and-tag.md) Port remaining react-aria intl catalogs for search table and tag — merged.
- [#202](../.claude/tickets/tasks/202-extend-d10-to-message-catalogs-rtl-paint-and-numberfield.md) Extend D10 to message catalogs RTL paint and NumberField — open.
- [#203](../.claude/tickets/tasks/203-stop-advertising-barrel-name-checks-as-rac-parity.md) Stop advertising barrel-name checks as RAC parity — merged.
- [#204](../.claude/tickets/tasks/204-make-upstream-test-parity-fail-on-remaining-we-only-role-facts.md) Make upstream-test-parity fail on remaining WE-ONLY role facts — parked.
- [#206](../.claude/tickets/tasks/206-drop-local-collection-accessors-and-invented-selection-callbacks.md) Drop local collection accessors and invented selection callbacks — open.
- [#207](../.claude/tickets/tasks/207-match-s2-size-tokens-across-styled-components.md) Match S2 size tokens across styled components — open.
- [#208](../.claude/tickets/tasks/208-restore-rac-heading-and-dialogtrigger-state-wiring.md) Restore RAC Heading and DialogTrigger state wiring — open.
- [#209](../.claude/tickets/tasks/209-fill-rac-render-prop-fields-on-select-listbox-gridlist-tree-and-items.md) Fill RAC render-prop fields on Select ListBox GridList Tree and items — in-progress.
- [#210](../.claude/tickets/tasks/210-fail-api-reference-when-barrel-exports-have-no-own-page.md) Fail api-reference when barrel exports have no own page — open.
- [#211](../.claude/tickets/tasks/211-ratchet-jsx-deopt-size-against-current-artifacts-and-budget-published-js.md) Ratchet jsx-deopt-size against current artifacts and budget published js — open.
- [#212](../.claude/tickets/tasks/212-fail-packed-consumer-smoke-if-a-button-import-retains-table-or-color.md) Fail packed-consumer smoke if a Button import retains Table or Color — open.
- [#213](../.claude/tickets/tasks/213-point-package-tsconfigs-at-the-root-not-the-unused-off-typecheck-overlay.md) Point package tsconfigs at the root not the unused-off typecheck overlay — open.
- [#214](../.claude/tickets/tasks/214-type-tree-selecttarget-empty-array-return-without-extra-compiler-flags.md) Type Tree selectTarget empty-array return without extra compiler flags — open.
- [#215](../.claude/tickets/tasks/215-stop-ticket-relationship-lines-from-citing-deleted-current-doc-paths.md) Stop ticket relationship lines from citing deleted current-doc paths — open.
- [#225](../.claude/tickets/tasks/225-build-the-per-export-cost-table-and-ratchet-from-the-packed-consumer-smoke.md) Build the per-export cost table and ratchet from the packed consumer smoke — open.
- [#226](../.claude/tickets/tasks/226-pack-solid-stately-per-primitive-with-the-existing-solidaria-entry-names.md) Pack solid-stately per primitive with the existing solidaria entry names — open.
- [#250](../.claude/tickets/tasks/250-split-the-comparison-fixture-registries-per-component.md) Split the comparison fixture registries per component — merged.
- [#251](../.claude/tickets/tasks/251-own-popover-enter-and-exit-animation-in-the-headless-popover-as-rac-does.md) Own Popover enter and exit animation in the headless Popover as RAC does — in-progress; OWNER HOLD.
- [#252](../.claude/tickets/tasks/252-virtualize-the-s2-combobox-and-picker-listboxes-as-s2-does.md) Virtualize the S2 ComboBox and Picker listboxes as S2 does — in-progress; OWNER HOLD.
- [#254](../.claude/tickets/tasks/254-decide-rac-context-composition-for-combobox-and-select.md) Decide: RAC context composition for ComboBox and Select instead of compound components — open; SKIP BY OWNER.
- [#255](../.claude/tickets/tasks/255-cut-the-comparison-dev-server-module-graph.md) Cut the comparison dev-server module graph (1 757 modules, ~31 s to islands-mounted) — open.
- [#256](../.claude/tickets/tasks/256-make-virtualizer-context-only-with-the-collection-element-as-the-scroller.md) Make Virtualizer context-only with the collection element as the scroller, as RAC does — in-progress; OWNER HOLD.
- [#257](../.claude/tickets/tasks/257-compose-the-s2-popover-in-combobox-picker-menu-and-tabspicker-as-s2-does.md) Compose the S2 Popover in ComboBox, Picker, Menu and TabsPicker as S2 does — in-progress; OWNER HOLD.
- [#258](../.claude/tickets/tasks/258-radiogroup-slot-id-probe-must-not-remount-radios.md) RadioGroup group-level TextContext must carry description/error slots — open.
- [#260](../.claude/tickets/tasks/260-run-the-react-vs-solid-functional-comparison-pass.md) Run the React-vs-Solid functional comparison pass — merged.
- [#441](../.claude/tickets/tasks/441-read-compiled-element-children-once-through-a-shared-helper.md) Read compiled element children once through a shared helper — open.
- [#452](../.claude/tickets/tasks/452-pre-bundle-comparison-solid-packages-in-astro-dev.md) Pre-bundle comparison Solid packages in astro-dev (`optimizeDeps.include`) — in-progress; blocked.
- [#453](../.claude/tickets/tasks/453-consume-published-import-condition-in-comparison-chrome-islands.md) Consume published `import` condition in comparison chrome islands — merged.
- [#489](../.claude/tickets/tasks/489-compile-solid-spectrum-subpaths-from-source-in-the-comparison-app.md) Compile solid-spectrum subpaths from source in the comparison app — merged.
- [#492](../.claude/tickets/tasks/492-re-enable-axe-target-size-and-classify-wcag-258.md) Re-enable axe target-size and classify WCAG 2.5.8 — merged.
- [#493](../.claude/tickets/tasks/493-triage-certified-remainders-after-the-field-atom-fix.md) Triage certified remainders after the field-atom fix — merged.
- [#497](../.claude/tickets/tasks/497-match-combobox-and-picker-list-selected-checkmark-accent.md) Match ComboBox and Picker list selected-checkmark accent — merged.
- [#498](../.claude/tickets/tasks/498-stamp-rtl-direction-on-combobox-and-picker-overlay-lists.md) Stamp RTL direction on ComboBox and Picker overlay lists — merged.
- [#499](../.claude/tickets/tasks/499-land-picker-list-arrow-roving-focus-on-the-selected-option.md) Land Picker list arrow-roving focus on the selected option — merged.
- [#500](../.claude/tickets/tasks/500-hold-button-family-pressed-d3-raster-to-exact-pair.md) Hold button-family pressed D3 raster to exact pair — merged.
- [#501](../.claude/tickets/tasks/501-match-datepicker-pressed-segment-and-field-paint.md) Match DatePicker pressed segment and field paint — merged.
- [#502](../.claude/tickets/tasks/502-match-datepicker-overlay-open-enter-motion.md) Match DatePicker overlay open-enter motion — merged.
- [#503](../.claude/tickets/tasks/503-apply-ar-ae-names-and-date-segment-bidi-under-d10.md) Apply ar-AE names and date-segment bidi under D10 — merged.
- [#504](../.claude/tickets/tasks/504-invert-horizontal-collection-rtl-focus-trails.md) Invert horizontal collection RTL focus trails — merged.
- [#505](../.claude/tickets/tasks/505-fire-the-pending-actionbutton-keyboard-click.md) Fire the pending ActionButton keyboard click — merged.
- [#506](../.claude/tickets/tasks/506-stop-preventing-default-on-link-activation.md) Stop preventing default on Link activation — merged.
- [#507](../.claude/tickets/tasks/507-keep-tabs-mouse-click-tabindex-stable.md) Keep Tabs mouse-click tabindex stable — merged.
- [#508](../.claude/tickets/tasks/508-close-combobox-and-picker-d13-step-0-dom-oracle.md) Close ComboBox and Picker D13 step-0 DOM oracle — merged.
- [#511](../.claude/tickets/tasks/511-burn-down-button-family-pressed-d3-3d-raster.md) Burn down button-family pressed D3 3D raster — open.
- [#512](../.claude/tickets/tasks/512-append-combobox-formvalue-hidden-inputs-after-children.md) Append ComboBox formValue hidden inputs after children — merged.
- [#513](../.claude/tickets/tasks/513-stamp-focused-and-focus-visible-on-the-select-root.md) Stamp focused and focus-visible on the Select root — merged.
- [#514](../.claude/tickets/tasks/514-drop-invented-data-open-from-the-picker-chevron.md) Drop invented data-open from the Picker chevron — merged.
- [#522](../.claude/tickets/tasks/522-stop-the-playground-breadcrumb-demo-from-navigating-away.md) Stop the playground breadcrumb demo from navigating away — merged.
- [#523](../.claude/tickets/tasks/523-wire-the-tree-expand-button-through-createpress.md) Wire the Tree expand button through createPress — open.
- [#524](../.claude/tickets/tasks/524-put-the-tabs-selected-to-focused-copy-back-on-a-commit-effect.md) Put the Tabs selected-to-focused copy back on a commit effect — merged.
- [#525](../.claude/tickets/tasks/525-clear-the-43-unit-failures-in-test-run.md) Clear the 43 unit failures in test:run — merged.

### #243 Certify interaction journeys (D13)

- [#244](../.claude/tickets/tasks/244-build-the-d13-journey-driver-in-the-comparison-harness.md) Build the D13 journey driver in the comparison harness — in-progress.
- [#245](../.claude/tickets/tasks/245-author-combobox-journeys-from-the-upstream-suites.md) Author ComboBox journeys from the upstream suites — in-progress; successor.
- [#246](../.claude/tickets/tasks/246-author-picker-journeys-from-the-upstream-suites.md) Author Picker journeys from the upstream suites — open.
- [#248](../.claude/tickets/tasks/248-reproduce-the-reported-combobox-and-picker-list-transparency-and-misplacement.md) Reproduce the reported ComboBox and Picker list transparency and misplacement — in-progress.
- [#249](../.claude/tickets/tasks/249-extend-journeys-to-the-rest-of-the-overlay-family.md) Extend journeys to the rest of the overlay family — open.

### #443 Ship the 2026-09 release train

- [#448](../.claude/tickets/tasks/448-merge-pr-33-and-publish-the-six-packages.md) Merge PR #33 and publish the six packages — open.
- [#470](../.claude/tickets/tasks/470-format-oxfmt-drift-that-blocks-release-readiness.md) Format the oxfmt drift that blocks release-readiness — merged.
- [#471](../.claude/tickets/tasks/471-fix-typecheck-errors-that-block-release.md) Fix typecheck errors that block release — merged.
- [#472](../.claude/tickets/tasks/472-resolve-form-validationbehavior-after-splitprops.md) Resolve Form validationBehavior after splitProps — merged.
- [#473](../.claude/tickets/tasks/473-refresh-local-attribution-reviews-after-the-form-validation-barrels-moved.md) Refresh local attribution reviews after the form-validation barrels moved — merged.
- [#474](../.claude/tickets/tasks/474-restore-the-adobe-header-last-line-on-createformreset.md) Restore the Adobe header last line on createFormReset — merged.
- [#475](../.claude/tickets/tasks/475-keep-checkboxgroup-aria-on-items-when-resolving-form-validationbehavior.md) Keep CheckboxGroup aria on items when resolving Form validationBehavior — merged.
- [#476](../.claude/tickets/tasks/476-record-empty-title-on-native-validated-regression-snapshots.md) Record empty title on native-validated regression snapshots — merged.
- [#477](../.claude/tickets/tasks/477-ignore-workspace-kumo-until-a-real-version.md) Ignore workspace Kumo until a real version — merged.
- [#478](../.claude/tickets/tasks/478-strip-kumo-from-mixed-changesets.md) Strip Kumo from mixed changesets — merged.

### #526 Test Geist as a standalone styled Solid library

- [#527](../.claude/tickets/tasks/527-land-the-geist-button-package-baseline.md) Land the experimental Geist Button package as a workspace sibling — merged.
- [#528](../.claude/tickets/tasks/528-mount-a-solid-geist-button-fixture.md) Mount a Solid Geist Button fixture in the comparison app — merged.
- [#530](../.claude/tickets/tasks/530-review-the-geist-pilot.md) Review the Geist Button evidence and decide whether the experiment continues — open.

### #531 Solid 2.0 foundation upgrade vanguard

- [#532](../.claude/tickets/tasks/532-spike-solid-2-compiler-and-toolchain-in-solid-stately.md) Spike Solid 2 compiler and toolchain in solid-stately — merged.
- [#533](../.claude/tickets/tasks/533-transition-solid-stately-to-standard-signal-accessors.md) Transition solid-stately to standard signal accessors — open.
- [#534](../.claude/tickets/tasks/534-audit-solidaria-event-timing-against-solid-2-scheduler.md) Audit solidaria event timing against Solid 2 scheduler — in-progress.
- [#535](../.claude/tickets/tasks/535-replace-dom-inspection-slot-styling-with-slotcontext.md) Replace DOM inspection slot styling with SlotContext — open.
- [#536](../.claude/tickets/tasks/536-re-architect-ssr-hydration-and-retire-the-one-read-rule.md) Re-architect SSR hydration and retire the One-Read Rule — merged.
- [#537](../.claude/tickets/tasks/537-re-certify-2118-parity-checks-on-solid-2-runtime.md) Re-certify the live parity suite on Solid 2 runtime — open.
- [#542](../.claude/tickets/tasks/542-correct-solid-2-ssr-and-hydration-test-compilation.md) Correct Solid 2 SSR and hydration test compilation — merged.
- [#543](../.claude/tickets/tasks/543-restore-solid-2-comparison-app-development.md) Restore Solid 2 comparison app development — in-progress.
