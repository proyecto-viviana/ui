/**
 * Solid 2 ref assignment.
 *
 * `Ref<T>` is `T | ((val: T) => void) | undefined | Ref<T>[]`. JSX
 * `ref={local.ref}` compiles as a property write (`local.ref = el`) when
 * `local` is an object, so getter-only splitProps/mergeProps bags need a
 * setter that forwards to the live callback / array / `{ current }`.
 */

import { createEffect, createSignal, onSettled } from "solid-js";
import type { Accessor } from "solid-js";

export type RefLike<T> = T | ((el: T) => void) | { current?: T | null } | undefined | RefLike<T>[];

/**
 * Track a ref accessor that may close over a plain `let` assigned during
 * insert. `createEffect(() => ref())` runs once with `null` and never
 * re-runs; `onSettled` picks the element up after commit.
 */
export function followRef<T>(ref: Accessor<T | null | undefined>): Accessor<T | null | undefined> {
  // The computed initializer owns the initial ref read. Seeding undefined and
  // then reading through a setter instead makes nested ref followers read a
  // stale hydration snapshot in their caller's owner, rebuilding its children
  // when hydration completes.
  const [el, setEl] = createSignal<T | null | undefined>(() => ref(), {
    ownedWrite: true,
  });
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
