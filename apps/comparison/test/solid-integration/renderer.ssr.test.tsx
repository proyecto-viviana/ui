import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { expect, it, vi } from "vite-plus/test";
import renderer from "../../integrations/solid/server.mjs";
import { AsyncFixture, HandledFailureFixture, InputFixture, IslandFixture } from "./fixtures";

const slots = { default: "<em>default slot</em>", "named-slot": "<strong>named slot</strong>" };

it("renders isolated hydratable islands and writes fresh client fixtures", async () => {
  const context = { result: {} };
  const props = { label: "server", optional: "present" };
  const first = await renderer.renderToStaticMarkup.call(context, IslandFixture, props, slots, {
    hydrate: true,
  });
  const second = await renderer.renderToStaticMarkup.call(
    context,
    IslandFixture,
    props,
    {},
    { hydrate: true },
  );
  const input = await renderer.renderToStaticMarkup.call(
    context,
    InputFixture,
    {},
    {},
    { hydrate: true },
  );
  const nextRequest = await renderer.renderToStaticMarkup.call(
    { result: {} },
    IslandFixture,
    props,
    {},
    { hydrate: true },
  );
  expect(first.attrs["data-solid-render-id"]).toBe("s0");
  expect(second.attrs["data-solid-render-id"]).toBe("s1");
  expect(nextRequest.attrs).toEqual(first.attrs);
  expect(first.html).toMatch(/\s_hk=["']?s0/);
  expect(second.html).toMatch(/\s_hk=["']?s1/);
  expect(first.html).toContain("<astro-slot><em>default slot</em></astro-slot>");
  expect(first.html).toContain(
    '<astro-slot name="named-slot"><strong>named slot</strong></astro-slot>',
  );
  const output = resolve("output/astro-solid-integration.json");
  mkdirSync(resolve("output"), { recursive: true });
  writeFileSync(
    output,
    JSON.stringify({
      first,
      second,
      input,
      props,
      slots,
      hydrationScript: renderer.renderHydrationScript(),
    }),
  );
});

it("awaits real async content through Solid 2 Loading", async () => {
  let release!: (value: string) => void;
  const gate = new Promise<string>((resolve) => {
    release = resolve;
  });
  let settled = false;
  const pending = renderer.renderToStaticMarkup.call(
    { result: {} },
    AsyncFixture,
    { load: () => gate },
    {},
    { hydrate: true },
  );
  void pending.then(() => {
    settled = true;
  });
  await Promise.resolve();
  expect(settled).toBe(false);
  release("resolved content");
  const result = await pending;
  expect(result.html).toContain("resolved content");
  writeFileSync(resolve("output/astro-solid-async.json"), JSON.stringify(result));
});

it.each([new Error("original render failure"), undefined, 0, false])(
  "preserves request failure %#",
  async (failure) => {
    let didThrow = false;
    let caught;
    try {
      await renderer.renderToStaticMarkup.call(
        { result: {} },
        () => {
          throw failure;
        },
        {},
        {},
        { hydrate: true },
      );
    } catch (error) {
      didThrow = true;
      caught = error;
    }
    expect(didThrow).toBe(true);
    expect(caught).toBe(failure);
  },
);

it("keeps static output non-hydratable and renderer detection fail closed", async () => {
  const context = { result: {} };
  const result = await renderer.renderToStaticMarkup.call(
    context,
    IslandFixture,
    { label: "static" },
    slots,
    { astroStaticSlot: true },
  );
  expect(result.html).toContain("<astro-static-slot>");
  expect(result.html).not.toMatch(/\s_hk=/);
  expect(result.html).not.toContain("<script");
  expect(await renderer.check.call(context, IslandFixture, { label: "probe" }, {})).toBe(true);
  expect(
    await renderer.check.call(
      context,
      () => {
        throw new Error("not this renderer");
      },
      {},
      {},
    ),
  ).toBe(false);
});

it("retains handled error fallbacks without suppressing their diagnostics", async () => {
  const failure = new Error("handled server failure");
  const diagnostic = vi.spyOn(console, "error").mockImplementation(() => {});
  try {
    const result = await renderer.renderToStaticMarkup.call(
      { result: {} },
      HandledFailureFixture,
      { failure },
      {},
      { hydrate: true },
    );
    expect(result.html).toContain("handled fallback");
    expect(diagnostic).toHaveBeenCalledWith(failure);
  } finally {
    diagnostic.mockRestore();
  }
});
