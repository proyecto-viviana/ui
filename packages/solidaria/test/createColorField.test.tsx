import { describe, it, expect, vi } from "vite-plus/test";
import { createRoot, createSignal, flush } from "solid-js";
import { createColorFieldState } from "@proyecto-viviana/solid-stately";
import { createColorField } from "../src/color/createColorField";

describe("createColorField autofocus", () => {
  it("focuses the input once when autoFocus becomes true", () => {
    createRoot((dispose) => {
      const [autoFocus, setAutoFocus] = createSignal(false, { ownedWrite: true });
      const [input, setInput] = createSignal<HTMLInputElement | null>(null, {
        ownedWrite: true,
      });
      const state = createColorFieldState(() => ({ defaultValue: "#ff0000" }));
      const node = document.createElement("input");
      document.body.appendChild(node);
      const focus = vi.spyOn(node, "focus");
      createColorField(
        () => ({ autoFocus: autoFocus() }),
        () => state,
        input,
      );
      flush();
      expect(focus).not.toHaveBeenCalled();

      setInput(node);
      flush();
      expect(focus).not.toHaveBeenCalled();

      setAutoFocus(true);
      flush();
      expect(focus).toHaveBeenCalledTimes(1);

      setAutoFocus(false);
      flush();
      setAutoFocus(true);
      flush();
      expect(focus).toHaveBeenCalledTimes(1);

      focus.mockRestore();
      node.remove();
      dispose();
    });
  });
});
