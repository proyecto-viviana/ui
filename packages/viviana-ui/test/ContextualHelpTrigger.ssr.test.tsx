/**
 * SSR regression for #545: the menu module must survive module evaluation on a
 * server that has already rendered something.
 *
 * `const helpIcon = <svg…>` at module scope compiles, for the server, to
 * `var _v$ = ssrHydrationKey(); var helpIcon = ssr(_tmpl$, _v$)` — evaluated
 * when the module is evaluated, outside any owner. `ssrHydrationKey` is a no-op
 * only while `sharedConfig.context` is unset; `renderToString` sets that context
 * and never clears it, so on a live server every module evaluated after the
 * first render reaches `getNextContextId` with no owner and throws
 * "getNextContextId cannot be used under non-hydrating context". The whole
 * module then fails to evaluate and every route that imports anything from it
 * serves an empty shell with HTTP 200 — sixteen of the twenty-two dead routes
 * measured on `d1c5f4b3` were this file, four more its solid-spectrum twin.
 *
 * The warm render before the import is the point of the test, not scaffolding:
 * it reproduces a server process that has served one page before it lazily
 * imports the next route's chunk. The import is dynamic for the same reason —
 * a hoisted static import would evaluate before any render, when
 * `ssrHydrationKey` is still inert.
 *
 * Runs under vitest.ssr.config.ts (`generate: "ssr"`, `hydratable: true`) —
 * the same compiler settings the web app's server build uses.
 */
import { isServer, renderToString } from "@solidjs/web";
import { describe, expect, it } from "vite-plus/test";

describe("ContextualHelpTrigger SSR (viviana-ui)", () => {
  it("is compiled for the server", () => {
    expect(isServer).toBe(true);
  });

  // The barrel is the import a route actually writes, and transforming it cold
  // costs more than the 5s default when all 32 SSR suites run at once.
  it("evaluates its module on a server that has already rendered", async () => {
    renderToString(() => <span>a page this server served earlier</span>);

    await expect(import("../src/menu/ContextualHelpTrigger")).resolves.toHaveProperty(
      "ContextualHelpTrigger",
    );
    await expect(import("../src/menu")).resolves.toHaveProperty("Menu");
  }, 30_000);

  it("server-renders the trigger and both icon variants", async () => {
    const { ContextualHelpTrigger } = await import("../src/menu/ContextualHelpTrigger");

    const help = renderToString(() => (
      <ContextualHelpTrigger title="What is this?" content="Help text here" />
    ));
    const info = renderToString(() => (
      <ContextualHelpTrigger variant="info" title="What is this?" content="Help text here" />
    ));

    expect(help).toContain("<svg");
    expect(help).toContain("What is this?");
    expect(info).toContain("<svg");
  });

  it("gives each instance its own icon markup", async () => {
    const { ContextualHelpTrigger } = await import("../src/menu/ContextualHelpTrigger");

    const html = renderToString(() => (
      <div>
        <ContextualHelpTrigger title="First" content="one" />
        <ContextualHelpTrigger title="Second" content="two" />
      </div>
    ));

    expect(html.match(/<svg/g)?.length).toBe(2);
  });
});
