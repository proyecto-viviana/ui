/**
 * preventFocus tests — covers the shadow-root listener path from
 * packages/react-aria/src/interactions/utils.ts (RAC 1.21.0).
 *
 * Real browsers do not deliver shadow-internal focus events to `window`;
 * listening only on the window misses preventFocusOnPress inside a shadow root.
 */

import { describe, it, expect, afterEach, vi } from "vite-plus/test";
import { preventFocus } from "../src/utils/focus";

describe("preventFocus", () => {
  afterEach(() => {
    document.body.replaceChildren();
  });

  it("listens for focus events on the target shadow root, not only the window", () => {
    const host = document.createElement("div");
    document.body.appendChild(host);
    const shadowRoot = host.attachShadow({ mode: "open" });
    const button = document.createElement("button");
    shadowRoot.appendChild(button);

    const input = document.createElement("input");
    document.body.appendChild(input);
    input.focus();

    const shadowSpy = vi.spyOn(shadowRoot, "addEventListener");

    preventFocus(button);

    expect(shadowSpy).toHaveBeenCalledWith("focus", expect.any(Function), true);
    expect(shadowSpy).toHaveBeenCalledWith("focusin", expect.any(Function), true);
    expect(shadowSpy).toHaveBeenCalledWith("blur", expect.any(Function), true);
    expect(shadowSpy).toHaveBeenCalledWith("focusout", expect.any(Function), true);

    shadowSpy.mockRestore();
  });
});
