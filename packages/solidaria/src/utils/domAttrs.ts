/**
 * Solid 2 maps boolean `true` to an empty attribute (`disabled=""`) and omits
 * `false`. ARIA state attributes need the literals `"true"` / `"false"`.
 */

const ARIA_TRUE_FALSE = new Set([
  "aria-expanded",
  "aria-selected",
  "aria-checked",
  "aria-pressed",
  "aria-current",
  "aria-haspopup",
  "aria-hidden",
  "aria-disabled",
  "aria-invalid",
  "aria-required",
  "aria-readonly",
  "aria-multiline",
  "aria-multiselectable",
  "aria-busy",
  "aria-modal",
]);

/** Native enumerated true/false attributes (not HTML boolean attributes). */
const ENUMERATED_TRUE_FALSE = new Set([
  "draggable",
  "spellcheck",
  "spellCheck",
  "contenteditable",
  "contentEditable",
]);

const ATTR_KEY_ALIASES: Record<string, string> = {
  contentEditable: "contenteditable",
  spellCheck: "spellcheck",
  htmlFor: "for",
};

/** Map React/Solid JSX names onto the DOM attribute Solid 2 will emit. */
export function canonicalAttrKey(key: string): string {
  return ATTR_KEY_ALIASES[key] ?? key;
}

export function ariaTrueFalse(value: boolean): "true" | "false" {
  return value ? "true" : "false";
}

export function attrTrue(value: boolean | undefined | null): "true" | undefined {
  return value ? "true" : undefined;
}

/** Keep string DOM ids; drop Solid 2 `RemoveAttribute` (`false`). */
export function attrString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

export function isAriaTrue(value: unknown): boolean {
  return value === true || value === "true";
}

/** Map boolean aria/data values so Solid 2 does not emit empty attributes. */
export function coerceDomBoolean(key: string, value: unknown): unknown {
  if (typeof value !== "boolean") return value;
  const attr = ATTR_KEY_ALIASES[key] ?? key;
  if (ENUMERATED_TRUE_FALSE.has(key) || ENUMERATED_TRUE_FALSE.has(attr)) {
    return value ? "true" : "false";
  }
  if (attr.startsWith("data-")) return value ? "true" : undefined;
  if (attr.startsWith("aria-")) {
    if (ARIA_TRUE_FALSE.has(attr)) return value ? "true" : "false";
    return value ? "true" : undefined;
  }
  return value;
}

/** Coerce boolean aria/data/enumerated values on a plain props object. */
export function coerceDomRecord<T extends Record<string, unknown>>(record: T): T {
  const next: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(record)) {
    const attr = canonicalAttrKey(key);
    next[attr] = coerceDomBoolean(key, value);
  }
  return next as T;
}
