/**
 * StepList tests
 *
 * Tests for the StepList headless component covering:
 * - Rendering
 * - Selection
 * - Completion tracking
 * - Keyboard navigation
 * - Disabled / read-only states
 * - Controlled mode
 */

import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@solidjs/testing-library";
import { createSignal } from "solid-js";
import { StepList, Step } from "../src/StepList";
import type { Key } from "@proyecto-viviana/solid-stately";

// Test data
interface TestStep {
  key: string;
  label: string;
}

const testSteps: TestStep[] = [
  { key: "step1", label: "Account" },
  { key: "step2", label: "Profile" },
  { key: "step3", label: "Review" },
  { key: "step4", label: "Confirm" },
];

// Helper component that uses Step sub-component for reactive rendering
function TestStepList(props: {
  stepListProps?: Partial<Parameters<typeof StepList<TestStep>>[0]>;
  steps?: TestStep[];
}) {
  const steps = props.steps || testSteps;
  return (
    <StepList<TestStep> items={steps} aria-label="Test Steps" {...props.stepListProps}>
      {(item, state) => (
        <Step item={item} stepNumber={state.stepNumber}>
          <span data-testid={`indicator-${item.key}`}>{state.stepNumber}</span>
          <span data-testid={`state-${item.key}`}>{state.stepStateText}</span>
          <span data-testid={`label-${item.key}`}>{item.label}</span>
        </Step>
      )}
    </StepList>
  );
}

// Helpers to query step elements
function getStepLi(n: number): HTMLLIElement {
  return document.querySelector(`ol > li:nth-child(${n})`) as HTMLLIElement;
}
function getStepLink(n: number): HTMLAnchorElement {
  return document.querySelector(`ol > li:nth-child(${n}) a`) as HTMLAnchorElement;
}

