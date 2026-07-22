/**
 * generatePowerset - Prop combination generator for component testing
 *
 * Generates all combinations of prop values for visual regression testing.
 */

export type PropValues<T> = {
  [K in keyof T]?: T[K][];
};

export interface PowersetItem<T> {
  /** Human-readable label for this combination. */
  label: string;
  /** The prop values for this combination. */
  props: Partial<T>;
}

/**
 * Generates all combinations of the given prop values.
 *
 * @param propValues - An object mapping prop names to arrays of possible values.
 * @returns An array of all prop combinations.
 *
 * @example
 * ```ts
 * const combos = generatePowerset({
 *   size: ['sm', 'md', 'lg'],
 *   variant: ['primary', 'secondary'],
 *   isDisabled: [false, true],
 * });
 * // Returns 12 combinations (3 * 2 * 2)
 * ```
 */
export function generatePowerset<T extends Record<string, unknown>>(
  propValues: PropValues<T>,
): PowersetItem<T>[] {
  const keys = Object.keys(propValues) as (keyof T)[];
  const result: PowersetItem<T>[] = [];

  function generate(index: number, current: Partial<T>, labels: string[]): void {
    if (index === keys.length) {
      result.push({
        label: labels.join(", "),
        props: { ...current },
      });
      return;
    }

    const key = keys[index];
    const values = propValues[key]!;

    for (const value of values) {
      generate(index + 1, { ...current, [key]: value }, [
        ...labels,
        `${String(key)}=${String(value)}`,
      ]);
    }
  }

  generate(0, {}, []);
  return result;
}
