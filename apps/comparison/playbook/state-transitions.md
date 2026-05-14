# State Transitions And Timelines

State transitions are first-class parity targets. Do not accept a component
because its settled default screenshot looks close.

## Model

For each state change, write the timeline:

| Step      | What to record                                                                                                    |
| --------- | ----------------------------------------------------------------------------------------------------------------- |
| Before    | DOM, ARIA, data attributes, focus, geometry, and computed styles before the event.                                |
| Trigger   | The exact user action or prop change: pointer move, pointer down, key, click, control update, timer, async state. |
| Immediate | Synchronous state after the event handler runs.                                                                   |
| Transient | Animation, delayed spinner, pressed transform, entering/exiting attributes, hover frame, loading delay.           |
| Settled   | Final open/closed/selected/committed state.                                                                       |
| Cleanup   | Focus return, timers cleared, press state cleared, portal unmounted, aria-hidden restored.                        |

## Required Transition Families

- Hover enter and hover exit.
- Pointer down, pressed frame, pointer up, and press action.
- Press cancellation on scroll, pointer leave, disabled transition, and unmount.
- Screen-reader virtual-click activation where upstream handles it.
- Keyboard focus-visible enter and blur/clear.
- Open request, portal mount, entering animation, settled open, dismiss request,
  exiting animation, unmount, and focus return.
- Selection or value commit, including input text, selected key, form value, and
  display text updates.
- Loading delay, spinner appearance, loading-more row, empty state, and loading
  cleanup.
- Calendar paging and date selection timelines for date/time components.
- Drag start, drag preview, drop indicator movement, drop activation, and drag
  cleanup.
- Resize and measurement changes, including column resize, trigger-width
  measurement, tag overflow, responsive row counts, and virtualizer
  recalculation.
- Sorting transitions, including sort menu/trigger activation, sort direction
  change, icon change, row order update, and aria sort state.
- Edit/save transitions, including edit mode entry, autofocus/text selection,
  cancel, submit, saving/pending state, and overlay cleanup.
- Overflow and collapse transitions, including show-more/show-less controls,
  disclosure expansion, accordion expansion, tree row expansion, and chevron
  rotation.
- Continuous progress transitions, including determinate value changes,
  indeterminate animation, paused/completed states, and static-color branches.
- Skeleton, media, and image transitions, including placeholder render, loaded
  content, error/fallback, and layout stability.
- Responsive mode transitions, including desktop popover vs mobile modal paths,
  hover-capable vs touch-only affordances, and viewport-driven layout changes.

## Examples

Button:

- default -> pointer hover -> hover visual state -> pointer down -> press scale
  -> pointer up -> action fires -> press scale clears.
- default -> keyboard tab -> focus-visible ring -> Enter or Space -> action
  fires -> focus remains correct.
- pending false -> pending true -> immediate disabled/press suppression ->
  delayed spinner -> pending false -> spinner removed.

DatePicker:

- closed field -> trigger press -> popover portal mounts -> calendar entering
  state -> settled open grid -> Escape -> popover closes -> focus returns to the
  trigger.
- open calendar -> next-month press -> heading changes -> grid cells update ->
  unavailable/outside-month state remains correct.
- open calendar -> date selection -> value commits -> hidden input updates ->
  popover dismisses -> focus and description text settle.

Other component families:

- TableView: unsorted -> sort ascending -> sort icon and row order update ->
  sort descending -> aria sort state updates; normal column -> resize handle
  focus -> resizing frame -> committed width -> resize affordance clears.
- TagGroup: full tag list -> container resize or `maxRows` change -> collapsed
  visible tag count -> show-all control -> expanded list -> collapse cleanup.
- ProgressBar/ProgressCircle: determinate value update -> fill geometry changes;
  indeterminate true -> animation starts -> indeterminate false -> animation
  stops and determinate geometry settles.
- Tooltip: trigger hover/focus -> open delay -> entering frame -> settled
  tooltip -> leave/blur -> close delay -> unmount and aria cleanup.

## Discovery

Do not rely on this list alone. For each component, derive its transition
inventory from upstream source and docs:

```bash
rg -n "is[A-Z]|has[A-Z]|allows[A-Z]|loadingState|selected|expanded|open|pressed|hover|focus|drag|drop|resize|sort|pending|entering|exiting|transition|animation|setTimeout|requestAnimationFrame|useEffect|useState|onResize|onOpenChange|onSelectionChange|onInputChange|onHover|onPress|onKey|onFocus|onBlur|onDrag|onDrop|onSort" \
  apps/comparison/node_modules/@react-spectrum/s2/src/<Component>.tsx
```

Every stateful prop, render prop, effect, timer, measurement hook, event handler,
and style condition found by that scan should either become a tested transition
or be explicitly marked not applicable for the Solid port.

## Test Rules

- Use real Playwright pointer and keyboard events for hover, press, focus,
  open, close, and selection. Do not simulate these only by setting props.
- Assert both React and Solid timelines where the transition is a parity target.
- For prop/state dependencies, prefer delta tests: capture React and Solid
  baseline contracts, toggle one source input, and compare that the affected
  subpart changed the same way on both sides.
- For animation, sample at least one transient frame and one settled frame.
- For delayed state, use controlled waits tied to the upstream delay rather than
  arbitrary long sleeps.
- For cleanup, assert absence as well as presence: no stale pressed state, no
  stale portal, no stale `aria-hidden`, no stale scroll lock, no stale timers,
  no global listeners, no inactive focus.
- Prefer semantic assertions plus computed styles. Screenshots alone miss the
  event edge that caused many previous regressions.
