/**
 * Upstream answers an overlay option's `isFocusVisible` once, from the global
 * interaction modality — `useOption` returns `isFocused &&
 * selectionManager.isFocused && isFocusVisible()` — and RAC `ListBoxItem` hands
 * that one value to every render-prop consumer, row and checkmark alike
 * (`@react-spectrum/s2` `ComboBox.tsx:470,505-512`, `Menu.tsx:252-256`).
 *
 * Ours computes the same expression (`@proyecto-viviana/solidaria`
 * `createOption.ts:242`) and, under a keyboard open, reaches the same answer:
 * `ListBox` mirrors the focused key onto the option with `moveVirtualFocus`,
 * whose synthetic focus event arms the option's `createFocusRing()`. The
 * modality read is where we part. `createInteractionModality.ts:113-115` opens
 * `handleClickEvent` with `if (!e.isTrusted) return;`, which react-aria's
 * `useFocusVisible` has not; so for the `detail: 0` click an assistive
 * technology sends — and the click the certified pair oracle dispatches —
 * upstream moves to `virtual` modality and is focus-visible, while ours stays
 * in `pointer` and is not. The row ink and the selected checkmark then sit one
 * `baseColor` stop below S2, which is #497.
 *
 * This restores upstream's answer for the two styled overlay lists that hit it,
 * `combobox` and `picker`, until #612 removes that guard and retires both call
 * sites. Writing upstream's expression verbatim here would change nothing: it
 * is what `createOption` already returns.
 *
 * Known divergence while this stands, and the reason #612 is the real fix: an
 * option focused by a real mouse — a trusted click, where upstream stays in
 * `pointer` modality — takes the `focusRing()` outline and the lifted ink that
 * upstream withholds. The ink does not move on hover alone: `isHovered`,
 * `isFocusVisible` and `isPressed` all resolve through the same
 * `nextColorStop` (`style/spectrum-theme.ts`, as S2 does), so the divergence is
 * the outline, plus the lifted stop a mouse-focused row keeps once the pointer
 * has left it. `.claude/current/certification-debt.md` carries the entry, and
 * the DOM's `data-focus-visible` still reports the uncorrected answer.
 */
export function optionFocusVisible<T extends { isFocused: boolean; isFocusVisible: boolean }>(
  renderProps: T,
): T {
  return { ...renderProps, isFocusVisible: renderProps.isFocusVisible || renderProps.isFocused };
}
