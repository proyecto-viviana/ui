import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import ts from "typescript";
import { afterAll, describe, expect, it } from "vite-plus/test";

import * as path from "node:path";
import type { ApiPageData } from "./extract-api-reference";
import {
  inheritedChildrenOrigin,
  renderInheritedChildren,
  renderType,
  routeFile,
} from "./extract-api-reference";

const roots: string[] = [];

afterAll(() => {
  for (const root of roots) rmSync(root, { force: true, recursive: true });
});

/**
 * A package whose one prop is typed by a file it does not import by name, at a
 * caller-chosen depth below the fixture root. That is the shape that makes the
 * checker fall back to `import("…")`: it has no name in scope to print, so it
 * prints the way from this file to that one — which is layout, not type.
 */
function fixture(depth: number): { source: ts.SourceFile; program: ts.Program } {
  const root = mkdtempSync(join(tmpdir(), "api-reference-"));
  roots.push(root);
  const nest = Array.from({ length: depth }, (_, index) => `level${index}`).join("/");
  const packageDir = join(root, nest, "pkg/src");
  mkdirSync(packageDir, { recursive: true });
  mkdirSync(join(root, "shared"), { recursive: true });
  writeFileSync(join(root, "shared/thing.ts"), "export interface Thing {\n  id: string;\n}\n");
  const up = "../".repeat(depth + 2);
  writeFileSync(
    join(packageDir, "index.ts"),
    `export interface Props {\n  thing: import("${up}shared/thing").Thing;\n}\n`,
  );

  const entry = join(packageDir, "index.ts");
  const program = ts.createProgram({
    rootNames: [entry],
    options: {
      strict: true,
      target: ts.ScriptTarget.ES2022,
      moduleResolution: ts.ModuleResolutionKind.Bundler,
      module: ts.ModuleKind.ESNext,
    },
  });
  const source = program.getSourceFile(entry);
  if (!source) throw new Error("fixture did not compile");
  return { source, program };
}

/** Renders the one prop exactly the way `extractRegister` renders every prop. */
function renderTheOneProp({ source, program }: ReturnType<typeof fixture>): string {
  const checker = program.getTypeChecker();
  let rendered: string | undefined;
  source.forEachChild((node) => {
    if (!ts.isInterfaceDeclaration(node)) return;
    for (const member of checker
      .getDeclaredTypeOfSymbol(checker.getSymbolAtLocation(node.name)!)
      .getProperties()) {
      const site = member.declarations![0]!;
      rendered = checker.typeToString(
        checker.getTypeOfSymbolAtLocation(member, site),
        site,
        ts.TypeFormatFlags.NoTruncation,
      );
    }
  });
  if (!rendered) throw new Error("fixture rendered no prop");
  return rendered;
}

