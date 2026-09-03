---
id: 260
type: task
title: "Run the React-vs-Solid functional comparison pass"
created: 2026-09-02
parent: 136
status: in-progress
history:
  - {
      state: open,
      at: 2026-09-02,
      note: "opened from the owner request that is the #136 functional pass: drive both panels, ticket each user-visible divergence",
    }
  - {
      state: in-progress,
      at: 2026-09-02,
      note: "overnight coordinator; overlay family first per #243, then collections, fields, buttons, color, rest",
    }
  - {
      state: in-progress,
      at: 2026-09-03,
      note: "first overnight batch: picker, combobox, menu, actionmenu against preview :4341; remaining slugs queued on a durable scheduler",
    }
  - {
      state: in-progress,
      at: 2026-09-03,
      note: "picker outcome ticketed. User-visible: HiddenSelect stale (#264), disabled trigger aria-disabled (#265), loadingState=loading extra Load more row (#266). Overlay 1px offset left on #248. D13 step-0 DOM still #209/#254. Note output/functional-pass/picker.md.",
    }
  - {
      state: in-progress,
      at: 2026-09-03,
      note: "actionmenu outcome ticketed. User-visible: wrap from last item (#269), Tab leaves open overlay (#267), live direction/align stale placement (#268). Settled overlay geometry matches. Enter animation still #251/#257. haspopup true vs menu is accepted. No D13 ActionMenu journeys (#249). Note output/functional-pass/actionmenu.md.",
    }
  - {
      state: in-progress,
      at: 2026-09-03,
      note: "combobox outcome ticketed. User-visible: menuTrigger=focus does not open (#270), menuTrigger=manual ArrowDown does not open (#271), Enter with custom value leaves overlay open (#272), isRequired uses aria-required instead of native required (#273). Typing unfiltered on both stacks (#245 items). Duplicate filter announcements #80. Dismiss/slot ids #248. data-open #209. Overlay geometry matched when both open. D13 certified still fails step-0 field DOM (#209/#248). Did not start #254. Note output/functional-pass/combobox.md.",
    }
  - {
      state: in-progress,
      at: 2026-09-03,
      note: "menu outcome ticketed. User-visible: Tab leaves open overlay (#267), live direction/align stale placement (#268). Single-selection checkmark column 0px stays on #107. aria-haspopup true vs menu is accepted upstream drift (route contract allows either). No new ids this pass. Note output/functional-pass/menu.md.",
    }
  - {
      state: in-progress,
      at: 2026-09-03,
      note: "tooltip outcome ticketed. Isolated drive: hover/focus/Escape/press/disabled/placements/flip/noflip/scroll/warmup/cooldown/live placement match. User-visible remainders already on #64 (enter opacity + exit unmount vs ~200ms linger; 0.5px overlay offset). Arrow unlabeled img matches upstream (#67). No D13 Tooltip journeys (#249). Did not start #254. No new ids. Note output/functional-pass/tooltip.md.",
    }
  - {
      state: in-progress,
      at: 2026-09-03,
      note: "popover outcome ticketed. User-visible: dismiss does not restore trigger focus (#274), customAnchor triggerRef stuck at origin opacity 0 (#275). DialogTrigger settled geometry/ARIA/Tab trap/form/placements/sizes/hideArrow/offset/maxHeight/live placement match. Enter/exit still #251/#68. No D13 Popover journeys (#249). Did not start #254. Note output/functional-pass/popover.md.",
    }
  - {
      state: in-progress,
      at: 2026-09-03,
      note: "datepicker outcome ticketed. User-visible: maxVisibleMonths=2 popover stays 304px (#276), constrainRange Previous/Next stay enabled (#277), createCalendar leaks into field segments (#278), Next paging leaves stale grid name and moves focus to the cell (#279). Default open/keyboard/pointer/disabled/named form matched. No D13 DatePicker journeys (#249). Did not start #254. Note output/functional-pass/datepicker.md.",
    }
  - {
      state: in-progress,
      at: 2026-09-03,
      note: "daterangepicker outcome ticketed. User-visible: popover under calendar button not FieldGroup (#280), one-month popover 256 vs 304 missing cell-gap (#281), keyboard range-start does not advance focus (#282), min/max cells omit First/Last available date (#283), fr-FR Dismiss stays Dismiss (#284), hour time fields wrap 440 vs 375 (#285). Two-month overlay 504 both (not #276). Constrain Previous/Next disabled both (not #277). data-open #209. No D13 DateRangePicker journeys (#249). Did not start #254. Note output/functional-pass/daterangepicker.md.",
    }
  - {
      state: in-progress,
      at: 2026-09-03,
      note: "contextualhelp outcome ticketed. User-visible: live placement/shouldFlip stale after mount (#286), trigger aria-haspopup dialog vs omitted (#287). Settled geometry, Tab contain, Escape/outside/repress restore, offset pin 8, flip on remount, copy, touch press match. Enter/exit still #251/#68. Focus restore is not #274. No D13 ContextualHelp journeys (#249). Did not start #254. Note output/functional-pass/contextualhelp.md.",
    }
  - {
      state: in-progress,
      at: 2026-09-03,
      note: "autocomplete outcome ticketed. User-visible: typing does not hide non-matching ListBox options (#288), SearchField omits autocomplete/autocorrect/spellcheck/enterkeyhint (#289). Virtual-focus keyboard, Tab, pointer selection, selectionMode, 500ms activedescendant delay, and inline list geometry matched. No D13 Autocomplete journeys. Did not start #254. Note output/functional-pass/autocomplete.md.",
    }
  - {
      state: in-progress,
      at: 2026-09-03,
      note: "selectboxgroup outcome ticketed. User-visible: item isDisabled arrow skip (#290), disabled group Tab skip (#291), horizontal wrap ArrowRight (#292). Live illustrations switch already on #169. Default pointer/keyboard/typeahead/disabledKeys/multiple/vertical/URL remount matched. No D13 SelectBoxGroup journeys (#249). Did not start #254. Note output/functional-pass/selectboxgroup.md.",
    }
  - {
      state: in-progress,
      at: 2026-09-03,
      note: "dialog outcome ticketed. User-visible: AlertDialog footer missing paddingTop 32 (#293), DialogTrigger aria-controls dangling / dialog has no overlay id (#294). Default/sizes/Tab trap/Escape/outside/close/isDismissible/isKeyboardDismissDisabled/hasTitle/isOpen/Alert actions and AX match. Backdrop absolute vs fixed is the certified portal-strategy exclusion. comparison-spectrum-Dialog stays on #141. Exit restore by 200ms (Solid earlier; not #274). No D13 Dialog journeys (#249). Did not start #254. Note output/functional-pass/dialog.md.",
    }
  - {
      state: in-progress,
      at: 2026-09-03,
      note: "gridlist outcome ticketed. User-visible: typeahead letters do not move focus (#295), multiple click/Space replace instead of toggle (#296). Default/arrow/tab/RTL/Home/End/Escape/Ctrl+A/Shift-click/pointer single and none matched. No isDisabled on this route. No D13 GridList journeys. data-selection-mode stays on #209. Did not start #254. Note output/functional-pass/gridlist.md.",
    }
  - {
      state: in-progress,
      at: 2026-09-03,
      note: "listbox outcome equivalent. Isolated default/pointer/keyboard/typeahead/wrap/Home/End/Page/Escape/Tab trampoline both directions/multiple (click, toggle, Shift-click, Shift+Arrow, Ctrl+A)/none/live and URL selectionMode match RAC. Real roving focus, no activedescendant, 51x67.5 inline list, opacity 1. isDisabled/disabledKeys not routed. S2 prop form is a gap. No D13 ListBox journeys (#249). Did not start #254. No new ids. Note output/functional-pass/listbox.md.",
    }
  - {
      state: in-progress,
      at: 2026-09-03,
      note: "listview outcome ticketed. User-visible: intra-row ArrowLeft/Right stay on the row (#305), typeahead letters stay on Project brief (#295), Tab into a disabled-and-selected first row lands on Quarterly (#306), checkbox/row names omit RAC labelledby (#307), pointer click does not open item ActionMenu (#308), live renderActionBar/hideLinkOutIcon/highlight leave slots stale (#309). Default pointer/keyboard Space/Enter/Home/End/Ctrl+A/Escape, single/none/highlight/quiet/wrap/icons/empty, disabledKeys skip, and URL ActionBar match. Virtualizer aria-rowcount stays #66. No D13 ListView journeys (#249). Did not start #254. Note output/functional-pass/listview.md.",
    }
  - {
      state: in-progress,
      at: 2026-09-03,
      note: "tableview outcome ticketed. User-visible: cell/header DOM focus (#302), live density/quiet/selectionMode (#303), Column minWidth/maxWidth (#304), rowheader lost after collection update (#310), Ctrl+A (#311), typeahead (#312), checkbox tab order (#313), disabled ArrowDown skip (#314). Default rest AX, pointer select, Select All mixed, Space/Enter, URL remount, sort click, empty AX, ActionBar, disabled click match. Structure/colcount/height stay on #89. Sort-description columnName is D6 known. No D13 TableView journeys (#249). Did not start #254. Note output/functional-pass/tableview.md.",
    }
  - {
      state: in-progress,
      at: 2026-09-03,
      note: "accordion outcome equivalent. Isolated default/pointer/keyboard Space/Enter/Tab/Shift+Tab/arrows, single and multiple expansion, header-action isolation, disabled skip, URL and live size/density/quiet/disabled/allowsMultipleExpanded, and ar-SA RTL chevron match S2. AX, 220px geometry, hidden=until-found, and 2px focus ring match. Boolean data-expanded true vs empty not user-visible. No overlay, no form. No D13 Accordion journeys (#249). Did not start #254. No new ids. Note output/functional-pass/accordion.md.",
    }
  - {
      state: in-progress,
      at: 2026-09-03,
      note: "virtualizer outcome ticketed. User-visible: focused option persisted off-screen inflates scrollHeight and shows the wrong window (#315), PageUp after PageDown lands Item 2 (#129), typeahead Space selects instead of matching Item 5 (#128). Unfocused D-scroll offsets, Home/End, arrows, pointer, multiple/none, live selectionMode match. Overscan AX is by design. No D13 Virtualizer journeys (#249). Did not start #254. Did not waive D-reorder (#256). Note output/functional-pass/virtualizer.md.",
    }
  - {
      state: in-progress,
      at: 2026-09-03,
      note: "treeview outcome ticketed. User-visible: typeahead letters (#324), collapse drops row focus (#325), ArrowRight expands instead of intra-row widgets (#326), Tab cannot leave the collection (#327), Shift+Arrow/Shift+click range (#328), ActionMenu click/dispatch/Enter stay closed (#329), live showActionBar stale (#330), * expands siblings (#331). Default rest AX, Tab/Arrow/Home/End/Space/Enter/Escape/Ctrl+A, pointer toggle, disabled Project skip, URL remount including ActionBar, live selectionMode/highlight/empty/icons/buttonGroup match. Virtualizer rowcount/End unmount/empty height stay #65. haspopup true vs menu accepted. No D13 TreeView journeys (#249). Did not start #254. Note output/functional-pass/treeview.md.",
    }
  - {
      state: in-progress,
      at: 2026-09-03,
      note: "taggroup outcome ticketed. User-visible: focus lost after remove (#316), selectionBehavior=replace ignored (#317), Tab walks every Remove (#318), onAction on selection press / not on Enter (#319), Escape does not clear (#320), Ctrl+A no-op (#321), live allowsRemoving/selectionMode stale (#322), missing keyboard focus ring (#323). Default AX, pointer toggle, arrows/Home/End/wrap, Space, no-remove Tab, single/none pointer, disabled-item skip, RTL, group-action, empty, URL remount match. Typeahead neither. URL isDisabled is S2 no-op vs Solid extra-disable (on #322). data-selection-mode stays #209. Spine stays #54. No D13 TagGroup journeys (#249). Did not start #254. Note output/functional-pass/taggroup.md.",
    }
  - {
      state: in-progress,
      at: 2026-09-03,
      note: "dnd-listbox outcome ticketed. User-visible: keyboard-drag focus stays listbox:Permissions with duplicate insert indicators (#256, not waived), selected-item pickup drags only the focused key and keeps Press Enter to start dragging (#332). Single-item Enter/ArrowDown×2/Enter order write,admin,read and Escape cancel match. Default/pointer/keyboard nav/typeahead/Ctrl+A/Space/URL single remount/live selectionMode match. Pointer HTML5 drag undrivable. No D13 DnD journeys (#249). Did not start #254. Note output/functional-pass/dnd-listbox.md.",
    }
  - {
      state: in-progress,
      at: 2026-09-03,
      note: "actionbar outcome ticketed. User-visible: React fixture stuck on dark tokens (#333), scrollRef enter pops in one frame (#334), Actions available. without scrollRef (#335), collection adapter 370×60 vs ListView renderActionBar 402×56 (#336). Default AX/pointer/keyboard Tab-Edit-Clear/arrows/no-wrap/Home-End no-op/Space/Enter/Escape/clear, URL 0/1/all/emphasized/scrollRef geom, live count/emphasized/scrollRef/collection keys, and 200ms exit match. Collection row names stay #307. data-open true vs omitted not user-visible. isDisabled not routed. No D13 ActionBar journeys (#249). Did not start #254. Note output/functional-pass/actionbar.md.",
    }
  - {
      state: in-progress,
      at: 2026-09-03,
      note: "card outcome ticketed. User-visible: standalone href+isDisabled stays an enabled S2 <a> and Solid disables (#337), live href stays a DIV (#338), live size leaves title/description at M fonts (#339). Default rest AX/geometry, pointer hover/click, Tab skip, URL size/density/variant/preview/footer/copy/skeleton/href keyboard+press, quiet preview ring, and live footer/copy match. inert=\"\" vs \"true\" not user-visible. data-size extras structural. Press-scale settles by 300ms both. No overlay, no form. No D13 Card journeys (#249). Did not start #254. Note output/functional-pass/card.md.",
    }
  - {
      state: in-progress,
      at: 2026-09-03,
      note: "cardview outcome ticketed. User-visible: CSS auto-fit stacks size S while S2 GridLayout is two-up (#340), Card isDisabled dropped on GridListItem (#341), highlight End/ArrowDown focus without selectOnFocus (#342), ArrowRight no-op on a two-up row (#343), live showActionBar stale (#344), typeahead z stays Apollo (#295), checkbox name Select without labelledby (#307). Default pointer click/toggle/hover, Space/Enter/Escape, Home, Ctrl+A no-op, selectionMode none/single/multiple, highlight replace vs checkbox add, disabledKeys skip, URL ActionBar Clear, uncontrolled defaultSelectedKeys, live selectionMode, and density gap match. Shift+Tab after a clean Tab lands on Apollo both. Playwright Solid Clear intercept is harness. No D13 CardView journeys (#249). Did not start #254. Note output/functional-pass/cardview.md.",
    }
  - {
      state: in-progress,
      at: 2026-09-03,
      note: "textarea outcome ticketed. User-visible: live isInvalid leaves HelpText on the mount-time description/error slot (#345). Default rest AX/geometry 208×104, pointer click/group-click/hover, Tab cycle with 2px ring, typing auto-grow, disabled Tab skip, read-only, native required, URL invalid error slot, sizes S/L/XL, empty height 50, and live size/value/label/disabled/required match. textarea data-disabled/data-invalid extras structural. Empty height vs S2 ::before stays #124 (both stacks 50px). URL invalid already matches; not #70. No overlay, no form name. No D13 TextArea journeys (#249). Did not start #254. Note output/functional-pass/textarea.md.",
    }
  - {
      state: in-progress,
      at: 2026-09-03,
      note: "numberfield outcome ticketed. User-visible: PageUp/PageDown jump to max/min (#346), focused wheel no-op (#347), stepper hold does not repeat (#348), isRequired extra aria-required (#349), value changes not announced (#350). Live isInvalid HelpText already #345. Default rest AX/geometry 208×32, Tab cycle, Arrow/Home/End, pointer click, disabled skip, read-only, URL invalid, hideStepper, sizes, step=3, clamp, live size/value/disabled/hideStepper match. inputMode numeric vs decimal DOM-only on this host. Fixture onInput vs onChange is harness (certified D4). No overlay, no form name. No D13 NumberField journeys (#249). Did not start #254. Note output/functional-pass/numberfield.md.",
    }
  - {
      state: in-progress,
      at: 2026-09-03,
      note: "textfield outcome ticketed. User-visible: isInvalid does not set native custom validity so form submit proceeds (#351); live isInvalid leaves HelpText on the mount-time description slot (#345). Default rest AX/geometry 208×82, pointer click/label/group, Tab cycle with settled 2px ring and gray-900 border, typing, disabled Tab skip, read-only, native required, URL invalid error slot/icon, sizes S/L/XL, empty value, and live size/value/label/disabled/required match. Input data-invalid/data-disabled extras structural. data-focused vs data-focus-within not user-visible. No overlay, name not routed. No D13 TextField journeys (#249). Did not start #254. Note output/functional-pass/textfield.md.",
    }
  - {
      state: in-progress,
      at: 2026-09-03,
      note: "searchfield outcome ticketed. User-visible: ContextualHelp press remounts and never opens (#352), trigger name Help vs Search Help (#353), live isInvalid HelpText already #345, isInvalid native custom validity already #351, aria-haspopup already #287. Default rest AX/geometry 200×32 pill group, type/fill/Escape/clear/group-click, disabled Tab skip, read-only, native+aria required Enter, URL invalid error slot, sizes/labelPosition/type/placeholder/empty, and live size/disabled/readonly/required/copy match. Standalone autocomplete attrs omitted on both (not #289). No D13 SearchField journeys (#249). Did not start #254. Note output/functional-pass/searchfield.md.",
    }
  - {
      state: in-progress,
      at: 2026-09-03,
      note: "checkbox outcome ticketed. User-visible: Enter toggles Solid (#354), isInvalid native custom validity missing (#355), isInvalid HelpText icon row already #70, live size after selected leaves checkmark 10×10 (#356). Default rest AX/geometry 99×18 / box 16×16, hover, label/box click, Tab cycle with 2px ring, Space, disabled Tab skip, read-only no-op, native+aria required submit, named form {}, {terms:agree}, sizes S/L/XL remount, indeterminate mixed, emphasized, defaultSelected, and live selected/disabled/readonly/required/children match. Isolated invalid Tab matches. No D13 Checkbox journeys (#249). Did not start #254. Note output/functional-pass/checkbox.md.",
    }
  - {
      state: in-progress,
      at: 2026-09-03,
      note: "timefield outcome ticketed. User-visible: isInvalid native custom validity (#362), ContextualHelp wraps under the label (#363), live hourCycle leaves aria-valuetext at 9 AM (#364), live empty value keeps React on 9:30 (#365). Help press already #352, name Start time Help vs Help already #353, aria-haspopup already #287. Live isInvalid HelpText swaps (not #345). Default rest AX/geometry 208×82, pointer, Tab hour→minute→dayPeriod, spin/Page/Home/End, typed 2 auto-advance, Backspace, wheel no-op both, disabled skip, read-only, required empty, URL empty/hourCycle/granularity/leading-zeros/locales/RTL/constrain/name/sizes, and live size/value/label/copy match. No D13 TimeField journeys (#249). Did not start #254. Note output/functional-pass/timefield.md.",
    }
  - {
      state: in-progress,
      at: 2026-09-03,
      note: "colorfield outcome ticketed. User-visible: PageUp/PageDown jump to min/max (#366), wheel deltaY +120 decrements (#367), isInvalid native custom validity missing (#368), FieldGroup hover and keyboard ring missing (#369), hex lowercase (#370), live isInvalid HelpText already #345. Default rest AX/geometry 208×82, pointer click/label/group, Tab cycle, Arrow/Home/End, Enter commit, empty/invalid-hex restore, disabled skip, read-only, native+aria required, URL invalid error slot/icon, named hex and channel hidden form, sizes/labelPosition, live size/disabled/readonly/required/copy/channel match. Channel aria-roledescription Number field is DOM-only (AX equal). No D13 ColorField journeys (#249). Did not start #254. Note output/functional-pass/colorfield.md.",
    }
  - {
      state: in-progress,
      at: 2026-09-03,
      note: "datefield outcome ticketed. User-visible: isInvalid native custom validity already #362 (createDateField; required-empty focus stays on Submit), ContextualHelp wrap 208×82 vs 208×102 already #363, help press already #352, name Appointment date Help vs Help already #353, aria-haspopup already #287. Live isInvalid HelpText swaps (not #345). HiddenDateInput stepMismatch not user-visible (form=\"\"). Default rest AX/geometry 208×82, Tab month→day→year, Arrow/Page/Home/End spin, typed auto-advance, Backspace, wheel no-op, FieldGroup click year, disabled skip, read-only, named FormData {date:2025-03-03}, sizes/labelPosition/granularity/hourCycle/hideTimeZone/locales/RTL/constrain/unavailable, and live size/value/copy match. No D13 DateField journeys (#249). Did not start #254. Note output/functional-pass/datefield.md.",
    }
  - {
      state: in-progress,
      at: 2026-09-03,
      note: "switch outcome ticketed. User-visible: Enter toggles Solid already #354, live isDisabled/isReadOnly paint stale (#371). Field position relative vs static stays #121 (not user-visible here). Default rest AX/geometry 65×18 / track 26×16, pointer label/track/handle, Tab cycle 2px ring, Space, arrows no-op, disabled skip, read-only no-op, selected/emphasized/disabled-selected, sizes S/L/XL remount, URL and live children, live selected/emphasized/size match. name/value/isRequired/isInvalid not routed. Injected named form harness (React re-render drops the DOM name). No D13 Switch journeys (#249). Did not start #254. Note output/functional-pass/switch.md.",
    }
  - {
      state: in-progress,
      at: 2026-09-03,
      note: "checkboxgroup outcome ticketed. User-visible: required asterisk omitted from group AX name (#372), live isInvalid drops aria-describedby (#373), Enter toggles already #354, isInvalid native custom validity already #355, empty errorMessage FieldError row already #70, ContextualHelp press already #352, wrap already #363, name Help vs Notifications Help already #353, aria-haspopup already #287, live size after selected checkmark already #356. Live HelpText slot swaps (not #345). Default rest AX/geometry 69×182, pointer multi-select, Tab email→sms→push, Space, disabled skip, read-only no-op, required empty submit, named form {channels:email} / [email,sms], sizes/orientation/labelPosition/emphasized/uncontrolled, and live orientation/disabled/labelPosition/selectedValues match. No D13 CheckboxGroup journeys (#249). Did not start #254. Note output/functional-pass/checkboxgroup.md.",
    }
  - {
      state: in-progress,
      at: 2026-09-03,
      note: "slider outcome ticketed. User-visible: horizontal ArrowUp/Down inverted (#374), live isEmphasized/isDisabled fill and live max output width stale (#375), native input vs div[role=slider] already #74, ContextualHelp press already #352, wrap already #363, name Help vs Volume Help already #353, aria-haspopup already #287. Default rest AX/geometry 208×50 fill 83.2×4, pointer hover/track-click 80/drag 20, wheel no-op, Tab Before→slider→After, ArrowLeft/Right Page Home/End, disabled skip, URL sizes/track/precise/emphasized/fillOffset/labels/uncontrolled/step/clamp, named form {volume:40}→41, live size XL/fillOffset/value 75 match. SNAP thumb mismatch was inner-knob vs role=slider container. No D13 Slider journeys (#249). Did not start #254. Note output/functional-pass/slider.md.",
    }
  - {
      state: in-progress,
      at: 2026-09-03,
      note: "radiogroup outcome ticketed. User-visible: isInvalid native custom validity (#376), live isDisabled paint stale (#377), required-empty submit focuses enterprise vs starter (#378), named form name=plan shared across panels (#379), live isInvalid describedby already #258, ContextualHelp press already #352, wrap already #363, name Help vs Plan Help already #353, aria-haspopup already #287. Live HelpText slot swaps (not #345). Default rest AX/geometry 82×164, pointer, Tab single stop, arrows wrap, Space/Enter no extra toggle, disabled skip, read-only move-focus-not-select, required selected submit, aria validation, URL invalid error slot, horizontal, sizes, emphasized, live selected/readonly/required/orientation/size/copy match. Isolated invalid Tab matches. No D13 RadioGroup journeys (#249). Did not start #254. Note output/functional-pass/radiogroup.md.",
    }
  - {
      state: in-progress,
      at: 2026-09-03,
      note: "button outcome ticketed. User-visible: pending label/AX name Save drops immediately (#380). Default rest AX/geometry 62×32, pointer click/press-scale, Tab Before→Save→After, Enter/Space, disabled native skip, pending press suppression, variants/fill/sizes/staticColor/icon/RTL, URL and live children/size/disabled, injected type=button form click no extra submit match. Hover 160ms 19 vs 22 settles 400ms. Icon wrapper vis vs svg hidden is #135 structural. Spinner delay matches on live isPending. No D13 Button journeys (#249). Did not start #254. Note output/functional-pass/button.md.",
    }
  - {
      state: in-progress,
      at: 2026-09-03,
      note: "rangeslider outcome ticketed. User-visible: native input vs div[role=slider] already #74 (AX omits Solid value; names Minimum Range vs Minimum; Tab target; extra native outline on the Solid container), ContextualHelp press already #352, wrap already #363, name Help vs Range Help already #353, aria-haspopup already #287. ArrowUp/Down match (not #374). Live isEmphasized/isDisabled fill and live max output width match (not #375). Default rest AX/geometry 396×50 fill 118.8×4 knobs 20×20 output 30–60, pointer hover-start/track-click 10 and 45/drag-start 10, wheel no-op, Tab Before→start→end→After, arrows/Page/Home/End/cross, disabled skip, URL sizes/track/precise/emphasized/formats/labels/controlled/step/clamp, named form {min,max} 30:60→31:59, live size XL/thick-precise/emphasized/disabled/range/format match. data-disabled polarity stays #93 (not user-visible). No D13 RangeSlider journeys (#249). Did not start #254. Note output/functional-pass/rangeslider.md.",
    }
  - {
      state: in-progress,
      at: 2026-09-03,
      note: "actionbutton outcome ticketed. User-visible: pending string children keep aria-label Inspect after the spinner (#381). Default rest AX/geometry 67×32, pointer hover/click/press-scale, Tab cycle 2px ring, Enter/Space count, disabled skip, pending focusable+aria-disabled+press-suppressed, quiet, sizes XS–XL, staticColor, icon start/only, live children/size/quiet/disabled/iconPlacement match. Icon-start pending unnamed both. Icon-only pending keeps consumer aria-label both. Press-scale 80ms 5th-decimal matrix is timing; 300ms exact. Button fixture t0 hide is #380, not this slug. Hover/pressed clone photography stays #197. No D13 ActionButton journeys (#249). Did not start #254. Note output/functional-pass/actionbutton.md.",
    }
  - {
      state: in-progress,
      at: 2026-09-03,
      note: "form outcome ticketed. User-visible: validationBehavior=aria does not switch descendant TextField off native required (#382), native valueMissing after blocked submit omits HelpText/aria-invalid (#383), live size/labelPosition leave the form grid at mount-time row-gap and columns (#384). Default rest AX/geometry 312×138, pointer click input/label/group, Tab Before→input→submit→After, type+Enter submit, disabled skip, required filled native+asterisk, necessity label (required), URL sizes S/L/XL, URL side-label, emphasized, copy remount, requestSubmit default, live isDisabled/isRequired/emphasized/children inherit size match. URL aria remount still submits both (form noValidate). Hover data-hovered extra on React group (border matches). Input data-disabled extra on React. Side-label y-rects stay #77. No D13 Form journeys (#249). Did not start #254. Note output/functional-pass/form.md.",
    }
  - {
      state: in-progress,
      at: 2026-09-03,
      note: "togglebutton outcome equivalent. Isolated default/pointer hover/click/press-scale, Tab cycle 2px ring, Enter/Space toggle both ways, Escape/arrows no-op, disabled skip, disabled+selected, URL and live selected/emphasized/quiet/sizes XS–XL/staticColor/icon start/only/children/disabled, ar-SA RTL, and injected type=button form {} match S2. AX button Pin / [pressed] / [disabled] [pressed], geometry 42×32. Hover 160ms 1-unit RGB and press-scale 80ms matrix are timing; 400ms and 300ms exact. Solid data-comparison-control-props isSelected stale after click is harness serialization (aria-pressed matches). No overlay. name not routed. No D13 ToggleButton journeys (#249). Did not start #254. No new ids. Note output/functional-pass/togglebutton.md.",
    }
  - {
      state: in-progress,
      at: 2026-09-03,
      note: "buttongroup outcome equivalent. Isolated default/pointer hover/click/press-scale, Tab Before→Save→Cancel→After with 2px ring, Enter/Space on each, arrows/Home/End no-op, disabled native skip, URL and live orientation/align/size/icon/wrapWidth overflow, parent ResizeObserver 80→column / 400→row, wrapWidth=96&align=end, and injected type=button form {} match S2. AX button Save / Cancel (disabled both). Geometry 150×32 row gap 12; Save 62×32 Cancel 76×32. Overflow flips axis not shrink. Solid fixture aria-label Approval actions is DOM-only (AX equal). Tab 100ms RGB interpolation is timing. locale=ar-SA not routed. No overlay. name not routed. No D13 ButtonGroup journeys (#249). Did not start #254. No new ids. Note output/functional-pass/buttongroup.md.",
    }
  - {
      state: in-progress,
      at: 2026-09-03,
      note: "linkbutton outcome ticketed. Isolated default/pointer hover/click/press-scale, Tab Before→link→After 2px ring, Enter navigates and Space/Escape/ArrowDown no-op, disabled Tab skip and force-click no nav, URL and live variant/fill/size/staticColor/icon start/only/children/href, hash href, and injected form requestSubmit {} with click not extra-submitting match S2 except disabled href. User-visible: disabled span drops href so AX has no /url (#385). Hash-click hashchange miss is shared-page measurement. Press-scale 80ms matrix is timing; 300ms exact. locale=ar-SA not wired on either fixture. No overlay. isPending not routed. No D13 LinkButton journeys (#249). Did not start #254. Note output/functional-pass/linkbutton.md.",
    }
  - {
      state: in-progress,
      at: 2026-09-03,
      note: "actiongroup outcome ticketed. User-visible: live selectionMode/orientation leave host role and aria-orientation stale (#388), live disabledKeys leave items natively enabled (#386), React fixture drops onPress so click/Space/Enter never select (#387). RTL vertical ArrowRight wraps previous on the unstyled React row is upstream drift (hook flipDirection is rtl && horizontal; Solid next matches; D10 is horizontal none). Default rest AX, Tab trampoline, orientation-agnostic arrows, wrap, Home/End no-op, URL single/multiple/disabled/all-disabled/RTL horizontal, no selection-follows-focus, and none-mode press match. Geometry/paint out of scope (no S2 ActionGroup). No overlay, no form. No D13 ActionGroup journeys (#249). Did not start #254. Note output/functional-pass/actiongroup.md.",
    }
  - {
      state: in-progress,
      at: 2026-09-03,
      note: "link outcome equivalent. Isolated default/pointer hover/click, Tab Before→link→After 2px ring, Enter navigates and Space/Escape/ArrowDown no-op, URL and live variant/standalone/quiet/staticColor/children/href including hash and relative, certified href=# Enter/Space, and injected form requestSubmit {} with click not extra-submitting match S2. AX link View project /url, geometry 78×22.5 inline / 73×18 standalone. Quiet underline on hover and focus-visible both. isDisabled URL/live is an S2 no-op both (not #385). Empty/javascript href sanitizes to default both. Hash-click hashchange miss is shared-page measurement. Press-down 80ms RGB is timing; 300ms exact. locale=ar-SA not wired on either fixture. No overlay. No D13 Link journeys (#249). Did not start #254. No new ids. Note output/functional-pass/link.md.",
    }
  - {
      state: in-progress,
      at: 2026-09-03,
      note: "toolbar outcome equivalent. Isolated default/pointer click/type/hover, Tab trampoline + last-focused restore, orientation-gated arrows through Size (no text-input guard), no wrap, Home/End caret-only in the input, nested role=group + aria-orientation, URL and live orientation/content, RTL horizontal flip and vertical no-flip match RAC. AX toolbar Text formatting + Bold/Italic/Size/Underline. Geometry 259x22.5 unstyled both. Live orientation while focused drops Solid to BODY (fixture createMemo remount; settled AX/keyboard match; not filed). isDisabled not routed. No overlay, no form. No D13 Toolbar journeys (#249). Did not start #254. No new ids. Note output/functional-pass/toolbar.md.",
    }
  - {
      state: in-progress,
      at: 2026-09-03,
      note: "togglebuttongroup outcome equivalent. Isolated default/pointer hover/click/press-scale, Tab trampoline + last-focused restore, arrows rove without selecting and without wrap, Home/End no-op, Space/Enter toggle including deselect, disabled skip, URL and live single/multiple/disallowEmpty/orientation/density/quiet/emphasized/justified/sizes XS–XL/staticColor/icon start/only/disabled, and injected type=button form {} match S2. AX radiogroup Text alignment / radio Left [checked]; multiple toolbar + aria-pressed. Geometry 182×32 gap 8; Left 47×32 Center 63×32 Right 56×32. Live selectionMode/orientation update (not #388). locale=ar-SA not routed. Press-scale 80ms matrix is timing; 300ms exact. No overlay. name not routed. No D13 ToggleButtonGroup journeys (#249). Did not start #254. No new ids. Note output/functional-pass/togglebuttongroup.md.",
    }
  - {
      state: in-progress,
      at: 2026-09-03,
      note: "segmentedcontrol outcome ticketed. User-visible: disabled selection-indicator fill GrayText vs gray-25 (#389), pressScale on the radio instead of the inner content (#390). Default rest AX/geometry 157×32 gap 4, toolbar arrows without select/wrap, Home/End no-op, Tab trampoline, Space/Enter, pointer, disallowEmpty, disabled skip, item-disabled skip, justified, icon start/only, URL and live selectedKey/defaultSelectedKey/isDisabled, injected form {}. Indicator slide in-flight at 250ms; 500ms exact. locale=ar-SA not routed. No overlay. name not routed. No D13 SegmentedControl journeys (#249). Did not start #254. Note output/functional-pass/segmentedcontrol.md.",
    }
  - {
      state: in-progress,
      at: 2026-09-03,
      note: "colorswatch outcome equivalent. Isolated default/pointer hover/click/press-hold, Tab skip Before→After, Enter/Space/Escape/arrows no-op, URL and live color/transparent slash/empty/alpha/named/size XS–L/rounding none-full/aria refs/id/slot, ar-SA and ar-AE colorName+roledescription, and injected form {} match S2. AX img vibrant red orange, Background color; geometry 32×32 radius 4px. isDisabled URL is an S2 no-op both. Attr key-order only. No overlay. name not routed. No D13 ColorSwatch journeys (#249). Did not start #254. No new ids. Note output/functional-pass/colorswatch.md.",
    }
  - {
      state: in-progress,
      at: 2026-09-03,
      note: "colorarea outcome ticketed. User-visible: pointer/vertical-key hidden range inputs never receive DOM focus so ArrowRight after click is a no-op and Tab after ArrowUp hits y (#391); HSL/HSB hue valuetext 253 vs 252.76 degrees (#392). Default rest AX/geometry 192x192, Tab Before to x to After, keyboard channel steps, off-thumb drag+loupe 50x66, wheel no-op, disabled Tab skip, named form redChannel/greenChannel, RTL, URL/live colorSpace/channels/value/label match. Thumb-center press keeps 155; off-center press jumps (same #391). rgb vs rgba marker is fixture serialization. ring.rect.x is side-by-side abs coords. Not #74 (native ranges already back the AX value). No D13 ColorArea journeys (#249). Did not start #254. Note output/functional-pass/colorarea.md.",
    }
  - {
      state: in-progress,
      at: 2026-09-03,
      note: "colorwheel outcome ticketed. User-visible: hue input remounts on the first value change so later keys no-op and a ring click leaves the loupe open (#393, same Color.tsx thumb remount as ColorSlider); End from 15 is 359 vs S2 0 (#396); live defaultValue leaves Solid at 0 (#395). Default rest AX/geometry 192×192, Tab cycle, first Arrow/PageUp, wrap ArrowLeft, pointer ring 90/180/270, center hole, thumb drag+loupe 50×66, wheel no-op, disabled URL/live skip, sizes 175/224/256 URL and live, controlled value, named form {hue:0}→{hue:1}, aria refs, RTL valuetext match. hsla vs hsl marker is fixture serialization. Not #74 (native range already backs AX). Not #391 (ColorWheel does focusInput). Not #394 (ColorSlider keep 360). No D13 ColorWheel journeys (#249). Did not start #254. Note output/functional-pass/colorwheel.md.",
    }
  - {
      state: in-progress,
      at: 2026-09-03,
      note: "colorslider outcome ticketed. User-visible: hidden range input remounts on the first value change so later keys no-op, focus BODY, thumb 32→16, and a track click leaves data-dragging plus the 50×66 loupe open (#393, same Color.tsx remount as ColorWheel); hue End from 50 is 0°/left 0px vs S2 360°/left 192px (#394). Default rest AX/geometry 192×50.5 track 192×24 thumb 16×16 left 26.6562px output 50°, Tab Before→input→After 32×32 ring, first Arrow/Page/Home, hover, held drag 20%→72 + loupe enter 50×66, wheel no-op, disabled Tab skip, labeled/ariaLabel/vertical rest, RGB End 128→255 thumb 192px, alpha/saturation/lightness/brightness rest, defaultValue 180, RTL 50 درجة + click 80%→72, live isDisabled/orientation/channel/alpha/label/value/ariaLabel, named form {hue:50}→{hue:51} match. hsla vs hsl marker is fixture serialization. Brightness track 213 vs 212 is 1LSB. Not #74 (native range already backs AX). Not #391 (input is focused then replaced). Not #392 (not valuetext digits). Not #396 (ColorWheel End should be 0). No D13 ColorSlider journeys (#249). Did not start #254. Note output/functional-pass/colorslider.md.",
    }
  - {
      state: in-progress,
      at: 2026-09-03,
      note: "meter outcome equivalent. Isolated default/pointer hover/click/press-hold/wheel, Tab skip, Enter/Space/arrows/Home/End/Page no-op, URL and live variant/size/labelPosition/value/min/max/valueLabel/label/staticColor/clamp/equal-range/combo, and injected form {} match S2. AX meter Storage 72%, geometry 272×35.25 track 272×6 fill 72% rgb(75, 117, 255). Role token stays #104 (fixture-normalized to meter; AX equal). locale=ar-SA not wired on either fixture. isDisabled/formatOptions/name not routed. No overlay. No D13 Meter journeys (#249). Did not start #254. No new ids. Note output/functional-pass/meter.md.",
    }
  - {
      state: in-progress,
      at: 2026-09-03,
      note: "progresscircle outcome ticketed. User-visible: live ariaLabel leaves Solid named Loading… while fixture JSON updates (#410). Default rest AX/geometry 32×32, pointer hover/click, Tab skip, Enter/Space/arrows no-op, URL value/clamp/custom/equal range, indeterminate animation+dropped value attrs, sizes S/M/L, staticColor white/black/auto, URL aria-label remount, live value/size/staticColor/indeterminate, and injected form {} match S2. isDisabled URL is an S2 no-op both. Indeterminate fill phase is D2 excluded. locale=ar-SA not wired on either fixture. Attr key-order only. No overlay. name not routed. No D13 ProgressCircle journeys (#249). Did not start #254. Note output/functional-pass/progresscircle.md.",
    }
  - {
      state: in-progress,
      at: 2026-09-03,
      note: "progressbar outcome ticketed. User-visible: indeterminate fill easing cubic-bezier(0.37, 0, 0.63, 1) vs S2 in-out cubic-bezier(0.45, 0, 0.4, 1) (#400); same S2 style also sets will-change:transform and position:relative. Default rest AX/geometry 336×35.3 track 336×6 fill 50% rgb(59, 99, 251), pointer/keyboard skip, URL and live value/range/format/size/labelPosition/staticColor/label/clamp/indeterminate AX, and injected form {} match. Hashed animation-name is the D2 exclusion. locale=ar-SA not wired on either fixture. isDisabled/name not routed. No overlay. No D13 ProgressBar journeys (#249). Did not start #254. Note output/functional-pass/progressbar.md.",
    }
  - {
      state: in-progress,
      at: 2026-09-03,
      note: "colorswatchpicker outcome ticketed. User-visible: PageDown/PageUp no-op (#411), live size/rounding leave 32×32 / 0px (#412), live aria-label/id stay Accent color / generated id (#413), live defaultValue leaves Rose selected (#414, same harness as #395), controlled click remounts React and drops focus (#415). Default rest AX/geometry 248×32 gap 4 overlay on Rose, pointer hover/click/press/wheel, Tab trampoline, arrows without select, Enter/Space, Home/End no-wrap, Escape, Ctrl+A, typeahead getColorName no-op both, URL density/size/rounding/value/unlabeled/labelledby/id/locales, live density/controlled/reset, RTL ArrowLeft, and injected form {} match S2. isDisabled not routed. data-selection-mode stays #209. No D13 ColorSwatchPicker journeys (#249). Did not start #254. Note output/functional-pass/colorswatchpicker.md.",
    }
  - {
      state: in-progress,
      at: 2026-09-03,
      note: "disclosure outcome ticketed. User-visible: live withHeaderAction leaves the Solid header at mount-time composition (#419). Isolated default/pointer click toggle/action isolation, hover 160+400, press, Tab Before→trigger→action→After with 2px ring, Space/Enter, arrows/Home/End/Escape no-op, disabled skip, URL size/density/quiet/collapsed/header/region/titleLevel, live expanded/disabled/size/density/quiet/titleLevel/panelRole, and ar-SA RTL chevron match S2. AX, 250×129 geometry, hidden=until-found, panel stays group, 2px focus ring match. Boolean data-expanded true vs empty not user-visible. No overlay, no form. No D13 Disclosure journeys (#249). Did not start #254. Note output/functional-pass/disclosure.md.",
    }
  - {
      state: in-progress,
      at: 2026-09-03,
      note: "tabs outcome ticketed. User-visible: live orientation/density/isDisabled/keyboardActivation/ariaLabel/withIcons/labelBehavior stay at mount (#420 harness), overflow TabsPicker trigger 208 vs 70 (#421), static hide dangling labelledby (#422). Default/pointer/keyboard/URL remount including disabled, manual, vertical, compact, hide, icons, static, forceMount match. Overflow listbox 176×112 and settled focus restore match (#68/#251 exit, not #274). Chevron unlabeled img is S2. data-key TEMPLATE labelledBy trailing-space stay #209. locale=ar-SA not routed. No D13 Tabs journeys (#249). Did not start #254. Note output/functional-pass/tabs.md.",
    }
  - {
      state: in-progress,
      at: 2026-09-03,
      note: "calendar outcome ticketed. User-visible: pointer select drops cell focus (#416), outside-month cells stay enabled under visibleMonths=2 (#417), live visibleMonths snapshots one month (#418). Calendar still hits stale grid name after page (#279), constrainRange Previous/Next stay enabled (#277), min/max First/Last available names missing (#283). Default rest/tab/arrows/Home/End/Enter/Space, URL disabled/readonly/unavailable/invalid/fr/ar/indian/custom454, live disabled/firstDay/value/locale/unavailable, and wheel match. No overlay, no form. No D13 Calendar journeys (#249). Did not start #254. Note output/functional-pass/calendar.md.",
    }
  - {
      state: in-progress,
      at: 2026-09-03,
      note: "rangecalendar outcome ticketed. User-visible: pointer click drops cell focus (#416), drag 8→12 does not extend (#423), keyboard range-start stays on the cell (#282) then ArrowRight commits a single-day range (#425), custom454 cell numbers off by one (#424), stale grid name after Next (#279), min/max First/Last names (#283), live visibleMonths=2 application name (#418), live focusedValue clear leftover April (#426). Default rest AX/geometry 224×246, hover, two-click 8–14, same-day 20, wheel, kbd arrows/Home/End/Page, typeahead no-op, disabled skip, readonly no-commit, URL invalid/unavailable/noncontiguous/firstDay/selectionAlignment/focused/locale/indian/start-end, RTL flip, and live firstDay/start-end/disabled/readonly/unavailable match. URL visibleMonths=2 names match (#417 disabledDays 18 vs 11). #281 hidden by fixture width 224. #277 not reproduced. No overlay, no form. No D13 RangeCalendar journeys (#249). Did not start #254. Note output/functional-pass/rangecalendar.md.",
    }
  - {
      state: in-progress,
      at: 2026-09-03,
      note: "statuslight outcome equivalent. Isolated default/pointer hover/click/press/wheel, Tab skip, all 19 variant fills, S/M/L/XL, role=status labelable gate, live children/variant/size/role, URL remount, injected form {} match S2. AX text Sync complete / status named StatusLight route label. Geometry 96.98×18, dot 10×10. isDisabled not a prop. No overlay, no form name. No D13 StatusLight journeys (#249). Did not start #254. No new ids. Note output/functional-pass/statuslight.md.",
    }
  - {
      state: in-progress,
      at: 2026-09-03,
      note: "badge outcome equivalent. Isolated default/pointer hover/click/press/wheel, Tab skip, all 25 variant fills including black-text notice/yellow, bold/subtle/outline, S/M/L/XL, wrap/truncate including constrained 72px, icon-start S–XL, live children/variant/fill/size/overflow/icon, URL remount, injected form {} match S2. AX text Published (presentation; fixture ARIA/hidden filtered). Geometry 72×24. isDisabled not a prop. Categorical outline transparent border is shared S2. No overlay, no form name. No D13 Badge journeys (#249). Did not start #254. No new ids. Note output/functional-pass/badge.md.",
    }
  - {
      state: in-progress,
      at: 2026-09-03,
      note: "steplist outcome ticketed. User-visible: click/Enter on a completed step does not select (#427), live isDisabled/isReadOnly/disabledKeys leave Solid selectable (#428), container ArrowDown/Home/End/typeahead stay on #99 (not waived). Default/progress/disabled/readonly/disabledKeys URL remount AX and Tab skip match the hooks oracle. Space no-op both. Live defaultSelectedKey ignored both (uncontrolled). Paint scoped out (no S2 oracle). Control form coverage=gap (#85). No D13 StepList journeys (#249). Did not start #254. Note output/functional-pass/steplist.md.",
    }
  - {
      state: in-progress,
      at: 2026-09-03,
      note: "breadcrumbs outcome ticketed. User-visible: URL overflow remount leaves React at stale tail=0 (#429 harness; live overflow and overflow-narrow-100 match; D6 knownDivergence), disabled Home/Reports stay rgb(80,80,80) (#430). Tab from last menuitem leaves body (#267), wrap from last menuitem stays (#269). Default/pointer Home/Enter/Space/arrows, Tab Before→Home→After, disabled Tab skip + force-click no-op, size L 16px / 503×40, hover rgb(41,41,41), overflow menu select Files/Projects, live size/overflow/disabled/reset, overlay enter 50ms opacity ~0.408 dy 37.6 gap 5.6 and settle 500ms opacity 1 dy 40 gap 8 match. aria-haspopup true vs menu accepted. aria-current=page on Solid current DIV is RAC extra (AX equal). No D13 Breadcrumbs journeys (#249). Did not start #254. Note output/functional-pass/breadcrumbs.md.",
    }
  - {
      state: in-progress,
      at: 2026-09-03,
      note: "avatar outcome equivalent. Isolated default/pointer hover/click/press/wheel, Tab skip, all 13 sizes 16–112, over-background 1px/<64 and 2px/>=64, alt Kai/empty/long, src abraham/missing/javascript/data/empty sanitize, live size/over-background/alt/src/reset, and injected form {} match S2. AX img Avatar, geometry 24×24, opacity 1. URL remount transition-property opacity vs none stays on #240 (settled opacity 1; certified delays fixture). isDisabled not a prop. No overlay, no form name. No D13 Avatar journeys (#249). Did not start #254. No new ids. Note output/functional-pass/avatar.md.",
    }
  - {
      state: in-progress,
      at: 2026-09-03,
      note: "avatargroup outcome equivalent. Isolated default/pointer hover/click/press/wheel, Tab skip, URL and live size 16–40, count 2/3/4, label Reviewers/empty fallback, ariaLabel Team, control-form label+size, combo Reviewers/32/3, injected form {} match S2. AX group Collaborators 123 members + four imgs. Geometry 160×24 overlap −6px. Generated labelledby ids not user-visible. isDisabled not a prop. locale=ar-SA not wired. No overlay, no form name. No D13 AvatarGroup journeys (#249). Did not start #254. No new ids. Note output/functional-pass/avatargroup.md.",
    }
  - {
      state: in-progress,
      at: 2026-09-03,
      note: "image outcome equivalent. Isolated default/pointer hover/click/press/wheel, Tab skip, alt including empty decorative, objectFit cover/contain, sourceMode basic/conditional/error/coordinator, live theme light↔dark on conditional sources, URL and live/control-form remount, forced-colors, injected form {} match S2. AX img Gradient landscape; error text; coordinator two named imgs. Geometry 160×96 wrapper, coordinator grid 328×96. isDisabled not a prop. No overlay, no form name. No D13 Image journeys (#249). Did not start #254. No new ids. Note output/functional-pass/image.md.",
    }
  - {
      state: in-progress,
      at: 2026-09-03,
      note: "inlinealert outcome equivalent. Isolated default/pointer hover/click/press/wheel, Tab skip, all 5 variants × 3 fillStyles, autoFocus tabindex=-1 + isolated 2px ring, URL remount, live variant/fill/autoFocus, injected form {} match S2. AX alert Payment Information / icon Information|Success|Warning|Error. Geometry 472×126 (negative 472×105). isDisabled not a prop. Solid autofocus=\"\" vs React omitted is DOM-only. Shared-page autoFocus last-wins is harness. Notice boldFill white heading is shared S2. No overlay, no form name. No D13 InlineAlert journeys (#249). Did not start #254. No new ids. Note output/functional-pass/inlinealert.md.",
    }
