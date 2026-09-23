import { describe, it, expect, afterEach } from "vite-plus/test";
import { render, screen, cleanup } from "@solidjs/testing-library";
import { createSignal, flush } from "solid-js";
import { createToggleButton, type AriaToggleButtonProps } from "../src/button";
import { filterDOMProps } from "../src/utils/filterDOMProps";
import { ToggleButton } from "../../solidaria-components/src/ToggleButton";

afterEach(() => {
  cleanup();
});

describe("filterDOMProps", () => {
  it("reads a getter-backed data-foo after the signal changes", () => {
    const [flag, setFlag] = createSignal("one");
    const props: { "data-foo"?: string } = {};
    Object.defineProperty(props, "data-foo", {
      enumerable: true,
      configurable: true,
      get: () => flag(),
    });

    const filtered = filterDOMProps(props);
    expect(filtered["data-foo"]).toBe("one");
    setFlag("two");
    flush();
    expect(filtered["data-foo"]).toBe("two");
  });

  it("updates a signal-backed data attribute through createToggleButton", () => {
    let setFlag!: (value: string) => void;

    function Example() {
      const [flag, nextFlag] = createSignal("one");
      setFlag = nextFlag;
      const { buttonProps } = createToggleButton({
        get "data-foo"() {
          return flag();
        },
      } as AriaToggleButtonProps);
      return <button {...buttonProps}>Toggle</button>;
    }

    render(() => <Example />);
    const button = screen.getByRole("button");
    expect(button.getAttribute("data-foo")).toBe("one");
    setFlag("two");
    flush();
    expect(button.getAttribute("data-foo")).toBe("two");
  });

  it("updates a signal-backed data attribute through ToggleButton", () => {
    let setFlag!: (value: string) => void;

    function Example() {
      const [flag, nextFlag] = createSignal("one");
      setFlag = nextFlag;
      return <ToggleButton data-foo={flag()}>Set</ToggleButton>;
    }

    render(() => <Example />);
    const button = screen.getByRole("button");
    expect(button.getAttribute("data-foo")).toBe("one");
    setFlag("two");
    flush();
    expect(button.getAttribute("data-foo")).toBe("two");
  });
});
