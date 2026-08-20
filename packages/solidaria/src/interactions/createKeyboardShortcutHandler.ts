/**
 * Keyboard shortcut parsing and exact-match dispatch.
 *
 * Port of React Aria's createKeyboardShortcutHandler.
 */

import { isMac } from "../utils/platform";
import type { KeyboardEvent } from "./createKeyboard";

export type KeyboardShortcutAction = (
  event: KeyboardEvent,
) =>
  | void
  | boolean
  | Partial<{ shouldContinuePropagation?: boolean; shouldPreventDefault?: boolean }>;

/** Maps shortcut strings such as `Mod+s` to handlers. */
export type KeyboardShortcutBindings = Record<string, KeyboardShortcutAction>;

const modifierNames = new Set(["shift", "alt", "control", "meta", "mod"]);
const canonicalModifierOrder = ["Alt", "Control", "Meta", "Shift"] as const;

export interface ParsedKeyboardShortcut {
  shift: boolean;
  alt: boolean;
  ctrl: boolean;
  meta: boolean;
  mod: boolean;
  key: string;
}

export function modifierSetFromParsed(parsed: ParsedKeyboardShortcut): Set<string> {
  const modifiers = new Set<string>();
  if (parsed.alt) modifiers.add("Alt");
  if (parsed.shift) modifiers.add("Shift");
  if (parsed.ctrl) modifiers.add("Control");
  if (parsed.meta) modifiers.add("Meta");
  if (parsed.mod) modifiers.add(isMac() ? "Meta" : "Control");
  return modifiers;
}

export function modifierSetFromEvent(event: KeyboardEvent): Set<string> {
  const modifiers = new Set<string>();
  if (event.altKey) modifiers.add("Alt");
  if (event.ctrlKey) modifiers.add("Control");
  if (event.metaKey) modifiers.add("Meta");
  if (event.shiftKey) modifiers.add("Shift");
  return modifiers;
}

function sortedModifierTokens(modifiers: Set<string>): string[] {
  return canonicalModifierOrder.filter((name) => modifiers.has(name));
}

/** Parses a shortcut. Modifier names are case-insensitive and order-independent. */
export function parseKeyboardShortcut(specification: string): ParsedKeyboardShortcut {
  const parsed = specification.split("+").reduce<ParsedKeyboardShortcut>(
    (result, part) => {
      const lowerPart = part.toLowerCase();
      if (modifierNames.has(lowerPart)) {
        if (lowerPart === "shift") result.shift = true;
        else if (lowerPart === "alt") result.alt = true;
        else if (lowerPart === "control") result.ctrl = true;
        else if (lowerPart === "meta") result.meta = true;
        else if (lowerPart === "mod") result.mod = true;
      } else {
        result.key = part;
      }
      return result;
    },
    { shift: false, alt: false, ctrl: false, meta: false, mod: false, key: "" },
  );

  if (parsed.key === "") {
    throw new Error(
      `Invalid keyboard shortcut: "${specification}". Must include exactly one non-modifier key (e.g. "a", "Enter", "ArrowDown"). Combine any of Shift, Alt, Ctrl, Meta, and Mod.`,
    );
  }

  return parsed;
}

function normalizeEventKey(key: string): string {
  return key.toLowerCase();
}

const keyAliases: Record<string, string> = {
  space: " ",
  esc: "escape",
  del: "delete",
  ins: "insert",
  left: "arrowleft",
  right: "arrowright",
  up: "arrowup",
  down: "arrowdown",
  pageup: "pageup",
  pagedown: "pagedown",
};

function canonicalKeyFromSpecification(key: string): string {
  const normalizedKey = normalizeEventKey(key);
  return keyAliases[normalizedKey] ?? normalizedKey;
}

export function canonicalKeyboardShortcut(parsed: ParsedKeyboardShortcut): string {
  const modifiers = sortedModifierTokens(modifierSetFromParsed(parsed));
  const key = canonicalKeyFromSpecification(parsed.key);
  return modifiers.length > 0 ? `${modifiers.join("+")}+${key}` : key;
}

export function keyboardEventToCanonicalShortcut(event: KeyboardEvent): string {
  const modifiers = sortedModifierTokens(modifierSetFromEvent(event));
  const key = normalizeEventKey(event.key);
  return modifiers.length > 0 ? `${modifiers.join("+")}+${key}` : key;
}

/** Returns a keydown handler that runs an action for an exact shortcut match. */
export function createKeyboardShortcutHandler(
  bindings: KeyboardShortcutBindings,
): (event: KeyboardEvent) => void {
  const actions = new Map<string, KeyboardShortcutAction>();
  for (const [specification, action] of Object.entries(bindings)) {
    actions.set(canonicalKeyboardShortcut(parseKeyboardShortcut(specification)), action);
  }

  return (event: KeyboardEvent) => {
    const action = actions.get(keyboardEventToCanonicalShortcut(event));
    let result = action?.(event);

    if (result === undefined && action !== undefined) {
      result = { shouldContinuePropagation: false, shouldPreventDefault: true };
    } else if (typeof result === "boolean") {
      result = { shouldContinuePropagation: !result, shouldPreventDefault: result };
    }

    if (result?.shouldPreventDefault) {
      event.preventDefault();
    }
    if (!action || result?.shouldContinuePropagation) {
      event.continuePropagation();
    }
  };
}
