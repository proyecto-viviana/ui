import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vite-plus/test";
import {
  baselineSlugsAboveCeiling,
  ceilingSlugsAboveBaseline,
  staleBaselineSlugs,
  strictBaselineSections,
  unbaselined,
  type StrictBaseline,
} from "../../scripts/parity-strict-baseline";

const baseline = JSON.parse(
  readFileSync(join(import.meta.dirname, "../../scripts/parity-strict-baseline.json"), "utf8"),
) as StrictBaseline;
const ceiling = JSON.parse(
  readFileSync(
    join(import.meta.dirname, "../../scripts/parity-strict-baseline.ceiling.json"),
    "utf8",
  ),
) as StrictBaseline;

// #85's backlog as frozen on 2026-08-07. Delete a slug here when its gaps close;
// never add one — a new gap is fixed, not baselined.
const frozenBacklog = [
  "actiongroup",
  "autocomplete",
  "gridlist",
  "labeledvalue",
  "listbox",
  "dnd-listbox",
  "steplist",
  "toolbar",
  "virtualizer",
];

describe("strict parity baseline", () => {
  it("lets through only the gaps it does not list", () => {
    const gaps = [{ slug: "toolbar" }, { slug: "button" }];
    expect(unbaselined(gaps, ["toolbar"])).toEqual([{ slug: "button" }]);
    expect(unbaselined(gaps, undefined)).toEqual(gaps);
  });

  it("names every listed slug whose gap no longer occurs", () => {
    expect(staleBaselineSlugs([{ slug: "toolbar" }], ["toolbar", "listbox"])).toEqual(["listbox"]);
    expect(staleBaselineSlugs([{ slug: "toolbar" }], ["toolbar"])).toEqual([]);
    expect(staleBaselineSlugs([], undefined)).toEqual([]);
  });

  it.each(strictBaselineSections)("never grows %s past the frozen #85 backlog", (section) => {
    const listed = baseline.allowedBlockingGapSlugs[section];
    expect(listed.filter((slug) => !frozenBacklog.includes(slug))).toEqual([]);
    expect(new Set(listed).size).toBe(listed.length);
  });

  it("names a baseline slug the shrink-only ceiling does not list", () => {
    expect(baselineSlugsAboveCeiling(["toolbar", "button"], ["toolbar"])).toEqual(["button"]);
    expect(baselineSlugsAboveCeiling(["toolbar"], ["toolbar", "listbox"])).toEqual([]);
    expect(baselineSlugsAboveCeiling(undefined, undefined)).toEqual([]);
  });

  it("names a ceiling slug the baseline has dropped", () => {
    expect(ceilingSlugsAboveBaseline(["toolbar"], ["toolbar", "listbox"])).toEqual(["listbox"]);
    expect(ceilingSlugsAboveBaseline(["toolbar", "listbox"], ["toolbar"])).toEqual([]);
    expect(ceilingSlugsAboveBaseline(undefined, undefined)).toEqual([]);
  });

  it.each(strictBaselineSections)("keeps %s equal to its shrink-only ceiling", (section) => {
    const listed = baseline.allowedBlockingGapSlugs[section];
    const capped = ceiling.allowedBlockingGapSlugs[section];
    expect(baselineSlugsAboveCeiling(listed, capped)).toEqual([]);
    expect(ceilingSlugsAboveBaseline(listed, capped)).toEqual([]);
  });
});
