# Interactions And Motion

Interaction parity covers hover, press, drag, focus-visible, delayed state,
animation, and transient frames. See
[State Transitions And Timelines](./state-transitions.md) for the required
before/trigger/transient/settled/cleanup model.

## Animation Checks

| Type                       | How to verify                                                       |
| -------------------------- | ------------------------------------------------------------------- |
| Press scale                | Inspect transform during pointer down and after release.            |
| Overlay enter/exit         | Assert entry/exit attributes plus opacity/transform transition.     |
| Selection indicator motion | Assert transform or position changes and transition property.       |
| Loading spinner            | Assert delayed render and animation property.                       |
| Switch/thumb movement      | Assert transform before and after toggle.                           |
| Focus ring                 | Assert visible after keyboard focus and absent after pointer focus. |

## Interaction Checks

- Mouse, keyboard, touch, and screen-reader virtual-click activation paths are
  separate checks where upstream supports them.
- Hover state uses pointer-capable hover only where upstream does.
- Touch input does not trigger emulated hover when upstream suppresses it.
- Hover exit clears visual state and data attributes when the pointer leaves.
- Press state clears when an overlay opens if upstream suppresses sticky press.
- Press state includes the down frame, the up frame, action dispatch, and
  cancellation paths.
- Press cancellation on scroll, pointer leave, disabled transition, and unmount
  matches upstream.
- Text selection is suppressed only during press interactions where upstream
  suppresses it.
- Touch paths and mouse paths match upstream separately.
- Consumer `onPress`, `onPressStart`, `onPressEnd`, `onPressChange`,
  `onPressUp`, `onHoverStart`, `onHoverEnd`, and `onHoverChange` callbacks fire
  in upstream order with upstream event payloads where applicable.
- Drag and drop exposes drag preview, drop indicator, keyboard DnD, and allowed
  operation state where applicable.
- Loading and filtering delays match upstream timing.

## Tests

Use Playwright for transient states. Static screenshots taken after interaction
settles are not enough for press, hover, open/close, animation, or delayed
loading state.
