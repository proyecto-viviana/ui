/**
 * Solid 2 owner guards for hooks that tests historically call outside a
 * component (`createButton()` at `it()` top-level).
 *
 * `useContext` throws `NoOwnerError` when `getOwner()` is null, even if the
 * context has a default. `onCleanup` without an owner logs `[NO_OWNER_CLEANUP]`
 * and never runs.
 */

import { getOwner, onCleanup, useContext } from "solid-js";
import type { Context } from "solid-js";

/** Read context, or the context default, when called with no owner. */
export function useContextOptional<T>(context: Context<T>): T | undefined {
  if (!getOwner()) {
    return context.defaultValue;
  }
  return useContext(context);
}

/** Register cleanup only when an owner can dispose it. */
export function onOwnedCleanup(fn: () => void): void {
  if (getOwner()) {
    onCleanup(fn);
  }
}
