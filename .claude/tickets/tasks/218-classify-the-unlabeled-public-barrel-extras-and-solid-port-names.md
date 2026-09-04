---
id: 218
type: task
title: "Classify the unlabeled public-barrel extras and Solid port names"
created: 2026-09-01
parent: 136
status: verified
history:
  - { state: open, at: 2026-09-01, note: "opened from the 2026-09 full-repo audit, round 2" }
  - {
      state: verified,
      at: 2026-09-01,
      note: "owner decided all five items; recorded on the ticket and in architecture.md; follow-ups #221 #222 #223 #224 filed and listed on #33",
    }
---

## Cause

Rule #2 allows a Solid-specific export with no upstream counterpart only
when it is explicit and documented as a local addition. Several published
names are neither, and they are owner-steered (Rule #3), so this ticket
frames the decisions rather than prescribing them:

1. S2-barrel extras (`packages/solid-spectrum/src/index.ts`): `Select` beside
   `Picker`; `ListBox` / `Toolbar` (unexported RAC wrappers in S2 `src/`);
   `ActionGroup` (file says S2 ships none); `StepList`, `Flex`, `Grid`
   (v3 ports); `Separator` beside `Divider`; RAC `Table` / `Tree` / `Toast` /
   `addToast` beside `TableView` / `TreeView` / `ToastContainer`. 168 extras
   pass `guard:rac-export-gap` by design. #33's done-when has no inventory.
2. `MenuButton` (styled and headless): source comment calls it a Viviana
   convenience; no public label (`packages/solid-spectrum/src/menu/index.tsx:200-204`).
3. `@proyecto-viviana/ui` barrel still exports `Well`, thirty-odd `Pixel*`
   icons, `typeRoles`, `meshStrip` while `architecture.md:81-83` says no
   viviana-native names are on the barrel until the owner reopens that
   surface (#62 / #145).
4. Canonical item names: SAC canonical `ListBoxOption` / `ComboBoxOption`
   with RAC names as aliases; styled `SelectTrigger` / `SelectListBox` /
   `SelectOption` have no RAC value counterpart.
5. `class` vs RAC `className` is the Solid port everywhere and is recorded
   nowhere next to the barrels.

## Work

Owner decides each: keep-and-label, keep-and-rename, or remove. Then the
inventory becomes #33's checklist and the labels land in barrel comments and
the generated reference.

## Decision (owner, 2026-09-01)

1. The `@proyecto-viviana/solid-spectrum` barrel equals S2's
   `exports/index.ts`, guarded. Extras with no consumer are deleted; extras
   the product uses move to `@proyecto-viviana/ui`, the owner-ratified
   additions package. The inventory of what the product imports is the first
   step of that work.
2. `MenuButton` leaves `solid-spectrum` and `solidaria-components`; it stays
   in `@proyecto-viviana/ui` only if the product uses it.
3. `architecture.md` records the intent: `Well`, the `Pixel*` icons,
   `typeRoles`, and `meshStrip` come off the `@proyecto-viviana/ui` barrel
   until #62 reopens the viviana-native surface deliberately.
4. Upstream item names are canonical (`ListBoxItem`, `ComboBoxItem`,
   `PickerItem`); `ListBoxOption` / `ComboBoxOption` become deprecated
   aliases with a named removal release. The styled `Select*` names fall
   under item 1.
5. `class` only, as the one systematic port rule; recorded once in
   `architecture.md` and the generated API reference. `className` is not
   accepted.

## Done when

Every name above has a recorded decision; `architecture.md` matches the VU
barrel; #33 lists the resulting work.

## Relationship

F-API-001/002/004/011, F-UP-012. Owner-decision. Not #9 (TabSwitch).
