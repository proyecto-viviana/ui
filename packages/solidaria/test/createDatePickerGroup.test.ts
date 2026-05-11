import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createDatePickerGroup } from "../src/datepicker/createDatePickerGroup";

describe("createDatePickerGroup", () => {
  let mockRef: HTMLDivElement;
  let state: { setOpen: (v: boolean) => void; isOpen: boolean; isDisabled: () => boolean };

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
      isOpen: false,
      isDisabled: () => false,
    };
  });

  afterEach(() => {
    mockRef.remove();
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

  it("Alt+ArrowDown opens calendar", () => {
    const group = createDatePickerGroup({}, state, () => mockRef);
    const event = keydown("ArrowDown", { altKey: true });
    (group.groupProps.onKeyDown as (e: KeyboardEvent) => void)(event);
    expect(state.setOpen).toHaveBeenCalledWith(true);
  });

  it("Alt+ArrowUp opens calendar", () => {
    const group = createDatePickerGroup({}, state, () => mockRef);
    const event = keydown("ArrowUp", { altKey: true });
    (group.groupProps.onKeyDown as (e: KeyboardEvent) => void)(event);
    expect(state.setOpen).toHaveBeenCalledWith(true);
  });

  it("ArrowRight moves focus to next segment in LTR", () => {
    const segments = mockRef.querySelectorAll<HTMLElement>('[role="spinbutton"]');
    segments[0].focus();

    const group = createDatePickerGroup({}, state, () => mockRef);
    const event = keydown("ArrowRight");
    (group.groupProps.onKeyDown as (e: KeyboardEvent) => void)(event);
    expect(document.activeElement).toBe(segments[1]);
  });

  it("ArrowLeft moves focus to previous segment in LTR", () => {
    const segments = mockRef.querySelectorAll<HTMLElement>('[role="spinbutton"]');
    segments[1].focus();

    const group = createDatePickerGroup({}, state, () => mockRef);
    const event = keydown("ArrowLeft");
    (group.groupProps.onKeyDown as (e: KeyboardEvent) => void)(event);
    expect(document.activeElement).toBe(segments[0]);
  });

  it("pressProps includes onPointerDown for mouse focus", () => {
    const group = createDatePickerGroup({}, state, () => mockRef);
    expect(group.groupProps.onPointerDown).toBeTypeOf("function");
  });
});
