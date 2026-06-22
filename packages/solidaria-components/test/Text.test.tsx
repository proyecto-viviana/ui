/**
 * Tests for the slot-aware `Text` (migrate-describedby-slots, foundational slice).
 * `Text` consumes `TextContext` via `useContextProps`, so a field can provide the
 * `id` (and other props) for a named slot and a `<Text slot="...">` child picks it
 * up — the first real consumer of the keystone-3 slot machinery (`Provider` +
 * `useContextProps`), validated end-to-end here.
 */

import { describe, it, expect, afterEach } from "vitest";
import { render, cleanup } from "@solidjs/testing-library";
import { type Context } from "solid-js";
import { Text, TextContext } from "../src/Text";
import { Provider } from "../src/utils";

describe("Text", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders children in a span with the default class", () => {
    const { container } = render(() => <Text>hello</Text>);
    const span = container.querySelector("span");
    expect(span).not.toBeNull();
    expect(span?.classList.contains("solidaria-Text")).toBe(true);
    expect(span?.textContent).toBe("hello");
  });

  it("honors an explicit class", () => {
    const { container } = render(() => <Text class="custom">hi</Text>);
    const span = container.querySelector("span");
    expect(span?.classList.contains("custom")).toBe(true);
    expect(span?.classList.contains("solidaria-Text")).toBe(false);
  });

  it("renders the requested elementType", () => {
    const { container } = render(() => <Text elementType="div">hi</Text>);
    expect(container.querySelector("div")).not.toBeNull();
    expect(container.querySelector("span")).toBeNull();
  });

  it("picks up a slotted id from TextContext via Provider", () => {
    const { container } = render(() => (
      <Provider
        values={
          [[TextContext, { slots: { description: { id: "desc-1" } } }]] as Array<
            [Context<unknown>, unknown]
          >
        }
      >
        <Text slot="description">help text</Text>
      </Provider>
    ));
    const span = container.querySelector("span");
    expect(span?.id).toBe("desc-1");
    expect(span?.textContent).toBe("help text");
    // `slot` stays logical — it must not leak onto the DOM element.
    expect(span?.getAttribute("slot")).toBeNull();
  });
});
