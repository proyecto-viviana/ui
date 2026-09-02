/**
 * Rule #7: ticketed RAC export-gap pending classification.
 *
 * Unlisted missing fails; listed+open is pending; listed+closed fails;
 * listed+present is a stale pending entry. Fixtures only — not the live repo.
 */
import { describe, expect, it } from "vite-plus/test";
import {
  classifyExportGap,
  gapHasFailures,
  loadPendingFile,
  parseNamedValueExports,
  parseSiblingReexports,
} from "./rac-export-presence";

const RAC_BARREL = `
export { Button, ButtonContext } from '../src/Button';
export { Menu, MenuLoadMoreItem } from '../src/Menu';
export { TokenFieldValue } from 'react-stately/useTokenFieldState';
export { setInteractionModality } from 'react-aria/useFocusVisible';
export type { Locale } from 'react-aria/I18nProvider';
`;

const SOLIDARIA_COMPLETE = `
export { Button, ButtonContext } from "./Button";
export { Menu, MenuLoadMoreItem } from "./Menu";
export { TokenFieldValue } from "@proyecto-viviana/solid-stately";
export { setInteractionModality } from "@proyecto-viviana/solidaria";
`;

const SOLIDARIA_GAPPED = `
export { Button, ButtonContext } from "./Button";
export { Menu } from "./Menu";
`;

const OPEN = () => "open";
const CLOSED = () => "verified";

describe("parseNamedValueExports", () => {
  it("counts local and sibling value exports and skips type-only re-exports", () => {
    const names = parseNamedValueExports(RAC_BARREL);
    expect([...names].sort()).toEqual([
      "Button",
      "ButtonContext",
      "Menu",
      "MenuLoadMoreItem",
      "TokenFieldValue",
      "setInteractionModality",
    ]);
    expect([...parseSiblingReexports(RAC_BARREL)].sort()).toEqual([
      "TokenFieldValue",
      "setInteractionModality",
    ]);
  });
});

describe("classifyExportGap", () => {
  it("fails an unlisted missing export", () => {
    const gap = classifyExportGap({
      racExports: parseNamedValueExports(RAC_BARREL),
      solidariaExports: parseNamedValueExports(SOLIDARIA_GAPPED),
      pending: [],
      ticketStatus: OPEN,
    });
    expect(gap.unlistedMissing).toEqual([
      "MenuLoadMoreItem",
      "TokenFieldValue",
      "setInteractionModality",
    ]);
    expect(gap.pending).toEqual([]);
    expect(gapHasFailures(gap)).toBe(true);
  });

  it("reports listed+open missing exports as pending", () => {
    const gap = classifyExportGap({
      racExports: parseNamedValueExports(RAC_BARREL),
      solidariaExports: parseNamedValueExports(SOLIDARIA_GAPPED),
      pending: [
        { symbol: "MenuLoadMoreItem", ticket: 229 },
        { symbol: "TokenFieldValue", ticket: 118 },
        { symbol: "setInteractionModality", ticket: 231 },
      ],
      ticketStatus: OPEN,
    });
    expect(gap.unlistedMissing).toEqual([]);
    expect(gap.pending.map((entry) => entry.symbol).sort()).toEqual([
      "MenuLoadMoreItem",
      "TokenFieldValue",
      "setInteractionModality",
    ]);
    expect(gapHasFailures(gap)).toBe(false);
  });

  it("fails when a listed pending export's ticket is closed", () => {
    const gap = classifyExportGap({
      racExports: parseNamedValueExports(RAC_BARREL),
      solidariaExports: parseNamedValueExports(SOLIDARIA_GAPPED),
      pending: [{ symbol: "MenuLoadMoreItem", ticket: 229 }],
      ticketStatus: CLOSED,
    });
    expect(gap.closedStillMissing).toEqual([
      { symbol: "MenuLoadMoreItem", ticket: 229, status: "verified" },
    ]);
    expect(gapHasFailures(gap)).toBe(true);
  });

  it("fails when a listed pending export is now present", () => {
    const gap = classifyExportGap({
      racExports: parseNamedValueExports(RAC_BARREL),
      solidariaExports: parseNamedValueExports(SOLIDARIA_COMPLETE),
      pending: [{ symbol: "MenuLoadMoreItem", ticket: 229 }],
      ticketStatus: OPEN,
    });
    expect(gap.stalePresent).toEqual([{ symbol: "MenuLoadMoreItem", ticket: 229 }]);
    expect(gap.pending).toEqual([]);
    expect(gapHasFailures(gap)).toBe(true);
  });
});

describe("loadPendingFile", () => {
  it("reads { symbol, ticket } rows from a fixture JSON object", () => {
    const pending = loadPendingFile(
      JSON.stringify({
        pending: [{ symbol: "MenuLoadMoreItem", ticket: 229 }],
      }),
    );
    expect(pending).toEqual([{ symbol: "MenuLoadMoreItem", ticket: 229 }]);
  });
});
