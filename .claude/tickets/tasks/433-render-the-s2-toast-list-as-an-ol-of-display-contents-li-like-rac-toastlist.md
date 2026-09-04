---
id: 433
type: task
title: "Render the S2 Toast list as an ol of display-contents li like RAC ToastList"
created: 2026-09-03
parent: 24
status: open
history:
  - {
      state: open,
      at: 2026-09-03,
      note: "filed from the #260 toast functional pass: RAC ToastList is ol > li[display:contents] > alertdialog, so Chromium AX is region > list > listitem > alertdialog. Solid Spectrum ToastRegion uses a div[data-solid-spectrum-toast-list] and solidaria-components exports ToastRegion as UNSTABLE_ToastList (alias, not a list). AX is region > alertdialog with no list/listitem. Visual layout matches because li is display:contents. Certified D6 snapshots the alertdialog subtree only, so this missed the gate",
    }
---

RAC `ToastList` is an `<ol>` of `<li style="display:contents">`
wrapping each toast. S2 Toast uses that list. Solid Spectrum Toast
renders a `<div data-solid-spectrum-toast-list>` and maps toasts
directly. `solidaria-components` exports `ToastRegion as
UNSTABLE_ToastList` — an alias, not a list.

Chromium AX therefore reports `list` / `listitem` under the
Notifications region on React and omits both on Solid. The
`alertdialog` / `alert` / Dismiss subtree matches. `li` is
`display:contents`, so settled geometry of a single toast is
identical; the miss is the list roles AT walks.

Certified D6 (`toast.certified.spec.ts`) snapshots the alertdialog
subtree, not the region list wrapper.

## Evidence

`http://127.0.0.1:4341/components/toast/`, islands mounted, isolated
`?activeSide=` per stack, one Neutral toast:

React region AX:

```
- region "Notifications":
  - list:
    - listitem:
      - alertdialog "Toast available":
        - alert: Toast available
        - button "Dismiss":
          - img
```

Solid region AX:

```
- region "Notifications":
  - alertdialog "Toast available":
    - alert: Toast available
    - button "Dismiss":
      - img
```

Collapsed stack of 3: React `list` with three `listitem` (two empty
while collapsed); Solid three `alertdialog` siblings, no list.
Expanded: React three listitems each with an alertdialog; Solid three
alertdialogs directly under the region.

RAC (`react-aria-components` `Toast.tsx` ToastList):

```tsx
<dom.ol …>
  {state.visibleToasts.map(toast => (
    <li key={toast.key} style={{display: 'contents'}}>
      {props.children({toast})}
    </li>
  ))}
</dom.ol>
```

Solid (`packages/solid-spectrum/src/toast/index.tsx` ~796–819): a
`div` with `data-solid-spectrum-toast-list` and a `For` of `Toast`.

## Repro

1. Open `http://127.0.0.1:4341/components/toast/?activeSide=react`.
2. Wait for `data-islands-mounted="true"`.
3. Click Show Neutral Toast. AX the `[role=region][aria-label=Notifications]`
   host: `list` / `listitem` wrap the alertdialog.
4. Repeat with `?activeSide=solid`: the same region has no list /
   listitem.

## Done when

Solid S2 Toast list DOM matches RAC ToastList: `ol` of
`li[style=display:contents]` wrapping each `alertdialog`, so the
region AX includes `list` / `listitem` on the comparison route. A
walk fails if the region AX has alertdialogs with no list. Single-toast
geometry must stay 155×56. Do not start #254.

## Relationship

Child of #24. Found by #260. Headless `UNSTABLE_ToastList` is
currently an alias of `ToastRegion`
(`packages/solidaria-components/src/index.ts`). Not #11 (title slot).
Not certified D6 (alertdialog subtree already matches). Do not start
#254.
