/**
 * Solid 2 owner guards. `useContext` throws when there is no reactive root,
 * even if the context has a default — hook factories (and tests) call
 * `createFormValidationState` outside a component.
 */

import { getOwner, useContext } from "solid-js";
import type { Context } from "solid-js";

/** Read context, or the context default, when called with no owner. */
export function useContextOptional<T>(context: Context<T>): T {
  if (!getOwner()) {
    return context.defaultValue as T;
  }
  try {
    return useContext(context);
  } catch {
    return context.defaultValue as T;
  }
}
