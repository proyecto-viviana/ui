/**
 * Reactivity utilities for Solid Stately
 *
 * Provides type-safe utilities for working with SolidJS reactivity patterns.
 */

import { Accessor, createSignal, getObserver } from "solid-js";
import type { Signal, SignalOptions } from "solid-js";

/**
 * A value that may be either a raw value or an accessor function.
 * This is a common pattern in SolidJS for props that may be reactive.
 */
export type MaybeAccessor<T> = T | Accessor<T>;

/**
 * Unwraps a MaybeAccessor to get the underlying value.
 * If the input is a function, it calls it to get the value.
 * Otherwise, it returns the value directly.
 *
 * @param value - The value or accessor to unwrap.
 */
export function access<T>(value: MaybeAccessor<T>): T {
  return typeof value === "function" ? (value as Accessor<T>)() : value;
}

/**
 * A value that may be undefined or an accessor that returns the value or undefined.
 */
export type MaybeAccessorValue<T> = T | undefined | Accessor<T | undefined>;

/**
 * Checks if a value is an accessor function.
 */
export function isAccessor<T>(value: MaybeAccessor<T>): value is Accessor<T> {
  return typeof value === "function";
}

/**
 * Headless state is written from factory setup and from public setters that
 * tests (and some call sites) invoke inside `createRoot` / a component body.
 * Solid 2 throws on those writes unless the signal opts into `ownedWrite`.
 *
 * Solid 2 also hides unflushed writes from both default reads (unowned /
 * committed snapshot) and `latest()` (A28: flush first to read your own
 * write). Headless methods chain read-then-write in the same turn, so the
 * getter returns a live mirror and still reads the signal for tracking.
 */
export function createInternalSignal<T>(value: T, options?: SignalOptions<T>): Signal<T> {
  let live = value;
  // Solid's createSignal overloads exclude Function so a function value is a
  // writable memo. Headless state holds dates, sets, and tokens — cast through.
  const [get, set] = createSignal(value as never, {
    ...options,
    ownedWrite: true,
  }) as Signal<T>;
  const read = (() => {
    // Track only inside a tracking scope (JSX / memo / effect compute).
    // Calling the signal from an effect apply or unowned method is a
    // STRICT_READ_UNTRACKED diagnostic; the live mirror is the value.
    if (getObserver()) get();
    return live;
  }) as typeof get;
  const write = ((next: T | ((prev: T) => T)) => {
    const resolved = typeof next === "function" ? (next as (prev: T) => T)(live) : next;
    live = resolved;
    (set as (v: T) => T)(resolved);
    return resolved;
  }) as typeof set;
  return [read, write];
}

/**
 * Same-turn read of a headless accessor. `createInternalSignal` getters
 * already return the live mirror; this is for call sites that used to wrap
 * `latest()` (which does not see unflushed writes in Solid 2 rc.9).
 */
export function readNow<T>(accessor: Accessor<T>): T {
  return accessor();
}