describe("StepList", () => {
  afterEach(() => {
    cleanup();
  });

  // ============================================
  // RENDERING
  // ============================================

  describe("rendering", () => {
    it("should render all steps with correct numbers", () => {
      render(() => <TestStepList />);

      expect(screen.getByTestId("indicator-step1")).toHaveTextContent("1");
      expect(screen.getByTestId("indicator-step2")).toHaveTextContent("2");
      expect(screen.getByTestId("indicator-step3")).toHaveTextContent("3");
      expect(screen.getByTestId("indicator-step4")).toHaveTextContent("4");
    });

    it("should render all step labels", () => {
      render(() => <TestStepList />);

      expect(screen.getByTestId("label-step1")).toHaveTextContent("Account");
      expect(screen.getByTestId("label-step2")).toHaveTextContent("Profile");
      expect(screen.getByTestId("label-step3")).toHaveTextContent("Review");
      expect(screen.getByTestId("label-step4")).toHaveTextContent("Confirm");
    });

    it("should render as an ordered list", () => {
      render(() => <TestStepList />);

      const ol = document.querySelector("ol");
      expect(ol).toBeInTheDocument();
      expect(ol?.getAttribute("aria-label")).toBe("Test Steps");
    });

    it("should apply default class", () => {
      render(() => <TestStepList />);

      const ol = document.querySelector("ol");
      expect(ol?.className).toContain("solidaria-StepList");
    });
  });

  // ============================================
  // SELECTION
  // ============================================

  describe("selection", () => {
    it("should select first step by default", () => {
      render(() => <TestStepList />);

      const li1 = getStepLi(1);
      expect(li1.getAttribute("data-selected")).toBeTruthy();

      const link1 = getStepLink(1);
      expect(link1.getAttribute("aria-current")).toBe("step");
    });

    it("should select step on click", () => {
      const onSelectionChange = vi.fn();
      // Step 2 is selectable only once its predecessor (step 1) is completed —
      // there is no "next after the selected step" clause upstream.
      render(() => (
        <TestStepList
          stepListProps={{
            onSelectionChange,
            defaultSelectedKey: "step1",
            defaultLastCompletedStep: "step1",
          }}
        />
      ));

      const link2 = getStepLink(2);

      // Verify step 2 is selectable (its predecessor is completed)
      const li2Before = getStepLi(2);
      expect(li2Before.getAttribute("data-selectable")).toBeTruthy();

      fireEvent.click(link2);

      // Verify callback was called
      expect(onSelectionChange).toHaveBeenCalledWith("step2");

      // Step 2 should be selected, step 1 completed
      const li2 = getStepLi(2);
      expect(li2.getAttribute("data-selected")).toBeTruthy();

      // DOM is stable - same element reference
      expect(link2.getAttribute("aria-current")).toBe("step");

      const li1 = getStepLi(1);
      expect(li1.getAttribute("data-completed")).toBeTruthy();
    });

    it("should not select non-selectable steps (ahead of completion)", () => {
      render(() => <TestStepList />);

      // Step 3 is not selectable (step 2 is not completed)
      const li3 = getStepLi(3);
      expect(li3.getAttribute("data-selectable")).toBeFalsy();

      const link3 = getStepLink(3);
      fireEvent.click(link3);

      // Step 1 should still be selected
      const li1 = getStepLi(1);
      expect(li1.getAttribute("data-selected")).toBeTruthy();

      expect(li3.getAttribute("data-selected")).toBeFalsy();
    });

    it("should allow clicking completed steps", () => {
      render(() => (
        <TestStepList
          stepListProps={{
            defaultSelectedKey: "step3",
            defaultLastCompletedStep: "step2",
          }}
        />
      ));

      // Step 1 is completed, should be selectable
      const li1 = getStepLi(1);
      expect(li1.getAttribute("data-completed")).toBeTruthy();
      expect(li1.getAttribute("data-selectable")).toBeTruthy();

      const link1 = getStepLink(1);
      fireEvent.click(link1);

      expect(li1.getAttribute("data-selected")).toBeTruthy();
    });

    it("should auto-complete skipped steps when mounted ahead", () => {
      // Mounting with the selection two steps in (and no completion recorded)
      // auto-completes every intermediate step, mirroring react-stately
      // useStepListState's effect (selectedIdx > lastCompleted + 1).
      render(() => <TestStepList stepListProps={{ defaultSelectedKey: "step3" }} />);

      // Steps 1 and 2 are now completed (completion is cumulative).
      expect(getStepLi(1).getAttribute("data-completed")).toBeTruthy();
      expect(getStepLi(2).getAttribute("data-completed")).toBeTruthy();
      expect(screen.getByTestId("state-step1")).toHaveTextContent("Completed");
      expect(screen.getByTestId("state-step2")).toHaveTextContent("Completed");

      // Step 3 is the selected step.
      expect(getStepLi(3).getAttribute("data-selected")).toBeTruthy();
    });

    it("should respect defaultSelectedKey", () => {
      render(() => (
        <TestStepList
          stepListProps={{
            defaultSelectedKey: "step2",
            defaultLastCompletedStep: "step1",
          }}
        />
      ));

      const li2 = getStepLi(2);
      expect(li2.getAttribute("data-selected")).toBeTruthy();
    });
  });

  // ============================================
  // KEYBOARD NAVIGATION
  // ============================================

  describe("keyboard navigation", () => {
    it("should support Tab to navigate between selectable steps", () => {
      // With step 1 completed, steps 1 (completed) and 2 (predecessor completed)
      // are selectable/tabbable; step 3 remains out of the tab order.
      render(() => <TestStepList stepListProps={{ defaultLastCompletedStep: "step1" }} />);

      const link1 = getStepLink(1);
      expect(link1.getAttribute("tabindex")).toBe("0");

      const link2 = getStepLink(2);
      expect(link2.getAttribute("tabindex")).toBe("0");

      // Step 3 should not be focusable (its predecessor is not completed)
      const link3 = getStepLink(3);
      expect(link3.getAttribute("tabindex")).toBeNull();
    });

    it("should keep only the first step tabbable in a fresh list", () => {
      render(() => <TestStepList />);

      // Fresh state exposes only step 1 — the immediate-next step opens when its
      // predecessor is completed, not merely when the first step is selected.
      expect(getStepLink(1).getAttribute("tabindex")).toBe("0");
      expect(getStepLink(2).getAttribute("tabindex")).toBeNull();
      expect(getStepLink(3).getAttribute("tabindex")).toBeNull();
    });

    it("should select step on Enter key", () => {
      render(() => (
        <TestStepList
          stepListProps={{ defaultSelectedKey: "step1", defaultLastCompletedStep: "step1" }}
        />
      ));

      const link2 = getStepLink(2);
      link2.focus();
      fireEvent.keyDown(link2, { key: "Enter" });

      const li2 = getStepLi(2);
      expect(li2.getAttribute("data-selected")).toBeTruthy();
    });

    it("should select step on Space key", () => {
      render(() => (
        <TestStepList
          stepListProps={{ defaultSelectedKey: "step1", defaultLastCompletedStep: "step1" }}
        />
      ));

      const link2 = getStepLink(2);
      link2.focus();
      fireEvent.keyDown(link2, { key: " " });

      const li2 = getStepLi(2);
      expect(li2.getAttribute("data-selected")).toBeTruthy();
    });

    it("should prevent ArrowUp/ArrowDown", () => {
      render(() => <TestStepList />);

      const link1 = getStepLink(1);
      link1.focus();

      const downEvent = new KeyboardEvent("keydown", {
        key: "ArrowDown",
        bubbles: true,
        cancelable: true,
      });
      const prevented = !link1.dispatchEvent(downEvent);
      expect(prevented).toBe(true);
    });
  });

  // ============================================
  // DISABLED / READ-ONLY
  // ============================================

  describe("disabled", () => {
    it("should prevent all interaction when isDisabled", () => {
      render(() => <TestStepList stepListProps={{ isDisabled: true }} />);

      // All steps should be non-selectable
      const li1 = getStepLi(1);
      expect(li1.getAttribute("data-selectable")).toBeFalsy();

      const li2 = getStepLi(2);
      expect(li2.getAttribute("data-selectable")).toBeFalsy();

      // Disabled data attribute on the list
      const ol = document.querySelector("ol");
      expect(ol?.getAttribute("data-disabled")).toBeTruthy();
    });

    it("should prevent selection changes when isReadOnly", () => {
      render(() => <TestStepList stepListProps={{ isReadOnly: true }} />);

      // All steps should be non-selectable
      const li1 = getStepLi(1);
      expect(li1.getAttribute("data-selectable")).toBeFalsy();

      const link2 = getStepLink(2);
      fireEvent.click(link2);

      // Step 2 should not be selected
      const li2 = getStepLi(2);
      expect(li2.getAttribute("data-selected")).toBeFalsy();
    });

    it("should disable specific steps via disabledKeys", () => {
      render(() => (
        <TestStepList
          stepListProps={{
            disabledKeys: ["step2"],
            defaultLastCompletedStep: "step2",
            defaultSelectedKey: "step3",
          }}
        />
      ));

      // step2 is completed but disabled, so not selectable
      const li2 = getStepLi(2);
      expect(li2.getAttribute("data-selectable")).toBeFalsy();

      const link2 = getStepLink(2);
      fireEvent.click(link2);

      // Step 3 should still be selected
      const li3 = getStepLi(3);
      expect(li3.getAttribute("data-selected")).toBeTruthy();
      expect(li2.getAttribute("data-selected")).toBeFalsy();
    });
  });

  // ============================================
  // CONTROLLED MODE
  // ============================================

  describe("controlled", () => {
    it("should support controlled selectedKey", () => {
      const onSelectionChange = vi.fn();

      render(() => (
        <TestStepList
          stepListProps={{
            selectedKey: "step2",
            defaultLastCompletedStep: "step1",
            onSelectionChange,
          }}
        />
      ));

      const li2 = getStepLi(2);
      expect(li2.getAttribute("data-selected")).toBeTruthy();

      // Click step 1 (completed, so selectable)
      const link1 = getStepLink(1);
      fireEvent.click(link1);

      // Callback should fire
      expect(onSelectionChange).toHaveBeenCalledWith("step1");

      // But selection stays at step2 because it's controlled
      expect(li2.getAttribute("data-selected")).toBeTruthy();
    });

    it("should support controlled lastCompletedStep", () => {
      render(() => (
        <TestStepList
          stepListProps={{
            lastCompletedStep: "step1",
          }}
        />
      ));

      // Step 1 should be completed
      const li1 = getStepLi(1);
      expect(li1.getAttribute("data-completed")).toBeTruthy();

      // Step 2 should not be completed
      const li2 = getStepLi(2);
      expect(li2.getAttribute("data-completed")).toBeFalsy();
    });

    it("should call onSelectionChange callback", () => {
      const onSelectionChange = vi.fn();

      render(() => (
        <TestStepList
          stepListProps={{
            onSelectionChange,
            defaultSelectedKey: "step1",
            defaultLastCompletedStep: "step1",
          }}
        />
      ));

      const link2 = getStepLink(2);
      fireEvent.click(link2);

      expect(onSelectionChange).toHaveBeenCalledWith("step2");
    });
  });

  // ============================================
  // STEP STATE TEXT (render-props channel)
  //
  // The headless Step sets no accessible name of its own — mirroring
  // react-aria's useStepListItem, the styled layer owns naming. The state text
  // is exposed through the `stepStateText` render prop instead.
  // ============================================

  describe("step state text", () => {
    it('should show "Current" for selected step', () => {
      render(() => <TestStepList />);
      expect(screen.getByTestId("state-step1")).toHaveTextContent("Current");
    });

    it('should show "Not completed" for upcoming steps', () => {
      render(() => <TestStepList />);
      expect(screen.getByTestId("state-step3")).toHaveTextContent("Not completed");
    });

    it('should show "Completed" for completed steps', () => {
      render(() => (
        <TestStepList
          stepListProps={{
            defaultSelectedKey: "step3",
            defaultLastCompletedStep: "step2",
          }}
        />
      ));
      expect(screen.getByTestId("state-step1")).toHaveTextContent("Completed");
      expect(screen.getByTestId("state-step2")).toHaveTextContent("Completed");
    });
  });
});
