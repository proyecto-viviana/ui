/**
 * The hydration walk must agree with the server locale, then the browser
 * language can take over. A flip during the walk mismatches `lang` and `dir`.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { afterEach, describe, expect, it } from "vite-plus/test";
import { hydrateOverSsr } from "@proyecto-viviana/solidaria-test-utils";
import { cleanupHydrationRoots } from "../test-utils/hydrate";
import { DefaultLocaleProbe } from "./fixtures/defaultLocale";

const html = readFileSync(
  resolve(import.meta.dirname, "../../../output/default-locale-ssr.html"),
  "utf8",
);

const previousLanguage = Object.getOwnPropertyDescriptor(Navigator.prototype, "language");

afterEach(() => {
  if (previousLanguage) Object.defineProperty(Navigator.prototype, "language", previousLanguage);
  cleanupHydrationRoots();
  document.body.innerHTML = "";
});

describe("default locale hydrates", () => {
  it("matches en-US ltr on the walk, then follows ar-SA", async () => {
    Object.defineProperty(Navigator.prototype, "language", {
      configurable: true,
      get: () => "ar-SA",
    });

    let serverProbe: Element | undefined;
    const container = await hydrateOverSsr(html, () => <DefaultLocaleProbe />, {
      beforeHydrate(root) {
        serverProbe = root.querySelector("#locale-probe") ?? undefined;
        expect(serverProbe?.getAttribute("lang")).toBe("en-US");
        expect(serverProbe?.getAttribute("dir")).toBe("ltr");
      },
    });

    const probe = container.querySelector("#locale-probe");
    expect(probe).toBe(serverProbe);
    expect(probe?.getAttribute("lang")).toBe("ar-SA");
    expect(probe?.getAttribute("dir")).toBe("rtl");
  });
});
