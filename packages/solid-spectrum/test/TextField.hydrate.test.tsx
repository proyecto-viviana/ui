/**
 * Hydration half of the TextField SSR regression.
 *
 * Reads the server markup produced by TextField.ssr.test.tsx, hydrates the
 * DOM-compiled TextField over it, and asserts that the label/input subtree does
 * not drift during the hydration walk.
 */
import { afterEach, describe, it } from "vite-plus/test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { hydrateOverSsr } from "@proyecto-viviana/solidaria-test-utils";
import { Provider } from "../src/provider";
import { TextField } from "../src/textfield";

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
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("hydrates the server markup without a mismatch", () => {
    hydrateOverSsr(ssrHtml, () => <TextFieldFixture />);
  });
});
