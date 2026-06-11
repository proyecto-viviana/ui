/**
 * Hydration half of the TextField SSR regression.
 *
 * Reads the server markup produced by TextField.ssr.test.tsx, hydrates the
 * DOM-compiled TextField over it, and asserts that the label/input subtree does
 * not drift during the hydration walk.
 */
import { hydrate } from "solid-js/web";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { Provider } from "../src/provider";
import { TextField } from "../src/textfield";

function installHydrationGlobals(): void {
  (globalThis as unknown as { _$HY: unknown })._$HY = {
    events: [],
    completed: new WeakSet(),
    r: {},
    fe() {},
  };
}

function TextFieldFixture() {
  return (
    <Provider background="base" colorScheme="dark">
      <form>
        <TextField label="Unirse por código" maxLength={12} placeholder="Ej: DJ644V" />
        <button type="submit">Unirse</button>
      </form>
    </Provider>
  );
}

const ssrHtml = readFileSync(
  resolve(import.meta.dirname, "../../../output/textfield-ssr.html"),
  "utf8",
);

describe("TextField hydration over SSR markup", () => {
  beforeEach(() => {
    installHydrationGlobals();
  });

  afterEach(() => {
    document.body.innerHTML = "";
    vi.restoreAllMocks();
  });

  it("hydrates the server markup without a mismatch", () => {
    const errors: unknown[][] = [];
    const errorSpy = vi.spyOn(console, "error").mockImplementation((...args) => {
      errors.push(args);
    });

    const container = document.createElement("div");
    container.innerHTML = ssrHtml;
    document.body.appendChild(container);

    let thrown: unknown;
    try {
      hydrate(() => <TextFieldFixture />, container);
    } catch (err) {
      thrown = err;
    }

    errorSpy.mockRestore();

    if (thrown) {
      // eslint-disable-next-line no-console
      console.log("THROWN DURING HYDRATE:", thrown);
    }
    if (errors.length) {
      // eslint-disable-next-line no-console
      console.log("CONSOLE.ERROR DURING HYDRATE:", JSON.stringify(errors, null, 2));
    }

    expect(thrown).toBeUndefined();
    expect(errors).toEqual([]);
  });
});
