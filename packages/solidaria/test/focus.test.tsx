/**
 * @vitest-environment jsdom
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vite-plus/test";
import { createRoot, createSignal } from "solid-js";
import {
  // Focus Restoration
  createFocusRestore,
  pushFocusStack,
  popFocusStack,
  getFocusStackLength,
  clearFocusStack,
  // Virtual Focus
  createVirtualFocus,
  // Auto Focus
  createAutoFocus,
  clearAutoFocusQueue,
  getAutoFocusQueueLength,
} from "../src/focus";

// ============================================
// FOCUS RESTORATION
// ============================================

describe("createFocusRestore", () => {
  beforeEach(() => {
    clearFocusStack();
  });

  afterEach(() => {
    clearFocusStack();
  });

  it("should save the currently focused element on mount", async () => {
    await new Promise<void>((resolve) => {
      // Create a button and focus it
      const button = document.createElement("button");
      document.body.appendChild(button);
      button.focus();

      createRoot((dispose) => {
        const focusRestore = createFocusRestore();

        setTimeout(() => {
          expect(focusRestore.getSavedElement()).toBe(button);
          dispose();
          button.remove();
          resolve();
        }, 0);
      });
    });
  });

  it("should restore focus when calling restore()", async () => {
    await new Promise<void>((resolve) => {
      const button = document.createElement("button");
      document.body.appendChild(button);
      button.focus();

      createRoot((dispose) => {
        const focusRestore = createFocusRestore({ restoreOnUnmount: false });

        setTimeout(() => {
          // Focus something else
          const input = document.createElement("input");
          document.body.appendChild(input);
          input.focus();

          expect(document.activeElement).toBe(input);

          // Restore focus
          const result = focusRestore.restore();
          expect(result).toBe(true);
          expect(document.activeElement).toBe(button);

          dispose();
          button.remove();
          input.remove();
          resolve();
        }, 0);
      });
    });
  });

  it("should call onRestore callback when focus is restored", async () => {
    await new Promise<void>((resolve) => {
      const button = document.createElement("button");
      document.body.appendChild(button);
      button.focus();

      const onRestore = vi.fn();

      createRoot((dispose) => {
        const focusRestore = createFocusRestore({
          restoreOnUnmount: false,
          onRestore,
        });

        setTimeout(() => {
          focusRestore.restore();
          expect(onRestore).toHaveBeenCalledWith(button);

          dispose();
          button.remove();
          resolve();
        }, 0);
      });
    });
  });

  it("should return false if element is removed", async () => {
    await new Promise<void>((resolve) => {
      const button = document.createElement("button");
      document.body.appendChild(button);
      button.focus();

      createRoot((dispose) => {
        const focusRestore = createFocusRestore({
          restoreOnUnmount: false,
        });

        setTimeout(() => {
          // Remove the button before restore
          button.remove();

          // Clear the focus stack since the button was pushed
          clearFocusStack();

          // Try to restore - should fail since element was removed
          const result = focusRestore.restore();
          expect(result).toBe(false);

          dispose();
          resolve();
        }, 0);
      });
    });
  });

  it("should clear saved element when calling clear()", async () => {
    await new Promise<void>((resolve) => {
      const button = document.createElement("button");
      document.body.appendChild(button);
      button.focus();

      createRoot((dispose) => {
        const focusRestore = createFocusRestore();

        setTimeout(() => {
          expect(focusRestore.getSavedElement()).toBe(button);
          focusRestore.clear();
          expect(focusRestore.getSavedElement()).toBe(null);

          dispose();
          button.remove();
          resolve();
        }, 0);
      });
    });
  });
});

describe("focus stack", () => {
  beforeEach(() => {
    clearFocusStack();
  });

  afterEach(() => {
    clearFocusStack();
  });

  it("should push and pop elements from the stack", () => {
    const button1 = document.createElement("button");
    const button2 = document.createElement("button");

    pushFocusStack(button1);
    expect(getFocusStackLength()).toBe(1);

    pushFocusStack(button2);
    expect(getFocusStackLength()).toBe(2);

    expect(popFocusStack()).toBe(button2);
    expect(getFocusStackLength()).toBe(1);

    expect(popFocusStack()).toBe(button1);
    expect(getFocusStackLength()).toBe(0);
  });

  it("should clear the entire stack", () => {
    const button1 = document.createElement("button");
    const button2 = document.createElement("button");

    pushFocusStack(button1);
    pushFocusStack(button2);
    expect(getFocusStackLength()).toBe(2);

    clearFocusStack();
    expect(getFocusStackLength()).toBe(0);
  });
});

// ============================================
// VIRTUAL FOCUS
// ============================================

describe("createVirtualFocus", () => {
  const createItems = () => [
    { id: "1", name: "Item 1", disabled: false },
    { id: "2", name: "Item 2", disabled: false },
    { id: "3", name: "Item 3", disabled: true },
    { id: "4", name: "Item 4", disabled: false },
  ];

  it("should track focused key", () => {
    createRoot((dispose) => {
      const items = createItems();

      const virtualFocus = createVirtualFocus({
        items: () => items,
        getKey: (item) => item.id,
        defaultFocusedKey: "1",
      });

      expect(virtualFocus.focusedKey()).toBe("1");
      expect(virtualFocus.focusedItem()?.name).toBe("Item 1");

      dispose();
    });
  });

  it("should focus next item", () => {
    createRoot((dispose) => {
      const items = createItems();

      const virtualFocus = createVirtualFocus({
        items: () => items,
        getKey: (item) => item.id,
        isDisabled: (item) => item.disabled,
        defaultFocusedKey: "1",
      });

      virtualFocus.focusNext();
      expect(virtualFocus.focusedKey()).toBe("2");

      // Should skip disabled item (id: 3)
      virtualFocus.focusNext();
      expect(virtualFocus.focusedKey()).toBe("4");

      dispose();
    });
  });

  it("should focus previous item", () => {
    createRoot((dispose) => {
      const items = createItems();

      const virtualFocus = createVirtualFocus({
        items: () => items,
        getKey: (item) => item.id,
        isDisabled: (item) => item.disabled,
        defaultFocusedKey: "4",
      });

      virtualFocus.focusPrevious();
      // Should skip disabled item (id: 3)
      expect(virtualFocus.focusedKey()).toBe("2");

      dispose();
    });
  });

  it("should focus first item", () => {
    createRoot((dispose) => {
      const items = createItems();

      const virtualFocus = createVirtualFocus({
        items: () => items,
        getKey: (item) => item.id,
        defaultFocusedKey: "4",
      });

      virtualFocus.focusFirst();
      expect(virtualFocus.focusedKey()).toBe("1");

      dispose();
    });
  });

  it("should focus last item", () => {
    createRoot((dispose) => {
      const items = createItems();

      const virtualFocus = createVirtualFocus({
        items: () => items,
        getKey: (item) => item.id,
        isDisabled: (item) => item.disabled,
        defaultFocusedKey: "1",
      });

      virtualFocus.focusLast();
      expect(virtualFocus.focusedKey()).toBe("4");

      dispose();
    });
  });

  it("should wrap focus when wrap is true", () => {
    createRoot((dispose) => {
      const items = createItems();

      const virtualFocus = createVirtualFocus({
        items: () => items,
        getKey: (item) => item.id,
        isDisabled: (item) => item.disabled,
        defaultFocusedKey: "4",
        wrap: true,
      });

      virtualFocus.focusNext();
      expect(virtualFocus.focusedKey()).toBe("1");

      dispose();
    });
  });

  it("should not wrap focus when wrap is false", () => {
    createRoot((dispose) => {
      const items = createItems();

      const virtualFocus = createVirtualFocus({
        items: () => items,
        getKey: (item) => item.id,
        isDisabled: (item) => item.disabled,
        defaultFocusedKey: "4",
        wrap: false,
      });

      virtualFocus.focusNext();
      // Should stay on last item
      expect(virtualFocus.focusedKey()).toBe("4");

      dispose();
    });
  });

  it("should work with controlled focus", () => {
    createRoot((dispose) => {
      const items = createItems();
      const [focusedKey, setFocusedKey] = createSignal<string | null>("1");

      const onFocusChange = vi.fn((key: string | null) => setFocusedKey(key));

      const virtualFocus = createVirtualFocus({
        items: () => items,
        getKey: (item) => item.id,
        focusedKey: focusedKey,
        onFocusChange,
      });

      virtualFocus.focusNext();
      expect(onFocusChange).toHaveBeenCalledWith("2");
      expect(focusedKey()).toBe("2");

      dispose();
    });
  });

  it("should check if key is focused", () => {
    createRoot((dispose) => {
      const items = createItems();

      const virtualFocus = createVirtualFocus({
        items: () => items,
        getKey: (item) => item.id,
        defaultFocusedKey: "2",
      });

      expect(virtualFocus.isFocused("1")).toBe(false);
      expect(virtualFocus.isFocused("2")).toBe(true);
      expect(virtualFocus.isFocused("3")).toBe(false);

      dispose();
    });
  });

  it("should provide container props with aria-activedescendant", () => {
    createRoot((dispose) => {
      const items = createItems();

      const virtualFocus = createVirtualFocus({
        items: () => items,
        getKey: (item) => item.id,
        defaultFocusedKey: "2",
      });

      expect(virtualFocus.containerProps["aria-activedescendant"]()).toBe("item-2");

      dispose();
    });
  });

  it("should provide item props with id", () => {
    createRoot((dispose) => {
      const items = createItems();

      const virtualFocus = createVirtualFocus({
        items: () => items,
        getKey: (item) => item.id,
      });

      expect(virtualFocus.getItemProps("1").id).toBe("item-1");
      expect(virtualFocus.getItemProps("2").id).toBe("item-2");

      dispose();
    });
  });

  it("should handle keyboard navigation", () => {
    createRoot((dispose) => {
      const items = createItems();

      const virtualFocus = createVirtualFocus({
        items: () => items,
        getKey: (item) => item.id,
        isDisabled: (item) => item.disabled,
        defaultFocusedKey: "1",
      });

      const keyDown = virtualFocus.containerProps.onKeyDown;

      // Arrow down
      const downEvent = new KeyboardEvent("keydown", { key: "ArrowDown" });
      Object.defineProperty(downEvent, "preventDefault", { value: vi.fn() });
      keyDown(downEvent);
      expect(virtualFocus.focusedKey()).toBe("2");

      // Arrow up
      const upEvent = new KeyboardEvent("keydown", { key: "ArrowUp" });
      Object.defineProperty(upEvent, "preventDefault", { value: vi.fn() });
      keyDown(upEvent);
      expect(virtualFocus.focusedKey()).toBe("1");

      // Home
      const homeEvent = new KeyboardEvent("keydown", { key: "Home" });
      Object.defineProperty(homeEvent, "preventDefault", { value: vi.fn() });
      keyDown(homeEvent);
      expect(virtualFocus.focusedKey()).toBe("1");

      // End
      const endEvent = new KeyboardEvent("keydown", { key: "End" });
      Object.defineProperty(endEvent, "preventDefault", { value: vi.fn() });
      keyDown(endEvent);
      expect(virtualFocus.focusedKey()).toBe("4");

      dispose();
    });
  });
});

// ============================================
// AUTO FOCUS
// ============================================

describe("createAutoFocus", () => {
  beforeEach(() => {
    clearAutoFocusQueue();
  });

  afterEach(() => {
    clearAutoFocusQueue();
  });

  it("should focus element on mount", async () => {
    await new Promise<void>((resolve) => {
      const button = document.createElement("button");
      document.body.appendChild(button);

      createRoot((dispose) => {
        createAutoFocus(() => button, {
          isEnabled: true,
        });

        setTimeout(() => {
          expect(document.activeElement).toBe(button);
          dispose();
          button.remove();
          resolve();
        }, 50);
      });
    });
  });

  it("should not focus when isEnabled is false", async () => {
    await new Promise<void>((resolve) => {
      const button = document.createElement("button");
      document.body.appendChild(button);

      createRoot((dispose) => {
        createAutoFocus(() => button, {
          isEnabled: false,
        });

        setTimeout(() => {
          expect(document.activeElement).not.toBe(button);
          dispose();
          button.remove();
          resolve();
        }, 50);
      });
    });
  });

  it("should respect priority when multiple elements request auto-focus", async () => {
    await new Promise<void>((resolve) => {
      const button1 = document.createElement("button");
      button1.id = "low-priority";
      document.body.appendChild(button1);

      const button2 = document.createElement("button");
      button2.id = "high-priority";
      document.body.appendChild(button2);

      createRoot((dispose) => {
        // Lower priority
        createAutoFocus(() => button1, {
          priority: 1,
        });

        // Higher priority
        createAutoFocus(() => button2, {
          priority: 10,
        });

        setTimeout(() => {
          expect(document.activeElement).toBe(button2);
          dispose();
          button1.remove();
          button2.remove();
          resolve();
        }, 50);
      });
    });
  });

  it("should call onFocus callback when focused", async () => {
    await new Promise<void>((resolve) => {
      const button = document.createElement("button");
      document.body.appendChild(button);

      const onFocus = vi.fn();

      createRoot((dispose) => {
        createAutoFocus(() => button, {
          onFocus,
        });

        setTimeout(() => {
          expect(onFocus).toHaveBeenCalledWith(button);
          dispose();
          button.remove();
          resolve();
        }, 50);
      });
    });
  });

  it("should call onSkip callback when skipped due to lower priority", async () => {
    await new Promise<void>((resolve) => {
      const button1 = document.createElement("button");
      document.body.appendChild(button1);

      const button2 = document.createElement("button");
      document.body.appendChild(button2);

      const onSkip = vi.fn();

      createRoot((dispose) => {
        // Lower priority with onSkip
        createAutoFocus(() => button1, {
          priority: 1,
          onSkip,
        });

        // Higher priority
        createAutoFocus(() => button2, {
          priority: 10,
        });

        setTimeout(() => {
          expect(onSkip).toHaveBeenCalled();
          dispose();
          button1.remove();
          button2.remove();
          resolve();
        }, 50);
      });
    });
  });

  it("should allow manual focus trigger", () => {
    createRoot((dispose) => {
      const button = document.createElement("button");
      document.body.appendChild(button);

      const autoFocus = createAutoFocus(() => button, {
        isEnabled: false, // Disable auto-focus on mount
      });

      // Manually focus
      autoFocus.focus();
      expect(document.activeElement).toBe(button);

      dispose();
      button.remove();
    });
  });

  it("should allow canceling auto-focus", async () => {
    await new Promise<void>((resolve) => {
      const button = document.createElement("button");
      document.body.appendChild(button);

      createRoot((dispose) => {
        const autoFocus = createAutoFocus(() => button, {
          isEnabled: true,
        });

        // Cancel before it runs
        autoFocus.cancel();

        setTimeout(() => {
          expect(document.activeElement).not.toBe(button);
          dispose();
          button.remove();
          resolve();
        }, 50);
      });
    });
  });

  it("should delay focus when delay option is set", async () => {
    await new Promise<void>((resolve) => {
      const button = document.createElement("button");
      document.body.appendChild(button);

      createRoot((dispose) => {
        createAutoFocus(() => button, {
          delay: 100,
        });

        // Check immediately - should not be focused yet
        setTimeout(() => {
          expect(document.activeElement).not.toBe(button);
        }, 50);

        // Check after delay
        setTimeout(() => {
          expect(document.activeElement).toBe(button);
          dispose();
          button.remove();
          resolve();
        }, 200);
      });
    });
  });
});

describe("auto-focus queue utilities", () => {
  beforeEach(() => {
    clearAutoFocusQueue();
  });

  afterEach(() => {
    clearAutoFocusQueue();
  });

  it("should report queue length", () => {
    expect(getAutoFocusQueueLength()).toBe(0);
  });

  it("should clear the queue", () => {
    clearAutoFocusQueue();
    expect(getAutoFocusQueueLength()).toBe(0);
  });
});
