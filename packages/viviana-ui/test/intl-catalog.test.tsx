/**
 * Failing-first S2 catalog check for the viviana-ui twin: every shipped locale
 * must match the pinned @react-spectrum/s2 JSON exactly.
 */

import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vite-plus/test";
import { s2IntlStrings } from "../src/intl";

const PINNED_INTL = path.join(process.cwd(), "react-spectrum/packages/@react-spectrum/s2/intl");
const LOCAL_INTL = path.join(process.cwd(), "packages/viviana-ui/src/intl");

const locales = readdirSync(PINNED_INTL)
  .filter((name) => name.endsWith(".json"))
  .map((name) => name.replace(/\.json$/, ""))
  .sort();

describe("S2 intl catalog (viviana-ui)", () => {
  it("exports every pinned locale and no extras", () => {
    expect(Object.keys(s2IntlStrings).sort()).toEqual(locales);
  });

  it.each(locales)("%s matches the pinned S2 catalog exactly", (locale) => {
    const pinned = JSON.parse(
      readFileSync(path.join(PINNED_INTL, `${locale}.json`), "utf8"),
    ) as Record<string, string>;
    const local = JSON.parse(
      readFileSync(path.join(LOCAL_INTL, `${locale}.json`), "utf8"),
    ) as Record<string, string>;
    const shipped = s2IntlStrings[locale] as Record<string, unknown>;
    expect(local).toEqual(pinned);
    expect(shipped).toEqual(pinned);
  });
});
