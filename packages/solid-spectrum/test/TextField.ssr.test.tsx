/**
 * SSR half of the TextField hydration regression.
 *
 * Runs under vitest.ssr.config.ts so renderToString emits hydratable server
 * markup. The companion TextField.hydrate.test.tsx hydrates over this output.
 */
import { renderToString, isServer } from "solid-js/web";
import { describe, expect, it } from "vitest";
import { writeFileSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";
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

describe("TextField SSR", () => {
  it("is compiled for the server", () => {
    expect(isServer).toBe(true);
  });

  it("renders hydratable server markup and writes it for the hydrate suite", () => {
    const html = renderToString(() => <TextFieldFixture />);

    expect(typeof html).toBe("string");
    expect(html.length).toBeGreaterThan(0);
    expect(html).toContain("Unirse por código");
    expect(html).toContain("Ej: DJ644V");

    const outDir = resolve(import.meta.dirname, "../../../output");
    mkdirSync(outDir, { recursive: true });
    writeFileSync(resolve(outDir, "textfield-ssr.html"), html, "utf8");
  });
});
