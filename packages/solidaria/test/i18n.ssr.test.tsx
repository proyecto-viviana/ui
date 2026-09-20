import { realpathSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import { afterEach, beforeEach, expect, it, vi } from "vite-plus/test";
import type { Locale } from "../src/i18n/locale";

type Runtime = typeof import("solid-js");
type LocaleModule = typeof import("../src/i18n/locale");
const runtimePath = resolve(
  dirname(realpathSync(createRequire(import.meta.url).resolve("solid-js"))),
  "server.dev.js",
);
const contextSymbol = Symbol.for("solidaria.i18n.context");
let previousContext: PropertyDescriptor | undefined;

beforeEach(() => {
  previousContext = Object.getOwnPropertyDescriptor(globalThis, contextSymbol);
  Reflect.deleteProperty(globalThis, contextSymbol);
});

afterEach(() => {
  vi.doUnmock("solid-js");
  vi.doUnmock("@solidjs/web");
  vi.resetModules();
  if (previousContext) Object.defineProperty(globalThis, contextSymbol, previousContext);
  else Reflect.deleteProperty(globalThis, contextSymbol);
});

async function loadRuntime(generation: string): Promise<Runtime> {
  // Re-evaluate the same installed runtime file, as a dev-server restart does.
  // Its public functions and owner/context implementation remain real.
  return vi.importActual(`${runtimePath}?i18n-generation=${generation}`);
}

async function loadLocale(runtime: Runtime): Promise<LocaleModule> {
  vi.resetModules();
  vi.doMock("solid-js", () => runtime);
  // Compiled component JSX only needs createComponent. Resolve that public
  // re-export to this generation too, rather than mixing renderer owners.
  vi.doMock("@solidjs/web", () => ({ createComponent: runtime.createComponent }));
  return import("../src/i18n/locale");
}

function probe(runtime: Runtime, provider: LocaleModule, consumer: LocaleModule) {
  return runtime.createRoot(
    (dispose) => {
      const before = runtime.createUniqueId();
      let snapshot: { key: string; locale: Locale } | undefined;
      try {
        let output = runtime.createComponent(provider.I18nProvider, {
          locale: "fr-FR",
          get children() {
            snapshot = { key: runtime.createUniqueId(), locale: consumer.useLocale()() };
            return "child";
          },
        });
        while (typeof output === "function") output = output();
        return { before, snapshot, after: runtime.createUniqueId(), output };
      } finally {
        dispose();
      }
    },
    { id: "s0" },
  );
}

it("shares the provider context across product module graphs on one runtime", async () => {
  const runtime = await loadRuntime("shared");
  const provider = await loadLocale(runtime);
  const consumer = await loadLocale(runtime);
  expect(provider.I18nProvider).not.toBe(consumer.I18nProvider);
  const result = probe(runtime, provider, consumer);
  expect(result.snapshot?.locale).toEqual({ locale: "fr-FR", direction: "ltr" });
  expect(result.snapshot?.key).toMatch(/^s0/);
  expect(result.output).toBe("child");
  expect(result).toEqual(probe(runtime, provider, provider));
});

it("preserves locale and owner allocation across runtime generations", async () => {
  const first = await loadRuntime("first");
  const firstLocale = await loadLocale(first);
  const expected = probe(first, firstLocale, firstLocale);
  expect(expected.snapshot?.locale).toEqual({ locale: "fr-FR", direction: "ltr" });

  const second = await loadRuntime("second");
  expect(second.createContext).not.toBe(first.createContext);
  const secondLocale = await loadLocale(second);
  const secondConsumer = await loadLocale(second);
  const result = probe(second, secondLocale, secondConsumer);
  expect.soft(result.snapshot?.locale).toEqual({ locale: "fr-FR", direction: "ltr" });
  expect.soft(result).toEqual(expected);
  // A later generation must not replace the still-live first generation's
  // registry entry or break new module copies loaded into that runtime.
  const firstConsumer = await loadLocale(first);
  expect(probe(first, firstLocale, firstConsumer)).toEqual(expected);
});

it("does not adopt a legacy callable cached by an earlier runtime", async () => {
  const oldRuntime = await loadRuntime("legacy");
  Reflect.set(globalThis, contextSymbol, oldRuntime.createContext(null));
  const runtime = await loadRuntime("after-legacy");
  const provider = await loadLocale(runtime);
  const consumer = await loadLocale(runtime);
  const result = probe(runtime, provider, consumer);
  expect(result.snapshot?.locale).toEqual({ locale: "fr-FR", direction: "ltr" });
  expect(result.output).toBe("child");
});
