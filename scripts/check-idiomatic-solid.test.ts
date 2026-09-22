/**
 * Rule #7: the children-snapshot heuristic flags a rendered `children()`
 * snapshot and ignores a structural `.toArray()` probe. The mergeProps
 * heuristic flags styled solid-js event-layering calls and ignores last-wins
 * non-event objects. The module-scope JSX rule flags what runs at module
 * evaluation (#545) and nothing that runs at call time.
 */
import { describe, expect, it } from "vite-plus/test";
import {
  findModuleScopeJsx,
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

/** The shape that broke twenty routes: parenthesised, multi-line, at module scope. */
const MODULE_SCOPE_ICON = `
const helpIcon = (
  <svg width="16" height="16">
    <circle cx="8" cy="8" r="7" />
  </svg>
);

export function ContextualHelpTrigger(props: { variant?: string }) {
  return <span>{props.variant === "info" ? helpIcon : null}</span>;
}
`;

const MODULE_SCOPE_COLLECTIONS = `
const icons = [<Sun />, <Moon />];
const byName = { sun: <Sun />, moon: <Moon /> };
const fallback = cond ? <Sun /> : <Moon />;
`;

const CALL_TIME_ONLY = `
function Icon() {
  return <svg />;
}

function Trigger(props: { icon?: unknown }) {
  const fallback = <Icon />;
  return <span>{props.icon ?? fallback}</span>;
}

function withDefault(icon = <Icon />) {
  return icon;
}

export const Lazy = () => <Icon />;
`;

const MODULE_SCOPE_IIFE = `
const cached = (() => {
  const node = <svg />;
  return node;
})();
`;

/** A concise arrow body is the expression that runs — there is no block to walk. */
const MODULE_SCOPE_CONCISE_IIFE = `
export const icon = (() => <svg width="16" viewBox="0 0 16 16" />)();
`;

/** Callbacks these callees run before they return, so the JSX is module-scope. */
const MODULE_SCOPE_EAGER_CALLBACKS = `
const icons = NAMES.map((n) => <Icon name={n} />);
const three = Array.from({ length: 3 }, () => <Icon />);
["a", "b"].forEach((n) => {
  registry[n] = <Icon />;
});
const sun = untrack(() => <Sun />);
const pairs = Object.entries(RAMPS).flatMap(([k]) => <Swatch name={k} />);
`;

/** Real shapes on this tree: a callback taken in order to defer it, not run it. */
const DEFERRED_CALLBACKS = `
export const Skeleton = createLeafComponent("skeleton", () => <svg />);
export const Field = createHideableComponent(() => {
  const label = createMemo(() => <span />);
  return <div>{label()}</div>;
});
document.addEventListener("keydown", () => {
  overlay = <div />;
});
`;

const CLASS_FIELDS = `
class Widget {
  static icon = <svg />;
  instance = <svg />;
}
`;

describe("findModuleScopeJsx", () => {
  it("flags a parenthesised multi-line module-scope element, not the one inside the component", () => {
    expect(findModuleScopeJsx(MODULE_SCOPE_ICON)).toEqual([
      { line: 3, snippet: '<svg width="16" height="16"> <circle cx="8" cy="8" r="7" /> </svg>' },
    ]);
  });

  it("flags JSX held by a module-scope array, object, or ternary", () => {
    expect(findModuleScopeJsx(MODULE_SCOPE_COLLECTIONS)).toEqual([
      { line: 2, snippet: "<Sun />" },
      { line: 2, snippet: "<Moon />" },
      { line: 3, snippet: "<Sun />" },
      { line: 3, snippet: "<Moon />" },
      { line: 4, snippet: "<Sun />" },
      { line: 4, snippet: "<Moon />" },
    ]);
  });

  it("passes component bodies, default parameter values, and arrow components", () => {
    expect(findModuleScopeJsx(CALL_TIME_ONLY)).toEqual([]);
  });

  it("flags a module-scope IIFE body, which runs at module evaluation", () => {
    expect(findModuleScopeJsx(MODULE_SCOPE_IIFE)).toEqual([{ line: 3, snippet: "<svg />" }]);
  });

  it("flags a concise-body IIFE, which has no block to walk into", () => {
    expect(findModuleScopeJsx(MODULE_SCOPE_CONCISE_IIFE)).toEqual([
      { line: 2, snippet: '<svg width="16" viewBox="0 0 16 16" />' },
    ]);
  });

  it("flags JSX built by a callback a module-scope call runs before it returns", () => {
    expect(findModuleScopeJsx(MODULE_SCOPE_EAGER_CALLBACKS)).toEqual([
      { line: 2, snippet: "<Icon name={n} />" },
      { line: 3, snippet: "<Icon />" },
      { line: 5, snippet: "<Icon />" },
      { line: 7, snippet: "<Sun />" },
      { line: 8, snippet: "<Swatch name={k} />" },
    ]);
  });

  it("passes a callback a module-scope call takes in order to defer it", () => {
    expect(findModuleScopeJsx(DEFERRED_CALLBACKS)).toEqual([]);
  });

  it("flags a static class field and not an instance field", () => {
    expect(findModuleScopeJsx(CLASS_FIELDS)).toEqual([{ line: 3, snippet: "<svg />" }]);
  });

  it("reads a .ts file as TypeScript, so `<T>value` stays a cast", () => {
    expect(findModuleScopeJsx("const el = <HTMLElement>document.body;\n", "src/dom.ts")).toEqual(
      [],
    );
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
