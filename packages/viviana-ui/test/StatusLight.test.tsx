/** @vitest-environment jsdom */
import { describe, expect, it } from "vite-plus/test";
import { render } from "@solidjs/testing-library";
import { createSignal } from "solid-js";
import { StatusLight } from "../src/statuslight";

describe("StatusLight", () => {
  it("updates direct reactive text children", () => {
    // A direct signal child compiles to a `children` getter that returns the
    // current string. An untracked setup-time read of that getter freezes the
    // first value; the label must follow the signal.
    const [label, setLabel] = createSignal("Online");
    const { container } = render(() => <StatusLight>{label()}</StatusLight>);

    const text = container.querySelector('[data-rsp-slot="text"]');
    expect(text).toHaveTextContent("Online");
    setLabel("Offline");
    expect(text).toHaveTextContent("Offline");
  });
});
