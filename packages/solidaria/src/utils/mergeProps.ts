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
      const value = getValue();
      const existingValue = result[key];

      if (
        typeof existingValue === "function" &&
        typeof value === "function" &&
        key.startsWith("on") &&
        key[2] === key[2]?.toUpperCase()
      ) {
        setResultValue(key, chainHandlers(existingValue as Function, value as Function));
      } else if (
        (key === "class" || key === "className" || key === "UNSAFE_className") &&
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
