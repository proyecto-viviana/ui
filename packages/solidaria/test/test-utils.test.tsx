/**
 * @vitest-environment jsdom
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vite-plus/test";
import { render, screen, cleanup } from "@solidjs/testing-library";
import { createSignal } from "solid-js";

// Import test utilities
import {
  // Pointer utilities
  pointerMap,
  createPointerEvent,
  createPressSequence,
  createHoverSequence,
  createLeaveSequence,
  createTouchEvent,
} from "../test-utils/pointer";

import {
  // Interaction utilities
  setupUser,
  press,
  hover,
  unhover,
  tabTo,
  typeText,
  pressKey,
  pressKeys,
  pressKeyCombo,
  createVirtualClick,
} from "../test-utils/interactions";

import {
  // ARIA utilities
  getAriaRole,
  hasAriaLabel,
  getAriaLabel,
  isAriaDisabled,
  isAriaExpanded,
  isAriaPressed,
  isAriaChecked,
  isAriaSelected,
  isAriaRequired,
  isAriaInvalid,
  isAriaHidden,
  getAriaActiveDescendant,
  getAriaValueNow,
  getAriaState,
  assertAriaRole,
  assertAccessible,
} from "../test-utils/aria";

import {
  // Focus utilities
  getFocusedElement,
  isFocused,
  isFocusWithin,
  getFocusableElements,
  getTabbableElements,
  getFirstFocusable,
  getLastFocusable,
  waitForFocus,
  assertFocused,
  assertFocusWithin,
} from "../test-utils/focus";

import {
  // Setup utilities
  setupTestEnvironment,
  cleanupTestEnvironment,
  wait,
  waitFor,
} from "../test-utils/setup";

// ============================================
// POINTER UTILITIES
// ============================================

describe("pointer utilities", () => {
  describe("pointerMap", () => {
    it("should contain mouse entries", () => {
      const mouseLeft = pointerMap.find((p) => p.name === "MouseLeft");
      expect(mouseLeft).toBeDefined();
      expect(mouseLeft?.pointerType).toBe("mouse");
      expect(mouseLeft?.button).toBe("primary");
    });

    it("should contain touch entries", () => {
      const touchA = pointerMap.find((p) => p.name === "TouchA");
      expect(touchA).toBeDefined();
      expect(touchA?.pointerType).toBe("touch");
    });

    it("should contain pen entries", () => {
      const penA = pointerMap.find((p) => p.name === "PenA");
      expect(penA).toBeDefined();
      expect(penA?.pointerType).toBe("pen");
    });
  });

  describe("createPointerEvent", () => {
    it("should create a pointer event with defaults", () => {
      const event = createPointerEvent("pointerdown");
      expect(event.type).toBe("pointerdown");
      expect(event.pointerType).toBe("mouse");
      expect(event.pointerId).toBe(1);
      expect(event.bubbles).toBe(true);
    });

    it("should create a touch pointer event", () => {
      const event = createPointerEvent("pointerdown", {
        pointerType: "touch",
        pointerId: 2,
      });
      expect(event.pointerType).toBe("touch");
      expect(event.pointerId).toBe(2);
    });

    it("should set coordinates", () => {
      const event = createPointerEvent("pointermove", {
        clientX: 100,
        clientY: 200,
      });
      expect(event.clientX).toBe(100);
      expect(event.clientY).toBe(200);
    });
  });

  describe("createPressSequence", () => {
    it("should create pointerdown and pointerup events", () => {
      const button = document.createElement("button");
      document.body.appendChild(button);

      const events = createPressSequence(button);
      expect(events).toHaveLength(2);
      expect(events[0].type).toBe("pointerdown");
      expect(events[1].type).toBe("pointerup");

      button.remove();
    });
  });

  describe("createHoverSequence", () => {
    it("should create hover events", () => {
      const button = document.createElement("button");
      document.body.appendChild(button);

      const events = createHoverSequence(button);
      expect(events.length).toBeGreaterThanOrEqual(2);
      expect(events[0].type).toBe("pointerenter");

      button.remove();
    });
  });

  describe("createTouchEvent", () => {
    it("should create touch events", () => {
      const event = createTouchEvent("touchstart", {
        identifier: 1,
        clientX: 50,
        clientY: 50,
      });
      expect(event.type).toBe("touchstart");
      expect(event.touches).toHaveLength(1);
    });

    it("should create touchend with empty touches", () => {
      const event = createTouchEvent("touchend", { identifier: 1 });
      expect(event.touches).toHaveLength(0);
      expect(event.changedTouches).toHaveLength(1);
    });
  });
});

// ============================================
// INTERACTION UTILITIES
// ============================================

describe("interaction utilities", () => {
  afterEach(() => {
    cleanup();
  });

  describe("setupUser", () => {
    it("should create a userEvent instance", () => {
      const user = setupUser();
      expect(user).toBeDefined();
      expect(typeof user.click).toBe("function");
      expect(typeof user.keyboard).toBe("function");
    });
  });

  describe("press", () => {
    it("should click an element", async () => {
      const onClick = vi.fn();
      render(() => <button onClick={onClick}>Click me</button>);

      const button = screen.getByRole("button");
      const user = setupUser();

      await press(user, button);
      expect(onClick).toHaveBeenCalled();
    });
  });

  describe("hover", () => {
    it("should hover an element", async () => {
      const onMouseEnter = vi.fn();
      render(() => <button onMouseEnter={onMouseEnter}>Hover me</button>);

      const button = screen.getByRole("button");
      const user = setupUser();

      await hover(user, button);
      expect(onMouseEnter).toHaveBeenCalled();
    });
  });

  describe("tabTo", () => {
    it("should tab to next element", async () => {
      render(() => (
        <div>
          <button>Button 1</button>
          <button>Button 2</button>
        </div>
      ));

      const [button1, button2] = screen.getAllByRole("button");
      button1.focus();

      const user = setupUser();
      await tabTo(user, 1);

      expect(document.activeElement).toBe(button2);
    });

    it("should shift+tab to previous element", async () => {
      render(() => (
        <div>
          <button>Button 1</button>
          <button>Button 2</button>
        </div>
      ));

      const [button1, button2] = screen.getAllByRole("button");
      button2.focus();

      const user = setupUser();
      await tabTo(user, -1);

      expect(document.activeElement).toBe(button1);
    });
  });

  describe("typeText", () => {
    it("should type text into an input", async () => {
      render(() => <input type="text" />);

      const input = screen.getByRole("textbox") as HTMLInputElement;
      const user = setupUser();

      await typeText(user, input, "Hello");
      expect(input.value).toBe("Hello");
    });
  });

  describe("pressKey", () => {
    it("should press a key", async () => {
      const onKeyDown = vi.fn();
      render(() => <input onKeyDown={onKeyDown} />);

      const input = screen.getByRole("textbox");
      input.focus();

      const user = setupUser();
      await pressKey(user, "Enter");

      expect(onKeyDown).toHaveBeenCalledWith(expect.objectContaining({ key: "Enter" }));
    });
  });

  describe("pressKeys", () => {
    it("should press multiple keys in sequence", async () => {
      const onKeyDown = vi.fn();
      render(() => <input onKeyDown={onKeyDown} />);

      const input = screen.getByRole("textbox");
      input.focus();

      const user = setupUser();
      await pressKeys(user, ["ArrowDown", "ArrowDown", "Enter"]);

      expect(onKeyDown).toHaveBeenCalledTimes(3);
    });
  });

  describe("createVirtualClick", () => {
    it("should create a virtual click event", () => {
      const button = document.createElement("button");
      const event = createVirtualClick(button);

      expect(event.type).toBe("click");
      expect(event.detail).toBe(0);
    });
  });
});

// ============================================
// ARIA UTILITIES
// ============================================

describe("ARIA utilities", () => {
  afterEach(() => {
    cleanup();
  });

  describe("getAriaRole", () => {
    it("should get explicit role", () => {
      const div = document.createElement("div");
      div.setAttribute("role", "button");
      expect(getAriaRole(div)).toBe("button");
    });

    it("should get implicit role from button", () => {
      const button = document.createElement("button");
      expect(getAriaRole(button)).toBe("button");
    });

    it("should get implicit role from link", () => {
      const link = document.createElement("a");
      link.href = "#";
      expect(getAriaRole(link)).toBe("link");
    });

    it("should get implicit role from input types", () => {
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      expect(getAriaRole(checkbox)).toBe("checkbox");

      const radio = document.createElement("input");
      radio.type = "radio";
      expect(getAriaRole(radio)).toBe("radio");
    });
  });

  describe("hasAriaLabel / getAriaLabel", () => {
    it("should detect aria-label", () => {
      const button = document.createElement("button");
      button.setAttribute("aria-label", "Close");

      expect(hasAriaLabel(button)).toBe(true);
      expect(getAriaLabel(button)).toBe("Close");
    });

    it("should detect aria-labelledby", () => {
      document.body.innerHTML = `
        <span id="label">My Label</span>
        <button aria-labelledby="label"></button>
      `;
      const button = document.querySelector("button")!;

      expect(hasAriaLabel(button)).toBe(true);
      expect(getAriaLabel(button)).toBe("My Label");

      document.body.innerHTML = "";
    });

    it("should detect button text content", () => {
      const button = document.createElement("button");
      button.textContent = "Click me";

      expect(hasAriaLabel(button)).toBe(true);
      expect(getAriaLabel(button)).toBe("Click me");
    });
  });

  describe("isAriaDisabled", () => {
    it("should detect aria-disabled", () => {
      const button = document.createElement("button");
      expect(isAriaDisabled(button)).toBe(false);

      button.setAttribute("aria-disabled", "true");
      expect(isAriaDisabled(button)).toBe(true);
    });

    it("should detect native disabled", () => {
      const button = document.createElement("button");
      button.disabled = true;
      expect(isAriaDisabled(button)).toBe(true);
    });
  });

  describe("isAriaExpanded", () => {
    it("should return null when not set", () => {
      const button = document.createElement("button");
      expect(isAriaExpanded(button)).toBe(null);
    });

    it("should return boolean when set", () => {
      const button = document.createElement("button");
      button.setAttribute("aria-expanded", "true");
      expect(isAriaExpanded(button)).toBe(true);

      button.setAttribute("aria-expanded", "false");
      expect(isAriaExpanded(button)).toBe(false);
    });
  });

  describe("isAriaPressed", () => {
    it("should return null when not set", () => {
      const button = document.createElement("button");
      expect(isAriaPressed(button)).toBe(null);
    });

    it("should return boolean or mixed", () => {
      const button = document.createElement("button");

      button.setAttribute("aria-pressed", "true");
      expect(isAriaPressed(button)).toBe(true);

      button.setAttribute("aria-pressed", "false");
      expect(isAriaPressed(button)).toBe(false);

      button.setAttribute("aria-pressed", "mixed");
      expect(isAriaPressed(button)).toBe("mixed");
    });
  });

  describe("isAriaChecked", () => {
    it("should detect aria-checked", () => {
      const checkbox = document.createElement("div");
      checkbox.setAttribute("role", "checkbox");

      checkbox.setAttribute("aria-checked", "true");
      expect(isAriaChecked(checkbox)).toBe(true);

      checkbox.setAttribute("aria-checked", "mixed");
      expect(isAriaChecked(checkbox)).toBe("mixed");
    });

    it("should detect native checked", () => {
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.checked = true;

      expect(isAriaChecked(checkbox)).toBe(true);
    });
  });

  describe("isAriaSelected", () => {
    it("should detect aria-selected", () => {
      const option = document.createElement("div");
      expect(isAriaSelected(option)).toBe(false);

      option.setAttribute("aria-selected", "true");
      expect(isAriaSelected(option)).toBe(true);
    });
  });

  describe("isAriaRequired", () => {
    it("should detect aria-required", () => {
      const input = document.createElement("input");
      expect(isAriaRequired(input)).toBe(false);

      input.setAttribute("aria-required", "true");
      expect(isAriaRequired(input)).toBe(true);
    });

    it("should detect native required", () => {
      const input = document.createElement("input");
      input.required = true;
      expect(isAriaRequired(input)).toBe(true);
    });
  });

  describe("isAriaInvalid", () => {
    it("should detect aria-invalid states", () => {
      const input = document.createElement("input");
      expect(isAriaInvalid(input)).toBe(false);

      input.setAttribute("aria-invalid", "true");
      expect(isAriaInvalid(input)).toBe(true);

      input.setAttribute("aria-invalid", "grammar");
      expect(isAriaInvalid(input)).toBe("grammar");

      input.setAttribute("aria-invalid", "spelling");
      expect(isAriaInvalid(input)).toBe("spelling");
    });
  });

  describe("isAriaHidden", () => {
    it("should detect aria-hidden", () => {
      const div = document.createElement("div");
      expect(isAriaHidden(div)).toBe(false);

      div.setAttribute("aria-hidden", "true");
      expect(isAriaHidden(div)).toBe(true);
    });
  });

  describe("getAriaActiveDescendant", () => {
    it("should get aria-activedescendant", () => {
      const listbox = document.createElement("div");
      expect(getAriaActiveDescendant(listbox)).toBe(null);

      listbox.setAttribute("aria-activedescendant", "option-1");
      expect(getAriaActiveDescendant(listbox)).toBe("option-1");
    });
  });

  describe("getAriaValueNow", () => {
    it("should get aria-valuenow as number", () => {
      const slider = document.createElement("div");
      expect(getAriaValueNow(slider)).toBe(null);

      slider.setAttribute("aria-valuenow", "50");
      expect(getAriaValueNow(slider)).toBe(50);
    });
  });

  describe("getAriaState", () => {
    it("should return complete ARIA state", () => {
      const button = document.createElement("button");
      button.setAttribute("aria-pressed", "true");
      button.setAttribute("aria-disabled", "true");
      button.textContent = "Toggle";

      const state = getAriaState(button);

      expect(state.role).toBe("button");
      expect(state.pressed).toBe(true);
      expect(state.disabled).toBe(true);
      expect(state.label).toBe("Toggle");
    });
  });

  describe("assertAriaRole", () => {
    it("should pass for matching role", () => {
      const button = document.createElement("button");
      expect(() => assertAriaRole(button, "button")).not.toThrow();
    });

    it("should throw for non-matching role", () => {
      const button = document.createElement("button");
      expect(() => assertAriaRole(button, "link")).toThrow();
    });
  });

  describe("assertAccessible", () => {
    it("should pass for accessible button", () => {
      const button = document.createElement("button");
      button.textContent = "Click me";
      expect(() => assertAccessible(button)).not.toThrow();
    });

    it("should throw for unlabeled interactive element", () => {
      // A div with role="button" but no label - this is a common accessibility issue
      const div = document.createElement("div");
      div.setAttribute("role", "slider");
      expect(() => assertAccessible(div)).toThrow();
    });
  });
});

// ============================================
// FOCUS UTILITIES
// ============================================

describe("focus utilities", () => {
  afterEach(() => {
    cleanup();
    cleanupTestEnvironment();
  });

  describe("getFocusedElement", () => {
    it("should return the focused element", () => {
      const button = document.createElement("button");
      document.body.appendChild(button);
      button.focus();

      expect(getFocusedElement()).toBe(button);

      button.remove();
    });
  });

  describe("isFocused", () => {
    it("should check if element is focused", () => {
      const button = document.createElement("button");
      document.body.appendChild(button);

      expect(isFocused(button)).toBe(false);
      button.focus();
      expect(isFocused(button)).toBe(true);

      button.remove();
    });
  });

  describe("isFocusWithin", () => {
    it("should check if focus is within container", () => {
      const container = document.createElement("div");
      const button = document.createElement("button");
      container.appendChild(button);
      document.body.appendChild(container);

      expect(isFocusWithin(container)).toBe(false);
      button.focus();
      expect(isFocusWithin(container)).toBe(true);

      container.remove();
    });
  });

  describe("getFocusableElements", () => {
    it("should return all focusable elements", () => {
      const container = document.createElement("div");
      container.innerHTML = `
        <button>Button</button>
        <input type="text" />
        <a href="#">Link</a>
        <div>Not focusable</div>
        <button disabled>Disabled</button>
      `;
      document.body.appendChild(container);

      const focusable = getFocusableElements(container);
      expect(focusable).toHaveLength(3); // button, input, link (disabled is excluded)

      container.remove();
    });
  });

  describe("getTabbableElements", () => {
    it("should return tabbable elements in order", () => {
      const container = document.createElement("div");
      container.innerHTML = `
        <button>Button 1</button>
        <button tabindex="-1">Not tabbable</button>
        <button>Button 2</button>
      `;
      document.body.appendChild(container);

      const tabbable = getTabbableElements(container);
      expect(tabbable).toHaveLength(2);

      container.remove();
    });
  });

  describe("getFirstFocusable / getLastFocusable", () => {
    it("should return first and last focusable elements", () => {
      const container = document.createElement("div");
      container.innerHTML = `
        <button>First</button>
        <input type="text" />
        <button>Last</button>
      `;
      document.body.appendChild(container);

      const first = getFirstFocusable(container);
      const last = getLastFocusable(container);

      expect(first?.textContent).toBe("First");
      expect(last?.textContent).toBe("Last");

      container.remove();
    });
  });

  describe("waitForFocus", () => {
    it("should resolve when element receives focus", async () => {
      const button = document.createElement("button");
      document.body.appendChild(button);

      setTimeout(() => button.focus(), 10);

      await waitForFocus(button, { timeout: 100 });
      expect(document.activeElement).toBe(button);

      button.remove();
    });

    it("should resolve immediately if already focused", async () => {
      const button = document.createElement("button");
      document.body.appendChild(button);
      button.focus();

      await waitForFocus(button, { timeout: 100 });
      expect(document.activeElement).toBe(button);

      button.remove();
    });

    it("should reject on timeout", async () => {
      const button = document.createElement("button");
      document.body.appendChild(button);

      await expect(waitForFocus(button, { timeout: 50 })).rejects.toThrow();

      button.remove();
    });
  });

  describe("assertFocused", () => {
    it("should pass when element is focused", () => {
      const button = document.createElement("button");
      document.body.appendChild(button);
      button.focus();

      expect(() => assertFocused(button)).not.toThrow();

      button.remove();
    });

    it("should throw when element is not focused", () => {
      const button = document.createElement("button");
      document.body.appendChild(button);

      expect(() => assertFocused(button)).toThrow();

      button.remove();
    });
  });

  describe("assertFocusWithin", () => {
    it("should pass when focus is within container", () => {
      const container = document.createElement("div");
      const button = document.createElement("button");
      container.appendChild(button);
      document.body.appendChild(container);
      button.focus();

      expect(() => assertFocusWithin(container)).not.toThrow();

      container.remove();
    });
  });
});

// ============================================
// SETUP UTILITIES
// ============================================

describe("setup utilities", () => {
  describe("setupTestEnvironment", () => {
    it("should install all polyfills", () => {
      setupTestEnvironment();

      // Check that PointerEvent is available
      expect(typeof PointerEvent).toBe("function");

      // Check that ResizeObserver is available
      expect(typeof ResizeObserver).toBe("function");

      // Check that IntersectionObserver is available
      expect(typeof IntersectionObserver).toBe("function");
    });
  });

  describe("wait", () => {
    it("should wait for specified duration", async () => {
      const start = Date.now();
      await wait(50);
      const duration = Date.now() - start;

      expect(duration).toBeGreaterThanOrEqual(45);
    });
  });

  describe("waitFor", () => {
    it("should wait for condition to be true", async () => {
      let value = false;
      setTimeout(() => {
        value = true;
      }, 20);

      await waitFor(() => value, { timeout: 100 });
      expect(value).toBe(true);
    });

    it("should reject on timeout", async () => {
      await expect(waitFor(() => false, { timeout: 50 })).rejects.toThrow("Timeout");
    });
  });
});
