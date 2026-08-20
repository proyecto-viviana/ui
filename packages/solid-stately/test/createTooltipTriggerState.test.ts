import { describe, it, expect, vi, beforeEach, afterEach } from "vite-plus/test";
import { createRoot } from "solid-js";
import { createTooltipTriggerState, resetTooltipState } from "../src/tooltip";

describe("createTooltipTriggerState", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    resetTooltipState();
  });

  afterEach(() => {
    vi.useRealTimers();
    resetTooltipState();
  });

  it("should initialize as closed by default", () => {
    createRoot((dispose) => {
      const state = createTooltipTriggerState();
      expect(state.isOpen()).toBe(false);
      dispose();
    });
  });

  it("should open immediately when immediate=true", () => {
    createRoot((dispose) => {
      const state = createTooltipTriggerState();
      state.open(true);
      expect(state.isOpen()).toBe(true);
      dispose();
    });
  });

  it("should close immediately when immediate=true", () => {
    createRoot((dispose) => {
      const state = createTooltipTriggerState();
      state.open(true);
      expect(state.isOpen()).toBe(true);
      state.close(true);
      expect(state.isOpen()).toBe(false);
      dispose();
    });
  });

  it("should respect controlled isOpen prop", () => {
    createRoot((dispose) => {
      const state = createTooltipTriggerState({ isOpen: true });
      expect(state.isOpen()).toBe(true);
      dispose();
    });
  });

  it("should call onOpenChange when opening", () => {
    createRoot((dispose) => {
      const onOpenChange = vi.fn();
      const state = createTooltipTriggerState({ onOpenChange });
      state.open(true);
      expect(onOpenChange).toHaveBeenCalledWith(true);
      dispose();
    });
  });

  it("should call onOpenChange when closing", () => {
    createRoot((dispose) => {
      const onOpenChange = vi.fn();
      const state = createTooltipTriggerState({ onOpenChange });
      state.open(true);
      state.close(true);
      expect(onOpenChange).toHaveBeenCalledWith(false);
      dispose();
    });
  });

  it("should delay opening based on delay prop", () => {
    createRoot((dispose) => {
      const state = createTooltipTriggerState({ delay: 500 });
      state.open(); // Not immediate
      expect(state.isOpen()).toBe(false);

      vi.advanceTimersByTime(400);
      expect(state.isOpen()).toBe(false);

      vi.advanceTimersByTime(100);
      expect(state.isOpen()).toBe(true);
      dispose();
    });
  });

  it("should delay closing based on closeDelay prop", () => {
    createRoot((dispose) => {
      const state = createTooltipTriggerState({ closeDelay: 300 });
      state.open(true);
      expect(state.isOpen()).toBe(true);

      state.close(); // Not immediate
      expect(state.isOpen()).toBe(true);

      vi.advanceTimersByTime(200);
      expect(state.isOpen()).toBe(true);

      vi.advanceTimersByTime(100);
      expect(state.isOpen()).toBe(false);
      dispose();
    });
  });

  it("should use default delay of 1500ms", () => {
    createRoot((dispose) => {
      const state = createTooltipTriggerState();
      state.open();
      expect(state.isOpen()).toBe(false);

      vi.advanceTimersByTime(1400);
      expect(state.isOpen()).toBe(false);

      vi.advanceTimersByTime(100);
      expect(state.isOpen()).toBe(true);
      dispose();
    });
  });

  it("should close other tooltips when opening a new one", () => {
    createRoot((dispose) => {
      const state1 = createTooltipTriggerState();
      const state2 = createTooltipTriggerState();

      state1.open(true);
      expect(state1.isOpen()).toBe(true);

      state2.open(true);
      expect(state1.isOpen()).toBe(false);
      expect(state2.isOpen()).toBe(true);
      dispose();
    });
  });

  it("should skip delay when warmed up (second tooltip)", () => {
    createRoot((dispose) => {
      const state1 = createTooltipTriggerState({ delay: 1000 });
      const state2 = createTooltipTriggerState({ delay: 1000 });

      // Open first tooltip with delay
      state1.open();
      vi.advanceTimersByTime(1000);
      expect(state1.isOpen()).toBe(true);

      // Close first tooltip
      state1.close(true);

      // Second tooltip should open immediately (warmed up)
      state2.open();
      expect(state2.isOpen()).toBe(true);
      dispose();
    });
  });

  it("should cancel close timeout when opening again", () => {
    createRoot((dispose) => {
      const state = createTooltipTriggerState({ closeDelay: 500 });
      state.open(true);
      expect(state.isOpen()).toBe(true);

      // Start closing
      state.close();
      vi.advanceTimersByTime(200);
      expect(state.isOpen()).toBe(true);

      // Open again before close completes
      state.open(true);
      vi.advanceTimersByTime(300);
      expect(state.isOpen()).toBe(true); // Should still be open
      dispose();
    });
  });

  it("should respect defaultOpen prop", () => {
    createRoot((dispose) => {
      const state = createTooltipTriggerState({ defaultOpen: true });
      expect(state.isOpen()).toBe(true);
      dispose();
    });
  });

  it("should close immediately when closeDelay is 0", () => {
    createRoot((dispose) => {
      const state = createTooltipTriggerState({ closeDelay: 0 });
      state.open(true);
      expect(state.isOpen()).toBe(true);

      state.close(); // Even without immediate
      expect(state.isOpen()).toBe(false);
      dispose();
    });
  });
});
