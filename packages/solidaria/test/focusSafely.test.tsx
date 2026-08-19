/**
 * @vitest-environment jsdom
 *
 * focusSafely — port of @react-aria/interactions focusSafely.
 * Virtual modality waits a frame (and any in-flight CSS transitions);
 * keyboard/pointer focus is synchronous.
 */

import { describe, it, expect, afterEach } from "vite-plus/test";
import { focusSafely } from "../src/utils/focus";
import { setInteractionModality } from "../src/interactions/createInteractionModality";

function nextFrame(): Promise<void> {
  return new Promise((resolve) => {
    requestAnimationFrame(() => resolve());
  });
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
});
