import { describe, it, expect, vi, beforeEach, afterEach } from "vite-plus/test";
import { createRoot } from "solid-js";
import { render, screen, cleanup, fireEvent } from "@solidjs/testing-library";
import { createDatePickerGroup } from "../src/datepicker/createDatePickerGroup";
import { createPress } from "../src/interactions/createPress";
import { createPointerEvent } from "@proyecto-viviana/solidaria-test-utils";

describe("createDatePickerGroup", () => {
  let mockRef: HTMLDivElement;
  let state: { setOpen: (v: boolean) => void };
  let dispose: () => void;

  beforeEach(() => {
    mockRef = document.createElement("div");
    mockRef.setAttribute("role", "group");
    mockRef.innerHTML = `
      <span role="spinbutton" tabindex="0">01</span>
      <span role="spinbutton" tabindex="0">15</span>
      <span role="spinbutton" tabindex="0">2024</span>
    `;
    document.body.appendChild(mockRef);

    state = {
      setOpen: vi.fn(),
    };
  });

  afterEach(() => {
    mockRef.remove();
    dispose?.();
  });

  function keydown(key: string, modifiers?: { altKey?: boolean }) {
    const event = new KeyboardEvent("keydown", {
      key,
      altKey: modifiers?.altKey ?? false,
      bubbles: true,
    });
    Object.defineProperty(event, "currentTarget", { value: mockRef, writable: false });
    Object.defineProperty(event, "target", { value: mockRef, writable: false });
    return event;
  }

  /**
   * The faithful hook is a reactive accessor of the merged group props (press +
   * keyboard), created inside a root so the memo has an owner.
   */
  function makeGroup(disableArrowNavigation?: boolean) {
    return createRoot((d) => {
      dispose = d;
      const groupProps = createDatePickerGroup(state, () => mockRef, disableArrowNavigation);
      return groupProps;
    });
  }

  it("Alt+ArrowDown opens calendar", () => {
    const groupProps = makeGroup();
    const event = keydown("ArrowDown", { altKey: true });
    (groupProps().onKeyDown as (e: KeyboardEvent) => void)(event);
    expect(state.setOpen).toHaveBeenCalledWith(true);
  });

  it("Alt+ArrowUp opens calendar", () => {
    const groupProps = makeGroup();
    const event = keydown("ArrowUp", { altKey: true });
    (groupProps().onKeyDown as (e: KeyboardEvent) => void)(event);
    expect(state.setOpen).toHaveBeenCalledWith(true);
  });

  it("ArrowRight moves focus to next segment in LTR", () => {
    const segments = mockRef.querySelectorAll<HTMLElement>('[role="spinbutton"]');
    segments[0].focus();

    const groupProps = makeGroup();
    const event = keydown("ArrowRight");
    (groupProps().onKeyDown as (e: KeyboardEvent) => void)(event);
    expect(document.activeElement).toBe(segments[1]);
  });

  it("ArrowLeft moves focus to previous segment in LTR", () => {
    const segments = mockRef.querySelectorAll<HTMLElement>('[role="spinbutton"]');
    segments[1].focus();

    const groupProps = makeGroup();
    const event = keydown("ArrowLeft");
    (groupProps().onKeyDown as (e: KeyboardEvent) => void)(event);
    expect(document.activeElement).toBe(segments[0]);
  });

  it("does not navigate segments when arrow navigation is disabled", () => {
    const segments = mockRef.querySelectorAll<HTMLElement>('[role="spinbutton"]');
    segments[0].focus();

    const groupProps = makeGroup(true);
    const event = keydown("ArrowRight");
    (groupProps().onKeyDown as (e: KeyboardEvent) => void)(event);
    expect(document.activeElement).toBe(segments[0]);
  });

  it("pressProps includes onPointerDown for mouse focus", () => {
    const groupProps = makeGroup();
    expect(groupProps().onPointerDown).toBeTypeOf("function");
  });
});

function fireMousePointerDown(el: Element) {
  const event = createPointerEvent("pointerdown", {
    pointerId: 1,
    pointerType: "mouse",
  });
  Object.defineProperty(window, "event", { configurable: true, value: event });
  fireEvent(el, event);
}

function PickerGroupWithTrigger() {
  let groupEl: HTMLDivElement | undefined;
  const groupProps = createDatePickerGroup({ setOpen: () => {} }, () => groupEl ?? null);
  const trigger = createPress();
  return (
    <div
      ref={(el) => {
        groupEl = el;
      }}
      {...groupProps()}
      data-testid="group"
    >
      <span role="spinbutton" tabIndex={0} data-placeholder="">
        mm
      </span>
      <span role="spinbutton" tabIndex={0} data-placeholder="">
        dd
      </span>
      <span role="spinbutton" tabIndex={0} data-placeholder="">
        yyyy
      </span>
      <span data-testid="chrome">field</span>
      <button type="button" {...trigger.pressProps} data-testid="trigger">
        calendar
      </button>
    </div>
  );
}

describe("createDatePickerGroup nested trigger press", () => {
  afterEach(() => {
    cleanup();
  });

  it("does not focusLast a spinbutton when the nested calendar button is pressed", () => {
    render(() => <PickerGroupWithTrigger />);

    const trigger = screen.getByTestId("trigger");
    fireMousePointerDown(trigger);
    fireMousePointerDown(trigger);

    expect(document.activeElement).not.toHaveAttribute("role", "spinbutton");
  });

  it("focusLast on a field press that is not the calendar button", () => {
    render(() => <PickerGroupWithTrigger />);

    fireMousePointerDown(screen.getByTestId("chrome"));

    expect(document.activeElement).toHaveAttribute("role", "spinbutton");
  });
});
