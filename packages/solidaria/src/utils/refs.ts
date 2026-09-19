/**
 * Solid 2 ref assignment.
 *
 * `Ref<T>` is `T | ((val: T) => void) | undefined | Ref<T>[]`. JSX
 * `ref={local.ref}` compiles as a property write (`local.ref = el`) when
 * `local` is an object, so getter-only splitProps/mergeProps bags need a
 * setter that forwards to the live callback / array / `{ current }`.
 */

import { createEffect, createSignal, onSettled } from "solid-js";
import type { Accessor, Signal } from "solid-js";

export type RefLike<T> = T | ((el: T) => void) | { current?: T | null } | undefined | RefLike<T>[];

/**
 * Track a ref accessor that may close over a plain `let` assigned during
 * insert. `createEffect(() => ref())` runs once with `null` and never
 * re-runs; `onSettled` picks the element up after commit.
 */
export function followRef<T>(
  ref: Accessor<T | null | undefined>,
): Accessor<T | null | undefined> {
  // Solid 2 treats a function initial value as a compute fn. Seed with
  // `undefined` and write the live ref through the setter.
  const [el, setEl] = createSignal(undefined as never, {
    ownedWrite: true,
  }) as unknown as Signal<T | null | undefined>;
  setEl(() => ref());
  createEffect(
    () => ref(),
    (node) => {
      setEl(() => node);
    },
  );
  onSettled(() => {
    setEl(() => ref());
  });
  return el;
}

export function assignRef<T>(ref: RefLike<T> | unknown, el: T): void {
  if (ref == null) return;
  if (typeof ref === "function") {
    (ref as (value: T) => void)(el);
    return;
  }
  if (Array.isArray(ref)) {
    for (const item of ref) assignRef(item, el);
    return;
  }
  if (typeof ref === "object" && "current" in (ref as object)) {
    (ref as { current?: T | null }).current = el;
  }
}