---

Drive the React and Solid panels of every live comparison route through the
same user-visible interactions. Diff DOM, ARIA, focus, form value, overlay
geometry, and behavior after each step. File one bug ticket per real
divergence. Do not treat certified green, axe, or a screenshot as
equivalence.

## Why

#136 recorded this pass as un-ticketed, waiting for the owner's seed. The
owner asked for it on 2026-09-02: component-by-component, outside-world
functional equivalence, bug tickets for each difference. D1–D12 certify
states; D13 covers ComboBox/Picker seeds. This pass walks the rest of the
catalogue the way a user would.

## Order

1. Overlay family (Picker, ComboBox, Menu, ActionMenu, DatePicker,
   DateRangePicker, Popover, Tooltip, Dialog, ContextualHelp) — #243 / #249.
2. Collections (ListBox, ListView, GridList, TableView, TreeView, TagGroup,
   Accordion, Virtualizer, DnD ListBox, CardView).
3. Fields (TextField, TextArea, SearchField, NumberField, DateField,
   TimeField, ColorField, Checkbox, CheckboxGroup, RadioGroup, Switch,
   Slider, RangeSlider, Form).
4. Buttons and chrome (Button, ActionButton, ToggleButton, LinkButton,
   ActionGroup, ButtonGroup, ToggleButtonGroup, ActionBar, Toolbar,
   SegmentedControl).
