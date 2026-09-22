/** @vitest-environment jsdom */
/**
 * #545 class 2: a component-valued `prefix`/`suffix` must be instantiated once,
 * under an owner.
 *
 * `prefix`/`suffix` are JSX props, so the compiler turns each into a getter that
 * runs the component body on every read — Solid's `createComponent` is
 * `untrack(() => Comp(props))`, not a cached node. `TextField` and `SearchField`
 * pass a *computed* id set to `PrefixInputProvider` (`prefixId={adornmentIds()}`),
 * and that thunk is re-run on every `inputProps` read — including the read inside
 * `Input`'s ref callback, which Solid 2 applies with `getOwner() === null`. An
 * adornment that reads context then throws `NoOwnerError`, blanking the route:
 * that is what killed `/showcase/inputs`, whose suffix is `<Keyboard>`.
 *
 * Both assertions matter. The throw is the crash; the count is the waste that
 * makes the crash reachable — patching only the ownerless read would leave the
 * probe at 2.
 */
import { createContext, useContext } from "solid-js";
import { render } from "@solidjs/testing-library";
import { describe, expect, it } from "vite-plus/test";
import { SearchField } from "../src/searchfield";
import { TextField } from "../src/textfield";

const ProbeContext = createContext<string>("probe");

function makeProbe() {
  const counts = { instantiations: 0 };
  const Probe = (props: { children?: string }) => {
    counts.instantiations += 1;
    const value = useContext(ProbeContext);
    return <span data-probe={value}>{props.children}</span>;
  };
  return { counts, Probe };
}

describe("field adornments", () => {
  it("instantiates a TextField suffix once, under an owner", () => {
    const { counts, Probe } = makeProbe();
    const { container, unmount } = render(() => (
      <TextField aria-label="Ask" suffix={<Probe>enter</Probe>} />
    ));

    expect(counts.instantiations).toBe(1);
    expect(container.querySelectorAll("[data-probe]")).toHaveLength(1);
    unmount();
  });

  it("instantiates a TextField prefix once, under an owner", () => {
    const { counts, Probe } = makeProbe();
    const { container, unmount } = render(() => (
      <TextField aria-label="Amount" prefix={<Probe>$</Probe>} />
    ));

    expect(counts.instantiations).toBe(1);
    expect(container.querySelectorAll("[data-probe]")).toHaveLength(1);
    unmount();
  });

  it("instantiates a SearchField suffix once, under an owner", () => {
    const { counts, Probe } = makeProbe();
    const { container, unmount } = render(() => (
      <SearchField aria-label="Search" suffix={<Probe>K</Probe>} />
    ));

    expect(counts.instantiations).toBe(1);
    expect(container.querySelectorAll("[data-probe]")).toHaveLength(1);
    unmount();
  });

  it("still joins both adornment ids into the input's accessible name", () => {
    const { container, unmount } = render(() => (
      <TextField aria-label="Ask" prefix={<span>$</span>} suffix={<span>enter</span>} />
    ));

    const input = container.querySelector("input")!;
    const labelledby = (input.getAttribute("aria-labelledby") ?? "").split(/\s+/).filter(Boolean);
    const named = labelledby
      .map((id) => container.ownerDocument.getElementById(id)?.textContent ?? "")
      .join(" ");
    expect(named).toContain("$");
    expect(named).toContain("enter");
    unmount();
  });
});
