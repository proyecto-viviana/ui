import { describe, expect, it, vi } from "vite-plus/test";
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

  it("does not invoke a children getter while merging", () => {
    // Solid compiles JSX children as a getter that instantiates the tree on
    // each read. Probing it during merge (useContextProps → mergeProps) mints
    // a second copy on the server and desyncs hydration keys — Form+TextField
    // with isRequired + description was the failure.
    let reads = 0;
    const source = {};
    Object.defineProperty(source, "children", {
      enumerable: true,
      configurable: true,
      get() {
        reads += 1;
        return "label";
      },
    });

    const merged = mergeProps<{ children: string }>({ id: "field" }, source);

    expect(reads).toBe(0);
    expect(merged.children).toBe("label");
    expect(reads).toBe(1);
    expect(merged.children).toBe("label");
    expect(reads).toBe(2);
  });

  it("falls back to an earlier value when a later children getter yields undefined", () => {
    // useContextProps is mergeProps(contextValue, props). Solid's split/spread
    // objects expose getters for keys whose value is undefined; a later
    // undefined must not shadow context, and the getter must not be read
    // during merge (or a children getter would instantiate JSX).
    let later: string | undefined;
    let reads = 0;
    const own = {};
    Object.defineProperty(own, "children", {
      enumerable: true,
      configurable: true,
      get() {
        reads += 1;
        return later;
      },
    });

    const merged = mergeProps<{ children: string }>({ children: "ctx" }, own);

    expect(reads).toBe(0);
    later = undefined;
    expect(merged.children).toBe("ctx");
    expect(reads).toBe(1);
    later = "own";
    expect(merged.children).toBe("own");
    expect(reads).toBe(2);
  });
});
