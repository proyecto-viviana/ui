/**
 * Slider tests - Port of React Aria's Slider.test.tsx
 *
 * Tests for Slider component functionality including:
 * - Rendering
 * - Value control
 * - Min/max constraints
 * - Step value
 * - Keyboard interactions
 * - Disabled state
 * - ARIA attributes
 * - Orientation
 */

import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { render, screen, cleanup, fireEvent, waitFor } from "@solidjs/testing-library";
import { Slider, SliderTrack, SliderThumb, SliderOutput } from "../src/Slider";
import { I18nProvider } from "@proyecto-viviana/solidaria";
import { setupUser } from "@proyecto-viviana/solidaria-test-utils";

// setupUser is consolidated in solidaria-test-utils.

// Helper component for testing - Slider may use render props pattern
function TestSlider(props: { sliderProps?: Partial<Parameters<typeof Slider>[0]> }) {
  return (
    <Slider aria-label="Test Slider" {...props.sliderProps}>
      {() => (
        <>
          <SliderTrack>{() => <SliderThumb />}</SliderTrack>
          <SliderOutput />
        </>
      )}
    </Slider>
  );
}

describe("Slider", () => {
  let user: ReturnType<typeof setupUser>;

  beforeEach(() => {
    user = setupUser();
  });

  afterEach(() => {
    cleanup();
  });

  // ============================================
  // RENDERING
  // ============================================

  describe("rendering", () => {
    it("should render with default class", () => {
      render(() => <TestSlider />);

      const slider = document.querySelector(".solidaria-Slider");
      expect(slider).toBeInTheDocument();
    });

    it("should render slider role element", () => {
      render(() => <TestSlider />);

      const slider = screen.getByRole("slider");
      expect(slider).toBeInTheDocument();
      const input = document.querySelector('input[type="range"]') as HTMLInputElement;
      expect(slider.contains(input)).toBe(false);
    });

    it("should render track", () => {
      render(() => <TestSlider />);

      const track = document.querySelector(".solidaria-Slider-track");
      expect(track).toBeInTheDocument();
    });

    it("should render thumb", () => {
      render(() => <TestSlider />);

      const thumb = document.querySelector(".solidaria-Slider-thumb");
      expect(thumb).toBeInTheDocument();
    });

    it("should render output", () => {
      render(() => <TestSlider />);

      const output = document.querySelector(".solidaria-Slider-output");
      expect(output).toBeInTheDocument();
    });

    it("should render with custom class", () => {
      render(() => <TestSlider sliderProps={{ class: "my-slider" }} />);

      const slider = document.querySelector(".my-slider");
      expect(slider).toBeInTheDocument();
    });

    it("should render label when provided", () => {
      render(() => <TestSlider sliderProps={{ label: "Volume" }} />);

      expect(screen.getByText("Volume")).toBeInTheDocument();
    });
  });

  // ============================================
  // VALUE CONTROL
  // ============================================

  describe("value control", () => {
    it("should display defaultValue", () => {
      render(() => <TestSlider sliderProps={{ defaultValue: 50, minValue: 0, maxValue: 100 }} />);

      const slider = screen.getByRole("slider");
      expect(slider).toHaveAttribute("aria-valuenow", "50");
    });

    it("should display controlled value", () => {
      render(() => <TestSlider sliderProps={{ value: 75, minValue: 0, maxValue: 100 }} />);

      const slider = screen.getByRole("slider");
      expect(slider).toHaveAttribute("aria-valuenow", "75");
    });

    it("should fire onChange when value changes", async () => {
      const onChange = vi.fn();
      render(() => (
        <TestSlider sliderProps={{ defaultValue: 50, minValue: 0, maxValue: 100, onChange }} />
      ));

      const slider = screen.getByRole("slider");
      slider.focus();
      await user.keyboard("{ArrowRight}");

      await waitFor(() => {
        expect(onChange).toHaveBeenCalled();
      });
    });

    it("should display formatted value in output", () => {
      render(() => <TestSlider sliderProps={{ defaultValue: 50, minValue: 0, maxValue: 100 }} />);

      const output = document.querySelector(".solidaria-Slider-output");
      expect(output?.textContent).toBe("50");
    });
  });

  // ============================================
  // MIN/MAX CONSTRAINTS
  // ============================================

  describe("min/max constraints", () => {
    it("should have aria-valuemin", () => {
      render(() => <TestSlider sliderProps={{ minValue: 10, maxValue: 100 }} />);

      const slider = screen.getByRole("slider");
      expect(slider).toHaveAttribute("aria-valuemin", "10");
    });

    it("should have aria-valuemax", () => {
      render(() => <TestSlider sliderProps={{ minValue: 0, maxValue: 200 }} />);

      const slider = screen.getByRole("slider");
      expect(slider).toHaveAttribute("aria-valuemax", "200");
    });

    it("should not go below minValue", async () => {
      render(() => <TestSlider sliderProps={{ defaultValue: 0, minValue: 0, maxValue: 100 }} />);

      const slider = screen.getByRole("slider");
      slider.focus();
      await user.keyboard("{ArrowLeft}");

      // Value should remain at minValue
      expect(slider).toHaveAttribute("aria-valuenow", "0");
    });

    it("should not go above maxValue", async () => {
      render(() => <TestSlider sliderProps={{ defaultValue: 100, minValue: 0, maxValue: 100 }} />);

      const slider = screen.getByRole("slider");
      slider.focus();
      await user.keyboard("{ArrowRight}");

      // Value should remain at maxValue
      expect(slider).toHaveAttribute("aria-valuenow", "100");
    });
  });

  // ============================================
  // STEP VALUE
  // ============================================

  describe("step value", () => {
    it("should increment by step value", async () => {
      const onChange = vi.fn();
      render(() => (
        <TestSlider
          sliderProps={{ defaultValue: 50, minValue: 0, maxValue: 100, step: 10, onChange }}
        />
      ));

      const slider = screen.getByRole("slider");
      slider.focus();
      await user.keyboard("{ArrowRight}");

      await waitFor(() => {
        expect(onChange).toHaveBeenCalledWith(60);
      });
    });

    it("should decrement by step value", async () => {
      const onChange = vi.fn();
      render(() => (
        <TestSlider
          sliderProps={{ defaultValue: 50, minValue: 0, maxValue: 100, step: 5, onChange }}
        />
      ));

      const slider = screen.getByRole("slider");
      slider.focus();
      await user.keyboard("{ArrowLeft}");

      await waitFor(() => {
        expect(onChange).toHaveBeenCalledWith(45);
      });
    });
  });

  // ============================================
  // KEYBOARD INTERACTIONS
  // ============================================

  describe("keyboard interactions", () => {
    it("should increase with ArrowRight", async () => {
      const onChange = vi.fn();
      render(() => (
        <TestSlider sliderProps={{ defaultValue: 50, minValue: 0, maxValue: 100, onChange }} />
      ));

      const slider = screen.getByRole("slider");
      slider.focus();
      await user.keyboard("{ArrowRight}");

      await waitFor(() => {
        expect(onChange).toHaveBeenCalled();
      });
    });

    it("should decrease with ArrowLeft", async () => {
      const onChange = vi.fn();
      render(() => (
        <TestSlider sliderProps={{ defaultValue: 50, minValue: 0, maxValue: 100, onChange }} />
      ));

      const slider = screen.getByRole("slider");
      slider.focus();
      await user.keyboard("{ArrowLeft}");

      await waitFor(() => {
        expect(onChange).toHaveBeenCalled();
      });
    });

    it("should increase with ArrowUp", async () => {
      const onChange = vi.fn();
      render(() => (
        <TestSlider sliderProps={{ defaultValue: 50, minValue: 0, maxValue: 100, onChange }} />
      ));

      const slider = screen.getByRole("slider");
      slider.focus();
      await user.keyboard("{ArrowUp}");

      await waitFor(() => {
        expect(onChange).toHaveBeenCalled();
      });
    });

    it("should decrease with ArrowDown", async () => {
      const onChange = vi.fn();
      render(() => (
        <TestSlider sliderProps={{ defaultValue: 50, minValue: 0, maxValue: 100, onChange }} />
      ));

      const slider = screen.getByRole("slider");
      slider.focus();
      await user.keyboard("{ArrowDown}");

      await waitFor(() => {
        expect(onChange).toHaveBeenCalled();
      });
    });

    it("should go to min with Home", async () => {
      const onChange = vi.fn();
      render(() => (
        <TestSlider sliderProps={{ defaultValue: 50, minValue: 0, maxValue: 100, onChange }} />
      ));

      const slider = screen.getByRole("slider");
      slider.focus();
      await user.keyboard("{Home}");

      await waitFor(() => {
        expect(onChange).toHaveBeenCalledWith(0);
      });
    });

    it("should go to max with End", async () => {
      const onChange = vi.fn();
      render(() => (
        <TestSlider sliderProps={{ defaultValue: 50, minValue: 0, maxValue: 100, onChange }} />
      ));

      const slider = screen.getByRole("slider");
      slider.focus();
      await user.keyboard("{End}");

      await waitFor(() => {
        expect(onChange).toHaveBeenCalledWith(100);
      });
    });
  });

  // ============================================
  // DISABLED STATE
  // ============================================

  describe("disabled state", () => {
    it("should support isDisabled", () => {
      render(() => <TestSlider sliderProps={{ isDisabled: true }} />);

      const slider = screen.getByRole("slider");
      expect(slider).toHaveAttribute("aria-disabled", "true");
    });

    it("should have data-disabled attribute", () => {
      render(() => <TestSlider sliderProps={{ isDisabled: true }} />);

      const sliderWrapper = document.querySelector(".solidaria-Slider");
      expect(sliderWrapper).toHaveAttribute("data-disabled");
    });

    it("should not respond to keyboard when disabled", async () => {
      const onChange = vi.fn();
      render(() => <TestSlider sliderProps={{ isDisabled: true, defaultValue: 50, onChange }} />);

      const slider = screen.getByRole("slider");
      slider.focus();
      await user.keyboard("{ArrowRight}");

      expect(onChange).not.toHaveBeenCalled();
    });
  });

  // ============================================
  // ARIA ATTRIBUTES
  // ============================================

  describe("aria attributes", () => {
    it("should have slider role", () => {
      render(() => <TestSlider />);

      const slider = screen.getByRole("slider");
      expect(slider).toBeInTheDocument();
    });

    it("should be accessible via aria-label on group", () => {
      render(() => <TestSlider />);

      // The slider uses a hidden input with role=slider
      // The aria-label is applied to the group container, not the hidden input
      const slider = screen.getByRole("slider");
      expect(slider).toBeInTheDocument();

      // The group should have the aria-label
      const group = document.querySelector(".solidaria-Slider");
      expect(group).toHaveAttribute("aria-label", "Test Slider");
    });

    it("should have aria-valuenow", () => {
      render(() => <TestSlider sliderProps={{ defaultValue: 42 }} />);

      const slider = screen.getByRole("slider");
      expect(slider).toHaveAttribute("aria-valuenow", "42");
    });

    it("should have aria-orientation for horizontal", () => {
      render(() => <TestSlider sliderProps={{ orientation: "horizontal" }} />);

      const slider = screen.getByRole("slider");
      expect(slider).toHaveAttribute("aria-orientation", "horizontal");
    });

    it("should have aria-orientation for vertical", () => {
      render(() => <TestSlider sliderProps={{ orientation: "vertical" }} />);

      const slider = screen.getByRole("slider");
      expect(slider).toHaveAttribute("aria-orientation", "vertical");
    });
  });

  // ============================================
  // ORIENTATION
  // ============================================

  describe("orientation", () => {
    it("should support horizontal orientation", () => {
      render(() => <TestSlider sliderProps={{ orientation: "horizontal" }} />);

      const sliderWrapper = document.querySelector(".solidaria-Slider");
      expect(sliderWrapper).toHaveAttribute("data-orientation", "horizontal");
    });

    it("should support vertical orientation", () => {
      render(() => <TestSlider sliderProps={{ orientation: "vertical" }} />);

      const sliderWrapper = document.querySelector(".solidaria-Slider");
      expect(sliderWrapper).toHaveAttribute("data-orientation", "vertical");
    });
  });

  // ============================================
  // DATA ATTRIBUTES
  // ============================================

  describe("data attributes", () => {
    it("should have data-orientation", () => {
      render(() => <TestSlider />);

      const sliderWrapper = document.querySelector(".solidaria-Slider");
      expect(sliderWrapper).toHaveAttribute("data-orientation");
    });

    it("should not have data-disabled when enabled", () => {
      render(() => <TestSlider />);

      const sliderWrapper = document.querySelector(".solidaria-Slider");
      expect(sliderWrapper).not.toHaveAttribute("data-disabled");
    });
  });

  // ============================================
  // RTL (Right-to-Left) KEYBOARD NAVIGATION
  // ============================================

  describe("RTL keyboard navigation", () => {
    it("ArrowRight should DECREASE value in RTL", async () => {
      const onChange = vi.fn();
      render(() => (
        <I18nProvider locale="ar-AE">
          <TestSlider sliderProps={{ defaultValue: 50, minValue: 0, maxValue: 100, onChange }} />
        </I18nProvider>
      ));

      const slider = screen.getByRole("slider");
      slider.focus();
      await user.keyboard("{ArrowRight}");

      await waitFor(() => {
        // In RTL, ArrowRight decreases value (reversed from LTR)
        expect(onChange).toHaveBeenCalledWith(49);
      });
    });

    it("ArrowLeft should INCREASE value in RTL", async () => {
      const onChange = vi.fn();
      render(() => (
        <I18nProvider locale="ar-AE">
          <TestSlider sliderProps={{ defaultValue: 50, minValue: 0, maxValue: 100, onChange }} />
        </I18nProvider>
      ));

      const slider = screen.getByRole("slider");
      slider.focus();
      await user.keyboard("{ArrowLeft}");

      await waitFor(() => {
        // In RTL, ArrowLeft increases value (reversed from LTR)
        expect(onChange).toHaveBeenCalledWith(51);
      });
    });

    it("ArrowUp should still increase value in RTL", async () => {
      const onChange = vi.fn();
      render(() => (
        <I18nProvider locale="ar-AE">
          <TestSlider sliderProps={{ defaultValue: 50, minValue: 0, maxValue: 100, onChange }} />
        </I18nProvider>
      ));

      const slider = screen.getByRole("slider");
      slider.focus();
      await user.keyboard("{ArrowUp}");

      await waitFor(() => {
        // ArrowUp should still call onChange (increases value)
        expect(onChange).toHaveBeenCalled();
      });
    });

    it("step increment should respect RTL direction", async () => {
      const onChange = vi.fn();
      render(() => (
        <I18nProvider locale="ar-AE">
          <TestSlider
            sliderProps={{ defaultValue: 50, minValue: 0, maxValue: 100, step: 10, onChange }}
          />
        </I18nProvider>
      ));

      const slider = screen.getByRole("slider");
      slider.focus();
      await user.keyboard("{ArrowLeft}");

      await waitFor(() => {
        // In RTL, ArrowLeft increases by step
        expect(onChange).toHaveBeenCalledWith(60);
      });
    });
  });
});
