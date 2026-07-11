import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen, cleanup, fireEvent } from "@solidjs/testing-library";
import { GregorianCalendar } from "@internationalized/date";
import { createDateSegment } from "../src/datepicker/createDateSegment";
import { hookData } from "../src/datepicker/createDateField";
import { I18nProvider } from "../src/i18n";

type Seg = {
  type: "day" | "month" | "year";
  text: string;
  value?: number;
  minValue?: number;
  maxValue?: number;
  isEditable: boolean;
  isPlaceholder: boolean;
  placeholder: string;
};

type MockState = {
  isDisabled: () => boolean;
  isReadOnly: () => boolean;
  isRequired: () => boolean;
  isInvalid: () => boolean;
  dateFormatter: Intl.DateTimeFormat;
  dateValue: () => Date;
  calendar: GregorianCalendar;
  segments: () => Seg[];
  increment: ReturnType<typeof vi.fn>;
  decrement: ReturnType<typeof vi.fn>;
  incrementPage: ReturnType<typeof vi.fn>;
  decrementPage: ReturnType<typeof vi.fn>;
  incrementToMax: ReturnType<typeof vi.fn>;
  decrementToMin: ReturnType<typeof vi.fn>;
  setSegment: ReturnType<typeof vi.fn>;
  clearSegment: ReturnType<typeof vi.fn>;
};

const DEFAULT_SEG: Seg = {
  type: "day",
  text: "15",
  value: 15,
  minValue: 1,
  maxValue: 31,
  isEditable: true,
  isPlaceholder: false,
  placeholder: "dd",
};

/**
 * Render a single faithful date segment. Unlike upstream's real `DateField`, the
 * segment's shared focus manager arrives through the `hookData` WeakMap (which
 * `createDateField` populates in production); the test injects a mock so the
 * focus-movement paths (backspace-on-placeholder, numeric auto-advance) are
 * observable without relying on jsdom's unreliable real focus.
 */
function renderSegment(options?: { locale?: string; segment?: Seg }) {
  let segmentRef: HTMLElement | null = null;
  const segment = options?.segment ?? DEFAULT_SEG;

  const state: MockState = {
    isDisabled: () => false,
    isReadOnly: () => false,
    isRequired: () => false,
    isInvalid: () => false,
    dateFormatter: new Intl.DateTimeFormat(options?.locale ?? "en-US", {
      year: "numeric",
      month: "numeric",
      day: "numeric",
    }),
    dateValue: () => new Date(2025, 1, 15),
    calendar: new GregorianCalendar(),
    segments: () => [segment],
    increment: vi.fn(),
    decrement: vi.fn(),
    incrementPage: vi.fn(),
    decrementPage: vi.fn(),
    incrementToMax: vi.fn(),
    decrementToMin: vi.fn(),
    setSegment: vi.fn(),
    clearSegment: vi.fn(),
  };

  const focusManager = {
    focusFirst: vi.fn(),
    focusLast: vi.fn(),
    focusNext: vi.fn(() => null),
    focusPrevious: vi.fn(() => null),
  };

  // Publish the shared focus manager the way createDateField would.
  hookData.set(state as unknown as object, {
    focusManager: focusManager as never,
  });

  function Inner() {
    const aria = createDateSegment(
      () => ({ segment }),
      state as never,
      () => segmentRef,
    );

    return (
      <div ref={(el) => (segmentRef = el)} data-testid="segment" {...(aria.segmentProps as any)}>
        {segment.text}
      </div>
    );
  }

  render(() => (
    <I18nProvider locale={options?.locale ?? "en-US"}>
      <Inner />
    </I18nProvider>
  ));

  return { state, focusManager };
}

/** Dispatch a native beforeinput InputEvent (the faithful entry channel). */
function beforeInput(el: HTMLElement, data: string) {
  el.dispatchEvent(
    new InputEvent("beforeinput", {
      data,
      inputType: "insertText",
      bubbles: true,
      cancelable: true,
    }),
  );
}

