/**
 * @vitest-environment jsdom
 *
 * focusSafely — port of @react-aria/interactions focusSafely.
 * Virtual modality waits a frame (and any in-flight CSS transitions);
 * keyboard/pointer focus is synchronous.
 */

import { describe, it, expect, afterEach, vi } from "vite-plus/test";
import { cleanup, fireEvent, render } from "@solidjs/testing-library";
import { createEffect, createSignal, flush } from "solid-js";
import { focusSafely } from "../src/utils/focus";
import { setInteractionModality } from "../src/interactions/createInteractionModality";

function nextFrame(): Promise<void> {
  return new Promise((resolve) => {
    requestAnimationFrame(() => resolve());
  });
}

function transitionEvent(type: string, propertyName: string): Event {
  const event = new Event(type, { bubbles: true });
  Object.defineProperty(event, "propertyName", { value: propertyName });
  return event;
}

describe("focusSafely", () => {
  afterEach(() => {
    setInteractionModality("keyboard");
    document.body.innerHTML = "";
  });

  it("focuses immediately when modality is keyboard", () => {
    setInteractionModality("keyboard");
    const button = document.createElement("button");
    document.body.appendChild(button);

    focusSafely(button);
    expect(document.activeElement).toBe(button);
  });

  it("focuses immediately when modality is pointer", () => {
    setInteractionModality("pointer");
    const button = document.createElement("button");
    document.body.appendChild(button);

    focusSafely(button);
    expect(document.activeElement).toBe(button);
  });

  it("delays virtual-modality focus until after the next animation frame", async () => {
    setInteractionModality("virtual");
    const button = document.createElement("button");
    document.body.appendChild(button);

    focusSafely(button);
    expect(document.activeElement).toBe(document.body);

    await nextFrame();
    expect(document.activeElement).toBe(button);
  });

  it("does not steal focus if it moved before the virtual delay fires", async () => {
    setInteractionModality("virtual");
    const first = document.createElement("button");
    const second = document.createElement("button");
    document.body.appendChild(first);
    document.body.appendChild(second);

    focusSafely(first);
    second.focus();
    expect(document.activeElement).toBe(second);

    await nextFrame();
    expect(document.activeElement).toBe(second);
  });

  it("waits for an in-flight transition before virtual-modality focus", async () => {
    setInteractionModality("virtual");
    const transitionTarget = document.createElement("div");
    const button = document.createElement("button");
    document.body.appendChild(transitionTarget);
    document.body.appendChild(button);
    transitionTarget.dispatchEvent(transitionEvent("transitionrun", "opacity"));

    focusSafely(button);
    await nextFrame();
    expect(document.activeElement).toBe(document.body);

    transitionTarget.dispatchEvent(transitionEvent("transitionend", "opacity"));
    expect(document.activeElement).toBe(button);
  });

  it("does not focus a target disconnected during the virtual delay", async () => {
    setInteractionModality("virtual");
    const button = document.createElement("button");
    document.body.appendChild(button);

    focusSafely(button);
    button.remove();
    await nextFrame();

    expect(document.activeElement).toBe(document.body);
  });
});

describe("focusSafely native test event boundaries", () => {
  afterEach(() => {
    cleanup();
    setInteractionModality("keyboard");
  });

  async function withoutEffectFlushWarning(run: () => void): Promise<void> {
    // Spies call through: diagnostics remain visible and are asserted, never muted.
    const warn = vi.spyOn(console, "warn");
    const error = vi.spyOn(console, "error");
    try {
      run();
      await Promise.resolve();
      const messages = [...warn.mock.calls, ...error.mock.calls].flat().map(String);
      expect(messages.some((message) => message.includes("FLUSH_IN_EFFECT_CALLBACK"))).toBe(false);
    } finally {
      warn.mockRestore();
      error.mockRestore();
    }
  }

  it("retains the native input and its value when an effect applies focus", async () => {
    await withoutEffectFlushWarning(() => {
      setInteractionModality("keyboard");
      const [requested, setRequested] = createSignal(false);
      function Fixture() {
        const [focused, setFocused] = createSignal(false);
        let input: HTMLInputElement | undefined;
        createEffect(requested, (shouldFocus) => {
          if (shouldFocus && input) focusSafely(input);
        });
        return (
          <input
            aria-label="Effect focus target"
            ref={(element) => {
              input = element;
            }}
            data-focused={focused() ? "true" : "false"}
            onFocus={() => setFocused(true)}
          />
        );
      }
      const { container } = render(() => <Fixture />);
      const input = container.querySelector("input");
      if (!input) throw new Error("Missing effect focus target");
      input.value = "retained local value";
      setRequested(true);
      flush();
      expect(document.activeElement).toBe(input);
      expect(input.isConnected).toBe(true);
      expect(container.querySelector("input")).toBe(input);
      expect(input.value).toBe("retained local value");
      expect(input).toHaveAttribute("data-focused", "true");
    });
  });

  it("preserves cancellation and drains reactive focus at the outer fireEvent boundary", async () => {
    await withoutEffectFlushWarning(() => {
      setInteractionModality("keyboard");
      function Fixture() {
        const [requested, setRequested] = createSignal(false);
        const [focused, setFocused] = createSignal(false);
        let input: HTMLInputElement | undefined;
        createEffect(requested, (shouldFocus) => {
          if (shouldFocus && input) focusSafely(input);
        });
        return (
          <>
            <button
              onClick={(event) => {
                event.preventDefault();
                setRequested(true);
              }}
            >
              Focus target
            </button>
            <input
              aria-label="Event focus target"
              ref={(element) => {
                input = element;
              }}
              data-focused={focused() ? "true" : "false"}
              onFocus={() => setFocused(true)}
            />
          </>
        );
      }
      const { container } = render(() => <Fixture />);
      const input = container.querySelector("input");
      const button = container.querySelector("button");
      if (!input || !button) throw new Error("Missing event focus fixture");
      input.value = "retained event value";
      expect(fireEvent.click(button, { detail: 1 })).toBe(false);
      expect(document.activeElement).toBe(input);
      expect(input.isConnected).toBe(true);
      expect(container.querySelector("input")).toBe(input);
      expect(input.value).toBe("retained event value");
      expect(input).toHaveAttribute("data-focused", "true");
    });
  });
});
