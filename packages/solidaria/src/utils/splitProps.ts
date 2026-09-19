/**
 * Solid 1 `splitProps` replacement built on Solid 2 `omit`.
 *
 * `omit` only returns the rest object. Call sites still need a reactive
 * picked view (`local.class`, `local.children`) that re-reads `props` on
 * each access — a plain destructure would freeze values. Each picked group
 * is a getter proxy over the original props object.
 */

import { omit } from "solid-js";
import { assignRef } from "./refs";

export function splitProps<T extends object, const K extends readonly (keyof T)[]>(
  props: T,
  keys: K,
): [picked: Pick<T, K[number]>, rest: Omit<T, K[number]>];
export function splitProps<
  T extends object,
  const K1 extends readonly (keyof T)[],
  const K2 extends readonly (keyof T)[],
>(
  props: T,
  keys1: K1,
  keys2: K2,
): [Pick<T, K1[number]>, Pick<T, K2[number]>, Omit<T, K1[number] | K2[number]>];
export function splitProps<
  T extends object,
  const K1 extends readonly (keyof T)[],
  const K2 extends readonly (keyof T)[],
  const K3 extends readonly (keyof T)[],
>(
  props: T,
  keys1: K1,
  keys2: K2,
  keys3: K3,
): [
  Pick<T, K1[number]>,
  Pick<T, K2[number]>,
  Pick<T, K3[number]>,
  Omit<T, K1[number] | K2[number] | K3[number]>,
];
export function splitProps<T extends object>(
  props: T,
  ...keyGroups: readonly (readonly (keyof T)[])[]
): object[] {
  const used: (keyof T)[] = [];
  const parts: object[] = [];
  for (const keys of keyGroups) {
    const picked: Record<PropertyKey, unknown> = {};
    for (const key of keys) {
      used.push(key);
      const descriptor: PropertyDescriptor = {
        enumerable: true,
        configurable: true,
        get: () => props[key],
      };
      // Solid 2 compiles `ref={local.ref}` as `local.ref = el`. A getter-only
      // pick would throw; forward the write to the live ref instead.
      if (key === "ref") {
        descriptor.set = (el: unknown) => {
          assignRef(props[key], el as never);
        };
      }
      Object.defineProperty(picked, key, descriptor);
    }
    parts.push(picked);
  }
  parts.push(omit(props, ...(used as (keyof T)[])));
  return parts;
}
