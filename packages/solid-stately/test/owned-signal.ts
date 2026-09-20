/**
 * Test-owned signals are written from inside `createRoot` (controlled-prop
 * getters). Solid 2 throws on those writes unless the signal opts in.
 */
import { createSignal as createSolidSignal } from "solid-js";
import type { Signal, SignalOptions } from "solid-js";

export function createSignal<T>(): Signal<T | undefined>;
export function createSignal<T>(value: Exclude<T, Function>, options?: SignalOptions<T>): Signal<T>;
export function createSignal<T>(
  value?: Exclude<T, Function>,
  options?: SignalOptions<T>,
): Signal<T> | Signal<T | undefined> {
  if (arguments.length === 0) {
    return createSolidSignal(undefined, { ownedWrite: true }) as Signal<T | undefined>;
  }
  return createSolidSignal(value as Exclude<T, Function>, {
    ...options,
    ownedWrite: true,
  });
}