describe("createDateSegment", () => {
  afterEach(() => {
    cleanup();
  });

  it("exposes the spinbutton contract for an editable segment", () => {
    renderSegment();
    const segment = screen.getByTestId("segment");

    expect(segment).toHaveAttribute("role", "spinbutton");
    expect(segment).toHaveAttribute("tabindex", "0");
    expect(segment).toHaveAttribute("aria-valuenow", "15");
    expect(segment).toHaveAttribute("contenteditable", "true");
    // Composed from the localized part name ("day") via useDisplayNames.
    expect(segment.getAttribute("aria-label")).toMatch(/day/i);
  });

  it("routes ArrowUp/ArrowDown to the spinbutton value model", () => {
    const { state } = renderSegment();
    const segment = screen.getByTestId("segment");

    fireEvent.keyDown(segment, { key: "ArrowUp" });
    expect(state.increment).toHaveBeenCalledWith("day");

    fireEvent.keyDown(segment, { key: "ArrowDown" });
    expect(state.decrement).toHaveBeenCalledWith("day");
  });

  it("routes PageUp/PageDown to the ±page steps", () => {
    const { state } = renderSegment();
    const segment = screen.getByTestId("segment");

    fireEvent.keyDown(segment, { key: "PageUp" });
    expect(state.incrementPage).toHaveBeenCalledWith("day");

    fireEvent.keyDown(segment, { key: "PageDown" });
    expect(state.decrementPage).toHaveBeenCalledWith("day");
  });

  it("routes Home/End to min/max (NOT segment navigation)", () => {
    const { state } = renderSegment();
    const segment = screen.getByTestId("segment");

    fireEvent.keyDown(segment, { key: "End" });
    expect(state.incrementToMax).toHaveBeenCalledWith("day");

    fireEvent.keyDown(segment, { key: "Home" });
    expect(state.decrementToMin).toHaveBeenCalledWith("day");
  });

  it("does not spin when a modifier key is held", () => {
    const { state } = renderSegment();
    const segment = screen.getByTestId("segment");

    fireEvent.keyDown(segment, { key: "ArrowUp", shiftKey: true });
    expect(state.increment).not.toHaveBeenCalled();
  });

  it("Backspace on a filled segment removes the last digit", () => {
    const { state } = renderSegment();
    const segment = screen.getByTestId("segment");

    // "15" → drop last digit → "1".
    fireEvent.keyDown(segment, { key: "Backspace" });
    expect(state.setSegment).toHaveBeenCalledWith("day", 1);
  });

  it("Backspace on a placeholder segment moves focus to the previous segment", () => {
    const { focusManager } = renderSegment({
      segment: {
        type: "day",
        text: "dd",
        minValue: 1,
        maxValue: 31,
        isEditable: true,
        isPlaceholder: true,
        placeholder: "dd",
      },
    });

    const segment = screen.getByTestId("segment");
    fireEvent.keyDown(segment, { key: "Backspace" });
    expect(focusManager.focusPrevious).toHaveBeenCalled();
  });

  it("commits typed digits through beforeinput", () => {
    const { state } = renderSegment({
      segment: {
        type: "day",
        text: "dd",
        minValue: 1,
        maxValue: 31,
        isEditable: true,
        isPlaceholder: true,
        placeholder: "dd",
      },
    });

    const segment = screen.getByTestId("segment");
    beforeInput(segment, "1");
    expect(state.setSegment).toHaveBeenCalledWith("day", 1);
  });

  it("resets the numeric buffer when the next digit would exceed the max", () => {
    const { state } = renderSegment({
      segment: {
        type: "day",
        text: "dd",
        minValue: 1,
        maxValue: 31,
        isEditable: true,
        isPlaceholder: true,
        placeholder: "dd",
      },
    });

    const segment = screen.getByTestId("segment");
    // "4" completes the tens digit (40 > 31) → auto-advance + buffer reset;
    // "2" then starts fresh.
    beforeInput(segment, "4");
    beforeInput(segment, "2");

    expect(state.setSegment).toHaveBeenNthCalledWith(1, "day", 4);
    expect(state.setSegment).toHaveBeenNthCalledWith(2, "day", 2);
  });

  it("auto-advances to the next segment when the entry completes the value", () => {
    const { state, focusManager } = renderSegment({
      segment: {
        type: "day",
        text: "dd",
        minValue: 1,
        maxValue: 31,
        isEditable: true,
        isPlaceholder: true,
        placeholder: "dd",
      },
    });

    const segment = screen.getByTestId("segment");
    beforeInput(segment, "1");
    beforeInput(segment, "2");

    expect(state.setSegment).toHaveBeenNthCalledWith(2, "day", 12);
    expect(focusManager.focusNext).toHaveBeenCalled();
  });

  it("accepts full-width digits in typed input", () => {
    const { state } = renderSegment({
      segment: {
        type: "day",
        text: "dd",
        minValue: 1,
        maxValue: 31,
        isEditable: true,
        isPlaceholder: true,
        placeholder: "dd",
      },
    });

    const segment = screen.getByTestId("segment");
    beforeInput(segment, "１");
    beforeInput(segment, "２");

    expect(state.setSegment).toHaveBeenNthCalledWith(1, "day", 1);
    expect(state.setSegment).toHaveBeenNthCalledWith(2, "day", 12);
  });
});
