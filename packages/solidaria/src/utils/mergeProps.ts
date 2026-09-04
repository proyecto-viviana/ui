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

type Props = { [key: string]: unknown };

function isEventHandlerKey(key: string): boolean {
  return key.startsWith("on") && key[2] === key[2]?.toUpperCase();
}

function isClassKey(key: string): boolean {
  return key === "class" || key === "className" || key === "UNSAFE_className";
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

/**
 * Merges multiple props objects together, handling event handlers specially
 * by chaining them rather than replacing.
 *
 * Ported from packages/react-aria/src/utils/mergeProps.ts and adapted for SolidJS.
 *
 * @param args - Props objects to merge
 * @returns Merged props object. Use type parameter R to specify the result type.
 */
export function mergeProps<R extends object = Record<string, unknown>, T extends object = object>(
  ...args: T[]
): R {
  const result: Props = {};
  const setResultValue = (key: string, value: unknown) => {
    const resultDescriptor = Object.getOwnPropertyDescriptor(result, key);

    if (resultDescriptor?.get || resultDescriptor?.set) {
      Object.defineProperty(result, key, {
        enumerable: true,
        configurable: true,
        writable: true,
        value,
      });
      return;
    }

    result[key] = value;
  };

  for (const props of args) {
    for (const key in props) {
      const descriptor = Object.getOwnPropertyDescriptor(props, key);
      const hasGetter = typeof descriptor?.get === "function";
      const getValue = () => (hasGetter ? descriptor.get!.call(props) : props[key]);

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
                const next = getValue();
                return next !== undefined ? next : previous();
              }
            : getValue,
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
          get: getValue,
        });
      } else if (value !== undefined) {
        setResultValue(key, value);
      }
    }
  }

  return result as R;
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
