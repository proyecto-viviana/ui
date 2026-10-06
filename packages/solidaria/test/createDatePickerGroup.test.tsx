import { describe, it, expect, vi, beforeEach, afterEach } from "vite-plus/test";
import { createRoot } from "solid-js";
import { render, screen, cleanup, fireEvent } from "@solidjs/testing-library";
import { createDatePickerGroup } from "../src/datepicker/createDatePickerGroup";
import { createPress } from "../src/interactions/createPress";
import { I18nProvider } from "../src/i18n";
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

  it("handles keydown when child replaces target mid-bubble", () => {
    const groupProps = makeGroup();
    const detached = document.createElement("span");
    const event = new KeyboardEvent("keydown", {
      key: "ArrowDown",
      altKey: true,
      bubbles: true,
    });
    Object.defineProperty(event, "currentTarget", { value: mockRef, writable: false });
    Object.defineProperty(event, "target", { value: detached, writable: false });
    Object.defineProperty(event, "composedPath", {
      value: () => [detached, mockRef, document.body],
      writable: false,
    });
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

/** Month filled, day and year still placeholders, then chrome and the calendar button. */
function PartialPickerGroup() {
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
      <span role="spinbutton" tabIndex={0} data-testid="month">
        06
      </span>
      <span role="spinbutton" tabIndex={0} data-placeholder="" data-testid="day">
        dd
      </span>
      <span role="spinbutton" tabIndex={0} data-placeholder="" data-testid="year">
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

  it("focuses the first trailing placeholder when field chrome is pressed", () => {
    render(() => <PartialPickerGroup />);

    fireMousePointerDown(screen.getByTestId("chrome"));

    expect(document.activeElement).toBe(screen.getByTestId("day"));
  });
});

function stubLeft(element: HTMLElement, left: number) {
  vi.spyOn(element, "getBoundingClientRect").mockReturnValue({
    x: left,
    y: 0,
    left,
    top: 0,
    right: left + 20,
    bottom: 20,
    width: 20,
    height: 20,
    toJSON() {
      return {};
    },
  });
}

/** DOM order is the reverse of visual order, which is the RTL segment case. */
function RtlSegmentGroup() {
  let groupEl: HTMLDivElement | undefined;
  const groupProps = createDatePickerGroup({ setOpen: () => {} }, () => groupEl ?? null);
  return (
    <div
      ref={(el) => {
        groupEl = el;
      }}
      {...groupProps()}
      data-testid="group"
    >
      <span role="spinbutton" tabIndex={0} data-testid="dom0">
        yyyy
      </span>
      <span role="spinbutton" tabIndex={0} data-testid="dom1">
        dd
      </span>
      <span role="spinbutton" tabIndex={0} data-testid="dom2">
        mm
      </span>
    </div>
  );
}

function keyOn(element: HTMLElement, key: string) {
  const event = new KeyboardEvent("keydown", { key, bubbles: true, cancelable: true });
  element.dispatchEvent(event);
  return event;
}

describe("createDatePickerGroup RTL arrows", () => {
  afterEach(() => {
    cleanup();
  });

  it("does not consume an RTL arrow that has no segment in that direction", () => {
    render(() => (
      <I18nProvider locale="he-IL">
        <RtlSegmentGroup />
      </I18nProvider>
    ));

    const dom0 = screen.getByTestId("dom0");
    const dom1 = screen.getByTestId("dom1");
    const dom2 = screen.getByTestId("dom2");
    // Visual positions run opposite the DOM: dom2 is the leftmost segment.
    stubLeft(dom0, 200);
    stubLeft(dom1, 100);
    stubLeft(dom2, 0);

    dom1.focus();
    const towardLeft = keyOn(dom1, "ArrowLeft");
    expect(towardLeft.defaultPrevented).toBe(true);
    expect(document.activeElement).toBe(dom2);

    dom2.focus();
    const towardRight = keyOn(dom2, "ArrowRight");
    expect(towardRight.defaultPrevented).toBe(true);
    expect(document.activeElement).toBe(dom1);

    dom2.focus();
    const pastLeft = keyOn(dom2, "ArrowLeft");
    expect(pastLeft.defaultPrevented).toBe(false);
    expect(document.activeElement).toBe(dom2);

    dom0.focus();
    const pastRight = keyOn(dom0, "ArrowRight");
    expect(pastRight.defaultPrevented).toBe(false);
    expect(document.activeElement).toBe(dom0);
  });
});
