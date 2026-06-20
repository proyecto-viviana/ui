/**
 * Keyboard / modifier-key helpers.
 * Based on @react-aria/utils' keyboard utilities.
 */

import { isMac } from "./platform";

/** The modifier-key fields consulted by {@link isCtrlKeyPressed}. */
interface ModifierKeyEvent {
  ctrlKey?: boolean;
  metaKey?: boolean;
}

/**
 * Returns whether the platform's non-contiguous selection modifier is pressed:
 * the Command key on macOS, the Control key elsewhere. Mirrors
 * `@react-aria/utils`' `isCtrlKeyPressed`.
 */
export function isCtrlKeyPressed(e: ModifierKeyEvent): boolean {
  if (isMac()) {
    return e.metaKey === true;
  }

  return e.ctrlKey === true;
}
