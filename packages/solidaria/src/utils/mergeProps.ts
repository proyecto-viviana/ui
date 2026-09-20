/*
 * Copyright 2020 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

// Ported to SolidJS for Proyecto Viviana; based on packages/react-aria/src/utils/mergeProps.ts

import { assignRef } from "./refs";
import { canonicalAttrKey, coerceDomBoolean } from "./domAttrs";

type Props = { [key: string]: unknown };

type UnionToIntersection<U> = (U extends unknown ? (k: U) => void : never) extends (
  k: infer I,
) => void
  ? I
  : never;

function isEventHandlerKey(key: string): boolean {
  return key.startsWith("on") && key[2] === key[2]?.toUpperCase();
}

function isRefKey(key: string): boolean {
  return key === "ref";
}

function concatRefs(existing: unknown, next: unknown): unknown {
  if (existing == null) return next;
  if (next == null) return existing;
  return [existing, next].flat();
}

function isClassKey(key: string): boolean {
  return key === "class" || key === "className";
}

/**
 * Keys whose merge semantics require reading the current value (chaining
 * handlers, joining class strings, merging style objects). Every other getter
 * is copied as a getter and left uninvoked.
 *
 * Solid compiles JSX `children` (and other element props) as getters that
 * *create* the child tree on each read. React Aria's mergeProps can probe
 * values because React elements are already-built descriptors; doing that
 * here double-instantiates the tree on the server (each getter read is a new
 * `createComponent`) while the client memoizes after the first read — a
 * hydration-key mismatch. Form+TextField with `isRequired` + `description`
 * was the route-blanking case: `useContextProps` → `mergeProps` probed the
 * Label's children getter, minted a necessity-marker `<span>` that never
 * entered the SSR DOM, then the real render minted a second span at a
 * different key.
 */
function needsEagerRead(key: string): boolean {
  return isEventHandlerKey(key) || isClassKey(key) || key === "style";
}

/** A later getter that reads the merged object for the same key must not recurse. */
const MERGE_GETTER_STACK = new WeakMap<object, Set<string>>();

function readWithReentryGuard(target: object, key: string, read: () => unknown): unknown {
  let keys = MERGE_GETTER_STACK.get(target);
  if (!keys) {
    keys = new Set();
    MERGE_GETTER_STACK.set(target, keys);
  }
  if (keys.has(key)) {
    return undefined;
  }
  keys.add(key);
  try {
    return read();
  } finally {
    keys.delete(key);
  }
}

/**
 * Merges multiple props objects together, handling event handlers specially
 * by chaining them rather than replacing.
 *
 * Ported from packages/react-aria/src/utils/mergeProps.ts and adapted for SolidJS.
 *
 * @param args - Props objects to merge
 * @returns Merged props object. Use type parameter R to specify the result type.
 */
export function mergeProps<const T extends object[]>(
  ...args: [...T]
): UnionToIntersection<T[number]>;
export function mergeProps<R extends object>(...args: object[]): R;
export function mergeProps(...args: object[]): object {
  const result: Props = {};
  const setResultValue = (key: string, value: unknown) => {
    const attr = canonicalAttrKey(key);
    const coerced = coerceDomBoolean(key, value);
    const resultDescriptor = Object.getOwnPropertyDescriptor(result, attr);

    if (resultDescriptor?.get || resultDescriptor?.set) {
      Object.defineProperty(result, attr, {
        enumerable: true,
        configurable: true,
        writable: true,
        value: coerced,
      });
      return;
    }

    result[attr] = coerced;
  };

  for (const props of args) {
    for (const rawKey in props) {
      const key = canonicalAttrKey(rawKey);
      const descriptor = Object.getOwnPropertyDescriptor(props, rawKey);
      const hasGetter = typeof descriptor?.get === "function";
      const getValue = () => (hasGetter ? descriptor.get!.call(props) : (props as Props)[rawKey]);

      if (isRefKey(key)) {
        const previousDescriptor = Object.getOwnPropertyDescriptor(result, key);
        const previous = previousDescriptor
          ? typeof previousDescriptor.get === "function"
            ? () => previousDescriptor.get!()
            : () => previousDescriptor.value
          : undefined;
        const getCombined = () => concatRefs(previous?.(), getValue());
        Object.defineProperty(result, key, {
          enumerable: true,
          configurable: true,
          get: getCombined,
          set: (el: unknown) => {
            assignRef(getCombined(), el as never);
          },
        });
        continue;
      }

      if (hasGetter && !needsEagerRead(key)) {
        // React Aria ends every non-special key with `b !== undefined ? b : a`.
        // Do that at read time so a later getter that yields `undefined` cannot
        // shadow an earlier context value, and so we never probe the getter
        // during merge (Solid `children` getters instantiate JSX).
        const previousDescriptor = Object.getOwnPropertyDescriptor(result, key);
        const previous = previousDescriptor
          ? typeof previousDescriptor.get === "function"
            ? () => previousDescriptor.get!()
            : () => previousDescriptor.value
          : undefined;
        Object.defineProperty(result, key, {
          enumerable: true,
          configurable: true,
          get: previous
            ? () => {
                // Guard only the later getter. Walking `previous()` is the
                // defined-value fallback, not reentry — holding the guard
                // across that call made a later `undefined` getter wipe an
                // earlier getter (createButton `aria-disabled`).
                const next = readWithReentryGuard(result, key, getValue);
                return coerceDomBoolean(key, next !== undefined ? next : previous());
              }
            : () => readWithReentryGuard(result, key, () => coerceDomBoolean(key, getValue())),
        });
        continue;
      }

      const value = getValue();
      const existingValue = result[key];

      if (
        typeof existingValue === "function" &&
        typeof value === "function" &&
        isEventHandlerKey(key)
      ) {
        setResultValue(key, chainHandlers(existingValue as Function, value as Function));
      } else if (
        isClassKey(key) &&
        typeof existingValue === "string" &&
        typeof value === "string"
      ) {
        // Join only when both sides are plain strings (react-aria mergeProps
        // semantics); a render-prop class function must pass through intact,
        // not be coerced to its source text.
        setResultValue(key, mergeClassNames(existingValue, value));
      } else if (
        key === "style" &&
        typeof existingValue === "object" &&
        typeof value === "object"
      ) {
        setResultValue(key, { ...(existingValue as object), ...(value as object) });
      } else if (hasGetter && (value !== undefined || !(key in result))) {
        Object.defineProperty(result, key, {
          enumerable: true,
          configurable: true,
          get: () => coerceDomBoolean(key, getValue()),
        });
      } else if (value !== undefined) {
        setResultValue(key, value);
      }
    }
  }

  return result;
}

function chainHandlers(existingHandler: Function, newHandler: Function) {
  return (...args: unknown[]) => {
    existingHandler(...args);
    newHandler(...args);
  };
}

function mergeClassNames(...classes: unknown[]): string {
  return classes.filter(Boolean).join(" ");
}
