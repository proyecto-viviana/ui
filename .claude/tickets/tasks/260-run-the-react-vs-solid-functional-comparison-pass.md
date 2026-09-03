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
