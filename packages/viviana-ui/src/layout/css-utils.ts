/**
 * Creates a CSS `fit-content()` value.
 * @param value - The max content size (e.g., '200px', '50%')
 */
export function fitContent(value: string): string {
  return `fit-content(${value})`;
}

/**
 * Creates a CSS `minmax()` value.
 * @param min - The minimum size
 * @param max - The maximum size
 */
export function minmax(min: string, max: string): string {
  return `minmax(${min}, ${max})`;
}

/**
 * Creates a CSS `repeat()` value.
 * @param count - The repetition count or 'auto-fill' / 'auto-fit'
 * @param track - The track definition
 */
export function repeat(count: number | "auto-fill" | "auto-fit", track: string): string {
  return `repeat(${count}, ${track})`;
}
