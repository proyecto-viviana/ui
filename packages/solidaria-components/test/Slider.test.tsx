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

import { createSignal, flush, useContext, Show } from "solid-js";
import type { JSX } from "@solidjs/web";
import { describe, it, expect, vi, afterEach, beforeEach } from "vite-plus/test";
import { render, screen, cleanup, fireEvent, waitFor } from "@solidjs/testing-library";
import { Label } from "../src/Label";
import {
  Slider,
  SliderTrack,
  SliderThumb,
  SliderFill,
  SliderOutput,
  SliderContext,
} from "../src/Slider";
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
      expect(slider).toBe(input);
      expect(document.querySelector(".solidaria-Slider-thumb")?.contains(input)).toBe(true);
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
      expect(slider).toHaveAttribute("value", "50");
    });

    it("should display controlled value", () => {
      render(() => <TestSlider sliderProps={{ value: 75, minValue: 0, maxValue: 100 }} />);

      const slider = screen.getByRole("slider");
      expect(slider).toHaveAttribute("value", "75");
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
      expect(slider).toHaveAttribute("min", "10");
    });

    it("should have aria-valuemax", () => {
      render(() => <TestSlider sliderProps={{ minValue: 0, maxValue: 200 }} />);

      const slider = screen.getByRole("slider");
      expect(slider).toHaveAttribute("max", "200");
    });

    it("should not go below minValue", async () => {
      render(() => <TestSlider sliderProps={{ defaultValue: 0, minValue: 0, maxValue: 100 }} />);

      const slider = screen.getByRole("slider");
      slider.focus();
      await user.keyboard("{ArrowLeft}");

      // Value should remain at minValue
      expect(slider).toHaveAttribute("value", "0");
    });

    it("should not go above maxValue", async () => {
      render(() => <TestSlider sliderProps={{ defaultValue: 100, minValue: 0, maxValue: 100 }} />);

      const slider = screen.getByRole("slider");
      slider.focus();
      await user.keyboard("{ArrowRight}");

      // Value should remain at maxValue
      expect(slider).toHaveAttribute("value", "100");
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
      expect(slider).toBeDisabled();
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

    it("names the slider group from a child Label", () => {
      render(() => (
        <Slider defaultValue={30}>
          {() => (
            <>
              <Label>Opacity</Label>
              <SliderTrack>{() => <SliderThumb />}</SliderTrack>
            </>
          )}
        </Slider>
      ));

      const group = screen.getByRole("group", { name: "Opacity" });
      const label = screen.getByText("Opacity");
      expect(label.tagName).toBe("LABEL");
      expect(group).toHaveAttribute("aria-labelledby", label.id);
    });

    it("gives an explicit aria-label precedence over a child Label", () => {
      render(() => (
        <Slider aria-label="Explicit slider" defaultValue={30}>
          {() => <Label>Opacity</Label>}
        </Slider>
      ));

      const group = screen.getByRole("group");
      const label = screen.getByText("Opacity");
      expect(group).toHaveAttribute("aria-label", "Explicit slider");
      expect(group).not.toHaveAttribute("aria-labelledby");
      expect(label).not.toHaveAttribute("id");
    });

    it("does not point an unlabeled slider at a missing label", () => {
      render(() => (
        <Slider defaultValue={30}>
          {() => <SliderTrack>{() => <SliderThumb />}</SliderTrack>}
        </Slider>
      ));

      const group = document.querySelector(".solidaria-Slider");
      expect(group).not.toHaveAttribute("aria-labelledby");
      expect(screen.getByRole("slider")).not.toHaveAttribute("aria-labelledby");
    });

    it("should have aria-valuenow", () => {
      render(() => <TestSlider sliderProps={{ defaultValue: 42 }} />);

      const slider = screen.getByRole("slider");
      expect(slider).toHaveAttribute("value", "42");
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

    it("puts the description and details on the slider", () => {
      render(() => (
        <TestSlider
          sliderProps={{
            "aria-describedby": "volume-hint",
            "aria-details": "volume-details",
          }}
        />
      ));

      const slider = screen.getByRole("slider");
      const group = document.querySelector(".solidaria-Slider");
      const input = document.querySelector('input[type="range"]');
      expect(slider).toHaveAttribute("aria-describedby", "volume-hint");
      expect(slider).toHaveAttribute("aria-details", "volume-details");
      expect(group).not.toHaveAttribute("aria-describedby");
      expect(group).not.toHaveAttribute("aria-details");
      expect(document.querySelector(".solidaria-Slider-thumb")).not.toHaveAttribute(
        "aria-describedby",
      );
      expect(document.querySelector(".solidaria-Slider-thumb")).not.toHaveAttribute("aria-details");
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

// ============================================
// SLIDER FILL (RAC 1.18)
// ============================================

describe("SliderFill", () => {
  afterEach(() => {
    cleanup();
  });

  function TestSliderWithFill(props: {
    sliderProps?: Partial<Parameters<typeof Slider>[0]>;
    fillProps?: Partial<Parameters<typeof SliderFill>[0]>;
  }) {
    return (
      <Slider aria-label="Test Slider" {...props.sliderProps}>
        {() => (
          <SliderTrack>
            {() => (
              <>
                <SliderFill {...props.fillProps} />
                <SliderThumb />
              </>
            )}
          </SliderTrack>
        )}
      </Slider>
    );
  }

  it("should render with the default fill class", () => {
    render(() => <TestSliderWithFill sliderProps={{ defaultValue: 50 }} />);

    const fill = document.querySelector(".solidaria-Slider-fill");
    expect(fill).toBeInTheDocument();
  });

  it("should span from 0% to the value percent by default", () => {
    render(() => (
      <TestSliderWithFill sliderProps={{ defaultValue: 50, minValue: 0, maxValue: 100 }} />
    ));

    const fill = document.querySelector(".solidaria-Slider-fill") as HTMLElement;
    const style = fill.getAttribute("style") ?? "";
    expect(style).toContain("position: absolute");
    expect(style).toContain("width: 50%");
    expect(style).toContain("inset-inline-start: 0%");
    expect(style).toContain("height: 100%");
  });

  it("should start the fill at the offset", () => {
    render(() => (
      <TestSliderWithFill
        sliderProps={{ defaultValue: 75, minValue: 0, maxValue: 100 }}
        fillProps={{ offset: 25 }}
      />
    ));

    const fill = document.querySelector(".solidaria-Slider-fill") as HTMLElement;
    const style = fill.getAttribute("style") ?? "";
    // start = 25%, end = 75% → inset-inline-start 25%, width 50%
    expect(style).toContain("inset-inline-start: 25%");
    expect(style).toContain("width: 50%");
  });

  it("should clamp the offset to the slider range", () => {
    render(() => (
      <TestSliderWithFill
        sliderProps={{ defaultValue: 50, minValue: 0, maxValue: 100 }}
        fillProps={{ offset: 999 }}
      />
    ));

    const fill = document.querySelector(".solidaria-Slider-fill") as HTMLElement;
    const style = fill.getAttribute("style") ?? "";
    // offset clamps to 100 → start 100%, end 50% → inset-inline-start 50%, width 50%
    expect(style).toContain("inset-inline-start: 50%");
    expect(style).toContain("width: 50%");
  });

  it("should position vertically with bottom/height", () => {
    render(() => (
      <TestSliderWithFill
        sliderProps={{ defaultValue: 50, minValue: 0, maxValue: 100, orientation: "vertical" }}
      />
    ));

    const fill = document.querySelector(".solidaria-Slider-fill") as HTMLElement;
    const style = fill.getAttribute("style") ?? "";
    expect(style).toContain("bottom: 0%");
    expect(style).toContain("height: 50%");
    expect(style).toContain("width: 100%");
    expect(fill).toHaveAttribute("data-orientation", "vertical");
  });

  it("should reflect data-orientation", () => {
    render(() => <TestSliderWithFill sliderProps={{ defaultValue: 50 }} />);

    const fill = document.querySelector(".solidaria-Slider-fill");
    expect(fill).toHaveAttribute("data-orientation", "horizontal");
  });

  it("should have data-disabled when the slider is disabled", () => {
    render(() => <TestSliderWithFill sliderProps={{ defaultValue: 50, isDisabled: true }} />);

    const fill = document.querySelector(".solidaria-Slider-fill");
    expect(fill).toHaveAttribute("data-disabled");
  });

  it("should not have data-disabled when enabled", () => {
    render(() => <TestSliderWithFill sliderProps={{ defaultValue: 50 }} />);

    const fill = document.querySelector(".solidaria-Slider-fill");
    expect(fill).not.toHaveAttribute("data-disabled");
  });

  it("should support a custom class", () => {
    render(() => (
      <TestSliderWithFill sliderProps={{ defaultValue: 50 }} fillProps={{ class: "my-fill" }} />
    ));

    expect(document.querySelector(".my-fill")).toBeInTheDocument();
  });

  it("should pass render-prop values to a class function", () => {
    render(() => (
      <TestSliderWithFill
        sliderProps={{ defaultValue: 50, minValue: 0, maxValue: 100 }}
        fillProps={{
          class: (values) => `fill-${Math.round(values.valuePercent * 100)}-${values.orientation}`,
        }}
      />
    ));

    expect(document.querySelector(".fill-50-horizontal")).toBeInTheDocument();
  });

  it("should update class and style reactively when signal props change", () => {
    const [fillClass, setFillClass] = createSignal("fill-initial");
    const [fillStyle, setFillStyle] = createSignal<JSX.CSSProperties>({ opacity: "0.5" });

    render(() => (
      <Slider aria-label="Test Slider" defaultValue={50}>
        {() => (
          <SliderTrack>
            {() => (
              <>
                <SliderFill class={fillClass()} style={fillStyle()} />
                <SliderThumb />
              </>
            )}
          </SliderTrack>
        )}
      </Slider>
    ));

    const fill = document.querySelector(".fill-initial") as HTMLElement;
    expect(fill).toHaveClass("fill-initial");
    expect(fill.style.opacity).toBe("0.5");

    setFillClass("fill-updated");
    setFillStyle({ opacity: "1" });
    flush();

    expect(fill).toHaveClass("fill-updated");
    expect(fill).not.toHaveClass("fill-initial");
    expect(fill.style.opacity).toBe("1");
  });

  it("should throw when used outside a Slider", () => {
    expect(() => render(() => <SliderFill />)).toThrow(/must be used within a Slider/);
  });
});

describe("SliderOutput", () => {
  afterEach(() => {
    cleanup();
  });

  it("should update class and style reactively when signal props change", () => {
    const [outputClass, setOutputClass] = createSignal("out-initial");
    const [outputStyle, setOutputStyle] = createSignal<JSX.CSSProperties>({ width: "3ch" });

    render(() => (
      <Slider aria-label="Test Slider" defaultValue={50}>
        {() => (
          <>
            <SliderTrack>{() => <SliderThumb />}</SliderTrack>
            <SliderOutput class={outputClass()} style={outputStyle()} />
          </>
        )}
      </Slider>
    ));

    const output = document.querySelector("output") as HTMLElement;
    expect(output).toHaveClass("out-initial");
    expect(output.style.width).toBe("3ch");

    setOutputClass("out-updated");
    setOutputStyle({ width: "2ch" });
    flush();

    expect(output).toHaveClass("out-updated");
    expect(output).not.toHaveClass("out-initial");
    expect(output.style.width).toBe("2ch");
  });

  it("should throw when used outside a Slider", () => {
    expect(() => render(() => <SliderOutput />)).toThrow(/must be used within a Slider/);
  });
});

describe("Slider native owner regression (#74)", () => {
  afterEach(cleanup);
  it("places the one focusable native slider inside its role-free visible thumb", () => {
    render(() => <TestSlider sliderProps={{ defaultValue: 40 }} />);
    const input = document.querySelector('input[type="range"]');
    const wrapper = document.querySelector(".solidaria-Slider-thumb");
    expect(screen.getByRole("slider", { name: "Test Slider" })).toBe(input);
    expect(wrapper?.contains(input)).toBe(true);
    expect(wrapper).not.toHaveAttribute("role");
    expect(wrapper).not.toHaveAttribute("tabindex");
    expect(input).toHaveAttribute("tabindex", "0");
  });
  it("completes one native keyboard update once", () => {
    const onChange = vi.fn(),
      onChangeEnd = vi.fn();
    render(() => <TestSlider sliderProps={{ defaultValue: 40, onChange, onChangeEnd }} />);
    fireEvent.keyDown(document.querySelector('input[type="range"]')!, { key: "ArrowRight" });
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenLastCalledWith(41);
    expect(onChangeEnd).toHaveBeenCalledTimes(1);
    expect(onChangeEnd).toHaveBeenLastCalledWith(41);
  });
  it("resets through a separately associated native form", async () => {
    render(() => (
      <>
        <form id="slider-native-reset" />
        <TestSlider
          sliderProps={{ defaultValue: 25, name: "volume", form: "slider-native-reset" }}
        />
      </>
    ));
    const input = document.querySelector('input[type="range"]') as HTMLInputElement;
    fireEvent.input(input, { target: { value: "60" } });
    expect(new FormData(input.form!).get("volume")).toBe("60");
    fireEvent.reset(input.form!);
    await waitFor(() => expect(input.value).toBe("25"));
    expect(new FormData(input.form!).get("volume")).toBe("25");
  });
});

describe("Slider indexed native owners (#76; candidate API)", () => {
  afterEach(cleanup);
  it("shares root state while preserving each native name, bounds, id and output association", async () => {
    const change = vi.fn(),
      end = vi.fn();
    render(() => (
      <>
        <form id="pair-form" />
        <Slider
          aria-label="Price"
          defaultValue={[20, 80]}
          onChange={change}
          onChangeEnd={end}
          form="pair-form"
        >
          {() => (
            <>
              <SliderTrack>
                {() => (
                  <>
                    <SliderFill />
                    <SliderThumb index={0} name="start" aria-label="Minimum" />
                    <SliderThumb index={1} name="end" aria-label="Maximum" />
                  </>
                )}
              </SliderTrack>
              <SliderOutput />
            </>
          )}
        </Slider>
      </>
    ));
    const inputs = Array.from(
      document.querySelectorAll('input[type="range"]'),
    ) as HTMLInputElement[];
    expect(inputs).toHaveLength(2);
    expect(screen.getAllByRole("slider")).toEqual(inputs);
    expect(inputs[0].id).not.toBe(inputs[1].id);
    expect(document.querySelector("output")).toHaveAttribute(
      "for",
      inputs.map((input) => input.id).join(" "),
    );
    expect(inputs[0].max).toBe("80");
    expect(inputs[1].min).toBe("20");
    fireEvent.keyDown(inputs[1], { key: "ArrowLeft" });
    expect(change).toHaveBeenCalledTimes(1);
    expect(change).toHaveBeenLastCalledWith([20, 79]);
    expect(end).toHaveBeenCalledTimes(1);
    expect(end).toHaveBeenLastCalledWith([20, 79]);
    expect(inputs[0].value).toBe("20");
    expect(inputs[1].value).toBe("79");
    expect(new FormData(inputs[0].form!).get("start")).toBe("20");
    expect(new FormData(inputs[1].form!).get("end")).toBe("79");
    fireEvent.focus(inputs[1]);
    expect(document.querySelectorAll(".solidaria-Slider-thumb[data-focused]")).toHaveLength(1);
    fireEvent.reset(inputs[0].form!);
    await waitFor(() => expect(inputs.map((input) => input.value)).toEqual(["20", "80"]));
  });
});

// These controls use native form.reset(), including the browser default action.
// They deliberately withhold controlled echoes and exercise more than two thumbs.
describe("Slider full indexed integration (#74/#76; v2 candidate)", () => {
  afterEach(cleanup);
  const inputs = () =>
    Array.from(document.querySelectorAll('input[type="range"]')) as HTMLInputElement[];
  const form = (id = "component-form-a") => document.getElementById(id) as HTMLFormElement;
  function Three(props: {
    value?: number[];
    defaults: number[];
    indices?: number[];
    association?: string;
    change: (value: number[]) => void;
    end?: (value: number[]) => void;
  }) {
    const slots = Array.from({ length: props.defaults.length }, (_, slot) => slot);
    return (
      <Slider
        aria-label="Three values"
        defaultValue={props.defaults}
        value={props.value}
        onChange={props.change}
        onChangeEnd={props.end}
        form={props.association ?? "component-form-a"}
      >
        {() => (
          <>
            <SliderTrack>
              {() => (
                <>
                  {slots.map((slot) => (
                    <SliderThumb
                      index={props.indices?.[slot] ?? slot}
                      name={`component-value-${slot}`}
                      aria-label={`Value ${slot}`}
                      data-testid={`component-thumb-${slot}`}
                    >
                      {(render) => (
                        <span data-testid={`component-value-${slot}`}>{render.value}</span>
                      )}
                    </SliderThumb>
                  ))}
                </>
              )}
            </SliderTrack>
            <SliderOutput />
          </>
        )}
      </Slider>
    );
  }
  it("holds controlled native values and defaults through a three-thumb reset without an echo or drag end", async () => {
    const change = vi.fn(),
      end = vi.fn();
    render(() => (
      <>
        <form id="component-form-a" />
        <Three defaults={[20, 30, 90]} value={[0, 10, 100]} change={change} end={end} />
      </>
    ));
    const native = inputs();
    form().reset();
    await waitFor(() =>
      expect(change.mock.calls.map((call) => call[0])).toEqual([
        [0, 10, 90],
        [0, 30, 90],
        [20, 30, 90],
      ]),
    );
    expect(native.map((input) => input.value)).toEqual(["0", "10", "100"]);
    expect(native.map((input) => input.defaultValue)).toEqual(["0", "10", "100"]);
    expect([...new FormData(form()).values()]).toEqual(["0", "10", "100"]);
    expect(end).not.toHaveBeenCalled();
  });
  it("resets three uncontrolled thumbs across both ordering directions and successful native controls", async () => {
    const change = vi.fn(),
      end = vi.fn();
    render(() => (
      <>
        <form id="component-form-a" />
        <Three defaults={[20, 30, 90]} change={change} end={end} />
      </>
    ));
    const native = inputs();
    fireEvent.input(native[0], { target: { value: "0" } });
    fireEvent.input(native[1], { target: { value: "10" } });
    fireEvent.input(native[2], { target: { value: "100" } });
    change.mockClear();
    form().reset();
    await waitFor(() =>
      expect(change.mock.calls.map((call) => call[0])).toEqual([
        [0, 10, 90],
        [0, 30, 90],
        [20, 30, 90],
      ]),
    );
    expect(native.map((input) => input.value)).toEqual(["20", "30", "90"]);
    expect(native.map((input) => input.defaultValue)).toEqual(["20", "30", "90"]);
    expect([...new FormData(form()).values()]).toEqual(["20", "30", "90"]);
    expect(end).not.toHaveBeenCalled();
  });
  it("rebases reset proposals and native defaults after a controlled echo and later correction", async () => {
    const [value, setValue] = createSignal([0, 20]);
    const [defaults, setDefaults] = createSignal([25, 75]);
    const change = vi.fn(),
      end = vi.fn();
    render(() => (
      <>
        <form id="component-form-a" />
        <Three defaults={defaults()} value={value()} change={change} end={end} />
      </>
    ));
    form().reset();
    await waitFor(() =>
      expect(change.mock.calls.map((call) => call[0])).toEqual([
        [0, 75],
        [25, 75],
      ]),
    );
    setValue([25, 75]);
    flush();
    expect(inputs().map((input) => input.defaultValue)).toEqual(["25", "75"]);
    setValue([40, 90]);
    setDefaults([10, 60]);
    flush();
    change.mockClear();
    form().reset();
    await waitFor(() =>
      expect(change.mock.calls.map((call) => call[0])).toEqual([
        [10, 90],
        [10, 60],
      ]),
    );
    expect(inputs().map((input) => input.value)).toEqual(["40", "90"]);
    expect(inputs().map((input) => input.defaultValue)).toEqual(["40", "90"]);
    expect(end).not.toHaveBeenCalled();
  });
  it("moves actual form custody reactively and honors a later preventing listener", async () => {
    const [association, setAssociation] = createSignal("component-form-a");
    const change = vi.fn();
    render(() => (
      <>
        <form id="component-form-a" />
        <form id="component-form-b" />
        <Three defaults={[25, 75]} value={[0, 20]} association={association()} change={change} />
      </>
    ));
    setAssociation("component-form-b");
    flush();
    await waitFor(() =>
      expect(inputs().map((input) => input.form)).toEqual([
        form("component-form-b"),
        form("component-form-b"),
      ]),
    );
    form().reset();
    await Promise.resolve();
    expect(change).not.toHaveBeenCalled();
    const prevent = (event: Event) => event.preventDefault();
    form("component-form-b").addEventListener("reset", prevent);
    form("component-form-b").reset();
    await Promise.resolve();
    expect(change).not.toHaveBeenCalled();
    form("component-form-b").removeEventListener("reset", prevent);
    form("component-form-b").reset();
    await waitFor(() =>
      expect(change.mock.calls.map((call) => call[0])).toEqual([
        [0, 75],
        [25, 75],
      ]),
    );
    expect(inputs().map((input) => input.value)).toEqual(["0", "20"]);
  });
  it("keeps the focused native node, live render values, keyboard index and output membership during a three-thumb index swap", () => {
    const [indices, setIndices] = createSignal([0, 1, 2]);
    const change = vi.fn(),
      end = vi.fn();
    render(() => (
      <>
        <form id="component-form-a" />
        <Three defaults={[10, 40, 90]} indices={indices()} change={change} end={end} />
      </>
    ));
    const native = inputs();
    native[0].focus();
    flush();
    expect(document.activeElement).toBe(native[0]);
    setIndices([2, 1, 0]);
    flush();
    expect(inputs()).toEqual(native);
    expect(document.activeElement).toBe(native[0]);
    expect(native.map((input) => input.value)).toEqual(["90", "40", "10"]);
    expect(screen.getByTestId("component-value-0")).toHaveTextContent("90");
    expect(native[0].min).toBe("40");
    expect(native[0].max).toBe("100");
    expect(screen.getByTestId("component-thumb-0")).toHaveAttribute("data-focused");
    expect(document.querySelector("output")).toHaveAttribute(
      "for",
      [native[2].id, native[1].id, native[0].id].join(" "),
    );
    fireEvent.keyDown(native[0], { key: "ArrowLeft" });
    expect(change).toHaveBeenLastCalledWith([10, 40, 89]);
    expect(end).toHaveBeenLastCalledWith([10, 40, 89]);
  });
  it("does not dispatch queued or later reset proposals after component teardown", async () => {
    const change = vi.fn();
    const view = render(() => (
      <>
        <form id="component-form-a" />
        <Three defaults={[25, 75]} value={[0, 20]} change={change} />
      </>
    ));
    const actual = form();
    actual.reset();
    view.unmount();
    await Promise.resolve();
    actual.dispatchEvent(new Event("reset", { bubbles: true, cancelable: true }));
    await Promise.resolve();
    expect(change).not.toHaveBeenCalled();
  });
});

// Compile-time assignment is intentional: a provider's old narrow setter must
// remain accepted even with strictFunctionTypes. No undefined is sent to it.
describe("Slider context compatibility (#74/#76; v3 candidate)", () => {
  afterEach(cleanup);
  it("accepts an existing custom provider with a narrow native-input setter", async () => {
    const { createSliderState } = await import("@proyecto-viviana/solid-stately");
    const { createSlider } = await import("@proyecto-viviana/solidaria");
    const received: HTMLInputElement[] = [];
    function CustomProvider() {
      const state = createSliderState({ defaultValue: 40 });
      const [track, setTrack] = createSignal<HTMLElement>();
      const [input, setInput] = createSignal<HTMLInputElement>();
      const aria = createSlider(
        { "aria-label": "Custom volume" },
        state,
        () => track() ?? null,
        () => input() ?? null,
      );
      const narrowSetter: (element: HTMLInputElement) => void = (element) => {
        received.push(element);
        setInput(element);
      };
      const value: NonNullable<Parameters<typeof SliderContext>[0]["value"]> = {
        state,
        get trackProps() {
          return aria.trackProps;
        },
        get thumbProps() {
          return aria.thumbProps;
        },
        get outputProps() {
          return aria.outputProps;
        },
        get inputProps() {
          return aria.inputProps;
        },
        get trackRef() {
          return track();
        },
        setTrackRef: setTrack,
        get inputRef() {
          return input();
        },
        setInputRef: narrowSetter,
      };
      return (
        <SliderContext value={value}>
          <SliderTrack>{() => <SliderThumb />}</SliderTrack>
          <SliderOutput />
        </SliderContext>
      );
    }
    const view = render(() => <CustomProvider />);
    flush();
    const native = screen.getByRole("slider", { name: "Custom volume" }) as HTMLInputElement;
    expect(received).toContain(native);
    fireEvent.keyDown(native, { key: "ArrowRight" });
    expect(native.value).toBe("41");
    view.unmount();
    expect(received.every((element) => element instanceof HTMLInputElement)).toBe(true);
  });
  it("clears the built-in optional index0 reference when its native registration unmounts", () => {
    const [showZero, setShowZero] = createSignal(true);
    function RefProbe() {
      const context = useContext(SliderContext)!;
      return <span data-testid="slider-compatibility-ref">{context.inputRef?.name ?? "none"}</span>;
    }
    render(() => (
      <Slider aria-label="Values" defaultValue={[10, 40, 90]}>
        {() => (
          <>
            <SliderTrack>
              {() => (
                <>
                  <Show when={showZero()}>
                    <SliderThumb index={0} name="zero" />
                  </Show>
                  <SliderThumb index={1} name="one" />
                  <SliderThumb index={2} name="two" />
                </>
              )}
            </SliderTrack>
            <RefProbe />
          </>
        )}
      </Slider>
    ));
    flush();
    const one = Array.from(document.querySelectorAll<HTMLInputElement>('input[type="range"]')).find(
      (input) => input.name === "one",
    );
    expect(screen.getByTestId("slider-compatibility-ref")).toHaveTextContent("zero");
    setShowZero(false);
    flush();
    expect(screen.getByTestId("slider-compatibility-ref")).toHaveTextContent("none");
    expect(one?.isConnected).toBe(true);
    setShowZero(true);
    flush();
    expect(screen.getByTestId("slider-compatibility-ref")).toHaveTextContent("zero");
    expect(
      Array.from(document.querySelectorAll<HTMLInputElement>('input[type="range"]')).find(
        (input) => input.name === "one",
      ),
    ).toBe(one);
  });
});
