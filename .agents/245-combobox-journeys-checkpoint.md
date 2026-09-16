# #245 checkpoint

Owner-stop. Ticket stays in-progress. Not verified.

## Shipped

Solid ComboBox fixture protocol on the HEAD tree (direct child, sentinel
Show siblings, items/defaultItems getters, none key, event log, optional
flags). React onLoadMore gated on loadingState. CB-OC-01..08 authored;
only CB-OC-02 registered. D13 seeds 2/2 and CB-OC-02 green on :4323.
Fixture-form unit 6/6.

## Left

- Two ComboBox + Show for live defaultItems without wrapping the certified
  field; then register CB-OC-03.
- Ticket Solid event-order and readonly/disabled ARIA under #136; then
  register CB-OC-01/04/05/08 and CB-OC-06/07.
- Solid withForm / layout without wrapping the default ComboBox.
- Do not start #246/#249/#254. Overlay remainder owner-gated.

## Read first

1. `.claude/tickets/tasks/245-author-combobox-journeys-from-the-upstream-suites.md`
2. `apps/comparison/e2e/journeys/combobox.ts`
3. `apps/comparison/src/components/solid/fixtures/styled/combobox.tsx`
4. `apps/comparison/playbook/journeys/combobox.md`
