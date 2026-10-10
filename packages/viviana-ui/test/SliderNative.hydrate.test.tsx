import { flush } from "solid-js";
import { describe, expect, it, vi } from "vite-plus/test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fireEvent, within } from "@solidjs/testing-library";
import { hydrateOverSsr } from "@proyecto-viviana/solidaria-test-utils";
import { SliderNativeFixture } from "./fixtures/slider-native";

describe("Slider native hydration (viviana-ui)", () => {
  it("adopts server inputs, labels, IDs and form values, then updates controlled values and native focus", async () => {
    const scalarChange = vi.fn();
    const rangeChange = vi.fn();
    const scalarEnd = vi.fn();
    const rangeEnd = vi.fn();
    let echoChanges = true;
    const html = readFileSync(
      resolve(import.meta.dirname, "../../../output/ui-slider-native-ssr.html"),
      "utf8",
    );
    let serverNodes: Element[] = [];
    let serverIds: string[] = [];
    const container = await hydrateOverSsr(
      html,
      () => (
        <SliderNativeFixture
          onScalarChange={scalarChange}
          onRangeChange={rangeChange}
          onScalarChangeEnd={scalarEnd}
          onRangeChangeEnd={rangeEnd}
          shouldEchoChange={() => echoChanges}
        />
      ),
      {
        beforeHydrate(element) {
          serverNodes = Array.from(element.querySelectorAll("*"));
          serverIds = serverNodes.map((node) => node.id);
          expect(element.querySelectorAll('input[type="range"]')).toHaveLength(3);
        },
      },
    );
    const nodes = Array.from(container.querySelectorAll("*"));
    expect(nodes).toHaveLength(serverNodes.length);
    nodes.forEach((node, index) => expect(node).toBe(serverNodes[index]));
    expect(nodes.map((node) => node.id)).toEqual(serverIds);
    const ids = nodes.map((node) => node.id).filter(Boolean);
    expect(new Set(ids).size).toBe(ids.length);
    const inputs = Array.from(container.querySelectorAll<HTMLInputElement>('input[type="range"]'));
    const [scalar, minimum, maximum] = inputs;
    expect(inputs.map((input) => input.id)).toEqual([
      "scalar-proof-input-0",
      "range-proof-input-0",
      "range-proof-input-1",
    ]);
    expect(inputs.map((input) => input.value)).toEqual(["40", "20", "80"]);
    expect(inputs.map((input) => input.getAttribute("aria-valuenow"))).toEqual(["40", "20", "80"]);
    expect(inputs.map((input) => input.step)).toEqual(["5", "5", "5"]);
    expect(inputs.map((input) => [input.min, input.max])).toEqual([
      ["0", "100"],
      ["0", "80"],
      ["20", "100"],
    ]);
    expect(container.querySelector('[role="slider"]')).toBeNull();
    const queries = within(container);
    expect(queries.getByRole("slider", { name: "Volume" })).toBe(scalar);
    expect(queries.getByRole("slider", { name: "Minimum Price" })).toBe(minimum);
    expect(queries.getByRole("slider", { name: "Maximum Price" })).toBe(maximum);
    const form = container.querySelector<HTMLFormElement>("#slider-proof-form")!;
    const values = () => Array.from(new FormData(form).entries());
    expect(values()).toEqual([
      ["volume", "40"],
      ["minimum", "20"],
      ["maximum", "80"],
    ]);
    inputs.forEach((input, index) => {
      expect(input.form).toBe(form);
      expect(input.tabIndex).toBe(0);
      expect(input).not.toHaveAttribute("aria-hidden", "true");
      expect(input).toHaveAttribute("aria-describedby", index === 0 ? "scalar-help" : "range-help");
      for (const attribute of ["aria-labelledby", "aria-describedby"]) {
        const references = input.getAttribute(attribute)?.split(/\s+/) ?? [];
        expect(references.length).toBeGreaterThan(0);
        references.forEach((id) => expect(container.querySelector(`[id="${id}"]`)).not.toBeNull());
      }
      const thumb = input.parentElement!.parentElement!;
      expect(thumb).not.toHaveAttribute("role", "slider");
      expect(thumb).not.toHaveAttribute("tabindex");
      input.focus();
      flush();
      expect(document.activeElement).toBe(input);
      expect(thumb).toHaveAttribute("data-focused", "true");
    });
    const outputs = Array.from(container.querySelectorAll("output"));
    expect(outputs).toHaveLength(2);
    expect(outputs.map((output) => output.getAttribute("for"))).toEqual([
      scalar.id,
      `${minimum.id} ${maximum.id}`,
    ]);
    fireEvent.click(queries.getByRole("button", { name: "Update controlled sliders" }));
    flush();
    expect(inputs.map((input) => input.value)).toEqual(["55", "30", "70"]);
    expect(values()).toEqual([
      ["volume", "55"],
      ["minimum", "30"],
      ["maximum", "70"],
    ]);
    expect(scalarChange).not.toHaveBeenCalled();
    expect(rangeChange).not.toHaveBeenCalled();
    inputs.forEach((input) => {
      input.focus();
      fireEvent.keyDown(input, { key: "ArrowRight" });
      flush();
      expect(document.activeElement).toBe(input);
    });
    expect(scalarChange.mock.calls).toEqual([[60]]);
    expect(rangeChange.mock.calls).toEqual([[{ start: 35, end: 70 }], [{ start: 35, end: 75 }]]);
    expect(inputs.map((input) => input.value)).toEqual(["60", "35", "75"]);
    expect(inputs.map((input) => input.getAttribute("aria-valuenow"))).toEqual(["60", "35", "75"]);
    expect(inputs.map((input) => input.getAttribute("aria-valuetext"))).toEqual(["60", "35", "75"]);
    expect(outputs.map((output) => output.textContent)).toEqual(["60", "35–75"]);
    expect(values()).toEqual([
      ["volume", "60"],
      ["minimum", "35"],
      ["maximum", "75"],
    ]);
    const adoptedInputs = Array.from(container.querySelectorAll('input[type="range"]'));
    expect(adoptedInputs).toHaveLength(inputs.length);
    adoptedInputs.forEach((input, index) => expect(input).toBe(inputs[index]));
    inputs.forEach((input) => expect(serverNodes).toContain(input));
    scalarChange.mockClear();
    rangeChange.mockClear();
    scalarEnd.mockClear();
    rangeEnd.mockClear();
    echoChanges = false;
    // Register after hydration: a later form listener can cancel the native reset.
    const cancelReset = vi.fn((event: Event) => event.preventDefault());
    form.addEventListener("reset", cancelReset);
    try {
      form.reset();
      await Promise.resolve();
      flush();
      expect(cancelReset).toHaveBeenCalledOnce();
      expect(cancelReset.mock.calls[0][0].defaultPrevented).toBe(true);
      expect(scalarChange).not.toHaveBeenCalled();
      expect(rangeChange).not.toHaveBeenCalled();
      expect(scalarEnd).not.toHaveBeenCalled();
      expect(rangeEnd).not.toHaveBeenCalled();
      expect(inputs.map((input) => input.value)).toEqual(["60", "35", "75"]);
      expect(values()).toEqual([
        ["volume", "60"],
        ["minimum", "35"],
        ["maximum", "75"],
      ]);
    } finally {
      form.removeEventListener("reset", cancelReset);
    }
    // Withhold controlled echoes: setters propose defaults while rendered controls stay coherent.
    form.reset();
    await Promise.resolve();
    flush();
    expect(scalarChange.mock.calls).toEqual([[40]]);
    expect(rangeChange.mock.calls).toEqual([[{ start: 20, end: 75 }], [{ start: 20, end: 80 }]]);
    expect(scalarEnd).not.toHaveBeenCalled();
    expect(rangeEnd).not.toHaveBeenCalled();
    expect(inputs.map((input) => input.value)).toEqual(["60", "35", "75"]);
    expect(inputs.map((input) => input.getAttribute("aria-valuenow"))).toEqual(["60", "35", "75"]);
    expect(outputs.map((output) => output.textContent)).toEqual(["60", "35–75"]);
    expect(values()).toEqual([
      ["volume", "60"],
      ["minimum", "35"],
      ["maximum", "75"],
    ]);
    const resetInputs = Array.from(
      container.querySelectorAll<HTMLInputElement>('input[type="range"]'),
    );
    expect(resetInputs).toHaveLength(3);
    resetInputs.forEach((input, index) => {
      expect(input).toBe(inputs[index]);
      expect(serverNodes).toContain(input);
      expect(input.form).toBe(form);
    });
  });
});