describe("renderType", () => {
  it("drops the import path and keeps the name the checker reached", () => {
    expect(
      renderType(
        'import("../node_modules/solid-js/types/types").RenderedElement',
        "Table.children",
      ),
    ).toBe("RenderedElement");
    expect(
      renderType('import("@proyecto-viviana/solid-stately").SegmentType', "DateSegment.type"),
    ).toBe("SegmentType");
    expect(
      renderType('((e: import("..").HoverEvent) => void) | undefined', "Button.onHoverStart"),
    ).toBe("((e: HoverEvent) => void) | undefined");
  });

  it("fails rather than shipping a rendering it cannot unqualify", () => {
    expect(() => renderType('typeof import("solid-js")', "Thing.module")).toThrow(
      /keeps an import path at Thing\.module/,
    );
  });

  // #559: the committed pages are data, so the same source has to produce the
  // same bytes wherever the checkout sits. The two fixtures differ in path and
  // in how deep the package is below its root, which is what the checker prints.
  it("renders identically from two checkout layouts, where the raw rendering does not", () => {
    const shallow = renderTheOneProp(fixture(0));
    const deep = renderTheOneProp(fixture(3));

    expect(shallow).toMatch(/^import\("/);
    expect(shallow).not.toBe(deep);
    expect(renderType(shallow, "Props.thing")).toBe(renderType(deep, "Props.thing"));
    expect(renderType(shallow, "Props.thing")).toBe("Thing");
  });
});

/** A page the way `buildPageData` shapes one: the page's own component first. */
function apiPage(interfaces: { component: string; props: string[] }[]): ApiPageData {
  return {
    slug: "icon",
    title: interfaces[0].component,
    packageName: "@proyecto-viviana/ui",
    comparedWith: "@proyecto-viviana/solid-spectrum",
    entries: interfaces.map(({ component, props }) => ({
      name: `${component}Props`,
      component,
      source: `packages/viviana-ui/src/icon/${component}.tsx`,
      props: props.map((name) => ({
        name,
        type: "boolean",
        required: false,
        description: "",
        origin: "viviana-ui",
      })),
    })),
    divergence: {},
  };
}

/** The `<meta name="description">` the generated route file carries. */
function descriptionOf(file: string): string {
  const match = /description:\s*("(?:[^"\\]|\\.)*")/.exec(file);
  if (!match) throw new Error("the generated route file carries no description");
  return JSON.parse(match[1]) as string;
}

describe("routeFile", () => {
  // #549: the description names the page's component, so the count has to be
  // that component's. The page-wide sum told the icon page's reader "12 props
  // declared for SpectrumIcon" where `SpectrumIconProps` declares three and
  // the other nine belong to CenterBaseline and SpectrumIllustration.
  it("counts the props of the component it names, not every interface on the page", () => {
    const description = descriptionOf(
      routeFile(
        apiPage([
          {
            component: "SpectrumIcon",
            props: ["styles", "aria-hidden", "UNSAFE_suppressDataSlot"],
          },
          { component: "CenterBaseline", props: ["id", "style", "styles", "children", "slot"] },
          {
            component: "SpectrumIllustration",
            props: ["size", "styles", "aria-hidden", "UNSAFE_suppressDataSlot"],
          },
        ]),
      ),
    );

    expect(description).toContain("The 3 props declared for SpectrumIcon");
    expect(description).not.toContain("12");
    expect(description).toContain("DOM attributes inherited from outside them are not listed.");
    expect(description.length).toBeLessThanOrEqual(170);
  });
});

describe("inherited children", () => {
  // #615: ParentProps declares children in solid-js, which the package filter
  // drops with the DOM attributes. The JSX namespace's children stays out.
  it("keeps children inherited from solid-js and not from the JSX namespace", () => {
    const parent = path.join(
      "/node_modules/.pnpm/solid-js@2.0.0-rc.9/node_modules/solid-js/types/client/component.d.ts",
    );
    const server = path.join("/node_modules/solid-js/types/server/component.d.ts");
    const dom = path.join(
      "/node_modules/.pnpm/@solidjs+web@2.0.0-rc.9_solid-js@2.0.0-rc.9/node_modules/@solidjs/web/types/jsx.d.ts",
    );

    expect(inheritedChildrenOrigin(parent, "children")).toBe("solid-js");
    expect(inheritedChildrenOrigin(server, "children")).toBe("solid-js");
    expect(inheritedChildrenOrigin(dom, "children")).toBeUndefined();
    expect(inheritedChildrenOrigin(parent, "ref")).toBeUndefined();
  });

  // The same source prints SolidElement without Node | JSX.ArrayElement.
  // Optional JSX.Element on the committed pages is the wider union, so the
  // inherited slot uses that spelling instead of a third one.
  it("renders ParentProps children as the optional JSX.Element the pages already use", () => {
    const raw =
      'number | boolean | import("../types.js").RenderedElement | import("../types.js").ArrayElement | (string & {})';

    expect(renderInheritedChildren(raw)).toBe(
      "number | boolean | RenderedElement | ArrayElement | (string & {}) | Node | JSX.ArrayElement",
    );
    expect(renderInheritedChildren("JSX.Element")).toBe("JSX.Element");
  });

  it("fails rather than shipping a third children spelling", () => {
    expect(() => renderInheritedChildren("SolidElement")).toThrow(/third type/);
  });
});
