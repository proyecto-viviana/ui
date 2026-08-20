import { afterEach, describe, expect, it, vi } from "vite-plus/test";
import {
  canonicalKeyboardShortcut,
  createKeyboardShortcutHandler,
  keyboardEventToCanonicalShortcut,
  parseKeyboardShortcut,
} from "../src/interactions/createKeyboardShortcutHandler";
import type { KeyboardEvent } from "../src/interactions/createKeyboard";

function makeEvent(
  key: string,
  modifiers: { alt?: boolean; ctrl?: boolean; meta?: boolean; shift?: boolean } = {},
): KeyboardEvent {
  return {
    key,
    altKey: !!modifiers.alt,
    ctrlKey: !!modifiers.ctrl,
    metaKey: !!modifiers.meta,
    shiftKey: !!modifiers.shift,
    preventDefault: vi.fn(),
    continuePropagation: vi.fn(),
  } as unknown as KeyboardEvent;
}

describe("createKeyboardShortcutHandler", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("rejects a binding without a non-modifier key", () => {
    expect(() => parseKeyboardShortcut("Mod+Shift")).toThrow(/Invalid keyboard shortcut/);
    expect(() => parseKeyboardShortcut("")).toThrow(/Invalid keyboard shortcut/);
  });

  it("parses modifiers without case or order sensitivity", () => {
    expect(parseKeyboardShortcut("SHIFT+mod+A")).toEqual({
      shift: true,
      alt: false,
      ctrl: false,
      meta: false,
      mod: true,
      key: "A",
    });
    expect(parseKeyboardShortcut("Control+a").ctrl).toBe(true);
  });

  it("canonicalizes modifier order and platform Mod", () => {
    vi.spyOn(window.navigator, "platform", "get").mockReturnValue("MacIntel");
    expect(canonicalKeyboardShortcut(parseKeyboardShortcut("Shift+Mod+a"))).toBe("Meta+Shift+a");

    vi.restoreAllMocks();
    vi.spyOn(window.navigator, "platform", "get").mockReturnValue("Win32");
    expect(canonicalKeyboardShortcut(parseKeyboardShortcut("Mod+Shift+a"))).toBe("Control+Shift+a");
  });

  it.each([
    ["space", " "],
    ["esc", "escape"],
    ["del", "delete"],
    ["ins", "insert"],
    ["left", "arrowleft"],
    ["right", "arrowright"],
    ["up", "arrowup"],
    ["down", "arrowdown"],
    ["pageup", "pageup"],
    ["pagedown", "pagedown"],
  ])("maps the %s alias to %s", (alias, canonical) => {
    expect(canonicalKeyboardShortcut(parseKeyboardShortcut(alias))).toBe(canonical);
  });

  it("canonicalizes event keys and modifier order", () => {
    expect(keyboardEventToCanonicalShortcut(makeEvent("A", { shift: true, meta: true }))).toBe(
      "Meta+Shift+a",
    );
  });

  it("prevents the default and stops propagation for a handled shortcut", () => {
    vi.spyOn(window.navigator, "platform", "get").mockReturnValue("MacIntel");
    const action = vi.fn();
    const event = makeEvent("s", { meta: true });

    createKeyboardShortcutHandler({ "Mod+s": action })(event);

    expect(action).toHaveBeenCalledWith(event);
    expect(event.preventDefault).toHaveBeenCalledTimes(1);
    expect(event.continuePropagation).not.toHaveBeenCalled();
  });

  it("continues without preventing the default for an unmatched shortcut", () => {
    vi.spyOn(window.navigator, "platform", "get").mockReturnValue("MacIntel");
    const action = vi.fn();
    const event = makeEvent("s", { ctrl: true });

    createKeyboardShortcutHandler({ "Mod+s": action })(event);

    expect(action).not.toHaveBeenCalled();
    expect(event.preventDefault).not.toHaveBeenCalled();
    expect(event.continuePropagation).toHaveBeenCalledTimes(1);
  });

  it("supports boolean and object action results", () => {
    const prevented = makeEvent("Escape");
    createKeyboardShortcutHandler({ Escape: () => true })(prevented);
    expect(prevented.preventDefault).toHaveBeenCalledTimes(1);
    expect(prevented.continuePropagation).not.toHaveBeenCalled();

    const continued = makeEvent("Escape");
    createKeyboardShortcutHandler({ Escape: () => false })(continued);
    expect(continued.preventDefault).not.toHaveBeenCalled();
    expect(continued.continuePropagation).toHaveBeenCalledTimes(1);

    const controlled = makeEvent("Escape");
    createKeyboardShortcutHandler({
      Escape: () => ({ shouldPreventDefault: false, shouldContinuePropagation: true }),
    })(controlled);
    expect(controlled.preventDefault).not.toHaveBeenCalled();
    expect(controlled.continuePropagation).toHaveBeenCalledTimes(1);
  });

  it("lets the later equivalent binding win", () => {
    vi.spyOn(window.navigator, "platform", "get").mockReturnValue("MacIntel");
    const first = vi.fn();
    const second = vi.fn();
    const handler = createKeyboardShortcutHandler({
      "Mod+Shift+a": first,
      "Shift+Mod+a": second,
    });

    handler(makeEvent("a", { meta: true, shift: true }));

    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledTimes(1);
  });
});
