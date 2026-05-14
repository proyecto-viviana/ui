type Props = { [key: string]: unknown };

/**
 * Merges multiple props objects together, handling event handlers specially
 * by chaining them rather than replacing.
 *
 * Based on react-aria's mergeProps but adapted for SolidJS.
 *
 * @param args - Props objects to merge
 * @returns Merged props object. Use type parameter R to specify the result type.
 */
export function mergeProps<R extends object = Record<string, unknown>, T extends object = object>(
  ...args: T[]
): R {
  const result: Props = {};

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
        result[key] = chainHandlers(existingValue as Function, value as Function);
      } else if (key === "class" || key === "className") {
        result[key] = mergeClassNames(existingValue, value);
      } else if (
        key === "style" &&
        typeof existingValue === "object" &&
        typeof value === "object"
      ) {
        result[key] = { ...(existingValue as object), ...(value as object) };
      } else if (hasGetter && (value !== undefined || !(key in result))) {
        Object.defineProperty(result, key, {
          enumerable: true,
          configurable: true,
          get: getValue,
        });
      } else if (value !== undefined) {
        result[key] = value;
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
