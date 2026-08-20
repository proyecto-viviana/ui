/**
 * Tests for createDescription utility.
 */

import { describe, it, expect, afterEach, beforeEach } from "vite-plus/test";
import { render, cleanup } from "@solidjs/testing-library";
import { createRoot, createEffect } from "solid-js";
import {
  createDescription,
  getDescriptionNodeCount,
  clearDescriptionNodes,
} from "../src/utils/createDescription";

// Helper to wait for effects to run
const flushEffects = () => new Promise((resolve) => queueMicrotask(resolve));

describe("createDescription", () => {
  beforeEach(() => {
    clearDescriptionNodes();
  });

  afterEach(() => {
    cleanup();
    clearDescriptionNodes();
  });

  it("returns object with aria-describedby property", () => {
    createRoot((dispose) => {
      const props = createDescription(() => "Test description");

      // Should have the property (getter)
      expect("aria-describedby" in props).toBe(true);

      dispose();
    });
  });

  it("returns undefined aria-describedby when description is undefined", () => {
    createRoot((dispose) => {
      const props = createDescription(() => undefined);

      expect(props["aria-describedby"]).toBeUndefined();

      dispose();
    });
  });

  it("creates a hidden description element in the DOM", async () => {
    await new Promise<void>((resolve) => {
      createRoot(async (dispose) => {
        const description = "This is a description";
        createDescription(() => description);

        // Wait for effects to run
        await flushEffects();

        // Find the description element
        const descElement = document.querySelector('[id^="solidaria-description-"]');
        expect(descElement).not.toBeNull();
        expect(descElement?.textContent).toBe(description);
        expect(descElement?.style.display).toBe("none");

        dispose();
        resolve();
      });
    });
  });

  it("returns aria-describedby pointing to the description element", async () => {
    await new Promise<void>((resolve) => {
      createRoot(async (dispose) => {
        const description = "Press Enter to activate";
        const props = createDescription(() => description);

        // Wait for effects to run
        await flushEffects();

        const describedBy = props["aria-describedby"];

        expect(describedBy).toBeDefined();
        expect(describedBy).toMatch(/^solidaria-description-\d+$/);

        // Verify the element exists
        const element = document.getElementById(describedBy!);
        expect(element).not.toBeNull();
        expect(element?.textContent).toBe(description);

        dispose();
        resolve();
      });
    });
  });

  it("reuses the same element for identical descriptions", async () => {
    await new Promise<void>((resolve) => {
      createRoot(async (dispose) => {
        const description = "Shared description";

        const props1 = createDescription(() => description);
        const props2 = createDescription(() => description);

        // Wait for effects to run
        await flushEffects();

        // Should only have one description node
        expect(getDescriptionNodeCount()).toBe(1);

        // Both should point to the same ID
        expect(props1["aria-describedby"]).toBe(props2["aria-describedby"]);

        dispose();
        resolve();
      });
    });
  });

  it("creates separate elements for different descriptions", async () => {
    await new Promise<void>((resolve) => {
      createRoot(async (dispose) => {
        const description1 = "First description";
        const description2 = "Second description";

        createDescription(() => description1);
        createDescription(() => description2);

        // Wait for effects to run
        await flushEffects();

        expect(getDescriptionNodeCount()).toBe(2);

        dispose();
        resolve();
      });
    });
  });

  it("cleans up description element when disposed", async () => {
    const description = "Cleanup test description";

    await new Promise<void>((resolve) => {
      createRoot(async (dispose) => {
        createDescription(() => description);

        // Wait for effects to run
        await flushEffects();

        // Element should exist
        expect(getDescriptionNodeCount()).toBe(1);

        // Dispose the root
        dispose();

        // Wait for cleanup
        await flushEffects();

        // Element should be removed after disposal
        expect(getDescriptionNodeCount()).toBe(0);

        resolve();
      });
    });
  });

  it("appends description element to document.body", async () => {
    await new Promise<void>((resolve) => {
      createRoot(async (dispose) => {
        const description = "Body append test";
        createDescription(() => description);

        // Wait for effects to run
        await flushEffects();

        const element = document.querySelector('[id^="solidaria-description-"]');
        expect(element?.parentElement).toBe(document.body);

        dispose();
        resolve();
      });
    });
  });

  it("can be used in JSX with spread", async () => {
    const { container } = render(() => {
      const props = createDescription(() => "Description for button");
      return <button {...props}>Test</button>;
    });

    // Wait for effects to run
    await flushEffects();

    const button = container.querySelector("button");
    expect(button).not.toBeNull();

    // The aria-describedby should be set
    const describedBy = button?.getAttribute("aria-describedby");
    expect(describedBy).toMatch(/^solidaria-description-\d+$/);
  });
});
