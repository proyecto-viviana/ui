/**
 * Reactivity utilities for Solidaria
 *
 * Provides type-safe utilities for working with SolidJS reactivity patterns.
 * This is a local Solid helper. It has no direct React Aria
 * counterpart.
 */

import { Accessor } from "solid-js";

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
