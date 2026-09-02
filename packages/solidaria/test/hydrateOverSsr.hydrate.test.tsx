/**
 * Negative proof for the shared hydrate helper: a mid-hydration throw must
 * not leak Solid's module-global `sharedConfig` into the next hydrate.
 *
 * Without the `finally` reset, the second call silently client-renders
 * (server `data-hk` attributes disappear) and every later assertion passes
 * without testing hydration. With the reset, the second call claims the
 * server nodes.
 */
import { afterEach, describe, expect, it } from "vite-plus/test";
import { hydrateOverSsr } from "@proyecto-viviana/solidaria-test-utils";

function OkFixture() {
  return (
    <div data-probe="ok">
      <button type="button">ok</button>
    </div>
  );
}

const MATCHING = `<div data-hk="0" data-probe="ok"><button data-hk="1" type="button">ok</button></div>`;

describe("hydrateOverSsr sharedConfig reset", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("a mismatched SSR string throws and the next hydrate still claims server nodes", () => {
    expect(() => hydrateOverSsr("<div></div>", OkFixture)).toThrow(/Hydration Mismatch/);

    const container = hydrateOverSsr(MATCHING, OkFixture);
    expect(container.querySelectorAll("button")).toHaveLength(1);
    expect(container.textContent).toContain("ok");
    // Claimed server nodes keep their hydration keys. A dirty-context
    // client-render replaces the markup and drops `data-hk`.
    expect(container.querySelector("[data-hk='0']")).not.toBeNull();
    expect(container.querySelector("[data-hk='1']")).not.toBeNull();
  });
});
