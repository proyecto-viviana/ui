/**
 * Rule #7: the children-snapshot heuristic flags a rendered `children()`
 * snapshot and ignores a structural `.toArray()` probe. The mergeProps
 * heuristic flags styled solid-js event-layering calls and ignores last-wins
 * non-event objects.
 */
import { describe, expect, it } from "vite-plus/test";
import {
  findRenderedChildrenSnapshots,
  findSolidJsEventLayeringMerges,
  isStyledMergePropsGuardPath,
} from "./check-idiomatic-solid";

const SNAPSHOT_RENDERED = `
import { children } from "solid-js";

function ActionButton(props: { children?: unknown }) {
  const resolvedChildren = children(() => props.children);
  const content = () => resolvedChildren();
  return content();
}
`;

const STRUCTURAL_ONLY = `
import { children } from "solid-js";

function StaticBreadcrumbItems(props: { children?: unknown }) {
  const staticChildren = children(() => props.children);
  const array = staticChildren.toArray();
  return array.length;
}
`;

describe("findRenderedChildrenSnapshots", () => {
  it("flags children() whose result is returned as content", () => {
    const sites = findRenderedChildrenSnapshots(SNAPSHOT_RENDERED);
    expect(sites).toEqual([{ ident: "resolvedChildren", ordinal: 0, line: 5 }]);
  });

  it("keys a second binding of the same name by ordinal, not line", () => {
    const twice = `${SNAPSHOT_RENDERED}\n${SNAPSHOT_RENDERED.replace("ActionButton", "ActionButtonGroup")}`;
    const sites = findRenderedChildrenSnapshots(twice);
    expect(sites.map((s) => `${s.ident}#${s.ordinal}`)).toEqual([
      "resolvedChildren#0",
      "resolvedChildren#1",
    ]);
  });

  it("does not flag children() used only with toArray / length", () => {
    const sites = findRenderedChildrenSnapshots(STRUCTURAL_ONLY);
    expect(sites).toEqual([]);
  });
});

const SOLID_JS_EVENT_MERGE = `
import { mergeProps } from "solid-js";

function ActionButton(props: object) {
  const providerProps = {};
  const contextProps = {};
  return mergeProps(providerProps, contextProps ?? {}, props);
}
`;

const FLAGS_PLUS_PROPS = `
import { mergeProps } from "solid-js";

function useProviderProps<T extends object>(props: T): T {
  return mergeProps({ isQuiet: false, isDisabled: false }, props) as T;
}
`;

const PICKER_OVERLAY = `
import { mergeProps } from "solid-js";

function selectProps(headlessProps: object, onSelectionChange: () => void) {
  return mergeProps(headlessProps, {
    get onSelectionChange() {
      return onSelectionChange;
    },
  });
}
`;

const SOLIDARIA_EVENT_MERGE = `
import { mergeProps } from "@proyecto-viviana/solidaria";

function ActionButton(props: object) {
  const providerProps = {};
  const contextProps = {};
  return mergeProps(providerProps, contextProps ?? {}, props);
}
`;

describe("findSolidJsEventLayeringMerges", () => {
  it("fails solid-js merge of providerProps, contextProps, and props", () => {
    const sites = findSolidJsEventLayeringMerges(SOLID_JS_EVENT_MERGE);
    expect(sites).toEqual([{ line: 7, args: "providerProps, contextProps ?? {}, props" }]);
  });

  it("passes flags + props last-wins (useProviderProps)", () => {
    expect(findSolidJsEventLayeringMerges(FLAGS_PLUS_PROPS)).toEqual([]);
  });

  it("passes picker headlessProps + onSelectionChange getter", () => {
    expect(findSolidJsEventLayeringMerges(PICKER_OVERLAY)).toEqual([]);
  });

  it("ignores mergeProps imported from solidaria", () => {
    expect(findSolidJsEventLayeringMerges(SOLIDARIA_EVENT_MERGE)).toEqual([]);
  });
});

describe("isStyledMergePropsGuardPath", () => {
  it("scans the two Adobe styled src trees and not kumo", () => {
    expect(isStyledMergePropsGuardPath("packages/solid-spectrum/src/button/Button.tsx")).toBe(true);
    expect(isStyledMergePropsGuardPath("packages/viviana-ui/src/button/Button.tsx")).toBe(true);
    expect(isStyledMergePropsGuardPath("packages/kumo/src/components/button.tsx")).toBe(false);
    expect(isStyledMergePropsGuardPath("packages/geist/src/components/button.tsx")).toBe(false);
    expect(isStyledMergePropsGuardPath("packages/solidaria/src/utils/mergeProps.ts")).toBe(false);
  });
});
