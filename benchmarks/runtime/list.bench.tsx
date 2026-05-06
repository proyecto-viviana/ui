/**
 * List Rendering Benchmarks - Common performance scenario
 *
 * Measures rendering and updating large lists
 */

import { describe, it, expect } from "vitest";
import { render, cleanup } from "@solidjs/testing-library";
import { createSignal } from "solid-js";
import { ListBox, ListBoxOption } from "@proyecto-viviana/solid-spectrum";

describe("List Performance (PV)", () => {
  const ITERATIONS = 5; // Fewer iterations for large lists
  const ITEM_COUNT = 1000;

  it("render list with 1000 items", () => {
    const timings: number[] = [];
    const items = Array.from({ length: ITEM_COUNT }, (_, i) => ({
      id: `item-${i}`,
      label: `Item ${i}`,
    }));

    for (let i = 0; i < ITERATIONS; i++) {
      const start = performance.now();

      const result = render(() => (
        <ListBox
          aria-label="Items"
          items={items}
          getKey={(item) => item.id}
          getTextValue={(item) => item.label}
        >
          {(item) => <ListBoxOption id={item.id}>{item.label}</ListBoxOption>}
        </ListBox>
      ));

      const end = performance.now();
      timings.push(end - start);

      cleanup();
    }

    const median = timings.sort((a, b) => a - b)[Math.floor(ITERATIONS / 2)];

    console.log(`PV List render (${ITEM_COUNT} items): median=${median.toFixed(2)}ms`);

    // After memoization fix: styled ListBox median is ~800ms on this machine.
    // Threshold set at 2000ms for CI headroom.
    expect(median).toBeLessThan(2000);
  }, 20_000);

  it("filter list from 1000 to 100 items", () => {
    const timings: number[] = [];
    const allItems = Array.from({ length: ITEM_COUNT }, (_, i) => ({
      id: `item-${i}`,
      label: `Item ${i}`,
    }));

    for (let i = 0; i < ITERATIONS; i++) {
      const [items, setItems] = createSignal(allItems);

      const result = render(() => (
        <ListBox
          aria-label="Items"
          items={items()}
          getKey={(item) => item.id}
          getTextValue={(item) => item.label}
        >
          {(item) => <ListBoxOption id={item.id}>{item.label}</ListBoxOption>}
        </ListBox>
      ));

      // Measure filter time (represents common search/filter operation)
      const start = performance.now();
      setItems(allItems.slice(0, 100));
      const end = performance.now();

      timings.push(end - start);
      cleanup();
    }

    const median = timings.sort((a, b) => a - b)[Math.floor(ITERATIONS / 2)];

    console.log(`PV List filter (${ITEM_COUNT} → 100): median=${median.toFixed(2)}ms`);

    // Fine-grained reactivity should handle this efficiently
    expect(median).toBeLessThan(500);
  }, 20_000);
});
