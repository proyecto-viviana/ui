---
id: 653
type: task
title: "Decide the D26 extensions past S2"
created: 2026-10-12
parent: 24
status: merged
history:
  - {
      state: open,
      at: 2026-10-12,
      note: "Follow-up of #641: five VisualMode D26 requests match pinned S2 and need an owner choice before any public name exists.",
    }
  - {
      state: merged,
      at: 2026-10-12,
      note: "Owner took every recommendation: the ui DropZone declares isDisabled, the other four requests are declined.",
    }
---

## Scope

#641 found that five D26 requests are not parity gaps. Each is a new public
name or behavior past pinned S2, so the owner chooses. One recommendation
each:

| Request                                               | Pinned S2                                      | Recommendation                                                                                                   |
| ----------------------------------------------------- | ---------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| Styled `DropZone` takes `isDisabled`                  | Omits it; the headless DropZone has it         | Add it to `@proyecto-viviana/ui` DropZone only, forwarded to the headless prop. `solid-spectrum` stays a mirror. |
| `DropZone` padding other than 24                      | Fixed at 24                                    | Decline. A caller overrides through `styles`.                                                                    |
| `Button` declares `title`                             | Not declared; `GlobalDOMAttributes` is omitted | Decline. A hover label is a `TooltipTrigger`; `title` is not announced reliably.                                 |
| `AlertDialog` stays open until its action settles     | Closes, then calls the action                  | Decline for AlertDialog. A confirm that shows a result is a `Dialog` with its own buttons.                       |
| Standalone `Card` without `id`, with a selected state | `id` required; selection belongs to CardView   | Decline. Selection outside a collection has no keyboard model upstream.                                          |

No source change belongs to this ticket until the owner answers. No
dependency, no change to `solid-spectrum`.

## Done when

Each row has the owner's answer recorded here. An accepted row has its own
task with tests; a declined row names what VisualMode uses instead.

## Proof

None until a row is accepted. Then: owning tests and a type assertion for the
new prop in the styled package that gains it, and a patch Changeset.

## Relationship

Child of #24. Follow-up of #641. Producer for VisualMode #10151, #10153 and
#10154. Request:
`visualmode/visualmode/.agents/ui-requests-2026-10-07/D26-button-card-dropzone-and-alertdialog-lack-caller-props.md`.

## Owner answers — 2026-10-12

| Request                                               | Answer                                                                       | What VisualMode uses               |
| ----------------------------------------------------- | ---------------------------------------------------------------------------- | ---------------------------------- |
| Styled `DropZone` takes `isDisabled`                  | Accepted, `@proyecto-viviana/ui` only                                        | `<DropZone isDisabled>`            |
| `DropZone` padding other than 24                      | Declined: S2 fixes it, and one-off spacing is what `styles` is for           | The `styles` prop                  |
| `Button` declares `title`                             | Declined: S2 omits it and a `title` is not announced reliably                | `TooltipTrigger` around the Button |
| `AlertDialog` stays open until its action settles     | Declined: S2 closes first, and a confirm that shows a result is not an alert | A `Dialog` with its own buttons    |
| Standalone `Card` without `id`, with a selected state | Declined: selection has no keyboard model outside a collection               | A Card inside a `CardView`         |

The ui DropZone already forwarded the prop at run time; its type omitted it.
`packages/viviana-ui/src/dropzone/index.tsx` now declares `isDisabled`.
`packages/viviana-ui/test/DropZone.test.tsx`: a disabled DropZone has a
disabled hidden button and ignores a drop, and takes the drop once its signal
enables it. Patch Changeset `.changeset/ui-dropzone-is-disabled.md`.

```bash
vp test run packages/viviana-ui/test/DropZone.test.tsx
```
