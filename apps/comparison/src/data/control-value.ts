export type ControlLiteral = string | boolean | number;

/**
 * An explicit empty query value (`?value=`) is a value. `||` would swap it for
 * the demo default, and the two stacks can observe that default on different
 * loads of the same URL.
 */
export function controlValueFromSearch(
  params: { has(name: string): boolean; get(name: string): string | null },
  name: string,
  defaultValue: ControlLiteral,
): ControlLiteral {
  if (typeof defaultValue === "boolean") {
    return params.has(name) ? params.get(name) === "true" : defaultValue;
  }

  return params.has(name) ? (params.get(name) ?? "") : defaultValue;
}

/**
 * A field that is in the form and empty stays empty. `null` means the control
 * is absent, which is the demo default. Collapsing `""` back to the default
 * reintroduces the value the URL refused the next time a change event is read.
 */
export function controlValueFromField(
  submitted: string | null,
  defaultValue: ControlLiteral,
): ControlLiteral {
  if (typeof defaultValue === "boolean") {
    return submitted === "on" || submitted === "true";
  }

  return submitted == null ? defaultValue : submitted;
}
