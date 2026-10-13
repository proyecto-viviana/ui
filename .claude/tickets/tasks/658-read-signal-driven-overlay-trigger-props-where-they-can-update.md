---
id: 658
type: task
title: "Read signal-driven overlay trigger props where they can update"
created: 2026-10-13
parent: 531
status: open
history:
  - {
      state: open,
      at: 2026-10-13,
      note: "Found while rebuilding the #651 probe page as a test: a signal-driven isOpen on MenuTrigger and signal-driven TooltipTrigger props still report STRICT_READ_UNTRACKED.",
    }
---

## Cause

The #651 probe page gave its three triggers static props, so it never
measured them. With `@proyecto-viviana/ui` at `main` on 2026-10-13, in jsdom:

```tsx
const [on, setOn] = createSignal(false);

<MenuTrigger isOpen={on()}>
  <ActionButton>More</ActionButton>
  <Menu aria-label="More">
    <MenuItem id="copy">Copy</MenuItem>
  </Menu>
</MenuTrigger>;
// 8 reports at mount: 4 in <PopoverTriggerContext>, 4 in <ActionButton>

<TooltipTrigger isDisabled={on()} isOpen={!on()}>
  <ActionButton>Help</ActionButton>
  <Tooltip>Hint</Tooltip>
</TooltipTrigger>;
// 6 reports at mount: 1 in <TooltipTrigger>, 3 in <Tooltip>, 2 in <TooltipContent>
```

`<DialogTrigger isOpen={on()}>` reports nothing. Both reporting triggers still
follow the signal: the menu opens when `on` turns true, and the tooltip closes
when it is disabled. Which reads are deliberate one-time reads and which hide a
stale value was not established.

## Scope

Find each read, by owner, lowest first, and move it into a tracking scope or
mark a deliberate one-time read, under the #651 rules: no blanket `untrack`
around a component body, no new public name, no dependency.

## Done when

Both snippets mount with no `STRICT_READ_UNTRACKED` report, and each prop still
updates the DOM when its signal changes.

## Proof

Cases beside the #651 ones, in `packages/viviana-ui/test/Provider.test.tsx` or
`packages/solidaria-components/test/reactive-props.test.tsx` by owner, failing
before the repair.

## Relationship

Child of #531. Follows #651.
