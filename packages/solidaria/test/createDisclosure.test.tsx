import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent, waitFor } from "@solidjs/testing-library";
import { createRoot, createSignal } from "solid-js";
import { createDisclosureState, createDisclosureGroupState } from "@proyecto-viviana/solid-stately";
import { firePointerClick } from "@proyecto-viviana/solidaria-test-utils";
import { createDisclosure, createDisclosureGroup } from "../src/disclosure";

describe("createDisclosure", () => {
  afterEach(() => {
    cleanup();
  });

  it("wires trigger and panel ARIA attributes", async () => {
    function TestComponent() {
      let panelRef: HTMLDivElement | undefined;
      const state = createDisclosureState();
      const aria = createDisclosure({}, state, () => panelRef ?? null);

      return (
        <>
          <button {...aria.buttonProps} data-testid="trigger">
            Toggle
          </button>
          <div ref={panelRef} {...aria.panelProps} data-testid="panel">
            Content
          </div>
        </>
      );
    }

    render(() => <TestComponent />);
    const trigger = screen.getByTestId("trigger");
    const panel = screen.getByTestId("panel");

    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(trigger).toHaveAttribute("aria-controls", panel.id);
    expect(panel).toHaveAttribute("aria-labelledby", trigger.id);
    expect(panel).toHaveAttribute("role", "group");
    expect(panel).toHaveAttribute("aria-hidden", "true");
    await waitFor(() => {
      expect(panel).toHaveAttribute("hidden", "until-found");
      expect(panel.style.getPropertyValue("--disclosure-panel-width")).toBe("0px");
      expect(panel.style.getPropertyValue("--disclosure-panel-height")).toBe("0px");
    });
  });

  it("toggles panel visibility when pressed", async () => {
    function TestComponent() {
      let panelRef: HTMLDivElement | undefined;
      const state = createDisclosureState();
      const aria = createDisclosure({}, state, () => panelRef ?? null);

      return (
        <>
          <button {...aria.buttonProps} data-testid="trigger">
            Toggle
          </button>
          <div ref={panelRef} {...aria.panelProps} data-testid="panel">
            Content
          </div>
        </>
      );
    }

    render(() => <TestComponent />);
    const trigger = screen.getByTestId("trigger");
    const panel = screen.getByTestId("panel");

    await waitFor(() => {
      expect(panel).toHaveAttribute("hidden", "until-found");
      expect(panel).toHaveAttribute("aria-hidden", "true");
    });
    firePointerClick(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(panel).not.toHaveAttribute("hidden");
    expect(panel).toHaveAttribute("aria-hidden", "false");
    expect(panel.style.getPropertyValue("--disclosure-panel-width")).toBe("auto");
    expect(panel.style.getPropertyValue("--disclosure-panel-height")).toBe("auto");
  });

  it("toggles keyboard interactions on press start", async () => {
    function TestComponent() {
      let panelRef: HTMLDivElement | undefined;
      const state = createDisclosureState();
      const aria = createDisclosure({}, state, () => panelRef ?? null);

      return (
        <>
          <button {...aria.buttonProps} data-testid="trigger">
            Toggle
          </button>
          <div ref={panelRef} {...aria.panelProps} data-testid="panel">
            Content
          </div>
        </>
      );
    }

    render(() => <TestComponent />);
    const trigger = screen.getByTestId("trigger");

    fireEvent.keyDown(trigger, { key: "Enter", code: "Enter" });
    expect(trigger).toHaveAttribute("aria-expanded", "true");

    fireEvent.keyUp(trigger, { key: "Enter", code: "Enter" });
    expect(trigger).toHaveAttribute("aria-expanded", "true");
  });

  it("opens collapsed panels from beforematch", async () => {
    function TestComponent() {
      let panelRef: HTMLDivElement | undefined;
      const state = createDisclosureState();
      const aria = createDisclosure({}, state, () => panelRef ?? null);

      return (
        <>
          <button {...aria.buttonProps} data-testid="trigger">
            Toggle
          </button>
          <div ref={panelRef} {...aria.panelProps} data-testid="panel">
            Content
          </div>
        </>
      );
    }

    render(() => <TestComponent />);
    const trigger = screen.getByTestId("trigger");
    const panel = screen.getByTestId("panel");

    await waitFor(() => expect(panel).toHaveAttribute("hidden", "until-found"));
    panel.dispatchEvent(new Event("beforematch"));

    expect(trigger).toHaveAttribute("aria-expanded", "true");
    await waitFor(() => {
      expect(panel).not.toHaveAttribute("hidden");
      expect(panel).toHaveAttribute("aria-hidden", "false");
    });
  });

  it("sets pixel panel size while expanding and auto size after animations finish", async () => {
    let finishAnimation!: () => void;
    const finished = new Promise<void>((resolve) => {
      finishAnimation = resolve;
    });

    function TestComponent() {
      let panelRef: HTMLDivElement | undefined;
      const state = createDisclosureState();
      const aria = createDisclosure({}, state, () => panelRef ?? null);

      return (
        <>
          <button {...aria.buttonProps} data-testid="trigger">
            Toggle
          </button>
          <div
            ref={(el) => {
              panelRef = el;
              Object.defineProperty(el, "scrollWidth", { value: 123, configurable: true });
              Object.defineProperty(el, "scrollHeight", { value: 45, configurable: true });
              el.getAnimations = () => [{ finished }] as Animation[];
            }}
            {...aria.panelProps}
            data-testid="panel"
          >
            Content
          </div>
        </>
      );
    }

    render(() => <TestComponent />);
    const trigger = screen.getByTestId("trigger");
    const panel = screen.getByTestId("panel");

    await waitFor(() => expect(panel).toHaveAttribute("hidden", "until-found"));
    firePointerClick(trigger);

    expect(panel).not.toHaveAttribute("hidden");
    expect(panel.style.getPropertyValue("--disclosure-panel-width")).toBe("123px");
    expect(panel.style.getPropertyValue("--disclosure-panel-height")).toBe("45px");

    finishAnimation();
    await waitFor(() => {
      expect(panel.style.getPropertyValue("--disclosure-panel-width")).toBe("auto");
      expect(panel.style.getPropertyValue("--disclosure-panel-height")).toBe("auto");
    });
  });

  it("delays hidden until collapse animations finish", async () => {
    let finishAnimation!: () => void;
    const finished = new Promise<void>((resolve) => {
      finishAnimation = resolve;
    });

    function TestComponent() {
      let panelRef: HTMLDivElement | undefined;
      const state = createDisclosureState({ defaultExpanded: true });
      const aria = createDisclosure({}, state, () => panelRef ?? null);

      return (
        <>
          <button {...aria.buttonProps} data-testid="trigger">
            Toggle
          </button>
          <div
            ref={(el) => {
              panelRef = el;
              Object.defineProperty(el, "scrollWidth", { value: 123, configurable: true });
              Object.defineProperty(el, "scrollHeight", { value: 45, configurable: true });
              el.getAnimations = () => [{ finished }] as Animation[];
            }}
            {...aria.panelProps}
            data-testid="panel"
          >
            Content
          </div>
        </>
      );
    }

    render(() => <TestComponent />);
    const trigger = screen.getByTestId("trigger");
    const panel = screen.getByTestId("panel");

    await waitFor(() =>
      expect(panel.style.getPropertyValue("--disclosure-panel-width")).toBe("auto"),
    );
    firePointerClick(trigger);

    expect(panel).toHaveAttribute("aria-hidden", "true");
    expect(panel).not.toHaveAttribute("hidden");
    expect(panel.style.getPropertyValue("--disclosure-panel-width")).toBe("0px");
    expect(panel.style.getPropertyValue("--disclosure-panel-height")).toBe("0px");

    finishAnimation();
    await waitFor(() => expect(panel).toHaveAttribute("hidden", "until-found"));
  });

  it("does not toggle when disabled", () => {
    function TestComponent() {
      let panelRef: HTMLDivElement | undefined;
      const state = createDisclosureState();
      const aria = createDisclosure({ isDisabled: true }, state, () => panelRef ?? null);

      return (
        <button {...aria.buttonProps} data-testid="trigger">
          Toggle
        </button>
      );
    }

    render(() => <TestComponent />);
    const trigger = screen.getByTestId("trigger");

    firePointerClick(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(trigger).toBeDisabled();
  });
});

describe("createDisclosureGroup", () => {
  it("does not add extra ARIA semantics to the group root", () => {
    createRoot((dispose) => {
      const state = createDisclosureGroupState({ isDisabled: true });
      const aria = createDisclosureGroup({}, state);

      expect(aria.groupProps.role).toBeUndefined();
      expect(aria.groupProps["aria-disabled"]).toBeUndefined();
      dispose();
    });
  });

  it("keeps group root props empty when isDisabled changes", () => {
    createRoot((dispose) => {
      const [isDisabled, setIsDisabled] = createSignal(false);
      const state = createDisclosureGroupState(() => ({ isDisabled: isDisabled() }));
      const aria = createDisclosureGroup(() => ({ isDisabled: isDisabled() }), state);

      expect(aria.groupProps["aria-disabled"]).toBeUndefined();

      setIsDisabled(true);
      expect(aria.groupProps.role).toBeUndefined();
      expect(aria.groupProps["aria-disabled"]).toBeUndefined();
      dispose();
    });
  });
});