5. Color and progress.
6. Remaining live slugs.

## Method

For each slug, against production preview (`COMPARISON_CHROMIUM_ARGS` on this
host):

1. Load `/components/<slug>/`, wait for islands-mounted, confirm both panels
   render the real component (not a missing fallback).
2. Exercise default, keyboard, pointer, disabled, and the route controls that
   change user-visible behavior.
3. Diff React vs Solid after each step (D13 observations where the driver
   applies; otherwise roles, names, values, focus, geometry).
4. Classify: `port bug`, `upstream drift`, `harness bug`, `threshold debt`,
   or `unrelated family failure`.
5. File a child of #24 (port bug), #26 (harness), or #136 (gate/audit) — never
   parent a task under this task. Skip filing when an open ticket already
   owns the exact divergence (name it).
6. Record the slug outcome on this ticket. Evidence may live under
   `output/functional-pass/` (gitignored).

Do not implement the ports in this pass unless a one-line harness bug blocks
the next slug. Do not start #254. Do not waive D-reorder (#256) without the
owner.

## Done when

Every live catalogue slug has a recorded outcome (equivalent / ticketed /
blocked with owner). Overlay family is complete. Open divergences have
tickets with a reproduction on the comparison route.

## Relationship

Child of #136 (the audit's functional pass). Uses the D13 driver (#244) and
feeds #243 / #249. Page production-ready is #259. Per-component acceptance
remains #24 — this pass files into it, it does not replace the playbook.
