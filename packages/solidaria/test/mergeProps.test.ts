import { describe, expect, it, vi } from "vitest";
import { mergeProps } from "../src/utils/mergeProps";

describe("mergeProps", () => {
  it("chains event handlers in order", () => {
    const calls: string[] = [];
    const merged = mergeProps<{ onPress: (value: string) => void }>(
      { onPress: () => calls.push("first") },
      { onPress: () => calls.push("second") },
    );

    merged.onPress("event");
    expect(calls).toEqual(["first", "second"]);
  });

  it("joins class values when both sides are strings", () => {
    const merged = mergeProps<{ class: string }>({ class: "base" }, { class: "extra" });
    expect(merged.class).toBe("base extra");
  });

  it("passes a render-prop class function through without coercing it to a string", () => {
    // Regression: joining used to stringify the function into the class attribute.
    const getClassName = vi.fn(() => "computed");
    const merged = mergeProps<{ class: (values: object) => string }>({}, { class: getClassName });

    expect(merged.class).toBe(getClassName);
    expect(merged.class({})).toBe("computed");
  });

  it("lets a later class function override an earlier class string", () => {
    // react-aria mergeProps semantics: clsx-join only applies to string pairs;
    // any other pairing falls back to defined-value override.
    const getClassName = () => "computed";
    const merged = mergeProps<{ class: unknown }>({ class: "base" }, { class: getClassName });

    expect(merged.class).toBe(getClassName);
  });

  it("keeps an earlier class string when the later value is undefined", () => {
    const merged = mergeProps<{ class: string }>({ class: "base" }, { class: undefined });
    expect(merged.class).toBe("base");
  });

  it("merges style objects", () => {
    const merged = mergeProps<{ style: Record<string, string> }>(
      { style: { color: "red", margin: "1px" } },
      { style: { color: "blue" } },
    );

    expect(merged.style).toEqual({ color: "blue", margin: "1px" });
  });
});
