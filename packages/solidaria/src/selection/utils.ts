/**
 * Selection helpers shared across collection item hooks.
 * Based on @react-aria/selection's utilities.
 */

import { isAppleDevice } from "../utils/platform";

/** The modifier-key fields consulted by {@link isNonContiguousSelectionModifier}. */
interface ModifierKeyEvent {
  altKey?: boolean;
  ctrlKey?: boolean;
}

/**
 * Returns whether the modifier for non-contiguous (toggle) keyboard selection
 * is pressed. Mirrors `@react-aria/selection`'s `isNonContiguousSelectionModifier`:
 * Ctrl + Arrow Up/Down has a system-wide meaning on macOS, so Apple devices use
 * Alt instead; Windows and Ubuntu use Ctrl.
 */
export function isNonContiguousSelectionModifier(e: ModifierKeyEvent): boolean {
  return isAppleDevice() ? e.altKey === true : e.ctrlKey === true;
}
