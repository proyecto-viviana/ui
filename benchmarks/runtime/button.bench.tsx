/**
 * Button Mount/Update Benchmarks - Proyecto Viviana
 *
 * Measures component creation and state update performance in jsdom
 */

import { describe, it, expect } from "vitest";
import { render, cleanup } from "@solidjs/testing-library";
import { createSignal } from "solid-js";
import { Button } from "@proyecto-viviana/solid-spectrum";

describe("Button Performance (PV)", () => {
  const ITERATIONS = 10;
  const COMPONENT_COUNT = 10; // Reduced for simplicity

  it("mount 10 buttons", () => {
    const timings: number[] = [];

    for (let i = 0; i < ITERATIONS; i++) {
      const start = performance.now();

      const result = render(() => {
        const buttons = [];
        for (let j = 0; j < COMPONENT_COUNT; j++) {
          buttons.push((<Button>Click {j}</Button>) as any);
        }
        return (<div>{...buttons}</div>) as any;
      });

      const end = performance.now();
      timings.push(end - start);

      cleanup();
    }

    const median = timings.sort((a, b) => a - b)[Math.floor(ITERATIONS / 2)];
    const p95 = timings[Math.floor(ITERATIONS * 0.95)];

    console.log(
      `PV Button mount (${COMPONENT_COUNT}): median=${median.toFixed(2)}ms, p95=${p95.toFixed(2)}ms`,
    );

    // Sanity check: should complete in reasonable time
    expect(median).toBeLessThan(1000);
  });

  it("single button state update", () => {
    const timings: number[] = [];

    for (let i = 0; i < ITERATIONS; i++) {
      const [isDisabled, setIsDisabled] = createSignal(false);

      const result = render(() => <Button isDisabled={isDisabled()}>Click Me</Button>);

      // Measure update time
      const start = performance.now();
      setIsDisabled(true);
      const end = performance.now();

      timings.push(end - start);
      cleanup();
    }

    const median = timings.sort((a, b) => a - b)[Math.floor(ITERATIONS / 2)];
    const p95 = timings[Math.floor(ITERATIONS * 0.95)];

    console.log(`PV Button update: median=${median.toFixed(2)}ms, p95=${p95.toFixed(2)}ms`);

    // Sanity check: updates should be very fast in SolidJS
    expect(median).toBeLessThan(50);
  }, 10_000);
});
