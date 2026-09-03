---
id: 370
type: task
title: "Format ColorField hex values in uppercase"
created: 2026-09-03
parent: 24
status: open
history:
  - {
      state: open,
      at: 2026-09-03,
      note: "filed from the #260 colorfield functional pass: after ArrowUp React input #33669A, Solid #33669a; Enter commit of #ff0000 paints #FF0000 vs #ff0000; URL defaultValue=#ff00ff mounts #FF00FF vs #ff00ff. Same color, different displayed casing. RAC addColorValue uppercases; Solid Color.toString('hex') is lowercase. #237 noted this on the Enter-commit land",
    }
---

S2 ColorField displays committed hex in uppercase (`#FF0000`).
Solid displays lowercase (`#ff0000`). The parsed color matches;
the text the user sees, copies, and hears does not.

RAC `useColorFieldState` `addColorValue` writes
`#${clampInt.toString(16).padStart(6, "0").toUpperCase()}` and
`toString("hex")` stays uppercase. Solid
`createColorFieldState` `formatColorValue` uses
`displayColor.toString("hex")`, which emits lowercase.

## Evidence

`http://127.0.0.1:4341/components/colorfield/`, islands mounted,
one panel at a time.

| | React | Solid |
|---|---|---|
| rest `#336699` | `#336699` | `#336699` |
| ArrowUp | `#33669A` | `#33669a` |
| type `#ff0000` + Enter | `#FF0000` | `#ff0000` |
| `?valueSource=defaultValue&defaultValue=%23ff00ff` | `#FF00FF` | `#ff00ff` |

AX snapshots differ only in that hex text.

## Done when

Committed hex on the comparison-route ColorField matches S2
uppercase. A walk fails if ArrowUp from `#336699` leaves
`#33669a` in the Solid input.

## Relationship

Child of #24. Found by #260. Wiring is
`packages/solid-stately/src/color/Color.ts` `toString("hex")` /
`createColorFieldState` `formatColorValue`. Noted on the #237
Enter-commit land; that ticket is the shortcut, not the casing.
Do not start #254.
